"""Hardware detection API routes."""

from fastapi import APIRouter

from ..models.schemas import HardwareInfo, ModelRecommendation
from ..services.hardware import detect_hardware, recommend_model

router = APIRouter(prefix="/api/hardware", tags=["hardware"])


@router.get("", response_model=HardwareInfo)
async def get_hardware():
    """Detect and return hardware specifications."""
    return detect_hardware()


@router.get("/recommend-model", response_model=ModelRecommendation)
async def get_model_recommendation():
    """Recommend the best Ollama model for this machine."""
    hw = detect_hardware()
    return recommend_model(hw)
