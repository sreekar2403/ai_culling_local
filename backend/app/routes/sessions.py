"""Session management API routes."""

from fastapi import APIRouter, HTTPException

from ..models.schemas import AnalysisSession, CreateSessionResponse
from ..services import analysis as analysis_service

router = APIRouter(prefix="/api", tags=["sessions"])


@router.post("/session/create", response_model=CreateSessionResponse)
async def create_session():
    """Create a new analysis session."""
    session = analysis_service.create_session()
    return CreateSessionResponse(session=session)


@router.get("/session/{session_id}", response_model=AnalysisSession)
async def get_session(session_id: str):
    """Get session details by ID."""
    session = analysis_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.get("/sessions", response_model=list[AnalysisSession])
async def list_sessions():
    """List all sessions."""
    return analysis_service.get_all_sessions()


@router.delete("/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its images."""
    deleted = analysis_service.delete_session(session_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"status": "deleted"}
