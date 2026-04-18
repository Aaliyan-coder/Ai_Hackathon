from functools import lru_cache
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from app.config import settings


@lru_cache(maxsize=1)
def _load_pipeline():
    tokenizer = AutoTokenizer.from_pretrained(settings.spam_model_name)
    model = AutoModelForSequenceClassification.from_pretrained(settings.spam_model_name)
    model.eval()
    return tokenizer, model


def classify_batch(texts: list[str]) -> list[dict]:
    if not texts:
        return []
    tokenizer, model = _load_pipeline()
    enc = tokenizer(texts, padding=True, truncation=True, max_length=256, return_tensors="pt")
    with torch.no_grad():
        logits = model(**enc).logits
    probs = torch.softmax(logits, dim=-1).cpu().numpy()

    id2label = {int(k): v.lower() for k, v in model.config.id2label.items()}
    spam_idx = next((i for i, lbl in id2label.items() if "spam" in lbl or lbl == "1"), 1)

    results = []
    for row in probs:
        spam_prob = float(row[spam_idx])
        results.append({"is_spam": spam_prob >= 0.5, "spam_confidence": spam_prob})
    return results
