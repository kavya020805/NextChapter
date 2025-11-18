import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

# Load env
load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ Missing GROQ_API_KEY in .env")

client = Groq(api_key=API_KEY)

app = FastAPI()

# CORS
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


@app.post("/api/moderate", response_model=ModerationResult)
async def moderate_comment(comment: CommentRequest):
    try:
        # Strong Moderation Prompt
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
            model="llama-3.1-8b-instant",   # Best Groq model for moderation
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
            print("Comment approved")
            return ModerationResult(
                is_appropriate=True,
                message="Comment allowed",
                reasons=[]
            )

        # REJECTED
        if result.startswith("REJECTED:"):
            print("Comment rejected")
            reasons = result.split(":", 1)[1].strip().split(",")
            reasons = [r.strip() for r in reasons if r.strip()]

            return ModerationResult(
                is_appropriate=False,
                message="Comment rejected",
                reasons=reasons
            )

        # Unexpected model output fallback
        return ModerationResult(
            is_appropriate=False,
            message="Comment rejected (unexpected model output)",
            reasons=["unclassified"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
