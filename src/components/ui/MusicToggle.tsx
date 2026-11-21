"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX } from "lucide-react";

interface MusicToggleProps {
  musicUrl?: string | null;
  autoPlayTriggered: boolean;
}

export const MusicToggle: React.FC<MusicToggleProps> = ({ musicUrl, autoPlayTriggered }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const loopTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /**
   * Two-layered birthday soundtrack:
   *  - Layer A: Soft "Happy Birthday" tune at low volume (subtle, behind SFX)
   *  - Layer B: Warm chord pad / music-box accompaniment
   */
  const playBirthdayMelody = useCallback(() => {
    if (audioCtxRef.current) return;
    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtxClass();
      audioCtxRef.current = ctx;

      // Master gain (subtle — stays behind SFX)
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.18, ctx.currentTime);
      master.connect(ctx.destination);

      // ----- Happy Birthday melody (classic tune, C major) -----
      // Frequencies for: C4 C4 D4 C4 F4 E4 | C4 C4 D4 C4 G4 F4 | C4 C4 C5 A4 F4 E4 D4 | B♭4 B♭4 A4 F4 G4 F4
      const hbNotes = [
        // "Happy birth-day to you"
        261.63, 261.63, 293.66, 261.63, 349.23, 329.63,
        // "Happy birth-day to you"
        261.63, 261.63, 293.66, 261.63, 392.00, 349.23,
        // "Happy birth-day dear [name]"
        261.63, 261.63, 523.25, 440.00, 349.23, 329.63, 293.66,
        // "Happy birth-day to youuu"
        466.16, 466.16, 440.00, 349.23, 392.00, 349.23,
      ];
      // Durations in seconds (quarter = 0.42s, eighth = 0.21s, dotted = 0.63s)
      const hbDurs = [
        0.21, 0.21, 0.42, 0.42, 0.42, 0.84,
        0.21, 0.21, 0.42, 0.42, 0.42, 0.84,
        0.21, 0.21, 0.42, 0.42, 0.42, 0.42, 0.84,
        0.21, 0.21, 0.42, 0.42, 0.42, 0.84,
      ];

      const melodyGain = ctx.createGain();
      melodyGain.gain.setValueAtTime(0.6, ctx.currentTime);
      melodyGain.connect(master);

      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.3, ctx.currentTime);
      padGain.connect(master);

      // Schedule one full pass of Happy Birthday then loop
      const scheduleMelody = (startTime: number) => {
        let t = startTime;
        hbNotes.forEach((freq, i) => {
          if (!audioCtxRef.current) return;

          // Melody (music-box bell)
          const osc = ctx.createOscillator();
          const g = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t);

          g.gain.setValueAtTime(0.001, t);
          g.gain.linearRampToValueAtTime(0.9, t + 0.03);
          g.gain.exponentialRampToValueAtTime(0.0001, t + hbDurs[i] * 0.9);

          osc.connect(g);
          g.connect(melodyGain);
          osc.start(t);
          osc.stop(t + hbDurs[i]);

          // Warm overtone layer (slightly detuned sine for warmth)
          const osc2 = ctx.createOscillator();
          const g2 = ctx.createGain();
          osc2.type = "sine";
          osc2.frequency.setValueAtTime(freq * 2, t); // octave up
          osc2.detune.setValueAtTime(8, t);

          g2.gain.setValueAtTime(0, t);
          g2.gain.linearRampToValueAtTime(0.3, t + 0.04);
          g2.gain.exponentialRampToValueAtTime(0.001, t + hbDurs[i] * 0.6);

          osc2.connect(g2);
          g2.connect(melodyGain);
          osc2.start(t);
          osc2.stop(t + hbDurs[i] * 0.65);

          t += hbDurs[i];
        });
        return t; // return total duration
      };

      // Chord pad chords: C-G-Am-F under Happy Birthday
      const padChords = [
        [261.63, 329.63, 392.00],  // C major
        [246.94, 293.66, 392.00],  // G major (open)
        [220.00, 261.63, 329.63],  // A minor
        [174.61, 261.63, 349.23],  // F major
      ];

      const schedulePads = (startTime: number, totalDuration: number) => {
        const beatLen = totalDuration / 8;
        padChords.forEach((chord, ci) => {
          chord.forEach((freq) => {
            if (!audioCtxRef.current) return;
            const osc = ctx.createOscillator();
            const g = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(freq * 0.5, startTime + ci * beatLen * 2); // bass octave

            g.gain.setValueAtTime(0, startTime + ci * beatLen * 2);
            g.gain.linearRampToValueAtTime(0.4, startTime + ci * beatLen * 2 + 0.1);
            g.gain.exponentialRampToValueAtTime(0.001, startTime + ci * beatLen * 2 + beatLen * 1.9);

            osc.connect(g);
            g.connect(padGain);
            osc.start(startTime + ci * beatLen * 2);
            osc.stop(startTime + ci * beatLen * 2 + beatLen * 2);
          });
        });
      };

      // Initial play + schedule looping via timeout
      const totalDur = hbDurs.reduce((a, b) => a + b, 0);
      const loopDelay = (totalDur + 1.5) * 1000; // 1.5s pause between loops

      const play = (startDelay = 0) => {
        if (!audioCtxRef.current) return;
        const t0 = ctx.currentTime + startDelay;
        scheduleMelody(t0);
        schedulePads(t0, totalDur);
        loopTimeoutRef.current = setTimeout(() => play(), loopDelay);
      };

      play(0.3); // 300ms initial delay for smooth start
    } catch {
      // Web Audio not available
    }
  }, []);

  const stopMelody = useCallback(() => {
    if (loopTimeoutRef.current) {
      clearTimeout(loopTimeoutRef.current);
      loopTimeoutRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
  }, []);

  const startAudio = useCallback(() => {
    if (musicUrl && audioRef.current) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          playBirthdayMelody();
          setIsPlaying(true);
        });
    } else {
      playBirthdayMelody();
      setIsPlaying(true);
    }
  }, [musicUrl, playBirthdayMelody]);

  const stopAudio = useCallback(() => {
    if (audioRef.current) audioRef.current.pause();
    stopMelody();
    setIsPlaying(false);
  }, [stopMelody]);

  useEffect(() => {
    if (autoPlayTriggered && !isPlaying) startAudio();
  }, [autoPlayTriggered, isPlaying, startAudio]);

  useEffect(() => () => stopAudio(), [stopAudio]);

  return (
    <div className="fixed top-4 right-4 z-50">
      {musicUrl && <audio ref={audioRef} src={musicUrl} loop preload="auto" />}
      <button
        onClick={() => (isPlaying ? stopAudio() : startAudio())}
        aria-label={isPlaying ? "Mute birthday music" : "Play birthday music"}
        className="w-11 h-11 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full bg-white/90 hover:bg-white border border-rose-200/60 shadow-lg backdrop-blur-md transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-rose-400 cursor-pointer"
      >
        {isPlaying ? (
          <div className="relative flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-rose-500" />
            <span className="absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
            </span>
          </div>
        ) : (
          <VolumeX className="w-5 h-5 text-slate-400" />
        )}
      </button>
    </div>
  );
};
