import React, { useRef, useState } from 'react';
import { InputState } from '../game/types';

interface VirtualGamepadProps {
  onInputChange: (input: Partial<InputState>) => void;
  visible: boolean;
}

export const VirtualGamepad: React.FC<VirtualGamepadProps> = ({ onInputChange, visible }) => {
  const [dpadActive, setDpadActive] = useState<{ x: number; y: number } | null>(null);
  const [activeButtons, setActiveButtons] = useState<Record<string, boolean>>({});
  const dpadRef = useRef<HTMLDivElement>(null);

  if (!visible) return null;

  // Handle D-Pad pointer events (8-way virtual joystick)
  const handleDpadPointer = (clientX: number, clientY: number) => {
    if (!dpadRef.current) return;
    const rect = dpadRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    if (dist < 10) {
      setDpadActive(null);
      onInputChange({ left: false, right: false, up: false, down: false });
      return;
    }

    // Clamp visual knob
    const maxDist = rect.width * 0.42;
    const clampedDist = Math.min(dist, maxDist);
    const angle = Math.atan2(dy, dx);
    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;

    setDpadActive({ x: knobX, y: knobY });

    // Directional thresholds
    const deg = (angle * 180) / Math.PI;
    const right = deg > -67.5 && deg < 67.5;
    const left = deg > 112.5 || deg < -112.5;
    const down = deg > 22.5 && deg < 157.5;
    const up = deg < -22.5 && deg > -157.5;

    onInputChange({ left, right, up, down });
  };

  const handleDpadStart = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleDpadPointer(e.clientX, e.clientY);
  };

  const handleDpadMove = (e: React.PointerEvent) => {
    e.preventDefault();
    if (dpadActive !== null) {
      handleDpadPointer(e.clientX, e.clientY);
    }
  };

  const handleDpadEnd = (e: React.PointerEvent) => {
    e.preventDefault();
    setDpadActive(null);
    onInputChange({ left: false, right: false, up: false, down: false });
  };

  // Button press handler
  const setBtn = (btnName: keyof InputState, isPressed: boolean) => {
    setActiveButtons((prev) => ({ ...prev, [btnName]: isPressed }));
    onInputChange({ [btnName]: isPressed });
  };

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-30 select-none pb-2 sm:pb-4 px-3 sm:px-8 flex justify-between items-end touch-none">
      {/* Left Side: Floating 8-Way Virtual Arcade Stick / D-Pad */}
      <div className="pointer-events-auto flex flex-col items-center">
        <div
          ref={dpadRef}
          onPointerDown={handleDpadStart}
          onPointerMove={handleDpadMove}
          onPointerUp={handleDpadEnd}
          onPointerCancel={handleDpadEnd}
          className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-slate-950/85 border-3 border-amber-500/60 shadow-2xl relative flex items-center justify-center backdrop-blur-xs touch-none cursor-pointer"
        >
          {/* Directional Guide Arrows */}
          <div className="absolute top-1 text-amber-400/60 text-[10px] font-arcade">▲</div>
          <div className="absolute bottom-1 text-amber-400/60 text-[10px] font-arcade">▼</div>
          <div className="absolute left-2 text-amber-400/60 text-[10px] font-arcade">◀</div>
          <div className="absolute right-2 text-amber-400/60 text-[10px] font-arcade">▶</div>

          {/* D-Pad Base Ring */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border border-amber-500/30 flex items-center justify-center">
            {/* Movable Joystick Knob */}
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-400 via-amber-600 to-amber-700 border-2 border-amber-200 shadow-lg flex items-center justify-center transform transition-transform duration-75"
              style={{
                transform: dpadActive ? `translate(${dpadActive.x}px, ${dpadActive.y}px)` : 'none',
              }}
            >
              <div className="w-4 h-4 rounded-full bg-amber-200/50" />
            </div>
          </div>
        </div>
        <span className="font-arcade text-[9px] text-amber-400/70 mt-1 uppercase tracking-wider">
          STICK / GUARD
        </span>
      </div>

      {/* Right Side: 6-Button Arcade Fighter Layout */}
      <div className="pointer-events-auto flex flex-col items-end">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2.5">
          {/* Row 1: Punches & Super */}
          {/* Light Punch (LP) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('lp', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setBtn('lp', false);
            }}
            onPointerCancel={() => setBtn('lp', false)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-arcade text-xs font-bold shadow-lg transition-transform active:scale-90 flex flex-col items-center justify-center ${
              activeButtons['lp']
                ? 'bg-blue-400 text-black border-white translate-y-1'
                : 'bg-gradient-to-b from-blue-500 to-blue-700 text-white border-blue-300'
            }`}
          >
            <span>LP</span>
            <span className="text-[7px] text-blue-200">A / J</span>
          </button>

          {/* Heavy Punch (HP) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('hp', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setBtn('hp', false);
            }}
            onPointerCancel={() => setBtn('hp', false)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-arcade text-xs font-bold shadow-lg transition-transform active:scale-90 flex flex-col items-center justify-center ${
              activeButtons['hp']
                ? 'bg-indigo-400 text-black border-white translate-y-1'
                : 'bg-gradient-to-b from-indigo-600 to-indigo-800 text-white border-indigo-300'
            }`}
          >
            <span>HP</span>
            <span className="text-[7px] text-indigo-200">U</span>
          </button>

          {/* Super Art (SUP) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('superArt', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setBtn('superArt', false);
            }}
            onPointerCancel={() => setBtn('superArt', false)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-arcade text-xs font-bold shadow-xl transition-transform active:scale-90 flex flex-col items-center justify-center ${
              activeButtons['superArt']
                ? 'bg-amber-300 text-black border-white translate-y-1'
                : 'bg-gradient-to-b from-amber-500 via-orange-600 to-red-600 text-white border-amber-300 animate-pulse'
            }`}
          >
            <span>SUP</span>
            <span className="text-[7px] text-amber-200">O</span>
          </button>

          {/* Row 2: Kicks & Special */}
          {/* Light Kick (LK) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('lk', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setBtn('lk', false);
            }}
            onPointerCancel={() => setBtn('lk', false)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-arcade text-xs font-bold shadow-lg transition-transform active:scale-90 flex flex-col items-center justify-center ${
              activeButtons['lk']
                ? 'bg-emerald-400 text-black border-white translate-y-1'
                : 'bg-gradient-to-b from-emerald-500 to-emerald-700 text-white border-emerald-300'
            }`}
          >
            <span>LK</span>
            <span className="text-[7px] text-emerald-200">B / K</span>
          </button>

          {/* Heavy Kick (HK) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('hk', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setBtn('hk', false);
            }}
            onPointerCancel={() => setBtn('hk', false)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-arcade text-xs font-bold shadow-lg transition-transform active:scale-90 flex flex-col items-center justify-center ${
              activeButtons['hk']
                ? 'bg-teal-400 text-black border-white translate-y-1'
                : 'bg-gradient-to-b from-teal-600 to-teal-800 text-white border-teal-300'
            }`}
          >
            <span>HK</span>
            <span className="text-[7px] text-teal-200">I</span>
          </button>

          {/* Special Move (SP) */}
          <button
            onPointerDown={(e) => {
              e.preventDefault();
              setBtn('special', true);
            }}
            onPointerUp={(e) => {
              e.preventDefault();
              setBtn('special', false);
            }}
            onPointerCancel={() => setBtn('special', false)}
            className={`w-11 h-11 sm:w-14 sm:h-14 rounded-full border-2 font-arcade text-xs font-bold shadow-lg transition-transform active:scale-90 flex flex-col items-center justify-center ${
              activeButtons['special']
                ? 'bg-purple-400 text-black border-white translate-y-1'
                : 'bg-gradient-to-b from-purple-600 to-purple-800 text-white border-purple-300'
            }`}
          >
            <span>SP</span>
            <span className="text-[7px] text-purple-200">Y / L</span>
          </button>
        </div>

        <span className="font-arcade text-[9px] text-amber-400/70 mt-1 uppercase tracking-wider">
          ATTACK BUTTONS
        </span>
      </div>
    </div>
  );
};
