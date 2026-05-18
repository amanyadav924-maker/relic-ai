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
    const generated = Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 6 + 2,
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
                backgroundColor: "#FFFFFF",
                boxShadow: "0 0 10px #FFFFFF",
                opacity: 0.6,
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
          {/* Cloud 1 */}
          <motion.svg
            className="absolute w-[280px] h-[120px] fill-white opacity-40 blur-[2px]"
            style={{ top: "10%", left: "-300px" }}
            animate={{ x: ["0vw", "120vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 110 }}
            viewBox="0 0 100 40"
          >
            <path d="M 10 30 A 10 10 0 0 1 20 15 A 12 12 0 0 1 45 10 A 10 10 0 0 1 65 15 A 8 8 0 0 1 75 30 Z" />
          </motion.svg>

          {/* Cloud 2 */}
          <motion.svg
            className="absolute w-[220px] h-[90px] fill-white opacity-55"
            style={{ top: "25%", right: "-250px" }}
            animate={{ x: ["0vw", "-125vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 90 }}
            viewBox="0 0 100 40"
          >
            <path d="M 15 35 A 8 8 0 0 1 25 22 A 10 10 0 0 1 48 18 A 9 9 0 0 1 65 22 A 7 7 0 0 1 75 35 Z" />
          </motion.svg>

          {/* Cloud 3 */}
          <motion.svg
            className="absolute w-[350px] h-[150px] fill-white opacity-30 blur-[4px]"
            style={{ top: "5%", left: "-400px" }}
            animate={{ x: ["0vw", "130vw"] }}
            transition={{ repeat: Infinity, ease: "linear", duration: 75 }}
            viewBox="0 0 100 40"
          >
            <path d="M 10 30 A 12 12 0 0 1 22 12 A 15 15 0 0 1 52 8 A 12 12 0 0 1 72 12 A 10 10 0 0 1 85 30 Z" />
          </motion.svg>
        </div>
      )}

      {/* ── Framer Motion Flying Birds ─────────────────────────────── */}
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

      {/* ── Vector Monument Skyline (Vibrant Gradients) ──────────── */}
      <div className="absolute bottom-0 left-0 right-0 w-full h-[50vh] md:h-[40vh] flex flex-col justify-end">
        <svg
          viewBox="0 0 1600 500"
          className="w-full h-full object-cover origin-bottom translate-y-[2px]"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Vibrant Monument Gradients */}
            <linearGradient id="grad-arch" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />  {/* Bright Orange */}
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.85" /> {/* Amber */}
              <stop offset="100%" stopColor="#FBBF24" stopOpacity="0.3" /> {/* Yellow Fade */}
            </linearGradient>

            <linearGradient id="grad-minar" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.95" /> {/* Neon Cyan */}
              <stop offset="50%" stopColor="#3B82F6" stopOpacity="0.85" /> {/* Blue */}
              <stop offset="100%" stopColor="#1E3A8A" stopOpacity="0.3" /> {/* Dark Blue Fade */}
            </linearGradient>

            <linearGradient id="grad-taj" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#D946EF" stopOpacity="0.95" /> {/* Fuchsia */}
              <stop offset="50%" stopColor="#A855F7" stopOpacity="0.9" /> {/* Purple */}
              <stop offset="100%" stopColor="#3B0764" stopOpacity="0.3" /> {/* Deep Purple Fade */}
            </linearGradient>

            <linearGradient id="grad-temple" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.9" />  {/* Emerald Green */}
              <stop offset="50%" stopColor="#14B8A6" stopOpacity="0.85" /> {/* Teal */}
              <stop offset="100%" stopColor="#042F2E" stopOpacity="0.3" /> {/* Dark Green Fade */}
            </linearGradient>

            <linearGradient id="grad-buddha" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.95" /> {/* Golden Yellow */}
              <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.9" />  {/* Rich Amber */}
              <stop offset="100%" stopColor="#9A3412" stopOpacity="0.3" /> {/* Dark Orange Fade */}
            </linearGradient>

            <linearGradient id="grad-stupa" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#6366F1" stopOpacity="0.9" />  {/* Indigo */}
              <stop offset="50%" stopColor="#8B5CF6" stopOpacity="0.85" /> {/* Violet */}
              <stop offset="100%" stopColor="#2E1065" stopOpacity="0.3" /> {/* Dark Indigo Fade */}
            </linearGradient>

            <linearGradient id="grad-skyline-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.45" />
              <stop offset="40%" stopColor="#ffffff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0.0" />
            </linearGradient>

            {/* Reflection masking */}
            <mask id="reflection-mask">
              <rect x="0" y="380" width="1600" height="120" fill="url(#grad-skyline-reflection)" />
            </mask>

            {/* Neon glow shadow */}
            <filter id="glow-monument" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* ── Background Mountains / Distant Forts ─────────────── */}
          <g opacity="0.3">
            <path d="M 0 380 L 180 320 L 350 365 L 580 290 L 800 365 L 1050 310 L 1320 365 L 1600 330 L 1600 380 L 0 380 Z" fill="#93C5FD" />
            <path d="M 0 380 L 250 345 L 480 375 L 750 325 L 980 375 L 1250 335 L 1500 375 L 1600 355 L 1600 380 L 0 380 Z" fill="#BFDBFE" />
          </g>

          {/* ── Vibrant Vector Skyline ────────────────────────────── */}
          <g id="vibrant-skyline" filter="url(#glow-monument)">
            {/* 1. India Gate / Grand Arch (X Center = 180) */}
            <g fill="url(#grad-arch)">
              <rect x="120" y="230" width="120" height="150" rx="6" />
              <path d="M 152 380 L 152 290 C 152 260, 208 260, 208 290 L 208 380 Z" fill="#7DD3FC" />
              <rect x="110" y="215" width="140" height="15" rx="3" />
              <rect x="130" y="195" width="100" height="20" rx="3" />
              <rect x="150" y="180" width="60" height="15" rx="2" />
              <ellipse cx="180" cy="180" rx="22" ry="6" />
            </g>

            {/* 2. Qutub Minar (X Center = 380) */}
            <g fill="url(#grad-minar)">
              <path d="M 362 380 L 372 90 L 388 90 L 398 380 Z" />
              <rect x="366" y="315" width="28" height="8" rx="2" />
              <rect x="368" y="240" width="24" height="8" rx="2" />
              <rect x="370" y="165" width="20" height="8" rx="2" />
              <rect x="371" y="90" width="18" height="8" rx="2" />
              <polygon points="375,90 380,50 385,90" />
            </g>

            {/* 3. Taj Mahal (X Center = 680) */}
            <g fill="url(#grad-taj)">
              <rect x="600" y="290" width="160" height="90" rx="6" />
              <path d="M 640 290 C 640 200, 655 170, 680 120 C 705 170, 720 200, 720 290 Z" />
              <line x1="680" y1="120" x2="680" y2="80" stroke="url(#grad-taj)" strokeWidth="4" />
              <circle cx="680" cy="80" r="5" />
              
              <path d="M 650 380 L 650 320 C 650 300, 710 300, 710 320 L 710 380 Z" fill="#7DD3FC" />
              <path d="M 615 380 L 615 340 C 615 330, 635 330, 635 340 L 635 380 Z" fill="#7DD3FC" />
              <path d="M 725 380 L 725 340 C 725 330, 745 330, 745 340 L 745 380 Z" fill="#7DD3FC" />

              <rect x="550" y="160" width="12" height="220" rx="2" />
              <path d="M 548 160 C 548 140, 564 140, 564 160 Z" />
              <rect x="798" y="160" width="12" height="220" rx="2" />
              <path d="M 796 160 C 796 140, 812 140, 812 160 Z" />
            </g>

            {/* 4. Ancient Temple (X Center = 950) */}
            <g fill="url(#grad-temple)">
              <path d="M 880 380 C 880 310, 900 240, 915 220 L 925 380 Z" />
              <path d="M 1020 380 C 1020 310, 1000 240, 985 220 L 975 380 Z" />
              <path d="M 895 380 C 895 280, 920 180, 935 150 L 945 380 Z" />
              <path d="M 1005 380 C 1005 280, 980 180, 965 150 L 955 380 Z" />

              <path d="M 915 380 C 915 240, 935 110, 950 40 C 965 110, 985 240, 985 380 Z" />
              <ellipse cx="950" cy="35" rx="10" ry="5" />
              <polygon points="948,35 950,10 952,35" />
            </g>

            {/* 5. Majestic Buddha Statue (X Center = 1200) */}
            <g fill="url(#grad-buddha)">
              {/* Lotus Base */}
              <ellipse cx="1200" cy="370" rx="60" ry="12" />
              <path d="M 1140 370 Q 1200 395 1260 370 Z" />
              {/* Crossed Legs */}
              <path d="M 1150 365 Q 1200 350 1250 365 C 1245 335, 1155 335, 1150 365 Z" />
              {/* Torso */}
              <path d="M 1175 350 Q 1190 280 1200 270 Q 1210 280 1225 350 Z" />
              {/* Shoulders & Arms */}
              <path d="M 1165 295 C 1170 275, 1230 275, 1235 295 Q 1245 330 1220 345 Q 1200 355 1180 345 Q 1155 330 1165 295 Z" />
              {/* Head & Halo */}
              <circle cx="1200" cy="245" r="18" />
              <circle cx="1200" cy="245" r="28" fill="url(#grad-buddha)" opacity="0.4" />
              <path d="M 1195 230 Q 1200 215 1205 230 Z" /> {/* Top Knot */}
              <circle cx="1200" cy="245" r="45" fill="none" stroke="url(#grad-buddha)" strokeWidth="1.5" opacity="0.6" />
            </g>

            {/* 6. Sanchi Stupa / Great Dome (X Center = 1450) */}
            <g fill="url(#grad-stupa)">
              <path d="M 1370 380 A 80 80 0 0 1 1530 380 Z" />
              <rect x="1360" y="325" width="8" height="55" />
              <rect x="1390" y="325" width="8" height="55" />
              <rect x="1350" y="320" width="55" height="5" rx="1.5" />
              <rect x="1350" y="332" width="55" height="5" rx="1.5" />

              <rect x="1502" y="325" width="8" height="55" />
              <rect x="1532" y="325" width="8" height="55" />
              <rect x="1492" y="320" width="55" height="5" rx="1.5" />
              <rect x="1492" y="332" width="55" height="5" rx="1.5" />

              <rect x="1438" y="295" width="24" height="8" rx="1" />
              <line x1="1450" y1="295" x2="1450" y2="250" stroke="url(#grad-stupa)" strokeWidth="3.5" />
              <line x1="1435" y1="275" x2="1465" y2="275" stroke="url(#grad-stupa)" strokeWidth="3" strokeLinecap="round" />
              <line x1="1440" y1="262" x2="1460" y2="262" stroke="url(#grad-stupa)" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>

          {/* ── Ground Horizon Vector Line ───────────────────────────── */}
          <line x1="0" y1="380" x2="1600" y2="380" stroke="rgba(255,255,255,0.7)" strokeWidth="2" />
          <line x1="0" y1="381" x2="1600" y2="381" stroke="#FFFFFF" strokeWidth="1" className="opacity-90 animate-pulse" />

          {/* ── Mirror Water Reflection Layer (Flipped & Blurs) ───────── */}
          <g
            transform="scale(1, -1) translate(0, -760)"
            mask="url(#reflection-mask)"
            opacity="0.65"
            className="animate-water-ripple"
            style={{ filter: "blur(3px)" }}
          >
            <use href="#vibrant-skyline" />
          </g>
        </svg>
      </div>

      {/* ── Glowing Fog / Surface Light Layer ───────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 h-[140px] pointer-events-none z-10 animate-pulse"
        style={{
          background: "linear-gradient(to top, rgba(255, 255, 255, 0.4) 0%, rgba(186, 230, 253, 0.2) 60%, transparent 100%)",
          filter: "blur(10px)",
          animationDuration: "5s"
        }}
      />
    </div>
  );
}
