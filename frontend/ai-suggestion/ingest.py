import os
import time
from supabase import create_client, Client
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
from groq import Groq  # NEW: Groq Embeddings API

# --- 1. Load Environment ---
load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")

if not all([SUPABASE_URL, SUPABASE_SERVICE_KEY, PINECONE_API_KEY, GROQ_API_KEY]):
    raise RuntimeError("❌ Missing required environment variables")

# --- 2. Initialize Clients ---
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)
groq_client = Groq(api_key=GROQ_API_KEY)

index_name = "nextchapter-books"
EMBEDDING_DIMENSION = 1536  # Because Groq "text-embedding-3-small" output = 1536 dims


# --- 3. Helper: Groq Embedding ---
def embed_text(text: str):
    """Generate embeddings using Groq (fast, no RAM)."""
    try:
        resp = groq_client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return resp.data[0].embedding
    except Exception as e:
        print("Embedding error:", e)
        return None


# --- 4. Helper: Convert Book to Text ---
def get_text_to_embed(book):
    genres_list = book.get("genres", []) or []
    genres_str = ", ".join(genres_list)

    return (
        f"Title: {book.get('title', '')}. "
        f"Author: {book.get('author', '')}. "
        f"Genre: {book.get('genre', '')}. "
        f"Tags: {genres_str}."
    )


# --- 5. Create/Reset Pinecone Index ---
def recreate_index():
    if index_name in pc.list_indexes().names():
        print(f"Deleting existing index '{index_name}'...")
        pc.delete_index(index_name)
        time.sleep(5)

    print(f"Creating new Pinecone index '{index_name}'...")
    pc.create_index(
        name=index_name,
        dimension=EMBEDDING_DIMENSION,
        metric="cosine",
        spec=ServerlessSpec(cloud="aws", region="us-east-1")
    )
    return pc.Index(index_name)


# --- 6. Main Ingestion ---
def run_ingestion():
    print("Fetching books from Supabase...")
    response = supabase.table('books').select('id, title, author, genre, genres').execute()
    books = response.data or []

    if not books:
        print("❌ No books found in Supabase.")
        return

    print(f"Found {len(books)} books. Generating embeddings...")

    index = recreate_index()
    vectors = []

    for book in books:
        try:
            text = get_text_to_embed(book)
            vector = embed_text(text)

            if not vector:
                print(f"⚠️ Skipped book {book['id']} due to embedding error")
                continue

            vectors.append({
                "id": str(book["id"]),
                "values": vector,
                "metadata": {
                    "genre": book.get("genre"),
                    "author": book.get("author")
                }
            })

            print(f"Embedded book ID: {book['id']}")

        except Exception as e:
            print(f"Error processing book {book['id']}: {e}")

    print(f"Upserting {len(vectors)} vectors into Pinecone...")

    # Pinecone batch upload
    for i in range(0, len(vectors), 100):
        batch = vectors[i:i+100]
        try:
            index.upsert(vectors=batch)
            print(f"Upserted batch {i//100 + 1}")
        except Exception as e:
            print(f"Batch upsert failed: {e}")

    print("🎉 Ingestion complete!")


# --- 7. Run File ---
if __name__ == "__main__":
    run_ingestion()
