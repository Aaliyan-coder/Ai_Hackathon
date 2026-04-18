# Inbox Intel — Backend

FastAPI service wrapping Mistral + local ML for email triage.

## Architecture

```
raw emails ──► ML spam classifier (HF bert-tiny, local)
                   │
                   ├─ flagged ──► Mistral Small (verify_spam) ──► confirmed spam
                   │
                   └─ not flagged ─┐
                                   ▼
                         Mistral Large (batched extract)
                                   │
                                   ▼
                         ┌─ BM25 score
                         ├─ MiniLM cosine score
                         └─ LLM score (from extraction)
                                   │
                                   ▼
                            weighted average
                                   │
                                   ▼
                              EmailItem
```

The LLM verifier only runs on ML-flagged emails — saves tokens on large batches.

## Setup

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

cp .env.example .env
# put your Mistral API key in .env

./run.sh
```

First run downloads the spam classifier (~17 MB) and MiniLM (~90 MB) to the HF cache. Subsequent runs are fast.

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/triage/extract` | Full pipeline: spam + extract + relevance |
| POST | `/api/assist/prep-guide` | Prep guide for an opportunity |
| POST | `/api/assist/email-gen` | Application email draft |
| POST | `/api/assist/skill-detect` | Gap analysis from JD/bio |
| POST | `/api/quiz/generate` | 5-question quiz on a skill |
| POST | `/api/quiz/grade` | Grade quiz answers |
| GET | `/api/health` | Health check |

## Tuning

Relevance weights live in `.env`:

```
BM25_WEIGHT=0.25
EMBED_WEIGHT=0.35
LLM_WEIGHT=0.40
```

The backend normalizes them, so any ratio works.

## Model routing

- **`mistral-large-latest`** (heavy): batch extraction, quiz grading, prep guides.
- **`mistral-small-latest`** (light): spam verification, application drafts, skill detector.
