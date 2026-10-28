/**
 * Super Pixel Adventure GBA
 * Classic 90s Handheld Retro Platformer Arcade Game
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/engine';
import { GameRenderer } from './game/renderer';
import { createLevels } from './game/levels';
import { audio } from './game/audio';
import { InputState, GameState } from './game/types';
import { HUD } from './components/HUD';
import { TouchControls } from './components/TouchControls';
import {
  TitleScreen,
  PauseModal,
  StageClearModal,
  GameOverModal,
  VictoryModal,
} from './components/Modals';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const rendererRef = useRef<GameRenderer>(new GameRenderer());

  // Input states tracked in ref for zero-latency 60fps access
  const inputRef = useRef<InputState>({
    left: false,
    right: false,
    up: false,
    down: false,
    jump: false,
    jumpJustPressed: false,
    action: false,
    actionJustPressed: false,
    dash: false,
    dashJustPressed: false,
  });

  // UI States (updated via throttling to not hitch canvas loop)
  const [gameState, setGameState] = useState<GameState>('TITLE');
  const [hudData, setHudData] = useState({
    score: 0,
    coins: 0,
    health: 3,
    maxHealth: 3,
    lives: 3,
    timeLeft: 300,
    levelName: '1-1',
    powerup: 'none',
  });
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('pixel_gba_highscore') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [isMuted, setIsMuted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState(0);

  // Initialize Engine
  useEffect(() => {
    const levels = createLevels();
    const engine = new GameEngine(levels, (newState) => {
      setGameState(newState);
    });
    engineRef.current = engine;

    // Load initial high score
    const saved = localStorage.getItem('pixel_gba_highscore');
    if (saved) {
      setHighScore(parseInt(saved, 10));
    }
  }, []);

  // Update High Score whenever player's score exceeds it
  const updateScoreInStorage = useCallback((score: number) => {
    setHighScore((prev) => {
      if (score > prev) {
        try {
          localStorage.setItem('pixel_gba_highscore', score.toString());
        } catch {
          // ignore
        }
        return score;
      }
      return prev;
    });
  }, []);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Unlock audio on first user key press
      audio.unlock();

      if (e.repeat) return;
      const key = e.code;

      if (key === 'ArrowLeft' || key === 'KeyA') {
        inputRef.current.left = true;
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        inputRef.current.right = true;
      } else if (key === 'ArrowUp' || key === 'KeyW') {
        inputRef.current.up = true;
      } else if (key === 'ArrowDown' || key === 'KeyS') {
        inputRef.current.down = true;
      } else if (key === 'Space' || key === 'KeyK' || key === 'KeyZ') {
        inputRef.current.jump = true;
        inputRef.current.jumpJustPressed = true;
      } else if (key === 'KeyJ' || key === 'KeyX' || key === 'ShiftLeft' || key === 'ShiftRight') {
        inputRef.current.action = true;
        inputRef.current.actionJustPressed = true;
      } else if (key === 'KeyL' || key === 'KeyC') {
        inputRef.current.dash = true;
        inputRef.current.dashJustPressed = true;
      } else if (key === 'KeyP' || key === 'Escape') {
        // Toggle pause
        if (engineRef.current) {
          const current = engineRef.current.gameState;
          if (current === 'PLAYING') {
            engineRef.current.setGameState('PAUSED');
          } else if (current === 'PAUSED') {
            engineRef.current.setGameState('PLAYING');
          }
        }
      } else if (key === 'KeyM') {
        const muted = audio.toggleMute();
        setIsMuted(muted);
      } else if (key === 'Enter') {
        if (engineRef.current && engineRef.current.gameState === 'TITLE') {
          handleStartGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.code;
      if (key === 'ArrowLeft' || key === 'KeyA') {
        inputRef.current.left = false;
      } else if (key === 'ArrowRight' || key === 'KeyD') {
        inputRef.current.right = false;
      } else if (key === 'ArrowUp' || key === 'KeyW') {
        inputRef.current.up = false;
      } else if (key === 'ArrowDown' || key === 'KeyS') {
        inputRef.current.down = false;
      } else if (key === 'Space' || key === 'KeyK' || key === 'KeyZ') {
        inputRef.current.jump = false;
      } else if (key === 'KeyJ' || key === 'KeyX' || key === 'ShiftLeft' || key === 'ShiftRight') {
        inputRef.current.action = false;
      } else if (key === 'KeyL' || key === 'KeyC') {
        inputRef.current.dash = false;
      }
    };

    const handleBlur = () => {
      // Clear all inputs on window blur
      inputRef.current = {
        left: false,
        right: false,
        up: false,
        down: false,
        jump: false,
        jumpJustPressed: false,
        action: false,
        actionJustPressed: false,
        dash: false,
        dashJustPressed: false,
      };
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  // Virtual Touch Action Trigger Helper
  const handleTouchActionJustPressed = (action: 'jump' | 'action' | 'dash') => {
    audio.unlock();
    if (action === 'jump') inputRef.current.jumpJustPressed = true;
    if (action === 'action') inputRef.current.actionJustPressed = true;
    if (action === 'dash') inputRef.current.dashJustPressed = true;
  };

  // Main 60 FPS Game Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let hudTimer = 0;

    const loop = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      const engine = engineRef.current;
      const renderer = rendererRef.current;
      const canvas = canvasRef.current;

      if (engine && renderer && canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = false;

          // Update game state
          engine.update(dt, inputRef.current);

          // Clear edge-triggered button inputs for next frame
          inputRef.current.jumpJustPressed = false;
          inputRef.current.actionJustPressed = false;
          inputRef.current.dashJustPressed = false;

          // Render game frame
          const shakeX = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake : 0;
          const shakeY = engine.screenShake > 0 ? (Math.random() - 0.5) * engine.screenShake : 0;

          renderer.render(
            ctx,
            engine.VIRTUAL_WIDTH,
            engine.VIRTUAL_HEIGHT,
            engine.currentLevel.theme,
            engine.cameraX + shakeX,
            engine.cameraY + shakeY,
            engine.player,
            engine.blocks,
            engine.enemies,
            engine.collectibles,
            engine.springs,
            engine.flagpole,
            engine.projectiles,
            engine.particles,
            engine.floatingTexts,
            engine.gameTime
          );

          // Periodic HUD sync (throttled to ~10 FPS for React efficiency)
          hudTimer += dt;
          if (hudTimer > 0.08) {
            hudTimer = 0;
            setHudData({
              score: engine.player.score,
              coins: engine.player.coins,
              health: engine.player.health,
              maxHealth: engine.player.maxHealth,
              lives: engine.player.lives,
              timeLeft: engine.levelTimeRemaining,
              levelName: engine.currentLevel.name,
              powerup: engine.player.powerup,
            });

            if (engine.player.score > highScore) {
              updateScoreInStorage(engine.player.score);
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [highScore, updateScoreInStorage]);

  // Game Control Callbacks
  const handleStartGame = () => {
    audio.unlock();
    if (engineRef.current) {
      engineRef.current.loadLevel(selectedLevel, false);
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleSelectLevel = (lvlIndex: number) => {
    setSelectedLevel(lvlIndex);
    if (engineRef.current) {
      engineRef.current.loadLevel(lvlIndex, false);
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleRestartLevel = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(engineRef.current.levelIndex, true);
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleNextLevel = () => {
    if (engineRef.current) {
      const nextIdx = (engineRef.current.levelIndex + 1) % engineRef.current.allLevels.length;
      engineRef.current.loadLevel(nextIdx, true);
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleRetryFull = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(0, false);
      engineRef.current.setGameState('PLAYING');
    }
  };

  const handleReturnToTitle = () => {
    if (engineRef.current) {
      engineRef.current.setGameState('TITLE');
    }
  };

  const handleToggleMute = () => {
    const muted = audio.toggleMute();
    setIsMuted(muted);
  };

  const handleTogglePause = () => {
    if (engineRef.current) {
      if (engineRef.current.gameState === 'PLAYING') {
        engineRef.current.setGameState('PAUSED');
      } else if (engineRef.current.gameState === 'PAUSED') {
        engineRef.current.setGameState('PLAYING');
      }
    }
  };

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-slate-950 flex flex-col items-center justify-center select-none">
      {/* Handheld Device Chassis Container */}
      <div className="relative w-full h-full max-w-5xl max-h-[100dvh] md:max-h-[820px] flex flex-col justify-between items-center sm:p-2 md:p-4">
        {/* Retro Handheld Frame */}
        <div className="relative w-full h-full flex items-center justify-center bg-slate-900 sm:rounded-2xl sm:border-4 sm:border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.9)] overflow-hidden">
          {/* Active Canvas Game Viewport */}
          <canvas
            ref={canvasRef}
            width={480}
            height={270}
            onClick={() => {
              if (gameState === 'PLAYING') {
                handleTouchActionJustPressed('jump');
              }
            }}
            className="w-full h-full object-contain aspect-16/9 bg-black block cursor-pointer"
          />

          {/* HUD Layer (Always visible during active game) */}
          {gameState === 'PLAYING' && (
            <HUD
              score={hudData.score}
              coins={hudData.coins}
              health={hudData.health}
              maxHealth={hudData.maxHealth}
              lives={hudData.lives}
              timeLeft={hudData.timeLeft}
              levelName={hudData.levelName}
              isMuted={isMuted}
              isPaused={false}
              powerup={hudData.powerup}
              onToggleMute={handleToggleMute}
              onTogglePause={handleTogglePause}
            />
          )}

          {/* Virtual On-Screen Handheld Touch Controls */}
          {gameState === 'PLAYING' && (
            <TouchControls
              inputRef={inputRef}
              onTriggerActionJustPressed={handleTouchActionJustPressed}
            />
          )}

          {/* --- Game State Modals --- */}
          {gameState === 'TITLE' && (
            <TitleScreen
              highScore={highScore}
              selectedLevel={selectedLevel}
              onSelectLevel={handleSelectLevel}
              onStart={handleStartGame}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {gameState === 'PAUSED' && (
            <PauseModal
              onResume={handleResume}
              onRestart={handleRestartLevel}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
            />
          )}

          {gameState === 'STAGE_CLEAR' && (
            <StageClearModal
              score={hudData.score}
              coins={hudData.coins}
              timeLeft={hudData.timeLeft}
              levelName={hudData.levelName}
              onNextLevel={handleNextLevel}
              onReplay={handleRestartLevel}
            />
          )}

          {gameState === 'GAME_OVER' && (
            <GameOverModal
              score={hudData.score}
              highScore={highScore}
              onRetry={handleRetryFull}
              onTitle={handleReturnToTitle}
            />
          )}

          {gameState === 'GAME_VICTORY' && (
            <VictoryModal
              score={hudData.score}
              highScore={highScore}
              onRestart={handleRetryFull}
            />
          )}
        </div>
      </div>
    </main>
  );
}
