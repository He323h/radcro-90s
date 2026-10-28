import React from 'react';
import { CharacterId, GamePhase } from '../game/types';
import { CHARACTERS } from '../game/characterData';

interface HUDProps {
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
}

export const HUD: React.FC<HUDProps> = ({
  p1Health,
  p1DisplayHealth,
  p1MaxHealth,
  p1Meter,
  p1Rounds,
  p1Char,
  p2Health,
  p2DisplayHealth,
  p2MaxHealth,
  p2Meter,
  p2Rounds,
  p2Char,
  roundTime,
  bannerText,
  p1Combo,
  p2Combo,
}) => {
  const p1Def = CHARACTERS[p1Char];
  const p2Def = CHARACTERS[p2Char];

  const p1Pct = Math.max(0, Math.min(100, (p1Health / p1MaxHealth) * 100));
  const p1DispPct = Math.max(0, Math.min(100, (p1DisplayHealth / p1MaxHealth) * 100));

  const p2Pct = Math.max(0, Math.min(100, (p2Health / p2MaxHealth) * 100));
  const p2DispPct = Math.max(0, Math.min(100, (p2DisplayHealth / p2MaxHealth) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2 sm:p-4 select-none z-10">
      {/* Top Bar: Health Bars & Round Timer */}
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto w-full">
        {/* P1 Health Cluster */}
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center justify-between w-full px-1 mb-1">
            <span
              className="font-arcade text-xs sm:text-sm font-bold tracking-wider"
              style={{ color: p1Def.themeColor }}
            >
              {p1Def.name}
            </span>
            <div className="flex gap-1.5">
              <span
                className={`w-3.5 h-3.5 rounded-full border border-amber-300 flex items-center justify-center text-[8px] font-arcade font-bold ${
                  p1Rounds >= 1 ? 'bg-amber-400 text-black shadow-glow' : 'bg-slate-900/80 text-amber-500/50'
                }`}
              >
                V
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full border border-amber-300 flex items-center justify-center text-[8px] font-arcade font-bold ${
                  p1Rounds >= 2 ? 'bg-amber-400 text-black shadow-glow' : 'bg-slate-900/80 text-amber-500/50'
                }`}
              >
                V
              </span>
            </div>
          </div>

          <div className="w-full h-5 sm:h-7 bg-slate-950/90 border-2 border-amber-500/80 rounded-sm p-0.5 relative overflow-hidden shadow-lg flex justify-end">
            <div
              className="absolute top-0 bottom-0 right-0 bg-red-600 transition-all duration-300"
              style={{ width: `${p1DispPct}%` }}
            />
            <div
              className={`absolute top-0 bottom-0 right-0 transition-all duration-75 ${
                p1Pct > 35
                  ? 'bg-gradient-to-l from-yellow-300 via-yellow-400 to-amber-500'
                  : 'bg-gradient-to-l from-red-500 via-orange-500 to-red-600 animate-pulse'
              }`}
              style={{ width: `${p1Pct}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
          </div>
        </div>

        {/* Center Round Timer */}
        <div className="flex flex-col items-center justify-center px-2">
          <div className="w-14 h-12 sm:w-16 sm:h-14 bg-slate-950 border-2 border-amber-500 rounded flex items-center justify-center shadow-xl">
            <span
              className={`font-arcade text-xl sm:text-2xl font-bold tabular-nums ${
                roundTime <= 15 ? 'text-red-500 animate-ping' : 'text-amber-400 text-glow-yellow'
              }`}
            >
              {roundTime < 10 ? `0${roundTime}` : roundTime}
            </span>
          </div>
        </div>

        {/* P2 Health Cluster */}
        <div className="flex-1 flex flex-col items-end">
          <div className="flex items-center justify-between w-full px-1 mb-1">
            <div className="flex gap-1.5">
              <span
                className={`w-3.5 h-3.5 rounded-full border border-amber-300 flex items-center justify-center text-[8px] font-arcade font-bold ${
                  p2Rounds >= 2 ? 'bg-amber-400 text-black shadow-glow' : 'bg-slate-900/80 text-amber-500/50'
                }`}
              >
                V
              </span>
              <span
                className={`w-3.5 h-3.5 rounded-full border border-amber-300 flex items-center justify-center text-[8px] font-arcade font-bold ${
                  p2Rounds >= 1 ? 'bg-amber-400 text-black shadow-glow' : 'bg-slate-900/80 text-amber-500/50'
                }`}
              >
                V
              </span>
            </div>
            <span
              className="font-arcade text-xs sm:text-sm font-bold tracking-wider"
              style={{ color: p2Def.themeColor }}
            >
              {p2Def.name}
            </span>
          </div>

          <div className="w-full h-5 sm:h-7 bg-slate-950/90 border-2 border-amber-500/80 rounded-sm p-0.5 relative overflow-hidden shadow-lg flex justify-start">
            <div
              className="absolute top-0 bottom-0 left-0 bg-red-600 transition-all duration-300"
              style={{ width: `${p2DispPct}%` }}
            />
            <div
              className={`absolute top-0 bottom-0 left-0 transition-all duration-75 ${
                p2Pct > 35
                  ? 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500'
                  : 'bg-gradient-to-r from-red-500 via-orange-500 to-red-600 animate-pulse'
              }`}
              style={{ width: `${p2Pct}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Floating Combo Counters */}
      <div className="flex justify-between w-full px-6 max-w-4xl mx-auto -mt-2">
        <div>
          {p1Combo > 1 && (
            <div className="animate-bounce">
              <span className="font-arcade text-xl sm:text-2xl text-amber-300 font-extrabold text-glow-yellow drop-shadow-md">
                {p1Combo} HITS!
              </span>
              <div className="font-arcade text-[10px] text-red-400 tracking-wider">
                {p1Combo >= 5 ? 'MARVELOUS!' : p1Combo >= 3 ? 'GREAT!' : 'NICE!'}
              </div>
            </div>
          )}
        </div>

        <div>
          {p2Combo > 1 && (
            <div className="animate-bounce text-right">
              <span className="font-arcade text-xl sm:text-2xl text-red-400 font-extrabold text-glow-red drop-shadow-md">
                {p2Combo} HITS!
              </span>
              <div className="font-arcade text-[10px] text-yellow-300 tracking-wider">
                {p2Combo >= 5 ? 'MARVELOUS!' : p2Combo >= 3 ? 'GREAT!' : 'NICE!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Announcer Big Banner */}
      {bannerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="py-3 px-8 bg-black/75 border-y-4 border-amber-400 backdrop-blur-xs shadow-2xl flex flex-col items-center animate-pulse">
            <span className="font-arcade text-3xl sm:text-5xl font-black text-amber-300 tracking-widest text-glow-yellow text-center drop-shadow-[0_5px_5px_rgba(0,0,0,1)]">
              {bannerText}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Bar: Super / EX Meters */}
      <div className="flex items-end justify-between max-w-4xl mx-auto w-full px-2 pb-1 gap-4">
        {/* P1 Super Meter */}
        <div className="w-40 sm:w-56 flex flex-col items-start">
          <div className="flex justify-between w-full text-[10px] font-arcade mb-0.5">
            <span className={p1Meter >= 100 ? 'text-cyan-300 font-bold animate-pulse text-glow-blue' : 'text-slate-400'}>
              {p1Meter >= 100 ? '★ SUPER READY' : 'SUPER GAUGE'}
            </span>
            <span className="text-cyan-400 font-bold">{Math.floor(p1Meter)}%</span>
          </div>
          <div className="w-full h-3 bg-slate-950 border border-cyan-500/70 rounded-xs overflow-hidden relative">
            <div
              className={`h-full transition-all duration-100 ${
                p1Meter >= 100
                  ? 'bg-gradient-to-r from-cyan-400 via-sky-300 to-white animate-pulse'
                  : 'bg-gradient-to-r from-blue-700 via-cyan-500 to-sky-400'
              }`}
              style={{ width: `${p1Meter}%` }}
            />
          </div>
        </div>

        {/* P2 Super Meter */}
        <div className="w-40 sm:w-56 flex flex-col items-end">
          <div className="flex justify-between w-full text-[10px] font-arcade mb-0.5">
            <span className="text-red-400 font-bold">{Math.floor(p2Meter)}%</span>
            <span className={p2Meter >= 100 ? 'text-red-400 font-bold animate-pulse text-glow-red' : 'text-slate-400'}>
              {p2Meter >= 100 ? '★ SUPER READY' : 'SUPER GAUGE'}
            </span>
          </div>
          <div className="w-full h-3 bg-slate-950 border border-red-500/70 rounded-xs overflow-hidden relative flex justify-end">
            <div
              className={`h-full transition-all duration-100 ${
                p2Meter >= 100
                  ? 'bg-gradient-to-l from-red-500 via-orange-400 to-white animate-pulse'
                  : 'bg-gradient-to-l from-red-800 via-red-600 to-orange-500'
              }`}
              style={{ width: `${p2Meter}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
