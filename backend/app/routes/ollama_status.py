"""Ollama status and model listing API routes."""

from fastapi import APIRouter

from ..services import ollama as ollama_service

router = APIRouter(prefix="/api/ollama", tags=["ollama"])


@router.get("/status")
async def ollama_status():
    """Check if Ollama server is running."""
    running = await ollama_service.check_ollama_running()
    return {"running": running}


@router.get("/models")
async def list_models():
    """List available Ollama models."""
    models = await ollama_service.list_models()
    return {"models": models}
