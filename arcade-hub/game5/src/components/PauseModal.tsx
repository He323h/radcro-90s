import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  isMuted,
  onToggleMute,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-sm bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-6 text-center shadow-2xl flex flex-col items-center">
        <h2 className="font-pixel text-2xl text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.5)] mb-6 tracking-wider">
          PAUSED
        </h2>

        <div className="w-full flex flex-col gap-3 font-pixel text-xs">
          {/* Resume */}
          <button
            onClick={onResume}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>RESUME RACE</span>
          </button>

          {/* Home / Change Mode */}
          <button
            onClick={onHome}
            className="w-full py-3 bg-blue-900/90 hover:bg-blue-800 text-white rounded-xl border border-blue-500 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.3)]"
          >
            <Home className="w-4 h-4 text-cyan-300" />
            <span>HOME / CHANGE MODES</span>
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-xl border border-neutral-700 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span>{isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}</span>
          </button>

          {/* Restart */}
          <button
            onClick={onRestart}
            className="w-full py-3 bg-neutral-800 hover:bg-red-900/60 text-red-300 rounded-xl border border-neutral-700 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART GAME</span>
          </button>
        </div>

        <p className="mt-5 font-racing text-xs text-neutral-400">
          Press <span className="text-white font-bold">Esc</span> or <span className="text-white font-bold">P</span> to resume
        </p>
      </div>
    </div>
  );
};
