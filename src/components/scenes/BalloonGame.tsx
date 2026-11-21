"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { THEMES } from "@/lib/themes";
import { ThemeKey } from "@/lib/schema";
import { sounds } from "@/lib/soundEffects";

interface BalloonGameProps {
  theme: ThemeKey;
  recipientName?: string;
  onComplete: () => void;
}

interface Balloon {
  id: number;
  word: string;
  color: string;
  xPercent: number;
  yOffset: number;
  speed: number;
  emoji: string;
}

// Fixed word positions scattered across the viewport
const BALLOON_POSITIONS = [
  { xPercent: 20, yOffset: 22 },
  { xPercent: 78, yOffset: 28 },
  { xPercent: 18, yOffset: 68 },
  { xPercent: 76, yOffset: 64 },
];

export const BalloonGame: React.FC<BalloonGameProps> = ({
  theme,
  recipientName = "you",
  onComplete,
}) => {
  const currentTheme = THEMES[theme] || THEMES["pink-cloud"];
  const colors = currentTheme.balloonColors;

  const [balloons, setBalloons] = useState<Balloon[]>([
    { id: 1, word: "You", color: colors[0] || "#f43f5e", xPercent: BALLOON_POSITIONS[0].xPercent, yOffset: BALLOON_POSITIONS[0].yOffset, speed: 3.0, emoji: "🌸" },
    { id: 2, word: "are", color: colors[1] || "#38bdf8", xPercent: BALLOON_POSITIONS[1].xPercent, yOffset: BALLOON_POSITIONS[1].yOffset, speed: 2.7, emoji: "✨" },
    { id: 3, word: "so", color: colors[2] || "#10b981", xPercent: BALLOON_POSITIONS[2].xPercent, yOffset: BALLOON_POSITIONS[2].yOffset, speed: 3.4, emoji: "💛" },
    { id: 4, word: "special", color: colors[3] || "#a855f7", xPercent: BALLOON_POSITIONS[3].xPercent, yOffset: BALLOON_POSITIONS[3].yOffset, speed: 2.9, emoji: "🎀" },
  ]);

  // Track which words have been revealed and their original balloon positions
  const [revealedWords, setRevealedWords] = useState<
    { word: string; fromX: number; fromY: number; color: string }[]
  >([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [merging, setMerging] = useState(false);

  const popBalloon = (balloon: Balloon, event: React.MouseEvent | React.TouchEvent) => {
    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;
    if ("clientX" in event && event.clientX) {
      clientX = event.clientX; clientY = event.clientY;
    } else if ("touches" in event && event.touches[0]) {
      clientX = event.touches[0].clientX; clientY = event.touches[0].clientY;
    }

    sounds.playPop();

    try {
      confetti({
        particleCount: 32,
        spread: 65,
        origin: { x: clientX / window.innerWidth, y: clientY / window.innerHeight },
        colors: currentTheme.confettiColors,
        ticks: 160,
      });
    } catch {}

    setBalloons((prev) => prev.filter((b) => b.id !== balloon.id));

    // Store word WITH its original position so it appears where the balloon was
    setRevealedWords((prev) => [
      ...prev,
      {
        word: balloon.word,
        fromX: balloon.xPercent,
        fromY: balloon.yOffset,
        color: balloon.color,
      },
    ]);

    const nextCount = poppedCount + 1;
    setPoppedCount(nextCount);

    if (nextCount >= 4) {
      // Trigger merge animation after small delay
      setTimeout(() => {
        setMerging(true);
        sounds.playSparkle();
        setTimeout(() => onComplete(), 1600);
      }, 500);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none overflow-hidden">

      {/* Vibrant background sparkles */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {["🎉","🌟","✨","🎊","💫"].map((e, i) => (
          <motion.span
            key={i}
            className="absolute text-xl opacity-30 pointer-events-none"
            style={{ left: `${10 + i * 18}%`, top: `${5 + i * 8}%` }}
            animate={{ y: [0, -8, 0], opacity: [0.2, 0.5, 0.2] }}
            transition={{ repeat: Infinity, duration: 2 + i * 0.4, ease: "easeInOut" }}
          >
            {e}
          </motion.span>
        ))}
      </div>

      {/* Top Header */}
      <div className="w-full flex items-center justify-between mt-6 px-6 z-30">
        <div className="flex items-center gap-2">
          <span className="text-lg">🎈</span>
          <span className="text-sm font-black text-rose-500 tracking-wide">
            Pop all 4 balloons!
          </span>
        </div>
        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/80 text-rose-600 border border-rose-200 shadow-sm backdrop-blur-sm">
          {poppedCount}/4
        </span>
      </div>

      {/* Full play area: words behind balloons, then merge to center */}
      <div className="relative w-full flex-1 my-2">

        {/* ── REVEALED WORDS: initially at balloon position (z-0 = behind), merge to center (z-30 = top) ── */}
        <AnimatePresence>
          {revealedWords.map((item, i) => {
            const isAllPopped = poppedCount >= 4;
            return (
              <motion.div
                key={item.word + i}
                // Start at balloon's original screen position
                initial={{
                  position: "absolute",
                  left: `${item.fromX}%`,
                  top: `${item.fromY}%`,
                  x: "-50%",
                  y: "-50%",
                  scale: 0.7,
                  opacity: 0,
                  zIndex: 0,
                }}
                animate={
                  merging
                    ? {
                        // Fly to center and stack up
                        left: "50%",
                        top: "50%",
                        x: "-50%",
                        y: `calc(-50% + ${(i - 1.5) * 44}px)`,
                        scale: 1.15,
                        opacity: 1,
                        zIndex: 30,
                      }
                    : {
                        // Stay at balloon position, appear behind balloons
                        left: `${item.fromX}%`,
                        top: `${item.fromY}%`,
                        x: "-50%",
                        y: "-50%",
                        scale: 1,
                        opacity: 1,
                        zIndex: 0, // Behind balloons (z-10)
                      }
                }
                transition={
                  merging
                    ? { duration: 0.7, delay: i * 0.08, type: "spring", stiffness: 180, damping: 18 }
                    : { duration: 0.4, type: "spring", stiffness: 260, damping: 20 }
                }
                style={{ position: "absolute" }}
              >
                <span
                  className="font-handwriting font-black whitespace-nowrap drop-shadow-lg select-none"
                  style={{
                    fontSize: merging ? "clamp(26px, 8vw, 36px)" : "clamp(20px, 6vw, 28px)",
                    color: item.color,
                    textShadow: `0 0 20px ${item.color}88, 0 2px 8px rgba(0,0,0,0.15)`,
                    transition: "font-size 0.4s",
                  }}
                >
                  {item.word}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Heart + celebration emojis appear after merge */}
        <AnimatePresence>
          {merging && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="absolute left-1/2 -translate-x-1/2 flex gap-2 text-2xl"
              style={{ top: "calc(50% + 90px)", zIndex: 35 }}
            >
              <span>💖</span>
              <span className="animate-bounce delay-100">🦚</span>
              <span>🌸</span>
              <span className="animate-bounce delay-200">🎉</span>
              <span>💛</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BALLOONS: z-10 (above words until popped) ── */}
        <div className="relative w-full h-full z-10">
          <AnimatePresence>
            {balloons.map((balloon) => (
              <motion.div
                key={balloon.id}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, y: [0, -16, 0] }}
                exit={{
                  scale: 1.8,
                  opacity: 0,
                  transition: { duration: 0.2 },
                }}
                transition={{
                  scale: { duration: 0.4 },
                  opacity: { duration: 0.3 },
                  y: { repeat: Infinity, duration: balloon.speed, ease: "easeInOut" },
                }}
                style={{
                  position: "absolute",
                  left: `${balloon.xPercent}%`,
                  top: `${balloon.yOffset}%`,
                  transform: "translate(-50%, -50%)",
                }}
                className="cursor-pointer touch-manipulation"
                onClick={(e) => popBalloon(balloon, e)}
                onTouchStart={(e) => popBalloon(balloon, e)}
              >
                {/* Balloon body */}
                <div
                  className="relative w-[72px] h-[88px] rounded-[50%_50%_50%_50%/40%_40%_60%_60%] flex items-center justify-center shadow-xl active:scale-90 transition-transform"
                  style={{
                    backgroundColor: balloon.color,
                    boxShadow: `0 10px 32px ${balloon.color}66, 0 2px 8px rgba(0,0,0,0.12)`,
                  }}
                >
                  {/* Glossy gleam */}
                  <span className="absolute top-3 left-3.5 w-3 h-5 rounded-full bg-white/50 rotate-[-28deg]" />
                  <span className="text-xl select-none">{balloon.emoji}</span>
                  {/* Knot */}
                  <span
                    className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-2.5 rounded-b-sm"
                    style={{ backgroundColor: balloon.color }}
                  />
                  {/* String */}
                  <span className="absolute -bottom-9 left-1/2 -translate-x-1/2 w-px h-8 bg-slate-400/70" />
                </div>

                {/* Tap hint on first balloon */}
                {balloon.id === 1 && poppedCount === 0 && (
                  <motion.div
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                    className="absolute -bottom-14 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-500 whitespace-nowrap bg-white/80 px-2 py-0.5 rounded-full shadow-sm"
                  >
                    👆 Tap me!
                  </motion.div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom hint */}
      <div className="mb-6 z-30 text-center px-6">
        <p className="text-xs font-semibold text-[var(--theme-text-muted)]">
          {poppedCount >= 4
            ? "✨ Merging your message..."
            : `Tap each balloon to reveal hidden words ✨ (${4 - poppedCount} left)`}
        </p>
      </div>
    </div>
  );
};
