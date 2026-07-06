"use client";

class SynthController {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
  }

  playCopy() {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1046.50, now); // C6
    osc.frequency.exponentialRampToValueAtTime(2093.00, now + 0.08); // C7

    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  playSuccess() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    // Harmonic notes: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, index) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + index * 0.035); // Arpeggiated entry

      gain.gain.setValueAtTime(0.03, now + index * 0.035);
      gain.gain.exponentialRampToValueAtTime(0.0005, now + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + index * 0.035);
      osc.stop(now + 0.4);
    });
  }

  playTick() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2500, now);

    gain.gain.setValueAtTime(0.008, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.012);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.012);
  }
}

export const synth = new SynthController();
