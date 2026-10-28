import React from 'react';
import { Trophy, Award, RotateCcw, Sparkles, Home } from 'lucide-react';
import { GameTelemetry } from '../game/RoadFighterGame';

interface VictoryModalProps {
  telemetry: GameTelemetry;
  onRestart: () => void;
  onHome: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  telemetry,
  onRestart,
  onHome,
}) => {
  const { score, hiScore, finalRank = 'A', finalBonus = 0 } = telemetry;
  const isNewRecord = score >= hiScore;

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-neutral-900 border-2 border-yellow-400 rounded-2xl p-6 text-center shadow-[0_0_50px_rgba(250,204,21,0.5)] flex flex-col items-center">
        {/* Trophy Icon */}
        <div className="w-16 h-16 rounded-full bg-yellow-950/80 border-2 border-yellow-400 flex items-center justify-center mb-3 shadow-[0_0_20px_rgba(250,204,21,0.6)]">
          <Trophy className="w-8 h-8 text-yellow-300 animate-bounce" />
        </div>

        <h2 className="font-pixel text-2xl sm:text-3xl text-yellow-300 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)] tracking-wider">
          GOAL REACHED!
        </h2>
        <p className="font-pixel text-xs text-emerald-400 mt-1 mb-5">
          ★ COURSE COMPLETED ★
        </p>

        {/* Rank Badge */}
        <div className="w-full bg-gradient-to-r from-blue-950 via-neutral-900 to-blue-950 border border-blue-500/50 rounded-xl p-3 flex items-center justify-around mb-4">
          <div className="flex items-center gap-2 font-pixel text-xs text-neutral-300">
            <Award className="w-5 h-5 text-yellow-400" />
            <span>RACE RANK</span>
          </div>
          <div className="font-pixel text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 to-amber-500 drop-shadow-[0_0_10px_rgba(250,204,21,0.8)]">
            RANK {finalRank}
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-4 font-pixel text-xs flex flex-col gap-2.5 mb-6">
          <div className="flex justify-between items-center text-neutral-400">
            <span>TAKEDOWNS</span>
            <span className="text-red-400 tabular-nums font-bold">{telemetry.takedowns || 0} CARS</span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>FUEL BONUS</span>
            <span className="text-emerald-400 tabular-nums">+{finalBonus.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center text-neutral-400">
            <span>TOTAL SCORE</span>
            <span className="text-yellow-300 text-sm font-bold tabular-nums">
              {score.toString().padStart(6, '0')}
            </span>
          </div>
          {isNewRecord && (
            <div className="text-center text-[10px] text-amber-400 mt-1 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>NEW ALL-TIME RECORD!</span>
            </div>
          )}
        </div>

        {/* Action Buttons Row */}
        <div className="w-full flex flex-col gap-2.5">
          <button
            onClick={onRestart}
            className="w-full py-3.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-red-500 hover:from-yellow-300 hover:to-red-400 text-neutral-950 font-pixel text-xs font-bold rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-neutral-950" />
            <span>RACE AGAIN</span>
          </button>

          <button
            onClick={onHome}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-blue-300 hover:text-white border border-neutral-700 rounded-xl font-pixel text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-md"
          >
            <Home className="w-4 h-4 text-cyan-400" />
            <span>HOME / CHOOSE MODE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
