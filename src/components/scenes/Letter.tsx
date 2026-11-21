"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "../ui/Button";
import { Sparkles, ArrowRight, Heart, Mail } from "lucide-react";
import { sounds } from "@/lib/soundEffects";

interface LetterProps {
  senderName: string;
  recipientName: string;
  letterText: string;
  onComplete: () => void;
}

export const Letter: React.FC<LetterProps> = ({
  senderName,
  recipientName,
  letterText,
  onComplete,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [displayedLength, setDisplayedLength] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const openEnvelope = () => {
    sounds.playEnvelopeOpen();
    setIsOpen(true);
  };

  // Typewriter effect speed after envelope opens
  useEffect(() => {
    if (!isOpen) return;

    if (displayedLength < letterText.length && !isFinished) {
      const timeout = setTimeout(() => {
        setDisplayedLength((prev) => {
          const next = prev + 3;
          return next >= letterText.length ? letterText.length : next;
        });
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 24);
      return () => clearTimeout(timeout);
    } else if (displayedLength >= letterText.length && !isFinished) {
      setIsFinished(true);
    }
  }, [isOpen, displayedLength, letterText.length, isFinished]);

  const handleSkip = () => {
    setDisplayedLength(letterText.length);
    setIsFinished(true);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="text-center mt-6 z-10 flex items-center justify-between w-full max-w-sm mx-auto">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-[var(--theme-accent)] shadow-sm backdrop-blur-md border border-[var(--theme-accent)]/20 uppercase tracking-wider">
          <Heart className="w-3.5 h-3.5 fill-[var(--theme-accent)]" />
          A Message From My Heart
        </span>

        {isOpen && !isFinished && (
          <button
            onClick={handleSkip}
            className="text-xs font-semibold text-[var(--theme-accent)] bg-white/90 px-3 py-1.5 rounded-full border border-[var(--theme-accent)]/20 shadow-sm hover:bg-white cursor-pointer active:scale-95 transition-all"
          >
            Show All
          </button>
        )}
      </div>

      {/* Main Area: Sealed Envelope OR Opened Letter */}
      <div className="relative my-auto flex-1 w-full max-w-sm mx-auto flex items-center justify-center py-2">
        <AnimatePresence mode="wait">
          {!isOpen ? (
            /* Sealed Envelope */
            <motion.div
              key="envelope"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1, y: [0, -6, 0] }}
              exit={{ scale: 0.9, opacity: 0, y: -20 }}
              transition={{
                scale: { duration: 0.5 },
                y: { repeat: Infinity, duration: 2.5, ease: "easeInOut" },
              }}
              onClick={openEnvelope}
              className="w-full aspect-[4/3] rounded-3xl bg-gradient-to-br from-pink-100 via-rose-100 to-indigo-100 border-2 border-white shadow-2xl p-6 flex flex-col items-center justify-center cursor-pointer group active:scale-95 transition-transform relative overflow-hidden"
            >
              {/* Envelope flap aesthetic */}
              <div className="absolute top-0 inset-x-0 h-1/2 bg-white/40 border-b border-rose-200/50 [clip-path:polygon(0_0,50%_100%,100%_0)]" />

              {/* Heart Wax Seal */}
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="w-16 h-16 rounded-full bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 border-2 border-white z-10"
              >
                <Heart className="w-8 h-8 fill-white" />
              </motion.div>

              <span className="font-handwriting text-2xl text-slate-700 mt-4 z-10">
                For {recipientName} 💌
              </span>

              <span className="text-[11px] font-bold text-rose-500 uppercase tracking-widest mt-1 z-10">
                TAP TO OPEN
              </span>
            </motion.div>
          ) : (
            /* Unfolded Letter Card */
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="relative w-full h-full max-h-[460px] bg-[#fffdfa] rounded-3xl shadow-2xl border border-rose-100 p-6 flex flex-col overflow-hidden"
              style={{
                backgroundImage:
                  "radial-gradient(#eedbc5 0.75px, transparent 0.75px), radial-gradient(#eedbc5 0.75px, #fffdfa 0.75px)",
                backgroundSize: "22px 22px",
                backgroundPosition: "0 0, 11px 11px",
              }}
            >
              {/* Heart Wax Stamp */}
              <div className="absolute top-4 right-4 w-9 h-9 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md border-2 border-white opacity-90">
                <Heart className="w-4 h-4 fill-white" />
              </div>

              {/* Scrollable text */}
              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto pr-1 space-y-3 font-handwriting text-2xl sm:text-3xl text-slate-800 leading-relaxed scroll-smooth"
              >
                <div className="whitespace-pre-wrap select-text">
                  {letterText.slice(0, displayedLength)}
                  {!isFinished && (
                    <span className="inline-block w-1.5 h-6 bg-rose-500 ml-1 animate-pulse" />
                  )}
                </div>
              </div>

              {/* Little cute couple sticker at bottom right */}
              <div className="mt-2 pt-2 border-t border-rose-100 flex items-center justify-between text-xs text-rose-400">
                <span>With all my love, {senderName}</span>
                <span className="text-xl">🐱❤️🐰</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Action Button */}
      <div className="mb-8 z-10 w-full max-w-sm mx-auto">
        {isOpen ? (
          <Button
            onClick={() => {
              sounds.playSparkle();
              onComplete();
            }}
            variant="primary"
            size="lg"
            className="w-full gap-2 shadow-xl"
          >
            <span>One last surprise 🎁</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={openEnvelope}
            variant="primary"
            size="lg"
            className="w-full gap-2 shadow-xl"
          >
            <Mail className="w-4 h-4" />
            <span>Open Envelope</span>
          </Button>
        )}
      </div>
    </div>
  );
};
