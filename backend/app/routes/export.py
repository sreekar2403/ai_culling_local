"""Export API routes."""

from __future__ import annotations

import tempfile
from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from ..models.schemas import ExportRequest, ExportResponse
from ..services import analysis as analysis_service
from ..services import export as export_service

router = APIRouter(prefix="/api", tags=["export"])


@router.post("/session/{session_id}/export", response_model=ExportResponse)
async def export_results(session_id: str, request: ExportRequest):
    """Export analysis results in chosen format."""
    session = analysis_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    images = analysis_service.get_results(session_id)

    if request.format == "csv":
        content = export_service.export_as_csv(
            images, include_rejected=request.include_rejected,
            include_scores=request.include_scores,
        )
        ext = ".csv"
        media_type = "text/csv"
    elif request.format == "json":
        content = export_service.export_as_json(
            images, include_rejected=request.include_rejected,
        )
        ext = ".json"
        media_type = "application/json"
    else:  # txt
        content = export_service.export_as_txt(
            images, include_rejected=request.include_rejected,
        )
        ext = ".txt"
        media_type = "text/plain"

    # Write to temp file and serve
    filename = f"cull_results_{session_id[:8]}{ext}"
    tmp_path = Path(tempfile.gettempdir()) / filename
    tmp_path.write_text(content)

    return ExportResponse(
        download_url=f"/api/export/download/{filename}",
        filename=filename,
    )


@router.get("/export/download/{filename}")
async def download_export(filename: str):
    """Download an export file."""
    tmp_path = Path(tempfile.gettempdir()) / filename
    if not tmp_path.exists():
        raise HTTPException(status_code=404, detail="Export file not found")

    return FileResponse(
        path=str(tmp_path),
        filename=filename,
        media_type="application/octet-stream",
    )
