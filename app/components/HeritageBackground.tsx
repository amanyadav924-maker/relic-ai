"use client";

import { useEffect, useState } from "react";

// ── Floating glowing particles inside the background ───────────
interface BgParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  dur: number;
  delay: number;
}

export default function HeritageBackground() {
  const [particles, setParticles] = useState<BgParticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate a set of colorful, glowing particles
    const colors = [
      "rgba(34, 197, 94, 0.4)",  // neon green
      "rgba(6, 182, 212, 0.4)",  // cyan
      "rgba(168, 85, 247, 0.4)", // purple
      "rgba(249, 115, 22, 0.4)",  // orange
      "rgba(236, 72, 153, 0.4)",  // pink
    ];

    const generated = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      dur: Math.random() * 8 + 8,
      delay: Math.random() * -5,
    }));

    setParticles(generated);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0" style={{ background: "#050706" }}>
      
      {/* ── Background Aurora / Nebulous Glowing Orbs ───────────────── */}
      <div className="absolute inset-0 opacity-40 mix-blend-screen">
        {/* Orb 1: Cyan (Top Left) */}
        <div className="absolute w-[600px] h-[600px] rounded-full blur-[130px] animate-aurora-slow"
          style={{
            top: "-10%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%)"
          }}
        />
        {/* Orb 2: Purple (Center Right) */}
        <div className="absolute w-[700px] h-[700px] rounded-full blur-[140px] animate-aurora-medium"
          style={{
            top: "20%",
            right: "-15%",
            background: "radial-gradient(circle, rgba(168, 85, 247, 0.22) 0%, transparent 70%)"
          }}
        />
        {/* Orb 3: Orange/Pink (Bottom Left) */}
        <div className="absolute w-[500px] h-[500px] rounded-full blur-[120px] animate-aurora-slow"
          style={{
            bottom: "10%",
            left: "-10%",
            background: "radial-gradient(circle, rgba(249, 115, 22, 0.18) 0%, transparent 70%)"
          }}
        />
        {/* Orb 4: Neon Green (Bottom Center) */}
        <div className="absolute w-[550px] h-[550px] rounded-full blur-[120px] animate-aurora-fast"
          style={{
            bottom: "-15%",
            left: "30%",
            background: "radial-gradient(circle, rgba(34, 197, 94, 0.2) 0%, transparent 70%)"
          }}
        />
      </div>

      {/* ── Futuristic Grid lines (Low opacity) ────────────────────── */}
      <div className="absolute inset-0 opacity-15"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          maskImage: "radial-gradient(circle at 50% 40%, black 30%, transparent 85%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 40%, black 30%, transparent 85%)"
        }}
      />

      {/* ── Glowing Floating Particles ─────────────────────────────── */}
      {mounted && (
        <div className="absolute inset-0">
          {particles.map((p) => (
            <span
              key={p.id}
              className="absolute rounded-full animate-float-bg"
              style={{
                width: p.size,
                height: p.size,
                top: `${p.y}%`,
                left: `${p.x}%`,
                backgroundColor: p.color,
                boxShadow: `0 0 10px ${p.color}`,
                opacity: 0.35,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Monument Skyline SVG Layer ─────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[60vh] md:h-[50vh] flex flex-col justify-end">
        <svg
          viewBox="0 0 1600 500"
          className="w-full h-full object-cover origin-bottom translate-y-[2px]"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Monument Gradients */}
            <linearGradient id="grad-arch" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.85" /> {/* Orange */}
              <stop offset="50%" stopColor="#EC4899" stopOpacity="0.75" /> {/* Pink */}
              <stop offset="100%" stopColor="#818CF8" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="grad-minar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.9" /> {/* Cyan */}
              <stop offset="60%" stopColor="#22C55E" stopOpacity="0.7" /> {/* Neon Green */}
              <stop offset="100%" stopColor="#0F172A" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="grad-taj" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#A855F7" stopOpacity="0.9" /> {/* Purple */}
              <stop offset="40%" stopColor="#EC4899" stopOpacity="0.8" /> {/* Pink */}
              <stop offset="80%" stopColor="#06B6D4" stopOpacity="0.3" /> {/* Cyan */}
              <stop offset="100%" stopColor="#0B0F0C" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="grad-temple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.85" /> {/* Gold */}
              <stop offset="45%" stopColor="#EF4444" stopOpacity="0.7" /> {/* Red */}
              <stop offset="100%" stopColor="#1E293B" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="grad-stupa" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#22C55E" stopOpacity="0.85" /> {/* Green */}
              <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.65" /> {/* Cyan */}
              <stop offset="100%" stopColor="#083344" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="grad-reflection-fade" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="35%" stopColor="#ffffff" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Mask to fade reflection as it goes down */}
            <mask id="reflection-mask">
              <rect x="0" y="380" width="1600" height="120" fill="url(#grad-reflection-fade)" />
            </mask>

            {/* Soft Glow Filters */}
            <filter id="glow-monument" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Distant Layer (Hills / Forts / Domes) ──────────────── */}
          <g opacity="0.15">
            {/* Distant Hills */}
            <path d="M 0 380 L 180 320 L 350 365 L 580 290 L 800 370 L 1050 310 L 1320 365 L 1600 330 L 1600 380 L 0 380 Z" fill="rgba(168, 85, 247, 0.4)" />
            <path d="M 0 380 L 250 340 L 480 375 L 750 315 L 980 375 L 1250 325 L 1500 375 L 1600 355 L 1600 380 L 0 380 Z" fill="rgba(6, 182, 212, 0.3)" />
          </g>

          {/* ── Active Monument Skyline ─────────────────────────────── */}
          <g id="skyline" filter="url(#glow-monument)">
            {/* 1. India Gate / Grand Arch (X Center = 250) */}
            <g fill="url(#grad-arch)">
              {/* Pillars and Arch Frame */}
              <rect x="190" y="250" width="120" height="130" rx="4" />
              {/* Inner Arch Cutout */}
              <path d="M 222 380 L 222 305 C 222 280, 278 280, 278 305 L 278 380 Z" fill="#050706" />
              {/* Cornice level */}
              <rect x="180" y="240" width="140" height="10" rx="2" />
              {/* Upper Stepped levels */}
              <rect x="200" y="225" width="100" height="15" rx="2" />
              <rect x="215" y="212" width="70" height="13" rx="1.5" />
              <ellipse cx="250" cy="212" rx="20" ry="5" />
              {/* Decorative side cuts */}
              <rect x="184" y="260" width="6" height="110" rx="1" fill="#050706" opacity="0.3" />
              <rect x="310" y="260" width="6" height="110" rx="1" fill="#050706" opacity="0.3" />
            </g>

            {/* 2. Qutub Minar (X Center = 500) */}
            <g fill="url(#grad-minar)">
              {/* Minar Tower */}
              <path d="M 485 380 L 493 110 L 507 110 L 515 380 Z" />
              {/* Horizontal balconies (tiers) */}
              <rect x="488" y="315" width="24" height="6" rx="1" />
              <rect x="491" y="245" width="18" height="6" rx="1" />
              <rect x="494" y="175" width="12" height="6" rx="1" />
              {/* Top cupola & spire */}
              <rect x="495" y="110" width="10" height="6" rx="1" />
              <polygon points="497,110 500,75 503,110" />
              {/* Subtle architectural flutes (vertical lines) */}
              <line x1="497" y1="116" x2="497" y2="380" stroke="#050706" strokeWidth="1" opacity="0.35" />
              <line x1="503" y1="116" x2="503" y2="380" stroke="#050706" strokeWidth="1" opacity="0.35" />
            </g>

            {/* 3. Taj Mahal (X Center = 800) */}
            <g fill="url(#grad-taj)">
              {/* Outer boundary base */}
              <rect x="735" y="310" width="130" height="70" rx="4" />
              {/* Central Main Dome */}
              <path d="M 765 310 C 765 240, 775 220, 800 185 C 825 220, 835 240, 835 310 Z" />
              <line x1="800" y1="185" x2="800" y2="155" stroke="url(#grad-taj)" strokeWidth="3" />
              <circle cx="800" cy="155" r="3.5" />
              
              {/* Inner Arch Cutouts (Central and Sides) */}
              <path d="M 775 380 L 775 330 C 775 315, 825 315, 825 330 L 825 380 Z" fill="#050706" />
              <path d="M 747 380 L 747 350 C 747 343, 763 343, 763 350 L 763 380 Z" fill="#050706" />
              <path d="M 837 380 L 837 350 C 837 343, 853 343, 853 350 L 853 380 Z" fill="#050706" />

              {/* Small side domes (chattris) */}
              <rect x="746" y="290" width="10" height="20" />
              <path d="M 744 290 C 744 275, 758 275, 758 290 Z" />
              
              <rect x="844" y="290" width="10" height="20" />
              <path d="M 842 290 C 842 275, 856 275, 856 290 Z" />

              {/* Left Minaret */}
              <rect x="698" y="200" width="8" height="180" rx="1.5" />
              <rect x="695" y="310" width="14" height="4" />
              <rect x="696" y="250" width="12" height="4" />
              <path d="M 696 200 C 696 185, 708 185, 708 200 Z" />
              
              {/* Right Minaret */}
              <rect x="894" y="200" width="8" height="180" rx="1.5" />
              <rect x="891" y="310" width="14" height="4" />
              <rect x="892" y="250" width="12" height="4" />
              <path d="M 892 200 C 892 185, 904 185, 904 200 Z" />
            </g>

            {/* 4. Ancient Shikhara Temple (X Center = 1150) */}
            <g fill="url(#grad-temple)">
              {/* Side layers (spire steps) */}
              <path d="M 1090 380 C 1090 330, 1105 280, 1115 270 L 1120 380 Z" />
              <path d="M 1210 380 C 1210 330, 1195 280, 1185 270 L 1180 380 Z" />
              
              <path d="M 1102 380 C 1102 310, 1120 230, 1130 215 L 1135 380 Z" />
              <path d="M 1198 380 C 1198 310, 1180 230, 1170 215 L 1165 380 Z" />

              {/* Main curvilinear spire (Shikhara) */}
              <path d="M 1118 380 C 1118 280, 1132 180, 1150 120 C 1168 180, 1182 280, 1182 380 Z" />
              {/* Amalaka (ribbed dome cap) */}
              <ellipse cx="1150" cy="115" rx="8" ry="4" />
              <ellipse cx="1150" cy="111" rx="5" ry="2.5" />
              {/* Spire tip (Kalash) */}
              <polygon points="1149,111 1150,92 1151,111" />

              {/* Small cutouts to represent tiered architecture */}
              <rect x="1148" y="135" width="4" height="235" fill="#050706" opacity="0.3" />
              <rect x="1132" y="240" width="3" height="120" fill="#050706" opacity="0.3" />
              <rect x="1165" y="240" width="3" height="120" fill="#050706" opacity="0.3" />
            </g>

            {/* 5. Sanchi Stupa / Great Dome (X Center = 1380) */}
            <g fill="url(#grad-stupa)">
              {/* Hemispherical Dome */}
              <path d="M 1320 380 A 65 65 0 0 1 1450 380 Z" />
              {/* Gateway pillars (Torana) */}
              <rect x="1310" y="335" width="6" height="45" />
              <rect x="1335" y="335" width="6" height="45" />
              <rect x="1302" y="332" width="45" height="4" rx="1" />
              <rect x="1302" y="340" width="45" height="4" rx="1" />

              <rect x="1429" y="335" width="6" height="45" />
              <rect x="1454" y="335" width="6" height="45" />
              <rect x="1421" y="332" width="45" height="4" rx="1" />
              <rect x="1421" y="340" width="45" height="4" rx="1" />

              {/* Square platform (Harmika) */}
              <rect x="1377" y="309" width="16" height="6" rx="0.5" />
              {/* Triple umbrella spire (Chhatravali) */}
              <line x1="1385" y1="309" x2="1385" y2="280" stroke="url(#grad-stupa)" strokeWidth="2.5" />
              <line x1="1375" y1="298" x2="1395" y2="298" stroke="url(#grad-stupa)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1378" y1="289" x2="1392" y2="289" stroke="url(#grad-stupa)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1381" y1="280" x2="1389" y2="280" stroke="url(#grad-stupa)" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* ── Ground Horizon Line (Glowing Vector Boundary) ─────────── */}
          <line x1="0" y1="380" x2="1600" y2="380" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
          {/* Subtle secondary glow layer */}
          <line x1="0" y1="380.5" x2="1600" y2="380.5" stroke="url(#grad-minar)" strokeWidth="1" className="opacity-40 animate-pulse" />

          {/* ── Mirror Water Reflection Layer (Flipped & Blurs) ───────── */}
          <g
            transform="scale(1, -1) translate(0, -760)"
            mask="url(#reflection-mask)"
            opacity="0.6"
            className="animate-water-ripple"
            style={{ filter: "blur(1.5px)" }}
          >
            <use href="#skyline" />
          </g>
        </svg>
      </div>

      {/* ── Ambient Futuristic Tech Grid Overlay ───────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top, #050706 15%, rgba(5, 7, 6, 0.75) 45%, transparent 100%)"
        }}
      />
    </div>
  );
}
