"use client";

import { useState, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { parseAIResponse, type ParsedResponse } from "@/app/lib/parseAIResponse";
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis";

import { Particles } from "@/app/components/Particles";
import { StatusBadge } from "@/app/components/StatusBadge";
import { CameraScanner } from "@/app/components/CameraScanner";
import { ImageUploader } from "@/app/components/ImageUploader";
import { ResultCard, SkeletonCard } from "@/app/components/ResultCard";

// ── Mode types ───────────────────────────────────────────────────────────────
type ScanMode = "camera" | "upload";

// ── Bottom nav tab ───────────────────────────────────────────────────────────
function NavTab({
  icon,
  label,
  active,
  onClick,
}: {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex flex-col items-center gap-1 flex-1 py-1 transition-opacity hover:opacity-100"
      style={{ opacity: active ? 1 : 0.4 }}
      onClick={onClick}
    >
      <span className="text-xl">{icon}</span>
      <span
        className={`text-[10px] font-semibold tracking-wide mt-1 ${
          active ? "text-[#D4AF37]" : "text-gray-500"
        }`}
      >
        {label}
      </span>
    </button>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function Home() {
  // Mode: camera (default) or upload
  const [mode, setMode] = useState<ScanMode>("camera");

  // Parallax state for cinematic mouse movement with Framer Motion
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 30, stiffness: 60 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const parallaxX = useTransform(smoothMouseX, [0, 1], [30, -30]);
  const parallaxY = useTransform(smoothMouseY, [0, 1], [30, -30]);
  const foregroundX = useTransform(smoothMouseX, [0, 1], [60, -60]);
  const foregroundY = useTransform(smoothMouseY, [0, 1], [60, -60]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Shared state across both modes
  const [preview, setPreview] = useState<string>("");
  const [imageB64, setImageB64] = useState<string>("");
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [loading, setLoading] = useState(false);
  const [scanPct, setScanPct] = useState(0);
  const [response, setResponse] = useState<ParsedResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [showResult, setShowResult] = useState(false);

  // Voice narration
  const { speak, stop: stopSpeech, isSpeaking, isMuted, toggleMute, isSupported: isSpeechSupported } =
    useSpeechSynthesis();

  // ── Animate scan progress bar while loading ────────────────────────────
  useEffect(() => {
    if (!loading) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setScanPct(0);
      return;
    }
    setScanPct(0);
    const steps = [15, 35, 55, 72, 88];
    let i = 0;
    const t = setInterval(() => {
      if (i < steps.length) {
        setScanPct(steps[i++]);
      } else {
        clearInterval(t);
      }
    }, 600);
    return () => clearInterval(t);
  }, [loading]);

  // ── Auto-narrate when results appear ───────────────────────────────────
  useEffect(() => {
    if (showResult && response && !isMuted) {
      // Build narration text from the response
      const parts: string[] = [];
      if (response.monument) parts.push(`This is ${response.monument}.`);
      if (response.location) parts.push(`Located at ${response.location}.`);
      if (response.year) parts.push(`Built in ${response.year}.`);
      if (response.builtBy) parts.push(`Created by ${response.builtBy}.`);
      if (response.story) parts.push(response.story);
      if (parts.length > 0) {
        speak(parts.join(" "));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showResult, response]);

  // ── File processing for upload mode ────────────────────────────────────
  const processFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file.");
      return;
    }
    setError("");
    setResponse(null);
    setShowResult(false);
    stopSpeech();
    setPreview(URL.createObjectURL(file));
    setMimeType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onloadend = () => {
      const b64 = reader.result?.toString().split(",")[1] ?? "";
      setImageB64(b64);
    };
    reader.readAsDataURL(file);
  }, [stopSpeech]);

  // ── Core scan function — shared by both modes ──────────────────────────
  const handleScan = useCallback(
    async (b64?: string, mime?: string) => {
      const scanB64 = b64 || imageB64;
      const scanMime = mime || mimeType;
      if (!scanB64) {
        setError("No image to scan. Please capture or upload an image first.");
        return;
      }
      setLoading(true);
      setError("");
      setResponse(null);
      setShowResult(false);
      stopSpeech();

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: scanB64, mimeType: scanMime }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed");
        setScanPct(100);
        await new Promise(r => setTimeout(r, 400));
        setResponse(parseAIResponse(data.text));
        setShowResult(true);
      } catch (err: unknown) {
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    [imageB64, mimeType, stopSpeech]
  );

  // ── Camera capture handler — auto-scans ────────────────────────────────
  const handleCameraCapture = useCallback(
    (base64: string, dataUrl: string) => {
      setPreview(dataUrl);
      setImageB64(base64);
      setMimeType("image/jpeg");
      // Auto-scan immediately after capture
      handleScan(base64, "image/jpeg");
    },
    [handleScan]
  );

  // ── Reset for new scan ─────────────────────────────────────────────────
  const handleNewScan = useCallback(() => {
    setPreview("");
    setImageB64("");
    setMimeType("image/jpeg");
    setLoading(false);
    setScanPct(0);
    setResponse(null);
    setError("");
    setShowResult(false);
    stopSpeech();
  }, [stopSpeech]);

  // ── Switch mode ────────────────────────────────────────────────────────
  const switchToMode = useCallback(
    (newMode: ScanMode) => {
      if (newMode === mode) return;
      handleNewScan();
      setMode(newMode);
    },
    [mode, handleNewScan]
  );

  return (
    <div
      className="relative min-h-screen flex flex-col overflow-x-hidden pb-24 bg-[#0B0F0C]"
    >
      {/* ── Cinematic Background with Mouse Parallax & Drift ─────────────────────────────── */}
      <motion.div 
        className="fixed inset-0 z-0 bg-center bg-no-repeat"
       
        style={{
  backgroundImage: typeof window !== "undefined" && window.innerWidth < 768
    ? "url('/mobile-bg.png')"
    : "url('/new-bg.png')",
  backgroundSize: "cover",
  backgroundPosition: "center",

  filter: "brightness(1.05) contrast(1.05)"
}}/>
      {/* — Volumetric Fog & Ground Mist _____________________ */}
      <div className="fixed inset-0 z-0 pointer-events-none moving-fog opacity-60" />
      <div className="fixed bottom-0 left-0 right-0 h-[50vh] z-0 pointer-events-none ground-mist opacity-80" />
      
      
     

      {/* ── Minimal Dark Overlay for UI Contrast (reduced opacity) ──────────────────── */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#0B0F0C]/10 via-transparent to-[#0B0F0C]/60 pointer-events-none" />

      {/* ── Background floating dust particles ─────────────────────────────── */}
      <Particles />

      {/* ── Subtle radial glow behind hero ──────────────────── */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(34,197,94,0.12) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-6 pt-12 pb-4 fade-in">
        <div className="flex flex-col">
          <h1 
            className="text-[34px] font-serif tracking-wide flex items-center gap-2 leading-none"
            style={{ 
              color: "#FDE047", 
              textShadow: "0 0 15px rgba(212, 175, 55, 0.6), 0 0 30px rgba(212, 175, 55, 0.3)" 
            }}
          >
            Relic AI <span className="text-[22px] animate-pulse drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]">✨</span>
          </h1>
          
          <div className="flex items-center gap-3 mt-2">
            <p className="text-[9px] text-[#D4AF37] font-semibold tracking-[0.3em] uppercase opacity-90">
              Heritage Scanner
            </p>
            <div className="flex items-center">
              <div className="w-1 h-1 rounded-full bg-[#FDE047] shadow-[0_0_8px_2px_rgba(253,224,71,0.6)]" />
              <div className="w-16 h-[1px] bg-gradient-to-r from-[#D4AF37] to-transparent opacity-40 ml-1" />
            </div>
          </div>
        </div>
        <StatusBadge
          scanning={loading}
          cameraActive={mode === "camera" && !loading && !showResult}
        />
      </header>

      {/* ── Main content ────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col gap-5 px-4 max-w-md mx-auto w-full">
        {/* ── Mode Switcher ──────────────────────────────────── */}
        {!showResult && (
          <div className="mode-switcher fade-up delay-100">
            <button
              className={`mode-tab ${mode === "camera" ? "active" : ""}`}
              onClick={() => switchToMode("camera")}
            >
              <span>📸</span> Camera
            </button>
            <button
              className={`mode-tab ${mode === "upload" ? "active" : ""}`}
              onClick={() => switchToMode("upload")}
            >
              <span>📁</span> Upload
            </button>
          </div>
        )}

        {/* ── Camera Mode ────────────────────────────────────── */}
        {mode === "camera" && !showResult && (
          <CameraScanner
            loading={loading}
            onCapture={handleCameraCapture}
            onSwitchToUpload={() => switchToMode("upload")}
          />
        )}

        {/* ── Upload Mode ────────────────────────────────────── */}
        {mode === "upload" && !showResult && (
          <ImageUploader
            preview={preview}
            loading={loading}
            onFileSelected={processFile}
            onScan={() => handleScan()}
            scanPct={scanPct}
          />
        )}

        {/* ── Scan progress bar (camera mode) ────────────────── */}
        {mode === "camera" && loading && (
          <div
            className="fade-in rounded-full overflow-hidden h-1.5"
            style={{ background: "rgba(34,197,94,0.12)" }}
          >
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${scanPct}%`,
                background: "linear-gradient(90deg, #22C55E, #86EFAC)",
                boxShadow: "0 0 12px rgba(34,197,94,0.6)",
              }}
            />
          </div>
        )}

        {/* ── Error state ────────────────────────────────────── */}
        {error && (
          <div
            className="fade-up glass px-4 py-3 rounded-2xl flex items-start gap-3"
            style={{
              borderColor: "rgba(239,68,68,0.4)",
              background: "rgba(239,68,68,0.06)",
            }}
          >
            <span className="text-lg mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-red-400 text-sm leading-relaxed">{error}</p>
              <button
                onClick={handleNewScan}
                className="mt-2 text-xs font-bold text-[#22C55E] hover:underline"
              >
                ← Try again
              </button>
            </div>
          </div>
        )}

        {/* ── Loading skeleton ───────────────────────────────── */}
        {loading && <SkeletonCard />}

        {/* ── AI Response card ───────────────────────────────── */}
        {showResult && response && (
          <ResultCard
            response={response}
            previewImage={preview}
            onRescan={() => handleScan()}
            onNewScan={handleNewScan}
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            onToggleMute={toggleMute}
            isSpeechSupported={isSpeechSupported}
          />
        )}

        <div className="h-4" />
      </main>

      {/* ── Bottom navigation ────────────────────────────────── */}
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-3 safe-area-pb">
        {/* The 'R' Logo */}
        <div className="flex flex-col items-center justify-center w-[50px]">
          <div className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center mt-1">
            <span className="font-serif text-xl text-gray-300">R</span>
          </div>
        </div>
        
        <NavTab
          icon="📸"
          label="Camera"
          active={mode === "camera"}
          onClick={() => {
            handleNewScan();
            setMode("camera");
          }}
        />
        <NavTab
          icon="📁"
          label="Upload"
          active={mode === "upload"}
          onClick={() => {
            handleNewScan();
            setMode("upload");
          }}
        />
        <NavTab icon="🕒" label="History" />
        <NavTab icon="⚙️" label="Settings" />
      </nav>
    </div>
  );
}