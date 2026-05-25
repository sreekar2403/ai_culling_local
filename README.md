# Ollama Photo Culler

**Local, privacy-first AI photo culling powered by Ollama vision models.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.12+-blue)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-green)](https://fastapi.tiangolo.com)

Ollama Photo Culler uses local vision models (LLaVA, minicpm-v, moondream) to automatically analyze, rate, and cull thousands of photos — **all on your machine, zero cloud uploads, no subscriptions.**

## 🚀 Features

- **AI-Powered Culling** — Scores photos on sharpness, exposure, blur, and composition using Ollama vision models
- **Batch Photo Loading** — Load thousands of images via drag-and-drop or folder path (JPEG, PNG, TIFF supported)
- **Hardware-Aware Recommendations** — Auto-detects your CPU, GPU, and RAM to recommend the optimal model
- **Full Privacy** — Zero images ever leave your machine. Everything runs locally through Ollama
- **Manual Override** — Review images in full-screen, override AI decisions with one click or keyboard shortcut
- **Flexible Export** — Export selections as TXT, CSV, or JSON — compatible with Lightroom, Capture One, and more
- **Keyboard-First Workflow** — Navigate, accept, and reject without touching the mouse

## 📋 Requirements

- **Node.js** 18+ (for the frontend)
- **Python** 3.12+ (for the backend)
- **Ollama** installed and running ([ollama.ai](https://ollama.ai))
- At least **8 GB RAM** (16 GB recommended)
- **NVIDIA GPU** with 4+ GB VRAM recommended for best performance (CPU-only works but is slower)

## 🛠️ Quick Start

### 1. Install Ollama and pull a vision model

```bash
# Install Ollama from https://ollama.ai
# Then pull a vision model:
ollama pull llava:7b-q4
# Or for smaller/CPU-friendly:
ollama pull moondream:latest
```

### 2. Start the backend

```bash
cd backend
uv sync        # Install Python dependencies
uv run uvicorn main:app --reload --port 8001
```

### 3. Start the frontend

```bash
cd frontend
npm install    # Install Node.js dependencies
npm run dev    # Start dev server at http://localhost:3000
```

### 4. Open the app

Navigate to **http://localhost:3000** and start culling!

## 🏗️ Project Structure

```
ollama-photo-culler/
├── frontend/              # Next.js 15 web app
│   ├── src/
│   │   ├── app/          # Pages (landing, dashboard, session, settings)
│   │   ├── components/   # UI components (card, button, export, layout)
│   │   ├── lib/          # Utilities and API client
│   │   ├── store/        # Zustand state management
│   │   └── types/        # TypeScript type definitions
│   └── ...
├── backend/               # FastAPI Python backend
│   ├── app/
│   │   ├── routes/       # API route handlers
│   │   ├── services/     # Business logic (hardware, ollama, images, analysis, export)
│   │   └── models/       # Pydantic schemas
│   └── main.py           # FastAPI app entry point
├── docs/                  # Documentation
├── package.json           # Root workspace config
└── README.md
```

## 🎯 How It Works

1. **Create a session** — Start a new culling session from the dashboard
2. **Load photos** — Point the app to a folder or drag-and-drop files
3. **Analyze with AI** — Click "Analyze" to run Ollama vision models on each photo
4. **Review & override** — Browse the thumbnail grid, open full-screen previews, and override AI decisions
5. **Export** — Download your cull results as TXT, CSV, or JSON

## 🧠 Supported Models

| Model | Parameter Size | Speed | RAM | VRAM | Recommendation |
|-------|---------------|-------|-----|------|---------------|
| moondream:latest | 1.6B | ⚡ Fast | 4 GB | 0 GB | CPU-friendly |
| minicpm-v:latest | 2.7B | ⚡ Fast | 6 GB | 2 GB | Laptop with GPU |
| llava:7b-q4 | 7B | 🟡 Medium | 8 GB | 4 GB | **Best balance** |
| llava:13b-q4 | 13B | 🐢 Slow | 16 GB | 8 GB | High-end GPU |

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Ollama](https://ollama.ai) for making local LLMs accessible
- [LLaVA](https://llava-vl.github.io/), [minicpm-v](https://github.com/OpenBMB/MiniCPM-V), and [moondream](https://moondream.ai/) for vision models
- The open-source photography community

## ⚠️ Disclaimer

This tool is an AI assistant for photo culling — final creative decisions should always be made by a human. The AI scores are suggestions, not verdicts.
