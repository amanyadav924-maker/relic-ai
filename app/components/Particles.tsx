"use client";

import { useState, useEffect } from "react";

// ── Floating Particles Background ────────────────────────────────────────────
// Renders animated green dots floating in the background for ambient effect.

export function Particles() {
  const [mounted, setMounted] = useState(false);
  const [dots] = useState(() => Array.from({ length: 45 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 1.5,
    top: Math.random() * 100,
    left: Math.random() * 100,
    dur: Math.random() * 6 + 8,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.4 + 0.15,
    isGold: Math.random() > 0.6, // 40% chance to be golden relic dust
  })));

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {dots.map(d => (
        <span
          key={d.id}
          className="particle"
          style={{
            width: d.size,
            height: d.size,
            top: `${d.top}%`,
            left: `${d.left}%`,
            "--dur": `${d.dur}s`,
            "--delay": `${d.delay}s`,
            opacity: d.opacity,
            background: d.isGold ? "#FBBF24" : "var(--accent)", // Amber or Accent Green
            boxShadow: d.isGold ? "0 0 12px 3px rgba(251,191,36,0.5)" : "0 0 10px 2px var(--accent-glow)",
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
