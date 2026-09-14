import Link from "next/link";
import { Shield, Clock, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";

// Mock history data — will connect to Supabase later
const MOCK_HISTORY = [
  { id: 1, type: "image", prediction: "potentially_ai_generated", confidence: 92, risk: "HIGH", date: "2025-09-14 14:32", model: "EfficientNet-B3 v1.2" },
  { id: 2, type: "url", prediction: "likely_authentic", confidence: 23, risk: "LOW", date: "2025-09-13 09:15", model: "EfficientNet-B3 v1.2" },
  { id: 3, type: "image", prediction: "potentially_manipulated", confidence: 78, risk: "MEDIUM", date: "2025-09-12 18:47", model: "EfficientNet-B3 v1.1" },
  { id: 4, type: "video", prediction: "potentially_ai_generated", confidence: 88, risk: "HIGH", date: "2025-09-11 11:20", model: "EfficientNet-B3 v1.2" },
  { id: 5, type: "image", prediction: "likely_authentic", confidence: 15, risk: "LOW", date: "2025-09-10 22:05", model: "EfficientNet-B3 v1.2" },
];

export default function HistoryPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-xl">TruthLens AI</span>
        </div>
        <Link href="/" className="text-sm hover:text-emerald-500 transition">← Back</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Analysis History</h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">All past analyses with risk scores and model versions.</p>
          </div>
          <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-500 transition">+ New Analysis</Link>
        </div>

        {MOCK_HISTORY.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">No analyses yet. <Link href="/upload" className="text-emerald-500 hover:underline">Start one now</Link>.</div>
        ) : (
          <div className="space-y-3">
            {MOCK_HISTORY.map((a) => (
              <div key={a.id} className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-emerald-500/30 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">{a.type.toUpperCase()}</span>
                    <span className={`text-xs font-semibold ${a.risk === "HIGH" ? "text-red-500" : a.risk === "MEDIUM" ? "text-amber-500" : "text-emerald-500"}`}>{a.risk}</span>
                  </div>
                  <div className="text-sm font-medium truncate">{a.prediction.replace(/_/g, " ")}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{a.model} · {a.date}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-lg font-bold">{a.confidence}%</div>
                  <div className="text-xs text-zinc-500">confidence</div>
                </div>
                <button className="p-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-lg transition" title="Delete">
                  <Trash2 className="h-4 w-4 text-zinc-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
