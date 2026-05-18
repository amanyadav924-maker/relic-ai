"use client";

import { useState, useRef, useCallback, useEffect, DragEvent } from "react";
import HeritageBackground from "./components/HeritageBackground";

// ── Types ───────────────────────────────────────────────────────────────────
interface ParsedResponse {
  monument: string;
  location: string;
  builtBy: string;
  purpose: string;
  year: string;
  story: string;
  raw: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────────
function extractField(text: string, keys: string[]): string {
  for (const key of keys) {
    const re = new RegExp(`(?:-|\\*)*\\b${key}\\b(?:-|\\*|:)*\\s*(.+)`, "i");
    const m = text.match(re);
    if (m) {
      // Clean up markdown formatting (bold asterisks, trailing characters)
      return m[1].replace(/\*+/g, "").trim();
    }
  }
  return "";
}

function parseAIResponse(raw: string): ParsedResponse {
  // Extract story - look for Story or narrative sections, fallback to the entire text if not found
  const storyMatch = raw.match(/(?:\*{0,2}Story|Storytelling|Narrative|History\*{0,2}):?\s*([\s\S]+)/i);
  const story = storyMatch ? storyMatch[1].trim() : raw;

  return {
    monument: extractField(raw, ["Name", "Monument Name", "Monument"]),
    location:  extractField(raw, ["Location or museum", "Location", "Museum", "Where it is located"]),
    builtBy:   extractField(raw, ["Built or created by", "Built by", "Created by", "Who built it", "Builder", "Creator", "Artist"]),
    purpose:   extractField(raw, ["Purpose or artistic meaning", "Purpose", "Artistic meaning", "Why it was built", "Meaning"]),
    year:      extractField(raw, ["Era / year / century", "Era or year", "Year or century built", "Year built", "Year / Era", "Year", "Era", "Century"]),
    story:     story,
    raw,
  };
}

// ── Floating particles ───────────────────────────────────────────────────────
function Particles() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const dots = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    top:  Math.random() * 100,
    left: Math.random() * 100,
    dur:  Math.random() * 5 + 5,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.35 + 0.1,
  }));
  return (
    <>
      {dots.map(d => (
        <span
          key={d.id}
          className="particle"
          style={{
            width: d.size,
            height: d.size,
            top: `${d.top}%`,
            left: `${d.left}%`,
            "--dur":   `${d.dur}s`,
            "--delay": `${d.delay}s`,
            opacity: d.opacity,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}

// ── AI Status indicator ──────────────────────────────────────────────────────
function StatusBadge({ scanning }: { scanning: boolean }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
      <span
        className={`status-dot w-2 h-2 rounded-full ${scanning ? "bg-yellow-400" : "bg-[#22C55E]"}`}
      />
      <span className="text-gray-300">
        {scanning ? "Scanning…" : "AI Ready"}
      </span>
    </div>
  );
}

// ── Skeleton loader ──────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="glass p-6 space-y-4 fade-in">
      <div className="skeleton h-5 w-2/5" />
      <div className="skeleton h-4 w-3/5" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-4 w-1/3" />
      <hr className="border-[rgba(34,197,94,0.15)]" />
      <div className="space-y-2">
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-[92%]" />
        <div className="skeleton h-4 w-[80%]" />
      </div>
    </div>
  );
}

// ── Info row inside response card ────────────────────────────────────────────
function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">{label}</p>
        <p className="text-[#F0FDF4] text-sm font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ── Bottom nav tab ───────────────────────────────────────────────────────────
function NavTab({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1 flex-1 py-1 transition-opacity hover:opacity-100"
      style={{ opacity: active ? 1 : 0.4 }}>
      <span className="text-xl">{icon}</span>
      <span className={`text-[10px] font-semibold tracking-wide ${active ? "text-[#22C55E]" : "text-gray-500"}`}>
        {label}
      </span>
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  const [preview,    setPreview]    = useState<string>("");
  const [imageB64,   setImageB64]   = useState<string>("");
  const [mimeType,   setMimeType]   = useState<string>("image/jpeg");
  const [loading,    setLoading]    = useState(false);
  const [scanPct,    setScanPct]    = useState(0);
  const [response,   setResponse]   = useState<ParsedResponse | null>(null);
  const [error,      setError]      = useState<string>("");
  const [dragging,   setDragging]   = useState(false);
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  // Animate scan progress bar while loading
  useEffect(() => {
    if (!loading) { setScanPct(0); return; }
    setScanPct(0);
    const steps = [15, 35, 55, 72, 88];
    let i = 0;
    const t = setInterval(() => {
      if (i < steps.length) { setScanPct(steps[i++]); }
      else clearInterval(t);
    }, 600);
    return () => clearInterval(t);
  }, [loading]);

  // Scroll to result
  useEffect(() => {
    if (showResult && resultRef.current) {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 150);
    }
  }, [showResult]);

  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) { setError("Please upload an image file."); return; }
    setError(""); setResponse(null); setShowResult(false);
    setPreview(URL.createObjectURL(file));
    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result?.toString().split(",")[1] ?? "";
      setImageB64(b64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleScan = async () => {
    if (!imageB64) { setError("Please upload a monument or artwork image first."); return; }
    setLoading(true); setError(""); setResponse(null); setShowResult(false);

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: imageB64, mimeType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Scan failed");
      setScanPct(100);
      await new Promise(r => setTimeout(r, 400));
      setResponse(parseAIResponse(data.text));
      setShowResult(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Reset all states and trigger the file upload interface
  const handleNewUpload = () => {
    setPreview("");
    setImageB64("");
    setMimeType("image/jpeg");
    setLoading(false);
    setScanPct(0);
    setResponse(null);
    setError("");
    setShowResult(false);
    
    // Smooth transition before opening file dialog
    setTimeout(() => {
      inputRef.current?.click();
    }, 120);
  };

  return (
    <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-24">

      {/* ── Premium Indian Heritage Animated Background ───────── */}
      <HeritageBackground />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-10 pb-4 fade-in">
        <div>
          <h1 className="text-3xl font-black tracking-tight gradient-text-multi leading-none">Relic AI</h1>
          <p className="text-[11px] text-gray-500 font-medium tracking-widest uppercase mt-0.5">
            Heritage Companion
          </p>
        </div>
        <StatusBadge scanning={loading} />
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col gap-5 px-4 max-w-md mx-auto w-full">

        {/* ── Upload / Camera preview area ─────────────────── */}
        <div className="fade-up delay-100">
          <div
            className={`relative rounded-3xl overflow-hidden cursor-pointer hover-lift transition-all duration-300 ${dragging ? "upload-active" : "glow-border-multi"}`}
            style={{ aspectRatio: "4/3", background: "rgba(15,22,17,0.6)" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && inputRef.current?.click()}
          >
            {/* Scan grid background */}
            <div className="absolute inset-0 scan-grid opacity-60" />

            {preview ? (
              <>
                {/* Preview image */}
                <img src={preview} alt="Uploaded monument"
                  className="absolute inset-0 w-full h-full object-cover" />
                {/* Dim overlay when not loading */}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(11,15,12,0.7) 0%, transparent 50%)" }} />
                {/* Scanning overlay */}
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: "rgba(11,15,12,0.55)" }}>
                    <div className="scan-line" />
                    <div className="mt-auto mb-6 text-center">
                      <p className="text-[#22C55E] text-sm font-bold tracking-widest uppercase animate-pulse">
                        Analyzing Image…
                      </p>
                    </div>
                  </div>
                )}
                {/* Change photo button */}
                {!loading && (
                  <button
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-xl text-xs font-semibold text-[#22C55E] hover:bg-[rgba(34,197,94,0.15)] transition-colors"
                  >
                    ✦ Change
                  </button>
                )}
                {/* Corner brackets */}
                {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
                  <span key={i} className={`absolute ${pos} w-5 h-5 border-[#22C55E] opacity-80`}
                    style={{
                      borderTopWidth:    i < 2 ? 2 : 0,
                      borderBottomWidth: i >= 2 ? 2 : 0,
                      borderLeftWidth:   i % 2 === 0 ? 2 : 0,
                      borderRightWidth:  i % 2 === 1 ? 2 : 0,
                    }} />
                ))}
              </>
            ) : (
              /* Empty state */
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.3)" }}>
                  🏛️
                </div>
                <p className="text-[#22C55E] font-bold text-base">Drop or tap to upload</p>
                <p className="text-gray-500 text-xs leading-relaxed">
                  Upload a photo of any monument, heritage site, or famous artwork
                </p>
                <div className="flex gap-2 flex-wrap justify-center mt-1">
                  {["JPEG", "PNG", "WEBP"].map(f => (
                    <span key={f} className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400"
                      style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileInput} />
        </div>

        {/* ── Upload button (when no preview) ──────────────── */}
        {!preview && (
          <button
            onClick={() => inputRef.current?.click()}
            className="fade-up delay-200 btn-press hover-lift flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-black transition-all"
            style={{ background: "linear-gradient(135deg, #22C55E, #16a34a)" }}
          >
            <span className="text-lg">📁</span> Upload Image or Artwork
          </button>
        )}

        {/* ── Scan progress bar ─────────────────────────────── */}
        {loading && (
          <div className="fade-in rounded-full overflow-hidden h-1.5" style={{ background: "rgba(34,197,94,0.12)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${scanPct}%`,
                background: "linear-gradient(90deg, #22C55E, #86EFAC)",
                boxShadow: "0 0 12px rgba(34,197,94,0.6)",
              }} />
          </div>
        )}

        {/* ── Scan CTA button ───────────────────────────────── */}
        {preview && !showResult && (
          <div className="fade-up delay-300 flex flex-col items-center gap-3">
            <div className="relative">
              <button
                onClick={handleScan}
                disabled={loading}
                className={`relative pulse-ring btn-press hover-lift flex items-center gap-3 px-10 py-4 rounded-full font-black text-base tracking-wide text-black transition-all duration-300 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                style={{ background: loading ? "#4b7a5e" : "linear-gradient(135deg, #22C55E, #16a34a)", boxShadow: "0 6px 32px rgba(34,197,94,0.4)" }}
              >
                <span className="text-xl">{loading ? "⏳" : "🔍"}</span>
                <span>{loading ? "Scanning Heritage…" : "Scan with Relic AI"}</span>
              </button>
            </div>
            {!loading && (
              <p className="text-[11px] text-gray-600 text-center">
                Powered by Gemini Vision · Heritage AI
              </p>
            )}
          </div>
        )}

        {/* ── Error state ───────────────────────────────────── */}
        {error && (
          <div className="fade-up glass px-4 py-3 rounded-2xl flex items-start gap-3"
            style={{ borderColor: "rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.06)" }}>
            <span className="text-lg mt-0.5">⚠️</span>
            <p className="text-red-400 text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────── */}
        {loading && <SkeletonCard />}

        {/* ── AI Response card ──────────────────────────────── */}
        {showResult && response && (
          <div ref={resultRef} className="fade-up glow-border-multi glass p-5 space-y-5"
            style={{ animationDelay: "0.05s" }}>

            {/* Card header */}
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#22C55E] font-bold mb-1">
                  ✦ Landmark / Masterpiece Identified
                </p>
                <h2 className="text-xl font-black text-[#F0FDF4] leading-tight">
                  {response.monument || "Heritage Masterpiece"}
                </h2>
              </div>
              <div className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }}>
                AI Verified
              </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
              <InfoRow icon="📍" label="Location / Museum" value={response.location} />
              <InfoRow icon="🎨" label="Creator / Builder" value={response.builtBy} />
              <InfoRow icon="🎯" label="Purpose / Meaning" value={response.purpose} />
              <InfoRow icon="📅" label="Era / Year" value={response.year} />
            </div>

            <hr style={{ borderColor: "rgba(34,197,94,0.15)" }} />

            {/* Story */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
                📖 The Story
              </p>
              <p className="text-gray-300 text-sm leading-7">{response.story}</p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[response.monument, response.location?.split(",")[1]?.trim(), "Heritage", "Art History", "AI Scanned"]
                .filter(Boolean)
                .slice(0, 5)
                .map((tag, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ background: "rgba(34,197,94,0.1)", color: "#86EFAC", border: "1px solid rgba(34,197,94,0.2)" }}>
                    #{tag}
                  </span>
                ))}
            </div>

            {/* Actions: Re-scan and New Upload side-by-side */}
            <div className="flex gap-3">
              <button
                onClick={handleScan}
                className="btn-press flex-1 py-3 rounded-xl text-sm font-bold text-[#22C55E] transition-colors"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)" }}
              >
                🔄 Re-scan
              </button>
              <button
                onClick={handleNewUpload}
                className="btn-press flex-1 py-3 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.45)]"
                style={{ background: "linear-gradient(135deg, #22C55E, #16a34a)", boxShadow: "0 4px 15px rgba(34,197,94,0.25)" }}
              >
                ✨ New Upload
              </button>
            </div>
          </div>
        )}

        <div className="h-4" />
      </main>

      {/* ── Bottom navigation ────────────────────────────────── */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-20 flex items-center px-6 py-2 safe-area-pb">
        <NavTab icon="🏛️" label="Scan" active />
        <NavTab icon="📚" label="History" />
        <NavTab icon="🗺️" label="Explore" />
        <NavTab icon="⚙️" label="Settings" />
      </nav>
    </div>
  );
}