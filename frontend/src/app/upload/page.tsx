"use client";
import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Upload, FileImage, Video, FileAudio, Globe, MessageSquare, AlertTriangle, CheckCircle2 } from "lucide-react";

const MEDIA_TYPES = [
  { value: "image", icon: FileImage, label: "Image", accept: "image/*" },
  { value: "video", icon: Video, label: "Video", accept: "video/*" },
  { value: "audio", icon: FileAudio, label: "Audio", accept: "audio/*" },
  { value: "url", icon: Globe, label: "URL", accept: "" },
  { value: "screenshot", icon: MessageSquare, label: "Screenshot / Message", accept: "image/*" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type Risk = "LOW" | "MEDIUM" | "HIGH";

type AnalysisResult = {
  prediction: string;
  confidence: number;
  risk: Risk;
  explanation: string;
  artifacts: string[];
  recommendation: string;
  modelVersion: string;
};

export default function UploadPage() {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | null) => {
    if (!f) return;
    setFile(f);
    if (f.type.startsWith("image/") || f.type.startsWith("video/")) {
      setPreview(URL.createObjectURL(f));
    }
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedType || (selectedType === "url" ? !url.trim() : !file)) return;

    setAnalyzing(true);
    setResult(null);
    setError(null);

    try {
      const response = selectedType === "url"
        ? await fetch(`${API_URL}/api/analyze/url?url=${encodeURIComponent(url.trim())}`, { method: "POST" })
        : await fetch(`${API_URL}/api/analyze/${selectedType}`, {
            method: "POST",
            body: (() => {
              const body = new FormData();
              body.append("file", file as File);
              return body;
            })(),
          });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.detail || "The analysis request failed.");
      }

      const data = await response.json() as Omit<AnalysisResult, "modelVersion"> & { model_version: string };
      setResult({ ...data, modelVersion: data.model_version });
    } catch (error) {
      setError(error instanceof Error ? error.message : "The analysis request failed.");
    } finally {
      setAnalyzing(false);
    }
  };

  const selectedMeta = MEDIA_TYPES.find((t) => t.value === selectedType);
  const Icon = selectedMeta?.icon || Upload;

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <ShieldIcon className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-xl">TruthLens AI</span>
        </div>
        <Link href="/" className="text-sm hover:text-emerald-500 transition">← Back</Link>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-2">Analyze Content</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">Select a media type and upload your file, paste a URL, or drop a screenshot.</p>

        {/* Media type selector */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {MEDIA_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => { setSelectedType(t.value); setFile(null); setPreview(null); setResult(null); setError(null); }}
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition ${
                selectedType === t.value
                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950"
                  : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
              }`}
            >
              <t.icon className="h-6 w-6" />
              <span className="text-xs font-medium">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Upload area */}
        {selectedType !== "url" && (
          <div
            onClick={() => inputRef.current?.click()}
            className="border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-12 text-center cursor-pointer hover:border-emerald-500 transition"
          >
            <Icon className="h-10 w-10 mx-auto mb-3 text-zinc-400" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              {file ? file.name : `Click or drag ${selectedType} file here`}
            </p>
            <input ref={inputRef} type="file" accept={selectedMeta?.accept} className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </div>
        )}

        {/* URL input */}
        {selectedType === "url" && (
          <div className="flex gap-3">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com" className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-4 py-3 text-sm outline-none focus:border-emerald-500 transition" />
            <button onClick={handleAnalyze} className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-500 transition">Scan</button>
          </div>
        )}

        {/* Preview */}
        {preview && (
          <div className="mt-6 rounded-2xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {file?.type.startsWith("video") ? (
              <video src={preview} controls className="w-full max-h-64" />
            ) : (
              <Image src={preview} alt="preview" width={640} height={360} unoptimized className="w-full max-h-64 object-contain" />
            )}
          </div>
        )}

        {/* Analyze button */}
        {(file || url) && !analyzing && !result && (
          <button onClick={handleAnalyze} className="mt-6 w-full rounded-xl bg-emerald-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition">
            Analyze with TruthLens AI
          </button>
        )}

        {/* Analyzing state */}
        {analyzing && (
          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            <p className="text-sm text-zinc-600 dark:text-zinc-400">AI analyzing content — this takes a few seconds...</p>
          </div>
        )}

        {/* Result */}
        {error ? (
          <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
            {error}
          </div>
        ) : result && (
          <div className="mt-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 bg-zinc-50 dark:bg-zinc-950">
            <div className="flex items-center gap-3 mb-4">
              {result.risk === "HIGH" ? <AlertTriangle className="h-6 w-6 text-red-500" /> : <CheckCircle2 className="h-6 w-6 text-emerald-500" />}
              <span className="font-bold text-lg">{result.prediction.replace(/_/g, " ")}</span>
              <span className={`ml-auto text-xs font-semibold px-3 py-1 rounded-full ${
                result.risk === "HIGH" ? "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400" :
                result.risk === "MEDIUM" ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400" :
                "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"
              }`}>{result.risk} RISK</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div><span className="text-zinc-500">Confidence</span><div className="font-semibold">{result.confidence}%</div></div>
              <div><span className="text-zinc-500">Model</span><div className="font-semibold">{result.modelVersion}</div></div>
            </div>
            <div className="mb-4">
              <span className="text-zinc-500 text-sm">Evidence</span>
              <ul className="mt-1 space-y-1">
                {result.artifacts.map((a: string) => (
                  <li key={a} className="text-sm bg-white dark:bg-zinc-900 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-800">• {a.replace(/_/g, " ")}</li>
                ))}
              </ul>
            </div>
            <div className="mb-4">
              <span className="text-zinc-500 text-sm">Explanation</span>
              <p className="text-sm mt-1 leading-relaxed">{result.explanation}</p>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-900 text-sm">
              <span className="font-semibold text-amber-800 dark:text-amber-300">Recommendation:</span> {result.recommendation}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
