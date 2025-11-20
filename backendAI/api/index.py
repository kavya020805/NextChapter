import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv("GROQ_API_KEY")
if not API_KEY:
    raise RuntimeError("❌ Missing GROQ_API_KEY in .env")

client = Groq(api_key=API_KEY)

app = FastAPI()

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


@app.post("/moderate", response_model=ModerationResult)
async def moderate_comment(comment: CommentRequest):
    try:
        system_prompt = """
You are a STRICT content moderation engine.

You must output EXACTLY one of:
APPROVED
or
REJECTED: <comma-separated reasons>
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

        if result == "APPROVED":
            return ModerationResult(
                is_appropriate=True,
                message="Comment allowed",
                reasons=[]
            )

        if result.startswith("REJECTED:"):
            reasons = result.split(":", 1)[1].strip().split(",")
            reasons = [r.strip() for r in reasons if r.strip()]
            return ModerationResult(
                is_appropriate=False,
                message="Comment rejected",
                reasons=reasons
            )

        return ModerationResult(
            is_appropriate=False,
            message="Comment rejected (unexpected model output)",
            reasons=["unclassified"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
