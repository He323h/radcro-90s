/**
 * Blastar Reborn - Retro Cockpit Start Screen
 * Features glowing neon PLAY button at the top, ABOUT and EXIT buttons,
 * and classic arcade BLASTAR logo at the bottom.
 */

import React, { useState, useEffect } from 'react';
import { Play, Info, LogOut, Volume2, VolumeX, Shield, Zap, Crosshair, Radio, Sparkles } from 'lucide-react';

interface CockpitMenuProps {
  onPlay: () => void;
  onAbout: () => void;
  onExit: () => void;
  highScore: number;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const CockpitMenu: React.FC<CockpitMenuProps> = ({
  onPlay,
  onAbout,
  onExit,
  highScore,
  isMuted,
  onToggleMute,
}) => {
  const [radarAngle, setRadarAngle] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRadarAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-6 select-none overflow-hidden">
      {/* Cockpit Canopy Top Bezel & Neon PLAY Button */}
      <div className="pointer-events-auto flex flex-col items-center z-20">
        {/* Cockpit Overhead Console */}
        <div className="w-full max-w-2xl bg-slate-900/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-xl shadow-cyan-950/60 mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
            </span>
            <span className="font-mono text-[11px] sm:text-xs tracking-widest text-cyan-300 font-bold">
              FLIGHT COMPUTER // MK-IV VIPER READY
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleMute}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition-colors border border-slate-700 text-xs flex items-center gap-1.5"
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
              <span className="hidden sm:inline font-mono">{isMuted ? 'MUTED' : 'AUDIO'}</span>
            </button>
          </div>
        </div>

