"""
TruthLens AI — FastAPI Backend
Provides /api/analyze endpoints for image, video, audio, URL, screenshot.
"""
import os
import uuid
import hashlib
from urllib.parse import urlparse
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


def _validate_upload(file: UploadFile, media_type: MEDIA_TYPE) -> None:
    """Validate MIME type, extension, and size before processing."""
    allowed = {
        "image": {"image/jpeg", "image/png", "image/webp", "image/heic"},
        "video": {"video/mp4", "video/quicktime", "video/webm"},
        "audio": {"audio/mpeg", "audio/wav", "audio/flac", "audio/ogg"},
        "screenshot": {"image/jpeg", "image/png", "image/webp", "image/heic"},
    }
    if file.content_type not in allowed.get(media_type, set()):
        raise HTTPException(status_code=415, detail="Unsupported file type")
    if file.size is not None and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=413, detail="File too large (max 5MB)")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "truthlens-ai-backend"}


@app.post("/api/analyze/image", response_model=AnalysisResult)
async def analyze_image(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze an image for AI-generated / manipulated content."""
    _validate_upload(file, "image")
    return _run_analysis("image", file, sample_key=await _file_signature(file))


@app.post("/api/analyze/video", response_model=AnalysisResult)
async def analyze_video(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze a video for deepfake / temporal artifacts."""
    _validate_upload(file, "video")
    return _run_analysis("video", file, sample_key=await _file_signature(file))


@app.post("/api/analyze/audio", response_model=AnalysisResult)
async def analyze_audio(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze audio for synthetic / cloned voice."""
    _validate_upload(file, "audio")
    return _run_analysis("audio", file, sample_key=await _file_signature(file))


@app.post("/api/analyze/screenshot", response_model=AnalysisResult)
async def analyze_screenshot(file: UploadFile = File(...)) -> AnalysisResult:
    """Analyze a screenshot for scam and phishing indicators."""
    _validate_upload(file, "screenshot")
    return _run_analysis("screenshot", file, sample_key=await _file_signature(file))


@app.post("/api/analyze/url")
async def analyze_url(url: str = Query(..., min_length=8)) -> AnalysisResult:
    """Analyze a URL for phishing / malicious reputation."""
    return _run_analysis("url", None, url=url)


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


async def _file_signature(file: UploadFile) -> str:
    """Create a stable input signature for the deterministic demo detector."""
    contents = await file.read()
    await file.seek(0)
    return hashlib.sha256(contents).hexdigest()


def _risk_for(confidence: float) -> Literal["LOW", "MEDIUM", "HIGH"]:
    return "HIGH" if confidence >= 85 else "MEDIUM" if confidence >= 65 else "LOW"


def _run_analysis(media_type: MEDIA_TYPE, file: UploadFile | None, **kwargs) -> AnalysisResult:
    """Core analysis pipeline:
    1. Validate input
    2. Run ML detector (placeholder → replace with PyTorch model)
    3. Generate explanation via LLM layer
    4. Return structured result
    """
    if media_type == "url":
        raw_url = kwargs["url"]
        parsed = urlparse(raw_url)
        host = (parsed.hostname or "").lower()
        suspicious_terms = ("login", "verify", "secure", "update", "wallet", "payment", "account")
        indicators = []
        if parsed.scheme != "https":
            indicators.append("missing_https")
        if host.startswith("xn--") or "xn--" in host:
            indicators.append("punycode_domain")
        if host.replace(".", "").isdigit():
            indicators.append("ip_address_host")
        if any(term in raw_url.lower() for term in suspicious_terms):
            indicators.append("credential_request_language")
        if parsed.port not in (None, 80, 443):
            indicators.append("unusual_port")

        confidence = min(96.0, 18.0 + len(indicators) * 22.0)
        risk = _risk_for(confidence)
        prediction = "potentially_phishing" if indicators else "likely_authentic"
        explanation = (
            "Several phishing indicators were found in the URL structure: " + ", ".join(indicators) + "."
            if indicators
            else "No obvious phishing indicators were found in the URL structure. The domain still requires independent verification."
        )
        artifacts = indicators or ["https_scheme", "standard_domain_structure"]
        recommendation = (
            "Do not enter passwords, payment details, or OTPs until the destination is independently verified."
            if indicators
            else "Low apparent risk — still verify the domain before signing in or sharing information."
        )
    else:
        # Deterministic demo heuristics — replace with trained detectors when model weights are available.
        score = int(kwargs.get("sample_key", "0")[:8], 16) % 100
        suspicious = score >= 50
        profiles = {
            "image": {
                "high": (72.0, "potentially_ai_generated", "Visual texture and lighting inconsistencies suggest synthetic image generation.", ["texture_inconsistency", "inconsistent_lighting"]),
                "low": (28.0, "likely_authentic", "The sample has a natural-looking texture and consistent scene lighting.", ["natural_texture", "consistent_lighting"]),
            },
            "video": {
                "high": (88.0, "potentially_manipulated", "Frame-to-frame facial alignment and motion consistency require deeper forensic review.", ["temporal_inconsistency", "facial_alignment_artifact"]),
                "low": (36.0, "likely_authentic", "No obvious temporal or facial alignment anomalies were found in this demo pass.", ["stable_motion", "consistent_frames"]),
            },
            "audio": {
                "high": (76.0, "potentially_synthetic_audio", "The sample contains a synthetic-sounding spectral pattern and unusually smooth transitions.", ["spectral_smoothing", "unnatural_transition"]),
                "low": (31.0, "likely_authentic", "The sample has a varied spectral pattern consistent with a natural recording.", ["natural_spectral_variation", "consistent_background_noise"]),
            },
            "screenshot": {
                "high": (91.0, "potentially_scam_message", "The screenshot resembles an urgent impersonation or credential-request pattern.", ["urgency_language", "credential_request_pattern"]),
                "low": (24.0, "likely_benign_message", "No strong scam-message pattern was detected in this demo pass.", ["no_urgency_pattern", "no_credential_request"]),
            },
        }
        confidence, prediction, explanation, artifacts = profiles[media_type]["high" if suspicious else "low"]
        risk = _risk_for(confidence)
        recommendation = (
            "Do not forward or act on this content until it is independently verified."
            if suspicious
            else "No strong warning signs in this demo pass — use standard caution before acting."
        )

    result = AnalysisResult(
        id=str(uuid.uuid4()),
        media_type=media_type,
        prediction=prediction,
        confidence=round(float(confidence), 2),
        risk=risk,
        explanation=explanation,
        artifacts=artifacts,
        recommendation=recommendation,
        model_version="TruthLens demo heuristics v0.1",
        timestamp=datetime.now(timezone.utc).isoformat(),
    )
    ANALYSIS_STORE.append(result)
    return result
