# TruthLens AI

Explainable AI-powered digital safety platform for detecting deepfakes, manipulated media, phishing URLs, and scam messages.

## Problem
Fake media is weaponized faster than verification tools can check it. Ordinary users have no fast way to tell what's real before they trust, share, or act on it.

## Solution
TruthLens AI ingests images, videos, audio, URLs, and screenshots, runs them through specialized ML detectors, explains *why* in plain language, and gives a concrete next action — all while protecting user privacy.

## Tech Stack
- **Frontend**: Next.js (App Router) + Tailwind CSS + Radix UI
- **Backend**: FastAPI (Python)
- **ML**: PyTorch, EfficientNet-B3, OpenCV, Grad-CAM
- **Database**: PostgreSQL (via Supabase)
- **Storage**: Supabase Storage
- **Deployment**: Vercel (frontend), Railway (backend)

## Quick Start
Coming soon — Milestone 0+1 in progress.

## Project Structure
```
frontend/  — Next.js web app
backend/   — FastAPI API server
ml/        — PyTorch model code, training scripts
docs/      — Planning, architecture, interview prep
tests/     — Unit, integration, security tests
docker/    — Docker configuration
```

## License
MIT License — see LICENSE file.
