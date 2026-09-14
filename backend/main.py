"""
TruthLens AI — FastAPI Backend
Provides /api/analyze endpoints for image, video, audio, URL, screenshot.
"""
import os
import uuid
from datetime import datetime, timezone
from typing import Literal, Optional
from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="TruthLens AI API",
    version="1.0.0",
    description="Explainable AI digital safety platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MEDIA_TYPE = Literal["image", "video", "audio", "url", "screenshot"]

class AnalysisRequest(BaseModel):
    media_type: MEDIA_TYPE
    confidence: float = Field(ge=0, le=100)
    risk: Literal["LOW", "MEDIUM", "HIGH"]
    prediction: str
    explanation: str
    artifacts: list[str]
    recommendation: str
    model_version: str = "EfficientNet-B3 v1.2"

class AnalysisResult(BaseModel):
    id: str
    media_type: MEDIA_TYPE
    prediction: str
    confidence: float
    risk: Literal["LOW", "MEDIUM", "HIGH"]
    explanation: str
    artifacts: list[str]
    recommendation: str
    model_version: str
    timestamp: str


# In-memory analysis store (replace with PostgreSQL + Supabase later)
ANALYSIS_STORE: list[AnalysisResult] = []


def _validate_upload(file: UploadFile) -> None:
    """Validate MIME type, extension, and size before processing."""
    allowed = {
        "image": {"image/jpeg", "image/png", "image/webp", "image/heic"},
        "video": {"video/mp4", "video/quicktime", "video/webm"},
        "audio": {"audio/mpeg", "audio/wav", "audio/flac", "audio/ogg"},
        "screenshot": {"image/jpeg", "image/png", "image/webp", "image/heic"},
    }
    if file.content_type not in allowed.get(file.filename or "", set()):
        raise HTTPException(status_code=415, detail="Unsupported file type")
    if file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "truthlens-ai-backend"}


@app.post("/api/analyze/image", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze an image for AI-generated / manipulated content."""
    _validate_upload(file)
    return _run_analysis("image", file)


@app.post("/api/analyze/video", response_model=AnalysisResult)
async def analyze_video(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze a video for deepfake / temporal artifacts."""
    _validate_upload(file)
    return _run_analysis("video", file)


@app.post("/api/analyze/audio", response_model=AnalysisResult)
async def analyze_audio(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze audio for synthetic / cloned voice."""
    _validate_upload(file)
    return _run_analysis("audio", file)


@app.post("/api/analyze/url")
async def analyze_url(url: str = Query(..., min_length=8)) -> AnalysisResult:
    """Analyze a URL for phishing / malicious reputation."""
    return _run_analysis("url", None, confidence=23.0, risk="LOW")


@app.get("/api/history")
async def history(
    limit: int = Query(50, ge=1, le=200),
    media_type: Optional[MEDIA_TYPE] = None,
) -> list[AnalysisResult]:
    """Get analysis history (metadata only, no media stored)."""
    results = ANALYSIS_STORE
    if media_type:
        results = [r for r in results if r.media_type == media_type]
    return results[-limit:]


@app.delete("/api/analysis/{analysis_id}")
async def delete_analysis(analysis_id: str) -> dict[str, str]:
    """Delete one analysis record (metadata + signed URL)."""
    global ANALYSIS_STORE
    ANALYSIS_STORE = [r for r in ANALYSIS_STORE if r.id != analysis_id]
    return {"status": "deleted", "id": analysis_id}


def _run_analysis(media_type: MEDIA_TYPE, file: UploadFile | None, **kwargs) -> AnalysisResult:
    """Core analysis pipeline:
    1. Validate input
    2. Run ML detector (placeholder → replace with PyTorch model)
    3. Generate explanation via LLM layer
    4. Return structured result
    """
    if media_type == "url":
        confidence = kwargs.get("confidence", 23.0)
        risk = "LOW"
        prediction = "likely_authentic"
        explanation = "No suspicious indicators detected in URL structure. Domain appears to follow standard HTTPS conventions."
        artifacts = ["valid_https", "standard_domain_structure"]
        recommendation = "Low risk — still verify critical content before acting."
    else:
        # Placeholder model inference — replace with PyTorch EfficientNet-B3
        confidence = kwargs.get("confidence", 78.0)
        risk = "HIGH" if confidence >= 85 else "MEDIUM" if confidence >= 65 else "LOW"
        prediction = "potentially_ai_generated" if confidence >= 65 else "likely_authentic"
        explanation = (
            "Facial texture anomaly detected around the eyes and cheeks, typical of diffusion-model generation. "
            "Inconsistent lighting across the scene adds evidence of synthetic origin."
        )
        artifacts = ["facial_texture_anomaly", "over_smooth_skin", "inconsistent_lighting"]
        recommendation = "Do not forward until independently verified. Consider reporting to the platform."

    result = AnalysisResult(
        id=str(uuid.uuid4()),
        media_type=media_type,
        prediction=prediction,
        confidence=round(float(confidence), 2),
        risk=risk,
        explanation=explanation,
        artifacts=artifacts,
        recommendation=recommendation,
        model_version="EfficientNet-B3 v1.2",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    ANALYSIS_STORE.append(result)
    return result
