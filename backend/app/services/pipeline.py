import asyncio
import re
import uuid
from datetime import datetime
from app.models.schemas import EmailItem, Profile, ScoreBreakdown
from app.services import spam_classifier, relevance
from app.services.mistral_client import get_mistral
from app.prompts.extraction import build_extraction_prompt


def split_raw(raw: str) -> list[str]:
    chunks = [c.strip() for c in re.split(r"---EMAIL---", raw) if c.strip()]
    return chunks


def _parse_subject(body: str) -> str:
    m = re.search(r"^\s*Subject:\s*(.+)$", body, re.MULTILINE | re.IGNORECASE)
    return m.group(1).strip() if m else "(no subject)"


def _gen_id() -> str:
    return "em_" + uuid.uuid4().hex[:10]


async def run_pipeline(raw: str, profile: Profile) -> list[EmailItem]:
    chunks = split_raw(raw)
    if not chunks:
        raise ValueError("No emails found. Separate emails with ---EMAIL---")

    mistral = get_mistral()
    ml_spam = spam_classifier.classify_batch(chunks)

    flagged_indices = [i for i, r in enumerate(ml_spam) if r["is_spam"]]
    verify_tasks = [
        mistral.verify_spam(_parse_subject(chunks[i]), chunks[i])
        for i in flagged_indices
    ]
    verifications = await asyncio.gather(*verify_tasks) if verify_tasks else []
    verify_map = dict(zip(flagged_indices, verifications))

    confirmed_spam = [
        i for i in flagged_indices
        if verify_map.get(i, {}).get("is_spam", False)
    ]
    spam_set = set(confirmed_spam)

    non_spam_indices = [i for i in range(len(chunks)) if i not in spam_set]
    non_spam_chunks = [chunks[i] for i in non_spam_indices]

    extraction_task = None
    if non_spam_chunks:
        today = datetime.utcnow().date().isoformat()
        prompt = build_extraction_prompt(non_spam_chunks, profile, today)
        extraction_task = mistral.heavy_json(prompt, temperature=0.1)

    extracted = []
    if extraction_task is not None:
        try:
            result = await extraction_task
            extracted = result.get("emails") if isinstance(result, dict) else result
            if not isinstance(extracted, list):
                extracted = []
        except Exception as e:
            raise RuntimeError(f"Extraction failed: {e}") from e

    query = relevance.build_query(profile)
    bm25 = relevance.bm25_scores(non_spam_chunks, query)
    emb = relevance.embedding_scores(non_spam_chunks, query)

    out: list[EmailItem] = []

    for i, chunk in enumerate(chunks):
        if i in spam_set:
            subj = _parse_subject(chunk)
            out.append(EmailItem(
                id=_gen_id(),
                subject=subj,
                sender="",
                organization="",
                summary=(chunk[:160] + "…") if len(chunk) > 160 else chunk,
                is_spam=True,
                spam_confidence=ml_spam[i]["spam_confidence"],
                classification="spam",
                urgency="low",
                relevance_score=0.0,
                relevance_reason=verify_map.get(i, {}).get("reason", "Flagged by ML classifier and confirmed by verifier."),
            ))
            continue

        local = non_spam_indices.index(i)
        raw_obj = extracted[local] if local < len(extracted) else {}
        llm_score = float(raw_obj.get("llm_relevance_score", 0) or 0)
        bm25_s = bm25[local] if local < len(bm25) else 0.0
        emb_s = emb[local] if local < len(emb) else 0.0
        final = relevance.average(bm25_s, emb_s, llm_score)

        deadline = raw_obj.get("deadline")
        if deadline in ("null", "", None):
            deadline = None

        urgency = raw_obj.get("urgency") or "low"
        if urgency not in ("critical", "high", "medium", "low"):
            urgency = "low"

        classification = raw_obj.get("classification") or "relevant"
        if classification == "spam":
            classification = "irrelevant"

        out.append(EmailItem(
            id=raw_obj.get("id") or _gen_id(),
            subject=raw_obj.get("subject") or _parse_subject(chunk),
            sender=raw_obj.get("sender") or "",
            organization=raw_obj.get("organization") or "",
            deadline=deadline,
            opportunity_type=raw_obj.get("opportunity_type") or "other",
            required_skills=raw_obj.get("required_skills") or [],
            summary=raw_obj.get("summary") or "",
            relevance_score=final,
            relevance_reason=raw_obj.get("relevance_reason") or "",
            urgency=urgency,
            action_required=raw_obj.get("action_required") or "",
            is_spam=False,
            spam_confidence=ml_spam[i]["spam_confidence"],
            classification=classification,
            score_breakdown=ScoreBreakdown(
                bm25=round(bm25_s, 2),
                embedding=round(emb_s, 2),
                llm=round(llm_score, 2),
                final=final,
            ),
        ))

    return out
