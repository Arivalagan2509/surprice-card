"use client";

import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardConfig } from "@/lib/schema";
import { FloatingHearts } from "../ui/FloatingHearts";
import { Sparkles } from "lucide-react";

interface StartScreenProps {
  card: CardConfig;
  onComplete: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({ card, onComplete }) => {
  const [phase, setPhase] = useState<"greeting" | "excited">("greeting");
  const [noPos, setNoPos] = useState({ x: 0, y: 0 });
  const noRef = useRef<HTMLButtonElement>(null);

  const occasionLabels: Record<string, string> = {
    birthday: "Birthday Surprise 🎂",
    anniversary: "Anniversary Special 💍",
    sorry: "Heartfelt Message 💌",
    friends: "A Little Something 🌟",
  };

  // Kaleidoscope krishna-y emojis flying
  const celebrationEmojis = ["🦚", "🪘", "🌸", "🎵", "🪷", "✨", "💛", "🌼", "🎉", "🐻", "🧸", "🎊"];

  // Runaway "No" button logic
  const handleNoHover = useCallback(() => {
    const container = noRef.current?.parentElement;
    if (!container) return;
    const { width, height } = container.getBoundingClientRect();
    const maxX = Math.min(80, Math.max(-80, (Math.random() - 0.5) * 160));
    const maxY = Math.min(60, Math.max(-60, (Math.random() - 0.5) * 100));
    setNoPos({ x: maxX, y: maxY });
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-5 text-center select-none overflow-hidden">
      {/* Vibrant gradient shimmer background layer */}
      <div
        className="absolute inset-0 -z-10 opacity-60"
        style={{
          background:
            "radial-gradient(ellipse at 20% 30%, #ff6eb480 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, #c084fc80 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, #fde68a60 0%, transparent 70%)",
        }}
      />

      <FloatingHearts count={10} />

      {/* Floating celebration emojis */}
      {celebrationEmojis.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl pointer-events-none select-none"
          style={{
            left: `${(i * 83 + 7) % 95}%`,
            top: `${(i * 61 + 10) % 85}%`,
          }}
          animate={{
            y: [0, -12, 0],
            rotate: [0, i % 2 === 0 ? 15 : -15, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2.2 + (i % 4) * 0.5,
            delay: i * 0.18,
            ease: "easeInOut",
          }}
        >
          {emoji}
        </motion.span>
      ))}

      {/* Top badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mt-4 z-20"
      >
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase bg-white/90 text-rose-500 shadow-md backdrop-blur-md border border-rose-200">
          <Sparkles className="w-3.5 h-3.5" />
          {occasionLabels[card.occasion] || "Special Surprise"}
        </span>
      </motion.div>

      {/* === PHASE: GREETING === */}
      <AnimatePresence mode="wait">
        {phase === "greeting" && (
          <motion.div
            key="greeting"
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.85, opacity: 0, y: -20 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="my-auto z-20 flex flex-col items-center px-2"
          >
            {/* Cute Krishna + Teddy bear birthday scene */}
            <motion.div
              className="relative flex items-end justify-center gap-2 mb-4"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
            >
              {/* Teddy on left */}
              <motion.div
                animate={{ rotate: [-5, 5, -5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <span className="text-5xl filter drop-shadow-lg">🧸</span>
                <span className="text-xs font-bold text-amber-700 mt-1">BFF</span>
              </motion.div>

              {/* Birthday cake in center */}
              <div className="flex flex-col items-center">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-6xl filter drop-shadow-xl"
                >
                  🎂
                </motion.div>
                {/* Stars around cake */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  className="absolute -top-2 w-24 h-24 flex items-center justify-center pointer-events-none"
                >
                  {["✨","⭐","🌟","💫"].map((s, i) => (
                    <span
                      key={i}
                      className="absolute text-lg"
                      style={{
                        left: `${50 + 42 * Math.cos((i * Math.PI) / 2)}%`,
                        top: `${50 + 42 * Math.sin((i * Math.PI) / 2)}%`,
                        transform: "translate(-50%,-50%)",
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </motion.div>
              </div>

              {/* Peacock / Krishna flute player on right */}
              <motion.div
                animate={{ rotate: [5, -5, 5] }}
                transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
                className="flex flex-col items-center"
              >
                <span className="text-5xl filter drop-shadow-lg">🦚</span>
                <span className="text-xs font-bold text-indigo-600 mt-1">Joy!</span>
              </motion.div>
            </motion.div>

            {/* Birthday banner */}
            <div className="relative mb-2">
              <div className="flex items-center gap-1 justify-center">
                {"🎉HAPPY BIRTHDAY🎉".split("").map((c, i) => (
                  <motion.span
                    key={i}
                    className="font-black text-lg sm:text-xl"
                    style={{
                      color: ["#f43f5e","#f97316","#eab308","#22c55e","#3b82f6","#a855f7"][i % 6],
                      textShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    }}
                    animate={{ y: [0, -4, 0] }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.06,
                      ease: "easeInOut",
                    }}
                  >
                    {c === " " ? "\u00A0" : c}
                  </motion.span>
                ))}
              </div>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              Hey{" "}
              <span
                className="bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent"
              >
                {card.recipientName}
              </span>
              ! 🌸
            </h2>
            <p className="text-sm text-slate-600 mt-2 font-medium max-w-xs leading-relaxed">
              {card.senderName} has crafted a magical surprise experience just for you ✨
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPhase("excited")}
              className="mt-6 min-h-[52px] px-8 py-3.5 rounded-2xl font-black text-base text-white shadow-xl cursor-pointer transition-all"
              style={{
                background: "linear-gradient(135deg, #f43f5e 0%, #ec4899 50%, #a855f7 100%)",
                boxShadow: "0 8px 30px rgba(244,63,94,0.4)",
              }}
            >
              Open My Surprise 🎁✨
            </motion.button>
            <p className="text-[11px] text-slate-500 mt-2">(Sound on recommended 🎧)</p>
          </motion.div>
        )}

        {/* === PHASE: EXCITED QUESTION === */}
        {phase === "excited" && (
          <motion.div
            key="excited"
            initial={{ scale: 0.85, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="my-auto z-20 flex flex-col items-center px-4 w-full max-w-sm"
          >
            {/* Excited krishna emojis */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [-3, 3, -3] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-6xl mb-4 filter drop-shadow-xl"
            >
              🕺
            </motion.div>

            {/* Question Card */}
            <div className="w-full bg-white/95 rounded-3xl p-6 shadow-2xl border border-rose-200/60 backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-2xl">🤩</span>
                <span className="text-2xl">🦚</span>
                <span className="text-2xl">🎊</span>
              </div>
              <h3 className="text-xl font-black text-slate-800 mt-2 leading-snug">
                Are you excited for{" "}
                <span className="bg-gradient-to-r from-rose-500 to-purple-500 bg-clip-text text-transparent">
                  what&apos;s next?
                </span>{" "}
                🥳
              </h3>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Your answer determines what happens next 👀
              </p>

              {/* YES / NO buttons */}
              <div className="relative mt-5 flex items-center justify-center gap-4 h-20">
                {/* YES — normal, prominent */}
                <motion.button
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => {
                    onComplete();
                  }}
                  className="min-h-[52px] px-8 py-3 rounded-2xl font-black text-lg text-white shadow-xl cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    boxShadow: "0 6px 20px rgba(34,197,94,0.45)",
                  }}
                >
                  YES! 🎉
                </motion.button>

                {/* NO — runs away */}
                <motion.button
                  ref={noRef}
                  animate={{ x: noPos.x, y: noPos.y }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  onMouseEnter={handleNoHover}
                  onFocus={handleNoHover}
                  onClick={handleNoHover}
                  className="min-h-[44px] px-5 py-2.5 rounded-2xl font-semibold text-sm text-slate-500 bg-slate-100 border border-slate-200 shadow-sm cursor-pointer"
                >
                  No 🙅
                </motion.button>
              </div>

              <p className="text-[10px] text-rose-400 font-semibold mt-3 animate-pulse">
                💡 Try clicking &quot;No&quot; — it won&apos;t let you!
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom spacer */}
      <div className="mb-6 z-10" />
    </div>
  );
};
