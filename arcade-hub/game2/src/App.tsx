import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { CharacterId, Difficulty, GameMode, GamePhase, InputState, StageId } from './game/types';
import { HUD } from './components/HUD';
import { VirtualGamepad } from './components/VirtualGamepad';
import { MoveListModal } from './components/MoveListModal';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { arcadeAudio } from './game/audio';
import {
  Volume2,
  VolumeX,
  Tv,
  HelpCircle,
  Pause,
  Play,
  RotateCcw,
  Gamepad2,
  Eye,
  Home,
} from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  // App Navigation & Settings
  const [appScreen, setAppScreen] = useState<'TITLE' | 'SELECT' | 'GAME'>('TITLE');
  const [gameMode, setGameMode] = useState<GameMode>('ARCADE');
  const [difficulty, setDifficulty] = useState<Difficulty>('NORMAL');
  const [stage, setStage] = useState<StageId>('COURTYARD');
  const [p1Char, setP1Char] = useState<CharacterId>('RYUGA');
  const [p2Char, setP2Char] = useState<CharacterId>('KAZUMA');

  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showMoveList, setShowMoveList] = useState<boolean>(false);
  const [showVirtualPad, setShowVirtualPad] = useState<boolean>(true);
  const [crtFilter, setCrtFilter] = useState<boolean>(true);
  const [showHitboxes, setShowHitboxes] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Game HUD State synced from Engine
  const [hudState, setHudState] = useState<{
    p1Health: number;
    p1DisplayHealth: number;
    p1MaxHealth: number;
    p1Meter: number;
    p1Rounds: number;
    p1Char: CharacterId;
    p2Health: number;
    p2DisplayHealth: number;
    p2MaxHealth: number;
    p2Meter: number;
    p2Rounds: number;
    p2Char: CharacterId;
    roundTime: number;
    roundNumber: number;
    phase: GamePhase;
    bannerText: string | null;
    p1Combo: number;
    p2Combo: number;
    winnerId: 1 | 2 | null;
  }>({
    p1Health: 1000,
    p1DisplayHealth: 1000,
    p1MaxHealth: 1000,
    p1Meter: 0,
    p1Rounds: 0,
    p1Char: 'RYUGA',
    p2Health: 920,
    p2DisplayHealth: 920,
    p2MaxHealth: 920,
    p2Meter: 0,
    p2Rounds: 0,
    p2Char: 'KAZUMA',
    roundTime: 99,
    roundNumber: 1,
    phase: 'ROUND_INTRO',
    bannerText: 'ROUND 1',
    p1Combo: 0,
    p2Combo: 0,
    winnerId: null,
  });

  // Start match after selection
  const handleStartMatch = (p1: CharacterId, p2: CharacterId, st: StageId) => {
    setP1Char(p1);
    setP2Char(p2);
    setStage(st);
    setAppScreen('GAME');
    setIsPaused(false);

    setTimeout(() => {
      if (canvasRef.current) {
        if (engineRef.current) {
          engineRef.current.stop();
        }
        const engine = new GameEngine(canvasRef.current, p1, p2, gameMode, difficulty, st);
        engine.debugHitboxes = showHitboxes;
        engine.onStateSync = (state) => setHudState(state);
        engineRef.current = engine;
        engine.start();
      }
    }, 50);
  };

  const handleRematch = () => {
    if (engineRef.current) {
      engineRef.current.startRound(1, true);
      setIsPaused(false);
    }
  };

  // Keyboard input event handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Pause shortcut
      if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
        if (appScreen === 'GAME') {
          setIsPaused((prev) => {
            const next = !prev;
            if (engineRef.current) {
              engineRef.current.phase = next ? 'PAUSED' : 'FIGHTING';
            }
            return next;
          });
        }
        return;
      }

      if (!engineRef.current || isPaused || appScreen !== 'GAME') return;

      const code = e.code;
      const key = e.key.toLowerCase();

      // P1 Inputs (WASD + J/K/U/I/L/O)
      if (key === 'a') engineRef.current.p1Input.left = true;
      if (key === 'd') engineRef.current.p1Input.right = true;
      if (key === 'w') engineRef.current.p1Input.up = true;
      if (key === 's') engineRef.current.p1Input.down = true;
      if (key === 'j') engineRef.current.p1Input.lp = true;
      if (key === 'u') engineRef.current.p1Input.hp = true;
      if (key === 'k') engineRef.current.p1Input.lk = true;
      if (key === 'i') engineRef.current.p1Input.hk = true;
      if (key === 'l') engineRef.current.p1Input.special = true;
      if (key === 'o') engineRef.current.p1Input.superArt = true;
      if (code === 'Space') engineRef.current.p1Input.block = true;

      // P2 Inputs (Arrow Keys + Numpad or 7/8/9/0)
      if (code === 'ArrowLeft') engineRef.current.p2Input.left = true;
      if (code === 'ArrowRight') engineRef.current.p2Input.right = true;
      if (code === 'ArrowUp') engineRef.current.p2Input.up = true;
      if (code === 'ArrowDown') engineRef.current.p2Input.down = true;

      if (code === 'Numpad1' || key === '7') engineRef.current.p2Input.lp = true;
      if (code === 'Numpad4' || key === '8') engineRef.current.p2Input.hp = true;
      if (code === 'Numpad2' || key === '9') engineRef.current.p2Input.lk = true;
      if (code === 'Numpad5' || key === '0') engineRef.current.p2Input.hk = true;
      if (code === 'Numpad3' || key === '-') engineRef.current.p2Input.special = true;
      if (code === 'Numpad6' || key === '=') engineRef.current.p2Input.superArt = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!engineRef.current) return;
      const code = e.code;
      const key = e.key.toLowerCase();

      // P1 Inputs
      if (key === 'a') engineRef.current.p1Input.left = false;
      if (key === 'd') engineRef.current.p1Input.right = false;
      if (key === 'w') engineRef.current.p1Input.up = false;
      if (key === 's') engineRef.current.p1Input.down = false;
      if (key === 'j') engineRef.current.p1Input.lp = false;
      if (key === 'u') engineRef.current.p1Input.hp = false;
      if (key === 'k') engineRef.current.p1Input.lk = false;
      if (key === 'i') engineRef.current.p1Input.hk = false;
      if (key === 'l') engineRef.current.p1Input.special = false;
      if (key === 'o') engineRef.current.p1Input.superArt = false;
      if (code === 'Space') engineRef.current.p1Input.block = false;

      // P2 Inputs
      if (code === 'ArrowLeft') engineRef.current.p2Input.left = false;
      if (code === 'ArrowRight') engineRef.current.p2Input.right = false;
      if (code === 'ArrowUp') engineRef.current.p2Input.up = false;
      if (code === 'ArrowDown') engineRef.current.p2Input.down = false;

      if (code === 'Numpad1' || key === '7') engineRef.current.p2Input.lp = false;
      if (code === 'Numpad4' || key === '8') engineRef.current.p2Input.hp = false;
      if (code === 'Numpad2' || key === '9') engineRef.current.p2Input.lk = false;
      if (code === 'Numpad5' || key === '0') engineRef.current.p2Input.hk = false;
      if (code === 'Numpad3' || key === '-') engineRef.current.p2Input.special = false;
      if (code === 'Numpad6' || key === '=') engineRef.current.p2Input.superArt = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [appScreen, isPaused]);

  // Handle Virtual Gamepad Input from on-screen touch controls
  const handleVirtualInput = useCallback((partial: Partial<InputState>) => {
    if (!engineRef.current) return;
    Object.assign(engineRef.current.p1Input, partial);
  }, []);

  const toggleSound = () => {
    const muted = arcadeAudio.toggleMute();
    setIsMuted(muted);
  };

  const toggleHitboxes = () => {
    setShowHitboxes((prev) => {
      const next = !prev;
      if (engineRef.current) engineRef.current.debugHitboxes = next;
      return next;
    });
  };

  return (
    <div className="relative w-screen h-screen bg-[#050508] text-white flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Retro Arcade CRT Scanline & Vignette Overlay */}
      {crtFilter && <div className="crt-overlay crt-vignette" />}

      {/* Title Screen Overlay */}
      {appScreen === 'TITLE' && (
        <TitleScreen
          onStartGame={(mode, diff) => {
            setGameMode(mode);
            setDifficulty(diff);
            setAppScreen('SELECT');
          }}
          onOpenHelp={() => setShowMoveList(true)}
          isMuted={isMuted}
          onToggleMute={toggleSound}
        />
      )}

      {/* Character & Stage Select Screen */}
      {appScreen === 'SELECT' && (
        <CharacterSelect
          mode={gameMode}
          onConfirm={handleStartMatch}
          onBack={() => setAppScreen('TITLE')}
        />
      )}

      {/* Main Game Screen */}
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-black">
        {/* Game Canvas Container (480x270 / 640x360 scaled aspect) */}
        <div className="relative w-full h-full max-w-6xl max-h-[85vh] flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={GameEngine.VIRTUAL_WIDTH}
            height={GameEngine.VIRTUAL_HEIGHT}
            className="w-full h-full object-contain pixelated shadow-2xl bg-black"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* Fighting Game HUD */}
          {appScreen === 'GAME' && <HUD {...hudState} />}

          {/* Virtual Touch Gamepad Controls */}
          {appScreen === 'GAME' && (
            <VirtualGamepad
              onInputChange={handleVirtualInput}
              visible={showVirtualPad}
            />
          )}

          {/* Top Edge Arcade Quick Controls Toolbar */}
          {appScreen === 'GAME' && (
            <div className="absolute top-2 right-2 sm:right-4 z-30 flex items-center gap-1.5 pointer-events-auto">
              {gameMode === 'ARCADE' && (
                <button
                  onClick={() => {
                    const diffs: Difficulty[] = ['EASY', 'NORMAL', 'HARD', 'CHAMPION'];
                    const nextIdx = (diffs.indexOf(difficulty) + 1) % diffs.length;
                    const nextDiff = diffs[nextIdx];
                    setDifficulty(nextDiff);
                    if (engineRef.current) {
                      engineRef.current.ai.setDifficulty(nextDiff);
                    }
                  }}
                  title="Cycle CPU Difficulty"
                  className="px-2 py-1 bg-red-950/80 border border-red-500/80 hover:border-red-400 rounded text-red-300 font-arcade text-[9px] transition-colors"
                >
                  CPU: {difficulty}
                </button>
              )}

              <button
                onClick={() => setShowMoveList(true)}
                title="Command List"
                className="p-1.5 sm:p-2 bg-slate-900/80 border border-slate-700 hover:border-amber-400 rounded text-slate-300 hover:text-amber-300 text-xs transition-colors"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowVirtualPad((prev) => !prev)}
                title="Toggle Virtual Gamepad"
                className={`p-1.5 sm:p-2 rounded border text-xs transition-colors ${
                  showVirtualPad
                    ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setCrtFilter((prev) => !prev)}
                title="Toggle CRT Filter"
                className={`p-1.5 sm:p-2 rounded border text-xs transition-colors ${
                  crtFilter
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
              >
                <Tv className="w-4 h-4" />
              </button>

              <button
                onClick={toggleHitboxes}
                title="Toggle Hitboxes"
                className={`p-1.5 sm:p-2 rounded border text-xs transition-colors ${
                  showHitboxes
                    ? 'bg-green-500/20 border-green-400 text-green-300'
                    : 'bg-slate-900/80 border-slate-700 text-slate-400'
                }`}
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={toggleSound}
                title="Mute Sound"
                className="p-1.5 sm:p-2 bg-slate-900/80 border border-slate-700 hover:border-amber-400 rounded text-slate-300 hover:text-white text-xs transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => {
                  setIsPaused((prev) => {
                    const next = !prev;
                    if (engineRef.current) engineRef.current.phase = next ? 'PAUSED' : 'FIGHTING';
                    return next;
                  });
                }}
                title="Pause Match"
                className="p-1.5 sm:p-2 bg-slate-900/80 border border-slate-700 hover:border-amber-400 rounded text-slate-300 hover:text-white text-xs transition-colors"
              >
                {isPaused ? <Play className="w-4 h-4 text-green-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
              </button>
            </div>
          )}

          {/* Pause / Match Over Modal */}
          {(isPaused || hudState.phase === 'MATCH_OVER') && (
            <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="w-full max-w-sm bg-slate-900 border-2 border-amber-500 rounded-lg p-6 shadow-2xl flex flex-col items-center text-center">
                <span className="font-arcade text-2xl text-amber-300 mb-1">
                  {hudState.phase === 'MATCH_OVER' ? 'MATCH RESULTS' : 'PAUSED'}
                </span>
                <span className="text-xs text-slate-400 font-fighter text-base mb-3">
                  {hudState.phase === 'MATCH_OVER'
                    ? hudState.winnerId === 1
                      ? 'PLAYER 1 CLAIMS VICTORY!'
                      : 'PLAYER 2 CLAIMS VICTORY!'
                    : 'TAKE A BREATHER, WARRIOR'}
                </span>

                {gameMode === 'ARCADE' && (
                  <div className="w-full mb-4 p-2 bg-slate-950/80 rounded border border-slate-800">
                    <span className="font-arcade text-[9px] text-slate-400 block mb-1.5">CPU DIFFICULTY</span>
                    <div className="grid grid-cols-4 gap-1">
                      {(['EASY', 'NORMAL', 'HARD', 'CHAMPION'] as Difficulty[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => {
                            setDifficulty(d);
                            if (engineRef.current) engineRef.current.ai.setDifficulty(d);
                          }}
                          className={`py-1 text-[8px] font-arcade rounded border transition-colors ${
                            difficulty === d
                              ? 'bg-red-600 text-white border-red-400 font-bold'
                              : 'bg-slate-900 text-slate-400 border-slate-700 hover:text-white'
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="w-full space-y-2.5 font-arcade text-xs">
                  {hudState.phase !== 'MATCH_OVER' && (
                    <button
                      onClick={() => {
                        setIsPaused(false);
                        if (engineRef.current) engineRef.current.phase = 'FIGHTING';
                      }}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded shadow transition-colors flex items-center justify-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      <span>RESUME FIGHT</span>
                    </button>
                  )}

                  <button
                    onClick={handleRematch}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded border border-slate-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>REMATCH</span>
                  </button>

                  <button
                    onClick={() => {
                      if (engineRef.current) engineRef.current.stop();
                      setAppScreen('SELECT');
                    }}
                    className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded border border-slate-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Gamepad2 className="w-4 h-4" />
                    <span>CHARACTER SELECT</span>
                  </button>

                  <button
                    onClick={() => {
                      if (engineRef.current) engineRef.current.stop();
                      arcadeAudio.stopBGM();
                      setAppScreen('TITLE');
                    }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white font-bold rounded border border-slate-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Home className="w-4 h-4" />
                    <span>MAIN MENU</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Move List Modal */}
      <MoveListModal
        isOpen={showMoveList}
        onClose={() => setShowMoveList(false)}
        selectedChar={p1Char}
      />
    </div>
  );
}
