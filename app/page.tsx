"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { parseAIResponse, type ParsedResponse } from "@/app/lib/parseAIResponse";
import { useSpeechSynthesis } from "@/app/hooks/useSpeechSynthesis";

import { Camera, Map, Clock, Settings, Upload } from "lucide-react";
import { ReactNode } from "react";

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
  icon: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      className="flex flex-col items-center gap-1.5 flex-1 py-1.5 transition-opacity hover:opacity-100"
      style={{ opacity: active ? 1 : 0.5 }}
      onClick={onClick}
    >
      <div className={`${active ? "text-[#0ea5e9]" : "text-slate-400"} drop-shadow-sm transition-colors`}>{icon}</div>
      <span
        className={`text-[10px] font-bold tracking-wide ${
          active ? "text-[#0ea5e9]" : "text-slate-500"
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

  const isScanningRef = useRef(false);

  // ── Core scan function — shared by both modes ──────────────────────────
  const handleScan = useCallback(
    async (b64?: string, mime?: string) => {
      if (isScanningRef.current) return;
      
      const scanB64 = b64 || imageB64;
      const scanMime = mime || mimeType;
      if (!scanB64) {
        setError("No image to scan. Please capture or upload an image first.");
        return;
      }
      
      isScanningRef.current = true;
      setLoading(true);
      setError("");
      setResponse(null);
      setShowResult(false);
      stopSpeech();

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout to allow server retries

      try {
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: scanB64, mimeType: scanMime }),
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Scan failed");
        
        setScanPct(100);
        await new Promise(r => setTimeout(r, 400));
        setResponse(parseAIResponse(data.text));
        setShowResult(true);
      } catch (err: unknown) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === "AbortError") {
          setError("Request timed out. The AI service is taking too long to respond. Please try again.");
        } else {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong. Please try again."
          );
        }
      } finally {
        setLoading(false);
        isScanningRef.current = false;
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
    <div className="relative min-h-screen flex flex-col overflow-x-hidden pb-24 bg-transparent">
      
      {/* ── Background Elements ───────────────────────────── */}
      {/* Floating Clouds */}
      <div className="cloud w-32 h-16 top-[10%] opacity-80" style={{ animationDuration: '40s' }} />
      <div className="cloud w-48 h-20 top-[20%] opacity-60" style={{ animationDuration: '55s', animationDelay: '-10s' }} />
      <div className="cloud w-24 h-12 top-[35%] opacity-70" style={{ animationDuration: '30s', animationDelay: '-20s' }} />
      <div className="cloud w-56 h-24 top-[5%] opacity-50" style={{ animationDuration: '70s', animationDelay: '-30s' }} />
      
      {/* Skyline Background (Fixed to bottom, behind reflection) */}
      <div 
        className="fixed bottom-0 left-0 right-0 h-[35vh] bg-contain bg-bottom bg-repeat-x z-0 pointer-events-none opacity-[0.85]"
        style={{ backgroundImage: "url('/skyline.png')" }}
      />
      
      {/* Reflection floor gradient */}
      <div className="reflection-floor" />

      {/* ── Subtle radial glow behind hero ──────────────────── */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% -10%, rgba(255,255,255,0.4) 0%, transparent 70%)",
        }}
      />

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-10 pb-4 fade-in">
        <div>
          <h1 className="text-3xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-indigo-500 to-pink-500 drop-shadow-sm">
            Relic <span className="text-pink-500">AI</span>
          </h1>
          <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase mt-0.5">
            Heritage Companion
          </p>
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
              borderColor: "rgba(239,68,68,0.3)",
              background: "rgba(255,255,255,0.9)",
              boxShadow: "0 4px 14px rgba(239,68,68,0.1)",
            }}
          >
            <span className="text-lg mt-0.5">⚠️</span>
            <div className="flex-1">
              <p className="text-red-500 text-sm font-semibold leading-relaxed">{error}</p>
              <button
                onClick={handleNewScan}
                className="mt-2 text-xs font-bold text-[#0ea5e9] hover:underline"
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
      <nav className="bottom-nav fixed bottom-0 left-0 right-0 z-20 flex items-center px-6 py-2 safe-area-pb">
        <NavTab
          icon={<Camera size={22} strokeWidth={2.5} />}
          label="Camera"
          active={mode === "camera"}
          onClick={() => {
            handleNewScan();
            setMode("camera");
          }}
        />
        <NavTab
          icon={<Upload size={22} strokeWidth={2.5} />}
          label="Upload"
          active={mode === "upload"}
          onClick={() => {
            handleNewScan();
            setMode("upload");
          }}
        />
        <NavTab icon={<Clock size={22} strokeWidth={2.5} />} label="History" />
        <NavTab icon={<Settings size={22} strokeWidth={2.5} />} label="Settings" />
      </nav>
    </div>
  );
}