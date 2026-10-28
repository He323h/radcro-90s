import React from 'react';
import { ChevronLeft, ChevronRight, Zap, ShieldAlert, Swords, Crosshair } from 'lucide-react';

interface TouchControlsProps {
  onInput: (control: 'left' | 'right' | 'accelerate' | 'brake' | 'shoot', pressed: boolean) => void;
  onTurbo: () => void;
  onSideSlam: (direction: 'left' | 'right') => void;
  isBoost: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onInput,
  onTurbo,
  onSideSlam,
  isBoost,
}) => {
  return (
    <div className="absolute bottom-4 left-0 right-0 z-20 pointer-events-none px-3 sm:px-6 flex items-end justify-between select-none">
      {/* Left Zone: Steering & Left Slam */}
      <div className="flex flex-col gap-2 pointer-events-auto">
        {/* Left Side-Slam Ram Attack */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            onSideSlam('left');
          }}
          className="w-14 h-11 sm:w-16 sm:h-12 rounded-lg bg-amber-600/90 active:bg-amber-500 text-neutral-950 border-2 border-amber-300 flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform backdrop-blur-xs touch-none"
          aria-label="Side Slam Left"
          title="Side Slam Left"
        >
          <Swords className="w-4 h-4" />
          <span className="font-pixel text-[9px] font-bold">SLAM ◀</span>
        </button>

        {/* Left / Right Steering Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('left', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onInput('left', false);
            }}
            onPointerLeave={() => onInput('left', false)}
            onPointerCancel={() => onInput('left', false)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-900/80 active:bg-blue-600/90 text-white border-2 border-neutral-700 active:border-blue-400 flex items-center justify-center shadow-lg active:scale-95 transition-transform backdrop-blur-xs touch-none"
            aria-label="Steer Left"
          >
            <ChevronLeft className="w-9 h-9 sm:w-11 sm:h-11 text-neutral-200" />
          </button>

          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('right', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onInput('right', false);
            }}
            onPointerLeave={() => onInput('right', false)}
            onPointerCancel={() => onInput('right', false)}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-neutral-900/80 active:bg-blue-600/90 text-white border-2 border-neutral-700 active:border-blue-400 flex items-center justify-center shadow-lg active:scale-95 transition-transform backdrop-blur-xs touch-none"
            aria-label="Steer Right"
          >
            <ChevronRight className="w-9 h-9 sm:w-11 sm:h-11 text-neutral-200" />
          </button>
        </div>
      </div>

      {/* Right Zone: Right Slam, Turbo, Brake & Gas */}
      <div className="flex flex-col items-end gap-2 pointer-events-auto">
        {/* Upper Row: Fire Guns & Right Side-Slam */}
        <div className="flex items-center gap-2">
          {/* Shoot / Fire Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('shoot', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onInput('shoot', false);
            }}
            onPointerLeave={() => onInput('shoot', false)}
            onPointerCancel={() => onInput('shoot', false)}
            className="w-16 h-11 sm:w-20 sm:h-12 rounded-lg bg-gradient-to-r from-red-600 to-rose-500 active:from-red-500 active:to-yellow-500 text-white border-2 border-red-300 flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(239,68,68,0.5)] active:scale-95 transition-transform backdrop-blur-xs touch-none cursor-pointer"
            aria-label="Shoot Weapon"
            title="Fire Cannons"
          >
            <Crosshair className="w-4 h-4 text-yellow-200" />
            <span className="font-pixel text-[9px] font-bold tracking-wider">FIRE!</span>
          </button>

          {/* Right Side-Slam Ram Attack */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onSideSlam('right');
            }}
            className="w-14 h-11 sm:w-16 sm:h-12 rounded-lg bg-amber-600/90 active:bg-amber-500 text-neutral-950 border-2 border-amber-300 flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform backdrop-blur-xs touch-none cursor-pointer"
            aria-label="Side Slam Right"
            title="Side Slam Right"
          >
            <span className="font-pixel text-[9px] font-bold">▶ SLAM</span>
            <Swords className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons: Brake, Turbo, Gas */}
        <div className="flex items-end gap-2">
          {/* Brake Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('brake', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onInput('brake', false);
            }}
            onPointerLeave={() => onInput('brake', false)}
            onPointerCancel={() => onInput('brake', false)}
            className="w-13 h-14 sm:w-15 sm:h-16 rounded-xl bg-neutral-900/80 active:bg-red-700/90 text-white border-2 border-neutral-700 active:border-red-500 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform backdrop-blur-xs touch-none"
            aria-label="Brake"
          >
            <ShieldAlert className="w-5 h-5 text-red-400 mb-0.5" />
            <span className="font-pixel text-[8px] sm:text-[9px] text-neutral-300">BRAKE</span>
          </button>

          {/* Turbo / Boost Button */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onTurbo();
            }}
            className={`w-13 h-14 sm:w-15 sm:h-16 rounded-xl text-white border-2 flex flex-col items-center justify-center shadow-lg active:scale-95 transition-transform backdrop-blur-xs touch-none ${
              isBoost 
                ? 'bg-cyan-500 border-cyan-300 animate-pulse' 
                : 'bg-neutral-900/80 active:bg-cyan-600 border-neutral-700'
            }`}
            aria-label="Turbo Boost"
          >
            <Zap className="w-5 h-5 text-yellow-300 mb-0.5" />
            <span className="font-pixel text-[8px] sm:text-[9px] text-cyan-300">TURBO</span>
          </button>

          {/* Gas / Accelerate Button */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault();
              onInput('accelerate', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              onInput('accelerate', false);
            }}
            onPointerLeave={() => onInput('accelerate', false)}
            onPointerCancel={() => onInput('accelerate', false)}
            className="w-16 h-20 sm:w-20 sm:h-24 rounded-xl bg-emerald-600/90 active:bg-emerald-500 text-white border-2 border-emerald-400 flex flex-col items-center justify-center shadow-xl active:scale-95 transition-transform backdrop-blur-xs touch-none"
            aria-label="Accelerate Gas"
          >
            <span className="font-pixel text-xs sm:text-sm font-bold text-white tracking-widest">
              GAS
            </span>
            <span className="text-[10px] text-emerald-200 font-racing mt-0.5">360 Km/h</span>
          </button>
        </div>
      </div>
    </div>
  );
};
