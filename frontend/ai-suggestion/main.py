#Author - Kirtan Chhatbar - 202301098
import os
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pinecone import Pinecone
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from supabase import Client, create_client
import uvicorn
from postgrest.exceptions import APIError


# --- 1. Load Environment & Initialize Clients ---
load_dotenv() 

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")

# Check if all required environment variables are set
if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, PINECONE_API_KEY]):
    raise RuntimeError("Missing one or more required environment variables for recommendation service.")

# Initialize the FastAPI app
app = FastAPI(title="NextChapter AI Suggestions API")

# Initialize Supabase client (using service_role key to bypass RLS)
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Initialize Pinecone client
pc = Pinecone(api_key=PINECONE_API_KEY)

print("Loading SentenceTransformer model... (This may take a moment on first start)")
start_model_load = time.time()
# Load the model for creating vector embeddings
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print(f"Model loaded in {time.time() - start_model_load:.2f}s")

EMBEDDING_DIMENSION = 384 # Dimensions of the 'all-MiniLM-L6-v2' model
# Connect to the Pinecone index where book vectors are stored
index = pc.Index("nextchapter-books")

print("Clients (Supabase, Pinecone, SentenceTransformer) initialized.")

# --- 2. CORS Middleware ---
# Configure Cross-Origin Resource Sharing (CORS)
# This allows your frontend (running on localhost:3000 or 5173) to call this API
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 3. Request / Response Models ---
# Pydantic models define the shape of API requests and responses

class RecommendationRequest(BaseModel):
    """Defines the expected JSON body for a POST request."""
    user_id: str

class RecommendedBook(BaseModel):
    """Defines the shape of a single book in the response."""
    book_id: Any
    title: Optional[str] = None
    author: Optional[str] = None
    cover_url: Optional[str] = None

class RecommendationResponse(BaseModel):
    """Defines the final JSON response sent to the frontend."""
    user_id: str
    books: List[RecommendedBook]
    strategy: Optional[str] = None
    is_fallback: bool = False

# --- 4. Helper Functions ---

def get_text_to_embed(book: Dict[str, Any]) -> str:
    """
    Creates a single descriptive string for a book, which is then
    converted into a vector embedding by the SentenceTransformer model.
    """
    genres_list = book.get("genres", [])
    genres_str = ", ".join(genres_list) if genres_list else ""
    return (
        f"Title: {book.get('title', '')}. "
        f"Author: {book.get('author', '')}. "
        f"Genre: {book.get('genre', '')}. " 
        f"Tags: {genres_str}."
    )

def calculate_love_score(history_item: Dict[str, Any]) -> float:
    """
    Calculates a "Love Score" (from 0 to 1) based on user's interaction
    with a book. This score weighs scroll depth, rating, and watchlist status.
    
    This function now works with the data from our new SQL function.
    """
    raw_scroll = history_item.get("scroll_depth", 0) or 0
    raw_rating = history_item.get("rating", 0) or 0
    raw_watchlist = history_item.get("was_in_watchlist", False)
    
    # Weighted average: scroll (50%), watchlist (30%), rating (20%)
    scroll_norm = (raw_scroll / 100) * 0.5
    watchlist_norm = (1 if raw_watchlist else 0) * 0.3
    rating_norm = (raw_rating / 5) * 0.2
    return scroll_norm + watchlist_norm + rating_norm

