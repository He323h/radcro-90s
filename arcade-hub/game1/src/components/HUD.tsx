import React from 'react';
import { Volume2, VolumeX, Pause, Play, Heart } from 'lucide-react';
import { audio } from '../game/audio';

interface HUDProps {
  score: number;
  coins: number;
  health: number;
  maxHealth: number;
  lives: number;
  timeLeft: number;
  levelName: string;
  isMuted: boolean;
  isPaused: boolean;
  powerup: string;
  onToggleMute: () => void;
  onTogglePause: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  score,
  coins,
  health,
  maxHealth,
  lives,
  timeLeft,
  levelName,
  isMuted,
  isPaused,
  powerup,
  onToggleMute,
  onTogglePause,
}) => {
  const formattedScore = score.toString().padStart(6, '0');
  const formattedCoins = coins.toString().padStart(2, '0');
  const formattedTime = Math.ceil(timeLeft).toString().padStart(3, '0');

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex items-center justify-between text-white font-pixel text-xs sm:text-sm select-none">
      {/* Zone 1: World & Score Cluster */}
      <div className="flex items-center gap-4 sm:gap-6 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700/60 shadow-md">
        <div>
          <span className="text-slate-400 text-[10px] block leading-none mb-0.5">WORLD</span>
          <span className="text-amber-300 font-bold tracking-wider">{levelName}</span>
        </div>

        <div>
          <span className="text-slate-400 text-[10px] block leading-none mb-0.5">SCORE</span>
          <span className="text-white font-mono tabular-nums">{formattedScore}</span>
        </div>
      </div>

      {/* Zone 2: Coins & Time Cluster */}
      <div className="flex items-center gap-4 sm:gap-6 bg-slate-900/80 px-3 py-1.5 rounded border border-slate-700/60 shadow-md">
        {/* Coins with spinning coin indicator */}
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 bg-yellow-400 border border-yellow-200 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-[8px] text-amber-900 font-bold">$</span>
          </div>
          <span className="text-yellow-300 font-mono tabular-nums">x{formattedCoins}</span>
        </div>

        {/* Time */}
        <div className="hidden xs:block">
          <span className="text-slate-400 text-[10px] block leading-none mb-0.5">TIME</span>
          <span className={`font-mono tabular-nums ${timeLeft < 50 ? 'text-rose-400 animate-pulse' : 'text-slate-200'}`}>
            {formattedTime}
          </span>
        </div>
      </div>

      {/* Zone 3: Health Hearts, Lives & Control buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Health Hearts */}
        <div className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1.5 rounded border border-slate-700/60 shadow-md">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: maxHealth }).map((_, i) => (
              <Heart
                key={i}
                className={`w-3.5 h-3.5 transition-all ${
                  i < health
                    ? 'text-rose-500 fill-rose-500 scale-100'
                    : 'text-slate-600 fill-slate-800 scale-90'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-300 ml-1 font-mono">x{lives}</span>
          {powerup !== 'none' && (
            <span className="ml-1 text-[9px] text-orange-400 uppercase font-sans font-semibold">
              [{powerup}]
            </span>
          )}
        </div>

        {/* Action Buttons: Sound & Pause (Pointer events enabled for buttons) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={onToggleMute}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            className="w-8 h-8 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
            className="w-8 h-8 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer shadow-sm active:scale-95"
          >
            {isPaused ? <Play className="w-4 h-4 text-amber-400 fill-amber-400" /> : <Pause className="w-4 h-4 text-slate-300" />}
          </button>
        </div>
      </div>
    </header>
  );
};
