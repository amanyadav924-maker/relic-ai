"use client";

import { motion } from "framer-motion";

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
    ? "bg-yellow-400 shadow-[0_0_8px_2px_rgba(250,204,21,0.6)]"
    : cameraActive
      ? "bg-[#22C55E] shadow-[0_0_8px_2px_rgba(34,197,94,0.6)]" // glowing green dot
      : "bg-[#D4AF37] shadow-[0_0_8px_2px_rgba(212,175,55,0.6)]";

  return (
    <motion.div 
      className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        background: "rgba(5, 8, 6, 0.55)",
        backdropFilter: "blur(24px) saturate(140%)",
        WebkitBackdropFilter: "blur(24px) saturate(140%)",
        border: "1px solid rgba(255, 255, 255, 0.05)",
        borderTop: "1px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.5), inset 0 0 12px rgba(255, 255, 255, 0.02)",
      }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} animate-pulse`} />
      <span className="text-gray-200 tracking-wide">{label}</span>
    </motion.div>
  );
}
