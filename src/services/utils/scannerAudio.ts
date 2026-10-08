/**
 * TransitPulse Scanner Audio Chime Service
 * Provides crisp audio feedback for turnstile ticket scans
 * Uses Web Audio API without requiring external sound file assets.
 */

class ScannerAudioService {
  private isMutedState: boolean = false;
  private audioCtx: any = null;

  public setMuted(muted: boolean): void {
    this.isMutedState = muted;
  }

  public isMuted(): boolean {
    return this.isMutedState;
  }

  public toggleMute(): boolean {
    this.isMutedState = !this.isMutedState;
    if (!this.isMutedState) {
      this.playBeep(600, 0.05);
    }
    return this.isMutedState;
  }

  private getContext(): any {
    if (this.isMutedState) return null;
    try {
      if (typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          if (!this.audioCtx) {
            this.audioCtx = new AudioCtx();
          }
          if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume().catch(() => {});
          }
          return this.audioCtx;
        }
      }
    } catch {
      // AudioContext unavailable in current runtime
    }
    return null;
  }

  public playSuccessTone(): void {
    if (this.isMutedState) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // High pleasant two-tone gate chime (880Hz -> 1320Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(880, now);
      osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.08);

      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.18);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.18);
    } catch {
      // Ignored
    }
  }

  public playRejectTone(): void {
    if (this.isMutedState) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Low dual warning buzz (220Hz -> 180Hz)
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.setValueAtTime(180, now + 0.12);

      gain.gain.setValueAtTime(0.28, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {
      // Ignored
    }
  }

  public playBeep(freq: number = 800, duration: number = 0.06): void {
    if (this.isMutedState) return;
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch {
      // Ignored
    }
  }
}

export const scannerAudio = new ScannerAudioService();
