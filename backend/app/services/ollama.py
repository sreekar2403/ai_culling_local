"""Ollama API integration service.

Handles communication with the local Ollama server to:
- Check server availability
- List available models
- Send images for analysis with prompt
"""

from __future__ import annotations

import json
import time
from typing import Optional
import httpx

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_TIMEOUT = 120  # seconds per image analysis


async def check_ollama_running() -> bool:
    """Check if Ollama server is available."""
    try:
        async with httpx.AsyncClient(timeout=5) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            return resp.status_code == 200
    except Exception:
        return False


async def list_models() -> list[dict]:
    """List available Ollama models."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{OLLAMA_BASE_URL}/api/tags")
            if resp.status_code == 200:
                data = resp.json()
                return data.get("models", [])
    except Exception:
        pass
    return []


async def analyze_image(
    image_data: bytes,
    prompt: str = "",
    model: str = "llava:7b-q4",
) -> Optional[dict]:
    """Send an image to Ollama vision model for analysis.

    Args:
        image_data: Raw image bytes (JPEG preferred, resized to max 768px)
        prompt: Text prompt describing what to evaluate
        model: Ollama model tag

    Returns:
        Parsed JSON response or None on failure
    """
    if not prompt:
        prompt = (
            "Rate this photo's technical quality from 0-100. "
            "Consider sharpness, exposure, blur, composition. "
            "If people are present, note whether eyes appear open. "
            "Return only valid JSON with keys: score (int 0-100), "
            "reasons (array of strings explaining the score). "
            "Example: {\"score\": 85, \"reasons\": [\"Sharp focus\", \"Good exposure\"]}"
        )

    full_prompt = f"{prompt}\n\nRespond ONLY with valid JSON. No other text."

    payload = {
        "model": model,
        "prompt": full_prompt,
        "stream": False,
        "images": [image_data.hex()],
        "options": {
            "temperature": 0.1,  # Low temperature for consistent scoring
        },
    }

    try:
        async with httpx.AsyncClient(timeout=DEFAULT_TIMEOUT) as client:
            start = time.time()
            resp = await client.post(
                f"{OLLAMA_BASE_URL}/api/generate",
                json=payload,
            )
            elapsed = time.time() - start

            if resp.status_code != 200:
                return None

            result = resp.json()
            response_text = result.get("response", "")

            # Try to parse JSON from response
            parsed = _parse_json_response(response_text)
            if parsed:
                parsed["_elapsed_s"] = round(elapsed, 2)
                return parsed

            # Fallback: create structured response from raw text
            return {
                "score": 50,
                "reasons": [f"Raw response: {response_text[:200]}"],
                "_elapsed_s": round(elapsed, 2),
                "_parse_failed": True,
            }

    except httpx.TimeoutException:
        return None
    except Exception:
        return None


def _parse_json_response(text: str) -> Optional[dict]:
    """Extract JSON from model response text.

    Handles cases where the model wraps JSON in markdown or adds extra text.
    """
    # Try to find JSON block in markdown
    if "```json" in text:
        text = text.split("```json")[1]
        if "```" in text:
            text = text.split("```")[0]
    elif "```" in text:
        text = text.split("```")[1]
        if "```" in text:
            text = text.split("```")[0]

    text = text.strip()

    # Find first { and last }
    start = text.find("{")
    end = text.rfind("}")
    if start >= 0 and end > start:
        text = text[start : end + 1]

    try:
        data = json.loads(text)
        if isinstance(data, dict):
            return data
    except json.JSONDecodeError:
        pass

    return None
