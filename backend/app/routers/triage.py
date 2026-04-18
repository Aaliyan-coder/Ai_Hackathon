from fastapi import APIRouter, HTTPException
from app.models.schemas import ExtractRequest, ExtractResponse
from app.services.pipeline import run_pipeline


router = APIRouter(prefix="/api/triage", tags=["triage"])


@router.post("/extract", response_model=ExtractResponse)
async def extract(req: ExtractRequest) -> ExtractResponse:
    try:
        emails = await run_pipeline(req.raw, req.profile)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e)) from e
    return ExtractResponse(emails=emails)
