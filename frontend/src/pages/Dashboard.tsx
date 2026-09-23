import React from 'react';
import { 
  Mountain, Home, AlertTriangle, Radio, Activity, Waves, 
  MapPin, ShieldAlert, ArrowRight, Zap, Database, TrendingUp
} from 'lucide-react';
import { DashboardCard } from '../components/DashboardCard';
import { RiskMap } from '../components/RiskMap';
import { Village, DistrictSummary } from '../types';

interface DashboardProps {
  villages: Village[];
  districts: DistrictSummary[];
  onSelectVillage: (village: Village) => void;
  onNavigateTab: (tab: string) => void;
  onStartDemoScenario: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  villages,
  districts,
  onSelectVillage,
  onNavigateTab,
  onStartDemoScenario,
}) => {
  // Aggregate system KPIs
  const totalVillages = villages.length;
  const highRiskVillages = villages.filter(v => v.risk.risk_level === 'HIGH');
  const veryHighRiskVillages = villages.filter(v => v.risk.risk_level === 'VERY HIGH');
  const activeAlerts = villages.filter(v => v.risk.alert_status === 'ACTIVE');
  const onlineSensors = villages.reduce((acc, v) => acc + v.sensors.filter(s => s.status === 'ONLINE').length, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner / SIH Differentiator Hero */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-blue-800/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 border border-blue-500/30 px-3 py-1 rounded-full text-xs font-bold font-mono mb-3">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-400" />
              SMART INDIA HACKATHON 2024 / 2026 • PROBLEM SIH26192
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Tamil Nadu Hyperlocal Flash Flood Early Warning System
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              Moving beyond broad district-level alerts to <b>village-level prediction</b> in steep hilly terrain. 
              Connecting <b>1,872 official cadastre records</b> across The Nilgiris, Dindigul, Coimbatore, Theni, and Salem 
              with real-time terrain geomorphology, rainfall accumulation, IoT sensors, and calibrated AI/ML inference.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStartDemoScenario}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-600 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-orange-950/60 flex items-center justify-center gap-2 transform active:scale-95 transition-all"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span>Launch 2-Min SIH Cloudburst Scenario</span>
            </button>
            <button
              onClick={() => onNavigateTab('livemap')}
              className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
            >
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>Open GIS Live Map</span>
            </button>
          </div>
        </div>

        {/* Background glow decoration */}
        <div className="absolute right-0 top-0 -mt-10 -mr-10 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <DashboardCard
          title="Hilly Districts"
          value={districts.length || 5}
          subtitle="Western & Eastern Ghats"
          icon={Mountain}
          colorScheme="blue"
          onClick={() => onNavigateTab('districts')}
          badge="Scope"
        />
        <DashboardCard
          title="Monitored Villages"
          value={totalVillages}
          subtitle="Official Master Cadastre"
          icon={Home}
          colorScheme="emerald"
          onClick={() => onNavigateTab('villages')}
          badge="Active"
        />
        <DashboardCard
          title="High Risk Villages"
          value={highRiskVillages.length}
          subtitle="Score 61–80 (Red Alert)"
          icon={AlertTriangle}
          colorScheme="orange"
          onClick={() => onNavigateTab('villages')}
        />
        <DashboardCard
          title="Very High Risk"
          value={veryHighRiskVillages.length}
          subtitle="Score 81–100 (Severe)"
          icon={ShieldAlert}
          colorScheme="purple"
          onClick={() => onNavigateTab('villages')}
          badge="Critical"
        />
        <DashboardCard
          title="Active Alerts"
          value={activeAlerts.length}
          subtitle="Evacuation SOP Triggered"
          icon={Activity}
          colorScheme="red"
          onClick={() => onNavigateTab('alerts')}
        />
        <DashboardCard
          title="Online IoT Sensors"
          value={onlineSensors}
          subtitle="LoRa / 4G Solar Nodes"
          icon={Radio}
          colorScheme="blue"
          onClick={() => onNavigateTab('sensors')}
          badge="Live"
        />
      </div>

      {/* Main Grid: Live Map Preview + Critical Alerts Ticker */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Interactive Leaflet Map Preview */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-blue-400" />
              Tamil Nadu Hilly Districts — Hyperlocal GIS Risk Map
            </h3>
            <button
              onClick={() => onNavigateTab('livemap')}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-semibold"
            >
              <span>Expand Fullscreen</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <RiskMap
            villages={villages}
            onSelectVillage={onSelectVillage}
            className="h-[440px]"
          />
        </div>

        {/* Right Col: High-Risk Villages Immediate Watchlist */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  High Risk Villages Priority Watchlist
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Villages requiring immediate attention
                </p>
              </div>
              <span className="bg-red-950 text-red-300 border border-red-700/60 px-2 py-0.5 rounded text-[10px] font-bold">
                {veryHighRiskVillages.length + highRiskVillages.length} Villages
              </span>
            </div>

            <div className="space-y-2.5 mt-4 max-h-[380px] overflow-y-auto pr-1">
              {[...veryHighRiskVillages, ...highRiskVillages].slice(0, 7).map((v) => (
                <div
                  key={v.id}
                  onClick={() => onSelectVillage(v)}
                  className="bg-slate-800/70 border border-slate-700/70 hover:border-blue-500/80 rounded-lg p-3 cursor-pointer transition-all hover:bg-slate-800 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors">
                        {v.village_name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {v.sub_district}, {v.district}
                      </div>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                      v.risk.risk_level === 'VERY HIGH'
                        ? 'bg-purple-950 text-purple-300 border-purple-600'
                        : 'bg-red-950 text-red-300 border-red-600'
                    }`}>
                      {v.risk.risk_score} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-slate-700/50 text-[10px] text-slate-300 font-mono">
                    <div>Rain: <b className="text-sky-400">{v.live.rainfall_1h_mm}mm/h</b></div>
                    <div>Soil: <b className="text-emerald-400">{v.live.soil_moisture_pct}%</b></div>
                    <div>Water: <b className="text-cyan-400">{v.live.water_level_m}m</b></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Click any village to view full profile</span>
            <button
              onClick={() => onNavigateTab('villages')}
              className="text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
            >
              <span>View All 1,872</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

      </div>

      {/* District Aggregation Overview Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mountain className="w-4 h-4 text-emerald-400" />
              Hilly District Aggregated Early Warning Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Aggregated from individual village predictions — never assigning an identical score across a whole district
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('districts')}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center gap-1"
          >
            <span>District Drilldown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {districts.map((d) => (
            <div
              key={d.id}
              onClick={() => onNavigateTab('districts')}
              className="bg-slate-800/60 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-800 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-white text-sm">{d.district_name}</h4>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded">
                    {d.id}
                  </span>
                </div>

                <div className="text-xs text-slate-300 space-y-1 mt-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Villages:</span>
                    <span className="font-bold text-white font-mono">{d.total_villages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sub-Districts:</span>
                    <span className="font-bold text-slate-200">{d.sub_districts_count}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Elevation:</span>
                    <span className="font-mono text-slate-200">{d.avg_elevation_m} m</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Slope:</span>
                    <span className="font-mono text-slate-200">{d.avg_slope_deg}°</span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs font-mono">
                  <span className="text-red-400 font-bold">
                    {d.high_risk + d.very_high_risk} High Risk
                  </span>
                  <span className="text-amber-400 font-bold">
                    {d.active_alerts} Alerts
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
