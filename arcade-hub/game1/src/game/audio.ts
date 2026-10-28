/**
 * Web Audio API Retro Sound Effects & Procedural 8-bit / 16-bit Chiptune Synthesizer
 */

class RetroAudioEngine {
  private ctx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMuted: boolean = false;
  private isMusicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private currentStep: number = 0;
  private theme: 'day' | 'cavern' | 'castle' = 'day';

  constructor() {
    // We defer AudioContext creation until user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.isMuted ? 0 : 0.8;
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.7;
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.22;
      this.musicGain.connect(this.masterGain);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public unlock() {
    this.initContext();
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Retro Sound Effects ---

  public playJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(600, t + 0.15);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);
  }

  public playDoubleJump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(950, t + 0.18);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playSpinAttack() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Swoosh tone
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(750, t + 0.12);
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.15);

    // Filtered noise for whip sound
    this.playNoise(0.12, 1200, 0.2);
  }

  public playDash() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(700, t);
    osc.frequency.exponentialRampToValueAtTime(180, t + 0.14);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  public playCoin() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Two-tone bright chime (B5 -> E6)
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'square';

    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc1.frequency.setValueAtTime(1318.51, t + 0.08); // E6

    osc2.frequency.setValueAtTime(987.77, t);
    osc2.frequency.setValueAtTime(1318.51, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.setValueAtTime(0.35, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.36);
    osc2.stop(t + 0.36);
  }

  public playStomp() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.16);

    // Little pop
    const pop = this.ctx.createOscillator();
    const popGain = this.ctx.createGain();
    pop.type = 'sine';
    pop.frequency.setValueAtTime(600, t);
    pop.frequency.exponentialRampToValueAtTime(900, t + 0.08);
    popGain.gain.setValueAtTime(0.3, t);
    popGain.gain.exponentialRampToValueAtTime(0.01, t + 0.09);
    pop.connect(popGain);
    popGain.connect(this.sfxGain);
    pop.start(t);
    pop.stop(t + 0.09);
  }

  public playBlockBump() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.linearRampToValueAtTime(240, t + 0.05);
    osc.frequency.linearRampToValueAtTime(80, t + 0.12);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playBlockBreak() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    this.playNoise(0.2, 800, 0.45);

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.18);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.19);
  }

  public playPowerup() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [330, 392, 659, 523, 587, 784]; // E4, G4, E5, C5, D5, G5
    notes.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + i * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.1);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.11);
    });
  }

  public playFireball() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.12);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.13);
  }

  public playSpring() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.16);
    osc.frequency.exponentialRampToValueAtTime(550, t + 0.28);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.29);
  }

  public playHurt() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.25);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.26);

    this.playNoise(0.18, 400, 0.4);
  }

  public playCheckpoint() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.35, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.26);
    });
  }

  public playStageClear() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    // Victory fanfare notes (G4, C5, E5, G5, C6)
    const melody = [
      { f: 392.0, d: 0.12, w: 0 },
      { f: 523.25, d: 0.12, w: 0.12 },
      { f: 659.25, d: 0.12, w: 0.24 },
      { f: 783.99, d: 0.24, w: 0.36 },
      { f: 659.25, d: 0.12, w: 0.62 },
      { f: 1046.5, d: 0.6, w: 0.74 },
    ];

    melody.forEach((item) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + item.w;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, st);

      gain.gain.setValueAtTime(0.4, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + item.d + 0.01);
    });
  }

  public playGameOver() {
    this.initContext();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const melody = [
      { f: 330.0, d: 0.2, w: 0 },
      { f: 311.13, d: 0.2, w: 0.2 },
      { f: 293.66, d: 0.2, w: 0.4 },
      { f: 220.0, d: 0.5, w: 0.65 },
    ];

    melody.forEach((item) => {
      if (!this.ctx || !this.sfxGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + item.w;

      osc.type = 'square';
      osc.frequency.setValueAtTime(item.f, st);

      gain.gain.setValueAtTime(0.35, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + item.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + item.d + 0.01);
    });
  }

  private playNoise(duration: number, cutoff: number, volume: number) {
    if (!this.ctx || !this.sfxGain || this.isMuted) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = cutoff;

    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // --- Procedural 8-Bit BGM Synthesizer ---

  public startMusic(theme: 'day' | 'cavern' | 'castle' = 'day') {
    this.theme = theme;
    if (this.isMusicPlaying) return;
    this.initContext();
    this.isMusicPlaying = true;
    this.currentStep = 0;

    // 16-step retro pattern sequencer running at ~130 BPM (115ms per sixteenth note)
    const stepDuration = 120;
    this.musicInterval = window.setInterval(() => {
      if (!this.isMusicPlaying || this.isMuted) return;
      this.playSequencerStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 32;
    }, stepDuration);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public setMusicTheme(theme: 'day' | 'cavern' | 'castle') {
    this.theme = theme;
  }

  private playSequencerStep(step: number) {
    if (!this.ctx || !this.musicGain || this.isMuted) return;
    const t = this.ctx.currentTime;

    // Day Theme: Upbeat major adventure tune
    // Cavern Theme: Mysterious minor mode with echo
    // Castle Theme: Dramatic urgent tempo
    let leadNote: number | null = null;
    let bassNote: number | null = null;
    let isHiHat = false;
    let isKick = false;

    if (this.theme === 'day') {
      // 32-step upbeat melody
      const dayMelody = [
        392, 0, 440, 523, 0, 659, 587, 523,
        440, 0, 392, 440, 523, 0, 659, 0,
        784, 0, 659, 587, 523, 0, 440, 392,
        440, 523, 587, 659, 784, 0, 0, 0
      ];
      const dayBass = [
        130, 0, 130, 0, 164, 0, 164, 0,
        174, 0, 174, 0, 196, 0, 196, 0,
        130, 0, 130, 0, 164, 0, 164, 0,
        174, 0, 174, 0, 196, 196, 220, 0
      ];
      leadNote = dayMelody[step];
      bassNote = dayBass[step];
      isKick = step % 8 === 0 || step % 8 === 6;
      isHiHat = step % 2 === 0;
    } else if (this.theme === 'cavern') {
      const cavernMelody = [
        330, 0, 392, 0, 440, 0, 493, 0,
        523, 493, 440, 392, 330, 0, 0, 0,
        293, 0, 349, 0, 392, 0, 440, 0,
        493, 440, 392, 349, 330, 0, 0, 0
      ];
      const cavernBass = [
        110, 0, 0, 110, 110, 0, 0, 110,
        123, 0, 0, 123, 130, 0, 0, 130,
        98, 0, 0, 98, 98, 0, 0, 98,
        110, 0, 0, 110, 110, 0, 123, 0
      ];
      leadNote = cavernMelody[step];
      bassNote = cavernBass[step];
      isKick = step % 8 === 0;
      isHiHat = step % 4 === 2;
    } else {
      // Castle
      const castleMelody = [
        220, 220, 330, 0, 293, 293, 440, 0,
        415, 0, 392, 0, 370, 0, 330, 0,
        220, 220, 330, 0, 293, 293, 440, 0,
        493, 0, 523, 0, 587, 0, 659, 0
      ];
      const castleBass = [
        110, 110, 0, 110, 146, 146, 0, 146,
        138, 0, 130, 0, 123, 0, 110, 0,
        110, 110, 0, 110, 146, 146, 0, 146,
        164, 0, 174, 0, 196, 0, 220, 0
      ];
      leadNote = castleMelody[step];
      bassNote = castleBass[step];
      isKick = step % 4 === 0;
      isHiHat = step % 2 === 1;
    }

    // Play Lead synth
    if (leadNote && leadNote > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(leadNote, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.11);
    }

    // Play Bass synth
    if (bassNote && bassNote > 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(bassNote, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.14);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.15);
    }

    // Play Drum Kick
    if (isKick) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(120, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.08);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.08);

      osc.connect(gain);
      gain.connect(this.musicGain);

      osc.start(t);
      osc.stop(t + 0.09);
    }

    // Play Drum Hi-Hat
    if (isHiHat) {
      this.playNoise(0.03, 7000, 0.06);
    }
  }
}

export const audio = new RetroAudioEngine();
