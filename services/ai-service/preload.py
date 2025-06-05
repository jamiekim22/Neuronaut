from transformers import pipeline
import logging

if __name__ == "__main__":
    logging.info("Preloading flan-t5-small model into cache…")
    _ = pipeline(
        "text2text-generation",
        model="google/flan-t5-small",
        tokenizer="google/flan-t5-small",
        device=-1
    )
    logging.info("Preload complete.")
