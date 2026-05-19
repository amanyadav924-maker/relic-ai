"use client";

import { useRef, useCallback, useState, DragEvent } from "react";
import { ScanningOverlay } from "./ScanningOverlay";
import { Landmark } from "lucide-react";

// ── Image Upload Component ───────────────────────────────────────────────────
// Handles file upload via click, drag-and-drop, or file picker. Displays the
// preview with scanning overlay and corner brackets.

interface ImageUploaderProps {
  preview: string;
  loading: boolean;
  onFileSelected: (file: File) => void;
  onScan: () => void;
  scanPct: number;
}

export function ImageUploader({
  preview,
  loading,
  onFileSelected,
  onScan,
  scanPct,
}: ImageUploaderProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onFileSelected(file);
    },
    [onFileSelected]
  );

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="fade-up delay-100">
      {/* ── Preview / Drop zone ─────────────────────────────── */}
      <div
        className={`relative rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 ${
          dragging ? "upload-active" : "glass-upload-card"
        }`}
        style={{ aspectRatio: "4/3" }}
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        {/* Scan grid background */}
        <div className="absolute inset-0 scan-grid opacity-80" />

        {preview ? (
          <>
            {/* Preview image */}
            <img
              src={preview}
              alt="Uploaded monument"
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(to top, rgba(255,255,255,0.8) 0%, transparent 50%)",
              }}
            />
            {/* Scanning overlay */}
            <ScanningOverlay active={loading} label="Analyzing Image…" />

            {/* Change photo button */}
            {!loading && (
              <button
                onClick={e => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="absolute bottom-3 right-3 z-20 glass px-3 py-1.5 rounded-xl text-xs font-bold text-[#0284c7] hover:bg-[rgba(255,255,255,0.4)] transition-colors"
              >
                ✦ Change
              </button>
            )}

            {/* Corner brackets (static, visible when not scanning) */}
            {!loading &&
              [
                "top-3 left-3",
                "top-3 right-3",
                "bottom-3 left-3",
                "bottom-3 right-3",
              ].map((pos, i) => (
                <span
                  key={i}
                  className={`absolute ${pos} w-5 h-5 border-[#ffffff] shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-90`}
                  style={{
                    borderTopWidth: i < 2 ? 2 : 0,
                    borderBottomWidth: i >= 2 ? 2 : 0,
                    borderLeftWidth: i % 2 === 0 ? 2 : 0,
                    borderRightWidth: i % 2 === 1 ? 2 : 0,
                  }}
                />
              ))}
          </>
        ) : (
          /* Empty state */
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(15, 23, 42, 0.05)",
                border: "1px solid rgba(15, 23, 42, 0.05)",
              }}
            >
              <Landmark size={32} className="text-slate-400" />
            </div>
            <p className="text-[#0284c7] font-bold text-lg mt-2">
              Drop or tap to upload
            </p>
            <p className="text-slate-500 text-sm leading-relaxed max-w-[280px] mx-auto font-medium">
              Upload a photo of any monument, heritage site, or famous artwork
            </p>
            <div className="flex gap-2 flex-wrap justify-center mt-3">
              {["JPEG", "PNG", "WEBP"].map(f => (
                <span
                  key={f}
                  className="px-3 py-1.5 rounded-full text-[11px] font-bold text-slate-600"
                  style={{
                    background: "#ffffff",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                  }}
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {/* ── Upload button (when no preview) ─────────────────── */}
      {!preview && (
        <button
          onClick={() => inputRef.current?.click()}
          className="mt-5 fade-up delay-200 btn-press hover-lift flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-lg shadow-sky-500/20"
          style={{
            background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
          }}
        >
          <span className="text-lg">📁</span> Upload Image or Artwork
        </button>
      )}

      {/* ── Scan progress bar ───────────────────────────────── */}
      {loading && (
        <div
          className="mt-4 fade-in rounded-full overflow-hidden h-1.5"
          style={{ background: "rgba(14, 165, 233, 0.15)" }}
        >
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${scanPct}%`,
              background: "linear-gradient(90deg, #0ea5e9, #7dd3fc)",
              boxShadow: "0 0 12px rgba(14,165,233,0.6)",
            }}
          />
        </div>
      )}

      {/* ── Scan CTA button ─────────────────────────────────── */}
      {preview && !loading && (
        <div className="mt-4 fade-up delay-300 flex flex-col items-center gap-3">
          <div className="relative">
            <button
              onClick={onScan}
              className="capture-btn btn-press hover-lift flex items-center gap-3 px-10 py-4 rounded-full font-black text-base tracking-wide text-white transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              }}
            >
              <span className="text-xl">🔍</span>
              <span>Scan with Relic AI</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500 font-medium text-center">
            Powered by Gemini Vision · Heritage AI
          </p>
        </div>
      )}
    </div>
  );
}
