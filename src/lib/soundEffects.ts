"use client";

// Web Audio API Sound Effects Engine - Original, synthesized sound design
class SoundEffectsEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx || this.ctx.state === "closed") {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Pop sound for balloons
  playPop() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(450, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  // Candle blow whoosh
  playBlow() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      // Noise buffer for gentle wind/breath
      const bufferSize = ctx.sampleRate * 0.4;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(400, ctx.currentTime);
      filter.frequency.linearRampToValueAtTime(150, ctx.currentTime + 0.35);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.01, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      noise.start();
    } catch {}
  }

  // Chime / wish sparkle
  playSparkle() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.06);

        gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.06 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + i * 0.06 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + i * 0.06);
        osc.stop(ctx.currentTime + i * 0.06 + 0.45);
      });
    } catch {}
  }

  // Envelope paper slide / unfold sound
  playEnvelopeOpen() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(320, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(580, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } catch {}
  }

  // Gift box unwrap fanfare
  playFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const chords = [
        [392.00, 493.88, 587.33], // G major
        [440.00, 554.37, 659.25], // A major
        [523.25, 659.25, 783.99, 1046.5], // C major arpeggio
      ];

      chords.forEach((chord, step) => {
        chord.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, ctx.currentTime + step * 0.14);

          gain.gain.setValueAtTime(0.001, ctx.currentTime + step * 0.14);
          gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + step * 0.14 + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + step * 0.14 + 0.5);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + step * 0.14);
          osc.stop(ctx.currentTime + step * 0.14 + 0.55);
        });
      });
    } catch {}
  }
}

export const sounds = new SoundEffectsEngine();
