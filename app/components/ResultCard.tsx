"use client";

import { useRef, useEffect } from "react";
import type { ParsedResponse } from "@/app/lib/parseAIResponse";
import { VoiceNarration } from "./VoiceNarration";

// ── AI Result Card ───────────────────────────────────────────────────────────
// Displays the parsed AI analysis response with rich metadata, story section,
// tags, voice narration controls, and action buttons.

// Helper: info row inside the response card
function InfoRow({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-[11px] uppercase tracking-widest text-gray-500 font-semibold">
          {label}
        </p>
        <p className="text-[#F0FDF4] text-sm font-medium leading-snug">
          {value}
        </p>
      </div>
    </div>
  );
}

// Skeleton loader shown while AI analyzes
export function SkeletonCard() {
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

interface ResultCardProps {
  response: ParsedResponse;
  /** Preview image (data URL or blob URL) */
  previewImage?: string;
  onRescan: () => void;
  onNewScan: () => void;
  /** Voice narration state */
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isSpeechSupported: boolean;
}

export function ResultCard({
  response,
  previewImage,
  onRescan,
  onNewScan,
  isSpeaking,
  isMuted,
  onToggleMute,
  isSpeechSupported,
}: ResultCardProps) {
  const resultRef = useRef<HTMLDivElement>(null);

  // Scroll into view when mounted
  useEffect(() => {
    setTimeout(
      () => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      150
    );
  }, []);

  return (
    <div
      ref={resultRef}
      className="fade-up glow-border glass p-5 space-y-5"
      style={{ animationDelay: "0.05s" }}
    >
      {/* ── Card header with voice controls ──────────────────── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <p className="text-[10px] uppercase tracking-widest text-[#22C55E] font-bold mb-1">
            ✦ Landmark / Masterpiece Identified
          </p>
          <h2 className="text-xl font-black text-[#F0FDF4] leading-tight">
            {response.monument || "Heritage Masterpiece"}
          </h2>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <VoiceNarration
            isSpeaking={isSpeaking}
            isMuted={isMuted}
            onToggleMute={onToggleMute}
            isSupported={isSpeechSupported}
          />
          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-bold"
            style={{
              background: "rgba(34,197,94,0.15)",
              color: "#22C55E",
              border: "1px solid rgba(34,197,94,0.3)",
            }}
          >
            AI Verified
          </div>
        </div>
      </div>

      {/* ── Captured image thumbnail ─────────────────────────── */}
      {previewImage && (
        <div className="rounded-2xl overflow-hidden" style={{ maxHeight: "160px" }}>
          <img
            src={previewImage}
            alt="Scanned heritage"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* ── Info grid ────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3.5">
        <InfoRow icon="📍" label="Location / Museum" value={response.location} />
        <InfoRow icon="🎨" label="Creator / Builder" value={response.builtBy} />
        <InfoRow icon="🎯" label="Purpose / Meaning" value={response.purpose} />
        <InfoRow icon="📅" label="Era / Year" value={response.year} />
        <InfoRow icon="🏗️" label="Architecture Style" value={response.architectureStyle} />
        <InfoRow icon="🌍" label="Civilization / Culture" value={response.civilization} />
      </div>

      {/* ── Interesting Facts ────────────────────────────────── */}
      {response.interestingFacts && (
        <>
          <hr style={{ borderColor: "rgba(34,197,94,0.15)" }} />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
              💡 Interesting Facts
            </p>
            <p className="text-gray-300 text-sm leading-7">
              {response.interestingFacts}
            </p>
          </div>
        </>
      )}

      {/* ── Tourism Tips ─────────────────────────────────────── */}
      {response.tourismTips && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
            🧳 Tourism Tips
          </p>
          <p className="text-gray-300 text-sm leading-7">
            {response.tourismTips}
          </p>
        </div>
      )}

      <hr style={{ borderColor: "rgba(34,197,94,0.15)" }} />

      {/* ── Story ────────────────────────────────────────────── */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-gray-500 font-bold mb-2">
          📖 The Story
        </p>
        <p className="text-gray-300 text-sm leading-7">{response.story}</p>
      </div>

      {/* ── Tags ─────────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {[
          response.monument,
          response.location?.split(",")[1]?.trim(),
          response.civilization,
          "Heritage",
          "AI Scanned",
        ]
          .filter(Boolean)
          .slice(0, 5)
          .map((tag, i) => (
            <span
              key={i}
              className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
              style={{
                background: "rgba(34,197,94,0.1)",
                color: "#86EFAC",
                border: "1px solid rgba(34,197,94,0.2)",
              }}
            >
              #{tag}
            </span>
          ))}
      </div>

      {/* ── Actions ──────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button
          onClick={onRescan}
          className="btn-press flex-1 py-3 rounded-xl text-sm font-bold text-[#22C55E] transition-colors"
          style={{
            background: "rgba(34,197,94,0.08)",
            border: "1px solid rgba(34,197,94,0.25)",
          }}
        >
          🔄 Re-scan
        </button>
        <button
          onClick={onNewScan}
          className="btn-press flex-1 py-3 rounded-xl text-sm font-bold text-black transition-all duration-300 hover:shadow-[0_0_15px_rgba(34,197,94,0.45)]"
          style={{
            background: "linear-gradient(135deg, #22C55E, #16a34a)",
            boxShadow: "0 4px 15px rgba(34,197,94,0.25)",
          }}
        >
          ✨ New Scan
        </button>
      </div>
    </div>
  );
}