def format_books(raw_books: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Takes a list of book objects from Supabase and formats them
    into the simple structure required by the `RecommendedBook` model.
    """
    formatted = []
    for book in raw_books[:5]: # Return only the top 5
        formatted.append(
            {
                "book_id": book.get("id"),
                "title": book.get("title"),
                "author": book.get("author"),
                "cover_url": book.get("cover_image"),
            }
        )
    return formatted

async def get_popular_books_from_supabase() -> List[Dict[str, Any]]:
    """
    The final fallback. Tries to get popular books by calling a
    PostgreSQL RPC function 'get_popular_books'. If that fails,
    it runs a manual query to get books ordered by 'number_of_downloads'.
    """
    try:
        # First, try calling the database function
        response = supabase.rpc("get_popular_books", {}).execute()
        if response.data:
            return response.data
        print("RPC 'get_popular_books' returned no data. Using fallback query.")
    except APIError as e:
        # This catches errors if the RPC function doesn't exist or fails
        if e.code == "PGRST202" or e.code == "42883" or e.code == "42703":
            print(f"RPC 'get_popular_books' failed or not found ({e.code}). Using fallback query.")
        else:
            print(f"Error calling get_popular_books RPC: {e}")
    except Exception as e:
        print(f"A general error occurred in get_popular_books: {e}")
    
    # Manual fallback query if the RPC fails
    try:
        fallback_response = (
            supabase.table("books")
            .select("id, title, author, cover_image")
            .order("number_of_downloads", desc=True, nullsfirst=False)
            .limit(10)
            .execute()
        )
        return fallback_response.data or []
    except Exception as e:
        print(f"Error fetching popular books via fallback: {e}")
        return []

async def get_recs_from_preferences(user_id: str) -> Optional[List[Dict[str, Any]]]:
    """
    This is Plan B (for Cold Starts or Warm Start fallbacks).
    It fetches the user's saved 'genres' from their 'user_profiles'
    table and finds books that match.
    """
    try:
        profile_res = (
            supabase.table("user_profiles")
            .select("genres")
            .eq("user_id", user_id)
            .maybe_single()
            .execute()
        )
        
        if not profile_res or not profile_res.data or not profile_res.data.get("genres"):
            print(f"User {user_id} has no preferences saved.")
            return None
            
        preferred_genres = profile_res.data["genres"]
        if not preferred_genres:
            return None
            
        print(f"User {user_id} has preferred genres: {preferred_genres}")
        
        # --- FIX: Convert Python list to PostgreSQL array string ---
        # e.g., ['Fiction', 'History'] becomes '{"Fiction","History"}'
        postgres_array_string = "{" + ",".join(f'"{g}"' for g in preferred_genres) + "}"
        
        book_res = (
            supabase.table("books")
            .select("id, title, author, cover_image")
            # Use the correctly formatted string
            .filter("genres", "cs", postgres_array_string) # 'cs' = "contains"
            .limit(10)
            .execute()
        )
        return book_res.data if book_res.data else None
    except APIError as e:
        if e.code == "PGRST116":
             print(f"No profile found for user {user_id}. Cannot get preferences.")
             return None
        print(f"Error fetching preference-based recommendations: {e}")
        return None
    except Exception as e:
        print(f"A general error occurred in get_recs_from_preferences: {e}")
        return None

# --- 5. Main Logic (REPLACED WITH NEW RPC CALL) ---

async def build_recommendations_payload(user_id: str) -> RecommendationResponse:
    """
    This is the main function that builds the recommendation response.
    It handles both "Cold Start" (new users) and "Warm Start" (returning users).
    
    This version uses the 'get_full_user_history' RPC call to join data
    from user_books, book_ratings, and book_wishlist.
    """
    start_total_time = time.time()
    print(f"Generating recommendations for {user_id}")
    top_book_details = None
    
    try:
        # --- Step 1: Get ALL history data in ONE call ---
        # This one RPC call replaces all our old, broken queries
        start_step_time = time.time()
        history_res = (
            supabase.rpc("get_full_user_history", {"p_user_id": user_id})
            .execute()
        )
        
        all_history_data = history_res.data or []
        
        # --- Step 2: Get ALL "read" book IDs for accurate filtering ---
        read_book_ids = set(item['book_id'] for item in all_history_data) if all_history_data else set()

        # --- Step 3: Get RECENT 5 "read" books for "Love Score" logic ---
        # We just slice the list we already have, since it's pre-sorted by the SQL function
        recent_history_data = all_history_data[:5]
        print(f"   [TIMING] Fetched and processed history: {time.time() - start_step_time:.2f}s")


        # --- Step 4: COLD START Logic ---
        # If the user has no recent reading history, they are a "Cold Start".
        if not recent_history_data:
            print(f"Cold start detected for user: {user_id}")
            
            # Plan A: Try to get recommendations from their saved preferences
            preferred = await get_recs_from_preferences(user_id)
            strategy = "preferences" if preferred else "popular"
            
            # Plan B: If no preferences, get popular books
            candidate_books_raw = preferred or await get_popular_books_from_supabase()
            
            # Filter out any books they *may* have read (from all_history_res)
            candidate_books = [b for b in candidate_books_raw if b.get('id') not in read_book_ids]

            formatted = format_books(candidate_books)
            if not formatted:
                raise HTTPException(status_code=404, detail="No recommendations available for this user.")

            print(f"--- [TIMING] Total request time: {time.time() - start_total_time:.2f}s ---")
            # Return the response without justification
            return RecommendationResponse(
                user_id=user_id,
                books=[RecommendedBook(**book) for book in formatted],
                strategy=strategy,
                is_fallback=True,
            )

        # --- Step 5: WARM START Logic ---
        # If we are here, the user has reading history.
        print(f"Warm start for user: {user_id}. Using 'Love Score' logic.")
        (top_book, top_genre, top_author, top_book_details) = (None, None, None, None)

        # --- Step 5a: Calculate "Love Score" and find top preferences ---
        # We can use the *exact same* calculate_love_score function as before,
        # because our SQL function provides the columns it needs.
        start_step_time = time.time()
        scored_books_history = []
        for item in recent_history_data: # Use the recent 5
            score = calculate_love_score(item) # This function still works!
            scored_books_history.append({"book_id": item["book_id"], "score": score})
        
        recent_book_ids = [b["book_id"] for b in scored_books_history]
        books_response = (
            supabase.table("books")
            .select("id, title, author, genres, language")
            .in_("id", recent_book_ids)
            .execute()
        )
        books_response_data = books_response.data or []
        print(f"   [TIMING] Scored & fetched history book details: {time.time() - start_step_time:.2f}s")

        # Calculate weighted scores for genres, authors, and languages
        start_step_time = time.time()
        genre_scores: Dict[str, float] = {}
        author_scores: Dict[str, float] = {}
        language_scores: Dict[str, float] = {}
        for history_item in scored_books_history:
            for book_detail in books_response_data:
                if history_item["book_id"] == book_detail["id"]:
                    score = history_item["score"]
                    if genre_list := book_detail.get("genres"):
                        if isinstance(genre_list, list):
                            for g in genre_list:
                                if g: genre_scores[g] = genre_scores.get(g, 0) + score
                    if a := book_detail.get("author"):
                        author_scores[a] = author_scores.get(a, 0) + score
                    if l := book_detail.get("language"):
                        language_scores[l] = language_scores.get(l, 0) + score
                    history_item["details"] = book_detail
                    break
        
        # Find the single book with the highest Love Score
        top_book = max(scored_books_history, key=lambda x: x["score"])
        top_genre = max(genre_scores, key=genre_scores.get) if genre_scores else None
        top_author = max(author_scores, key=author_scores.get) if author_scores else None
        top_book_details = top_book.get("details", {})
        print(f"   [TIMING] Calculated user preferences: {time.time() - start_step_time:.2f}s")

        # --- Step 5b: Generate Query Vector ---
        start_step_time = time.time()
        query_text = get_text_to_embed(top_book_details)
        query_vector = embedding_model.encode(query_text).tolist()
        print(f"   [TIMING] Generated query vector (encode): {time.time() - start_step_time:.2f}s")

        # --- Step 5c: Query Pinecone (Vector Search) ---
        start_step_time = time.time()
        pinecone_filter = {} 
        query_results = index.query(
            vector=query_vector,
            top_k=8,
            include_metadata=True,
            filter=pinecone_filter if pinecone_filter else None,
        )
        print(f"   [TIMING] Queried Pinecone: {time.time() - start_step_time:.2f}s")

        # Use the *complete* list of read_book_ids to filter the results
        similar_book_ids = [m["id"] for m in query_results["matches"] if m["id"] not in read_book_ids][:5]

        # --- Step 5d: Handle Fallback Logic ---
        candidate_books: List[Dict[str, Any]] = []
        strategy = "vector_search"
        
        if not similar_book_ids:
            print("Vector search produced no unseen titles. Falling back to preferences/popular.")
            prefs = await get_recs_from_preferences(user_id)
            strategy = "preferences" if prefs else "popular"
            candidate_books_raw = prefs or await get_popular_books_from_supabase()
            candidate_books = [b for b in candidate_books_raw if b.get('id') not in read_book_ids]
        else:
            start_step_time = time.time()
            final_books_response = (
                supabase.table("books")
                .select("id, title, author, cover_image")
                .in_("id", similar_book_ids)
                .execute()
            )
            candidate_books = final_books_response.data or []
            print(f"   [TIMING] Fetched final book details: {time.time() - start_step_time:.2f}s")

        # --- Step 6: Format and Return ---
        formatted = format_books(candidate_books)
        if not formatted:
            raise HTTPException(status_code=404, detail="No recommendations available for this user.")
        
        print(f"--- [TIMING] Total request time: {time.time() - start_total_time:.2f}s ---")
        return RecommendationResponse(
            user_id=user_id,
            books=[RecommendedBook(**book) for book in formatted],
            strategy=strategy,
            is_fallback=strategy != "vector_search",
        )

    except HTTPException:
        raise 
    except Exception as e:
        print(f"An error occurred in recommendation generation: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


# --- 6. Main Recommendation Endpoints ---

@app.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_smart_suggestions(user_id: str):
    """
    GET endpoint to fetch recommendations.
    Called directly from the browser or other services.
    """
    return await build_recommendations_payload(user_id)

@app.post("/recommendations", response_model=RecommendationResponse)
async def post_smart_suggestions(payload: RecommendationRequest):
    """
    POST endpoint to fetch recommendations.
    Accepts a JSON body: {"user_id": "..."}
    """
    if not payload.user_id:
        raise HTTPException(status_code=400, detail="Missing user_id in request body.")
    return await build_recommendations_payload(payload.user_id)

# --- 7. Run the App ---
if __name__ == "__main__":
    """
    This block allows you to run the app directly with `python main.py`
    """
    print("Starting FastAPI server at http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)