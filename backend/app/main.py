import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import triage, assist, quiz
from app.services import spam_classifier, relevance


log = logging.getLogger("inbox-intel")
logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s - %(message)s")


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("Warming up spam classifier and embedding models…")
    try:
        spam_classifier.classify_batch(["warmup"])
        relevance.embedding_scores(["warmup"], "warmup")
        log.info("Models ready.")
    except Exception as e:
        log.warning("Model warmup failed (will retry on first request): %s", e)
    yield


app = FastAPI(title="Inbox Intel API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in settings.cors_origins.split(",") if o.strip()],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(triage.router)
app.include_router(assist.router)
app.include_router(quiz.router)


@app.get("/api/health")
async def health():
    return {"status": "ok"}
