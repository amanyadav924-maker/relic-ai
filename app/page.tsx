"use client";

import { useState, useRef, useCallback, useEffect, DragEvent } from "react";
import HeritageBackground from "./components/HeritageBackground";
import { motion, AnimatePresence } from "framer-motion";

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
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-semibold text-slate-700">
      <span
        className={`status-dot w-2 h-2 rounded-full ${scanning ? "bg-amber-400" : "bg-sky-500"}`}
        style={{ boxShadow: scanning ? "0 0 8px #f59e0b" : "0 0 8px #0284c7" }}
      />
      <span>
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
      <hr style={{ borderColor: "rgba(255, 255, 255, 0.45)" }} />
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
        <p className="text-[11px] uppercase tracking-widest text-slate-500 font-bold">{label}</p>
        <p className="text-slate-800 text-sm font-semibold leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ── Bottom nav tab ───────────────────────────────────────────────────────────
function NavTab({ icon, label, active }: { icon: string; label: string; active?: boolean }) {
  return (
    <button className="flex flex-col items-center gap-1 flex-1 py-1 transition-opacity hover:opacity-100"
      style={{ opacity: active ? 1 : 0.45 }}>
      <span className="text-xl">{icon}</span>
      <span className={`text-[10px] font-bold tracking-wide ${active ? "text-sky-600" : "text-slate-500"}`}>
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
          <p className="text-[11px] text-slate-500 font-semibold tracking-widest uppercase mt-0.5">
            Heritage Companion
          </p>
        </div>
        <StatusBadge scanning={loading} />
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <motion.main 
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-10 flex-1 flex flex-col gap-5 px-4 max-w-md mx-auto w-full"
      >

        {/* ── Upload / Camera preview area ─────────────────── */}
        <div className="fade-up delay-100">
          <div
            className={`relative rounded-3xl overflow-hidden cursor-pointer hover-lift transition-all duration-300 ${dragging ? "upload-active" : "glow-border-multi"}`}
            style={{ aspectRatio: "4/3", background: "rgba(255, 255, 255, 0.45)" }}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => !preview && inputRef.current?.click()}
          >
            {/* Scan grid background */}
            <div className="absolute inset-0 scan-grid opacity-35" />

            {preview ? (
              <>
                {/* Preview image */}
                <img src={preview} alt="Uploaded monument"
                  className="absolute inset-0 w-full h-full object-cover" />
                {/* Dim overlay when not loading */}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(to top, rgba(186,230,253,0.4) 0%, transparent 50%)" }} />
                {/* Scanning overlay */}
                {loading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center"
                    style={{ background: "rgba(255, 255, 255, 0.5)" }}>
                    <div className="scan-line" />
                    <div className="mt-auto mb-6 text-center">
                      <p className="text-sky-600 text-sm font-bold tracking-widest uppercase animate-pulse">
                        Scanning Heritage…
                      </p>
                    </div>
                  </div>
                )}
                {/* Change photo button */}
                {!loading && (
                  <button
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="absolute bottom-3 right-3 glass px-3 py-1.5 rounded-xl text-xs font-bold text-sky-600 hover:bg-sky-100/50 transition-colors"
                  >
                    ✦ Change
                  </button>
                )}
                {/* Corner brackets */}
                {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos, i) => (
                  <span key={i} className={`absolute ${pos} w-5 h-5 border-sky-500 opacity-80`}
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
                  style={{ background: "rgba(14,165,233,0.1)", border: "1px solid rgba(14,165,233,0.25)" }}>
                  🏛️
                </div>
                <p className="text-sky-600 font-black text-base">Drop or tap to upload</p>
                <p className="text-slate-500 text-xs leading-relaxed font-medium">
                  Upload a photo of any monument, heritage site, or famous artwork
                </p>
                <div className="flex gap-2 flex-wrap justify-center mt-1">
                  {["JPEG", "PNG", "WEBP"].map(f => (
                    <span key={f} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-600"
                      style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.8)" }}>
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
            className="fade-up delay-200 btn-press hover-lift flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white transition-all shadow-[0_4px_15px_rgba(14,165,233,0.2)]"
            style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)" }}
          >
            <span className="text-lg">📁</span> Upload Image or Artwork
          </button>
        )}

        {/* ── Scan progress bar ─────────────────────────────── */}
        {loading && (
          <div className="fade-in rounded-full overflow-hidden h-1.5" style={{ background: "rgba(14,165,233,0.15)" }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${scanPct}%`,
                background: "linear-gradient(90deg, #0EA5E9, #38BDF8)",
                boxShadow: "0 0 12px rgba(14,165,233,0.4)",
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
                className={`relative pulse-ring btn-press hover-lift flex items-center gap-3 px-10 py-4 rounded-full font-black text-base tracking-wide text-white transition-all duration-300 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                style={{ background: loading ? "#0284C7" : "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 6px 32px rgba(14,165,233,0.3)" }}
              >
                <span className="text-xl">{loading ? "⏳" : "🔍"}</span>
                <span>{loading ? "Scanning Heritage…" : "Scan with Relic AI"}</span>
              </button>
            </div>
            {!loading && (
              <p className="text-[11px] text-slate-500 font-semibold text-center">
                Powered by Gemini Vision · Heritage AI
              </p>
            )}
          </div>
        )}

        {/* ── Error state ───────────────────────────────────── */}
        {error && (
          <div className="fade-up glass px-4 py-3 rounded-2xl flex items-start gap-3"
            style={{ borderColor: "rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
            <span className="text-lg mt-0.5">⚠️</span>
            <p className="text-red-500 text-sm font-semibold leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────── */}
        {loading && <SkeletonCard />}

        {/* ── AI Response card (Framer Motion Enhanced) ──────── */}
        <AnimatePresence>
          {showResult && response && (
            <motion.div 
              ref={resultRef}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 15 }}
              className="fade-up glow-border-multi glass p-5 space-y-5"
              style={{ animationDelay: "0.05s" }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-sky-600 font-bold mb-1">
                    ✦ Landmark / Masterpiece Identified
                  </p>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">
                    {response.monument || "Heritage Masterpiece"}
                  </h2>
                </div>
                <div className="shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: "rgba(14,165,233,0.12)", color: "#0284C7", border: "1px solid rgba(14,165,233,0.25)" }}>
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

              <hr style={{ borderColor: "rgba(255, 255, 255, 0.45)" }} />

              {/* Story */}
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-2">
                  📖 The Story
                </p>
                <p className="text-slate-800 text-sm font-medium leading-7">{response.story}</p>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2">
                {[response.monument, response.location?.split(",")[1]?.trim(), "Heritage", "Art History", "AI Scanned"]
                  .filter(Boolean)
                  .slice(0, 5)
                  .map((tag, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
                      style={{ background: "rgba(14,165,233,0.08)", color: "#0369A1", border: "1px solid rgba(14,165,233,0.18)" }}>
                      #{tag}
                    </span>
                  ))}
              </div>

              {/* Actions: Re-scan and New Upload side-by-side */}
              <div className="flex gap-3">
                <button
                  onClick={handleScan}
                  className="btn-press flex-1 py-3 rounded-xl text-sm font-bold text-sky-600 transition-colors"
                  style={{ background: "rgba(14,165,233,0.06)", border: "1px solid rgba(14,165,233,0.2)" }}
                >
                  🔄 Re-scan
                </button>
                <button
                  onClick={handleNewUpload}
                  className="btn-press flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all duration-300 hover:shadow-[0_0_15px_rgba(14,165,233,0.35)]"
                  style={{ background: "linear-gradient(135deg, #0EA5E9, #0284C7)", boxShadow: "0 4px 15px rgba(14,165,233,0.15)" }}
                >
                  ✨ New Upload
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="h-4" />
      </motion.main>

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