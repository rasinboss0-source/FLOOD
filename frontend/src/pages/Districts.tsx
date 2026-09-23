import React, { useState } from 'react';
import { DistrictSummary, Village } from '../types';
import { Mountain, MapPin, ChevronRight, AlertTriangle, Radio, ArrowRight, ShieldCheck, Home } from 'lucide-react';
import { VillageTable } from '../components/VillageTable';

interface DistrictsPageProps {
  districts: DistrictSummary[];
  villages: Village[];
  onSelectVillage: (village: Village) => void;
  onLocateMap: (districtName: string) => void;
}

export const Districts: React.FC<DistrictsPageProps> = ({
  districts,
  villages,
  onSelectVillage,
  onLocateMap,
}) => {
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
  const [selectedSubDistrict, setSelectedSubDistrict] = useState<string | null>(null);

  const activeDistrictObj = districts.find(d => d.district_name === selectedDistrict);

  // Group villages in active district by sub-district
  const subDistrictList = activeDistrictObj ? activeDistrictObj.sub_districts : [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Mountain className="w-6 h-6 text-blue-400" />
            Tamil Nadu Hilly Districts Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configurable scope of monitored mountainous and high-gradient river basins
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedDistrict && (
            <button
              onClick={() => { setSelectedDistrict(null); setSelectedSubDistrict(null); }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
            >
              ← Back to All Districts
            </button>
          )}
        </div>
      </div>

      {/* If No District Selected: Show All District Cards */}
      {!selectedDistrict ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {districts.map((d) => {
            const highCombined = d.high_risk + d.very_high_risk;
            return (
              <div
                key={d.id}
                onClick={() => setSelectedDistrict(d.district_name)}
                className="bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-xl p-5 shadow-xl cursor-pointer hover:bg-slate-850 hover:scale-[1.01] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-blue-400 bg-blue-950/60 border border-blue-800/40 px-2 py-0.5 rounded uppercase font-bold">
                        {d.id} • {d.state}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-1.5 group-hover:text-blue-400 transition-colors">
                        {d.district_name}
                      </h3>
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Terrain Topo Meta */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Avg Elevation</span>
                      <span className="font-mono font-bold text-slate-200">{d.avg_elevation_m} m</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Mean Gradient</span>
                      <span className="font-mono font-bold text-slate-200">{d.avg_slope_deg}° slope</span>
                    </div>
                  </div>

                  {/* Village Cadastre & Risk Breakdown */}
                  <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Total Monitored Villages:</span>
                      <span className="font-bold text-white font-mono">{d.total_villages}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Sub-Districts / Taluks:</span>
                      <span className="font-bold text-slate-200">{d.sub_districts_count}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Active High Risk Villages:</span>
                      <span className="font-bold text-red-400 font-mono">{highCombined}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800">
                      <span className="text-slate-400">Active Warning Alerts:</span>
                      <span className="font-bold text-amber-400 font-mono">{d.active_alerts}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-400">Online IoT Sensors:</span>
                      <span className="font-bold text-emerald-400 font-mono">{d.sensors_online}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-blue-400">
                  <span>Explore Sub-Districts & Villages</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* District Drilldown View */
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs font-mono text-blue-400">District Overview</span>
                <h2 className="text-2xl font-black text-white">{selectedDistrict}</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Derived from {activeDistrictObj?.total_villages} individual village risk assessments
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => onLocateMap(selectedDistrict)}
                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Show {selectedDistrict} on Map</span>
                </button>
              </div>
            </div>

            {/* Sub-District Filter Tabs */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                Sub-Districts / Taluks in {selectedDistrict}:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubDistrict(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    selectedSubDistrict === null
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  All Sub-Districts ({activeDistrictObj?.total_villages})
                </button>
                {subDistrictList.map((sd) => {
                  const sdVillages = villages.filter(v => v.district === selectedDistrict && v.sub_district === sd);
                  const isSdActive = selectedSubDistrict === sd;
                  return (
                    <button
                      key={sd}
                      onClick={() => setSelectedSubDistrict(sd)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isSdActive
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <span>{sd}</span>
                      <span className={`text-[10px] px-1 rounded ${isSdActive ? 'bg-blue-800' : 'bg-slate-700'}`}>
                        {sdVillages.length}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Searchable Village Table for Selected District / Sub-District */}
          <VillageTable
            villages={villages}
            selectedDistrict={selectedDistrict}
            selectedSubDistrict={selectedSubDistrict || undefined}
            onSelectVillage={onSelectVillage}
          />
        </div>
      )}
    </div>
  );
};
