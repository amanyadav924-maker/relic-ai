"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// ── Sunbeam / Sunlight particle type ───────────────────────────
interface SunlightParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  dur: number;
  delay: number;
}

export default function HeritageBackground() {
  const [particles, setParticles] = useState<SunlightParticle[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Generate soft, glowing warm sunlight particles
    const generated = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 5 + 2,
      dur: Math.random() * 8 + 10,
      delay: Math.random() * -5,
    }));
    setParticles(generated);
  }, []);

  return (
    <div 
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none z-0" 
      style={{ 
        background: "linear-gradient(to bottom, #0284C7 0%, #0EA5E9 25%, #38BDF8 50%, #7DD3FC 75%, #BAE6FD 100%)" 
      }}
    >
      {/* ── Soft Sunlight Glow Orb (Sunrise behind monuments) ─────── */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full blur-[140px] opacity-40 animate-pulse"
        style={{
          bottom: "10%",
          left: "20%",
          background: "radial-gradient(circle, #FEF08A 0%, #FDBA74 50%, transparent 70%)",
          animationDuration: "8s"
        }}
      />
      
      {/* Additional sky morning pink ambient glow */}
      <div 
        className="absolute w-[900px] h-[600px] rounded-full blur-[160px] opacity-25"
        style={{
          bottom: "15%",
          right: "10%",
          background: "radial-gradient(circle, #F472B6 0%, #C084FC 60%, transparent 80%)"
        }}
      />

      {/* ── Peaceful Ambient Grid Overlay ─────────────────────────── */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.4) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 90%)",
          WebkitMaskImage: "radial-gradient(circle at 50% 50%, black 40%, transparent 90%)"
        }}
      />

      {/* ── Floating Sunlight Particles ───────────────────────────── */}
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
                backgroundColor: "#FEF08A",
                boxShadow: "0 0 8px #FEF08A",
                opacity: 0.35,
                animationDuration: `${p.dur}s`,
                animationDelay: `${p.delay}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Framer Motion Natural Clouds ───────────────────────────── */}
      {mounted && (
        <div className="absolute inset-0">
          {/* Cloud 1: Deep slow sky background */}
          <motion.svg
            className="absolute w-[280px] h-[120px] fill-white opacity-40 blur-[2px]"
            style={{ top: "10%", left: "-300px" }}
            animate={{ x: ["0vw", "120vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 110 }}
            viewBox="0 0 100 40"
          >
            <path d="M 10 30 A 10 10 0 0 1 20 15 A 12 12 0 0 1 45 10 A 10 10 0 0 1 65 15 A 8 8 0 0 1 75 30 Z" />
          </motion.svg>

          {/* Cloud 2: Middle-layer cloud drifting backwards */}
          <motion.svg
            className="absolute w-[220px] h-[90px] fill-white opacity-55"
            style={{ top: "25%", right: "-250px" }}
            animate={{ x: ["0vw", "-125vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 90 }}
            viewBox="0 0 100 40"
          >
            <path d="M 15 35 A 8 8 0 0 1 25 22 A 10 10 0 0 1 48 18 A 9 9 0 0 1 65 22 A 7 7 0 0 1 75 35 Z" />
          </motion.svg>

          {/* Cloud 3: High, fast, soft cloud */}
          <motion.svg
            className="absolute w-[350px] h-[150px] fill-white opacity-30 blur-[4px]"
            style={{ top: "5%", left: "-400px" }}
            animate={{ x: ["0vw", "130vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 75 }}
            viewBox="0 0 100 40"
          >
            <path d="M 10 30 A 12 12 0 0 1 22 12 A 15 15 0 0 1 52 8 A 12 12 0 0 1 72 12 A 10 10 0 0 1 85 30 Z" />
          </motion.svg>

          {/* Cloud 4: Front, slow cinematic cloud */}
          <motion.svg
            className="absolute w-[260px] h-[100px] fill-white opacity-50"
            style={{ top: "18%", left: "-300px" }}
            animate={{ x: ["0vw", "120vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 125, delay: 20 }}
            viewBox="0 0 100 40"
          >
            <path d="M 15 30 A 8 8 0 0 1 23 18 A 11 11 0 0 1 45 12 A 9 9 0 0 1 63 18 A 7 7 0 0 1 72 30 Z" />
          </motion.svg>
        </div>
      )}

      {/* ── Framer Motion Flying Birds (Gliding in V-Formation) ─────── */}
      {mounted && (
        <div className="absolute inset-0">
          <motion.div
            className="absolute flex gap-10 items-center justify-center"
            style={{ top: "15%", right: "-200px" }}
            animate={{ x: ["0vw", "-130vw"], y: ["0vh", "15vh"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 42, delay: 5 }}
          >
            {/* Lead Bird */}
            <svg className="w-8 h-8 fill-sky-800 opacity-60 animate-bird-flap" viewBox="0 0 24 24">
              <path d="M 2 12 Q 7 4, 12 10 Q 17 4, 22 12 Q 17 8, 12 10 Q 7 8, 2 12 Z" />
            </svg>
            
            {/* Wing Birds */}
            <div className="flex flex-col gap-6 -ml-6 mt-4">
              <svg className="w-6 h-6 fill-sky-800 opacity-50 animate-bird-flap" style={{ animationDelay: "0.2s" }} viewBox="0 0 24 24">
                <path d="M 2 12 Q 7 4, 12 10 Q 17 4, 22 12 Q 17 8, 12 10 Q 7 8, 2 12 Z" />
              </svg>
              <svg className="w-5 h-5 fill-sky-800 opacity-40 animate-bird-flap" style={{ animationDelay: "0.4s" }} viewBox="0 0 24 24">
                <path d="M 2 12 Q 7 4, 12 10 Q 17 4, 22 12 Q 17 8, 12 10 Q 7 8, 2 12 Z" />
              </svg>
            </div>
            
            <div className="flex flex-col gap-6 -ml-6 -mt-6">
              <svg className="w-6 h-6 fill-sky-800 opacity-50 animate-bird-flap" style={{ animationDelay: "0.15s" }} viewBox="0 0 24 24">
                <path d="M 2 12 Q 7 4, 12 10 Q 17 4, 22 12 Q 17 8, 12 10 Q 7 8, 2 12 Z" />
              </svg>
              <svg className="w-5 h-5 fill-sky-800 opacity-40 animate-bird-flap" style={{ animationDelay: "0.35s" }} viewBox="0 0 24 24">
                <path d="M 2 12 Q 7 4, 12 10 Q 17 4, 22 12 Q 17 8, 12 10 Q 7 8, 2 12 Z" />
              </svg>
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Monument Skyline SVG Layer (Bright/Silver Glassy Silhouettes) ── */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[55vh] md:h-[45vh] flex flex-col justify-end">
        <svg
          viewBox="0 0 1600 500"
          className="w-full h-full object-cover origin-bottom translate-y-[2px]"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Monument Light Gradients (Clean Pastel Gradients with silver tones) */}
            <linearGradient id="grad-arch-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
              <stop offset="35%" stopColor="#FED7AA" stopOpacity="0.85" /> {/* Soft Orange */}
              <stop offset="70%" stopColor="#FBCFE8" stopOpacity="0.8" />  {/* Soft Pink */}
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.1" /> {/* Fade */}
            </linearGradient>

            <linearGradient id="grad-minar-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#CFFAFE" stopOpacity="0.8" />  {/* Soft Cyan */}
              <stop offset="75%" stopColor="#A7F3D0" stopOpacity="0.75" /> {/* Soft Green */}
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="grad-taj-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
              <stop offset="30%" stopColor="#F3E8FF" stopOpacity="0.85" /> {/* Soft Purple */}
              <stop offset="65%" stopColor="#FCE7F3" stopOpacity="0.8" />  {/* Soft Pink */}
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="grad-temple-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#FEF3C7" stopOpacity="0.8" />  {/* Soft Gold */}
              <stop offset="70%" stopColor="#FCA5A5" stopOpacity="0.7" />  {/* Soft Red */}
              <stop offset="100%" stopColor="#BAE6FD" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="grad-stupa-light" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#D1FAE5" stopOpacity="0.8" />  {/* Soft Emerald */}
              <stop offset="85%" stopColor="#CFFAFE" stopOpacity="0.7" />  {/* Soft Cyan */}
              <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0.1" />
            </linearGradient>

            <linearGradient id="grad-skyline-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Reflection masking */}
            <mask id="light-reflection-mask">
              <rect x="0" y="380" width="1600" height="120" fill="url(#grad-skyline-reflection)" />
            </mask>

            {/* Light glow shadow */}
            <filter id="glow-monument-light" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Distant Hills / Ancient Fort Silhouettes ─────────────── */}
          <g opacity="0.25">
            <path d="M 0 380 L 180 340 L 350 375 L 580 310 L 800 375 L 1050 330 L 1320 375 L 1600 350 L 1600 380 L 0 380 Z" fill="#F8FAFC" />
            <path d="M 0 380 L 250 355 L 480 380 L 750 335 L 980 380 L 1250 345 L 1500 380 L 1600 365 L 1600 380 L 0 380 Z" fill="#E2E8F0" />
          </g>

          {/* ── Vector Monument Silhouettes ──────────────────────────── */}
          <g id="skyline-light" filter="url(#glow-monument-light)">
            {/* 1. India Gate / Grand Arch (X Center = 250) */}
            <g fill="url(#grad-arch-light)">
              <rect x="190" y="250" width="120" height="130" rx="4" />
              {/* Inner Arch Cutout (Matching the sky backdrop gradient perfectly) */}
              <path d="M 222 380 L 222 305 C 222 280, 278 280, 278 305 L 278 380 Z" fill="#BAE6FD" />
              <rect x="180" y="240" width="140" height="10" rx="2" />
              <rect x="200" y="225" width="100" height="15" rx="2" />
              <rect x="215" y="212" width="70" height="13" rx="1.5" />
              <ellipse cx="250" cy="212" rx="20" ry="5" />
              <rect x="184" y="260" width="6" height="110" rx="1" fill="#BAE6FD" opacity="0.3" />
              <rect x="310" y="260" width="6" height="110" rx="1" fill="#BAE6FD" opacity="0.3" />
            </g>

            {/* 2. Qutub Minar (X Center = 500) */}
            <g fill="url(#grad-minar-light)">
              <path d="M 485 380 L 493 110 L 507 110 L 515 380 Z" />
              <rect x="488" y="315" width="24" height="6" rx="1" />
              <rect x="491" y="245" width="18" height="6" rx="1" />
              <rect x="494" y="175" width="12" height="6" rx="1" />
              <rect x="495" y="110" width="10" height="6" rx="1" />
              <polygon points="497,110 500,75 503,110" />
              <line x1="497" y1="116" x2="497" y2="380" stroke="#BAE6FD" strokeWidth="1" opacity="0.4" />
              <line x1="503" y1="116" x2="503" y2="380" stroke="#BAE6FD" strokeWidth="1" opacity="0.4" />
            </g>

            {/* 3. Taj Mahal (X Center = 800) */}
            <g fill="url(#grad-taj-light)">
              <rect x="735" y="310" width="130" height="70" rx="4" />
              <path d="M 765 310 C 765 240, 775 220, 800 185 C 825 220, 835 240, 835 310 Z" />
              <line x1="800" y1="185" x2="800" y2="155" stroke="url(#grad-taj-light)" strokeWidth="3" />
              <circle cx="800" cy="155" r="3.5" />
              
              <path d="M 775 380 L 775 330 C 775 315, 825 315, 825 330 L 825 380 Z" fill="#BAE6FD" />
              <path d="M 747 380 L 747 350 C 747 343, 763 343, 763 350 L 763 380 Z" fill="#BAE6FD" />
              <path d="M 837 380 L 837 350 C 837 343, 853 343, 853 350 L 853 380 Z" fill="#BAE6FD" />

              <rect x="746" y="290" width="10" height="20" />
              <path d="M 744 290 C 744 275, 758 275, 758 290 Z" />
              
              <rect x="844" y="290" width="10" height="20" />
              <path d="M 842 290 C 842 275, 856 275, 856 290 Z" />

              <rect x="698" y="200" width="8" height="180" rx="1.5" />
              <rect x="695" y="310" width="14" height="4" />
              <rect x="696" y="250" width="12" height="4" />
              <path d="M 696 200 C 696 185, 708 185, 708 200 Z" />
              
              <rect x="894" y="200" width="8" height="180" rx="1.5" />
              <rect x="891" y="310" width="14" height="4" />
              <rect x="892" y="250" width="12" height="4" />
              <path d="M 892 200 C 892 185, 904 185, 904 200 Z" />
            </g>

            {/* 4. Ancient Shikhara Temple (X Center = 1150) */}
            <g fill="url(#grad-temple-light)">
              <path d="M 1090 380 C 1090 330, 1105 280, 1115 270 L 1120 380 Z" />
              <path d="M 1210 380 C 1210 330, 1195 280, 1185 270 L 1180 380 Z" />
              <path d="M 1102 380 C 1102 310, 1120 230, 1130 215 L 1135 380 Z" />
              <path d="M 1198 380 C 1198 310, 1180 230, 1170 215 L 1165 380 Z" />

              <path d="M 1118 380 C 1118 280, 1132 180, 1150 120 C 1168 180, 1182 280, 1182 380 Z" />
              <ellipse cx="1150" cy="115" rx="8" ry="4" />
              <ellipse cx="1150" cy="111" rx="5" ry="2.5" />
              <polygon points="1149,111 1150,92 1151,111" />

              <rect x="1148" y="135" width="4" height="235" fill="#BAE6FD" opacity="0.3" />
              <rect x="1132" y="240" width="3" height="120" fill="#BAE6FD" opacity="0.3" />
              <rect x="1165" y="240" width="3" height="120" fill="#BAE6FD" opacity="0.3" />
            </g>

            {/* 5. Sanchi Stupa / Great Dome (X Center = 1380) */}
            <g fill="url(#grad-stupa-light)">
              <path d="M 1320 380 A 65 65 0 0 1 1450 380 Z" />
              <rect x="1310" y="335" width="6" height="45" />
              <rect x="1335" y="335" width="6" height="45" />
              <rect x="1302" y="332" width="45" height="4" rx="1" />
              <rect x="1302" y="340" width="45" height="4" rx="1" />

              <rect x="1429" y="335" width="6" height="45" />
              <rect x="1454" y="335" width="6" height="45" />
              <rect x="1421" y="332" width="45" height="4" rx="1" />
              <rect x="1421" y="340" width="45" height="4" rx="1" />

              <rect x="1377" y="309" width="16" height="6" rx="0.5" />
              <line x1="1385" y1="309" x2="1385" y2="280" stroke="url(#grad-stupa-light)" strokeWidth="2.5" />
              <line x1="1375" y1="298" x2="1395" y2="298" stroke="url(#grad-stupa-light)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1378" y1="289" x2="1392" y2="289" stroke="url(#grad-stupa-light)" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="1381" y1="280" x2="1389" y2="280" stroke="url(#grad-stupa-light)" strokeWidth="2" strokeLinecap="round" />
            </g>
          </g>

          {/* ── Ground Horizon Line (Glowing Vector Boundary) ─────────── */}
          <line x1="0" y1="380" x2="1600" y2="380" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
          <line x1="0" y1="380.5" x2="1600" y2="380.5" stroke="#FFFFFF" strokeWidth="1" className="opacity-60 animate-pulse" />

          {/* ── Mirror Water Reflection Layer (Flipped & Blurs) ───────── */}
          <g
            transform="scale(1, -1) translate(0, -760)"
            mask="url(#light-reflection-mask)"
            opacity="0.55"
            className="animate-water-ripple"
            style={{ filter: "blur(2px)" }}
          >
            <use href="#skyline-light" />
          </g>
        </svg>
      </div>

      {/* ── Bottom Lake Overlay ────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[220px] pointer-events-none z-10"
        style={{
          background: "linear-gradient(to top, #BAE6FD 15%, rgba(186, 230, 253, 0.75) 50%, transparent 100%)"
        }}
      />
    </div>
  );
}
