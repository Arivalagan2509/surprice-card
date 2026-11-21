"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { sounds } from "@/lib/soundEffects";

interface HeartCatchGameProps {
  onComplete: () => void;
}

interface FallingHeart {
  id: number;
  xPercent: number;
  y: number; // 0 to 100
  speed: number;
  emoji: string;
}

const HEART_EMOJIS = ["💖", "💕", "✨", "🌸", "💝", "🦚", "💛"];

export const HeartCatchGame: React.FC<HeartCatchGameProps> = ({ onComplete }) => {
  const [basketX, setBasketX] = useState(50); // percentage 12 to 88
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState<FallingHeart[]>([]);
  const [splash, setSplash] = useState<{ id: number; x: number; y: number }[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const nextHeartId = useRef(1);

  // Spawn hearts
  useEffect(() => {
    if (score >= 5) return;
    const interval = setInterval(() => {
      setHearts((prev) => {
        if (prev.length >= 3) return prev;
        const emoji = HEART_EMOJIS[Math.floor(Math.random() * HEART_EMOJIS.length)];
        return [
          ...prev,
          {
            id: nextHeartId.current++,
            xPercent: 15 + Math.random() * 70,
            y: 0,
            speed: 1.4 + Math.random() * 0.9,
            emoji,
          },
        ];
      });
    }, 1100);

    return () => clearInterval(interval);
  }, [score]);

  // Game loop for collisions
  useEffect(() => {
    if (score >= 5) return;

    const loop = setInterval(() => {
      setHearts((prev) => {
        const next: FallingHeart[] = [];
        for (const heart of prev) {
          const newY = heart.y + heart.speed;

          // Check collision with basket (basket at y=82%, width ~26%)
          const isInBasketY = newY >= 76 && newY <= 86;
          const isInBasketX = Math.abs(heart.xPercent - basketX) < 16;

          if (isInBasketY && isInBasketX) {
            sounds.playPop();

            // Spawn floating splash indicator
            setSplash((sp) => [
              ...sp,
              { id: Date.now(), x: heart.xPercent, y: 78 },
            ]);

            setScore((s) => {
              const newScore = s + 1;
              if (newScore >= 5) {
                sounds.playSparkle();
                try {
                  confetti({
                    particleCount: 50,
                    spread: 80,
                    origin: { y: 0.8 },
                    colors: ["#ec4899", "#f43f5e", "#a855f7", "#fbbf24"],
                  });
                } catch {}
                setTimeout(onComplete, 900);
              }
              return newScore;
            });
          } else if (newY < 95) {
            next.push({ ...heart, y: newY });
          }
        }
        return next;
      });
    }, 30);

    return () => clearInterval(loop);
  }, [basketX, score, onComplete]);

  // Clean splashes
  useEffect(() => {
    if (splash.length === 0) return;
    const t = setTimeout(() => {
      setSplash((prev) => prev.slice(1));
    }, 600);
    return () => clearTimeout(t);
  }, [splash]);

  // Touch / mouse movement
  const handleMove = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    setBasketX(Math.max(12, Math.min(88, x)));
  }, []);

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => e.touches[0] && handleMove(e.touches[0].clientX)}
      className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden touch-none"
    >
      {/* Top Header */}
      <div className="text-center mt-4 z-10">
        <div className="flex items-center justify-center gap-1.5 text-2xl mb-1">
          <span>🧸</span>
          <span>🦚</span>
          <span>💖</span>
          <span>🦚</span>
          <span>🧸</span>
        </div>
        <span className="inline-block px-4 py-1 rounded-full text-xs font-bold bg-white/90 text-pink-600 shadow-sm border border-pink-200 uppercase tracking-wider">
          Catch the Love 🧺
        </span>
        <h2 className="text-xl font-black text-[var(--theme-text)] mt-1.5 drop-shadow-sm">
          Catch 5 falling hearts!
        </h2>

        {/* Progress Dots */}
        <div className="flex justify-center items-center gap-2 mt-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              initial={false}
              animate={{
                scale: i < score ? [1, 1.3, 1] : 1,
              }}
              className={`w-5 h-5 rounded-full flex items-center justify-center text-xs transition-colors duration-200 ${
                i < score
                  ? "bg-pink-500 text-white shadow-md shadow-pink-500/40"
                  : "bg-white/70 text-gray-300 border border-pink-200"
              }`}
            >
              {i < score ? "❤️" : "○"}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Falling Hearts Area */}
      <div className="relative w-full flex-1 my-2">
        <AnimatePresence>
          {hearts.map((h) => (
            <motion.div
              key={h.id}
              style={{
                position: "absolute",
                left: `${h.xPercent}%`,
                top: `${h.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="text-3xl select-none pointer-events-none drop-shadow-md animate-bounce"
            >
              {h.emoji}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Splash indicator (+1 Love) */}
        {splash.map((sp) => (
          <motion.div
            key={sp.id}
            initial={{ opacity: 1, y: 0, scale: 0.8 }}
            animate={{ opacity: 0, y: -40, scale: 1.3 }}
            transition={{ duration: 0.6 }}
            style={{
              position: "absolute",
              left: `${sp.x}%`,
              top: `${sp.y}%`,
              transform: "translate(-50%, -50%)",
            }}
            className="text-sm font-black text-pink-600 bg-white/90 px-2 py-0.5 rounded-full shadow-lg border border-pink-200 pointer-events-none z-20"
          >
            +1 💕
          </motion.div>
        ))}

        {/* Basket */}
        <motion.div
          style={{
            position: "absolute",
            left: `${basketX}%`,
            top: "82%",
            transform: "translate(-50%, -50%)",
          }}
          className="flex flex-col items-center cursor-grab active:cursor-grabbing"
        >
          <div className="w-20 h-12 rounded-b-3xl bg-gradient-to-b from-amber-600 to-amber-800 border-2 border-amber-400 shadow-2xl flex items-center justify-center text-white text-2xl relative">
            <span className="drop-shadow">🧺</span>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500 text-[10px] font-bold text-white shadow">
              LOVE
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Controls */}
      <div className="mb-4 z-10 flex flex-col items-center gap-1">
        <p className="text-xs text-[var(--theme-text-muted)] font-medium">
          👉 Drag horizontally to catch with your basket 🧺
        </p>
        <button
          onClick={onComplete}
          className="text-xs text-[var(--theme-text-muted)] underline underline-offset-4 py-1 px-3 hover:text-[var(--theme-text)] opacity-80 hover:opacity-100 transition"
        >
          Skip mini-game →
        </button>
      </div>
    </div>
  );
};
