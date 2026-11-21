"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { CardConfig } from "@/lib/schema";
import { THEMES } from "@/lib/themes";
import { Button } from "../ui/Button";
import { RotateCcw, Sparkles } from "lucide-react";
import { sounds } from "@/lib/soundEffects";

interface FinaleProps {
  card: CardConfig;
  onReplay: () => void;
}

const KRISHNA_PARADE = ["🦚","🌸","🎵","🪘","🕺","🌼","🪷","💛","🎉","🌟","🧸","🎊","🐻","✨"];

export const Finale: React.FC<FinaleProps> = ({ card, onReplay }) => {
  const currentTheme = THEMES[card.theme] || THEMES["pink-cloud"];

  useEffect(() => {
    sounds.playSparkle();
    const end = Date.now() + 3000;
    const colors = currentTheme.confettiColors;

    const frame = () => {
      try {
        confetti({ particleCount: 6, angle: 60, spread: 65, origin: { x: 0, y: 0.75 }, colors });
        confetti({ particleCount: 6, angle: 120, spread: 65, origin: { x: 1, y: 0.75 }, colors });
      } catch {}
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [currentTheme]);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-5 text-center select-none overflow-hidden">

      {/* Vibrant background gradient shimmer */}
      <div
        className="absolute inset-0 -z-10 opacity-50"
        style={{
          background:
            "radial-gradient(ellipse at 15% 20%, #ff6eb480, transparent 55%), radial-gradient(ellipse at 85% 80%, #c084fc80, transparent 55%), radial-gradient(ellipse at 55% 45%, #fde68a60, transparent 65%)",
        }}
      />

      {/* Floating krishna/celebration parade */}
      {KRISHNA_PARADE.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none"
          style={{
            left: `${(i * 71 + 3) % 93}%`,
            top: `${(i * 53 + 5) % 88}%`,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.9, 0.4],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.0 + (i % 5) * 0.4,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Top Badge */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: "spring" }}
        className="mt-5 z-20"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black bg-white/90 text-rose-500 shadow-md backdrop-blur-md border border-rose-200 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Celebration Complete 🎊
        </span>
      </motion.div>

      {/* Main Celebration Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
        className="my-auto z-20 flex flex-col items-center px-3 max-w-sm w-full"
      >
        {/* Giant celebration illustration */}
        <div className="relative w-full flex items-center justify-center mb-5">
          {/* Circular glow halo */}
          <div className="absolute w-44 h-44 rounded-full opacity-30 blur-2xl"
            style={{ background: "radial-gradient(circle, #f43f5e, #a855f7)" }} />

          {/* Main emoji parade */}
          <motion.div
            animate={{ rotate: [0, 3, -3, 0] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="relative bg-white/90 rounded-3xl shadow-2xl border border-rose-200/60 p-5 flex flex-col items-center gap-1"
          >
            {/* Top row */}
            <div className="flex items-center gap-2">
              {["🧸","🦚","🎂","🦚","🐻"].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-3xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.4, delay: i * 0.12 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
            {/* Colourful happy birthday */}
            <div className="flex flex-wrap justify-center gap-0.5 mt-1">
              {"🎉 Happy Birthday! 🎉".split("").map((c, i) => (
                <motion.span
                  key={i}
                  className="font-black text-sm"
                  style={{ color: ["#f43f5e","#f97316","#eab308","#22c55e","#3b82f6","#a855f7"][i % 6] }}
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 0.9, delay: i * 0.05 }}
                >
                  {c === " " ? "\u00A0" : c}
                </motion.span>
              ))}
            </div>
            {/* Bottom row */}
            <div className="flex items-center gap-2 mt-1">
              {["🌸","🎊","💖","🎵","🌼"].map((e, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 1.3, delay: 0.6 + i * 0.1 }}
                >
                  {e}
                </motion.span>
              ))}
            </div>
          </motion.div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Once again, Happy Birthday{" "}
          <span
            className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-600 bg-clip-text text-transparent"
          >
            {card.recipientName}
          </span>
          ! 🌸
        </h1>

        <p className="font-handwriting text-2xl text-rose-600 mt-2 leading-relaxed px-2">
          &ldquo;May your day be as radiant and joyful as your beautiful soul.&rdquo;
        </p>

        <div className="mt-3 px-4 py-2 rounded-2xl bg-white/80 border border-rose-200/60 shadow-sm">
          <span className="text-sm font-bold text-slate-700">
            Crafted with all my heart, {card.senderName} 💖
          </span>
        </div>
      </motion.div>

      {/* Replay only (no "Create" button) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="w-full max-w-xs mb-7 z-20"
      >
        <Button
          onClick={onReplay}
          variant="primary"
          size="lg"
          className="w-full gap-2 font-black shadow-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Replay Surprise ↺</span>
        </Button>
      </motion.div>
    </div>
  );
};
