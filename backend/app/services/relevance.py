import re
from functools import lru_cache
import numpy as np
from rank_bm25 import BM25Okapi
from sentence_transformers import SentenceTransformer
from app.config import settings


_token_re = re.compile(r"[a-zA-Z][a-zA-Z0-9+#\-.]*")


def tokenize(text: str) -> list[str]:
    return [t.lower() for t in _token_re.findall(text or "")]


@lru_cache(maxsize=1)
def _embedder() -> SentenceTransformer:
    return SentenceTransformer(settings.embedding_model_name)


def _profile_query(profile) -> str:
    skills = ", ".join(profile.skills) if profile.skills else ""
    return f"{profile.target_role} opportunity for {profile.year} student skilled in {skills}".strip()


def bm25_scores(emails_text: list[str], query: str) -> list[float]:
    if not emails_text:
        return []
    corpus_tokens = [tokenize(t) for t in emails_text]
    query_tokens = tokenize(query)
    if not any(corpus_tokens) or not query_tokens:
        return [0.0] * len(emails_text)
    bm25 = BM25Okapi(corpus_tokens)
    raw = bm25.get_scores(query_tokens)
    if raw.max() <= 0:
        return [0.0] * len(emails_text)
    return (raw / raw.max() * 10.0).tolist()


def embedding_scores(emails_text: list[str], query: str) -> list[float]:
    if not emails_text:
        return []
    model = _embedder()
    q_vec = model.encode([query], normalize_embeddings=True)
    d_vecs = model.encode(emails_text, normalize_embeddings=True)
    sims = (d_vecs @ q_vec.T).flatten()
    scaled = np.clip(sims * 10.0, 0.0, 10.0)
    return scaled.tolist()


def average(bm25: float, emb: float, llm: float) -> float:
    w = settings.bm25_weight + settings.embed_weight + settings.llm_weight
    if w <= 0:
        return 0.0
    combined = (
        bm25 * settings.bm25_weight
        + emb * settings.embed_weight
        + llm * settings.llm_weight
    ) / w
    return round(float(np.clip(combined, 0.0, 10.0)), 2)


def build_query(profile) -> str:
    return _profile_query(profile)
