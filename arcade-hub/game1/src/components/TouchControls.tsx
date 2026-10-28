import React, { useRef, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown } from 'lucide-react';
import { InputState } from '../game/types';

interface TouchControlsProps {
  inputRef: React.MutableRefObject<InputState>;
  onTriggerActionJustPressed: (action: 'jump' | 'action' | 'dash') => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  inputRef,
  onTriggerActionJustPressed,
}) => {
  // Track active touches
  const touchMapRef = useRef<{ [touchId: number]: string }>({});

  const handleTouch = (key: string, isDown: boolean) => {
    if (key === 'left') inputRef.current.left = isDown;
    if (key === 'right') inputRef.current.right = isDown;
    if (key === 'up') inputRef.current.up = isDown;
    if (key === 'down') inputRef.current.down = isDown;

    if (key === 'jump') {
      inputRef.current.jump = isDown;
      if (isDown) {
        onTriggerActionJustPressed('jump');
      }
    }
    if (key === 'action') {
      inputRef.current.action = isDown;
      if (isDown) {
        onTriggerActionJustPressed('action');
      }
    }
    if (key === 'dash') {
      inputRef.current.dash = isDown;
      if (isDown) {
        onTriggerActionJustPressed('dash');
      }
    }

    if (isDown && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(10);
      } catch {
        // Ignore haptic errors
      }
    }
  };

  const createTouchHandlers = (key: string) => ({
    onTouchStart: (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        touchMapRef.current[touch.identifier] = key;
      }
      handleTouch(key, true);
    },
    onTouchEnd: (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        delete touchMapRef.current[touch.identifier];
      }
      handleTouch(key, false);
    },
    onTouchCancel: (e: React.TouchEvent) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        delete touchMapRef.current[touch.identifier];
      }
      handleTouch(key, false);
    },
    // Desktop mouse fallback
    onMouseDown: () => handleTouch(key, true),
    onMouseUp: () => handleTouch(key, false),
    onMouseLeave: () => handleTouch(key, false),
  });

  return (
    <div className="absolute inset-x-0 bottom-0 pointer-events-none z-30 select-none pb-4 sm:pb-6 px-3 sm:px-8 flex items-end justify-between">
      {/* --- Left Cluster: Retro GBA D-Pad --- */}
      <div className="pointer-events-auto touch-none select-none relative w-36 h-36 flex items-center justify-center">
        {/* D-Pad Cross Background */}
        <div className="absolute w-32 h-11 bg-slate-900/85 border border-slate-700/80 rounded-md shadow-lg" />
        <div className="absolute w-11 h-32 bg-slate-900/85 border border-slate-700/80 rounded-md shadow-lg" />
        <div className="absolute w-8 h-8 rounded-full bg-slate-800/90 border border-slate-700/60 z-10 pointer-events-none" />

        {/* Up Button */}
        <button
          {...createTouchHandlers('up')}
          aria-label="Up / Look Up"
          className="absolute top-0 w-11 h-11 rounded-t-md flex items-center justify-center text-slate-300 active:bg-slate-700 active:text-white transition-colors cursor-pointer z-20"
        >
          <ArrowUp className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Down Button */}
        <button
          {...createTouchHandlers('down')}
          aria-label="Down / Crouch"
          className="absolute bottom-0 w-11 h-11 rounded-b-md flex items-center justify-center text-slate-300 active:bg-slate-700 active:text-white transition-colors cursor-pointer z-20"
        >
          <ArrowDown className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Left Button */}
        <button
          {...createTouchHandlers('left')}
          aria-label="Move Left"
          className="absolute left-0 w-11 h-11 rounded-l-md flex items-center justify-center text-slate-300 active:bg-slate-700 active:text-white transition-colors cursor-pointer z-20"
        >
          <ArrowLeft className="w-5 h-5 pointer-events-none" />
        </button>

        {/* Right Button */}
        <button
          {...createTouchHandlers('right')}
          aria-label="Move Right"
          className="absolute right-0 w-11 h-11 rounded-r-md flex items-center justify-center text-slate-300 active:bg-slate-700 active:text-white transition-colors cursor-pointer z-20"
        >
          <ArrowRight className="w-5 h-5 pointer-events-none" />
        </button>
      </div>

      {/* --- Right Cluster: Retro Action Buttons (A, B, C) --- */}
      <div className="pointer-events-auto touch-none select-none relative w-48 h-36 flex items-center justify-end">
        {/* Angled button pod container */}
        <div className="relative flex items-center gap-3">
          {/* Button C: DASH / SPECIAL (Blue) */}
          <div className="flex flex-col items-center">
            <button
              {...createTouchHandlers('dash')}
              aria-label="Special / Dash"
              className="w-13 h-13 rounded-full bg-gradient-to-b from-sky-500 to-sky-700 active:from-sky-600 active:to-sky-800 border-2 border-sky-300/80 shadow-lg flex items-center justify-center text-white font-pixel text-xs active:scale-90 transition-transform cursor-pointer"
            >
              C
            </button>
            <span className="text-[9px] text-sky-300 font-pixel mt-1 tracking-tighter">DASH</span>
          </div>

          {/* Button B: RUN / SPIN / ATTACK (Red/Crimson) */}
          <div className="flex flex-col items-center mt-6">
            <button
              {...createTouchHandlers('action')}
              aria-label="Action / Spin Attack / Fireball"
              className="w-13 h-13 rounded-full bg-gradient-to-b from-rose-500 to-rose-700 active:from-rose-600 active:to-rose-800 border-2 border-rose-300/80 shadow-lg flex items-center justify-center text-white font-pixel text-xs active:scale-90 transition-transform cursor-pointer"
            >
              B
            </button>
            <span className="text-[9px] text-rose-300 font-pixel mt-1 tracking-tighter">ATTACK</span>
          </div>

          {/* Button A: JUMP (Amber/Gold) */}
          <div className="flex flex-col items-center -mt-6">
            <button
              {...createTouchHandlers('jump')}
              aria-label="Jump"
              className="w-14 h-14 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 active:from-amber-500 active:to-amber-700 border-2 border-amber-200 shadow-xl flex items-center justify-center text-slate-900 font-pixel text-sm font-bold active:scale-90 transition-transform cursor-pointer"
            >
              A
            </button>
            <span className="text-[9px] text-amber-300 font-pixel mt-1 tracking-tighter">JUMP</span>
          </div>
        </div>
      </div>
    </div>
  );
};
