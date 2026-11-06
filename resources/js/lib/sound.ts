/**
 * Sound synthesizer menggunakan Web Audio API
 * Berjalan offline tanpa dependensi audio file eksternal
 */

class SoundEffects {
  private ctx: AudioContext | null = null;
  private isEnabled = true;

  constructor() {
    // AudioContext akan diinisialisasi saat interaksi pertama pengguna
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  /**
   * Bunyi tick saat segmen wheel berputar melewati pointer
   */
  public playTick(frequencyMultiplier = 1) {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(580 * frequencyMultiplier, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);

      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Ignore audio context errors
    }
  }

  /**
   * Bunyi lampu start balap (merah, kuning, hijau)
   */
  public playLightBeep(isGo = false) {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      const freq = isGo ? 920 : 440;
      const duration = isGo ? 0.35 : 0.15;

      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore audio error
    }
  }

  /**
   * Bunyi deru mobil balap saat spin dimulai
   */
  public playEngineRev() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(260, this.ctx.currentTime + 0.4);
      osc.frequency.exponentialRampToValueAtTime(140, this.ctx.currentTime + 0.9);

      gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.9);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.9);
    } catch {
      // Ignore
    }
  }

  /**
   * Fanfare ceria SpongeBob saat pemenang/tim finish didapat
   */
  public playFanfare() {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      // Akord C major ceria (C5, E5, G5, C6)
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, index) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startTime = this.ctx.currentTime + index * 0.1;
        const duration = index === notes.length - 1 ? 0.6 : 0.2;

        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.2, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + duration);
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Bunyi 'pop / ting' ceria saat nama peserta masuk ke slot tim
   * Menggunakan nada ceria naik bertingkat agar terdengar dinamis dan seru
   */
  public playSlotPop(index = 0) {
    if (!this.isEnabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Tangga nada ceria (Pentatonic Major C5-C6)
      const scale = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];
      const freq = scale[index % scale.length];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      // Sedikit pitch sweep ke atas untuk efek 'pop' kartun yang renyah
      osc.frequency.exponentialRampToValueAtTime(freq * 1.18, now + 0.07);

      gain.gain.setValueAtTime(0.26, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.11);
    } catch {
      // Ignore
    }
  }
}

export const sound = new SoundEffects();
