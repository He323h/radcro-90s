/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { initSpriteSet, SpriteSet } from './game/sprites';
import { LEVELS } from './game/levels';
import { sounds } from './game/audio';
import {
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  ArrowRight,
  Shield,
  Flame,
  Swords,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  Skull,
  UserCheck,
} from 'lucide-react';

type GameScreen = 'TITLE' | 'PLAYING' | 'PAUSED' | 'VICTORY' | 'GAME_OVER';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const spritesRef = useRef<SpriteSet | null>(null);

  // React State for HUD & Modals (polled from engine during state updates)
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [currentLevelId, setCurrentLevelId] = useState<number>(1);
  const [health, setHealth] = useState<number>(3);
  const [mana, setMana] = useState<number>(3);
  const [coins, setCoins] = useState<number>(0);
  const [rescuedVillagers, setRescuedVillagers] = useState<number>(0);
  const [totalVillagers, setTotalVillagers] = useState<number>(3);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [showTouchControls, setShowTouchControls] = useState<boolean>(true);

  // Initialize Sprites once
  useEffect(() => {
    spritesRef.current = initSpriteSet();
  }, []);

  // Sync state from engine
  const handleEngineStateChange = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;

    setHealth(engine.player.health);
    setMana(engine.player.mana);
    setCoins(engine.player.coins);
    setRescuedVillagers(engine.player.rescuedVillagers);
    setTotalVillagers(engine.player.totalVillagers);

    if (engine.isVictory) {
      setScreen('VICTORY');
    } else if (engine.isGameOver) {
      setScreen('GAME_OVER');
    }
  }, []);

  // Start or switch level
  const startLevel = useCallback(
    (levelId: number) => {
      if (!canvasRef.current || !spritesRef.current) return;
      sounds.startBGM();

      if (engineRef.current) {
        engineRef.current.stop();
      }

      const levelData = LEVELS[levelId]();
      const engine = new GameEngine(canvasRef.current, spritesRef.current, levelData, levelId);
      engine.onStateChange = handleEngineStateChange;
      engineRef.current = engine;

      setCurrentLevelId(levelId);
      setHealth(engine.player.health);
      setMana(engine.player.mana);
      setCoins(engine.player.coins);
      setRescuedVillagers(0);
      setTotalVillagers(levelData.cages.length);

      setScreen('PLAYING');
      engine.start();
    },
    [handleEngineStateChange]
  );

  // Resume paused game
  const resumeGame = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.isPaused = false;
      setScreen('PLAYING');
    }
  }, []);

  // Pause game
  const pauseGame = useCallback(() => {
    if (engineRef.current && screen === 'PLAYING') {
      engineRef.current.isPaused = true;
      setScreen('PAUSED');
    }
  }, [screen]);

  // Restart current stage
  const restartLevel = useCallback(() => {
    startLevel(currentLevelId);
  }, [startLevel, currentLevelId]);

  // Next level
  const nextLevel = useCallback(() => {
    const nextId = currentLevelId >= 3 ? 1 : currentLevelId + 1;
    startLevel(nextId);
  }, [startLevel, currentLevelId]);

  // Toggle Mute
  const toggleSound = useCallback(() => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  }, []);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Avoid browser scrolling on Space/Arrows
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
        e.preventDefault();
      }

      // Title screen quick start
      if (screen === 'TITLE' && (e.code === 'Enter' || e.code === 'Space')) {
        startLevel(1);
        return;
      }

      // Game Over / Victory shortcuts
      if ((screen === 'GAME_OVER' || screen === 'VICTORY') && (e.code === 'Enter' || e.code === 'Space')) {
        if (screen === 'VICTORY') nextLevel();
        else restartLevel();
        return;
      }

      // Pause toggle
      if (e.code === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (screen === 'PLAYING') pauseGame();
        else if (screen === 'PAUSED') resumeGame();
        return;
      }

      // Quick Retry
      if ((e.key === 'r' || e.key === 'R') && screen === 'PLAYING') {
        restartLevel();
        return;
      }

      const engine = engineRef.current;
      if (!engine || engine.isPaused || engine.isGameOver || engine.isVictory) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyA' || code === 'ArrowLeft') {
        engine.input.left = true;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        engine.input.right = true;
      }
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space' || key === 'k') {
        if (!engine.input.jump) {
          engine.input.justJumped = true;
        }
        engine.input.jump = true;
      }
      if (key === 'j' || key === 'x' || key === 'f' || code === 'Enter') {
        if (!engine.input.attack) {
          engine.input.justAttacked = true;
        }
        engine.input.attack = true;
      }
      if (key === 'l' || key === 'c' || key === 'e') {
        if (!engine.input.magic) {
          engine.input.justMagic = true;
        }
        engine.input.magic = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const engine = engineRef.current;
      if (!engine) return;

      const code = e.code;
      const key = e.key.toLowerCase();

      if (code === 'KeyA' || code === 'ArrowLeft') {
        engine.input.left = false;
      }
      if (code === 'KeyD' || code === 'ArrowRight') {
        engine.input.right = false;
      }
      if (code === 'KeyW' || code === 'ArrowUp' || code === 'Space' || key === 'k') {
        engine.input.jump = false;
      }
      if (key === 'j' || key === 'x' || key === 'f' || code === 'Enter') {
        engine.input.attack = false;
      }
      if (key === 'l' || key === 'c' || key === 'e') {
        engine.input.magic = false;
      }
    };

    const handleBlur = () => {
      const engine = engineRef.current;
      if (engine) {
        engine.input.left = false;
        engine.input.right = false;
        engine.input.jump = false;
        engine.input.attack = false;
        engine.input.magic = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screen, startLevel, pauseGame, resumeGame, nextLevel, restartLevel]);

  // Touch Handlers for Virtual D-Pad and Action Buttons
  const handleTouchAction = (action: 'left' | 'right' | 'jump' | 'attack' | 'magic', isPressed: boolean) => {
    const engine = engineRef.current;
    if (!engine || engine.isPaused || engine.isGameOver || engine.isVictory) return;

    if (action === 'left') {
      engine.input.left = isPressed;
    } else if (action === 'right') {
      engine.input.right = isPressed;
    } else if (action === 'jump') {
      if (isPressed && !engine.input.jump) {
        engine.input.justJumped = true;
      }
      engine.input.jump = isPressed;
    } else if (action === 'attack') {
      if (isPressed && !engine.input.attack) {
        engine.input.justAttacked = true;
      }
      engine.input.attack = isPressed;
    } else if (action === 'magic') {
      if (isPressed && !engine.input.magic) {
        engine.input.justMagic = true;
      }
      engine.input.magic = isPressed;
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 flex items-center justify-center select-none touch-none">
      {/* Isolated Canvas Game Container (Virtual Resolution 400x225 Scaled to Fit Crisp Pixel Art) */}
      <canvas
        ref={canvasRef}
        width={400}
        height={225}
        className="w-full h-full max-w-[177.77vh] max-h-[56.25vw] object-contain pixel-art bg-[#0a0d16] shadow-2xl"
      />

      {/* ----------------- PERIMETER LOW-OCCLUSION HUD ----------------- */}
      {screen === 'PLAYING' && (
        <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between">
          {/* Top Header Status Row */}
          <div className="flex items-start justify-between w-full">
            {/* Top-Left: Health & Mana */}
            <div className="flex flex-col gap-1.5 sm:gap-2 pointer-events-auto">
              {/* Hearts */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-lg shadow-md backdrop-blur-xs">
                {[0, 1, 2].map((idx) => {
                  const isFilled = idx < health;
                  return (
                    <div
                      key={`hp-${idx}`}
                      className={`w-5 h-5 flex items-center justify-center transition-transform ${
                        isFilled ? 'scale-100' : 'scale-90 opacity-40'
                      }`}
                    >
                      <svg viewBox="0 0 16 16" className="w-5 h-5 drop-shadow-sm">
                        <path
                          fill={isFilled ? '#e63946' : '#4a5568'}
                          d="M2 5a3 3 0 0 1 5-2.24A3 3 0 0 1 12 5c0 3-4 6-4 6s-4-3-4-6z"
                        />
                        {isFilled && <circle cx="5" cy="4" r="1" fill="#ff758f" />}
                      </svg>
                    </div>
                  );
                })}
              </div>

              {/* Mana Orbs */}
              <div className="flex items-center gap-1.5 bg-slate-950/70 border border-slate-800/80 px-2.5 py-1 rounded-lg shadow-md backdrop-blur-xs">
                {[0, 1, 2].map((idx) => {
                  const isFilled = idx < mana;
                  return (
                    <div
                      key={`mana-${idx}`}
                      className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        isFilled
                          ? 'bg-sky-500 border-sky-300 shadow-[0_0_8px_rgba(56,189,248,0.6)]'
                          : 'bg-slate-800 border-slate-700 opacity-40'
                      }`}
                    >
                      {isFilled && <div className="w-1.5 h-1.5 rounded-full bg-white/80" />}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top-Center: Rescued Villager Icons / Objective Tracker */}
            <div className="flex flex-col items-center gap-1 bg-slate-950/75 border border-slate-800/80 px-3.5 py-1.5 rounded-lg shadow-md backdrop-blur-xs">
              <span className="font-pixel text-[8px] sm:text-[9px] text-amber-300 tracking-wider">
                VILLAGERS RESCUED
              </span>
              <div className="flex items-center gap-2">
                {[0, 1, 2].map((idx) => {
                  const isRescued = idx < rescuedVillagers;
                  return (
                    <div
                      key={`villager-${idx}`}
                      className={`w-6 h-6 rounded flex items-center justify-center transition-all ${
                        isRescued
                          ? 'bg-emerald-600/30 border border-emerald-400 text-emerald-300 shadow-[0_0_6px_rgba(52,211,153,0.5)]'
                          : 'bg-slate-900/60 border border-slate-700 text-slate-600'
                      }`}
                      title={isRescued ? 'Rescued!' : 'Trapped in Cage'}
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top-Right: Coins Counter & Quick Action Buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Coin Counter */}
              <div className="flex items-center gap-2 bg-slate-950/75 border border-slate-800/80 px-3 py-1.5 rounded-lg shadow-md">
                <div className="w-4 h-4 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center shadow-sm">
                  <span className="text-[9px] font-bold text-amber-900 leading-none">G</span>
                </div>
                <span className="font-pixel text-xs text-amber-300 tabular-nums font-bold">
                  {coins.toString().padStart(3, '0')}
                </span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={toggleSound}
                className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              {/* Pause Button */}
              <button
                onClick={pauseGame}
                className="w-8 h-8 rounded-lg bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 active:scale-95 transition-all shadow-md"
                aria-label="Pause Game"
              >
                <Pause className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ----------------- MOBILE TOUCH CONTROLS ----------------- */}
          {showTouchControls && (
            <div className="flex items-end justify-between w-full pointer-events-none pb-2 sm:pb-3">
              {/* Left / Right Directional Pad */}
              <div className="flex items-center gap-2 pointer-events-auto">
                <button
                  onPointerDown={() => handleTouchAction('left', true)}
                  onPointerUp={() => handleTouchAction('left', false)}
                  onPointerCancel={() => handleTouchAction('left', false)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/70 active:bg-slate-700/90 border border-slate-700/80 flex items-center justify-center text-slate-200 active:scale-90 transition-transform shadow-lg backdrop-blur-xs select-none"
                  aria-label="Move Left"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onPointerDown={() => handleTouchAction('right', true)}
                  onPointerUp={() => handleTouchAction('right', false)}
                  onPointerCancel={() => handleTouchAction('right', false)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-900/70 active:bg-slate-700/90 border border-slate-700/80 flex items-center justify-center text-slate-200 active:scale-90 transition-transform shadow-lg backdrop-blur-xs select-none"
                  aria-label="Move Right"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </div>

              {/* Right Combat & Action Buttons */}
              <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
                {/* Magic Attack Button (Blue) */}
                <button
                  onPointerDown={() => handleTouchAction('magic', true)}
                  onPointerUp={() => handleTouchAction('magic', false)}
                  onPointerCancel={() => handleTouchAction('magic', false)}
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-sky-950/75 active:bg-sky-700/90 border-2 border-sky-400 flex flex-col items-center justify-center text-sky-300 active:scale-90 transition-transform shadow-lg backdrop-blur-xs select-none"
                  aria-label="Magic Attack"
                >
                  <Flame className="w-5 h-5" />
                  <span className="font-pixel text-[7px] text-sky-200">MAGIC</span>
                </button>

                {/* Sword Slash Button (Red) */}
                <button
                  onPointerDown={() => handleTouchAction('attack', true)}
                  onPointerUp={() => handleTouchAction('attack', false)}
                  onPointerCancel={() => handleTouchAction('attack', false)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-rose-950/80 active:bg-rose-700/90 border-2 border-rose-500 flex flex-col items-center justify-center text-rose-300 active:scale-90 transition-transform shadow-lg backdrop-blur-xs select-none"
                  aria-label="Sword Attack"
                >
                  <Swords className="w-6 h-6" />
                  <span className="font-pixel text-[8px] text-rose-200 font-bold">SLASH</span>
                </button>

                {/* Jump Button (Green / Emerald) */}
                <button
                  onPointerDown={() => handleTouchAction('jump', true)}
                  onPointerUp={() => handleTouchAction('jump', false)}
                  onPointerCancel={() => handleTouchAction('jump', false)}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-950/80 active:bg-emerald-700/90 border-2 border-emerald-400 flex flex-col items-center justify-center text-emerald-300 active:scale-90 transition-transform shadow-lg backdrop-blur-xs select-none"
                  aria-label="Jump / Double Jump"
                >
                  <ArrowUp className="w-6 h-6" />
                  <span className="font-pixel text-[8px] text-emerald-200 font-bold">JUMP</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ----------------- TITLE SCREEN MODAL ----------------- */}
      {screen === 'TITLE' && (
        <div className="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-between p-6 sm:p-10 z-20">
          {/* Top Bar with Audio Toggle */}
          <div className="w-full flex justify-between items-center max-w-4xl">
            <span className="font-pixel text-[9px] text-amber-500/80 tracking-widest uppercase">
              16-Bit Retro Hack & Slash
            </span>
            <button
              onClick={toggleSound}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              <span>{isMuted ? 'Muted' : 'Sound On'}</span>
            </button>
          </div>

          {/* Center Lockup: Bespoke SVG Title & Hero Centerpiece */}
          <div className="flex flex-col items-center text-center max-w-xl my-auto">
            {/* Bespoke Logo */}
            <div className="relative mb-6">
              <div className="flex items-center justify-center gap-3">
                <Swords className="w-9 h-9 sm:w-12 sm:h-12 text-rose-500 animate-pulse" />
                <h1 className="font-pixel text-2xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 tracking-wider drop-shadow-[0_4px_12px_rgba(245,158,11,0.5)]">
                  SWORD OF XOLAN
                </h1>
                <Swords className="w-9 h-9 sm:w-12 sm:h-12 text-rose-500 animate-pulse scale-x-[-1]" />
              </div>
              <p className="font-pixel text-[10px] sm:text-xs text-sky-400 mt-2 tracking-widest uppercase">
                Blade of the Dungeon Catacombs
              </p>
            </div>

            {/* Stage Selector */}
            <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
              {[1, 2, 3].map((lvlId) => {
                const names = ['The Sunken Catacombs', 'The Molten Cavern', 'The Crimson Citadel'];
                const isSelected = lvlId === currentLevelId;
                return (
                  <button
                    key={lvlId}
                    onClick={() => setCurrentLevelId(lvlId)}
                    className={`px-3 py-2 rounded-lg text-left transition-all border ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="font-pixel text-[9px] text-amber-400/80 mb-0.5">STAGE 0{lvlId}</div>
                    <div className="text-xs font-semibold text-slate-200">{names[lvlId - 1]}</div>
                  </button>
                );
              })}
            </div>

            {/* Primary Start CTA Button */}
            <button
              onClick={() => startLevel(currentLevelId)}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 font-pixel text-xs sm:text-sm font-bold tracking-wider hover:from-amber-400 hover:to-amber-300 hover:scale-105 active:scale-95 transition-all shadow-[0_0_24px_rgba(245,158,11,0.5)] flex items-center gap-3 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>START ADVENTURE</span>
            </button>
          </div>

          {/* Single Flat Control-Hint Line & Footer */}
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="text-xs text-slate-400 font-mono tracking-wide">
              WASD / Arrows Move · Space/W Jump (Double Jump) · J/X Slash · L/C Magic · Esc Pause
            </div>
            <div className="text-[11px] text-slate-500">
              Touch controls available on mobile & tablets · Rescue all 3 trapped villagers!
            </div>
          </div>
        </div>
      )}

      {/* ----------------- PAUSE MENU MODAL ----------------- */}
      {screen === 'PAUSED' && (
        <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center p-4 z-20">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col items-center text-center">
            <h2 className="font-pixel text-lg text-amber-400 mb-2">GAME PAUSED</h2>
            <p className="text-xs text-slate-400 mb-6">
              Stage 0{currentLevelId}: {LEVELS[currentLevelId]().subtitle}
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={resumeGame}
                className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Resume Game</span>
              </button>

              <button
                onClick={restartLevel}
                className="w-full py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition-all flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restart Stage</span>
              </button>

              <button
                onClick={toggleSound}
                className="w-full py-2 px-4 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs transition-all flex items-center justify-center gap-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>Sound: {isMuted ? 'Muted' : 'Active'}</span>
              </button>

              <button
                onClick={() => setScreen('TITLE')}
                className="w-full py-2 px-4 rounded-lg bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              >
                Return to Title Menu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- VICTORY / STAGE CLEAR MODAL ----------------- */}
      {screen === 'VICTORY' && (
        <div className="absolute inset-0 bg-slate-950/85 flex items-center justify-center p-4 z-20">
          <div className="w-full max-w-md bg-slate-900 border border-amber-500/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)] flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-400 flex items-center justify-center text-amber-400 mb-4 shadow-lg">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="font-pixel text-xl sm:text-2xl text-amber-300 mb-1">STAGE COMPLETE!</h2>
            <p className="text-xs text-slate-400 mb-6">
              You defeated the dungeon horrors and reached the portal!
            </p>

            {/* Stars Rating (Based on Villagers Rescued) */}
            <div className="flex items-center gap-3 mb-6">
              {[0, 1, 2].map((idx) => {
                const earned = idx < rescuedVillagers;
                return (
                  <div
                    key={`star-${idx}`}
                    className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all ${
                      earned
                        ? 'bg-amber-400 border-amber-300 text-slate-950 shadow-[0_0_14px_rgba(245,158,11,0.6)]'
                        : 'bg-slate-800 border-slate-700 text-slate-600'
                    }`}
                  >
                    <Sparkles className="w-5 h-5 fill-current" />
                  </div>
                );
              })}
            </div>

            {/* Stage Summary Stats */}
            <div className="w-full bg-slate-950/60 border border-slate-800 rounded-xl p-4 mb-6 grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[11px] text-slate-500 block">Villagers Rescued</span>
                <span className="font-pixel text-xs text-emerald-400">
                  {rescuedVillagers} / {totalVillagers}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Coins Collected</span>
                <span className="font-pixel text-xs text-amber-400 tabular-nums">
                  {coins} G
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex items-center gap-3">
              <button
                onClick={restartLevel}
                className="flex-1 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-pixel text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Replay</span>
              </button>

              <button
                onClick={nextLevel}
                className="flex-1 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-pixel text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentLevelId >= 3 ? 'Victory Loop' : 'Next Stage'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- GAME OVER MODAL ----------------- */}
      {screen === 'GAME_OVER' && (
        <div className="absolute inset-0 bg-rose-950/80 flex items-center justify-center p-4 z-20">
          <div className="w-full max-w-sm bg-slate-900 border border-rose-600/50 rounded-2xl p-6 sm:p-8 shadow-[0_0_40px_rgba(225,29,72,0.3)] flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-500 mb-4 shadow-lg">
              <Skull className="w-8 h-8" />
            </div>

            <h2 className="font-pixel text-xl sm:text-2xl text-rose-400 mb-2">YOU DIED</h2>
            <p className="text-xs text-slate-400 mb-6">
              The darkness of the dungeon claimed your blade...
            </p>

            <div className="w-full flex flex-col gap-2.5">
              <button
                onClick={restartLevel}
                className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-pixel text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Try Again</span>
              </button>

              <button
                onClick={() => setScreen('TITLE')}
                className="w-full py-2 px-4 rounded-xl bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              >
                Return to Title Menu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
