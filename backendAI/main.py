import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ Missing GROQ_API_KEY in .env")

client = Groq(api_key=API_KEY)

app = FastAPI()

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CommentRequest(BaseModel):
    text: str

class ModerationResult(BaseModel):
    is_appropriate: bool
    message: str
    reasons: list[str] = []

class ChatRequest(BaseModel):
    message: str
    book_title: str = ""
    current_page: int = 1
    total_pages: int = 0

class ChatResponse(BaseModel):
    response: str

class ImageRequest(BaseModel):
    prompt: str
    book_title: str = ""
    current_page: int = 1
    size: str = "1024x1024"

class ImageResponse(BaseModel):
    image_url: str
    prompt: str


@app.post("/api/moderate", response_model=ModerationResult)
async def moderate_comment(comment: CommentRequest):
    try:
        system_prompt = """
You are a STRICT content moderation engine.

You must output EXACTLY one of the following:

APPROVED

or

REJECTED: <comma-separated reasons>

Reject ANY content with:
- insults (idiot, stupid, dumb, moron, loser, trash, etc.)
- harassment, threats, bullying
- hate speech or discrimination
- explicit or sexual content
- violence or physical harm
- self-harm or suicide talk
- illegal activity
- profanity, rude or abusive language
- harmful opinions that attack people
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": comment.text},
            ],
            temperature=0,
            max_tokens=30,
        )

        result = response.choices[0].message.content.strip()

        # APPROVED
        if result == "APPROVED":
            return ModerationResult(
                is_appropriate=True,
                message="Comment allowed",
                reasons=[]
            )

        # REJECTED
        if result.startswith("REJECTED:"):
            reasons = result.split(":", 1)[1].strip().split(",")
            reasons = [r.strip() for r in reasons if r.strip()]

            return ModerationResult(
                is_appropriate=False,
                message="Comment rejected",
                reasons=reasons
            )

        # Unknown model output
        return ModerationResult(
            is_appropriate=False,
            message="Comment rejected (unexpected model output)",
            reasons=["unclassified"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def chat(request: ChatRequest):
    try:
        print(f"Received chat request: {request.message[:50]}...")
        print(f"Book: {request.book_title}, Page: {request.current_page}")
        
        system_prompt = f"""You are a helpful AI assistant for the book "{request.book_title}". 
The user is currently on page {request.current_page}{f' of {request.total_pages}' if request.total_pages > 0 else ''}. 
Provide concise, relevant answers about the book's content, themes, characters, and context."""

        print("Calling Groq API...")
        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",  # Using the same model as moderation
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message},
            ],
            temperature=0.7,
            max_tokens=500,
        )

        ai_response = response.choices[0].message.content.strip()
        print(f"Got response: {ai_response[:50]}...")
        
        return {"response": ai_response}

    except Exception as e:
        print(f"Error in chat endpoint: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-image")
async def generate_image(request: ImageRequest):
    """
    Generate an image based on a text prompt using Pollinations.ai (free, no API key needed)
    """
    try:
        print(f"Image generation request: {request.prompt[:50]}...")
        
        # Enhance the prompt with book context
        enhanced_prompt = f"{request.prompt}. Book: {request.book_title}, Page: {request.current_page}. High quality, detailed, artistic visualization."
        
        # Parse size
        width, height = 1024, 1024
        if 'x' in request.size:
            try:
                w, h = request.size.split('x')
                width, height = int(w), int(h)
            except:
                pass
        
        # Use Pollinations.ai - free image generation API
        # URL format: https://image.pollinations.ai/prompt/{encoded_prompt}
        import urllib.parse
        encoded_prompt = urllib.parse.quote(enhanced_prompt)
        
        # Generate image URL with custom size
        image_url = f"https://image.pollinations.ai/prompt/{encoded_prompt}?width={width}&height={height}&nologo=true&enhance=true"
        
        print(f"Generated image URL: {image_url[:100]}...")
        
        return {
            "image_url": image_url,
            "prompt": enhanced_prompt
        }
        
    except Exception as e:
        print(f"Error in image generation: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


# Local development only
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)
