from fastapi import FastAPI
from pydantic import BaseModel

class Query(BaseModel):
    question: str

app = FastAPI()

@app.post("/ask")
def ask(q: Query):
    # TODO: plug in your ML model here
    return {"answer": f"Echo: {q.question}"}