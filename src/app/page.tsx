"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Sparkles, Heart, Gift, Play, ArrowRight, ShieldCheck, Image as ImageIcon, Music } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] bg-gradient-to-br from-rose-50 via-pink-50 to-indigo-50 text-slate-800 flex flex-col justify-between selection:bg-pink-200">
      {/* Navigation */}
      <header className="w-full max-w-4xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center text-white shadow-md shadow-pink-500/20">
            <Gift className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            SurpriseCard
          </span>
        </div>

        <Link href="/c/demo">
          <button className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-pink-600 bg-white shadow-sm border border-pink-100 hover:bg-pink-50 active:scale-95 transition-all">
            View Live Demo
          </button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-xl mx-auto px-6 py-8 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-pink-200 text-pink-600 text-xs font-semibold shadow-sm mb-6 backdrop-blur-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Interactive Scene-by-Scene Digital Cards</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]"
        >
          Turn your feelings into an{" "}
          <span className="bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent">
            animated experience
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mt-4 text-slate-600 text-base sm:text-lg leading-relaxed max-w-md"
        >
          Send someone a private link that unwraps interactive games, floating balloons, polaroid photos, and handwriting letters on their phone.
        </motion.p>

        {/* Call to Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full max-w-xs"
        >
          <Link href="/c/demo" className="w-full">
            <button className="w-full min-h-[50px] px-6 py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-base shadow-lg shadow-pink-500/25 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <Play className="w-4 h-4 fill-white" />
              <span>Play Demo Card</span>
            </button>
          </Link>

          <Link href="/create" className="w-full">
            <button className="w-full min-h-[50px] px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base border border-slate-200 shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer">
              <span>Create Card</span>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </button>
          </Link>
        </motion.div>

        {/* Feature Pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mt-12 w-full text-left"
        >
          <div className="p-3.5 rounded-2xl bg-white/70 border border-pink-100 shadow-sm backdrop-blur-sm flex items-start gap-2.5">
            <span className="text-xl">🎈</span>
            <div>
              <h2 className="text-xs font-bold text-slate-800">Mini Games</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Pop balloons to unwrap the surprise</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-pink-100 shadow-sm backdrop-blur-sm flex items-start gap-2.5">
            <ImageIcon className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-slate-800">Polaroid Stack</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Swipeable photo cards with handwritten captions</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-pink-100 shadow-sm backdrop-blur-sm flex items-start gap-2.5">
            <span className="text-xl">✍️</span>
            <div>
              <h2 className="text-xs font-bold text-slate-800">Handwriting Letter</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Real typewriter reveal on parchment paper</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-pink-100 shadow-sm backdrop-blur-sm flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xs font-bold text-slate-800">Passcode Protected</h2>
              <p className="text-[11px] text-slate-500 mt-0.5">Keep intimate memories locked and secure</p>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-xs text-slate-400 flex flex-col items-center gap-2">
        <p>Crafted with ❤️ for birthdays, anniversaries, apologies, and true friendships.</p>
        <div className="flex gap-4 text-slate-500 font-medium">
          <Link href="/privacy" className="hover:text-pink-600 transition">
            Privacy Policy
          </Link>
          <span>•</span>
          <Link href="/terms" className="hover:text-pink-600 transition">
            Terms of Service
          </Link>
        </div>
      </footer>
    </div>
  );
}
