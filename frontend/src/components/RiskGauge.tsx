import React from 'react';

interface RiskGaugeProps {
  score: number;
  level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY HIGH';
  floodProbability: number;
  predictionWindow: string;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  level,
  floodProbability,
  predictionWindow,
}) => {
  // Normalize score between 0 and 100
  const clampedScore = Math.min(100, Math.max(0, score));

  // Determine color scheme based on level
  const getColor = () => {
    switch (level) {
      case 'VERY HIGH':
        return {
          stroke: '#a855f7',
          fill: 'from-purple-500/20 to-purple-950/40',
          text: 'text-purple-400',
          border: 'border-purple-500/50',
          badge: 'bg-purple-900/60 text-purple-200 border-purple-500',
          pulse: 'animate-pulse'
        };
      case 'HIGH':
        return {
          stroke: '#ef4444',
          fill: 'from-red-500/20 to-red-950/40',
          text: 'text-red-400',
          border: 'border-red-500/50',
          badge: 'bg-red-900/60 text-red-200 border-red-500',
          pulse: 'animate-pulse'
        };
      case 'ELEVATED':
        return {
          stroke: '#f97316',
          fill: 'from-orange-500/20 to-orange-950/40',
          text: 'text-orange-400',
          border: 'border-orange-500/50',
          badge: 'bg-orange-900/60 text-orange-200 border-orange-500',
          pulse: ''
        };
      case 'MODERATE':
        return {
          stroke: '#f59e0b',
          fill: 'from-amber-500/20 to-amber-950/40',
          text: 'text-amber-400',
          border: 'border-amber-500/50',
          badge: 'bg-amber-900/60 text-amber-200 border-amber-500',
          pulse: ''
        };
      default:
        return {
          stroke: '#10b981',
          fill: 'from-emerald-500/20 to-emerald-950/40',
          text: 'text-emerald-400',
          border: 'border-emerald-500/50',
          badge: 'bg-emerald-900/60 text-emerald-200 border-emerald-500',
          pulse: ''
        };
    }
  };

  const scheme = getColor();

  // Semi-circle SVG math
  // Arc from -180 deg to 0 deg (left to right)
  const radius = 80;
  const circumference = Math.PI * radius; // Half-circle circumference
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={`relative p-6 rounded-2xl bg-gradient-to-b ${scheme.fill} border ${scheme.border} shadow-2xl flex flex-col items-center justify-center text-center backdrop-blur-sm`}>
      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        CURRENT FLASH FLOOD RISK
      </span>

      {/* SVG Arc Gauge */}
      <div className="relative w-56 h-32 flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 200 120" className="w-full h-full transform translate-y-3">
          {/* Background Track Arc */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke="#1e293b"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {/* Calibrated Color Bands (Subtle underlying reference) */}
          <path d="M 20,100 A 80,80 0 0,1 52,43" fill="none" stroke="#10b981" strokeWidth="4" opacity="0.3" />
          <path d="M 52,43 A 80,80 0 0,1 84,23" fill="none" stroke="#f59e0b" strokeWidth="4" opacity="0.3" />
          <path d="M 84,23 A 80,80 0 0,1 116,23" fill="none" stroke="#f97316" strokeWidth="4" opacity="0.3" />
          <path d="M 116,23 A 80,80 0 0,1 148,43" fill="none" stroke="#ef4444" strokeWidth="4" opacity="0.3" />
          <path d="M 148,43 A 80,80 0 0,1 180,100" fill="none" stroke="#a855f7" strokeWidth="4" opacity="0.3" />

          {/* Active Progress Arc */}
          <path
            d="M 20,100 A 80,80 0 0,1 180,100"
            fill="none"
            stroke={scheme.stroke}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center Score Display */}
        <div className="absolute top-10 flex flex-col items-center">
          <div className="flex items-baseline">
            <span className={`text-5xl font-black tracking-tight ${scheme.text} font-mono`}>
              {score}
            </span>
            <span className="text-sm font-semibold text-slate-400 ml-1">/ 100</span>
          </div>
        </div>
      </div>

      {/* Risk Category Badge */}
      <div className={`mt-2 px-4 py-1.5 rounded-full border text-sm font-black tracking-wider uppercase ${scheme.badge} ${scheme.pulse}`}>
        {level} RISK
      </div>

      {/* Secondary Meta: Flood Probability & Window */}
      <div className="grid grid-cols-2 gap-4 w-full mt-5 pt-4 border-t border-slate-700/60 text-xs">
        <div className="text-center">
          <span className="text-slate-400 block text-[11px]">Est. Flood Probability</span>
          <span className="font-bold text-white text-sm font-mono">{Math.round(floodProbability * 100)}%</span>
        </div>
        <div className="text-center">
          <span className="text-slate-400 block text-[11px]">Prediction Window</span>
          <span className="font-bold text-sky-400 text-sm">{predictionWindow}</span>
        </div>
      </div>

      {/* Threshold Guide */}
      <div className="flex items-center justify-between w-full mt-3 text-[10px] text-slate-400 px-1 font-mono">
        <span className="text-emerald-400">0-20 Low</span>
        <span className="text-amber-400">21-40 Mod</span>
        <span className="text-orange-400">41-60 Elev</span>
        <span className="text-red-400">61-80 High</span>
        <span className="text-purple-400">81-100 V.High</span>
      </div>
    </div>
  );
};
