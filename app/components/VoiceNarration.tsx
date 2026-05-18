"use client";

// ── Voice Narration Controls ─────────────────────────────────────────────────
// Provides mute/unmute toggle with visual feedback for speech narration.

interface VoiceNarrationProps {
  isSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  isSupported: boolean;
}

export function VoiceNarration({
  isSpeaking,
  isMuted,
  onToggleMute,
  isSupported,
}: VoiceNarrationProps) {
  if (!isSupported) return null;

  return (
    <button
      onClick={onToggleMute}
      className="voice-btn btn-press relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300"
      style={{
        background: isMuted
          ? "rgba(107,114,128,0.15)"
          : "rgba(34,197,94,0.12)",
        border: `1px solid ${isMuted ? "rgba(107,114,128,0.3)" : "rgba(34,197,94,0.3)"}`,
        color: isMuted ? "#6B7280" : "#22C55E",
      }}
      title={isMuted ? "Unmute narration" : "Mute narration"}
    >
      {/* Speaker icon */}
      <span className="text-base">
        {isMuted ? "🔇" : isSpeaking ? "🔊" : "🔈"}
      </span>

      {/* Sound wave animation when speaking */}
      {isSpeaking && !isMuted && (
        <span className="voice-waves">
          <span className="voice-wave" />
          <span className="voice-wave" style={{ animationDelay: "0.15s" }} />
          <span className="voice-wave" style={{ animationDelay: "0.3s" }} />
        </span>
      )}

      <span>{isMuted ? "Unmute" : isSpeaking ? "Speaking" : "Narrate"}</span>
    </button>
  );
}
