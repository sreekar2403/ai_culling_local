"""Ollama Photo Culler - FastAPI Backend Server.

A local, privacy-first AI photo culling web app that uses
Ollama vision models to analyze, rate, and cull photos.
"""

from __future__ import annotations

from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes import (
    hardware,
    sessions,
    images,
    analysis,
    export,
    ollama_status,
)

app = FastAPI(
    title="Ollama Photo Culler",
    description="Local AI photo culling powered by Ollama vision models.",
    version="1.0.0",
)

import argparse

if __name__ == "__main__":
    import uvicorn
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8001)
    args = parser.parse_args()
    uvicorn.run("main:app", host="127.0.0.1", port=args.port, reload=True)

# CORS — allow frontend dev server to access API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(hardware.router)
app.include_router(sessions.router)
app.include_router(images.router)
app.include_router(analysis.router)
app.include_router(export.router)
app.include_router(ollama_status.router)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": "Ollama Photo Culler", "version": "1.0.0"}


@app.on_event("startup")
async def startup():
    """Create necessary directories on startup."""
    Path("exports").mkdir(exist_ok=True)
    Path("thumbs").mkdir(exist_ok=True)
