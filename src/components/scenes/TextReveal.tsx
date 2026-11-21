"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardConfig } from "@/lib/schema";
import { FloatingHearts } from "../ui/FloatingHearts";
import { Button } from "../ui/Button";
import { ArrowRight, Sparkles } from "lucide-react";

interface TextRevealProps {
  card: CardConfig;
  onComplete: () => void;
}

export const TextReveal: React.FC<TextRevealProps> = ({ card, onComplete }) => {
  const [visibleIndex, setVisibleIndex] = useState(0);

  const getOccasionMessages = (): string[] => {
    switch (card.occasion) {
      case "birthday":
        return [
          `Some people make the world brighter just by being in it.`,
          `Today is all about honoring you, ${card.recipientName}.`,
          `Every smile, every laugh, and every precious moment shared.`,
          `Let's take a stroll down memory lane...`,
        ];
      case "anniversary":
        return [
          `Time flies, but every second with you feels timeless.`,
          `Thank you for being my anchor and my greatest adventure.`,
          `Here is to us, our journey, and everything yet to come.`,
          `Here are some moments I'll never forget...`,
        ];
      case "sorry":
        return [
          `From the bottom of my heart, you mean the world to me.`,
          `No misunderstanding can ever change how deeply I care.`,
          `I hope this brings a gentle smile to your face.`,
          `Here are the memories that remind me of our bond...`,
        ];
      default:
        return [
          `True friendship is one of life's greatest gifts.`,
          `Thank you for always being there through thick and thin.`,
          `You deserve all the love, happiness, and celebrations today.`,
          `Let's take a look at our favourite memories together...`,
        ];
    }
  };

  const lines = getOccasionMessages();

  useEffect(() => {
    if (visibleIndex < lines.length - 1) {
      const timer = setTimeout(() => {
        setVisibleIndex((prev) => prev + 1);
      }, 1600);
      return () => clearTimeout(timer);
    }
  }, [visibleIndex, lines.length]);

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      <FloatingHearts count={10} />

      {/* Top Header */}
      <div className="text-center mt-6 z-10">
        <span className="inline-flex items-center gap-1 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-[var(--theme-accent)] shadow-sm backdrop-blur-md border border-[var(--theme-accent)]/20 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          A Special Note
        </span>
      </div>

      {/* Center Animated Lines */}
      <div className="my-auto flex flex-col gap-5 px-3 z-10">
        <AnimatePresence>
          {lines.slice(0, visibleIndex + 1).map((line, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`p-4 rounded-2xl backdrop-blur-md border shadow-sm transition-all ${
                idx === visibleIndex
                  ? "bg-white/90 border-[var(--theme-accent)]/30 text-[var(--theme-text)] shadow-md"
                  : "bg-white/60 border-white/40 text-[var(--theme-text)]/75"
              }`}
            >
              <p className="text-base sm:text-lg font-medium leading-relaxed">
                {line}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom Button */}
      <div className="mb-8 z-10 flex flex-col items-center">
        {visibleIndex >= lines.length - 1 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-xs"
          >
            <Button
              onClick={onComplete}
              variant="primary"
              size="lg"
              className="w-full gap-2 shadow-lg"
            >
              <span>View Photos</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </motion.div>
        ) : (
          <button
            onClick={() => setVisibleIndex(lines.length - 1)}
            className="text-xs text-[var(--theme-text-muted)] underline underline-offset-4 py-2 px-4 cursor-pointer hover:text-[var(--theme-text)]"
          >
            Skip animation
          </button>
        )}
      </div>
    </div>
  );
};
