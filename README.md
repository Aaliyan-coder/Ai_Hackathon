# Inbox Intel

AI-powered email triage dashboard for university students. Split into a Python backend (Mistral + local ML) and a React frontend.

## Architecture

```
┌───────────────────┐        HTTP         ┌──────────────────────────┐
│   React (Vite)    │ ──── /api/... ────► │     FastAPI backend      │
│   localhost:5173  │ ◄─── JSON ────────  │     localhost:8000       │
└───────────────────┘                     │                          │
                                          │  ┌────────────────────┐  │
                                          │  │ HF spam classifier │  │
                                          │  │  (bert-tiny, local)│  │
                                          │  └────────┬───────────┘  │
                                          │           │              │
                                          │           ▼              │
                                          │  ┌────────────────────┐  │
                                          │  │ Mistral Small      │  │
                                          │  │ (verify spam flag) │  │
                                          │  └────────┬───────────┘  │
                                          │           │              │
                                          │           ▼              │
                                          │  ┌────────────────────┐  │
                                          │  │ Mistral Large      │  │
                                          │  │ (batched extract)  │  │
                                          │  └────────┬───────────┘  │
                                          │           │              │
                                          │  ┌────────┴───────────┐  │
                                          │  │ BM25 + MiniLM + LLM│  │
                                          │  │ (averaged score)   │  │
                                          │  └────────────────────┘  │
                                          └──────────────────────────┘
```

## Run it

Open two terminals.

**Terminal 1 — backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Put your Mistral API key in .env (get one at console.mistral.ai)
./run.sh
```

First boot downloads the spam classifier (~17 MB) and MiniLM embedding model (~90 MB) to the HuggingFace cache. Subsequent starts are fast.

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The navbar shows a green "API" badge when the backend is reachable.

## What's where

```
inbox-intel/
├── backend/                   Python FastAPI service
│   ├── app/
│   │   ├── main.py            App entry + CORS + router mounting
│   │   ├── config.py          .env-driven settings (weights, model names)
│   │   ├── models/schemas.py  Pydantic request/response models
│   │   ├── services/
│   │   │   ├── mistral_client.py   Heavy/light routing
│   │   │   ├── spam_classifier.py  HuggingFace pipeline
│   │   │   ├── relevance.py        BM25 + embedding scores
│   │   │   └── pipeline.py         Orchestrator
│   │   ├── prompts/           Mistral prompt builders (one per task)
│   │   └── routers/           triage, assist, quiz
│   ├── requirements.txt
│   ├── .env.example
│   └── run.sh
└── frontend/                  React + Vite
    ├── src/
    │   ├── api/client.js      Single fetch wrapper — the only place
    │   │                      the frontend talks to the backend
    │   ├── components/        UI
    │   ├── hooks/             Profile + theme (localStorage)
    │   ├── App.jsx
    │   └── main.jsx
    ├── vite.config.js         Has /api proxy to :8000
    └── package.json
```

## Model routing

| Task | Model | Why |
|---|---|---|
| Spam classification (first pass) | `bert-tiny` (local, ~17 MB) | Fast, deterministic, runs without an API key |
| Spam verification (second pass) | `mistral-small-latest` | Catches ML false positives cheaply |
| Email batch extraction | `mistral-large-latest` | Accuracy matters on the core task |
| Quiz grading, prep guide | `mistral-large-latest` | Multi-step reasoning |
| Application drafts, skill detector | `mistral-small-latest` | Latency + cost over depth |

## Relevance scoring

Three signals, weighted-averaged:

| Signal | Default weight | What it captures |
|---|---|---|
| BM25 | 0.25 | Literal keyword overlap (catches exact skill mentions) |
| Embedding (MiniLM) | 0.35 | Semantic similarity (catches paraphrases) |
| LLM score | 0.40 | Reasoning about fit, skill adjacency, role targeting |

Weights are in `backend/.env`. The three-score breakdown is visible on every card via the ⓘ icon next to the relevance bar.

## Urgency

LLM-derived, not mechanical from the deadline. The model factors in deadline distance, application complexity (number of essays, recommendation letters), and selectivity.

## Tuning

All the levers live in `backend/.env`:

```
MISTRAL_MODEL_HEAVY=mistral-large-latest
MISTRAL_MODEL_LIGHT=mistral-small-latest
SPAM_MODEL_NAME=mrm8488/bert-tiny-finetuned-sms-spam-detection
EMBEDDING_MODEL_NAME=sentence-transformers/all-MiniLM-L6-v2
BM25_WEIGHT=0.25
EMBED_WEIGHT=0.35
LLM_WEIGHT=0.40
```

Swap `SPAM_MODEL_NAME` for any HF text-classification model with "spam"/"ham" labels (e.g. a distilbert variant) without touching code.
