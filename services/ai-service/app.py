from fastapi import FastAPI
from pydantic import BaseModel
from transformers import pipeline
import logging

class Query(BaseModel):
    question: str

app = FastAPI()

logging.info("Loading flan-t5-small for CPU inference...")
nlp = pipeline(
    "text2text-generation",
    model="google/flan-t5-small",
    tokenizer="google/flan-t5-small",
    device=-1,            # -1 = CPU
    torch_dtype=None
)
logging.info("Model flan-t5-small loaded.")

@app.post("/ask")
def ask(q: Query):
    prompt = f"question: {q.question} context: Useful neuroscience facts."
    result = nlp(
        prompt,
        max_length=80,      
        num_beams=2,        # small beam search for quality
        do_sample=False,    
        early_stopping=True
    )
    answer = result[0]["generated_text"]
    return {"answer": answer}
