/**
 * Road Fighter Retro - Main Game Application
 * High-octane 2D top-down vertical arcade racing & vehicular combat game.
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { RoadFighterGame, GameTelemetry } from './game/RoadFighterGame';
import { GameState, WeatherMode } from './game/types';
import { retroAudio } from './audio/retroAudio';
import { ArcadeHUD } from './components/ArcadeHUD';
import { TouchControls } from './components/TouchControls';
import { TitleScreen } from './components/TitleScreen';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { VictoryModal } from './components/VictoryModal';
import { Tv } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const gameRef = useRef<RoadFighterGame | null>(null);

  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [showTouchButtons, setShowTouchButtons] = useState<boolean>(true);

  // HUD Telemetry State
  const [telemetry, setTelemetry] = useState<GameTelemetry>({
    score: 0,
    hiScore: 15000,
    speedKmH: 0,
    fuel: 100,
    distanceMeters: 0,
    totalDistance: 10000,
    theme: 'suburban',
    themeName: 'Suburban Town',
    weather: 'summer',
    weatherName: 'Summer',
    weaponLevel: 1,
    skidNotice: 'none',
    isBoost: false,
    gameState: 'TITLE',
    takedowns: 0,
    comboCount: 0,
    isAirborne: false,
    hasShieldRam: false,
    bossActive: false,
  });

  // Initialize Game Instance
  useEffect(() => {
    if (!canvasRef.current) return;

    const game = new RoadFighterGame(canvasRef.current);
    gameRef.current = game;

    // Telemetry throttle to keep React render light & clean
    let lastTelemetryTime = 0;
    game.onTelemetryUpdate = (data) => {
      const now = performance.now();
      if (now - lastTelemetryTime > 60 || data.gameState !== 'PLAYING') {
        lastTelemetryTime = now;
        setTelemetry(data);
      }
    };

    game.onStateChange = (state) => {
      setGameState(state);
    };

    const isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouchButtons(isMobile);

    return () => {
      game.destroy();
    };
  }, []);

  // Keyboard controls
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const game = gameRef.current;
    if (!game) return;

    retroAudio.init();

    if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
      if (game.state === 'PLAYING') {
        game.pause();
      } else if (game.state === 'PAUSED') {
        game.resume();
      }
      return;
    }

    if (e.key === 'm' || e.key === 'M') {
      const muted = retroAudio.toggleMute();
      setIsMuted(muted);
      return;
    }

    if (game.state === 'TITLE' || game.state === 'GAME_OVER' || game.state === 'VICTORY') {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        game.startNewGame();
        return;
      }
    }

    if (game.state === 'PLAYING') {
      switch (e.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          game.setInput('left', true);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          game.setInput('right', true);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          game.setInput('accelerate', true);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          game.setInput('brake', true);
          break;
        case ' ':
        case 'j':
        case 'J':
        case 'f':
        case 'F':
          // Fire twin blaster cannons!
          e.preventDefault();
          game.setInput('shoot', true);
          break;
        case 'Shift':
          // Turbo Boost
          e.preventDefault();
          game.triggerTurbo();
          break;
        case 't':
        case 'T':
          // Cycle Weather Mode (Summer, Winter, Sunrise, Rain)
          e.preventDefault();
          game.cycleWeather();
          break;
        case 'q':
        case 'Q':
        case 'z':
        case 'Z':
          // Side Slam Left Ram Attack!
          e.preventDefault();
          game.triggerSideSlam('left');
          break;
        case 'e':
        case 'E':
        case 'c':
        case 'C':
          // Side Slam Right Ram Attack!
          e.preventDefault();
          game.triggerSideSlam('right');
          break;
      }
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    const game = gameRef.current;
    if (!game || game.state !== 'PLAYING') return;

    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
      case 'A':
        game.setInput('left', false);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        game.setInput('right', false);
        break;
      case 'ArrowUp':
      case 'w':
      case 'W':
        game.setInput('accelerate', false);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        game.setInput('brake', false);
        break;
      case ' ':
      case 'j':
      case 'J':
      case 'f':
      case 'F':
        game.setInput('shoot', false);
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  // UI Handlers
  const handleStart = (weather?: WeatherMode) => {
    retroAudio.init();
    gameRef.current?.startNewGame(weather);
  };

  const handleResume = () => {
    retroAudio.init();
    gameRef.current?.resume();
  };

  const handleRestart = () => {
    retroAudio.init();
    gameRef.current?.startNewGame();
  };

  const handleGoHome = () => {
    retroAudio.init();
    gameRef.current?.goToTitle();
  };

  const handleToggleMute = () => {
    retroAudio.init();
    const muted = retroAudio.toggleMute();
    setIsMuted(muted);
  };

  const handleTouchInput = (control: 'left' | 'right' | 'accelerate' | 'brake' | 'shoot', pressed: boolean) => {
    gameRef.current?.setInput(control, pressed);
  };

  const handleTurbo = () => {
    gameRef.current?.triggerTurbo();
  };

  const handleSideSlam = (direction: 'left' | 'right') => {
    gameRef.current?.triggerSideSlam(direction);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-neutral-950 flex items-center justify-center select-none font-racing">
      {/* Isolated Canvas Container */}
      <div className="relative w-full h-full max-w-5xl mx-auto flex items-center justify-center overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full block cursor-crosshair touch-none"
        />

        {/* CRT Scanline & Phosphor Filter (Toggleable) */}
        {crtEnabled && (
          <>
            <div className="crt-overlay" />
            <div className="crt-vignette" />
          </>
        )}

        {/* CRT Toggle Pill in top right corner */}
        <div className="absolute top-18 right-2 sm:right-4 z-20 pointer-events-auto">
          <button
            onClick={() => setCrtEnabled(!crtEnabled)}
            className={`px-2 py-1 rounded text-[10px] font-pixel border flex items-center gap-1 transition-colors ${
              crtEnabled
                ? 'bg-amber-950/80 text-amber-300 border-amber-600/70'
                : 'bg-neutral-900/80 text-neutral-400 border-neutral-700'
            }`}
            title="Toggle CRT Scanline Shader"
          >
            <Tv className="w-3 h-3" />
            <span>CRT {crtEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* In-Game HUD (Visible during gameplay and pause) */}
        {gameState !== 'TITLE' && (
          <ArcadeHUD
            telemetry={telemetry}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPause={() => gameRef.current?.pause()}
            onCycleWeather={() => gameRef.current?.cycleWeather()}
            onHome={handleGoHome}
          />
        )}

        {/* Virtual On-Screen Touch Controls with Side Slam */}
        {gameState === 'PLAYING' && showTouchButtons && (
          <TouchControls
            onInput={handleTouchInput}
            onTurbo={handleTurbo}
            onSideSlam={handleSideSlam}
            isBoost={telemetry.isBoost}
          />
        )}

        {/* Screen Overlays & Modals */}
        {gameState === 'TITLE' && (
          <TitleScreen
            onStart={handleStart}
            hiScore={telemetry.hiScore}
          />
        )}

        {gameState === 'PAUSED' && (
          <PauseModal
            onResume={handleResume}
            onRestart={handleRestart}
            onHome={handleGoHome}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
          />
        )}

        {gameState === 'GAME_OVER' && (
          <GameOverModal
            telemetry={telemetry}
            onRestart={handleRestart}
            onHome={handleGoHome}
          />
        )}

        {gameState === 'VICTORY' && (
          <VictoryModal
            telemetry={telemetry}
            onRestart={handleRestart}
            onHome={handleGoHome}
          />
        )}
      </div>
    </div>
  );
}
