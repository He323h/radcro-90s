import React, { useState } from 'react';
import { Play, Trophy, Sparkles, Crosshair, CloudRain, Sun, Snowflake, Sunrise } from 'lucide-react';
import { WeatherMode } from '../game/types';

interface TitleScreenProps {
  onStart: (weather?: WeatherMode) => void;
  hiScore: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({ onStart, hiScore }) => {
  const [selectedWeather, setSelectedWeather] = useState<WeatherMode>('summer');

  const weatherOptions: { mode: WeatherMode; label: string; desc: string; icon: React.ReactNode }[] = [
    { mode: 'summer', label: 'SUMMER', desc: 'Sunny & Clear Highway', icon: <Sun className="w-4 h-4 text-amber-400" /> },
    { mode: 'winter', label: 'WINTER', desc: 'Snow & Icy Road Skid', icon: <Snowflake className="w-4 h-4 text-cyan-300" /> },
    { mode: 'sunrise', label: 'SUNRISE', desc: 'Morning Dawn Ambience', icon: <Sunrise className="w-4 h-4 text-orange-400" /> },
    { mode: 'rain', label: 'RAIN', desc: 'Thunder & Slick Wet Road', icon: <CloudRain className="w-4 h-4 text-blue-400" /> },
  ];

  return (
    <div className="absolute inset-0 z-30 flex flex-col items-center justify-between p-4 sm:p-6 bg-neutral-950/95 overflow-y-auto">
      {/* Top Bar / High Score */}
      <div className="w-full max-w-2xl flex items-center justify-between font-pixel text-xs text-neutral-400 border-b border-neutral-800 pb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>TOP RECORD</span>
        </div>
        <div className="tabular-nums text-yellow-400 font-bold tracking-widest">
          {hiScore.toString().padStart(6, '0')}
        </div>
      </div>

      {/* Hero Marquee Title Lockup */}
      <div className="my-auto text-center flex flex-col items-center max-w-xl py-2">
        {/* Retro Subtitle Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-950/60 border border-blue-700/60 rounded-full text-[11px] font-pixel text-blue-300 mb-2 tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.3)]">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-spin" />
          <span>ROAD FIGHTER: COMBAT EDITION</span>
        </div>

        {/* Main Title */}
        <h1 className="font-pixel text-3xl sm:text-5xl lg:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-amber-400 to-red-600 drop-shadow-[0_4px_16px_rgba(239,68,68,0.7)] tracking-wider leading-tight">
          ROAD FIGHTER
        </h1>
        <div className="font-pixel text-sm sm:text-xl text-cyan-400 drop-shadow-[0_0_10px_rgba(56,189,248,0.8)] tracking-widest mt-0.5">
          CAR WAR & SHOOTING 360 KM/H
        </div>

        {/* Weather Mode Selection */}
        <div className="mt-4 w-full max-w-lg">
          <div className="text-[10px] font-pixel text-yellow-400 uppercase tracking-widest mb-1.5 flex items-center justify-center gap-1.5">
            <span>🏁 CHOOSE RACE WEATHER MODE:</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {weatherOptions.map((w) => {
              const active = selectedWeather === w.mode;
              return (
                <button
                  key={w.mode}
                  type="button"
                  onClick={() => setSelectedWeather(w.mode)}
                  className={`p-2.5 rounded-xl border font-pixel text-[10px] flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    active
                      ? 'bg-gradient-to-b from-blue-600/40 to-blue-900/60 border-cyan-400 text-white shadow-[0_0_15px_rgba(56,189,248,0.5)] scale-105 ring-2 ring-cyan-400/50'
                      : 'bg-neutral-900/90 border-neutral-800 text-neutral-400 hover:text-white hover:border-neutral-600 hover:bg-neutral-850'
                  }`}
                >
                  <div className="flex items-center justify-center scale-110">{w.icon}</div>
                  <span className="font-bold tracking-wider">{w.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Mode Details & Tips Banner */}
          <div className="mt-2.5 bg-neutral-900/90 border border-neutral-800 rounded-lg p-2 text-center">
            <p className="font-pixel text-[10px] text-cyan-300">
              {weatherOptions.find(w => w.mode === selectedWeather)?.desc}
            </p>
            <p className="text-[10px] font-racing text-neutral-400 mt-0.5">
              💡 <span className="text-amber-300 font-bold">Tip:</span> Race ke dauraan upar <span className="text-white font-bold">🏠 HOME</span> button dabakar yahan wapas aa sakte ho, ya seedhe <span className="text-sky-300 font-bold">HUD Weather Pill / 'T' key</span> se mausam badal sakte ho!
            </p>
          </div>
        </div>

        {/* Primary Start CTA */}
        <div className="mt-4">
          <button
            onClick={() => onStart(selectedWeather)}
            className="group relative px-8 sm:px-12 py-3.5 bg-gradient-to-r from-red-600 via-amber-500 to-yellow-400 hover:from-red-500 hover:to-yellow-300 text-neutral-950 font-pixel text-sm sm:text-base font-bold rounded-xl shadow-[0_0_25px_rgba(245,158,11,0.6)] hover:shadow-[0_0_35px_rgba(245,158,11,0.9)] hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-current text-neutral-950" />
            <span>PLAY {selectedWeather.toUpperCase()} MODE</span>
          </button>
        </div>

        <p className="mt-2 font-pixel text-[10px] text-neutral-400 animate-pulse">
          PRESS ENTER OR SPACE TO START
        </p>

        {/* Dynamic Environments Preview Strip */}
        <div className="mt-2.5 flex flex-wrap justify-center gap-2 max-w-md text-[10px] font-racing text-neutral-400">
          <span className="text-emerald-400">1. Suburban</span> · 
          <span className="text-sky-400">2. Sea Bridge</span> · 
          <span className="text-amber-400">3. Desert Canyon</span> · 
          <span className="text-teal-400">4. Tropical Beach</span> · 
          <span className="text-zinc-300">5. Cargo Port</span>
        </div>
      </div>

      {/* Control Instructions Card */}
      <footer className="w-full max-w-2xl bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 sm:p-4 text-xs font-racing text-neutral-300 shadow-xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
          <div>
            <div className="font-pixel text-[10px] text-yellow-400 mb-1">🎮 DRIVING</div>
            <p>• <span className="text-white font-bold">Arrow / WASD</span>: Steer, Gas, Brake</p>
            <p>• <span className="text-white font-bold">Shift</span>: Turbo Boost</p>
            <p>• <span className="text-white font-bold">T Key</span>: Cycle Weather</p>
          </div>
          <div>
            <div className="font-pixel text-[10px] text-red-400 mb-1 flex items-center gap-1">
              <Crosshair className="w-3 h-3 text-red-400" />
              <span>SHOOTING COMBAT</span>
            </div>
            <p>• <span className="text-white font-bold">Space / J</span>: Fire Twin Cannons!</p>
            <p>• <span className="text-white font-bold">Pick Crate [W]</span>: Plasma / Hyper</p>
            <p>• <span className="text-amber-300 font-bold">Warning</span>: Rival cars shoot back!</p>
          </div>
          <div>
            <div className="font-pixel text-[10px] text-cyan-400 mb-1">🥊 BODY SLAM RAM</div>
            <p>• <span className="text-white font-bold">Q / E</span> or <span className="text-white font-bold">Z / X</span>: Side-Slam Ram</p>
            <p>• <span className="text-white font-bold">Smash Rivals</span>: Ram cars to guardrail!</p>
            <p>• <span className="text-white font-bold">Boss Tanker</span>: Blast or ram side armor!</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
