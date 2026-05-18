"use client";

import { useState, useEffect } from "react";

// ── Floating Particles Background ────────────────────────────────────────────
// Renders animated green dots floating in the background for ambient effect.

export function Particles() {
  const [mounted, setMounted] = useState(false);
  const [dots] = useState(() => Array.from({ length: 18 }, (_, i) => ({
    id: i,
    size: Math.random() * 4 + 2,
    top: Math.random() * 100,
    left: Math.random() * 100,
    dur: Math.random() * 5 + 5,
    delay: Math.random() * 4,
    opacity: Math.random() * 0.35 + 0.1,
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
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
