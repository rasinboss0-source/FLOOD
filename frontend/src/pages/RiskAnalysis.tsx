import React from 'react';
import { 
  BrainCircuit, Database, ShieldAlert, Cpu, BarChart2, 
  Layers, ArrowDown, HelpCircle, AlertOctagon, CheckCircle2 
} from 'lucide-react';
import { IoTArchitectureDiagram } from '../components/IoTArchitectureDiagram';

export const RiskAnalysis: React.FC = () => {
  const pipelineSteps = [
    { title: '1. Multi-Source Ingestion', desc: 'Static DEM + IMD Rain + CWC River Stage + IoT TDR sensors', color: 'border-blue-500/40 bg-blue-950/30 text-blue-400' },
    { title: '2. Data Cleaning & QA', desc: 'Outlier rejection, sensor battery check, spatial interpolation', color: 'border-cyan-500/40 bg-cyan-950/30 text-cyan-400' },
    { title: '3. Feature Engineering', desc: 'Runoff coefficient, cumulative 24h index, antecedent soil index (ASI)', color: 'border-indigo-500/40 bg-indigo-950/30 text-indigo-400' },
    { title: '4. AI / ML Predictive Model', desc: 'Gradient boosted trees (XGBoost / LightGBM) calibrated on hilly terrain', color: 'border-purple-500/40 bg-purple-950/30 text-purple-400' },
    { title: '5. Calibrated Risk Score', desc: 'Normalized 0–100 scale & probabilistic confidence bounds', color: 'border-rose-500/40 bg-rose-950/30 text-rose-400' },
    { title: '6. Hyperlocal Warning Dispatch', desc: 'Automated siren trigger & village panchayat evacuation protocol', color: 'border-amber-500/40 bg-amber-950/30 text-amber-400' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-purple-400" />
          AI / ML Flash Flood Predictive Engine Architecture
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Combining geomorphology, meteorological radar, stream dynamics, and in-situ IoT telemetry
        </p>
      </div>

      {/* Model Performance - Strict SIH Compliance Section */}
      <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-start justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500/20 text-amber-400">
                <AlertOctagon className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-white">
                Model Performance & Historical Validation
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ethical AI Standard: Machine learning metrics are only presented when verified against peer-reviewed historical ground-truth data.
            </p>
          </div>
          <span className="bg-slate-800 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded text-xs font-mono font-bold">
            VALIDATION BENCH
          </span>
        </div>

        {/* Not Available Grid as explicitly requested in Section 30 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 mt-5">
          {[
            { metric: 'ROC-AUC', val: 'Not Available' },
            { metric: 'Precision', val: 'Not Available' },
            { metric: 'Recall', val: 'Not Available' },
            { metric: 'F1 Score', val: 'Not Available' },
            { metric: 'False Alarm Rate', val: 'Not Available' },
            { metric: 'Lead Time', val: 'Not Available' },
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-850/80 border border-slate-800 rounded-lg p-3 text-center">
              <span className="text-xs font-bold text-slate-400 block">{item.metric}</span>
              <span className="text-xs font-mono font-bold text-amber-400/90 mt-1 block">
                {item.val}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200/90 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-amber-300">
            <HelpCircle className="w-4 h-4" />
            Mandatory Scientific Benchmark Notice (SIH Guidelines):
          </div>
          <p>
            Connect or upload validated historical event datasets from the State Disaster Management Authority or Central Water Commission (CWC) to compute verified model performance. 
            <b> This prototype platform strictly adheres to scientific integrity and does NOT fabricate synthetic ML accuracy percentages.</b>
          </p>
        </div>
      </div>

      {/* ML Pipeline Flow Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-400" />
          End-to-End AI / ML Flash Flood Inference Pipeline
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pipelineSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${step.color} shadow flex flex-col justify-between`}
            >
              <div>
                <h4 className="text-sm font-bold text-white">{step.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{step.desc}</p>
              </div>
              <div className="mt-3 text-[10px] text-slate-400 font-mono">
                Component #{idx + 1}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual IoT Architecture */}
      <IoTArchitectureDiagram />
    </div>
  );
};
