import React, { useState } from 'react';
import { Village, DistrictSummary } from '../types';
import { RiskMap } from '../components/RiskMap';
import { MapPin, Filter, Layers, ExternalLink, ShieldAlert, Mountain } from 'lucide-react';

interface LiveMapPageProps {
  villages: Village[];
  districts: DistrictSummary[];
  onSelectVillage: (village: Village) => void;
  selectedVillageInitial?: Village | null;
}

export const LiveMap: React.FC<LiveMapPageProps> = ({
  villages,
  districts,
  onSelectVillage,
  selectedVillageInitial = null,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [focusedVillage, setFocusedVillage] = useState<Village | null>(selectedVillageInitial);

  const handleVillageClick = (v: Village) => {
    setFocusedVillage(v);
  };

  return (
    <div className="space-y-4">
      {/* Map Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              Hyperlocal GIS Flash Flood Command Center
            </h1>
            <p className="text-xs text-slate-400">
              Real-time village risk markers & spatial layers across Tamil Nadu
            </p>
          </div>
        </div>

        {/* District Filter Pill Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">District:</span>
          <select
            value={selectedDistrict}
            onChange={(e) => {
              setSelectedDistrict(e.target.value);
              setFocusedVillage(null);
            }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-1.5 text-xs font-semibold focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All 5 Hilly Districts (1,872 Villages)</option>
            {districts.map((d) => (
              <option key={d.id} value={d.district_name}>
                {d.district_name} ({d.total_villages} villages)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Map with Optional Bottom / Side Inspection Drawer */}
      <div className="relative">
        <RiskMap
          villages={villages}
          selectedVillage={focusedVillage}
          onSelectVillage={handleVillageClick}
          selectedDistrict={selectedDistrict}
          className="h-[680px]"
        />

        {/* Floating Quick Village Inspection Drawer */}
        {focusedVillage && (
          <div className="absolute bottom-6 right-6 z-[1000] w-80 bg-slate-900/95 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur animate-in fade-in slide-in-from-bottom-2 text-xs">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono text-slate-400">
                  {focusedVillage.sub_district}, {focusedVillage.district}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">
                  {focusedVillage.village_name}
                </h4>
              </div>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded border uppercase ${
                focusedVillage.risk.risk_level === 'VERY HIGH' ? 'bg-purple-950 text-purple-300 border-purple-600' :
                focusedVillage.risk.risk_level === 'HIGH' ? 'bg-red-950 text-red-300 border-red-600' :
                focusedVillage.risk.risk_level === 'ELEVATED' ? 'bg-orange-950 text-orange-300 border-orange-600' :
                focusedVillage.risk.risk_level === 'MODERATE' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                'bg-emerald-950 text-emerald-300 border-emerald-600'
              }`}>
                {focusedVillage.risk.risk_score} / 100
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 mt-3 text-[11px] text-slate-300 bg-slate-800/60 p-2 rounded">
              <div>Rain 1h: <b className="text-sky-400 font-mono">{focusedVillage.live.rainfall_1h_mm} mm</b></div>
              <div>Soil: <b className="text-emerald-400 font-mono">{focusedVillage.live.soil_moisture_pct}%</b></div>
              <div>Slope: <b className="text-amber-400 font-mono">{focusedVillage.static.average_slope_deg}°</b></div>
              <div>Elevation: <b className="text-purple-400 font-mono">{focusedVillage.static.elevation_m}m</b></div>
            </div>

            <button
              onClick={() => onSelectVillage(focusedVillage)}
              className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-lg"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Full Village Risk Dashboard</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
