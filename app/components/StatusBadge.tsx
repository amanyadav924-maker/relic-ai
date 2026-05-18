"use client";

// ── AI Status Badge ──────────────────────────────────────────────────────────
// Shows the current AI readiness state with a pulsing indicator dot.

interface StatusBadgeProps {
  scanning: boolean;
  /** Optional: show "Camera Active" state */
  cameraActive?: boolean;
}

export function StatusBadge({ scanning, cameraActive }: StatusBadgeProps) {
  const label = scanning
    ? "Scanning…"
    : cameraActive
      ? "Camera Active"
      : "AI Ready";

  const dotColor = scanning
    ? "bg-yellow-400"
    : cameraActive
      ? "bg-blue-400"
      : "bg-[#22C55E]";

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs font-medium">
      <span className={`status-dot w-2 h-2 rounded-full ${dotColor}`} />
      <span className="text-gray-300">{label}</span>
    </div>
  );
}
