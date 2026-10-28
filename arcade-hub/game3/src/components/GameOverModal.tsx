/**
 * Blastar Reborn - Game Over / Mission Summary Modal
 */

import React from 'react';
import { RotateCcw, Home, Trophy, Skull, Crosshair } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  kills: number;
  stageName: string;
  onPlayAgain: () => void;
  onReturnToCockpit: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  kills,
  stageName,
  onPlayAgain,
  onReturnToCockpit,
}) => {
  if (!isOpen) return null;

  const isNewHighScore = score > 0 && score >= highScore;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-rose-500/60 rounded-2xl p-6 sm:p-8 shadow-2xl text-center text-slate-200">
        {/* Danger Header */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-950/80 border border-rose-500/40 text-rose-400 font-mono text-xs mb-3 tracking-widest uppercase">
          <Skull className="w-4 h-4 text-rose-400" />
          HULL BREACH DETECTED
        </div>

        <h2
          className="text-3xl sm:text-4xl font-black text-rose-500 tracking-wider font-mono drop-shadow-[0_0_12px_rgba(244,63,94,0.6)]"
          style={{ fontFamily: '"Orbitron", "Press Start 2P", monospace' }}
        >
          GAME OVER
        </h2>

        {/* New High Score celebration */}
        {isNewHighScore && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-xs font-bold animate-bounce">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            NEW ALL-TIME RECORD!
          </div>
        )}

        {/* Mission Stats Breakdown */}
        <div className="my-5 p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5 font-mono text-xs sm:text-sm">
          <div className="flex justify-between items-center text-slate-400">
            <span>FINAL SCORE:</span>
            <span
              className="text-xl sm:text-2xl font-black text-amber-300 tabular-nums"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              {score.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400 border-t border-slate-800/80 pt-2">
            <span>HIGH SCORE:</span>
            <span className="text-slate-200 tabular-nums font-bold">
              {highScore.toString().padStart(6, '0')}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span className="flex items-center gap-1">
              <Crosshair className="w-3.5 h-3.5 text-rose-400" /> HOSTILES OBLITERATED:
            </span>
            <span className="text-rose-300 font-bold tabular-nums">{kills}</span>
          </div>

          <div className="flex justify-between items-center text-slate-400">
            <span>SECTOR REACHED:</span>
            <span className="text-cyan-300 font-bold">{stageName}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6">
          <button
            onClick={onPlayAgain}
            className="flex-1 py-3 px-5 bg-gradient-to-r from-cyan-500 to-amber-500 hover:from-cyan-400 hover:to-amber-400 text-slate-950 font-black rounded-xl font-mono text-sm tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>

          <button
            onClick={onReturnToCockpit}
            className="py-3 px-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-mono text-sm tracking-wider flex items-center justify-center gap-2 transition-colors border border-slate-700"
          >
            <Home className="w-4 h-4" />
            COCKPIT
          </button>
        </div>
      </div>
    </div>
  );
};
