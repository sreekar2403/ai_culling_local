"""Image loading API routes.

Handles loading images from local folder paths or via upload.
"""

from __future__ import annotations

import io
import os
import tempfile
import uuid
from pathlib import Path
from fastapi.responses import FileResponse

from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from fastapi.responses import Response

from ..models.schemas import LoadFilesRequest, LoadFilesResponse
from ..services import images as img_service
from ..services import analysis as analysis_service

router = APIRouter(prefix="/api", tags=["images"])

# In-memory thumbnails store
_thumbnail_cache: dict[str, bytes] = {}


@router.post("/session/{session_id}/load-files", response_model=LoadFilesResponse)
async def load_files(session_id: str, request: LoadFilesRequest):
    """Load images from a local directory path."""
    if not request.path:
        raise HTTPException(status_code=400, detail="Path is required")

    path = Path(request.path)
    if not path.exists():
        raise HTTPException(status_code=400, detail=f"Path does not exist: {request.path}")
    if not path.is_dir():
        raise HTTPException(status_code=400, detail=f"Path is not a directory: {request.path}")

    try:
        session, images = analysis_service.load_files_from_path(session_id, str(path))
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

    # Generate thumbnails for loaded images
    for img in images:
        raw = img_service.read_image_bytes(img.path)
        if raw:
            thumb = img_service.generate_thumbnail(raw)
            if thumb:
                _thumbnail_cache[img.id] = thumb

    return LoadFilesResponse(session=session, images=images)


@router.post("/session/{session_id}/upload-files", response_model=LoadFilesResponse)
async def upload_files(session_id: str, files: list[UploadFile] = File(...)):
    """Upload image files via drag-and-drop."""
    session = analysis_service.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    uploaded = []
    temp_dir = Path(tempfile.mkdtemp(prefix="opc_upload_"))

    for file in files:
        if not img_service.is_supported(file.filename or ""):
            continue

        # Save to temp directory
        safe_name = f"{uuid.uuid4().hex}_{file.filename}"
        dest = temp_dir / safe_name
        content = await file.read()

        with open(dest, "wb") as f:
            f.write(content)

        image_result = img_service.make_image_result(dest)
        uploaded.append(image_result)

        # Generate thumbnail
        thumb = img_service.generate_thumbnail(content)
        if thumb:
            _thumbnail_cache[image_result.id] = thumb

    # Store in session
    existing = analysis_service.get_results(session_id)
    existing.extend(uploaded)
    # Update session count
    session.total_images += len(uploaded)

    return LoadFilesResponse(
        session=session,
        images=uploaded,
    )


@router.get("/session/{session_id}/image/{image_id}")
async def get_full_image(session_id: str, image_id: str):
    """Serve full-size image for preview."""
    from ..services import analysis as analysis_service
    images = analysis_service.get_results(session_id)
    for img in images:
        if img.id == image_id:
            path = Path(img.path)
            if path.exists():
                return FileResponse(path=str(path))
            raise HTTPException(status_code=404, detail="Image file not found")
    raise HTTPException(status_code=404, detail="Image not found in session")


@router.get("/thumbnail/{image_id}")
async def get_thumbnail(image_id: str):
    """Get cached thumbnail for an image."""
    thumb = _thumbnail_cache.get(image_id)
    if not thumb:
        # Try to find and generate
        for images in analysis_service._image_store.values():
            for img in images:
                if img.id == image_id:
                    raw = img_service.read_image_bytes(img.path)
                    if raw:
                        thumb = img_service.generate_thumbnail(raw)
                        if thumb:
                            _thumbnail_cache[image_id] = thumb
                    break

    if not thumb:
        raise HTTPException(status_code=404, detail="Thumbnail not found")

    return Response(content=thumb, media_type="image/jpeg")
