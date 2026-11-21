"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CardConfig } from "@/lib/schema";
import { StartScreen } from "./scenes/StartScreen";
import { BalloonGame } from "./scenes/BalloonGame";
import { BlowCandle } from "./scenes/BlowCandle";
import { BouquetScene } from "./scenes/BouquetScene";
import { PhotoStack } from "./scenes/PhotoStack";
import { Letter } from "./scenes/Letter";
import { GiftBoxScene } from "./scenes/GiftBoxScene";
import { HeartCatchGame } from "./scenes/HeartCatchGame";
import { Finale } from "./scenes/Finale";
import { MusicToggle } from "./ui/MusicToggle";
import { ChevronLeft } from "lucide-react";

interface SceneRunnerProps {
  card: CardConfig;
}

export const SceneRunner: React.FC<SceneRunnerProps> = ({ card }) => {
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [audioTriggered, setAudioTriggered] = useState(false);

  const scenes =
    card.scenes && card.scenes.length > 0
      ? card.scenes
      : [
          "start",
          "balloons",
          "candle",
          "heartCatch",
          "bouquet",
          "photoStack",
          "letter",
          "gift",
          "finale",
        ];

  const currentSceneName = scenes[currentSceneIndex] || "start";
  const totalScenes = scenes.length;

  const handleNext = () => {
    if (currentSceneIndex === 0) {
      setAudioTriggered(true);
    }
    if (currentSceneIndex < totalScenes - 1) {
      setCurrentSceneIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSceneIndex > 0) {
      setCurrentSceneIndex((prev) => prev - 1);
    }
  };

  const handleReplay = () => {
    setCurrentSceneIndex(1); // Restart from first interactive scene
  };

  const renderSceneContent = () => {
    switch (currentSceneName) {
      case "start":
        return <StartScreen card={card} onComplete={handleNext} />;
      case "balloons":
        return (
          <BalloonGame
            theme={card.theme}
            recipientName={card.recipientName}
            onComplete={handleNext}
          />
        );
      case "candle":
        return (
          <BlowCandle
            recipientName={card.recipientName}
            onComplete={handleNext}
          />
        );
      case "bouquet":
        return (
          <BouquetScene
            recipientName={card.recipientName}
            onComplete={handleNext}
          />
        );
      case "photoStack":
        return <PhotoStack photos={card.photos} onComplete={handleNext} />;
      case "heartCatch":
      case "heartCatchGame":
        return <HeartCatchGame onComplete={handleNext} />;
      case "letter":
        return (
          <Letter
            senderName={card.senderName}
            recipientName={card.recipientName}
            letterText={card.letter}
            onComplete={handleNext}
          />
        );
      case "gift":
        return <GiftBoxScene onComplete={handleNext} />;
      case "finale":
        return <Finale card={card} onReplay={handleReplay} />;
      default:
        return <Finale card={card} onReplay={handleReplay} />;
    }
  };

  return (
    <div className="relative w-full h-[100dvh] max-w-[430px] mx-auto overflow-hidden flex flex-col justify-between bg-[var(--theme-card-bg)] shadow-2xl rounded-none sm:rounded-[36px]">
      {/* Background Gradient */}
      <div
        className="absolute inset-0 pointer-events-none -z-10"
        style={{ background: "var(--theme-gradient)" }}
      />

      {/* Top Header Bar: Back Button, Progress Dots & Music Toggle */}
      <div className="relative z-30 pt-4 px-5 flex items-center justify-between">
        {/* Back Button */}
        {currentSceneIndex > 0 ? (
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 text-xs font-semibold text-slate-700 bg-white/70 hover:bg-white px-2.5 py-1.5 rounded-full border border-black/5 shadow-sm backdrop-blur-md active:scale-95 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </button>
        ) : (
          <div className="w-14" />
        )}

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 py-1 px-3 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm">
          {scenes.map((scene, idx) => (
            <div
              key={scene + idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentSceneIndex
                  ? "w-4 bg-[var(--theme-accent)]"
                  : idx < currentSceneIndex
                  ? "w-1.5 bg-[var(--theme-accent)]/50"
                  : "w-1.5 bg-slate-300/60"
              }`}
            />
          ))}
        </div>

        {/* Music Player Control */}
        <MusicToggle musicUrl={card.music} autoPlayTriggered={audioTriggered} />
      </div>

      {/* Main Animated Scene Container */}
      <div className="relative flex-1 w-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSceneName + currentSceneIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="w-full h-full"
          >
            {renderSceneContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