        {/* GLOWING NEON "PLAY" BUTTON AT THE TOP */}
        <div className="relative group mt-1">
          {/* Intense Neon Glow Aura */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 via-amber-400 to-orange-500 rounded-2xl blur-lg opacity-85 group-hover:opacity-100 transition duration-300 animate-pulse" />

          <button
            onClick={onPlay}
            className="relative px-12 py-4 sm:px-16 sm:py-5 bg-gradient-to-b from-slate-950 to-slate-900 text-amber-300 font-black text-xl sm:text-2xl rounded-xl tracking-widest border-2 border-cyan-400 shadow-2xl flex items-center gap-3 transition-transform duration-150 active:scale-95 group-hover:scale-105 group-hover:text-white group-hover:border-amber-300 cursor-pointer"
            style={{ fontFamily: '"Orbitron", sans-serif' }}
          >
            <Play className="w-7 h-7 fill-amber-400 text-amber-400 group-hover:fill-cyan-400 group-hover:text-cyan-400 transition-colors drop-shadow-[0_0_8px_#facc15]" />
            <span className="drop-shadow-[0_0_14px_rgba(34,211,238,0.9)]">PLAY MISSION</span>
          </button>
        </div>

        {/* Secondary Buttons: ABOUT & EXIT */}
        <div className="flex items-center gap-3 sm:gap-4 mt-3">
          <button
            onClick={onAbout}
            className="px-5 py-2 rounded-lg bg-slate-900/95 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/40 text-xs sm:text-sm font-mono tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Info className="w-4 h-4 text-cyan-400" />
            <span>ABOUT INTEL</span>
          </button>

          <button
            onClick={onExit}
            className="px-5 py-2 rounded-lg bg-slate-900/95 hover:bg-rose-950/50 text-slate-400 hover:text-rose-300 border border-slate-700/70 hover:border-rose-500/50 text-xs sm:text-sm font-mono tracking-wider flex items-center gap-2 shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-400" />
            <span>EXIT / RESET</span>
          </button>
        </div>
      </div>

      {/* Cockpit Center Vector Reticle & Active Radar Sweep */}
      <div className="hidden md:flex justify-between items-center px-6 w-full opacity-60">
        {/* Left Telemetry Wing */}
        <div className="w-52 bg-slate-950/80 backdrop-blur-xs border-l-2 border-cyan-500/60 p-3 rounded-r-lg font-mono text-[11px] text-cyan-400/90 space-y-1.5 shadow-lg">
          <div className="flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-cyan-400" /> DEFLECTOR: ONLINE
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> DUAL CANNONS: CHARGED
          </div>
          <div className="flex items-center gap-2">
            <Crosshair className="w-3.5 h-3.5 text-rose-400" /> TARGET LOCK: ACTIVE
          </div>
        </div>

        {/* Center Animated Tactical Radar */}
        <div className="relative w-40 h-40 rounded-full border border-cyan-500/30 bg-slate-950/60 flex items-center justify-center shadow-inner shadow-cyan-950">
          <div className="absolute inset-2 rounded-full border border-cyan-500/20" />
          <div className="absolute inset-8 rounded-full border border-cyan-500/15" />
          
          {/* Radar Sweep Needle */}
          <div
            className="absolute w-1/2 h-0.5 bg-gradient-to-r from-cyan-400 to-transparent top-1/2 left-1/2 origin-left"
            style={{ transform: `rotate(${radarAngle}deg)` }}
          />

          {/* Radar Hostile Blips */}
          <div className="absolute top-8 left-12 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
          <div className="absolute bottom-10 right-10 w-2 h-2 rounded-full bg-rose-500" />
          <div className="absolute top-14 right-12 w-2 h-2 rounded-full bg-amber-400" />

          {/* Center Crosshair */}
          <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
        </div>

        {/* Right Telemetry Wing */}
        <div className="w-52 bg-slate-950/80 backdrop-blur-xs border-r-2 border-amber-500/60 p-3 rounded-l-lg font-mono text-[11px] text-amber-400/90 text-right space-y-1.5 shadow-lg">
          <div className="flex items-center justify-end gap-1.5 text-amber-300">
            <Radio className="w-3.5 h-3.5" /> ARCADE LEADERBOARD
          </div>
          <div className="text-base font-black text-amber-300 tabular-nums font-mono">
            HI: {highScore.toString().padStart(6, '0')}
          </div>
          <div className="text-slate-400 text-[10px]">DIFFICULTY: ESCALATING</div>
        </div>
      </div>

      {/* Cockpit Bottom Dashboard: Title "BLASTAR" with Classic Arcade Styling */}
      <div className="pointer-events-auto flex flex-col items-center z-20">
        <div className="w-full max-w-3xl bg-gradient-to-t from-slate-950 via-slate-900/95 to-slate-900/80 border-t-2 border-amber-500/70 rounded-t-3xl pt-5 pb-4 px-6 shadow-2xl flex flex-col items-center">
          {/* Subtitle & Arcade Telemetry */}
          <div className="flex items-center gap-3 text-xs font-mono text-amber-400 tracking-widest uppercase mb-1">
            <span className="flex items-center gap-1.5 text-cyan-300">
              <Sparkles className="w-3 h-3 text-cyan-400" /> GALACTIC DEFENSE FORCE
            </span>
            <span>·</span>
            <span>EST. 1984 REBORN</span>
          </div>

          {/* CLASSIC ARCADE BLASTAR LOGO */}
          <div className="relative text-center my-1">
            <h1
              className="text-4xl sm:text-6xl md:text-7xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-orange-500 to-red-600 drop-shadow-[0_4px_20px_rgba(234,88,12,0.9)]"
              style={{ fontFamily: '"Orbitron", "Press Start 2P", sans-serif', letterSpacing: '0.15em' }}
            >
              BLASTAR
            </h1>
            <div className="text-xs sm:text-sm font-extrabold tracking-[0.4em] text-cyan-300 drop-shadow-[0_0_10px_rgba(6,182,212,0.9)] -mt-1 sm:-mt-2">
              REBORN
            </div>
          </div>

          {/* High Score & Arcade Coin Badge */}
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-mono text-slate-300">
            <div className="bg-slate-950 px-3 py-1 rounded-md border border-amber-500/50 text-amber-300 font-bold tabular-nums shadow-sm">
              ALL-TIME RECORD: {highScore.toString().padStart(6, '0')}
            </div>
            <div className="bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-500/40 text-cyan-300 font-bold animate-pulse">
              FREE PLAY · PRESS PLAY
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
