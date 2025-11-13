import os
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
# from groq import Groq  <-- REMOVED
from pinecone import Pinecone
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from supabase import Client, create_client
import uvicorn

# --- 1. Load Environment & Initialize Clients ---
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
# GROQ_API_KEY = os.environ.get("GROQ_API_KEY") <-- REMOVED

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, PINECONE_API_KEY]): # <-- Groq key removed
    raise RuntimeError("Missing one or more required environment variables for recommendation service.")

app = FastAPI(title="NextChapter AI Suggestions API")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

print("Loading SentenceTransformer model... (This may take a moment on first start)")
start_model_load = time.time()
embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
print(f"Model loaded in {time.time() - start_model_load:.2f}s")

EMBEDDING_DIMENSION = 384
# groq_client = Groq(api_key=GROQ_API_KEY) <-- REMOVED
# GROQ_CHAT_MODEL = "llama-3.1-8b-instant" <-- REMOVED
index = pc.Index("nextchapter-books")

print("Clients (Supabase, Pinecone, SentenceTransformer) initialized.") # <-- Groq removed

# --- 2. CORS Middleware (Unchanged) ---
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


# --- 3. Request / Response Models (Unchanged) ---
class RecommendationRequest(BaseModel):
    user_id: str


class RecommendedBook(BaseModel):
    book_id: Any
    title: Optional[str] = None
    author: Optional[str] = None
    cover_url: Optional[str] = None


class RecommendationResponse(BaseModel):
    user_id: str
    books: List[RecommendedBook]
    justification: Optional[str] = None
    strategy: Optional[str] = None
    is_fallback: bool = False


# --- 4. Helper Functions (Unchanged) ---
def get_text_to_embed(book: Dict[str, Any]) -> str:
    genres_list = book.get("genres", [])
    genres_str = ", ".join(genres_list) if genres_list else ""
    return (
        f"Title: {book.get('title', '')}. "
        f"Author: {book.get('author', '')}. "
        f"Genre: {book.get('genre', '')}. "
        f"Tags: {genres_str}."
    )


def calculate_love_score(history_item: Dict[str, Any]) -> float:
    raw_scroll = history_item.get("scroll_depth", 0) or 0
    raw_rating = history_item.get("rating", 0) or 0
    raw_watchlist = history_item.get("was_in_watchlist", False)

    scroll_norm = (raw_scroll / 100) * 0.5
    watchlist_norm = (1 if raw_watchlist else 0) * 0.3
    rating_norm = (raw_rating / 5) * 0.2
    return scroll_norm + watchlist_norm + rating_norm


