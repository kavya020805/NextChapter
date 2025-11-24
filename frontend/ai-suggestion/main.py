import os
import time
from typing import Any, Dict, List, Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pinecone import Pinecone
from pydantic import BaseModel
from supabase import Client, create_client
from postgrest.exceptions import APIError
from groq import Groq  # NEW: Groq Embeddings

load_dotenv()

# --- Environment Variables ---
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, PINECONE_API_KEY, GROQ_API_KEY]):
    raise RuntimeError("❌ Missing one or more env variables")

# --- Initialize Clients ---
app = FastAPI(title="NextChapter AI Suggestions API")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

index = pc.Index("nextchapter-books")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Models ---
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
    strategy: Optional[str] = None
    is_fallback: bool = False


# ==========================
# 🔥 NEW: GROQ EMBEDDING FUNCTION
# ==========================
def embed_text(text: str) -> List[float]:
    """Use Groq embedding API instead of local ML model."""
    try:
        resp = groq_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return resp.data[0].embedding
    except Exception as e:
        print("Embedding error:", e)
        raise HTTPException(status_code=500, detail="Embedding failed")


# ==========================
# 🔧 Helper Functions
# ==========================

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

def format_books(book_list: List[Dict[str, Any]]):
    out = []
    for b in book_list[:5]:
        out.append({
            "book_id": b.get("id"),
            "title": b.get("title"),
            "author": b.get("author"),
            "cover_url": b.get("cover_image")
        })
    return out


# ==========================
# 🔥 MAIN RECOMMENDATION LOGIC (no ML model load!)
# ==========================

async def build_recommendations_payload(user_id: str) -> RecommendationResponse:
    print(f"Generating recommendations for {user_id}")

    # --- Step 1: Fetch user history ---
    history_res = supabase.rpc("get_full_user_history", {"p_user_id": user_id}).execute()
    history = history_res.data or []

    read_ids = {h["book_id"] for h in history}
    recent_history = history[:5]

    # === COLD START ===
    if not recent_history:
        print("Cold start")

        prefs = await get_recs_from_preferences(user_id)
        fallback = prefs or await get_popular_books()

        fallback = [b for b in fallback if b.get("id") not in read_ids]

        formatted = format_books(fallback)
        return RecommendationResponse(
            user_id=user_id,
            books=[RecommendedBook(**b) for b in formatted],
            strategy="cold_start",
            is_fallback=True
        )

    # === WARM START ===
    print("Warm start — calculating scores")
    scored = [
        {"book_id": item["book_id"], "score": calculate_love_score(item)}
        for item in recent_history
    ]

    recent_ids = [s["book_id"] for s in scored]

    books_info = supabase.table("books").select("id,title,author,genres").in_("id", recent_ids).execute().data

    # highest score book
    scored.sort(key=lambda x: x["score"], reverse=True)
    top_book_id = scored[0]["book_id"]
    top_book_details = next(b for b in books_info if b["id"] == top_book_id)

    # === VECTOR SEARCH ===
    query_text = get_text_to_embed(top_book_details)
    vector = embed_text(query_text)

    result = index.query(
        vector=vector,
        top_k=8,
        include_metadata=True
    )

    similar_ids = [m["id"] for m in result["matches"] if m["id"] not in read_ids][:5]

    if not similar_ids:
        fallback = await get_popular_books()
        formatted = format_books(fallback)

        return RecommendationResponse(
            user_id=user_id,
            books=[RecommendedBook(**b) for b in formatted],
            strategy="fallback",
            is_fallback=True
        )

    final_books = supabase.table("books").select("id,title,author,cover_image").in_("id", similar_ids).execute().data

    formatted = format_books(final_books)

    return RecommendationResponse(
        user_id=user_id,
        books=[RecommendedBook(**b) for b in formatted],
        strategy="vector_search",
        is_fallback=False
    )


# ============== EXPLORE PAYLOAD ==============

async def build_explore_payload(user_id: str, limit: int = 5):
    read = supabase.table("user_books").select("book_id").eq("user_id", user_id).execute().data
    read_ids = {r["book_id"] for r in read}

    books = supabase.table("books").select("id,title,author,cover_image").order("number_of_downloads", desc=True).limit(60).execute().data

    out = []
    for b in books:
        if b["id"] not in read_ids:
            out.append(b)
        if len(out) >= limit:
            break

    formatted = format_books(out)
    return RecommendationResponse(
        user_id=user_id,
        books=[RecommendedBook(**b) for b in formatted],
        strategy="explore"
    )


# ============== ENDPOINTS ==============

@app.post("/recommendations", response_model=RecommendationResponse)
async def post_suggestions(payload: RecommendationRequest):
    return await build_recommendations_payload(payload.user_id)

@app.get("/recommendations/{user_id}", response_model=RecommendationResponse)
async def get_suggestions(user_id: str):
    return await build_recommendations_payload(user_id)

@app.post("/explore", response_model=RecommendationResponse)
async def post_explore(payload: RecommendationRequest):
    return await build_explore_payload(payload.user_id)

@app.get("/explore/{user_id}", response_model=RecommendationResponse)
async def get_explore(user_id: str):
    return await build_explore_payload(user_id)


# Local run
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
