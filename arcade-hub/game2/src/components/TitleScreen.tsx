import React from 'react';
import { GameMode, Difficulty } from '../game/types';
import { Play, Users, Dumbbell, ShieldAlert, Volume2, VolumeX } from 'lucide-react';
import { arcadeAudio } from '../game/audio';

interface TitleScreenProps {
  onStartGame: (mode: GameMode, diff: Difficulty) => void;
  onOpenHelp: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenHelp,
  isMuted,
  onToggleMute,
}) => {
  const [selectedMode, setSelectedMode] = React.useState<GameMode>('ARCADE');
  const [difficulty, setDifficulty] = React.useState<Difficulty>('NORMAL');

  const handleStart = () => {
    arcadeAudio.playRoundGong();
    onStartGame(selectedMode, difficulty);
  };

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between items-center p-4 sm:p-8 bg-gradient-to-b from-slate-950 via-[#0e0c1f] to-slate-950 select-none overflow-y-auto">
      {/* Top Header / Audio Toggle */}
      <div className="w-full max-w-4xl flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 bg-amber-500/20 border border-amber-500/60 rounded text-[10px] font-arcade text-amber-400">
            ARCADE EDITION 1996
          </span>
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">60 FPS FIGHT ENGINE</span>
        </div>

        <button
          onClick={onToggleMute}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-700 hover:border-amber-500 rounded text-xs text-slate-300 font-arcade transition-colors cursor-pointer"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          <span className="text-[10px]">{isMuted ? 'UNMUTE' : 'SOUND ON'}</span>
        </button>
      </div>

      {/* Main Hero: Bespoke Inline SVG Title Lockup */}
      <div className="flex flex-col items-center justify-center my-auto text-center py-4">
        {/* Japanese Arcade Subtitle */}
        <div className="font-arcade text-xs sm:text-sm text-red-500 tracking-[0.35em] mb-2 font-bold animate-pulse">
          街 頭 激 戦 '96
        </div>

        {/* Hero Title Logo SVG */}
        <svg viewBox="0 0 600 120" className="w-full max-w-lg sm:max-w-2xl h-auto drop-shadow-[0_10px_20px_rgba(245,158,11,0.35)]">
          <defs>
            <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="40%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#ea580c" />
              <stop offset="100%" stopColor="#7c2d12" />
            </linearGradient>
            <linearGradient id="hyperGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#818cf8" />
              <stop offset="100%" stopColor="#c084fc" />
            </linearGradient>
          </defs>

          {/* STREET STRIKER */}
          <text
            x="300"
            y="65"
            textAnchor="middle"
            fontFamily="'Teko', sans-serif"
            fontSize="78"
            fontWeight="bold"
            fontStyle="italic"
            fill="url(#chromeGrad)"
            stroke="#000000"
            strokeWidth="3"
            letterSpacing="3"
          >
            STREET STRIKER
          </text>

          {/* '96 HYPER CLASH */}
          <text
            x="300"
            y="108"
            textAnchor="middle"
            fontFamily="'Press Start 2P', monospace"
            fontSize="18"
            fontWeight="bold"
            fill="url(#hyperGrad)"
            stroke="#000000"
            strokeWidth="1.5"
            letterSpacing="4"
          >
            HYPER CLASH '96
          </text>
        </svg>

        {/* Mode Selector Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-6 px-4">
          <button
            onClick={() => setSelectedMode('ARCADE')}
            className={`p-3 rounded-lg border-2 font-arcade text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMode === 'ARCADE'
                ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.4)] scale-105'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Play className="w-5 h-5 text-amber-400" />
            <span>1P ARCADE</span>
            <span className="text-[9px] text-slate-400 font-sans">Single Player vs CPU</span>
          </button>

          <button
            onClick={() => setSelectedMode('VERSUS')}
            className={`p-3 rounded-lg border-2 font-arcade text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMode === 'VERSUS'
                ? 'bg-blue-500/20 border-blue-400 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.4)] scale-105'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Users className="w-5 h-5 text-blue-400" />
            <span>2P VERSUS</span>
            <span className="text-[9px] text-slate-400 font-sans">Local 2-Player Combat</span>
          </button>

          <button
            onClick={() => setSelectedMode('TRAINING')}
            className={`p-3 rounded-lg border-2 font-arcade text-xs flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
              selectedMode === 'TRAINING'
                ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-105'
                : 'bg-slate-900/60 border-slate-700 text-slate-400 hover:border-slate-500'
            }`}
          >
            <Dumbbell className="w-5 h-5 text-emerald-400" />
            <span>TRAINING</span>
            <span className="text-[9px] text-slate-400 font-sans">Dojo Combo Practice</span>
          </button>
        </div>

        {/* CPU Difficulty Selector if in Arcade Mode */}
        {selectedMode === 'ARCADE' && (
          <div className="flex items-center gap-2 mt-4">
            <span className="font-arcade text-[10px] text-slate-400">CPU DIFFICULTY:</span>
            <div className="flex gap-1">
              {(['EASY', 'NORMAL', 'HARD', 'CHAMPION'] as Difficulty[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDifficulty(d)}
                  className={`px-2 py-1 rounded text-[10px] font-arcade transition-colors ${
                    difficulty === d
                      ? 'bg-red-600 text-white font-bold border border-red-400'
                      : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Primary Start CTA Button */}
        <button
          onClick={handleStart}
          className="mt-6 px-10 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-arcade text-sm font-extrabold tracking-widest rounded-md shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 transition-all cursor-pointer animate-pulse"
        >
          INSERT COIN • START FIGHT
        </button>

        <button
          onClick={onOpenHelp}
          className="mt-3 text-xs text-amber-400/80 hover:text-amber-300 font-arcade underline tracking-wider cursor-pointer"
        >
          [ VIEW MOVE LIST & COMMANDS ]
        </button>
      </div>

      {/* Flat Control Hints Bar */}
      <div className="w-full max-w-4xl text-center py-2 border-t border-slate-800/80 text-[10px] sm:text-xs text-slate-400 font-mono">
        <span className="text-amber-400">P1:</span> WASD Move · J/U Punches · K/I Kicks · L/SP Special · O Super · Space Guard
        <span className="mx-2 text-slate-600">|</span>
        <span className="text-blue-400">P2:</span> Arrows Move · Numpad 1/4 Punch · 2/5 Kick
      </div>
    </div>
  );
};
