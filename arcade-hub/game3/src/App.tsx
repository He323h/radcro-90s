/**
 * Blastar Reborn - Main Application Entry
 * Full-screen 60 FPS HTML5 Canvas arcade space shooter
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine, STAGES } from './game/engine';
import { GameState, StageConfig } from './game/types';
import { soundEngine } from './game/audio';
import { CockpitMenu } from './components/CockpitMenu';
import { GameHUD } from './components/GameHUD';
import { AboutModal } from './components/AboutModal';
import { GameOverModal } from './components/GameOverModal';
import { Play } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // React mirrors of engine state
  const [gameState, setGameState] = useState<GameState>('COCKPIT_MENU');
  const [score, setScore] = useState<number>(0);
  const [highScore, setHighScore] = useState<number>(0);
  const [shield, setShield] = useState<number>(100);
  const [maxShield, setMaxShield] = useState<number>(100);
  const [lives, setLives] = useState<number>(3);
  const [maxLives, setMaxLives] = useState<number>(3);
  const [energy, setEnergy] = useState<number>(100);
  const [maxEnergy, setMaxEnergy] = useState<number>(100);
  const [weaponLevel, setWeaponLevel] = useState<number>(1);
  const [stage, setStage] = useState<StageConfig>(STAGES[0]);
  const [autoFire, setAutoFire] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [aboutOpen, setAboutOpen] = useState<boolean>(false);
  const [gameOverData, setGameOverData] = useState<{ score: number; kills: number; stageName: string }>({
    score: 0,
    kills: 0,
    stageName: STAGES[0].name,
  });

  // Initialize Canvas & Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Set real display pixel dimensions
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const engine = new GameEngine(canvas, {
      onScoreUpdate: (newScore, newHighScore) => {
        setScore(newScore);
        setHighScore(newHighScore);
      },
      onPlayerStatusUpdate: (s, ms, e, wl, l, ml) => {
        setShield(s);
        setMaxShield(ms);
        setEnergy(e);
        setWeaponLevel(wl);
        setLives(l);
        setMaxLives(ml);
      },
      onStageChange: (newStage) => {
        setStage(newStage);
      },
      onGameOver: (finalScore, kills, stageName) => {
        setGameOverData({ score: finalScore, kills, stageName });
        setGameState('GAME_OVER');
      },
      onStateChange: (state) => {
        setGameState(state);
      },
    });

    engineRef.current = engine;
    setHighScore(engine.highScore);
    engine.startLoop();

    // Resize handling
    const handleResize = () => {
      if (!container || !engine) return;
      const newRect = container.getBoundingClientRect();
      if (newRect.width > 0 && newRect.height > 0) {
        engine.resize(newRect.width, newRect.height);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stopLoop();
    };
  }, []);

  // Handlers
  const handlePlay = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleToggleAutoFire = () => {
    if (engineRef.current) {
      const next = !autoFire;
      engineRef.current.autoFire = next;
      setAutoFire(next);
    }
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      engineRef.current.togglePause();
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  const handleExit = () => {
    if (window.confirm('Reset high score and reload cockpit system?')) {
      if (engineRef.current) {
        engineRef.current.resetHighScores();
      }
    }
  };

  const handlePlayAgain = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleReturnToCockpit = () => {
    if (engineRef.current) {
      engineRef.current.exitToCockpit();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none touch-none"
    >
      {/* 60 FPS HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block cursor-crosshair"
      />

      {/* COCKPIT START SCREEN (When not playing or gameover) */}
      {gameState === 'COCKPIT_MENU' && (
        <CockpitMenu
          onPlay={handlePlay}
          onAbout={() => setAboutOpen(true)}
          onExit={handleExit}
          highScore={highScore}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* IN-GAME HUD (When playing or paused) */}
      {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
        <GameHUD
          score={score}
          highScore={highScore}
          shield={shield}
          maxShield={maxShield}
          lives={lives}
          maxLives={maxLives}
          energy={energy}
          maxEnergy={maxEnergy}
          weaponLevel={weaponLevel}
          stage={stage}
          autoFire={autoFire}
          onToggleAutoFire={handleToggleAutoFire}
          isPaused={gameState === 'PAUSED'}
          onTogglePause={handleTogglePause}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {/* PAUSE OVERLAY */}
      {gameState === 'PAUSED' && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-slate-900 border-2 border-amber-500/60 rounded-2xl p-6 sm:p-8 text-center shadow-2xl max-w-sm mx-4">
            <h3
              className="text-2xl font-black text-amber-400 font-mono tracking-widest mb-2"
              style={{ fontFamily: '"Orbitron", monospace' }}
            >
              MISSION PAUSED
            </h3>
            <p className="text-xs font-mono text-slate-300 mb-6">
              TACTICAL SUSPENSION ACTIVE // ENGINES IDLE
            </p>
            <div className="space-y-3">
              <button
                onClick={handleTogglePause}
                className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black rounded-xl font-mono text-xs tracking-wider flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                RESUME MISSION
              </button>
              <button
                onClick={handleReturnToCockpit}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-xs tracking-wider border border-slate-700 transition-colors"
              >
                ABORT TO COCKPIT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT MODAL */}
      <AboutModal isOpen={aboutOpen} onClose={() => setAboutOpen(false)} />

      {/* GAME OVER MODAL */}
      <GameOverModal
        isOpen={gameState === 'GAME_OVER'}
        score={gameOverData.score}
        highScore={highScore}
        kills={gameOverData.kills}
        stageName={gameOverData.stageName}
        onPlayAgain={handlePlayAgain}
        onReturnToCockpit={handleReturnToCockpit}
      />
    </div>
  );
}
