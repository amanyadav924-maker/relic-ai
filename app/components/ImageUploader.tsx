"use client";

import { useRef, useCallback, useState, DragEvent } from "react";
import { ScanningOverlay } from "./ScanningOverlay";

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
        className={`relative rounded-3xl overflow-hidden cursor-pointer hover-lift transition-all duration-300 ${
          dragging ? "upload-active" : "glow-border"
        }`}
        style={{ aspectRatio: "4/3", background: "rgba(15,22,17,0.6)" }}
        onDragOver={e => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        {/* Scan grid background */}
        <div className="absolute inset-0 scan-grid opacity-60" />

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
                  "linear-gradient(to top, rgba(11,15,12,0.7) 0%, transparent 50%)",
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
                className="absolute bottom-3 right-3 z-20 glass px-3 py-1.5 rounded-xl text-xs font-semibold text-[#22C55E] hover:bg-[rgba(34,197,94,0.15)] transition-colors"
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
                  className={`absolute ${pos} w-5 h-5 border-[#22C55E] opacity-80`}
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
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              🏛️
            </div>
            <p className="text-[#22C55E] font-bold text-base">
              Drop or tap to upload
            </p>
            <p className="text-gray-500 text-xs leading-relaxed">
              Upload a photo of any monument, heritage site, or famous artwork
            </p>
            <div className="flex gap-2 flex-wrap justify-center mt-1">
              {["JPEG", "PNG", "WEBP"].map(f => (
                <span
                  key={f}
                  className="px-2 py-0.5 rounded-full text-[10px] font-bold text-gray-400"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
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
          className="mt-4 fade-up delay-200 btn-press hover-lift flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl font-bold text-sm text-black transition-all"
          style={{
            background: "linear-gradient(135deg, #22C55E, #16a34a)",
          }}
        >
          <span className="text-lg">📁</span> Upload Image or Artwork
        </button>
      )}

      {/* ── Scan progress bar ───────────────────────────────── */}
      {loading && (
        <div
          className="mt-4 fade-in rounded-full overflow-hidden h-1.5"
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

      {/* ── Scan CTA button ─────────────────────────────────── */}
      {preview && !loading && (
        <div className="mt-4 fade-up delay-300 flex flex-col items-center gap-3">
          <div className="relative">
            <button
              onClick={onScan}
              className="relative pulse-ring btn-press hover-lift flex items-center gap-3 px-10 py-4 rounded-full font-black text-base tracking-wide text-black transition-all duration-300"
              style={{
                background: "linear-gradient(135deg, #22C55E, #16a34a)",
                boxShadow: "0 6px 32px rgba(34,197,94,0.4)",
              }}
            >
              <span className="text-xl">🔍</span>
              <span>Scan with Relic AI</span>
            </button>
          </div>
          <p className="text-[11px] text-gray-600 text-center">
            Powered by Gemini Vision · Heritage AI
          </p>
        </div>
      )}
    </div>
  );
}
