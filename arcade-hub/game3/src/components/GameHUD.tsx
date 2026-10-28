/**
 * Blastar Reborn - In-Game HUD (Head-Up Display)
 * Features Health/Shield bar at top-left, secondary Energy/Status meter below it,
 * Stage warp progression in center, Score counter at top right, and responsive controls.
 */

import React from 'react';
import { Volume2, VolumeX, Pause, Play, Shield, Zap, Sparkles, Navigation, Heart } from 'lucide-react';
import { StageConfig } from '../game/types';

interface GameHUDProps {
  score: number;
  highScore: number;
  shield: number;
  maxShield: number;
  lives: number;
  maxLives: number;
  energy: number;
  maxEnergy: number;
  weaponLevel: number;
  stage: StageConfig;
  autoFire: boolean;
  onToggleAutoFire: () => void;
  isPaused: boolean;
  onTogglePause: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  score,
  highScore,
  shield,
  maxShield,
  lives,
  maxLives,
  energy,
  maxEnergy,
  weaponLevel,
  stage,
  autoFire,
  onToggleAutoFire,
  isPaused,
  onTogglePause,
  isMuted,
  onToggleMute,
}) => {
  const shieldPercent = Math.max(0, Math.min(100, Math.round((shield / maxShield) * 100)));
  const energyPercent = Math.max(0, Math.min(100, Math.round((energy / maxEnergy) * 100)));

  // Sector warp progress (percentage toward stage threshold)
  const prevThreshold = stage.id === 1 ? 0 : stage.id === 2 ? 2500 : 6500;
  const currentSpan = stage.scoreThreshold - prevThreshold;
  const progressInSpan = Math.max(0, score - prevThreshold);
  const warpPercent = Math.min(100, Math.round((progressInSpan / currentSpan) * 100));

  // Dynamic shield color based on percentage
  const shieldColor =
    shieldPercent > 50
      ? 'bg-gradient-to-r from-cyan-500 to-cyan-300'
      : shieldPercent > 25
      ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
      : 'bg-gradient-to-r from-rose-600 to-rose-400 animate-pulse';

  return (
    <div className="absolute inset-0 pointer-events-none p-3 sm:p-5 flex flex-col justify-between z-10 select-none">
      {/* Top Header Bar */}
      <div className="flex items-start justify-between gap-3 w-full">
        {/* Top-Left: 3 Hearts Lifelines, Health/Shield Bar & Secondary Energy/Status Meter */}
        <div className="pointer-events-auto flex flex-col gap-1.5 bg-slate-950/85 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-cyan-500/40 shadow-xl min-w-[190px] sm:min-w-[250px]">
          {/* 3 HEARTS / LIFELINES ROW */}
          <div className="flex items-center justify-between pb-1.5 border-b border-cyan-500/20">
            <span className="text-[10px] font-mono tracking-widest text-rose-400 font-bold flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-400" />
              PILOT LIFELINES:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((heartIndex) => {
                const isAlive = heartIndex <= lives;
                return (
                  <div
                    key={heartIndex}
                    className={`transition-all duration-300 ${
                      isAlive ? 'scale-105' : 'opacity-20 grayscale'
                    }`}
                    title={`Life ${heartIndex}: ${isAlive ? 'Active' : 'Depleted'}`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isAlive
                          ? 'fill-rose-500 text-rose-400 drop-shadow-[0_0_8px_#f43f5e] animate-pulse'
                          : 'text-slate-600'
                      }`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Primary Shield / Health Bar */}
          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between text-[11px] font-mono font-bold">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Shield className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400/20" />
                SHIELD DEFENSE
              </span>
              <span
                className={`tabular-nums ${
                  shieldPercent < 25 ? 'text-rose-400 font-bold' : 'text-cyan-200'
                }`}
              >
                {shieldPercent}%
              </span>
            </div>
            {/* Health Bar Track */}
            <div className="w-full h-3 sm:h-3.5 bg-slate-900 rounded-sm overflow-hidden p-0.5 border border-cyan-800/80 shadow-inner">
              <div
                className={`h-full rounded-xs transition-all duration-150 ${shieldColor} shadow-[0_0_10px_rgba(6,182,212,0.9)]`}
                style={{ width: `${shieldPercent}%` }}
              />
            </div>
          </div>

          {/* Secondary Energy / Status Meter */}
          <div className="flex flex-col gap-1 mt-0.5">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="flex items-center gap-1 text-amber-300 font-semibold">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400/30" />
                PLASMA CORE
              </span>
              <span className="text-amber-200 font-bold tabular-nums">{energyPercent}%</span>
            </div>
            {/* Energy Meter Track */}
            <div className="w-full h-1.5 sm:h-2 bg-slate-900 rounded-sm overflow-hidden p-0.5 border border-amber-900/80 shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-amber-400 to-yellow-300 rounded-xs transition-all duration-150 shadow-[0_0_8px_rgba(245,158,11,0.7)]"
                style={{ width: `${energyPercent}%` }}
              />
            </div>
          </div>

          {/* Weapon Level Indicator */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-cyan-400">
              <Sparkles className="w-2.5 h-2.5" />
              WEAPON LVL:
            </span>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((lvl) => (
                <div
                  key={lvl}
                  className={`w-3.5 h-1.5 rounded-xs transition-all ${
                    lvl <= weaponLevel
                      ? 'bg-cyan-400 shadow-[0_0_6px_#38bdf8] scale-105'
                      : 'bg-slate-800'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Top-Center: Current Stage Tag, Sector Warp Bar & Quick Controls */}
        <div className="hidden sm:flex pointer-events-auto flex-col items-center gap-1.5 bg-slate-950/85 backdrop-blur-md px-4 py-2 rounded-xl border border-cyan-500/30 shadow-xl min-w-[260px]">
          <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-cyan-300 tracking-wider">
            <Navigation className="w-3 h-3 text-cyan-400" />
            <span>
              {stage.name}: {stage.subtitle}
            </span>
          </div>

          {/* Sector Warp Progress Bar */}
          <div className="w-full flex flex-col gap-0.5">
            <div className="flex justify-between text-[9px] font-mono text-slate-400">
              <span>SECTOR WARP PROGRESS</span>
              <span className="text-cyan-300 font-bold">{warpPercent}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 transition-all duration-200"
                style={{ width: `${warpPercent}%` }}
              />
            </div>
          </div>

          {/* Quick HUD Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={onToggleAutoFire}
              className={`px-2.5 py-0.5 rounded text-[10px] font-mono transition-colors border cursor-pointer ${
                autoFire
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-500/60 shadow-sm'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              AUTO-FIRE: {autoFire ? 'ACTIVE' : 'MANUAL'}
            </button>
            <button
              onClick={onToggleMute}
              className="p-1 rounded text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
            </button>
            <button
              onClick={onTogglePause}
              className="p-1 rounded text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
              title={isPaused ? 'Resume' : 'Pause'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-slate-300" />}
            </button>
          </div>
        </div>

        {/* Top-Right: Score Counter & High Score */}
        <div className="pointer-events-auto flex flex-col items-end bg-slate-950/85 backdrop-blur-md p-2.5 sm:p-3 rounded-xl border border-amber-500/40 shadow-xl min-w-[140px] sm:min-w-[180px]">
          <span className="text-[10px] font-mono tracking-widest text-amber-400 font-semibold">
            SCORE
          </span>
          <span
            className="text-lg sm:text-2xl font-black text-amber-300 tabular-nums tracking-wider drop-shadow-[0_0_10px_rgba(245,158,11,0.6)]"
            style={{ fontFamily: '"Press Start 2P", "Orbitron", monospace' }}
          >
            {score.toString().padStart(6, '0')}
          </span>
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
            <span>HI:</span>
            <span className="text-slate-200 tabular-nums font-bold">
              {highScore.toString().padStart(6, '0')}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Quick Bar */}
      <div className="sm:hidden pointer-events-auto flex items-center justify-between bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800 text-[10px] font-mono text-slate-300">
        <span className="text-cyan-400 font-bold">{stage.name}</span>
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAutoFire}
            className={`px-2 py-0.5 rounded text-[9px] border cursor-pointer ${
              autoFire
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {autoFire ? 'AUTO-FIRE' : 'TAP TO SHOOT'}
          </button>
          <button onClick={onToggleMute} className="p-1 text-slate-300 cursor-pointer">
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
          </button>
          <button onClick={onTogglePause} className="p-1 text-slate-300 cursor-pointer">
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5 text-slate-300" />}
          </button>
        </div>
      </div>
    </div>
  );
};
