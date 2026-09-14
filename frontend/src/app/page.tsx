import Link from "next/link";
import { Shield, Upload, Brain, History, MessageSquare, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-xl">TruthLens AI</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/about" className="hover:text-emerald-500 transition">About</Link>
          <Link href="/history" className="hover:text-emerald-500 transition">History</Link>
          <Link href="/upload" className="inline-flex items-center gap-2 rounded-full bg-black dark:bg-white text-white dark:text-black px-5 py-2 text-sm font-medium hover:opacity-85 transition">
            <Upload className="h-4 w-4" />
            Analyze
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center justify-center px-6 py-24 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 dark:bg-emerald-950 px-4 py-1.5 text-sm text-emerald-700 dark:text-emerald-400 mb-6">
          <Zap className="h-4 w-4" />
          AI-Powered Digital Safety
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Detect Manipulated Media Before You Trust It
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-10 max-w-xl">
          Upload an image, video, audio clip, URL, or screenshot of a suspicious message. TruthLens AI tells you what&apos;s real — and shows you the evidence.
        </p>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-emerald-600/25 hover:bg-emerald-500 transition"
        >
          <Upload className="h-5 w-5" />
          Start Analysis
        </Link>
      </section>

      {/* Features */}
      <section className="border-t border-zinc-200 dark:border-zinc-800 py-24 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Brain, title: "Explainable AI", desc: "Grad-CAM heatmaps show exactly where the model looked. No black box." },
            { icon: Shield, title: "Risk Levels", desc: "Low / Medium / High confidence with calibrated bands — never false certainty." },
            { icon: History, title: "Full History", desc: "Every analysis saved with metadata, evidence, and model version for audit." },
            { icon: MessageSquare, title: "Scam Detection", desc: "Screenshot OCR + scam text detection for phishing and fraud messages." },
            { icon: Zap, title: "Multi-Modal", desc: "Images, videos, audio, URLs — one unified risk score across all media types." },
            { icon: Upload, title: "Private & Secure", desc: "Auto-delete after 48 hours. No biometric storage. Privacy first." },
          ].map((f) => (
            <div key={f.title} className="flex flex-col gap-3 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 hover:border-emerald-500/30 transition">
              <f.icon className="h-6 w-6 text-emerald-500" />
              <h3 className="font-semibold">{f.title}</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6 text-center text-sm text-zinc-500">
        TruthLens AI — Explainable AI Digital Safety. Not a replacement for professional verification.
      </footer>
    </div>
  );
}
