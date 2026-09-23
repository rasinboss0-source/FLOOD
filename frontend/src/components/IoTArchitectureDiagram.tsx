import React from 'react';
import { 
  Radio, Cpu, Server, Database, BrainCircuit, 
  LayoutDashboard, BellRing, Wifi, ShieldAlert, ArrowDown, ArrowRight 
} from 'lucide-react';

export const IoTArchitectureDiagram: React.FC = () => {
  const steps = [
    {
      title: 'Village Sensor Node',
      desc: 'Tipping Bucket • TDR Soil Sensor • JSN Ultrasonic Gauge',
      icon: Radio,
      badge: 'Physical Cadastre',
      color: 'border-sky-500/50 bg-sky-950/40 text-sky-400',
    },
    {
      title: 'Microcontroller (ESP32)',
      desc: 'Low-power telemetry encoding • Solar battery management',
      icon: Cpu,
      badge: 'Edge Device',
      color: 'border-blue-500/50 bg-blue-950/40 text-blue-400',
    },
    {
      title: 'LoRaWAN / GSM / 4G',
      desc: 'Long-range 868MHz packet forwarder • Fallback cellular',
      icon: Wifi,
      badge: 'Ghats Uplink',
      color: 'border-indigo-500/50 bg-indigo-950/40 text-indigo-400',
    },
    {
      title: 'Cloud Broker / MQTT',
      desc: 'High-throughput stream ingestion • Timeseries queue',
      icon: Server,
      badge: 'Data Broker',
      color: 'border-purple-500/50 bg-purple-950/40 text-purple-400',
    },
    {
      title: 'PostgreSQL / PostGIS',
      desc: 'Spatial cadastre join • 1,872 village polygons & features',
      icon: Database,
      badge: 'Geodatabase',
      color: 'border-emerald-500/50 bg-emerald-950/40 text-emerald-400',
    },
    {
      title: 'AI / ML Inference Engine',
      desc: 'XGBoost & Random Forest • SHAP feature explainability',
      icon: BrainCircuit,
      badge: 'Predictive Core',
      color: 'border-rose-500/50 bg-rose-950/40 text-rose-400',
    },
    {
      title: 'Web GIS Dashboard',
      desc: 'Hyperlocal 0–100 risk gauges • Interactive Leaflet layers',
      icon: LayoutDashboard,
      badge: 'DRR Operations',
      color: 'border-cyan-500/50 bg-cyan-950/40 text-cyan-400',
    },
    {
      title: 'Village Early Warning Dispatch',
      desc: 'Automated sirens • Panchayat SMS • Shelter evacuation SOPs',
      icon: BellRing,
      badge: 'Community Safety',
      color: 'border-amber-500/50 bg-amber-950/40 text-amber-400',
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            End-to-End Edge-to-Decision IoT & AI/ML Architecture
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Data pipeline bridging physical rain/stream telemetry from Western Ghats ridgelines to village disaster relief teams
          </p>
        </div>
        <span className="bg-blue-900/60 text-blue-300 border border-blue-600/50 px-2.5 py-1 rounded text-xs font-mono font-bold">
          SIH26192 Pipeline
        </span>
      </div>

      {/* Grid of Architecture Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 relative">
        {steps.map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className={`p-4 rounded-xl border ${st.color} shadow-lg flex flex-col justify-between relative group hover:scale-[1.02] transition-transform`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-lg bg-slate-900/80 border border-slate-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-900/60 px-2 py-0.5 rounded border border-slate-700">
                    {st.badge}
                  </span>
                </div>

                <div className="text-xs font-mono text-slate-400">Step {idx + 1}</div>
                <h4 className="text-sm font-bold text-white mt-0.5">{st.title}</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-end text-[10px] text-slate-400 font-mono">
                  <span>Next: Flow Data →</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <span className="flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-emerald-400" />
          Ultra-low latency inference: Sensor reading to dashboard alert latency &lt; 850 milliseconds
        </span>
        <span className="text-slate-500 font-mono text-[11px]">
          LoRa: 868 MHz ISM Band • MQTT: TLS 1.3 • API: FastAPI Async Engine
        </span>
      </div>
    </div>
  );
};
