import React from 'react';
import { AlertTriangle, ShieldCheck, Database } from 'lucide-react';

export const DisclaimerBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-amber-950/70 via-slate-900 to-blue-950/70 border-b border-amber-500/30 text-xs px-4 py-2 text-slate-300 flex flex-wrap items-center justify-between gap-2 shadow-inner">
      <div className="flex items-center gap-2">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
        </span>
        <span className="font-semibold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
          Prototype Warning System • Demo / Simulated Data Mode
        </span>
        <span className="hidden md:inline text-slate-400 text-[11px]">|</span>
        <span className="hidden md:inline text-slate-400 text-[11px]">
          Follow official protocols from authorized authorities (TNSDMA / NDMA / CWC). Do not treat prototype predictions as official government warnings.
        </span>
      </div>
      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span className="flex items-center gap-1 text-emerald-400 font-medium">
          <Database className="w-3 h-3" />
          1,872 Official Cadastre Records Connected
        </span>
        <span className="bg-blue-950/80 text-blue-300 border border-blue-700/40 px-2 py-0.5 rounded text-[10px] font-mono">
          SIH-26192
        </span>
      </div>
    </div>
  );
};
