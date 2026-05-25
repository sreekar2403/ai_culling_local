# Ollama Photo Culler — Product Brief

**Market Analysis · Feasibility Study · Product Requirements Document**

## TL;DR Executive Summary

Ollama Photo Culler is a **local-first, privacy-preserving AI photo culling web app** that uses Ollama vision models to analyze, rate, and cull thousands of photos. Users upload images or provide a local directory path; the app runs on-device LLM vision models (LLaVA, minicpm-v, moondream, etc.) to detect blur, closed eyes, duplicates, and composition quality. It outputs a curated selection set (e.g., TXT/CSV/JSON with filenames). A built-in hardware profiler detects CPU/GPU specs and recommends the optimal Ollama model for the machine. Market: professional photographers, event shooters, and prosumers who cull 500–5,000+ images per shoot. Feasibility: **HIGH** — all core tech is mature and free/open-source. Top risks: vision model latency on CPU-only machines, RAW format support complexity, and competing with incumbents like Aftershoot and Narrative Select on AI accuracy.

---

## Table of Contents

1. [Problem Statement](#1-problem-statement)
2. [Market Analysis](#2-market-analysis)
3. [User Personas](#3-user-personas)
4. [Competitive Landscape](#4-competitive-landscape)
5. [Feasibility Analysis](#5-feasibility-analysis)
6. [Product Requirements Document](#6-product-requirements-document)
7. [Risk Register](#7-risk-register)
8. [Roadmap](#8-roadmap)
9. [Appendix](#appendix)

---

## 1. Problem Statement

Professional photographers and serious hobbyists routinely shoot 1,000–5,000+ images per event (weddings, sports, corporate shoots). Culling — selecting the best shots and discarding technical failures — is the most time-consuming and mentally draining part of post-production. Existing AI culling tools (Aftershoot, Narrative Select, Optyx) are cloud-dependent or subscription-based, meaning photographers pay recurring fees, upload images to third-party servers, and lose privacy. There is no **free, local-only, privacy-first** photo culling tool that leverages open-source LLM vision models running on the user's own hardware. Meanwhile, Ollama has made running local vision models trivial, but no purpose-built culling app wraps this capability with a photographer-friendly UI.

### How Might We...

- HMW let photographers cull 5,000 images in minutes without uploading to any cloud?
- HMW auto-detect the user's CPU/GPU and recommend the best Ollama vision model for their machine?
- HMW combine multiple quality signals (blur, exposure, eye openness, composition) into a single select/reject score?
- HMW make local AI fast enough on consumer hardware that it beats manual culling speed?
- HMW export the cull results into formats that feed directly into Lightroom, Capture One, or Photo Mechanic?

> ⚠️ **Assumption:** Ollama vision models can perform reliable image quality assessment (blur, exposure, eye detection) for culling purposes. This has not been benchmarked specifically for photography culling.
>
> ⚠️ **Assumption:** Users are willing to install Ollama and pull vision models (5–15 GB) on their local machine.
>
> ⚠️ **Assumption:** The target user has at least 8 GB RAM and preferably an NVIDIA GPU with 4 GB+ VRAM.

---

## 2. Market Analysis

The photography studio software market (which includes culling/post-production tools) is growing rapidly:

| Metric | Value | Source |
|--------|-------|--------|
| **TAM** | $2.84B by 2034 (Photography Studio Software) | Fortune Business Insights |
| **SAM** | ~$500M (AI photo editing & culling segment) | Derived estimate |
| **SOM** (3–5yr) | $5–15M (free + optional donation/support model) | Conservative niche capture |
| **CAGR** | 14.72% (2026–2034) | Fortune Business Insights |
| **Professional photographers worldwide** | ~700,000+ (US: ~160,000) | BLS, various |
| **Total addressable users (prosumer+pro)** | ~5–10M globally | Estimated |

### Key Market Drivers

- **AI adoption in photography** — AI culling is moving from novelty to standard practice; Aftershoot reported 300%+ growth in 2023–2024
- **Privacy consciousness** — Post-Snowden and GDPR era, photographers increasingly want local-first tools; high-profile cloud leaks have sensitized the market
- **Ollama ecosystem momentum** — 1M+ downloads, thriving open-source model ecosystem, vision model quality improving rapidly
- **Subscription fatigue** — Average photographer pays $40–80/mo across Aftershoot + Lightroom + storage; a free local alternative is compelling
- **Prosumer camera market growth** — Mirrorless cameras with high burst rates (20–30 fps) generate more photos per shoot than ever before

### Key Market Inhibitors

- **GPU requirements** — Only ~30–40% of photographers have a discrete NVIDIA GPU; Apple Silicon and AMD GPU support via Ollama varies
- **Model accuracy gap** — Proprietary cloud models (Aftershoot's) are still more accurate than open-source vision models for photography-specific quality assessment
- **Ecosystem lock-in** — Aftershoot's tight Lightroom integration and "learning from your edits" creates switching costs
- **RAW file complexity** — Most pro cameras shoot RAW (CR3, NEF, ARW, etc.); decoding these locally is non-trivial

### Timing Rationale

**NOW is the right time.** Ollama vision models (LLaVA 1.6, minicpm-v, moondream) reached production-quality image understanding in 2024–2025. Ollama's API makes it trivial to integrate from any web app. Photographers are actively seeking alternatives to rising subscription costs. No existing open-source project specifically targets standalone AI photo culling with Ollama. A 6–8 week MVP can capture first-mover mindshare in this niche.

---

## 3. User Personas

### Persona 1: The Wedding & Event Photographer

- **Demographics:** 28–45, full-time professional, shoots 20–40 weddings/year + engagements, uses Lightroom Classic + Aftershoot, has a PC with NVIDIA RTX 3060–4090
- **Goals:** Cull 3,000–8,000 wedding photos in under 1 hour. Deliver within 2 weeks. Minimize tedious screen time.
- **Pain Points:** "I pay $40/mo for Aftershoot and still have to review every pick." Uploading to cloud feels slow and insecure. Wants more control.
- **Current Workarounds:** Aftershoot for initial pass, then manual review in Photo Mechanic. Some still cull manually with star ratings.
- **Willingness to Pay:** Currently paying $40/mo for Aftershoot + $10/mo for backup tools. Would try free local alternative; might pay $50–100 one-time for premium features.
- **Key Quote:** "I spend 3 hours culling after every wedding. That's 120 hours a year I'll never get back."

### Persona 2: The Prosumer / Advanced Hobbyist

- **Demographics:** 22–40, semi-pro or serious hobbyist, shoots landscapes/travel/portraits, uses Lightroom or Capture One, has a mid-range laptop (8–16 GB RAM, integrated GPU or GTX 1650)
- **Goals:** Cull 500–2,000 images from a trip efficiently. Wants AI help but won't pay $40/mo for occasional use.
- **Pain Points:** "I shoot 2,000 photos on vacation and never cull them — they just sit on my hard drive." Cloud tools are overkill and expensive for occasional use.
- **Current Workarounds:** Manual 1–5 star rating in Lightroom, or just keeps everything (cluttered library).
- **Willingness to Pay:** $0–$20 one-time. Would donate if they love it.
- **Key Quote:** "I don't shoot enough to justify another subscription. But I'd love an AI to do the boring part."

### Persona 3: The Studio Manager / Photo Editor (B2B)

- **Demographics:** 30–55, manages 2–15 photographers at a studio (school portraits, real estate, commercial), needs batch processing and consistent quality control
- **Goals:** Standardize culling across multiple photographers. Process 10,000–50,000 images/week.
- **Pain Points:** "Every photographer has different standards. I need consistent culling rules." Cloud upload for bulk images is impractical. Needs local processing.
- **Current Workarounds:** Custom scripts + manual QA team. Expensive human labor.
- **Willingness to Pay:** $100–500/mo or enterprise license for bulk processing + priority support.
- **Key Quote:** "I need to process 20,000 school portraits a week. If this tool runs locally and handles batches, I'll pay."

### Jobs-to-be-Done Summary

> **JTBD 1:** "When I finish a shoot with thousands of images, I want to quickly separate the technically good photos from the bad, so I only spend my creative energy on the shots worth editing."
>
> **JTBD 2:** "When I buy a new computer or want to try local AI culling, I want to know which model will run best on my hardware, so I don't waste hours downloading 15 GB models that won't work."
>
> **JTBD 3:** "When I need to hand off selected images to my editing workflow, I want a clean export file (TXT/CSV/JSON/xmp), so I can import the selection into Lightroom or Capture One without extra steps."

---

## 4. Competitive Landscape

### Competitor Matrix

| Company | Type | Key Strengths | Key Weaknesses | Pricing | Funding/Backing |
|---------|------|--------------|----------------|---------|-----------------|
| **Aftershoot** | Direct (AI culling) | Best AI accuracy, learns from feedback, Lightroom integration, culling + editing + retouching | Cloud upload required, expensive ($10–48/mo), no local model option | $10–48/mo | VC-backed (undisclosed) |
| **Narrative Select** | Direct (AI culling) | Assisted AI (you decide), fast desktop app, good UX, learning capability | Still cloud-reliant for AI, $10–20/mo, no local processing | $10–20/mo | VC-backed |
| **Photo Mechanic** | Indirect (manual culling) | Blazing-fast manual culling, metadata editing, industry standard | No AI, steep learning curve, perpetual license $299 | $14.99/mo or $299 one-time | Camera Bits (bootstrapped) |
| **Optyx** | Direct (AI culling) | Auto-culling, duplicate detection, standalone or Lightroom plugin | Cloud-dependent, smaller user base, limited features | ~$10/mo | Startup |
| **Adobe Lightroom (Assisted Culling)** | Indirect (AI partial) | Built into existing workflow, "Powered by Adobe Sensei" | Very basic AI (blur/eye detection only), limited, requires Creative Cloud sub | $10–55/mo (Creative Cloud) | Adobe (public, ~$200B) |
| **Imagen Culling Studio** | Direct (AI culling) | Professional-grade, integrates with Lightroom | Cloud upload, expensive, enterprise-focused | Custom pricing | VC-backed |
| **DigiKam** | Indirect (OSS) | Free, open-source, runs locally, batch processing | No AI culling, dated UI, poor UX for pros | Free | FOSS community |
| **FastRawViewer** | Indirect (manual) | Fast raw viewer, exposure/saturation heatmaps, 1:1 pixel inspection | No AI culling, manual only, $30 one-time | $30 one-time | Independent dev |

### Competitive Positioning Map

```
                    HIGH Capability / AI
                         │
                         │
     Aftershoot ●        │        ● Imagen
     Narrative ●         │
                         │
                         │
    ─────────────────────┼─────────────────── HIGH Price
            LOW Price    │
                         │
         ● Ollama Culler │
         (proposed)      │
                         │
           ● DigiKam     │        ● Photo Mechanic
           ● FastRawView │
                         │
                    LOWER Capability / Manual
```

**Our position:** We sit at the intersection of **free/local** and **AI-powered** — a quadrant no existing product occupies. We trade some AI accuracy (vs. Aftershoot) for zero cost, zero cloud upload, and full privacy.

### Differentiation Opportunity

**White space:** No open-source or free product offers local AI photo culling with a polished web UI. There are:
- No Ollama-based photo culling apps (exists as a gap)
- No tools that auto-suggest models based on hardware detection
- No free offline culling tools with modern UX

**Moat strategy:**
- **First-mover in Ollama culling niche** — blog posts, tutorial videos, community templates
- **Hardware-optimized model profiles** — unique value: "recommend the right model for your GPU"
- **Plugin/data format support** — export to XMP sidecars, CSV, TXT, direct Lightroom catalog integration
- **Community model fine-tunes** — if users can fine-tune a culling-specific model on their own data, switching costs increase

---

## 5. Feasibility Analysis

### 5a. Technical Feasibility

**Core components:**
- **Frontend:** Next.js web app with drag-and-drop image upload, folder browser (OS file dialog), thumbnail grid, accept/reject UI
- **Backend API:** FastAPI or Next.js API routes — handles image analysis requests, communicates with Ollama API
- **Ollama integration:** REST API calls to local Ollama instance (`/api/generate`, `/api/tags`, `/api/show`)
- **Hardware profiler:** OS-level CPU/GPU detection (via `nvidia-smi`, `wmic`, `sysctl`) to recommend optimal model
- **Image decoder:** Sharp (Node.js) or Pillow (Python) for decoding RAW/JPEG/etc. and resizing for model input
- **Export formats:** Plain text, CSV, JSON, XMP sidecar, Lightroom catalog bridge

**Build vs. Buy vs. Partner:**
- Ollama integration: **Build** (simple REST calls)
- Hardware detection: **Build** (shell commands + lookup table of model requirements)
- Image quality assessment models: **Buy/Integrate** (use existing Ollama vision models — free)
- RAW decoding: **Buy** (LibRaw via sharp or dcraw binary — free/open-source)
- UI framework: **Build** (Next.js + Tailwind — no licensing cost)

**Key technical risks:**

| Risk | Severity | Mitigation |
|------|----------|------------|
| Vision model latency too slow on CPU | **HIGH** | Pre-compute thumbnails, support GPU acceleration, batch requests, quantized models (Q4) |
| RAW format support gaps | **MEDIUM** | Use Sharp (supports major RAW via LibRaw + updated version), clearly document supported formats |
| Ollama not installed / not running | **MEDIUM** | First-run wizard with install guide, detect Ollama status, auto-start approach |
| Cross-platform GPU detection | **LOW** | Separate detection per OS (nvidia-smi for Windows/Linux, Metal for macOS) |
| Model accuracy for culling | **MEDIUM** | Build fallback "manual mode," allow threshold tuning, iteratively improve prompts |

**Estimated team:** 1–2 full-stack developers (Next.js + Python), 1 ML engineer (prompt engineering, model tuning), 1 UI/UX designer (part-time)

**Time-to-MVP:** **6–8 weeks** (core culling + hardware profiler + basic export)

### 5b. Commercial Feasibility

**Revenue model options:**
- **Open-source core + donation** (GitHub Sponsors, Open Collective)
- **Freemium SaaS tier** (cloud AI processing for users without GPU — optional paid tier)
- **One-time "Pro" license** ($50–100 for advanced features: bulk export, custom prompts, XMP integration)
- **Enterprise** ($500–5,000/yr for studio multi-seat, custom integrations, priority support)

**Recommended primary model:** Open-source core (MIT/GPL) + **optional Pro features** one-time purchase. Rationale: the core tool must be free to drive adoption. Monetize via power-user features and enterprise support.

**Unit economics (Pro tier @ $79 one-time):**
- Estimated CAC: $2–5 (organic via GitHub/write-ups)
- Estimated LTV: $79 (one-time) or $150–300 (if enterprise add-on)
- LTV:CAC: 15:1+ (healthy for open-source-derived product)
- Payback: immediate for one-time purchase

**Path to profitability:** Break-even at ~500 Pro licenses ($39,500) + 2 enterprise deals ($10,000). Achievable in year 1 with minimal overhead. This is a **lifestyle-business-scale** opportunity, not VC-scale.

### 5c. Operational Feasibility

- **Support:** GitHub Issues + Discord community initially
- **Compliance:** No GDPR/HIPAA concerns since processing is local (no data leaves user machine)
- **Distribution:** GitHub releases + Homebrew (macOS) + winget/choco (Windows)
- **Partnerships:** Optional Ollama sponsorship/partnership for cross-promotion
- **Documentation:** Tutorials for wedding photographers + YouTube walkthroughs

### 5d. Feasibility Verdict

🟢 **HIGH** — Overall feasibility is strong.

The core technology stack is fully open-source and mature. The MVP can be built by a small team in under 2 months. The market gap is real and validated by Reddit threads, blog comments, and the sheer popularity of Ollama vision models. The main risk is inference speed on lower-end hardware, but this can be mitigated with quantized models and batch processing. No regulatory hurdles, no proprietary dependencies, and a clear path to monetization through pro features.

---

## 6. Product Requirements Document

### 6.1 Overview

| Field | Value |
|-------|-------|
| **Product Name** | Ollama Photo Culler (OPC) |
| **Version** | v1.0 (MVP) |
| **Author** | Sisyphus (AI Architect PM) |
| **Date** | May 24, 2026 |
| **Status** | Draft |
| **One-liner** | A local, privacy-first web app that uses Ollama vision models to cull thousands of photos in minutes. |
| **Vision** | Become the default open-source photo culling tool for photographers who value privacy, speed, and zero subscription costs — turning any laptop with Ollama into a powerful AI culling workstation. |

### 6.2 Goals & Success Metrics

| Goal | Key Result (KR) | Measurement Method |
|------|-----------------|-------------------|
| **Adoption** | 1,000 GitHub stars + 500 active users in 3 months post-MVP | GitHub stars, download count, telemetry count |
| **Culling accuracy** | ≥80% agreement with professional photographer's manual cull on a 2,000-photo test set | Internal benchmark with 5 volunteer photographers |
| **Culling speed** | Process 1,000 images in ≤10 minutes on a machine with NVIDIA RTX 3060 (12GB VRAM) | Benchmarked CI pipeline |
| **User satisfaction** | NPS ≥40 among early users | Survey after first cull session |
| **Privacy** | Zero images ever leave the user's machine | Code audit + published privacy policy |

### 6.3 Non-Goals (v1 Scope Exclusions)

- ❌ **Cloud sync / gallery sharing** — No cloud storage, no client galleries, no online delivery
- ❌ **Photo editing** — No RAW development, no color grading, no retouching
- ❌ **AI model training/fine-tuning** — Users will not train custom models in v1
- ❌ **Mobile app** — Desktop web only (responsive, not native mobile)
- ❌ **Direct Lightroom plugin** — Export to XMP/CSV instead of direct LR integration
- ❌ **Video culling** — Still images only
- ❌ **Batch rename / metadata editing** — Photo Mechanic territory; out of scope

### 6.4 User Stories & Acceptance Criteria

#### P0 (Must-Have)

**US-001: Upload or open folder of images**
As a photographer, I want to either upload images via drag-and-drop or point the app to a local folder path, so I can start culling my latest shoot.

Acceptance Criteria:
- [ ] Given the app is running, when I drag 500 JPEG files onto the browser, then the files appear in the thumbnail grid
- [ ] Given the app is running, when I click "Open Folder" and select a directory, then all supported image files are loaded by path (no file copy)
- [ ] Given unsupported file types in the folder, when the folder is loaded, then unsupported types are silently skipped
- [ ] Given a folder with 10,000 images, when loading, then the UI stays responsive and shows a progress bar

Priority: P0 | Effort: M

---

**US-002: Run AI culling with Ollama**
As a photographer, I want to click "Analyze with AI" and have Ollama vision models score each image for quality, so I can quickly see which images are keepers.

Acceptance Criteria:
- [ ] Given Ollama is running locally, when I click "Analyze", then all images are sent to Ollama vision model for evaluation
- [ ] Given the model returns a quality assessment, then each image gets a score (0–100) and a green/red badge
- [ ] Given 500 images, when analysis completes, then total time is displayed and results are sorted by score
- [ ] Given Ollama is not running, when I click "Analyze", then a clear error message with troubleshooting link is shown

Priority: P0 | Effort: L

---

**US-003: Manual review and override**
As a photographer, I want to browse through images (accept/reject/swipe) and override the AI decisions, because my creative judgment is final.

Acceptance Criteria:
- [ ] Given the analysis is complete, when I click an image, then a full-size preview opens
- [ ] Given the full-size preview, when I press 'A' (accept) or 'R' (reject), then the image is marked accordingly and the next image loads
- [ ] Given I override an AI decision, when I return to the grid view, then my override is visually distinct from AI's default

Priority: P0 | Effort: S

---

**US-004: Export selected images list**
As a photographer, I want to export a list of accepted (and optionally rejected) filenames, so I can import them into my editing workflow.

Acceptance Criteria:
- [ ] Given I've finished culling, when I click "Export", then I can choose between TXT (one filename per line), CSV, or JSON format
- [ ] Given I export as TXT, when I open the file, then each line contains a relative path to an accepted image
- [ ] Given I want rejected images too, when I check "Include rejected" in export settings, then the export includes both lists

Priority: P0 | Effort: S

---

**US-005: Hardware-aware model recommendation**
As a photographer, I want the app to detect my CPU/GPU and recommend the best Ollama vision model for my hardware, so I don't have to research model compatibility myself.

Acceptance Criteria:
- [ ] Given the app starts, when hardware detection runs, then CPU model, RAM, GPU model, and VRAM are displayed
- [ ] Given the detection is complete, when results are analyzed, then a recommended model is shown (e.g., "llava:7b-q4 for your RTX 3060")
- [ ] Given a machine with no GPU, when detection finishes, then a CPU-only model (e.g., "moondream:latest") is recommended with expected speed warning

Priority: P0 | Effort: M

---

#### P1 (Important)

**US-006: Adjust quality thresholds**
As a photographer, I want to adjust sliders for blur tolerance, exposure preference, and duplicate strictness, so the AI matches my personal style.

Priority: P1 | Effort: M

**US-007: Batch culling from terminal**
As a power user, I want to run culling from the command line without the web UI, so I can integrate it into automated pipelines.

Priority: P1 | Effort: L

**US-008: Sidecar XMP export**
As a Lightroom user, I want to export cull decisions as XMP sidecar files, so Lightroom picks up my picks/rejects automatically.

Priority: P1 | Effort: M

**US-009: Keyboard shortcut customization**
As a speed-focused photographer, I want to customize keyboard shortcuts for accept/reject/zoom/next, so I can cull without touching the mouse.

Priority: P1 | Effort: S

---

#### P2 (Nice-to-Have)

**US-010: Before/after comparison (AI vs AI)**
As a curious user, I want to compare scores from two different Ollama vision models on the same image set, so I can see which model works better for my photography.

Priority: P2 | Effort: M

**US-011: Multi-core batch analysis**
As a user with a powerful GPU, I want the app to process images in parallel batches, so culling is 3–5x faster.

Priority: P2 | Effort: L

**US-012: Dark mode**
As a night-owl photographer, I want a dark theme so the app is comfortable to use in dimly lit editing environments.

Priority: P2 | Effort: XS

---

### 6.5 Functional Requirements

**FR-001 [Image Loading]:**
- Inputs: Local file path or drag-and-drop files
- Outputs: In-memory thumbnail collection with original file paths
- Business Rule: Support JPEG, PNG, TIFF. RAW formats (CR3, NEF, ARW, DNG) via Sharp/LibRaw with fallback message for unsupported

**FR-002 [Ollama Integration]:**
- Inputs: Resized image (max 768px on longest edge) + text prompt describing quality criteria
- Outputs: JSON response from Ollama with image description/analysis
- Business Rule: Default prompt: "Rate this photo's technical quality from 0-100. Consider sharpness, exposure, blur, composition, and whether eyes are open (if people present). Return only a JSON: {\"score\": N, \"reasons\": [...]}"

**FR-003 [Hardware Detection]:**
- Inputs: Shell commands (`nvidia-smi`, `wmic cpu get name`, `sysctl -n machdep.cpu.brand_string`, `wmic MemoryChip get Capacity`)
- Outputs: Structured JSON: `{cpu: "...", ram_gb: N, gpu: "...", vram_gb: N, platform: "win32|darwin|linux"}`
- Business Rule: Model recommendation lookup table mapping hardware specs to recommended Ollama model tags

**FR-004 [Scoring & Display]:**
- Inputs: Array of {filename, score, reasons}
- Outputs: Color-coded thumbnail grid (green border = keeper, red = reject, yellow = uncertain)
- Business Rule: Default threshold: ≥70 = accept, 40–69 = borderline review, <40 = auto-reject. User-adjustable.

**FR-005 [Export Engine]:**
- Inputs: Final list of accepted/rejected filenames
- Outputs: TXT (one path per line), CSV (filename, score, status, reasons), JSON (full structured data), XMP sidecar files
- Business Rule: Preserve relative directory structure in exports. Option to copy accepted files to new directory.

### 6.6 Non-Functional Requirements (NFRs)

| Category | Requirement | Metric |
|----------|-------------|--------|
| **Performance** | Image loading | <3s for 500 images (JPEG) |
| **Performance** | AI analysis (single image) | <5s per image (RTX 3060, quantized model) |
| **Performance** | UI responsiveness | 60 fps thumbnail grid scrolling |
| **Availability** | App uptime | Runs fully offline, no external dependencies |
| **Memory** | Max memory usage | <4 GB RAM for 5,000-image catalog |
| **Compatibility** | Ollama versions | Supports Ollama v0.1.x–0.5.x API |
| **Compatibility** | Browsers | Chrome, Firefox, Edge, Safari (latest 2 versions) |
| **Security** | Data locality | Zero network egress of images or analysis data |
| **Usability** | First-run experience | <5 minutes from install to first cull |

### 6.7 System / Architecture Sketch

```
┌──────────────────────────────────────────────────────────────────┐
│                         USER'S MACHINE                            │
│                                                                  │
│  ┌─────────────────────┐        ┌──────────────────────────┐     │
│  │   Web Browser        │        │   Ollama Server            │     │
│  │   (Next.js UI)       │◄──────►│   (localhost:11434)        │     │
│  │                      │  REST  │                            │     │
│  │  - Thumbnail grid    │        │  - LLaVA 1.6 (7B/13B)     │     │
│  │  - Image preview     │        │  - minicpm-v              │     │
│  │  - Accept/Reject UI  │        │  - moondream              │     │
│  │  - Export controls   │        │  - Other vision models     │     │
│  └──────────┬───────────┘        └──────────────────────────┘     │
│             │                                                    │
│             ▼                                                    │
│  ┌─────────────────────────────────────────────────────┐        │
│  │  Backend (Next.js API Routes or Python FastAPI)      │        │
│  │                                                      │        │
│  │  - File system operations                            │        │
│  │  - Image decoding + resizing (Sharp/Pillow)           │        │
│  │  - Ollama API client                                 │        │
│  │  - Prompt construction                               │        │
│  │  - Score aggregation + duplicate detection            │        │
│  │  - Hardware profiler (shell commands)                 │        │
│  │  - Export engine (TXT/CSV/JSON/XMP)                   │        │
│  └──────────────────┬──────────────────────────────────┘        │
│                     │                                            │
│                     ▼                                            │
│  ┌────────────────────────────────────────────────────┐         │
│  │  Local File System                                 │         │
│  │  (User's photo directory)                          │         │
│  └────────────────────────────────────────────────────┘         │
│                                                                  │
│  No data leaves this machine — ever.                             │
└──────────────────────────────────────────────────────────────────┘
```

### 6.8 Data Model (Key Entities)

```
Entity: Image
- path: string (absolute path on disk)
- filename: string
- extension: string
- file_size_bytes: integer
- dimensions: {width, height}
- thumbnail_path: string (cached thumbnail path)
- score: float (0–100, from AI)
- score_reasons: string[] (why the score is what it is)
- human_decision: "accept" | "reject" | "uncertain" | null
- ai_decision: "accept" | "reject" | "uncertain"

Entity: AnalysisSession
- id: string (UUID)
- created_at: timestamp
- total_images: integer
- model_used: string (e.g., "llava:7b-q4")
- analysis_duration_ms: integer
- threshold: {accept: float, reject: float}

Entity: ModelProfile
- model_name: string (Ollama model tag)
- parameter_size: string (e.g., "7B", "13B")
- quantization: string (e.g., "q4_0", "f16")
- min_ram_gb: float
- min_vram_gb: float
- recommended_gpu: string
- speed_rating: "fast" | "medium" | "slow"

Entity: Export
- id: string (UUID)
- session_id: string
- format: "txt" | "csv" | "json" | "xmp"
- created_at: timestamp
- accepted_count: integer
- rejected_count: integer
```

### 6.9 API Surface (High-Level)

**Ollama External API (consumed by app):**
```
GET    /api/tags                        — List available models
POST   /api/generate                     — Generate response from image + prompt
POST   /api/show                         — Show model details (modelfile, params)
```

**App Internal API (Next.js API routes or FastAPI):**
```
POST   /api/session/create               — Create new analysis session
POST   /api/session/:id/load-files       — Load files from path or upload
POST   /api/session/:id/analyze          — Run AI analysis via Ollama
GET    /api/session/:id/results          — Get analysis results
POST   /api/session/:id/override         — Save human override for an image
POST   /api/session/:id/export           — Export results in chosen format
GET    /api/hardware                     — Get CPU/GPU/RAM info
GET    /api/hardware/recommend-model     — Get recommended model for this hardware
```

### 6.10 UX / Design Principles

1. **Speed as a feature** — Every millisecond matters. Thumbnails appear progressively. The analyze button shows a real-time ETA. No spinner-only screens.
2. **Photographer's keyboard-first workflow** — All common actions have keyboard shortcuts. The spacebar = toggle accept/reject. Left/right = navigate. F = fullscreen preview.
3. **AI as assistant, not authority** — AI provides scores and suggestions, but human overrides are visually prominent and easy. The AI should never auto-delete.
4. **Transparency builds trust** — Show exactly why an image was scored low ("Blurry: motion detected" / "Exposure: -2.3 EV"). Don't black-box the AI.
5. **Zero-config for pros, guided for newcomers** — Hardware detection means most users never touch settings. But every setting is available for power users.

**Key screens to design first:**
1. Landing / Dashboard (recent sessions, new session button)
2. File load screen (drag zone + folder picker)
3. Thumbnail grid with score badges (color-coded borders, sort/filter toolbar)
4. Full-size preview overlay (accept/reject buttons, keyboard hints, model's reasoning display)
5. Hardware detector panel (displayed specs + model recommendation)
6. Export dialog (format picker, destination, copy/move option)

**Accessibility:** WCAG 2.1 AA minimum. Keyboard-navigable grid. Sufficient color contrast for accept/reject indicators (don't rely on color alone — use icons + text labels).

---

## 7. Risk Register

| # | Risk | Category | Likelihood | Impact | Severity | Mitigation Strategy |
|---|------|----------|-----------|--------|----------|---------------------|
| 1 | **Ollama vision model too slow on CPU-only machines** | Technical | H | H | **H** | Quantized models (Q4/Q3), batch processing, clear hardware requirements docs, CPU fallback with per-image time estimate before starting |
| 2 | **Vision model accuracy too low for professional use** | Technical | M | H | **H** | Fine-tune prompts iteratively, allow manual threshold adjustment, publish accuracy benchmarks against known datasets, implement "uncertain" tier for borderline images |
| 3 | **Photographers won't install Ollama + download models** | Market | H | M | **H** | First-run wizard with one-click install instructions, auto-download recommended model, bundle script for common OSes, video walkthrough |
| 4 | **RAW format limitations frustrate pro users** | Technical | M | H | **M** | Publish supported format list prominently, use Sharp + LibRaw for best coverage, add "convert to DNG" recommendation, roadmap JPEG+TIFF only for v1 |
| 5 | **Aftershoot/Narrative release local-only mode** | Competitive | M | H | **M** | Compete on price (free) + openness (open-source) + privacy; build community moat; integrate with more workflows than incumbents |
| 6 | **Ollama API changes break integration** | Technical | L | H | **M** | Pin Ollama API version, integration tests, contribute to Ollama to make API stable, maintain alternative adapter for direct model inference |
| 7 | **Low adoption due to lack of marketing** | Market | H | M | **M** | Target Reddit (r/WeddingPhotography, r/photography), YouTube photography community, free tier for influencers, GitHub showcase |
| 8 | **Memory exhaustion with 10K+ image catalogs** | Technical | M | M | **M** | Lazy-load thumbnails, virtual scrolling grid, page analysis batches of 500, clear memory after batch completes |
| 9 | **NVIDIA GPU detection fails on new hardware** | Technical | L | L | **L** | Graceful fallback to CPU, manual GPU override in settings, community-maintained hardware database |
| 10 | **Legal concerns about using AI for creative decisions** | Regulatory | L | M | **L** | Clear disclaimer: AI assists but final decision is human's. Product positioning: "tool, not replacement." Copyright of selects belongs to photographer. |

---

## 8. Roadmap

### Phase 0 — Discovery & Validation (Weeks 1–2)

- [ ] Post survey to r/WeddingPhotography, r/photography, r/postprocessing (validation + feature prioritization)
- [ ] Interview 5–10 professional photographers about culling workflow pain points
- [ ] Benchmark LLaVA 1.6 7B vs minicpm-v vs moondream on a 200-photo test set for culling accuracy
- [ ] Define exact MVP feature cut based on feedback
- **Success criteria:** ≥30 survey responses + clear validation that AI culling accuracy + speed are acceptable

### Phase 1 — MVP (Weeks 3–8)

**Team:** 1–2 full-stack devs, 1 part-time UX designer

**P0 features to ship:**
- [ ] Next.js web app with drag-and-drop + folder picker (US-001)
- [ ] Ollama integration with configurable prompt (US-002)
- [ ] Thumbnail grid with score badges + manual override (US-003)
- [ ] Export to TXT/CSV/JSON (US-004)
- [ ] Hardware profiler + model recommendation (US-005)
- [ ] Basic keyboard shortcuts (US-009 subset)

**Success criteria:**
- 1,000 images analyzed in ≤10 min (RTX 3060)
- ≥80% accuracy on manual cull comparison
- Zero images leave the user's machine (verified by network tab audit)

### Phase 2 — Growth (Weeks 9–16)

**P1 features:**
- [ ] Adjustable quality threshold sliders (US-006)
- [ ] XMP sidecar export (US-008)
- [ ] Customizable keyboard shortcuts (US-009)
- [ ] Command-line batch mode (US-007)
- [ ] Dark mode (US-012)
- [ ] Windows/macOS/Linux installers (electron wrapper or native desktop app)
- [ ] Community prompt library (shareable prompt templates)

**Growth levers:**
- YouTube tutorial: "Cull 5,000 photos in 10 minutes for free"
- GitHub repo with benchmark results vs Aftershoot
- Reddit post in r/photography: "I built a free local AI culling tool"
- Partnerships with photography YouTubers for reviews

### Phase 3 — Scale (Months 5–12)

**P2 + strategic features:**
- [ ] Multi-core batch analysis (US-011)
- [ ] Model comparison mode (US-010)
- [ ] Lightroom catalog direct integration (export .xmp + catalog update)
- [ ] Capture One integration
- [ ] Pro license ($79 one-time) — watermark-free export, custom batch sizing, priority support
- [ ] Enterprise tier — unlimited batch, custom model fine-tuning, dedicated support
- [ ] Open-source community edition (free forever, MIT license)
- [ ] Custom fine-tuning dataset builder (let users train their own quality model)

### Go-To-Market Note

- **Launch channels:** Product Hunt, GitHub, r/photography, r/WeddingPhotography, Hacker News, photography Discord servers
- **Pricing at launch:** Completely free and open-source (MIT/GPL). "Pro" license introduced at Phase 3.
- **First 100 users:** DM 50 Reddit users who complained about Aftershoot pricing + 50 wedding photographers from Facebook groups. Offer early access + feedback call.
- **Positioning:** "Ollama Photo Culler: Zero-subscription, zero-cloud, all-local AI culling. Your photos never leave your computer."

---

## Appendix

### Search Queries Used

| Phase | Query |
|-------|-------|
| Market | `photo culling software market size 2024 2025` |
| Market | `photography software market size 2025 billion revenue CAGR` |
| Competitive | `best AI photo culling tools professionals 2025` |
| Competitive | `Narrative Select Aftershoot PhotoMechanic photo culling pricing reviews` |
| Competitive | `Aftershoot photo culling pricing 2025` |
| Competitive | `Photo Mechanic pricing features 2025` |
| Competitive | `Optyx Imagen Culling Studio pricing alternatives 2025` |
| Technical | `Ollama vision model photo analysis local LLM capabilities` |
| Technical | `Ollama vision models comparison llava minicpm moondream benchmark performance 2025` |
| Technical | `Ollama image quality assessment model blur detection aesthetics` |
| Competitive | `local AI photo culling open source tool 2025` |

### Key Sources Cited

- Fortune Business Insights — Photography Studio Software Market Report (2025)
- Ollama Blog — Vision Models (Feb 2024)
- DIYPhotography — 5 AI Culling Tools (2025)
- Aftershoot Pricing Page (SaaSworthy, May 2026)
- Camera Bits — Photo Mechanic Pricing Page (2025)
- Narrative Select Pricing (Help Center, 2026)
- SourceForge — Optyx Alternatives (2026)

### Glossary

| Term | Definition |
|------|------------|
| **Culling** | The process of selecting the best photos and discarding technically flawed ones from a large set |
| **Ollama** | Open-source tool for running large language models locally |
| **LLaVA** | Large Language-and-Vision Assistant — multimodal model that understands images |
| **minicpm-v** | Lightweight vision-language model optimized for edge devices |
| **moondream** | Small vision-language model designed for fast local inference |
| **XMP** | Extensible Metadata Platform — Adobe's sidecar file format for metadata |
| **LibRaw** | Open-source library for reading RAW camera files |
| **Quantization** | Reducing model precision (e.g., from f16 to q4) to reduce memory/GPU requirements at minimal accuracy cost |
| **VRAM** | Video RAM — memory on a GPU used for model inference |
| **NPS** | Net Promoter Score — customer loyalty metric (-100 to +100) |

### Open Questions

1. **Should the app bundle a default vision model or require users to pull one via Ollama?** Bundling simplifies but increases download size (5–15 GB). Initial thought: bundle a small model (moondream) for first-run and recommend larger models for pro use.
2. **RAW format support: how deep to go in v1?** Supporting CR3, NEF, ARW, DNG, RAF, etc. adds significant complexity. Is v1 JPEG-only acceptable with a RAW roadmap? Initial thought: JPEG+TIFF v1, RAW via Sharp v2.
3. **Dual prompt vs. dedicated quality model?** Should we craft a generic prompt for vision models ("rate quality 0-100") or fine-tune a dedicated image quality model? Tradeoff: prompt is zero-effort but less accurate; fine-tuned model takes weeks but performs better. Initial thought: start with prompt + structured output JSON parsing.
4. **Monetization timing: when to introduce the Pro license?** Too early churns users, too late loses revenue. Initial thought: free for first 3 months post-MVP, then introduce Pro at Phase 3.
5. **Desktop Electron app vs. web app (localhost)?** Electron provides offline "app" feel but increases bundle size. Web app works across platforms but requires Ollama running separately. Initial thought: Next.js web app served locally — lightweight, cross-platform, users already manage Ollama via terminal.
6. **Should we support AMD GPUs / Intel Arc / Apple Silicon Metal acceleration?** Ollama supports these, but testing coverage multiplies. Initial thought: NVIDIA first (via CUDA), then Apple Silicon, then AMD/Intel based on demand.
7. **What license should the project use?** MIT (permissive, encourages adoption) vs. AGPL (protects against commercial exploitation by cloud vendors). Initial thought: MIT for core, AGPL for Pro extras.
8. **How to handle "learning from user feedback"?** Aftershoot's differentiation is that it learns from culling overrides. Simple implementation: store override reasons and allow users to share feedback for model improvement. Harder: actually fine-tune based on feedback.
9. **Should the app include a sidecar XMP generator that Lightroom can watch?** This is the most requested integration feature (US-008). Initial thought: yes, but only for P1 (Phase 2). Lightroom's "Auto Import" can watch a hot folder + XMP.
10. **Privacy: how to handle telemetry / crash reporting?** If we add telemetry for improvement, it conflicts with the "privacy-first" positioning. Initial thought: fully opt-in telemetry, anonymous, and off by default. Clearly documented.
