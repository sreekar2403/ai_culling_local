"""Image scanning and processing service.

Handles loading images from the filesystem, validating formats,
generating thumbnails, and serving image data for analysis.
"""

from __future__ import annotations

import io
import os
import uuid
from pathlib import Path
from typing import Optional

from PIL import Image, ImageOps

from ..models.schemas import ImageResult, Decision, ImageDimensions

SUPPORTED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".tiff", ".tif",
    ".bmp", ".webp",
    # RAW formats (best-effort via Pillow)
    ".dng", ".cr2", ".nef", ".arw", ".orf", ".raf",
}

THUMBNAIL_SIZE = (300, 300)
ANALYSIS_SIZE = (768, 768)


def is_supported(filename: str) -> bool:
    """Check if file extension is supported."""
    ext = Path(filename).suffix.lower()
    return ext in SUPPORTED_EXTENSIONS


def scan_directory(directory: str) -> list[Path]:
    """Scan a directory for supported image files, non-recursive."""
    path = Path(directory)
    if not path.exists() or not path.is_dir():
        return []

    files = []
    for entry in path.iterdir():
        if entry.is_file() and is_supported(entry.name):
            files.append(entry)

    return sorted(files, key=lambda p: p.name)


def make_image_result(filepath: Path) -> ImageResult:
    """Create an ImageResult from a file path."""
    stat = filepath.stat()
    dims = _get_dimensions(filepath)

    return ImageResult(
        id=str(uuid.uuid4()),
        path=str(filepath.absolute()),
        filename=filepath.name,
        extension=filepath.suffix.lower(),
        file_size_bytes=stat.st_size,
        dimensions=dims,
        score=None,
        score_reasons=[],
        ai_decision=Decision.uncertain,
        human_decision=None,
    )


def resize_for_analysis(image_bytes: bytes, max_size: int = ANALYSIS_SIZE[0]) -> Optional[bytes]:
    """Resize image to max dimension for Ollama analysis."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)  # Correct orientation
        img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=85)
        return buf.getvalue()
    except Exception:
        return None


def generate_thumbnail(image_bytes: bytes, size: tuple[int, int] = THUMBNAIL_SIZE) -> Optional[bytes]:
    """Generate a thumbnail JPEG from image bytes."""
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = ImageOps.exif_transpose(img)
        img.thumbnail(size, Image.Resampling.LANCZOS)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=75)
        return buf.getvalue()
    except Exception:
        return None


def read_image_bytes(filepath: str) -> Optional[bytes]:
    """Read raw image bytes from disk."""
    try:
        with open(filepath, "rb") as f:
            return f.read()
    except Exception:
        return None


def _get_dimensions(filepath: Path) -> Optional[ImageDimensions]:
    """Get image dimensions without loading full image."""
    try:
        with Image.open(filepath) as img:
            return ImageDimensions(width=img.width, height=img.height)
    except Exception:
        return None
