"""Hardware detection service.

Detects CPU, GPU, RAM, and platform information to recommend
optimal Ollama vision models for the user's machine.
"""

from __future__ import annotations

import platform
import subprocess
import sys
from typing import Optional

import psutil

from ..models.schemas import HardwareInfo, ModelRecommendation


def detect_hardware() -> HardwareInfo:
    """Detect hardware specifications of the current machine."""
    system = platform.system().lower()

    cpu = _get_cpu_info()
    ram_gb = round(psutil.virtual_memory().total / (1024 ** 3), 1)
    gpu = _get_gpu_info(system)
    vram_gb = _get_vram_info(system)

    return HardwareInfo(
        cpu=cpu,
        ram_gb=ram_gb,
        gpu=gpu,
        vram_gb=vram_gb,
        platform=sys.platform,
    )


def recommend_model(hardware: HardwareInfo) -> ModelRecommendation:
    """Recommend the best Ollama vision model based on hardware specs."""
    # Model profiles: name, min_ram, min_vram, speed_rating
    models = [
        ModelRecommendation(
            model_name="moondream:latest",
            parameter_size="1.6B",
            quantization="q4_0",
            min_ram_gb=4,
            min_vram_gb=0,
            speed_rating="fast",
        ),
        ModelRecommendation(
            model_name="minicpm-v:latest",
            parameter_size="2.7B",
            quantization="q4_0",
            min_ram_gb=6,
            min_vram_gb=2,
            speed_rating="fast",
        ),
        ModelRecommendation(
            model_name="llava:7b-q4",
            parameter_size="7B",
            quantization="q4_0",
            min_ram_gb=8,
            min_vram_gb=4,
            speed_rating="medium",
        ),
        ModelRecommendation(
            model_name="llava:13b-q4",
            parameter_size="13B",
            quantization="q4_0",
            min_ram_gb=16,
            min_vram_gb=8,
            speed_rating="slow",
        ),
    ]

    # Filter compatible models and pick the best one
    compatible = []
    for m in models:
        if hardware.ram_gb >= m.min_ram_gb:
            if m.min_vram_gb == 0:
                compatible.append(m)
            elif hardware.vram_gb and hardware.vram_gb >= m.min_vram_gb:
                compatible.append(m)
            elif hardware.vram_gb is None:
                # Can't determine VRAM - assume compatible with warning
                m.reason = "GPU VRAM unknown; may run slowly on CPU"
                compatible.append(m)

    if not compatible:
        return ModelRecommendation(
            model_name="moondream:latest",
            parameter_size="1.6B",
            quantization="q4_0",
            min_ram_gb=4,
            min_vram_gb=0,
            speed_rating="fast",
            is_compatible=True,
            reason="Fallback: minimal requirement model",
        )

    # Pick fastest compatible model
    speed_order = {"fast": 0, "medium": 1, "slow": 2}
    compatible.sort(key=lambda m: speed_order.get(m.speed_rating, 99))
    return compatible[0]


def _get_cpu_info() -> str:
    """Get CPU model name."""
    system = platform.system().lower()

    try:
        if system == "windows":
            output = subprocess.check_output(
                ["wmic", "cpu", "get", "name"],
                shell=True,
                text=True,
                timeout=5,
            )
            lines = output.strip().split("\n")
            for line in lines:
                line = line.strip()
                if line and "Name" not in line:
                    return line
        elif system == "linux":
            output = subprocess.check_output(
                ["cat", "/proc/cpuinfo"], text=True, timeout=5
            )
            for line in output.split("\n"):
                if line.startswith("model name"):
                    return line.split(":")[1].strip()
        elif system == "darwin":
            output = subprocess.check_output(
                ["sysctl", "-n", "machdep.cpu.brand_string"],
                text=True,
                timeout=5,
            )
            return output.strip()
    except Exception:
        pass

    return f"{platform.processor()} ({platform.machine()})"


def _get_gpu_info(system: str) -> Optional[str]:
    """Get GPU model name."""
    try:
        # Try NVIDIA first
        output = subprocess.check_output(
            ["nvidia-smi", "--query-gpu=name", "--format=csv,noheader"],
            text=True,
            timeout=10,
        )
        gpu = output.strip().split("\n")[0]
        if gpu and "NVIDIA" in gpu:
            return gpu
    except Exception:
        pass

    if system == "darwin":
        try:
            output = subprocess.check_output(
                ["system_profiler", "SPDisplaysDataType"],
                text=True,
                timeout=10,
            )
            for line in output.split("\n"):
                line = line.strip()
                if "Chipset Model" in line:
                    return line.split(":")[1].strip()
        except Exception:
            pass

    return None


def _get_vram_info(system: str) -> Optional[float]:
    """Get VRAM in GB."""
    try:
        output = subprocess.check_output(
            [
                "nvidia-smi",
                "--query-gpu=memory.total",
                "--format=csv,noheader,nounits",
            ],
            text=True,
            timeout=10,
        )
        vram_mib = float(output.strip().split("\n")[0])
        return round(vram_mib / 1024, 1)
    except Exception:
        pass
    return None
