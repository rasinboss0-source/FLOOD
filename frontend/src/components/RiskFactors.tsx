import React from 'react';
import { ShapFactor } from '../types';
import { HelpCircle, Sparkles } from 'lucide-react';

interface RiskFactorsProps {
  factors: ShapFactor[];
  modelVersion?: string;
}

export const RiskFactors: React.FC<RiskFactorsProps> = ({
  factors,
  modelVersion = "XGBoost-FlashFlood-TN-v2.4"
}) => {
  const getBadgeClass = (contrib: string) => {
    switch (contrib) {
      case 'VERY HIGH':
        return 'bg-purple-900/60 text-purple-300 border-purple-600';
      case 'HIGH':
        return 'bg-red-900/60 text-red-300 border-red-600';
      case 'MODERATE':
        return 'bg-amber-900/60 text-amber-300 border-amber-600';
      default:
        return 'bg-emerald-900/60 text-emerald-300 border-emerald-600';
    }
  };

  const getBarColor = (contrib: string) => {
    switch (contrib) {
      case 'VERY HIGH':
        return 'bg-gradient-to-r from-purple-600 to-purple-400';
      case 'HIGH':
        return 'bg-gradient-to-r from-red-600 to-red-400';
      case 'MODERATE':
        return 'bg-gradient-to-r from-amber-600 to-amber-400';
      default:
        return 'bg-gradient-to-r from-emerald-600 to-emerald-400';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-400" />
            AI / ML Risk Contributors (SHAP Explainability)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Why is this particular village at flash flood risk?
          </p>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
          {modelVersion}
        </span>
      </div>

      <div className="space-y-3.5 mt-4">
        {factors.map((item, idx) => {
          // Normalize weight to a percentage width (max single contribution around 32%)
          const widthPct = Math.min(100, Math.max(8, (item.weight / 32) * 100));

          return (
            <div key={idx} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  {item.factor}
                  <span className="text-slate-400 font-mono text-[11px]">({item.val})</span>
                </span>
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border ${getBadgeClass(item.contribution)}`}>
                  {item.contribution}
                </span>
              </div>

              {/* Graphical Attribution Bar */}
              <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden p-0.5">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(item.contribution)}`}
                  style={{ width: `${widthPct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-slate-400" />
          Feature attribution via TreeSHAP (Lundberg et al.)
        </span>
        <span className="text-amber-400/90 font-medium">
          Illustrative / Simulated Feature Contribution
        </span>
      </div>
    </div>
  );
};
