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

  // ── Permission Denied / Error UI ───────────────────────────────────────
  if (permissionState === "denied" || permissionState === "error") {
    return (
      <div className="camera-container fade-up">
        <div className="relative rounded-[32px] overflow-hidden glass"
          style={{
            aspectRatio: "4/3",
            background: "rgba(5,8,6,0.5)",
            border: "1.5px solid rgba(239,68,68,0.4)",
          }}>
          <div className="absolute inset-0 scan-grid opacity-30" />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.3)",
              }}>
              <span className="text-3xl">🚫</span>
            </div>
            <p className="text-[#D4AF37] font-bold text-lg">
              {permissionState === "denied" ? "Camera Access Denied" : "Camera Error"}
            </p>
            <p className="text-gray-300 text-xs leading-relaxed max-w-[260px]">
              {errorMessage || "Camera permission was denied. Please allow camera access in your browser settings."}
            </p>
            <div className="flex gap-4 mt-2">
              <button
                onClick={startCamera}
                className="btn-press px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 transition-colors flex items-center gap-2"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <span className="text-blue-400">⟳</span> Try Again
              </button>
              <button
                onClick={onSwitchToUpload}
                className="btn-press px-5 py-2.5 rounded-xl text-sm font-bold text-[#D4AF37] flex items-center gap-2"
                style={{
                  background: "rgba(212, 175, 55, 0.05)",
                  border: "1px solid #D4AF37",
                }}
              >
                <span className="text-[#D4AF37]">📁</span> Upload Instead
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
