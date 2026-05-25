# Contributing to Ollama Photo Culler

Thanks for your interest in contributing! This project is open-source and community-driven.

## Project Focus

Ollama Photo Culler aims to be the default open-source photo culling tool for photographers who value privacy, speed, and zero subscription costs.

## Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.12+ and uv
- Ollama installed and running

### Getting Started

```bash
# Clone the repo
git clone https://github.com/yourusername/ollama-photo-culler.git
cd ollama-photo-culler

# Backend setup
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000

# Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

## How to Contribute

### 🐛 Reporting Bugs

1. Check if the bug has already been reported in Issues
2. Include steps to reproduce, expected behavior, and actual behavior
3. Include your OS, hardware specs, Ollama version, and browser
4. Attach screenshots if relevant

### 💡 Feature Requests

1. Check existing Issues and Discussions first
2. Describe the problem you're solving, not just the solution
3. Explain how it fits the project's focus (local, private, zero-cost)

### 🔧 Pull Requests

1. Fork the repo and create a branch from `main`
2. Follow the existing code style (TypeScript strict for frontend, typed Python for backend)
3. Add or update tests as needed
4. Ensure both frontend and backend build/run without errors
5. Update documentation if changing behavior
6. Create a PR with a clear description of changes

### Code Style

- Frontend: TypeScript strict mode, ESLint + Prettier
- Backend: Python type hints, ruff formatting
- Commits: Conventional commits (feat:, fix:, docs:, refactor:, etc.)

## Project Structure

See README.md for the full project structure.

## Community

- **Issues**: Bug reports and feature requests
- **Discussions**: Questions, ideas, and community support
- **Pull Requests**: Code contributions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
