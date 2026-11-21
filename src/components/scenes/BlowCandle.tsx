"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { Sparkles, Wind } from "lucide-react";
import { sounds } from "@/lib/soundEffects";

interface BlowCandleProps {
  recipientName: string;
  onComplete: () => void;
}

export const BlowCandle: React.FC<BlowCandleProps> = ({ recipientName, onComplete }) => {
  const [isBlown, setIsBlown] = useState(false);
  const [wishPhase, setWishPhase] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Extinguish candle handler
  const extinguishCandle = useCallback(() => {
    if (isBlown) return;
    setIsBlown(true);

    // Stop microphone if running
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    // Play whoosh and sparkle
    sounds.playBlow();

    // Trigger make a wish phase
    setTimeout(() => {
      setWishPhase(true);
      sounds.playSparkle();

      try {
        confetti({
          particleCount: 35,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#ffd166", "#f43f5e", "#ffedd5", "#fbbf24"],
        });
      } catch {}

      // Advance after making a wish
      setTimeout(() => {
        onComplete();
      }, 3200);
    }, 600);
  }, [isBlown, onComplete]);

  // Optional microphone listening for blowing
  const startMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      streamRef.current = stream;
      setMicActive(true);

      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      audioContextRef.current = ctx;

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const checkBlow = () => {
        if (!audioContextRef.current || isBlown) return;
        analyser.getByteFrequencyData(dataArray);

        // Calculate average amplitude of low-frequency blowing sound
        let sum = 0;
        for (let i = 0; i < 30; i++) {
          sum += dataArray[i];
        }
        const average = sum / 30;

        if (average > 65) {
          extinguishCandle();
          return;
        }

        requestAnimationFrame(checkBlow);
      };

      checkBlow();
    } catch {
      // If mic permission blocked, blow button works seamlessly
      setMicActive(false);
      extinguishCandle();
    }
  };

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full h-full flex flex-col items-center justify-between p-6 select-none transition-colors duration-1000 ${
        wishPhase ? "bg-slate-950/90 text-white" : ""
      }`}
    >
      {/* Top Header */}
      <div className="text-center mt-6 z-20">
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider backdrop-blur-md transition-all ${
            wishPhase
              ? "bg-white/10 text-amber-200 border border-amber-300/30"
              : "bg-white/80 text-rose-600 border border-rose-200/50 shadow-sm"
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Birthday Ritual
        </span>
        <h2
          className={`text-2xl font-bold mt-2 transition-colors ${
            wishPhase ? "text-amber-100" : "text-slate-800"
          }`}
        >
          Blow the candle, {recipientName} 🎂
        </h2>
      </div>

      {/* Center Cake & Candle */}
      <div className="relative my-auto flex flex-col items-center justify-center z-10">
        {/* Wish Phase Overlay Text */}
        <AnimatePresence>
          {wishPhase && (
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.7 }}
              className="absolute -top-16 text-center z-30"
            >
              <h3 className="text-2xl sm:text-3xl font-serif italic text-amber-200 drop-shadow-md">
                Close your eyes & make a wish ✨
              </h3>
              <p className="text-xs text-amber-200/80 mt-1 font-sans">
                May all your sweetest dreams come true
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* The Candle */}
        <div
          onClick={extinguishCandle}
          className="relative flex flex-col items-center cursor-pointer group"
        >
          {/* Flame & Glow */}
          <div className="relative w-8 h-12 flex items-center justify-center mb-1">
            <AnimatePresence>
              {!isBlown ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{
                    scale: [1, 1.12, 0.95, 1.08, 1],
                    rotate: [-2, 2, -1, 3, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.2,
                    ease: "easeInOut",
                  }}
                  exit={{
                    scale: 0,
                    opacity: 0,
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                  className="relative flex items-center justify-center"
                >
                  {/* Outer yellow halo */}
                  <span className="absolute w-12 h-14 rounded-full bg-amber-400/40 blur-md animate-pulse" />
                  {/* Outer flame */}
                  <span className="w-5 h-9 rounded-[50%_50%_40%_40%/60%_60%_40%_40%] bg-gradient-to-t from-orange-500 via-amber-400 to-yellow-200 shadow-[0_0_15px_#f59e0b]" />
                  {/* Inner blue base */}
                  <span className="absolute bottom-0 w-2 h-3 rounded-full bg-blue-400/80 blur-[0.5px]" />
                </motion.div>
              ) : (
                /* Smoke puff after blow */
                <motion.div
                  initial={{ opacity: 0.8, y: 0, scale: 0.8 }}
                  animate={{ opacity: 0, y: -45, scale: 2 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-lg select-none text-slate-400"
                >
                  💨
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Candle Wick */}
          <span className="w-0.5 h-3 bg-slate-800" />

          {/* Candle Body */}
          <div className="w-5 h-16 rounded-t-sm bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 shadow-md border-t border-white/50 relative overflow-hidden">
            {/* Candle stripes */}
            <div className="absolute inset-0 opacity-20 bg-[repeating-linear-gradient(45deg,#000_0,#000_4px,transparent_4px,transparent_8px)]" />
          </div>
        </div>

        {/* The 2-Tier Birthday Cake Illustration */}
        <div
          onClick={extinguishCandle}
          className="relative flex flex-col items-center mt-[-2px] cursor-pointer"
        >
          {/* Top Layer */}
          <div className="w-36 h-14 rounded-t-2xl bg-amber-100 shadow-md border border-amber-200/70 relative flex items-center justify-center overflow-hidden">
            {/* Frosting drips */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-rose-400 to-rose-300 rounded-b-xl flex justify-around px-2">
              <span className="w-3 h-4 bg-rose-300 rounded-b-full" />
              <span className="w-4 h-5 bg-rose-300 rounded-b-full" />
              <span className="w-3 h-3 bg-rose-300 rounded-b-full" />
              <span className="w-4 h-4 bg-rose-300 rounded-b-full" />
            </div>
            {/* Cherries/sprinkles */}
            <div className="absolute bottom-2 flex gap-3 text-xs">
              <span>🍓</span>
              <span>🍫</span>
              <span>🍓</span>
            </div>
          </div>

          {/* Bottom Layer */}
          <div className="w-48 h-18 rounded-t-2xl rounded-b-lg bg-amber-50 shadow-lg border border-amber-200/70 relative flex items-center justify-center overflow-hidden">
            {/* Frosting swirls */}
            <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-rose-300 to-rose-200 rounded-b-xl flex justify-around px-2">
              <span className="w-4 h-5 bg-rose-200 rounded-b-full" />
              <span className="w-5 h-6 bg-rose-200 rounded-b-full" />
              <span className="w-4 h-4 bg-rose-200 rounded-b-full" />
              <span className="w-5 h-5 bg-rose-200 rounded-b-full" />
            </div>
            <div className="mt-2 text-xs font-semibold text-rose-500 tracking-wider">
              ✦ HAPPY BIRTHDAY ✦
            </div>
          </div>

          {/* Cake Stand / Plate */}
          <div className="w-56 h-3 rounded-full bg-slate-200 shadow-xl border border-slate-300 mt-[-1px]" />
          <div className="w-24 h-4 bg-slate-300/80 rounded-b-xl" />
        </div>
      </div>

      {/* Bottom Blow Button */}
      <div className="w-full max-w-xs mb-8 z-20 flex flex-col items-center">
        {!isBlown ? (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={startMic}
            className="w-full min-h-[50px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold text-base shadow-lg shadow-rose-500/30 flex items-center justify-center gap-2 cursor-pointer active:brightness-95 transition-all"
          >
            <Wind className="w-5 h-5" />
            <span>{micActive ? "Listening... Blow into mic!" : "Blow into the mic 💨"}</span>
          </motion.button>
        ) : (
          <div className="text-center text-xs text-amber-200/90 font-medium animate-pulse">
            Wish in progress... ✨
          </div>
        )}

        {!isBlown && (
          <button
            onClick={extinguishCandle}
            className="text-[11px] text-[var(--theme-text-muted)] underline underline-offset-4 mt-2.5 hover:text-slate-700"
          >
            Or tap candle to blow out
          </button>
        )}
      </div>
    </div>
  );
};
