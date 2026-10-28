import React, { useState } from 'react';
import { CharacterId, StageId, GameMode } from '../game/types';
import { CHARACTERS } from '../game/characterData';
import { arcadeAudio } from '../game/audio';
import { Swords, MapPin } from 'lucide-react';

interface CharacterSelectProps {
  mode: GameMode;
  onConfirm: (p1Char: CharacterId, p2Char: CharacterId, stage: StageId) => void;
  onBack: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ mode, onConfirm, onBack }) => {
  const [p1Char, setP1Char] = useState<CharacterId>('RYUGA');
  const [p2Char, setP2Char] = useState<CharacterId>('KAZUMA');
  const [selectedStage, setSelectedStage] = useState<StageId>('COURTYARD');
  const [selectingP2, setSelectingP2] = useState<boolean>(false);

  const charList: CharacterId[] = ['RYUGA', 'KAZUMA', 'SAKURA'];

  const stages: { id: StageId; name: string; desc: string }[] = [
    { id: 'COURTYARD', name: 'MOONLIT COURTYARD', desc: 'Suzaku Castle with fluttering cherry blossoms' },
    { id: 'NEON_ALLEY', name: 'NEON SHINJUKU', desc: 'Rain-soaked back alley with glowing signs' },
    { id: 'DOJO', name: 'GRAND DOJO', desc: 'Ancient martial arts hall with calligraphy banner' },
  ];

  const handleSelectChar = (id: CharacterId) => {
    arcadeAudio.playSwing(false);
    if (mode === 'VERSUS' && selectingP2) {
      setP2Char(id);
    } else {
      setP1Char(id);
      if (mode === 'VERSUS') {
        setSelectingP2(true);
      }
    }
  };

  const handleStartFight = () => {
    arcadeAudio.playRoundGong();
    onConfirm(p1Char, p2Char, selectedStage);
  };

  const p1Def = CHARACTERS[p1Char];
  const p2Def = CHARACTERS[p2Char];

  return (
    <div className="absolute inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-[#131127] to-slate-950 select-none overflow-y-auto">
      {/* Title */}
      <div className="flex items-center justify-between pb-2 border-b border-amber-500/40">
        <div className="flex items-center gap-2">
          <Swords className="w-5 h-5 text-amber-400" />
          <span className="font-arcade text-sm text-amber-300">SELECT YOUR FIGHTER</span>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-arcade text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700"
        >
          BACK
        </button>
      </div>

      {/* Main Selection Area */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center gap-6 py-4">
        {/* P1 Card */}
        <div className="w-full max-w-xs bg-slate-900/90 border-2 border-blue-500 rounded-lg p-4 shadow-xl flex flex-col items-center">
          <span className="px-2 py-0.5 bg-blue-600 text-white font-arcade text-[10px] rounded mb-2">PLAYER 1</span>
          <div className="font-arcade text-xl text-blue-400 font-bold mb-1">{p1Def.name}</div>
          <div className="text-slate-400 font-fighter text-base">{p1Def.title}</div>
          <div className="w-full h-28 my-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: p1Def.themeColor }}
            />
            <span className="font-arcade text-3xl font-bold" style={{ color: p1Def.themeColor }}>
              {p1Def.name[0]}
            </span>
          </div>
          <div className="w-full text-xs space-y-1.5 text-slate-300">
            <div>Style: <span className="text-white font-medium">{p1Def.style}</span></div>
            <div>Special: <span className="text-amber-300 font-medium">{p1Def.specialNames.projectile}</span></div>
            <div>Super: <span className="text-cyan-300 font-medium">{p1Def.specialNames.superArt}</span></div>
          </div>
        </div>

        {/* Character Selection Grid */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-3 gap-3">
            {charList.map((id) => {
              const c = CHARACTERS[id];
              const isP1 = p1Char === id;
              const isP2 = p2Char === id;

              return (
                <button
                  key={id}
                  onClick={() => handleSelectChar(id)}
                  className={`w-24 h-32 sm:w-28 sm:h-36 rounded-lg border-2 p-2 flex flex-col items-center justify-between transition-all cursor-pointer ${
                    isP1
                      ? 'border-blue-400 bg-blue-950/40 shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105'
                      : isP2
                      ? 'border-red-400 bg-red-950/40 shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105'
                      : 'border-slate-700 bg-slate-900/60 hover:border-slate-500'
                  }`}
                >
                  <div className="flex justify-between w-full text-[9px] font-arcade">
                    {isP1 && <span className="text-blue-400 font-bold">1P</span>}
                    {isP2 && <span className="text-red-400 font-bold ml-auto">2P</span>}
                  </div>
                  <div
                    className="w-12 h-12 rounded-full border-2 flex items-center justify-center font-arcade text-lg font-bold"
                    style={{ borderColor: c.themeColor, color: c.themeColor }}
                  >
                    {c.name[0]}
                  </div>
                  <span className="font-arcade text-[10px] text-white font-bold">{c.name}</span>
                </button>
              );
            })}
          </div>

          {/* Stage Selector */}
          <div className="mt-4 w-full max-w-md bg-slate-900/80 border border-slate-800 rounded p-3">
            <div className="flex items-center gap-1.5 font-arcade text-xs text-amber-400 mb-2">
              <MapPin className="w-3.5 h-3.5" />
              <span>BATTLE ARENA STAGE</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {stages.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    arcadeAudio.playSwing(false);
                    setSelectedStage(st.id);
                  }}
                  className={`p-2 rounded border text-center transition-all ${
                    selectedStage === st.id
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="font-arcade text-[9px] truncate">{st.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* P2 / CPU Card */}
        <div className="w-full max-w-xs bg-slate-900/90 border-2 border-red-500 rounded-lg p-4 shadow-xl flex flex-col items-center">
          <span className="px-2 py-0.5 bg-red-600 text-white font-arcade text-[10px] rounded mb-2">
            {mode === 'ARCADE' ? 'CPU OPPONENT' : 'PLAYER 2'}
          </span>
          <div className="font-arcade text-xl text-red-400 font-bold mb-1">{p2Def.name}</div>
          <div className="text-slate-400 font-fighter text-base">{p2Def.title}</div>
          <div className="w-full h-28 my-3 rounded bg-slate-950 border border-slate-800 flex items-center justify-center relative overflow-hidden">
            <div
              className="absolute inset-0 opacity-20"
              style={{ backgroundColor: p2Def.themeColor }}
            />
            <span className="font-arcade text-3xl font-bold" style={{ color: p2Def.themeColor }}>
              {p2Def.name[0]}
            </span>
          </div>
          <div className="w-full text-xs space-y-1.5 text-slate-300">
            <div>Style: <span className="text-white font-medium">{p2Def.style}</span></div>
            <div>Special: <span className="text-amber-300 font-medium">{p2Def.specialNames.projectile}</span></div>
            <div>Super: <span className="text-red-400 font-medium">{p2Def.specialNames.superArt}</span></div>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="flex justify-center pb-2">
        <button
          onClick={handleStartFight}
          className="px-10 py-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600 hover:from-red-500 hover:to-amber-400 text-white font-arcade text-sm font-bold tracking-widest rounded shadow-xl active:scale-95 transition-all cursor-pointer animate-pulse"
        >
          CONFIRM • BATTLE START!
        </button>
      </div>
    </div>
  );
};
