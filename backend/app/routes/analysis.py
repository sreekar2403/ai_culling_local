"""Analysis and override API routes."""

from typing import Optional

from fastapi import APIRouter, HTTPException

from ..models.schemas import (
    AnalyzeRequest,
    AnalyzeResponse,
    OverrideRequest,
    ImageResult,
)
from ..services import analysis as analysis_service

router = APIRouter(prefix="/api", tags=["analysis"])


@router.post("/session/{session_id}/analyze", response_model=AnalyzeResponse)
async def analyze_images(session_id: str, request: Optional[AnalyzeRequest] = None):
    """Run AI analysis on session images using Ollama."""
    model = request.model if request and request.model else None
    try:
        session = await analysis_service.analyze_images(session_id, model=model)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return AnalyzeResponse(session=session)


@router.get("/session/{session_id}/results")
async def get_results(session_id: str):
    """Get analysis results for a session."""
    session = analysis_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    images = analysis_service.get_results(session_id)
    return {"session": session, "images": images}


@router.post("/session/{session_id}/override")
async def set_override(session_id: str, request: OverrideRequest):
    """Set human override decision for an image."""
    session = analysis_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    analysis_service.set_override(session_id, request.image_id, request.decision.value)
    return {"ok": True}
