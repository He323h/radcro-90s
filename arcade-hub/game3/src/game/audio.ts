/**
 * Blastar Reborn - Web Audio API Sound Synthesizer
 * 100% procedural sound effects & chiptune synthesizer without external assets
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private bgmPlaying: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on user interaction to comply with browser policy
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.isMuted ? 0 : 0.6;
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.6, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playLaser(weaponLevel: number = 1) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = weaponLevel >= 3 ? 'sawtooth' : 'square';
    // Frequency sweep down
    const startFreq = 880 + weaponLevel * 120;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playEnemyLaser() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playExplosion(size: 'small' | 'medium' | 'large' = 'medium') {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const duration = size === 'large' ? 0.6 : size === 'medium' ? 0.4 : 0.25;
    const t = this.ctx.currentTime;

    // Procedural white noise buffer
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(size === 'large' ? 800 : 1200, t);
    filter.frequency.exponentialRampToValueAtTime(40, t + duration);

    const gain = this.ctx.createGain();
    const vol = size === 'large' ? 0.45 : size === 'medium' ? 0.3 : 0.2;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);

    // Deep sub bass impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(size === 'large' ? 140 : 110, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + duration);

    subGain.gain.setValueAtTime(0.35, t);
    subGain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain);

    subOsc.start(t);
    subOsc.stop(t + duration);
  }

  public playPowerup() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const t = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + idx * 0.06;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.2, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.15);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.16);
    });
  }

  public playShieldRestore() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(330, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.25);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.26);
  }

  public playPlayerHit() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(t);
    osc.stop(t + 0.21);
  }

  public playStageAnnounce() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440, 554.37, 659.25, 880];
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + i * 0.1;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.22);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.23);
    });
  }

  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [440, 415.3, 392, 349.23, 293.66];
    const t = this.ctx.currentTime;

    notes.forEach((freq, i) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const startTime = t + i * 0.16;

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, startTime);

      gain.gain.setValueAtTime(0.25, startTime);
      gain.gain.exponentialRampToValueAtTime(0.01, startTime + 0.28);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(startTime);
      osc.stop(startTime + 0.3);
    });
  }

  public startBgm() {
    if (this.bgmPlaying) return;
    this.initContext();
    this.bgmPlaying = true;
    this.bgmStep = 0;

    // 16-step retro 80s arcade chiptune pattern
    const bassline = [
      110, 110, 130.81, 110,
      146.83, 110, 130.81, 164.81,
      110, 110, 130.81, 110,
      196.0, 164.81, 146.83, 130.81
    ];

    const leadMelody = [
      440, 0, 523.25, 0,
      659.25, 587.33, 523.25, 0,
      440, 0, 783.99, 659.25,
      587.33, 523.25, 440, 493.88
    ];

    const stepInterval = 135; // ~111 BPM 16th notes

    const tick = () => {
      if (!this.bgmPlaying) return;
      if (!this.isMuted && this.ctx && this.masterGain) {
        const t = this.ctx.currentTime;

        // Bass voice
        const bassFreq = bassline[this.bgmStep % bassline.length];
        if (bassFreq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(bassFreq, t);
          gain.gain.setValueAtTime(0.12, t);
          gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
          osc.connect(gain);
          gain.connect(this.masterGain);
          osc.start(t);
          osc.stop(t + 0.13);
        }

        // Arpeggiated Lead voice
        const leadFreq = leadMelody[this.bgmStep % leadMelody.length];
        if (leadFreq > 0) {
          const leadOsc = this.ctx.createOscillator();
          const leadGain = this.ctx.createGain();
          leadOsc.type = 'square';
          leadOsc.frequency.setValueAtTime(leadFreq, t);
          leadGain.gain.setValueAtTime(0.06, t);
          leadGain.gain.exponentialRampToValueAtTime(0.005, t + 0.1);
          leadOsc.connect(leadGain);
          leadGain.connect(this.masterGain);
          leadOsc.start(t);
          leadOsc.stop(t + 0.11);
        }
      }

      this.bgmStep++;
      this.bgmTimer = window.setTimeout(tick, stepInterval);
    };

    tick();
  }

  public stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new SoundEngine();
