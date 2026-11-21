"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/Button";
import { sounds } from "@/lib/soundEffects";

interface BouquetSceneProps {
  recipientName: string;
  onComplete: () => void;
}

const notes = [
  { text: "Forever yours 💙", angle: -48, radius: 148 },
  { text: "You make my world beautiful ✨", angle: -18, radius: 155 },
  { text: "You are my sunshine ☀️", angle: 18, radius: 148 },
  { text: "So lucky to have you 🍀", angle: 48, radius: 155 },
];

export const BouquetScene: React.FC<BouquetSceneProps> = ({ recipientName, onComplete }) => {
  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-5 select-none overflow-hidden">

      {/* Vibrant background petals floating */}
      {["🌸", "🌺", "🌼", "🌹", "💐", "🌸", "🌷", "🌼"].map((e, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl opacity-25 pointer-events-none"
          style={{ left: `${5 + i * 12}%`, top: `${8 + (i % 3) * 20}%` }}
          animate={{ y: [0, -10, 0], rotate: [0, 20, 0] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.3, ease: "easeInOut", delay: i * 0.2 }}
        >
          {e}
        </motion.span>
      ))}

      {/* Top Header */}
      <div className="text-center mt-5 z-20">
        <h2 className="text-2xl font-black tracking-tight flex items-center justify-center gap-2"
          style={{ background: "linear-gradient(135deg,#f43f5e,#ec4899,#a855f7)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Your Bouquet, {recipientName} 💐
        </h2>
        <p className="text-xs font-semibold text-rose-400 mt-1">
          A bloom of love picked just for you 🌹
        </p>
      </div>

      {/* HUGE Bouquet image (Unsplash royalty-free) + floating notes */}
      <div className="relative my-auto flex items-center justify-center w-full">

        {/* Floating love notes arranged in arc around bouquet */}
        {notes.map((note, i) => {
          const rad = (note.angle * Math.PI) / 180;
          const x = Math.sin(rad) * note.radius;
          const y = -Math.abs(Math.cos(rad)) * 55 + 10;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.4, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.18, duration: 0.5, type: "spring" }}
              style={{ position: "absolute", transform: `translate(${x}px, ${y}px)` }}
              className="z-30 pointer-events-none"
            >
              <div
                className="px-2.5 py-1.5 rounded-2xl text-[11px] font-bold text-slate-700 shadow-lg border border-rose-200/80 backdrop-blur-sm text-center leading-tight max-w-[115px]"
                style={{ background: "rgba(255,255,255,0.92)" }}
              >
                {note.text}
              </div>
            </motion.div>
          );
        })}

        {/* The HUGE Bouquet */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, -8, 0] }}
          transition={{
            scale: { duration: 0.7, type: "spring", stiffness: 160 },
            y: { repeat: Infinity, duration: 3.5, ease: "easeInOut" },
          }}
          className="relative z-20 flex flex-col items-center"
        >
          {/* Large emoji bouquet arrangement */}
          <div className="relative">
            {/* Top tier — big spread of flowers */}
            <div className="flex items-end justify-center gap-0.5">
              <span className="text-4xl -rotate-[25deg] mb-1">🌹</span>
              <span className="text-5xl -rotate-[12deg] mb-3">🌷</span>
              <span className="text-6xl mb-6 drop-shadow-xl">🌹</span>
              <span className="text-5xl rotate-[12deg] mb-3">🌸</span>
              <span className="text-4xl rotate-[25deg] mb-1">🌺</span>
            </div>
            {/* Second tier */}
            <div className="flex items-end justify-center gap-0.5 -mt-3">
              <span className="text-3xl -rotate-[30deg] mb-2">🌼</span>
              <span className="text-5xl -rotate-[15deg] mb-4 drop-shadow-lg">🌹</span>
              <span className="text-4xl mb-2 drop-shadow-md">💐</span>
              <span className="text-5xl rotate-[15deg] mb-4 drop-shadow-lg">🌷</span>
              <span className="text-3xl rotate-[30deg] mb-2">🌸</span>
            </div>
            {/* Third tier — greenery */}
            <div className="flex items-end justify-center gap-1 -mt-4">
              <span className="text-3xl -rotate-[35deg]">🍃</span>
              <span className="text-4xl -rotate-[18deg]">🌿</span>
              <span className="text-3xl">🌱</span>
              <span className="text-4xl rotate-[18deg]">🌿</span>
              <span className="text-3xl rotate-[35deg]">🍃</span>
            </div>
            {/* Kraft paper wrap */}
            <div className="flex justify-center mt-[-8px]">
              <div
                className="w-28 h-20 rounded-b-3xl flex flex-col items-center justify-center shadow-xl border border-stone-300/70 relative overflow-hidden"
                style={{ background: "linear-gradient(180deg, #f7ede2 0%, #e8d5c4 100%)" }}
              >
                {/* Wrapping lines texture */}
                <div className="absolute inset-0 opacity-10 pointer-events-none"
                  style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 8px)" }} />
                <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest z-10">
                  With Love 💕
                </span>
                <span className="text-xs z-10 mt-0.5 font-bold text-stone-500">
                  for {recipientName}
                </span>
              </div>
            </div>
            {/* Big satin bow */}
            <div className="flex justify-center mt-[-12px] z-20 relative">
              <span className="text-5xl filter drop-shadow-lg">🎀</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Birthday celebratory line */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="flex items-center justify-center gap-1.5 mb-4 px-4 z-20"
      >
        {["🦚", "🧸", "🎂", "🧸", "🦚"].map((e, i) => (
          <motion.span
            key={i}
            className="text-2xl"
            animate={{ y: [0, -5, 0] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.15 }}
          >
            {e}
          </motion.span>
        ))}
      </motion.div>

      {/* Bottom Button */}
      <div className="w-full max-w-xs mb-6 z-20">
        <Button
          onClick={() => { sounds.playSparkle(); onComplete(); }}
          variant="primary"
          size="lg"
          className="w-full gap-2 shadow-xl font-black bg-gradient-to-r from-rose-500 via-pink-500 to-purple-500"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
