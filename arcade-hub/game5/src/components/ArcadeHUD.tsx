import React from 'react';
import { Volume2, VolumeX, Pause, Skull, Zap, Shield, AlertTriangle, Home } from 'lucide-react';
import { GameTelemetry } from '../game/RoadFighterGame';

interface ArcadeHUDProps {
  telemetry: GameTelemetry;
  isMuted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onCycleWeather: () => void;
  onHome: () => void;
}

export const ArcadeHUD: React.FC<ArcadeHUDProps> = ({
  telemetry,
  isMuted,
  onToggleMute,
  onPause,
  onCycleWeather,
  onHome,
}) => {
  const { 
    score, 
    hiScore, 
    speedKmH, 
    fuel, 
    distanceMeters, 
    totalDistance, 
    themeName, 
    weather,
    weatherName,
    weaponLevel,
    skidNotice, 
    isBoost,
    takedowns,
    comboCount,
    isAirborne,
    hasShieldRam,
    bossActive
  } = telemetry;

  // Format 6-digit score
  const scoreStr = score.toString().padStart(6, '0');
  const hiScoreStr = hiScore.toString().padStart(6, '0');

  // Fuel bar coloring and warning
  const isLowFuel = fuel <= 20;
  const fuelPercent = Math.max(0, Math.min(100, fuel));

  // Speedometer ratio (0 to 360)
  const speedRatio = Math.min(1.0, speedKmH / 360);

  // Track progress (0 to 1)
  const progressRatio = Math.min(1.0, distanceMeters / totalDistance);

  return (
    <>
      {/* ================= TOP HUD BAR ================= */}
      <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none px-3 py-2 sm:px-6 sm:py-3 bg-gradient-to-b from-black/90 via-black/70 to-transparent">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4 font-racing">
          
          {/* Left Zone: Score Counter & Takedown Stats */}
          <div className="flex flex-col">
            <div className="flex items-center gap-2 text-xs sm:text-sm text-amber-400 font-pixel tracking-wider">
              <span className="text-neutral-400">SCORE</span>
              <span className="tabular-nums font-bold text-yellow-300 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]">
                {scoreStr}
              </span>
            </div>
            
            <div className="flex items-center gap-2 text-[10px] sm:text-xs text-neutral-400 font-pixel mt-0.5">
              <span>HI</span>
              <span className="tabular-nums text-neutral-200">{hiScoreStr}</span>
              
              {/* Takedown Counter */}
              <span className="text-neutral-500">·</span>
              <div className="flex items-center gap-1 text-red-400 font-pixel">
                <Skull className="w-3 h-3 text-red-400" />
                <span className="tabular-nums">{takedowns}</span>
              </div>

              {/* Combo Multiplier */}
              {comboCount > 1 && (
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/60 px-1 rounded text-[9px] animate-pulse">
                  x{comboCount}
                </span>
              )}
            </div>
          </div>

          {/* Center Zone: Live Speedometer Display in Km/h */}
          <div className="flex flex-col items-center">
            <div className="flex items-baseline gap-1">
              <span 
                className={`font-pixel font-bold text-lg sm:text-2xl tabular-nums ${
                  isBoost 
                    ? 'text-cyan-400 drop-shadow-[0_0_12px_rgba(56,189,248,0.8)]' 
                    : speedKmH > 300 
                    ? 'text-red-400 drop-shadow-[0_0_8px_rgba(239,68,68,0.7)]' 
                    : 'text-white'
                }`}
              >
                {speedKmH}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-neutral-400 uppercase tracking-wider">
                Km/h
              </span>
            </div>

            {/* Speed Gauge Meter */}
            <div className="w-24 sm:w-36 h-2 bg-neutral-900 border border-neutral-700 rounded-sm overflow-hidden p-[1px] mt-0.5">
              <div 
                className={`h-full transition-all duration-75 ${
                  isBoost
                    ? 'bg-gradient-to-r from-blue-500 via-cyan-400 to-white animate-pulse'
                    : speedKmH > 300
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                }`}
                style={{ width: `${speedRatio * 100}%` }}
              />
            </div>
          </div>

          {/* Right Zone: Fuel Meter Bar, Active Power-ups & Pause */}
          <div className="flex items-center gap-2 sm:gap-4 pointer-events-auto">
            {/* Weapon Level Badge */}
            <div className="flex items-center gap-1 bg-violet-950/80 border border-violet-400 text-violet-300 font-pixel text-[9px] px-2 py-0.5 rounded shadow-[0_0_8px_rgba(168,85,247,0.4)]">
              <span>🔫</span>
              <span>{weaponLevel === 3 ? 'HYPER III' : weaponLevel === 2 ? 'PLASMA II' : 'LASER I'}</span>
            </div>

            {/* Weather Mode Toggle Pill */}
            <button
              onClick={onCycleWeather}
              className="flex items-center gap-1 bg-sky-950/80 hover:bg-sky-900 border border-sky-400/80 text-sky-200 font-pixel text-[9px] px-2 py-1 rounded transition-colors shadow-[0_0_8px_rgba(56,189,248,0.3)] cursor-pointer"
              title="Click or press 'T' to cycle Weather (Summer, Winter, Sunrise, Rain)"
              aria-label="Cycle Weather Mode"
            >
              <span>{weather === 'winter' ? '❄️' : weather === 'rain' ? '🌧️' : weather === 'sunrise' ? '🌅' : '☀️'}</span>
              <span className="hidden sm:inline uppercase">{weatherName}</span>
            </button>

            {/* Active Ram / Stunt Badges */}
            <div className="hidden sm:flex items-center gap-1.5">
              {hasShieldRam && (
                <div className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-400 text-cyan-300 font-pixel text-[9px] px-2 py-0.5 rounded animate-pulse">
                  <Shield className="w-3 h-3 text-cyan-300" />
                  <span>RAM</span>
                </div>
              )}
              {isAirborne && (
                <div className="flex items-center gap-1 bg-yellow-950/80 border border-yellow-400 text-yellow-300 font-pixel text-[9px] px-2 py-0.5 rounded animate-bounce">
                  <Zap className="w-3 h-3 text-yellow-300" />
                  <span>AIR</span>
                </div>
              )}
            </div>

            {/* Fuel Gauge */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 text-xs font-pixel">
                <span className={`text-[10px] sm:text-xs ${isLowFuel ? 'text-red-500 font-bold animate-pulse' : 'text-emerald-400'}`}>
                  {isLowFuel ? 'LOW FUEL!' : 'FUEL'}
                </span>
                <span className="tabular-nums text-white text-[11px] sm:text-xs font-bold">
                  {fuelPercent}%
                </span>
              </div>

              {/* Segmented Fuel Bar */}
              <div className="w-20 sm:w-28 h-3 bg-neutral-900 border border-neutral-700 rounded-sm p-[1px] mt-0.5 flex items-center">
                <div
                  className={`h-full rounded-xs transition-all duration-100 ${
                    isLowFuel 
                      ? 'bg-red-600 animate-pulse' 
                      : fuelPercent > 50 
                      ? 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                      : 'bg-amber-400'
                  }`}
                  style={{ width: `${fuelPercent}%` }}
                />
              </div>
            </div>

            {/* Mute Toggle */}
            <button
              onClick={onToggleMute}
              className="p-1.5 sm:p-2 rounded bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
              aria-label="Toggle Audio"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Home Screen Button */}
            <button
              onClick={onHome}
              className="flex items-center gap-1 p-1.5 sm:px-2.5 sm:py-1.5 rounded bg-blue-950/90 hover:bg-blue-900 text-blue-300 hover:text-white border border-blue-500/80 transition-colors font-pixel text-[10px] shadow-[0_0_10px_rgba(59,130,246,0.4)] cursor-pointer active:scale-95"
              title="Return to Home Screen to Select Modes"
              aria-label="Home / Modes"
            >
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-300" />
              <span className="hidden sm:inline">HOME</span>
            </button>

            {/* Pause Button */}
            <button
              onClick={onPause}
              className="p-1.5 sm:p-2 rounded bg-neutral-900/80 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-700 transition-colors cursor-pointer active:scale-95"
              title="Pause Game (Esc / P)"
              aria-label="Pause Game"
            >
              <Pause className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* ================= BOSS WARNING BANNER ================= */}
      {bossActive && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-2 bg-red-950/90 border-2 border-red-500 px-4 py-1.5 rounded-full shadow-[0_0_20px_rgba(239,68,68,0.7)] animate-pulse">
          <AlertTriangle className="w-4 h-4 text-yellow-400" />
          <span className="font-pixel text-[11px] text-white tracking-wider">
            BOSS WAR TANKER AHEAD! RAM ITS SIDES!
          </span>
        </div>
      )}

      {/* ================= LEFT MARGIN: TRACK PROGRESS MINI-MAP ================= */}
      <aside 
        className="absolute left-2 sm:left-4 top-20 bottom-24 z-10 pointer-events-none flex flex-col items-center justify-between"
        aria-label="Track Progress"
      >
        {/* Environment Theme Pill */}
        <div className="bg-black/80 backdrop-blur-xs border border-neutral-700 px-2 py-1 rounded text-[10px] font-pixel text-yellow-400 uppercase tracking-tighter mb-2 text-center max-w-[90px] truncate">
          {themeName}
        </div>

        {/* Vertical Track Progress Bar */}
        <div className="relative w-4 sm:w-5 flex-1 bg-neutral-950/90 border border-neutral-700 rounded-full overflow-hidden flex flex-col justify-end p-[2px]">
          <div className="absolute inset-0 flex flex-col opacity-40">
            <div className="flex-1 bg-zinc-600" title="Cargo Port (Goal)" />
            <div className="flex-1 bg-emerald-600" title="Tropical Beach" />
            <div className="flex-1 bg-amber-600" title="Desert Canyon" />
            <div className="flex-1 bg-sky-600" title="Sea Bridge" />
            <div className="flex-1 bg-green-600" title="Suburban Town" />
          </div>

          <div className="absolute top-1 left-0 right-0 text-center font-pixel text-[8px] text-yellow-300">
            🏁
          </div>

          <div className="absolute top-[20%] left-0 right-0 h-[1px] bg-white/60" />
          <div className="absolute top-[40%] left-0 right-0 h-[1px] bg-white/60" />
          <div className="absolute top-[60%] left-0 right-0 h-[1px] bg-white/60" />
          <div className="absolute top-[80%] left-0 right-0 h-[1px] bg-white/60" />

          {/* Player position car marker */}
          <div 
            className="absolute left-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-blue-500 border border-white rounded-full shadow-[0_0_8px_#3b82f6] transition-all duration-100 flex items-center justify-center animate-pulse"
            style={{ bottom: `${progressRatio * 90 + 3}%` }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
        </div>

        <div className="mt-2 text-[9px] sm:text-[10px] font-pixel text-neutral-300 bg-black/80 px-1.5 py-0.5 rounded border border-neutral-700 tabular-nums">
          {(distanceMeters / 1000).toFixed(1)}k
        </div>
      </aside>

      {/* ================= FISHTAIL RECOVERY TELEMETRY BANNER ================= */}
      {skidNotice !== 'none' && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-bounce">
          {skidNotice === 'recovered' ? (
            <div className="bg-emerald-600 text-white font-pixel text-xs sm:text-sm px-4 py-2 rounded shadow-lg border border-emerald-400">
              ★ RECOVERY! +150 PTS ★
            </div>
          ) : (
            <div className="bg-red-600 text-white font-pixel text-xs sm:text-sm px-4 py-2 rounded shadow-lg border-2 border-yellow-300 animate-pulse">
              {skidNotice === 'left' ? '◀ COUNTER-STEER LEFT!' : 'COUNTER-STEER RIGHT! ▶'}
            </div>
          )}
        </div>
      )}
    </>
  );
};
