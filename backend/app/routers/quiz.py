from fastapi import APIRouter, HTTPException
from app.models.schemas import Quiz, QuizRequest, QuizGradeRequest, QuizGradeResult
from app.services.mistral_client import get_mistral
from app.prompts.quiz import build_quiz_prompt, build_grade_prompt


router = APIRouter(prefix="/api/quiz", tags=["quiz"])


@router.post("/generate", response_model=Quiz)
async def generate(req: QuizRequest) -> Quiz:
    if not req.skill.strip():
        raise HTTPException(status_code=400, detail="Skill is required")
    prompt = build_quiz_prompt(req.skill)
    try:
        data = await get_mistral().heavy_json(prompt, temperature=0.5)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Quiz generation failed: {e}") from e
    return Quiz(**data)


@router.post("/grade", response_model=QuizGradeResult)
async def grade(req: QuizGradeRequest) -> QuizGradeResult:
    prompt = build_grade_prompt(req.skill, req.questions, req.answers)
    try:
        data = await get_mistral().heavy_json(prompt, temperature=0.1)
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Grading failed: {e}") from e
    return QuizGradeResult(**data)
