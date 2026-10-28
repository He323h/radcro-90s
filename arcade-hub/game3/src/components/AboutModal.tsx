/**
 * Blastar Reborn - Tactical Intel & About Modal
 */

import React from 'react';
import { X, Shield, Zap, Crosshair, Heart, Sparkles, Keyboard, Smartphone } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border-2 border-cyan-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-200 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-cyan-500/30">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 font-mono tracking-wider">
              TACTICAL INTEL // BLASTAR REBORN
            </h2>
            <p className="text-xs text-cyan-400 font-mono mt-0.5">
              GALACTIC DEFENSE CORPS ARCHIVES
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 py-4 text-xs sm:text-sm font-sans">
          {/* Mission Briefing */}
          <div>
            <h3 className="font-mono font-bold text-cyan-300 tracking-wide mb-1">
              MISSION BRIEFING
            </h3>
            <p className="text-slate-300 leading-relaxed">
              Inspired by the classic 1984 space arcade game <em>Blastar</em> originally written by Elon Musk,
              <strong> Blastar Reborn</strong> reimagines the arcade shooter with a modern 60 FPS HTML5 Canvas vector engine,
              multi-stage dynamic environments, tactical threats, and real-time Web Audio sound synthesis.
            </p>
          </div>

          {/* Controls Guide */}
          <div>
            <h3 className="font-mono font-bold text-amber-300 tracking-wide mb-2 flex items-center gap-2">
              <Crosshair className="w-4 h-4 text-amber-400" />
              FLIGHT CONTROLS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-cyan-300 font-bold mb-1">
                  <Keyboard className="w-4 h-4" /> KEYBOARD
                </div>
                <div className="text-slate-400">WASD / Arrow Keys: Move Ship</div>
                <div className="text-slate-400">Spacebar: Fire Lasers</div>
                <div className="text-slate-400">ESC: Pause / Resume</div>
              </div>

              <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5 text-amber-300 font-bold mb-1">
                  <Smartphone className="w-4 h-4" /> TOUCH / MOUSE
                </div>
                <div className="text-slate-400">Touch & Drag: Steer Ship</div>
                <div className="text-slate-400">Auto-Fire: Automatic Plasma</div>
                <div className="text-slate-400">Tap: Manual Firing Burst</div>
              </div>
            </div>
          </div>

          {/* Threat Roster */}
          <div>
            <h3 className="font-mono font-bold text-rose-400 tracking-wide mb-2">
              HOSTILE ENCOUNTER THREATS
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-start gap-2.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="w-3.5 h-3.5 rounded-xs bg-rose-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-rose-300 font-mono">MECHANICAL CRUISERS:</span>
                  <p className="text-slate-400">Armored hulls firing parallel red laser beams. Medium durability.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="w-3.5 h-3.5 rounded-xs bg-slate-300 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-slate-200 font-mono">SKULL HAZARDS:</span>
                  <p className="text-slate-400">Agile bio-cybernetic skulls with wide sine-wave swoops and targeted shots.</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <div className="w-3.5 h-3.5 rounded-xs bg-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-amber-300 font-mono">PLASMA ANOMALIES:</span>
                  <p className="text-slate-400">Swirling solar flares emitting 3-way radiant bursts. High drop rates!</p>
                </div>
              </div>
            </div>
          </div>

          {/* Salvage & Upgrades */}
          <div>
            <h3 className="font-mono font-bold text-cyan-300 tracking-wide mb-2">
              FIELD POWER-UPS
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <Heart className="w-4 h-4 text-pink-400 shrink-0" />
                <div>
                  <div className="font-bold text-pink-300 font-mono">HEART CORE</div>
                  <div className="text-slate-400">Restores +1 Lost Lifeline Heart or Shields</div>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <div className="font-bold text-cyan-300 font-mono">ENERGY ORB</div>
                  <div className="text-slate-400">Upgrades weapon spread to Level 4</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-lg font-mono text-xs tracking-wider transition-colors shadow-lg shadow-cyan-900/30"
          >
            CONFIRM & RETURN
          </button>
        </div>
      </div>
    </div>
  );
};
