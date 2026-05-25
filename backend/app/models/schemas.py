"""Pydantic schemas for the Ollama Photo Culler API."""

from __future__ import annotations

from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field


class Decision(str, Enum):
    accept = "accept"
    reject = "reject"
    uncertain = "uncertain"


class AnalysisStatus(str, Enum):
    pending = "pending"
    scanning = "scanning"
    analyzing = "analyzing"
    complete = "complete"
    error = "error"


# --- Hardware ---

class HardwareInfo(BaseModel):
    cpu: str
    ram_gb: float
    gpu: Optional[str] = None
    vram_gb: Optional[float] = None
    platform: str


class ModelRecommendation(BaseModel):
    model_name: str
    parameter_size: str
    quantization: str
    min_ram_gb: float
    min_vram_gb: float
    speed_rating: str = "medium"
    is_compatible: bool = True
    reason: Optional[str] = None


# --- Image ---

class ImageDimensions(BaseModel):
    width: int
    height: int


class ImageFile(BaseModel):
    id: str
    path: str
    filename: str
    extension: str
    file_size_bytes: int
    dimensions: Optional[ImageDimensions] = None


class ImageResult(ImageFile):
    score: Optional[float] = None
    score_reasons: list[str] = Field(default_factory=list)
    ai_decision: Decision = Decision.uncertain
    human_decision: Optional[Decision] = None


# --- Session ---

class AnalysisSession(BaseModel):
    id: str
    created_at: str
    total_images: int = 0
    model_used: str = ""
    analysis_duration_ms: Optional[int] = None
    threshold: dict = Field(default_factory=lambda: {"accept": 70, "reject": 40})
    status: AnalysisStatus = AnalysisStatus.pending
    error: Optional[str] = None


class CreateSessionResponse(BaseModel):
    session: AnalysisSession


class LoadFilesRequest(BaseModel):
    path: Optional[str] = None


class LoadFilesResponse(BaseModel):
    session: AnalysisSession
    images: list[ImageResult]


class AnalyzeRequest(BaseModel):
    model: Optional[str] = None


class AnalyzeResponse(BaseModel):
    session: AnalysisSession


class OverrideRequest(BaseModel):
    image_id: str
    decision: Decision


class ExportRequest(BaseModel):
    format: str = "txt"  # txt, csv, json
    include_rejected: bool = False
    include_scores: bool = True


class ExportResponse(BaseModel):
    download_url: str
    filename: str