def format_books(raw_books: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    formatted = []
    for book in raw_books[:5]:
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
    try:
        response = supabase.rpc("get_popular_books", {}).execute()
        if response.data:
            return response.data
        print("RPC 'get_popular_books' not found. Using fallback query.")
        fallback_response = (
            supabase.table("books")
            .select("id, title, author, cover_image")
            .order("number_of_downloads", desc=True, nulls_first=False)
            .limit(10)
            .execute()
        )
        return fallback_response.data or []
    except Exception as e:
        print(f"Error fetching popular books: {e}")
        return []


async def get_recs_from_preferences(user_id: str) -> Optional[List[Dict[str, Any]]]:
    try:
        profile_res = (
            supabase.table("user_profiles")
            .select("favorite_genres")
            .eq("user_id", user_id)
            .single()
            .execute()
        )
        if not profile_res.data or not profile_res.data.get("favorite_genres"):
            return None
        preferred_genres = profile_res.data["favorite_genres"]
        if not preferred_genres:
            return None
        book_res = (
            supabase.table("books")
            .select("id, title, author, cover_image")
            .filter("genres", "cs", preferred_genres)
            .limit(10)
            .execute()
        )
        return book_res.data if book_res.data else None
    except Exception as e:
        print(f"Error fetching preference-based recommendations: {e}")
        return None


async def build_recommendations_payload(user_id: str) -> RecommendationResponse:
    start_total_time = time.time()
    print(f"Generating recommendations for {user_id}")
    try:
        start_step_time = time.time()
        history_response = (
            supabase.table("user_reading_history")
            .select("book_id, scroll_depth, rating, was_in_watchlist")
            .eq("user_id", user_id)
            .eq("status", "read")
            .order("updated_at", desc=True)
            .limit(5)
            .execute()
        )
        history_response_data = history_response.data or []
        print(f"  [TIMING] Fetched history: {time.time() - start_step_time:.2f}s")

        if not history_response_data:
            print(f"Cold start detected for user: {user_id}")
            preferred = await get_recs_from_preferences(user_id)
            strategy = "preferences" if preferred else "popular"
            candidate_books = preferred or await get_popular_books_from_supabase()
            formatted = format_books(candidate_books)
            if not formatted:
                raise HTTPException(status_code=404, detail="No recommendations available for this user.")
            print(f"--- [TIMING] Total request time: {time.time() - start_total_time:.2f}s ---")
            return RecommendationResponse(
                user_id=user_id,
                books=[RecommendedBook(**book) for book in formatted],
                justification=None, # <-- MODIFIED
                strategy=strategy,
                is_fallback=True,
            )

        print(f"Warm start for user: {user_id}. Using 'Love Score' logic.")

        start_step_time = time.time()
        scored_books_history = []
        for item in history_response_data:
            score = calculate_love_score(item)
            scored_books_history.append({"book_id": item["book_id"], "score": score})

        book_ids = [b["book_id"] for b in scored_books_history]
        books_response = (
            supabase.table("books")
            .select("id, title, author, genre, genres, language")
            .in_("id", book_ids)
            .execute()
        )
        books_response_data = books_response.data or []
        print(f"  [TIMING] Scored & fetched history book details: {time.time() - start_step_time:.2f}s")

        start_step_time = time.time()
        genre_scores: Dict[str, float] = {}
        author_scores: Dict[str, float] = {}
        language_scores: Dict[str, float] = {}
        for history_item in scored_books_history:
            for book_detail in books_response_data:
                if history_item["book_id"] == book_detail["id"]:
                    score = history_item["score"]
                    if g := book_detail.get("genre"):
                        genre_scores[g] = genre_scores.get(g, 0) + score
                    if a := book_detail.get("author"):
                        author_scores[a] = author_scores.get(a, 0) + score
                    if l := book_detail.get("language"):
                        language_scores[l] = language_scores.get(l, 0) + score
                    history_item["details"] = book_detail
                    break
        top_book = max(scored_books_history, key=lambda x: x["score"])
        top_genre = max(genre_scores, key=genre_scores.get) if genre_scores else None
        # top_author = max(author_scores, key=author_scores.get) if author_scores else None <-- Not used, can be removed
        print(f"  [TIMING] Calculated user preferences: {time.time() - start_step_time:.2f}s")

        start_step_time = time.time()
        seed_book_details = top_book["details"]
        query_text = get_text_to_embed(seed_book_details)
        query_vector = embedding_model.encode(query_text).tolist()
        print(f"  [TIMING] Generated query vector (encode): {time.time() - start_step_time:.2f}s")

        start_step_time = time.time()
        pinecone_filter = {}
        if top_genre:
            pinecone_filter["genre"] = {"$eq": top_genre}
        query_results = index.query(
            vector=query_vector,
            top_k=8,
            include_metadata=True,
            filter=pinecone_filter if pinecone_filter else None,
        )
        print(f"  [TIMING] Queried Pinecone: {time.time() - start_step_time:.2f}s")

        read_book_ids = set(book_ids)
        similar_book_ids = [m["id"] for m in query_results["matches"] if m["id"] not in read_book_ids][:5]

        candidate_books: List[Dict[str, Any]] = []
        strategy = "vector_search"
        if not similar_book_ids:
            print("Vector search produced no unseen titles. Falling back to preferences/popular.")
            prefs = await get_recs_from_preferences(user_id)
            strategy = "preferences" if prefs else "popular"
            candidate_books = prefs or await get_popular_books_from_supabase()
        else:
            start_step_time = time.time()
            final_books_response = (
                supabase.table("books")
                .select("id, title, author, cover_image")
                .in_("id", similar_book_ids)
                .execute()
            )
            candidate_books = final_books_response.data or []
            print(f"  [TIMING] Fetched final book details: {time.time() - start_step_time:.2f}s")

        formatted = format_books(candidate_books)
        if not formatted:
            raise HTTPException(status_code=404, detail="No recommendations available for this user.")

        # --- ENTIRE GROQ RAG JUSTIFICATION BLOCK REMOVED ---

        print(f"--- [TIMING] Total request time: {time.time() - start_total_time:.2f}s ---")
        return RecommendationResponse(
            user_id=user_id,
            books=[RecommendedBook(**book) for book in formatted],
            justification=None, # <-- MODIFIED
            strategy=strategy,
            is_fallback=strategy != "vector_search",
        )

    except HTTPException:
        raise
    except Exception as e:
        print(f"An error occurred in recommendation generation: {e}")
        raise HTTPException(status_code=500, detail="An internal server error occurred.")


# --- 5. Main Recommendation Endpoints (Unchanged) ---
@app.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_smart_suggestions(user_id: str) -> RecommendationResponse:
    return await build_recommendations_payload(user_id)


@app.post("/recommendations", response_model=RecommendationResponse)
async def post_smart_suggestions(payload: RecommendationRequest) -> RecommendationResponse:
    if not payload.user_id:
        raise HTTPException(status_code=400, detail="Missing user_id in request body.")
    return await build_recommendations_payload(payload.user_id)


# --- 6. Run the App (Unchanged) ---
if __name__ == "__main__":
    print("Starting FastAPI server at http://127.0.0.1:8000")
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)