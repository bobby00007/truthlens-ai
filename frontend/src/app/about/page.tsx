import Link from "next/link";
import { Brain, Cpu, Shield, Eye, GitBranch, Database } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
      <nav className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-emerald-500" />
          <span className="font-bold text-xl">TruthLens AI</span>
        </div>
        <Link href="/" className="text-sm hover:text-emerald-500 transition">← Back</Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16 space-y-12">
        <section>
          <h1 className="text-4xl font-bold mb-4">About TruthLens AI</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            TruthLens AI is an <strong>explainable</strong> digital safety platform that helps ordinary users identify potentially manipulated or AI-generated content before they trust, share, or act on it.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">What We Detect</h2>
          <ul className="space-y-2 text-zinc-600 dark:text-zinc-400 list-disc pl-5">
            <li>AI-generated images (diffusion models, GANs)</li>
            <li>Face-swapped / manipulated photos</li>
            <li>Deepfake videos (temporal + facial inconsistency)</li>
            <li>Synthetic / cloned voices</li>
            <li>Phishing URLs and malicious domains</li>
            <li>Scam language in screenshots (urgency, impersonation, OTP requests)</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">How It Works</h2>
          <ol className="space-y-3 text-zinc-600 dark:text-zinc-400 list-decimal pl-5">
            <li><strong>Upload</strong> — image, video, audio, URL, or screenshot</li>
            <li><strong>ML Analysis</strong> — specialized CNN (EfficientNet-B3) detects visual artifacts</li>
            <li><strong>Grad-CAM</strong> — highlights regions the model attended to</li>
            <li><strong>Calibrated Confidence</strong> — gives a probability band, not a false certainty</li>
            <li><strong>LLM Explanation</strong> — converts model output into plain language</li>
            <li><strong>Risk Engine</strong> — maps confidence + content type → LOW / MEDIUM / HIGH</li>
            <li><strong>Recommendation</strong> — concrete next action (verify, do not share, report)</li>
          </ol>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Why Explainable?</h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Most detectors just say <em>FAKE</em> or <em>REAL</em>. TruthLens shows you <em>why</em> — facial texture anomaly, inconsistent lighting, no EXIF metadata. This matters for journalists, students, and anyone who needs to make an informed decision.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold">Technology Stack</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { icon: Cpu, label: "PyTorch + EfficientNet-B3" },
              { icon: Eye, label: "Grad-CAM Explainability" },
              { icon: Brain, label: "LLM Explanation Layer" },
              { icon: GitBranch, label: "Model Versioning" },
              { icon: Database, label: "PostgreSQL + Supabase" },
              { icon: Shield, label: "Privacy-First Design" },
            ].map((t) => (
              <div key={t.label} className="flex items-center gap-2 p-3 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <t.icon className="h-4 w-4 text-emerald-500" />
                <span className="text-sm">{t.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950">
          <h3 className="font-bold mb-2">⚠️ Important Disclaimer</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            TruthLens AI is an educational tool. No AI detector is perfect — false positives and false negatives exist. Always independently verify critical content. This tool does not replace professional forensic analysis.
          </p>
        </section>
      </main>
    </div>
  );
}
