import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Trophy, Star, ArrowRight, Shield, Zap } from 'lucide-react';
import { GameState } from '../game/types';

interface TitleScreenProps {
  highScore: number;
  selectedLevel: number;
  onSelectLevel: (lvl: number) => void;
  onStart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  highScore,
  selectedLevel,
  onSelectLevel,
  onStart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-40 flex flex-col items-center justify-between p-4 sm:p-8 bg-slate-950/60 backdrop-blur-[2px] text-white select-none">
      {/* Top Bar: High Score & Sound */}
      <div className="w-full flex items-center justify-between font-pixel text-xs">
        <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700/60 shadow-md">
          <Trophy className="w-3.5 h-3.5 text-yellow-400" />
          <span className="text-slate-400">HIGH:</span>
          <span className="text-yellow-300 font-mono tabular-nums">{highScore.toString().padStart(6, '0')}</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700/60 text-slate-300 hover:text-white cursor-pointer active:scale-95 transition-transform"
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          <span className="text-[10px]">{isMuted ? 'MUTED' : 'AUDIO ON'}</span>
        </button>
      </div>

      {/* Center: Bespoke Retro Title Lockup */}
      <div className="flex flex-col items-center text-center my-auto max-w-lg">
        {/* Inline SVG Title Lockup */}
        <div className="mb-4 drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]">
          <svg viewBox="0 0 460 90" className="w-72 sm:w-96 h-auto">
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" />
                <stop offset="45%" stopColor="#facc15" />
                <stop offset="85%" stopColor="#ca8a04" />
                <stop offset="100%" stopColor="#713f12" />
              </linearGradient>
              <linearGradient id="blueGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7dd3fc" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* 3D Depth Shadow */}
            <text x="230" y="44" textAnchor="middle" fill="#0f172a" fontSize="34" fontFamily="'Press Start 2P', monospace" fontWeight="bold">
              SUPER PIXEL
            </text>
            <text x="230" y="40" textAnchor="middle" fill="url(#goldGrad)" stroke="#451a03" strokeWidth="2" fontSize="34" fontFamily="'Press Start 2P', monospace" fontWeight="bold">
              SUPER PIXEL
            </text>
            {/* Subtitle */}
            <text x="230" y="80" textAnchor="middle" fill="#0f172a" fontSize="22" fontFamily="'Press Start 2P', monospace">
              ADVENTURE GBA
            </text>
            <text x="230" y="77" textAnchor="middle" fill="url(#blueGrad)" stroke="#0c4a6e" strokeWidth="1.5" fontSize="22" fontFamily="'Press Start 2P', monospace">
              ADVENTURE GBA
            </text>
          </svg>
        </div>

        {/* Level Selector */}
        <div className="flex items-center gap-2 mb-6 bg-slate-900/90 p-1.5 rounded-lg border border-slate-700/80 shadow-md">
          {[
            { id: 0, label: 'W 1-1 Meadows' },
            { id: 1, label: 'W 1-2 Cavern' },
            { id: 2, label: 'W 1-3 Castle Boss' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => onSelectLevel(lvl.id)}
              className={`px-3 py-1.5 text-[11px] font-pixel rounded transition-colors cursor-pointer ${
                selectedLevel === lvl.id
                  ? 'bg-amber-400 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>

        {/* Start Game Button */}
        <button
          onClick={onStart}
          className="group relative px-8 py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 font-pixel text-xs sm:text-sm tracking-wider rounded border-2 border-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.5)] transition-all flex items-center gap-3 cursor-pointer"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>PRESS START</span>
        </button>

        <span className="text-[10px] text-amber-200/80 font-pixel mt-3 animate-pulse">
          TOUCH OR PRESS ENTER TO PLAY
        </span>
      </div>

      {/* Bottom: Flat Single-Line Control Hint */}
      <div className="w-full text-center font-pixel text-[10px] text-slate-400 bg-slate-900/70 py-2 px-4 rounded border border-slate-800/80">
        <span>WASD / Arrows Move · Space / K Jump · J / X Attack · L / C Dash · P Pause</span>
      </div>
    </div>
  );
};

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs select-none">
      <div className="w-full max-w-xs bg-slate-900 border border-slate-700 rounded-xl p-6 text-center text-white shadow-2xl">
        <h2 className="font-pixel text-lg text-amber-300 tracking-wider mb-6">GAME PAUSED</h2>

        <div className="flex flex-col gap-3 font-pixel text-xs">
          <button
            onClick={onResume}
            className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            RESUME
          </button>

          <button
            onClick={onRestart}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600 transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESTART LEVEL
          </button>

          <button
            onClick={onToggleMute}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-600 transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 text-[10px] text-slate-400 font-pixel leading-relaxed">
          Tip: Stomp enemies from above or use Cape Spin (Button B) to knock them away!
        </div>
      </div>
    </div>
  );
};

interface StageClearModalProps {
  score: number;
  coins: number;
  timeLeft: number;
  levelName: string;
  onNextLevel: () => void;
  onReplay: () => void;
}

export const StageClearModal: React.FC<StageClearModalProps> = ({
  score,
  coins,
  timeLeft,
  levelName,
  onNextLevel,
  onReplay,
}) => {
  const timeBonus = Math.floor(timeLeft) * 20;
  const totalStageScore = score + timeBonus;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-amber-500/50 rounded-xl p-6 text-center text-white shadow-[0_0_32px_rgba(245,158,11,0.25)]">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 rounded-full bg-amber-400/20 border border-amber-400/60 flex items-center justify-center">
            <Trophy className="w-6 h-6 text-amber-300" />
          </div>
        </div>

        <h2 className="font-pixel text-base sm:text-lg text-amber-300 tracking-wider mb-1">STAGE CLEAR!</h2>
        <p className="text-xs text-slate-400 font-pixel mb-5">{levelName} Complete</p>

        {/* Breakdown Card */}
        <div className="bg-slate-950/80 rounded-lg p-3.5 border border-slate-800 font-pixel text-xs text-left mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">STAGE SCORE:</span>
            <span className="text-white font-mono">{score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">COINS ({coins}):</span>
            <span className="text-yellow-400 font-mono">+{coins * 100}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">TIME BONUS:</span>
            <span className="text-sky-300 font-mono">+{timeBonus}</span>
          </div>
          <div className="pt-2 border-t border-slate-800 flex justify-between items-center font-bold">
            <span className="text-amber-400">TOTAL SCORE:</span>
            <span className="text-amber-300 text-sm font-mono">{totalStageScore}</span>
          </div>
        </div>

        <div className="flex gap-3 font-pixel text-xs">
          <button
            onClick={onReplay}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded border border-slate-700 transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            REPLAY
          </button>
          <button
            onClick={onNextLevel}
            className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 shadow-md"
          >
            NEXT WORLD
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  highScore: number;
  onRetry: () => void;
  onTitle: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  highScore,
  onRetry,
  onTitle,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-rose-500/40 rounded-xl p-6 text-center text-white shadow-2xl">
        <h2 className="font-pixel text-xl text-rose-500 tracking-wider mb-2">GAME OVER</h2>
        <p className="text-xs text-slate-400 font-pixel mb-6">You ran out of lives!</p>

        <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-pixel text-xs text-left mb-6 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">FINAL SCORE:</span>
            <span className="text-white font-mono">{score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">BEST RECORD:</span>
            <span className="text-yellow-400 font-mono">{highScore}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 font-pixel text-xs">
          <button
            onClick={onRetry}
            className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded transition-colors cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-md"
          >
            <RotateCcw className="w-4 h-4" />
            TRY AGAIN (3 LIVES)
          </button>
          <button
            onClick={onTitle}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors cursor-pointer active:scale-95"
          >
            TITLE MENU
          </button>
        </div>
      </div>
    </div>
  );
};

interface VictoryModalProps {
  score: number;
  highScore: number;
  onRestart: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  score,
  highScore,
  onRestart,
}) => {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 select-none">
      <div className="w-full max-w-md bg-slate-900 border-2 border-yellow-400 rounded-xl p-6 sm:p-8 text-center text-white shadow-[0_0_40px_rgba(250,204,21,0.3)]">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-yellow-400/20 border-2 border-yellow-400 flex items-center justify-center animate-bounce">
            <Trophy className="w-8 h-8 text-yellow-300" />
          </div>
        </div>

        <h2 className="font-pixel text-xl sm:text-2xl text-yellow-300 tracking-wider mb-2">CONGRATULATIONS!</h2>
        <p className="text-xs text-amber-200 font-pixel mb-6">
          You defeated the Iron Spiketoad King and recovered the Grand Star!
        </p>

        <div className="bg-slate-950/80 rounded-lg p-4 border border-slate-800 font-pixel text-xs text-left mb-6 space-y-2.5">
          <div className="flex justify-between items-center">
            <span className="text-slate-400">CHAMPION SCORE:</span>
            <span className="text-amber-300 text-sm font-mono font-bold">{score}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-400">ALL-TIME HIGH:</span>
            <span className="text-white font-mono">{highScore}</span>
          </div>
        </div>

        <button
          onClick={onRestart}
          className="w-full py-3.5 bg-gradient-to-b from-amber-400 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-pixel text-xs sm:text-sm font-bold rounded border border-amber-200 shadow-xl transition-all cursor-pointer active:scale-95"
        >
          PLAY ADVENTURE AGAIN
        </button>
      </div>
    </div>
  );
};
