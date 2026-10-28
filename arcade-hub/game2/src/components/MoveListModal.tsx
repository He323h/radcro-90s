import React, { useState } from 'react';
import { CharacterId } from '../game/types';
import { CHARACTERS } from '../game/characterData';
import { X, BookOpen, Flame, Shield, Zap } from 'lucide-react';

interface MoveListModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedChar: CharacterId;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({ isOpen, onClose, selectedChar }) => {
  const [activeTab, setActiveTab] = useState<CharacterId>(selectedChar);

  if (!isOpen) return null;

  const char = CHARACTERS[activeTab];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500 rounded-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-slate-950 border-b border-amber-500/50">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span className="font-arcade text-sm text-amber-300 tracking-wider">COMMAND LIST & GUIDE</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-sm hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Character Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50">
          {(['RYUGA', 'KAZUMA', 'SAKURA'] as CharacterId[]).map((cid) => {
            const c = CHARACTERS[cid];
            const isActive = activeTab === cid;
            return (
              <button
                key={cid}
                onClick={() => setActiveTab(cid)}
                className={`flex-1 py-2.5 px-2 font-arcade text-xs tracking-wider transition-colors flex items-center justify-center gap-1.5 ${
                  isActive
                    ? 'text-amber-400 border-b-2 border-amber-400 bg-amber-400/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Character Profile Banner */}
          <div className="flex items-center justify-between p-3 bg-slate-950/80 rounded border border-slate-800">
            <div>
              <div className="font-arcade text-base text-amber-300">{char.name}</div>
              <div className="text-slate-400 font-fighter text-sm tracking-wide">{char.title} • {char.style}</div>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>Country: <span className="text-white">{char.country}</span></div>
              <div>Health: <span className="text-emerald-400">{char.maxHealth}</span></div>
            </div>
          </div>

          {/* Special Moves Section */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 font-arcade text-xs text-amber-400">
              <Flame className="w-4 h-4 text-orange-400" />
              <span>SPECIAL MOVES</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* Projectile */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-amber-300 font-bold mb-1">{char.specialNames.projectile}</div>
                <div className="text-slate-400 text-[11px] mb-1.5">Long-range energy projectile blast</div>
                <div className="inline-block px-2 py-0.5 bg-blue-900/60 border border-blue-500 rounded text-cyan-300 font-arcade text-[10px]">
                  [SP] or ↓ ↘ → + P
                </div>
              </div>

              {/* Anti-Air Dragon Punch */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-amber-300 font-bold mb-1">{char.specialNames.antiAir}</div>
                <div className="text-slate-400 text-[11px] mb-1.5">Invincible rising anti-air strike</div>
                <div className="inline-block px-2 py-0.5 bg-blue-900/60 border border-blue-500 rounded text-cyan-300 font-arcade text-[10px]">
                  [↑ + SP] or → ↓ ↘ + P
                </div>
              </div>

              {/* Special 3: Whirlwind Kick or Slide */}
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <div className="text-amber-300 font-bold mb-1">{char.specialNames.special3}</div>
                <div className="text-slate-400 text-[11px] mb-1.5">Multi-hit forward advancing assault</div>
                <div className="inline-block px-2 py-0.5 bg-blue-900/60 border border-blue-500 rounded text-cyan-300 font-arcade text-[10px]">
                  [↓ + SP] or ↓ ↙ ← + K
                </div>
              </div>

              {/* Super Art */}
              <div className="p-2.5 bg-amber-950/40 rounded border border-amber-500/50">
                <div className="text-amber-300 font-bold mb-1 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-yellow-400" />
                  <span>{char.specialNames.superArt}</span>
                </div>
                <div className="text-amber-200/80 text-[11px] mb-1.5">Devastating cinematic super (Requires 100% Meter)</div>
                <div className="inline-block px-2 py-0.5 bg-amber-600/50 border border-amber-400 rounded text-yellow-200 font-arcade text-[10px] animate-pulse">
                  [SUP] or O
                </div>
              </div>
            </div>
          </div>

          {/* Basic Controls & Defense Guide */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center gap-1.5 font-arcade text-xs text-amber-400">
              <Shield className="w-4 h-4 text-sky-400" />
              <span>DEFENSE & COMBAT TACTICS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-300">
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">High Guard:</span> Hold [Back] (A or Left). Blocks high punches, kicks, and jump-ins. Vulnerable to low sweeps.
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">Low Guard:</span> Hold [Down-Back] (S+A or Down+Left). Blocks low sweeps and mid attacks. Vulnerable to jump-ins.
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">Low Sweep Knockdown:</span> Press [Down + HK]. Trips opponent onto the floor for hard knockdown!
              </div>
              <div className="p-2 bg-slate-950/60 rounded border border-slate-800">
                <span className="text-amber-300 font-bold">Combo Cancels:</span> Connect with a normal attack (e.g. Light Punch or Heavy Kick) and immediately press [SP] to cancel into a Special Move!
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold rounded shadow-md transition-colors"
          >
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};
