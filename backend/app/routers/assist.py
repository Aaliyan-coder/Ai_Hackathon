from fastapi import APIRouter, HTTPException
from app.models.schemas import (
    PrepGuideRequest,
    EmailGenRequest,
    EmailGenResponse,
    SkillDetectRequest,
    SkillDetectResponse,
)
from app.services.mistral_client import get_mistral
from app.prompts.prep_guide import build_prep_guide_prompt
from app.prompts.email_gen import build_email_gen_prompt
from app.prompts.skill_detector import build_skill_detector_prompt


router = APIRouter(prefix="/api/assist", tags=["assist"])


@router.post("/prep-guide")
async def prep_guide(req: PrepGuideRequest):
    prompt = build_prep_guide_prompt(req.email, req.profile)
    try:
        return await get_mistral().heavy_json(prompt, temperature=0.3)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Prep guide generation failed: {e}") from e


@router.post("/email-gen", response_model=EmailGenResponse)
async def email_gen(req: EmailGenRequest) -> EmailGenResponse:
    prompt = build_email_gen_prompt(req.email, req.profile)
    try:
        draft = await get_mistral().light_text(prompt, temperature=0.6)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Email draft failed: {e}") from e
    return EmailGenResponse(draft=draft.strip())


@router.post("/skill-detect", response_model=SkillDetectResponse)
async def skill_detect(req: SkillDetectRequest) -> SkillDetectResponse:
    if not req.text.strip():
        raise HTTPException(status_code=400, detail="Empty input text")
    prompt = build_skill_detector_prompt(req.text, req.profile)
    try:
        data = await get_mistral().light_json(prompt, temperature=0.2)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Skill detection failed: {e}") from e
    return SkillDetectResponse(
        detected_skills=data.get("detected_skills") or [],
        matched=data.get("matched") or [],
        missing=data.get("missing") or [],
        suggested_additions=data.get("suggested_additions") or [],
        notes=data.get("notes") or "",
    )
