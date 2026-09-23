import React, { useState } from 'react';
import { Village } from '../types';
import { AlertCard } from '../components/AlertCard';
import { Bell, ShieldAlert, AlertTriangle, CheckCircle, Volume2 } from 'lucide-react';
import { playAlertSiren } from '../services/api';

interface AlertsPageProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
  onLocateMap: (village: Village) => void;
}

export const Alerts: React.FC<AlertsPageProps> = ({
  villages,
  onSelectVillage,
  onLocateMap,
}) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');

  // Find villages with active alerts or risk score >= 61
  const alertVillages = villages.filter(v => v.risk.alert_status === 'ACTIVE' || v.risk.risk_score >= 61);

  const filtered = alertVillages.filter(v => {
    if (filterLevel !== 'ALL' && v.risk.risk_level !== filterLevel) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-500 animate-bounce" />
            Hyperlocal Flash Flood Early Warning Dispatch Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Automated village-level alerts triggered by extreme meteorological intensity and river stage thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => playAlertSiren()}
            className="px-3 py-1.5 bg-red-950 text-red-300 border border-red-700/60 rounded-lg text-xs font-bold flex items-center gap-1.5 hover:bg-red-900/60 transition-colors"
          >
            <Volume2 className="w-4 h-4" />
            <span>Sound Emergency Chime</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 text-xs">
        <button
          onClick={() => setFilterLevel('ALL')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            filterLevel === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          All Active Alerts ({alertVillages.length})
        </button>
        <button
          onClick={() => setFilterLevel('VERY HIGH')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            filterLevel === 'VERY HIGH' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Very High Warnings ({alertVillages.filter(v => v.risk.risk_level === 'VERY HIGH').length})
        </button>
        <button
          onClick={() => setFilterLevel('HIGH')}
          className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
            filterLevel === 'HIGH' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          High Warnings ({alertVillages.filter(v => v.risk.risk_level === 'HIGH').length})
        </button>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-slate-400">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white">No Critical Flash Flood Alerts Active</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
              All village hydrological catchments are currently operating within nominal percolation and runoff capacity.
            </p>
          </div>
        ) : (
          filtered.map((v) => {
            const alertObj = v.alerts[0] || {
              alert_id: `ALT-${v.village_code}`,
              level: v.risk.risk_level,
              score: v.risk.risk_score,
              status: v.risk.alert_status,
              triggers: [
                `Rainfall intensity ${v.live.rainfall_1h_mm} mm/hr exceeding hilly percolation capacity`,
                `Soil saturation at ${v.live.soil_moisture_pct}% threshold`,
                `Stream gauge rising at +${v.live.water_level_rate_mh} m/hr`
              ],
              prediction_window: v.risk.prediction_window,
              sop_action: "Evacuate low-lying riverbank habitations to designated relief shelter."
            };

            return (
              <AlertCard
                key={v.id}
                alert={alertObj}
                village={v}
                onViewVillage={onSelectVillage}
                onViewMap={onLocateMap}
                onViewSensors={onSelectVillage}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
