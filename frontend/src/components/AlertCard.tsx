import React, { useState } from 'react';
import { VillageAlert, Village } from '../types';
import { AlertTriangle, CheckCircle, ExternalLink, MapPin, Radio, ShieldAlert } from 'lucide-react';

interface AlertCardProps {
  alert: VillageAlert;
  village: Village;
  onViewVillage: (v: Village) => void;
  onViewMap: (v: Village) => void;
  onViewSensors: (v: Village) => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  village,
  onViewVillage,
  onViewMap,
  onViewSensors,
}) => {
  const [acknowledged, setAcknowledged] = useState(false);

  const isCritical = alert.level === 'VERY HIGH' || alert.level === 'HIGH';

  return (
    <div className={`rounded-xl border p-5 shadow-xl transition-all ${
      acknowledged
        ? 'bg-slate-900/60 border-slate-700/60 opacity-80'
        : isCritical
        ? 'bg-gradient-to-br from-red-950/70 via-slate-900 to-purple-950/40 border-red-500/60 shadow-red-950/40'
        : 'bg-slate-900 border-amber-500/50'
    }`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isCritical ? 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-black tracking-wider uppercase px-2 py-0.5 rounded border ${
                alert.level === 'VERY HIGH' ? 'bg-purple-950 text-purple-300 border-purple-600' :
                alert.level === 'HIGH' ? 'bg-red-950 text-red-300 border-red-600' :
                'bg-amber-950 text-amber-300 border-amber-600'
              }`}>
                ⚠ {alert.level} FLASH FLOOD RISK
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {alert.alert_id}
              </span>
            </div>
            <h4 className="text-base font-bold text-white mt-1">
              {village.village_name}
              <span className="text-xs font-normal text-slate-400 ml-2">
                ({village.sub_district}, {village.district})
              </span>
            </h4>
          </div>
        </div>

        {/* Score pill */}
        <div className="text-right">
          <div className="text-2xl font-black text-red-400 font-mono">
            {alert.score} <span className="text-xs font-medium text-slate-400">/ 100</span>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
            Window: {alert.prediction_window}
          </span>
        </div>
      </div>

      {/* Main Triggers */}
      <div className="mt-4 bg-slate-900/90 rounded-lg p-3 border border-slate-800 text-xs">
        <div className="font-bold text-slate-300 mb-1.5 uppercase tracking-wider text-[10px]">
          HYPERLOCAL FLOOD TRIGGERS DETECTED:
        </div>
        <ul className="space-y-1 text-slate-300">
          {alert.triggers.map((trig, i) => (
            <li key={i} className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0"></span>
              <span>{trig}</span>
            </li>
          ))}
        </ul>

        <div className="mt-2.5 pt-2 border-t border-slate-800 text-slate-400 text-[11px]">
          <b className="text-amber-300 font-semibold">Immediate SOP Action: </b>
          {alert.sop_action}
        </div>
      </div>

      {/* Actions Bar */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onViewVillage(village)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View Village Dashboard
          </button>
          <button
            onClick={() => onViewMap(village)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            Locate on Map
          </button>
          <button
            onClick={() => onViewSensors(village)}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-slate-700"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            View IoT Sensors
          </button>
        </div>

        <button
          onClick={() => setAcknowledged(!acknowledged)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border flex items-center gap-1 transition-colors ${
            acknowledged
              ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5" />
          {acknowledged ? 'Acknowledged' : 'Acknowledge Alert'}
        </button>
      </div>

      <div className="mt-2 text-[10px] text-slate-400">
        Follow instructions from authorized disaster-management authorities. This prototype early warning does not supersede official NDRF/TNSDMA protocols.
      </div>
    </div>
  );
};
