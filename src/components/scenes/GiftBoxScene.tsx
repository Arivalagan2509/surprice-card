"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles } from "lucide-react";
import { sounds } from "@/lib/soundEffects";

interface GiftBoxSceneProps {
  onComplete: () => void;
}

export const GiftBoxScene: React.FC<GiftBoxSceneProps> = ({ onComplete }) => {
  const [opened, setOpened] = useState(false);

  const handleOpenGift = () => {
    if (opened) return;
    setOpened(true);
    sounds.playFanfare();

    try {
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.55 },
        colors: ["#ec4899", "#f43f5e", "#ffd166", "#a855f7", "#38bdf8"],
      });
    } catch {}

    setTimeout(() => {
      onComplete();
    }, 1200);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="text-center mt-8 z-20">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          One Last Thing...
        </h2>
        <p className="text-sm text-rose-500 font-semibold mt-1">
          Tap the gift to open 🎁
        </p>
      </div>

      {/* Pulsating & Wobbling Gift Box */}
      <div className="relative my-auto flex flex-col items-center justify-center cursor-pointer">
        <motion.div
          animate={
            !opened
              ? {
                  rotate: [0, -3, 3, -3, 3, 0],
                  scale: [1, 1.04, 1],
                }
              : {
                  scale: 1.3,
                  opacity: 0,
                }
          }
          transition={
            !opened
              ? {
                  repeat: Infinity,
                  duration: 2.2,
                  ease: "easeInOut",
                }
              : { duration: 0.3 }
          }
          onClick={handleOpenGift}
          className="relative flex flex-col items-center group"
        >
          {/* Confetti sparkle badge */}
          <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 text-white font-bold text-xs flex items-center justify-center shadow-lg animate-bounce">
            1
          </div>

          {/* Gift Box Lid */}
          <div className="w-36 h-10 rounded-t-xl bg-gradient-to-r from-rose-400 via-pink-400 to-rose-400 border border-white/60 shadow-lg relative flex items-center justify-center">
            {/* Satin Ribbon Top Bow */}
            <span className="absolute -top-7 text-4xl filter drop-shadow">🎀</span>
            {/* Ribbon stripe */}
            <span className="w-8 h-full bg-amber-300 shadow-sm" />
          </div>

          {/* Gift Box Body */}
          <div className="w-32 h-28 rounded-b-2xl bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 border border-white/30 shadow-2xl relative flex justify-center overflow-hidden">
            {/* Vertical ribbon stripe */}
            <span className="w-8 h-full bg-amber-300 shadow-inner" />
            {/* Horizontal ribbon stripe */}
            <span className="absolute top-1/2 -translate-y-1/2 inset-x-0 h-8 bg-amber-300 shadow-inner" />
          </div>
        </motion.div>
      </div>

      {/* Bottom Hint */}
      <div className="mb-8 z-20 text-center">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-rose-500 shadow-sm backdrop-blur-md border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" />
          Tap box to unwrap
        </span>
      </div>
    </div>
  );
};
