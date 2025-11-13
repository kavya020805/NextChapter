import os
from supabase import create_client, Client
from pinecone import Pinecone, ServerlessSpec
from dotenv import load_dotenv
import time
from sentence_transformers import SentenceTransformer # <-- NEW IMPORT

# --- 1. Load Environment & Initialize Clients ---
load_dotenv() 

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_KEY")
PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
# GROQ_API_KEY is not needed for ingestion

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
pc = Pinecone(api_key=PINECONE_API_KEY)

# --- NEW: Load local embedding model ---
# This model creates 384-dimension vectors
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
EMBEDDING_DIMENSION = 384 # <-- IMPORTANT CHANGE

# --- 2. Get or Create Pinecone Index ---
index_name = "nextchapter-books"
if index_name in pc.list_indexes().names():
    print(f"Deleting old index '{index_name}'...")
    pc.delete_index(index_name)

print(f"Waiting for index deletion to complete...")
time.sleep(10) # Give Pinecone a moment

print(f"Creating new Pinecone index: {index_name} with dimension {EMBEDDING_DIMENSION}")
pc.create_index(
    name=index_name,
    dimension=EMBEDDING_DIMENSION, # <-- Use new 384 dimension
    metric="cosine", 
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)
index = pc.Index(index_name)

# --- 3. Helper Functions ---
def get_text_to_embed(book):
    """Combines book fields into a single string for embedding."""
    genres_list = book.get('genres', [])
    genres_str = ", ".join(genres_list) if genres_list else ""
    
    return f"Title: {book.get('title', '')}. " \
           f"Author: {book.get('author', '')}. " \
           f"Genre: {book.get('genre', '')}. " \
           f"Tags: {genres_str}."

# --- 4. Main Ingestion Function ---
def run_ingestion():
    print("Fetching books from Supabase...")
    response = supabase.table('books').select('id, title, author, genre, genres').execute()
    books = response.data
    
    if not books:
        print("No books found to ingest.")
        return

    print(f"Found {len(books)} books. Generating local embeddings...")
    
    vectors_to_upsert = []
    for book in books:
        try:
            text_to_embed = get_text_to_embed(book)
            
            # --- MODIFIED: Use SentenceTransformer ---
            vector = embedding_model.encode(text_to_embed).tolist()
            
            vectors_to_upsert.append({
                "id": str(book['id']), 
                "values": vector,
                "metadata": {
                    "genre": book.get('genre', 'Unknown'),
                    "author": book.get('author', 'Unknown')
                    }
            })
            print(f"Generated embedding for book ID: {book['id']}")
        
        except Exception as e:
            print(f"Error embedding book {book['id']}: {e}. Skipping.")

    print(f"Upserting {len(vectors_to_upsert)} vectors to Pinecone...")
    if vectors_to_upsert:
        for i in range(0, len(vectors_to_upsert), 100):
            batch = vectors_to_upsert[i:i+100]
            try:
                index.upsert(vectors=batch)
                print(f"Upserted batch {i//100 + 1}")
            except Exception as e:
                print(f"Error upserting batch {i//100 + 1}: {e}")
    else:
        print("No vectors were generated. Nothing to upsert.")
    
    print("Ingestion complete!")

# --- 5. Run it ---
if __name__ == "__main__":
    run_ingestion()