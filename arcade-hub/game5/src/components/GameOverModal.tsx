import React from 'react';
import { RotateCcw, AlertTriangle, Trophy, Home } from 'lucide-react';
import { GameTelemetry } from '../game/RoadFighterGame';

interface GameOverModalProps {
  telemetry: GameTelemetry;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  telemetry,
  onRestart,
  onHome,
}) => {
  const { score, hiScore, distanceMeters, totalDistance, themeName } = telemetry;
  const isNewRecord = score >= hiScore && score > 0;
  const distanceKm = (distanceMeters / 1000).toFixed(2);
  const totalKm = (totalDistance / 1000).toFixed(1);

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-neutral-900 border-2 border-red-600 rounded-2xl p-6 text-center shadow-[0_0_40px_rgba(239,68,68,0.4)] flex flex-col items-center">
        {/* Header Icon */}
        <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-600/80 flex items-center justify-center mb-3">
          <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
        </div>

        <h2 className="font-pixel text-2xl sm:text-3xl text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.8)] tracking-wider">
          GAME OVER
        </h2>
        <p className="font-pixel text-xs text-neutral-400 mt-1 mb-6">
          OUT OF FUEL
        </p>

        {/* Record banner if new record */}
        {isNewRecord && (
          <div className="w-full py-1.5 bg-yellow-500/20 border border-yellow-500/60 rounded-lg flex items-center justify-center gap-2 mb-4 font-pixel text-[11px] text-yellow-300 animate-pulse">
            <Trophy className="w-4 h-4 text-yellow-400" />
            <span>NEW HIGH SCORE!</span>
          </div>
        )}

        {/* Stats card */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-pixel text-xs flex flex-col gap-3 mb-5">
          <div className="flex justify-between items-center text-neutral-400">
            <span>FINAL SCORE</span>
            <span className="text-yellow-400 text-sm font-bold tabular-nums">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>DISTANCE</span>
            <span className="text-white tabular-nums">
              {distanceKm} / {totalKm} Km
            </span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>TAKEDOWNS</span>
            <span className="text-red-400 tabular-nums font-bold">
              {telemetry.takedowns || 0} CARS
            </span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>SECTOR</span>
            <span className="text-cyan-400 truncate max-w-[150px]">
              {themeName}
            </span>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-500 hover:from-red-500 hover:to-amber-400 text-neutral-950 font-pixel text-xs font-bold rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-neutral-950" />
            <span>TRY AGAIN</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-blue-300 hover:text-white border border-neutral-700 rounded-xl font-pixel text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>HOME / CHOOSE MODE</span>
          </button>
        </div>

        <p className="mt-3 font-pixel text-[10px] text-neutral-500">
          PRESS ENTER OR SPACE TO RETRY
        </p>
      </div>
    </div>
  );
};
