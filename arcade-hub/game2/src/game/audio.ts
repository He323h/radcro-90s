/**
 * Retro Arcade Web Audio API Synthesizer
 * Generates 16-bit arcade fighting game sound effects, FM synth impacts, and background music.
 */

class ArcadeAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicTimer: number | null = null;
  private step: number = 0;

  constructor() {
    // AudioContext is initialized on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.35, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // --- Sound Effects ---

  // Attack Swing / Whoosh
  public playSwing(isHeavy: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = isHeavy ? 'triangle' : 'sine';
    const startFreq = isHeavy ? 280 : 440;
    const endFreq = isHeavy ? 60 : 120;
    const duration = isHeavy ? 0.16 : 0.09;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, t);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(isHeavy ? 0.35 : 0.25, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration);
  }

  // Punch or Kick Hit Impact
  public playHit(isHeavy: boolean = false, isKick: boolean = false) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const duration = isHeavy ? 0.22 : 0.12;

    // 1. FM / Pitch Drop Body Thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = isKick ? 'triangle' : 'square';
    const baseFreq = isHeavy ? 180 : 260;
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + duration);

    oscGain.gain.setValueAtTime(isHeavy ? 0.6 : 0.4, t);
    oscGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);

    // 2. White Noise Crunch / Impact Crack
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(isHeavy ? 600 : 1200, t);
    noiseFilter.Q.setValueAtTime(1.8, t);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isHeavy ? 0.7 : 0.45, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + (isHeavy ? 0.15 : 0.08));

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);
  }

  // Guard / Block Metallic Ping
  public playBlock() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(980, t);
    osc.frequency.setValueAtTime(1420, t + 0.02);
    osc.frequency.setValueAtTime(880, t + 0.05);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  // Fireball / Projectile Cast (Hadouken energy shout)
  public playFireballLaunch() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.linearRampToValueAtTime(620, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.28);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.32);
  }

  // Fireball Impact Explosion
  public playFireballHit() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const duration = 0.35;

    // Sub rumble
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(30, t + duration);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + duration);

    // Burst noise
    const bufferSize = this.ctx.sampleRate * duration;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.exponentialRampToValueAtTime(150, t + duration);

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.65, t);
    nGain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.sfxGain);

    noise.start(t);
    noise.stop(t + duration);
  }

  // Dragon Punch / Rising Shoryuken
  public playDragonPunch() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(740, t + 0.22);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.45);

    gain.gain.setValueAtTime(0.45, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.48);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.5);
  }

  // Super Art Activation Screen Freeze Flash
  public playSuperFlash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;

    // Ascending chime
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(440, t);
    osc1.frequency.exponentialRampToValueAtTime(1760, t + 0.25);

    gain1.gain.setValueAtTime(0.5, t);
    gain1.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

    osc1.connect(gain1);
    gain1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.5);

    // Deep sub bass impact
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(130, t);
    osc2.frequency.exponentialRampToValueAtTime(32, t + 0.6);

    gain2.gain.setValueAtTime(0.8, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.65);

    osc2.connect(gain2);
    gain2.connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.7);
  }

  // Knockdown Body Slam
  public playKnockdown() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.35);

    gain.gain.setValueAtTime(0.7, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.42);
  }

  // Jump Land
  public playLand() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(95, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.08);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.09);
  }

  // Arcade Round Gong / Bell
  public playRoundGong() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || this.isMuted) return;

    const t = this.ctx.currentTime;
    const freqs = [293.66, 440, 587.33, 880];
    freqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      const decay = 1.2 + idx * 0.2;
      gain.gain.setValueAtTime(0.25 / (idx + 1), t);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + decay);

      osc.connect(gain);
      gain.connect(this.sfxGain!);
      osc.start(t);
      osc.stop(t + decay);
    });
  }

  // Announcer Voice Synthesizer
  public playAnnouncer(text: string) {
    if (this.isMuted) return;

    // Use Web Speech API if supported for authentic arcade announcement
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 0.85; // deep announcer resonance
      utterance.volume = 1.0;

      // Try selecting an English voice
      const voices = window.speechSynthesis.getVoices();
      const maleVoice = voices.find(
        (v) => v.lang.startsWith('en') && (v.name.includes('Male') || v.name.includes('David') || v.name.includes('Alex'))
      );
      if (maleVoice) utterance.voice = maleVoice;

      window.speechSynthesis.speak(utterance);
    } else {
      // Fallback synth beep for cues
      this.playRoundGong();
    }
  }

  // --- 90s Arcade BGM (Procedural Synthwave Chiptune) ---
  public startBGM() {
    if (this.musicPlaying) return;
    this.initCtx();
    this.musicPlaying = true;
    this.step = 0;

    // 135 BPM 90s arcade fighter track
    const bpm = 135;
    const stepDuration = 60 / bpm / 4; // 16th notes (~111ms)

    const bassLine = [
      65.41, 65.41, 0, 65.41, 77.78, 65.41, 87.31, 65.41,
      65.41, 65.41, 0, 65.41, 98.00, 87.31, 77.78, 73.42,
    ]; // C, Eb, F, G arcade bass groove

    const melody = [
      261.63, 0, 311.13, 0, 392.00, 349.23, 311.13, 261.63,
      0, 392.00, 523.25, 466.16, 392.00, 349.23, 311.13, 293.66,
    ];

    const playStep = () => {
      if (!this.musicPlaying || !this.ctx || !this.musicGain || this.isMuted) return;

      const t = this.ctx.currentTime;
      const stepIdx = this.step % 16;

      // 1. Kick on beats 0, 4, 8, 12
      if (stepIdx % 4 === 0) {
        const kickOsc = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kickOsc.type = 'triangle';
        kickOsc.frequency.setValueAtTime(140, t);
        kickOsc.frequency.exponentialRampToValueAtTime(40, t + 0.1);

        kickGain.gain.setValueAtTime(0.5, t);
        kickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        kickOsc.connect(kickGain);
        kickGain.connect(this.musicGain);
        kickOsc.start(t);
        kickOsc.stop(t + 0.13);
      }

      // 2. Snare on beats 4, 12
      if (stepIdx === 4 || stepIdx === 12) {
        const snareOsc = this.ctx.createOscillator();
        const snareGain = this.ctx.createGain();
        snareOsc.type = 'square';
        snareOsc.frequency.setValueAtTime(180, t);
        snareOsc.frequency.exponentialRampToValueAtTime(80, t + 0.08);

        snareGain.gain.setValueAtTime(0.2, t);
        snareGain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

        snareOsc.connect(snareGain);
        snareGain.connect(this.musicGain);
        snareOsc.start(t);
        snareOsc.stop(t + 0.1);
      }

      // 3. Bass Synth
      const bassFreq = bassLine[stepIdx];
      if (bassFreq > 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassG = this.ctx.createGain();
        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassFreq, t);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, t);

        bassG.gain.setValueAtTime(0.22, t);
        bassG.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.9);

        bassOsc.connect(filter);
        filter.connect(bassG);
        bassG.connect(this.musicGain);
        bassOsc.start(t);
        bassOsc.stop(t + stepDuration);
      }

      // 4. Arpeggiated Melody Lead
      const melFreq = melody[stepIdx];
      if (melFreq > 0) {
        const leadOsc = this.ctx.createOscillator();
        const leadG = this.ctx.createGain();
        leadOsc.type = 'square';
        leadOsc.frequency.setValueAtTime(melFreq, t);

        leadG.gain.setValueAtTime(0.12, t);
        leadG.gain.exponentialRampToValueAtTime(0.001, t + stepDuration * 0.85);

        leadOsc.connect(leadG);
        leadG.connect(this.musicGain);
        leadOsc.start(t);
        leadOsc.stop(t + stepDuration);
      }

      this.step++;
    };

    this.musicTimer = window.setInterval(playStep, stepDuration * 1000);
  }

  public stopBGM() {
    this.musicPlaying = false;
    if (this.musicTimer !== null) {
      clearInterval(this.musicTimer);
      this.musicTimer = null;
    }
  }
}

export const arcadeAudio = new ArcadeAudioEngine();
