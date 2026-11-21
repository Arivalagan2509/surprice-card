"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { PhotoItem } from "@/lib/schema";
import { Button } from "../ui/Button";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface PhotoStackProps {
  photos: PhotoItem[];
  onComplete: () => void;
}

export const PhotoStack: React.FC<PhotoStackProps> = ({ photos, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const fallbackPhotos: PhotoItem[] = [
    {
      url: "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      caption: "A golden memory together ✨",
    },
  ];

  const photoList = photos.length > 0 ? photos : fallbackPhotos;
  const currentPhoto = photoList[currentIndex];
  const isLast = currentIndex === photoList.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col justify-between p-6 select-none overflow-hidden">
      {/* Top Header */}
      <div className="text-center mt-6 z-10">
        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-white/80 text-[var(--theme-accent)] shadow-sm backdrop-blur-md border border-[var(--theme-accent)]/20 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Photo Memories ({currentIndex + 1} / {photoList.length})
        </span>
      </div>

      {/* Center Polaroid Card with Swipe / Animation */}
      <div className="relative my-auto flex items-center justify-center w-full px-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.9, rotate: currentIndex % 2 === 0 ? -4 : 4 }}
            animate={{ opacity: 1, scale: 1, rotate: currentIndex % 2 === 0 ? -1.5 : 1.5 }}
            exit={{ opacity: 0, scale: 0.9, x: -100 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.2}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) {
                handleNext();
              } else if (info.offset.x > 60) {
                handlePrev();
              }
            }}
            className="w-full max-w-[320px] bg-white p-3.5 pb-6 rounded-2xl shadow-2xl border border-black/5 flex flex-col items-center cursor-grab active:cursor-grabbing touch-pan-y"
          >
            {/* Photo Container */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-slate-100 shadow-inner">
              <Image
                src={currentPhoto.url}
                alt={currentPhoto.caption || "Special moment"}
                fill
                sizes="(max-width: 400px) 100vw, 320px"
                className="object-cover"
                loading="lazy"
                priority={false}
              />
            </div>

            {/* Polaroid Caption */}
            <div className="mt-4 px-2 w-full text-center min-h-[48px] flex items-center justify-center">
              <p className="font-handwriting text-xl sm:text-2xl text-slate-800 leading-snug">
                {currentPhoto.caption || "A priceless moment in time ✨"}
              </p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Controls */}
      <div className="mb-8 z-10 flex flex-col items-center gap-3">
        <div className="flex items-center justify-between w-full max-w-xs gap-3">
          <Button
            onClick={handlePrev}
            variant="secondary"
            size="md"
            disabled={currentIndex === 0}
            className="flex-1 gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Prev</span>
          </Button>

          <Button
            onClick={handleNext}
            variant="primary"
            size="md"
            className="flex-1 gap-1 shadow-lg"
          >
            <span>{isLast ? "Read Letter" : "Next"}</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-[11px] text-[var(--theme-text-muted)] font-medium">
          (Swipe left or tap Next to browse)
        </p>
      </div>
    </div>
  );
};
