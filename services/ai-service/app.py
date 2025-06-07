import os
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import httpx

from dotenv import load_dotenv
load_dotenv()

GITHUB_AI_TOKEN = os.getenv("GITHUB_AI_TOKEN")
if not GITHUB_AI_TOKEN:
    raise RuntimeError("Missing GITHUB_AI_TOKEN in environment")

class Query(BaseModel):
    question: str

app = FastAPI()

@app.post("/ask")
async def ask(q: Query):
    system_msg = {"role": "system", 
                  "content": "You are a neuroscience (specifically brain anatomy) expert. Provide concise, factual answers. Keep responses under 100 words. If given a non neuroscience related question, respond with 'I'm not sure, sorry! I'm only able to answer questions related to the brain.'"}
    user_msg = {"role": "user", "content": q.question}

    payload = {
        "model": "xai/grok-3-mini",
        "messages": [system_msg, user_msg]
    }

    headers = {
        "Authorization": f"Bearer {GITHUB_AI_TOKEN}",
        "Accept": "application/vnd.github+json",
        "Content-Type": "application/json"
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://models.github.ai/inference/chat/completions",
            json=payload,
            headers=headers
        )

    if response.status_code == 429:
        # rate limit hit; return 503 or instruct client to retry
        raise HTTPException(status_code=503, detail="Rate limit exceeded, please try again later.")
    if response.status_code != 200:
        # other errors
        detail = response.json().get("message", "AI inference error")
        raise HTTPException(status_code=response.status_code, detail=detail)

    result = response.json()
    answer = result["choices"][0]["message"]["content"]
    return {"answer": answer}