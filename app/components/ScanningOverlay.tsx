"use client";

// ── Scanning HUD Overlay ─────────────────────────────────────────────────────
// Renders an animated scanning overlay with corner brackets, scan line,
// pulsing reticle, and status text. Used over both camera and image previews.

interface ScanningOverlayProps {
  /** Whether the scanning animation is active */
  active: boolean;
  /** Optional label to show during scanning */
  label?: string;
}

export function ScanningOverlay({ active, label = "Analyzing…" }: ScanningOverlayProps) {
  if (!active) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none">
      {/* Semi-transparent dark overlay */}
      <div
        className="absolute inset-0"
        style={{ background: "rgba(11,15,12,0.55)" }}
      />

      {/* Scan line sweeping vertically */}
      <div className="scan-line" />

      {/* Corner brackets — pulsing green */}
      {["top-4 left-4", "top-4 right-4", "bottom-4 left-4", "bottom-4 right-4"].map(
        (pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} w-7 h-7 border-[#22C55E] hud-bracket`}
            style={{
              borderTopWidth: i < 2 ? 2.5 : 0,
              borderBottomWidth: i >= 2 ? 2.5 : 0,
              borderLeftWidth: i % 2 === 0 ? 2.5 : 0,
              borderRightWidth: i % 2 === 1 ? 2.5 : 0,
            }}
          />
        )
      )}

      {/* Center reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="reticle">
          <div className="reticle-ring" />
          <div className="reticle-crosshair-h" />
          <div className="reticle-crosshair-v" />
        </div>
      </div>

      {/* Status text at bottom */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-[#22C55E] text-sm font-bold tracking-widest uppercase animate-pulse">
          {label}
        </p>
        <p className="text-gray-500 text-[10px] mt-1 tracking-wider">
          RELIC AI · HERITAGE SCANNER
        </p>
      </div>
    </div>
  );
}
