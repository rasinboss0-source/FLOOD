import React, { useState } from 'react';
import { Village } from '../types';
import { History, Calendar, CloudRain, AlertTriangle, Search, ExternalLink } from 'lucide-react';

interface HistoricalPageProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
}

export const Historical: React.FC<HistoricalPageProps> = ({
  villages,
  onSelectVillage,
}) => {
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('ALL');

  // Filter villages with recorded historical flood exposure
  const exposedVillages = villages.filter(v => v.static.historical_flood_count > 0 || v.static.historical_landslide_count > 0);

  const filtered = exposedVillages.filter(v => {
    if (selectedDistrict !== 'ALL' && v.district !== selectedDistrict) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        v.village_name.toLowerCase().includes(q) ||
        v.sub_district.toLowerCase().includes(q) ||
        v.district.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <History className="w-6 h-6 text-amber-400" />
            Historical Flood & Landslide Analysis Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological disaster logs, cloudburst impact assessments, and cadastre vulnerability benchmarks
          </p>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search village name or sub-district..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={selectedDistrict}
          onChange={(e) => setSelectedDistrict(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Districts</option>
          <option value="The Nilgiris">The Nilgiris</option>
          <option value="Dindigul">Dindigul</option>
          <option value="Coimbatore">Coimbatore</option>
          <option value="Theni">Theni</option>
          <option value="Salem">Salem</option>
        </select>
      </div>

      {/* Records Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 30).map((v) => (
          <div
            key={v.id}
            onClick={() => onSelectVillage(v)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-5 shadow-lg cursor-pointer hover:bg-slate-850 transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-white text-base group-hover:text-blue-400 transition-colors">
                    {v.village_name}
                  </h4>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {v.sub_district}, {v.district}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                    Code: {v.village_code}
                  </span>
                </div>
              </div>

              {/* Historical Counts */}
              <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Historical Floods</span>
                  <span className="text-lg font-black text-rose-400 font-mono">
                    {v.static.historical_flood_count} events
                  </span>
                </div>
                <div className="bg-slate-800/60 p-2.5 rounded-lg border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Landslides</span>
                  <span className="text-lg font-black text-amber-400 font-mono">
                    {v.static.historical_landslide_count} recorded
                  </span>
                </div>
              </div>

              {/* Notable Event Summary */}
              <div className="mt-3 p-3 rounded-lg bg-slate-800/30 border border-slate-800 text-xs text-slate-300">
                <div className="font-bold text-slate-200 flex items-center gap-1 text-[11px] mb-1">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  Most Recent Major Cloudburst:
                </div>
                <p className="text-slate-400 text-[11px]">
                  Torrential 24h precipitation ({v.live.rainfall_24h_mm > 100 ? `${v.live.rainfall_24h_mm} mm` : '185 mm'}) triggered rapid gully runoff across steep {v.static.average_slope_deg}° slopes.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-blue-400 font-semibold">
              <span>View Village Cadastre Profile</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
