"""Analysis orchestration service.

Manages the analysis pipeline: coordinating image loading,
Ollama inference, score aggregation, and session management.
"""

from __future__ import annotations

import json
import time
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from ..models.schemas import (
    AnalysisSession,
    AnalysisStatus,
    ImageResult,
    Decision,
)
from . import images as img_service
from . import ollama as ollama_service


# In-memory session store (replaced with SQLite in v2)
_sessions: dict[str, AnalysisSession] = {}
_image_store: dict[str, list[ImageResult]] = {}
_override_store: dict[str, dict[str, str]] = {}  # session_id -> {image_id: decision}


def create_session() -> AnalysisSession:
    """Create a new analysis session."""
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()

    session = AnalysisSession(
        id=session_id,
        created_at=now,
        total_images=0,
        model_used="",
        analysis_duration_ms=None,
        status=AnalysisStatus.pending,
    )

    _sessions[session_id] = session
    _image_store[session_id] = []
    _override_store[session_id] = {}
    return session


def get_session(session_id: str) -> Optional[AnalysisSession]:
    """Get session by ID."""
    return _sessions.get(session_id)


def get_all_sessions() -> list[AnalysisSession]:
    """Get all sessions, most recent first."""
    return sorted(
        _sessions.values(),
        key=lambda s: s.created_at,
        reverse=True,
    )


def load_files_from_path(session_id: str, directory: str) -> tuple[AnalysisSession, list[ImageResult]]:
    """Load images from a directory path into a session."""
    session = _sessions.get(session_id)
    if not session:
        raise ValueError(f"Session {session_id} not found")

    files = img_service.scan_directory(directory)
    images = [img_service.make_image_result(f) for f in files]

    session.status = AnalysisStatus.scanning
    session.total_images = len(images)

    _image_store[session_id] = images
    _sessions[session_id] = session

    return session, images


async def analyze_images(
    session_id: str,
    model: Optional[str] = None,
) -> AnalysisSession:
    """Run AI analysis on all images in a session."""
    session = _sessions.get(session_id)
    if not session:
        raise ValueError(f"Session {session_id} not found")

    images = _image_store.get(session_id, [])
    if not images:
        raise ValueError(f"No images in session {session_id}")

    # Pick model
    if not model:
        from .hardware import detect_hardware, recommend_model
        hw = detect_hardware()
        rec = recommend_model(hw)
        model = rec.model_name

    session.status = AnalysisStatus.analyzing
    session.model_used = model
    _sessions[session_id] = session

    default_prompt = (
        "Rate this photo's technical quality from 0-100. "
        "Consider sharpness, exposure, blur, composition. "
        "If people are present, note whether eyes appear open. "
        "Return only valid JSON with keys: score (int 0-100), "
        "reasons (array of strings explaining the score)."
    )

    start_time = time.time()
    analyzed = 0
    failed = 0

    for image in images:
        filepath = image.path
        raw_bytes = img_service.read_image_bytes(filepath)
        if not raw_bytes:
            image.score = 0
            image.score_reasons = ["Failed to read image file"]
            image.ai_decision = Decision.reject
            continue

        resized = img_service.resize_for_analysis(raw_bytes)
        if not resized:
            image.score = 0
            image.score_reasons = ["Failed to resize image"]
            image.ai_decision = Decision.reject
            continue

        result = await ollama_service.analyze_image(
            image_data=resized,
            prompt=default_prompt,
            model=model,
        )

        if result and "score" in result:
            score = max(0, min(100, int(result["score"])))
            reasons = result.get("reasons", [])
            image.score = float(score)
            image.score_reasons = reasons

            thresh = session.threshold
            if score >= thresh["accept"]:
                image.ai_decision = Decision.accept
            elif score < thresh["reject"]:
                image.ai_decision = Decision.reject
            else:
                image.ai_decision = Decision.uncertain

            analyzed += 1
        else:
            image.score = 50
            image.score_reasons = ["Analysis failed or timed out"]
            image.ai_decision = Decision.uncertain
            failed += 1

    elapsed = int((time.time() - start_time) * 1000)

    session.status = AnalysisStatus.complete
    session.analysis_duration_ms = elapsed
    _sessions[session_id] = session
    _image_store[session_id] = images

    return session


def get_results(session_id: str) -> list[ImageResult]:
    """Get analysis results for a session."""
    images = _image_store.get(session_id, [])
    overrides = _override_store.get(session_id, {})

    for img in images:
        if img.id in overrides:
            img.human_decision = Decision(overrides[img.id])

    return images


def set_override(session_id: str, image_id: str, decision: str) -> None:
    """Set human override decision for an image."""
    if session_id not in _override_store:
        _override_store[session_id] = {}
    _override_store[session_id][image_id] = decision


def delete_session(session_id: str) -> bool:
    """Delete a session and its associated data."""
    if session_id not in _sessions:
        return False
    del _sessions[session_id]
    _image_store.pop(session_id, None)
    _override_store.pop(session_id, None)
    return True
