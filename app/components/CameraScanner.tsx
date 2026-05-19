"use client";

import { useEffect, useCallback } from "react";
import { useCamera } from "@/app/hooks/useCamera";
import { ScanningOverlay } from "./ScanningOverlay";

// ── Live Camera Scanner ──────────────────────────────────────────────────────
// Full camera viewport with HUD overlay, capture button, and permission handling.

interface CameraScannerProps {
  /** Whether the AI is currently analyzing a captured frame */
  loading: boolean;
  /** Called when a frame is captured: receives base64 string and data URL */
  onCapture: (base64: string, dataUrl: string) => void;
  /** Called when the user wants to switch to upload mode */
  onSwitchToUpload: () => void;
}

export function CameraScanner({
  loading,
  onCapture,
  onSwitchToUpload,
}: CameraScannerProps) {
  const {
    permissionState,
    videoRef,
    isStreaming,
    startCamera,
    stopCamera,
    captureFrame,
    switchCamera,
    hasMultipleCameras,
    errorMessage,
  } = useCamera();

  // Start camera on mount
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCapture = useCallback(() => {
    if (loading) return;
    const result = captureFrame();
    if (result) {
      onCapture(result.base64, result.dataUrl);
    }
  }, [captureFrame, loading, onCapture]);

  // ── Permission Request UI ──────────────────────────────────────────────
  if (permissionState === "idle" || permissionState === "requesting") {
    return (
      <div className="camera-container fade-up">
        <div className="relative rounded-[32px] overflow-hidden glow-border glass"
          style={{ aspectRatio: "4/3", background: "rgba(5,8,6,0.5)" }}>
          <div className="absolute inset-0 scan-grid opacity-40" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "2px solid rgba(34,197,94,0.3)",
              }}>
              <span className="text-4xl animate-pulse">📸</span>
            </div>
            <p className="text-[#22C55E] font-bold text-base">
              {permissionState === "requesting"
                ? "Requesting camera access…"
                : "Camera access needed"}
            </p>
            <p className="text-gray-500 text-xs leading-relaxed max-w-[260px]">
              Allow camera access to scan monuments and historical artifacts in real time
            </p>
            {permissionState === "idle" && (
              <button
                onClick={startCamera}
                className="btn-press hover-lift px-6 py-2.5 rounded-full font-bold text-sm text-black"
                style={{
                  background: "linear-gradient(135deg, #22C55E, #16a34a)",
                  boxShadow: "0 4px 20px rgba(34,197,94,0.35)",
                }}
              >
                Enable Camera
              </button>
            )}
            {permissionState === "requesting" && (
              <div className="flex items-center gap-2 text-gray-400 text-xs">
                <span className="inline-block w-4 h-4 border-2 border-[#22C55E] border-t-transparent rounded-full animate-spin" />
                Waiting for permission…
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Permission Denied / Error UI (Cinematic Modal) ───────────────────────
  if (permissionState === "denied" || permissionState === "error") {
    return (
      <div className="w-full max-w-md mx-auto fade-up mt-8">
        <div 
          className="relative rounded-[32px] overflow-hidden glass p-10 text-center"
          style={{
            background: "rgba(5, 8, 6, 0.65)",
            border: "1px solid rgba(212, 175, 55, 0.4)",
            boxShadow: "0 25px 50px rgba(0, 0, 0, 0.7), 0 0 40px rgba(212, 175, 55, 0.1) inset",
          }}
        >
          {/* Subtle animated gradient glow behind the content */}
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(212,175,55,0.05)] to-transparent pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center justify-center gap-6">
            
            {/* Circular red denied icon */}
            <div className="w-20 h-20 rounded-full flex items-center justify-center relative"
              style={{
                background: "radial-gradient(circle, rgba(239,68,68,0.15) 0%, rgba(239,68,68,0.02) 100%)",
                border: "1px solid rgba(239,68,68,0.4)",
                boxShadow: "0 0 20px rgba(239,68,68,0.2), inset 0 0 10px rgba(239,68,68,0.1)",
              }}>
              <span className="text-4xl drop-shadow-[0_0_10px_rgba(239,68,68,0.6)]">🚫</span>
            </div>

            {/* Typography Hierarchy */}
            <div className="flex flex-col gap-2">
              <h2 className="text-[22px] font-serif tracking-wide"
                style={{
                  color: "#D4AF37",
                  textShadow: "0 0 15px rgba(212, 175, 55, 0.4)",
                }}>
                {permissionState === "denied" ? "Camera Access Denied" : "Camera Error"}
              </h2>
              <p className="text-gray-200 text-sm font-medium tracking-wide">
                Camera permission was denied.
              </p>
              <p className="text-gray-400 text-xs leading-relaxed max-w-[260px] mx-auto mt-1">
                {errorMessage || "Please allow camera access in your browser settings to scan heritage artifacts."}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 mt-4 w-full">
              <button
                onClick={startCamera}
                className="flex-1 btn-glass btn-glass-blue py-3 font-semibold flex items-center justify-center gap-2"
              >
                <span className="opacity-80">⟳</span> Try Again
              </button>
              <button
                onClick={onSwitchToUpload}
                className="flex-1 btn-glass btn-glass-gold py-3 font-bold flex items-center justify-center gap-2"
              >
                📁 Upload Instead
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Live Camera View ───────────────────────────────────────────────────
  return (
    <div className="camera-container fade-up">
      <div
        className="relative rounded-[32px] overflow-hidden glow-border glass"
        style={{ aspectRatio: "4/3", background: "#000" }}
      >
        {/* Live video feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: "scaleX(1)" }}
        />

        {/* Scan grid overlay */}
        <div className="absolute inset-0 scan-grid opacity-30 pointer-events-none" />

        {/* Scanning overlay when AI is analyzing */}
        <ScanningOverlay active={loading} label="AI Analyzing…" />

        {/* HUD corner brackets (visible when not loading) */}
        {!loading && isStreaming && (
          <>
            {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(
              (pos, i) => (
                <span
                  key={i}
                  className={`absolute ${pos} w-6 h-6 border-[#22C55E] hud-bracket pointer-events-none`}
                  style={{
                    borderTopWidth: i < 2 ? 2 : 0,
                    borderBottomWidth: i >= 2 ? 2 : 0,
                    borderLeftWidth: i % 2 === 0 ? 2 : 0,
                    borderRightWidth: i % 2 === 1 ? 2 : 0,
                  }}
                />
              )
            )}
          </>
        )}

        {/* Camera switch button */}
        {hasMultipleCameras && !loading && (
          <button
            onClick={e => {
              e.stopPropagation();
              switchCamera();
            }}
            className="absolute top-3 right-3 z-20 glass px-2.5 py-2 rounded-xl text-sm btn-press hover:bg-[rgba(34,197,94,0.15)] transition-colors"
            title="Switch camera"
          >
            🔄
          </button>
        )}

        {/* Bottom HUD info bar */}
        {isStreaming && !loading && (
          <div className="absolute bottom-0 left-0 right-0 z-10 px-4 py-3 flex items-center justify-between pointer-events-none"
            style={{
              background: "linear-gradient(to top, rgba(11,15,12,0.8) 0%, transparent 100%)",
            }}>
            <span className="text-[10px] text-gray-400 font-medium tracking-wider uppercase">
              ● LIVE
            </span>
            <span className="text-[10px] text-gray-500 font-medium tracking-wider">
              Point at a monument
            </span>
          </div>
        )}
      </div>

      {/* ── Capture Button ─────────────────────────────────────── */}
      {isStreaming && (
        <div className="mt-5 flex flex-col items-center gap-3 fade-up delay-200">
          <div className="relative">
            <button
              onClick={handleCapture}
              disabled={loading}
              className={`capture-btn relative pulse-ring btn-press hover-lift flex items-center gap-3 px-10 py-4 rounded-full font-black text-base tracking-wide text-black transition-all duration-300 ${
                loading ? "opacity-60 cursor-not-allowed" : ""
              }`}
              style={{
                background: loading
                  ? "#4b7a5e"
                  : "linear-gradient(135deg, #22C55E, #16a34a)",
                boxShadow: "0 6px 32px rgba(34,197,94,0.4)",
              }}
            >
              <span className="text-xl">{loading ? "⏳" : "📸"}</span>
              <span>{loading ? "Scanning Heritage…" : "Capture & Scan"}</span>
            </button>
          </div>
          {!loading && (
            <p className="text-[11px] text-gray-600 text-center">
              Tap to capture · AI powered by Gemini Vision
            </p>
          )}
        </div>
      )}
    </div>
  );
}
