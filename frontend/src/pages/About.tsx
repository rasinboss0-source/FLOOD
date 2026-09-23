import React from 'react';
import { Waves, Mountain, ShieldAlert, Cpu, Database, CheckCircle2, Award } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Title Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-3">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3.5 py-1 rounded-full text-xs font-bold font-mono">
          <Award className="w-4 h-4 text-blue-400" />
          SMART INDIA HACKATHON • PROBLEM STATEMENT SIH26192
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          Tamil Nadu Hyperlocal Flash Flood Early Warning System
        </h1>
        <p className="text-base sm:text-lg text-blue-400 font-semibold italic">
          "From District-Level Warnings to Village-Level Prediction."
        </p>
      </div>

      {/* The Core Differentiator */}
      <div className="bg-gradient-to-br from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-800/40 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Waves className="w-5 h-5 text-blue-400" />
          The Core Differentiator
        </h2>
        <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            Traditional flood warning mechanisms operate at the <b>district level</b>:
            <blockquote className="my-2 pl-4 border-l-2 border-red-500 text-red-300 font-mono text-xs">
              "The Nilgiris district is at flood risk."
            </blockquote>
            In rugged, mountainous terrain, rain bands can cause devastating cloudburst runoff on one mountain slope 
            while an adjacent valley just 4 kilometers away remains completely unaffected.
          </p>
          <p>
            Our platform solves this exact gap by performing granular administrative downscaling:
            <div className="my-3 py-3 px-4 bg-slate-950 rounded-lg border border-slate-800 font-mono text-center text-xs text-emerald-400 font-bold overflow-x-auto">
              Tamil Nadu ➔ Hilly District ➔ Sub-District / Taluk ➔ Village ➔ Hyperlocal Risk Assessment
            </div>
            Enabling state and district emergency disaster response managers to determine:
            <blockquote className="my-2 pl-4 border-l-2 border-emerald-500 text-emerald-300 font-mono text-xs">
              "Village Burliyar (Code: 635112) in Coonoor is currently at 88/100 VERY HIGH flash flood risk — dispatch warning to Ellithorai Panchayat."
            </blockquote>
          </p>
        </div>
      </div>

      {/* Official Master Dataset Compliance */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          Master Village Cadastre Integrity
        </h2>
        <div className="text-sm text-slate-300 space-y-3 leading-relaxed">
          <p>
            In strict compliance with SIH specifications:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b>Zero Invented Names:</b> Every single village name, village code, and LGD code is derived from official district gazetteers.</span>
            </li>
            <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b>1,872 Official Records:</b> The Nilgiris (183), Dindigul (425), Coimbatore (347), Theni (187), and Salem (730).</span>
            </li>
            <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b>Preserved PART / FULL:</b> Multiple Gram Panchayat relationships for PART-coverage entries are faithfully retained.</span>
            </li>
            <li className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><b>Reserve Forest (R.F.):</b> High-altitude catchment sanctuaries are mapped to their forest beats and downstream stream paths.</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Scientific Disclaimers & Ethics */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-3 text-xs text-slate-400">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
          Scientific Disclaimer & Regulatory Notice
        </h3>
        <p>
          This application represents a prototype research and demonstration platform developed for Smart India Hackathon. 
          Real-time sensor feeds and short-range forecast predictions shown in Demo Mode are calibrated simulations. 
          This system is designed for decision support and does not supersede emergency warnings issued by the Tamil Nadu 
          State Disaster Management Authority (TNSDMA), National Disaster Management Authority (NDMA), or India Meteorological Department (IMD).
        </p>
      </div>
    </div>
  );
};
