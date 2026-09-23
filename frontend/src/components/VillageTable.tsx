import React, { useState, useMemo } from 'react';
import { Village } from '../types';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Eye, AlertTriangle } from 'lucide-react';

interface VillageTableProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
  selectedDistrict?: string;
  selectedSubDistrict?: string;
}

export const VillageTable: React.FC<VillageTableProps> = ({
  villages,
  onSelectVillage,
  selectedDistrict,
  selectedSubDistrict,
}) => {
  const [search, setSearch] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('ALL');
  const [filterCoverage, setFilterCoverage] = useState<string>('ALL');
  const [filterAlertOnly, setFilterAlertOnly] = useState(false);
  const [sortField, setSortField] = useState<'risk_score' | 'village_name' | 'rainfall' | 'elevation'>('risk_score');
  const [sortAsc, setSortAsc] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  const filtered = useMemo(() => {
    return villages.filter((v) => {
      if (selectedDistrict && v.district !== selectedDistrict) return false;
      if (selectedSubDistrict && v.sub_district !== selectedSubDistrict) return false;

      if (filterRisk !== 'ALL' && v.risk.risk_level !== filterRisk) return false;
      if (filterCoverage !== 'ALL' && v.coverage_type !== filterCoverage) return false;
      if (filterAlertOnly && v.risk.alert_status !== 'ACTIVE') return false;

      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const matches =
          v.village_name.toLowerCase().includes(q) ||
          v.village_code.toLowerCase().includes(q) ||
          v.lgd_code.toLowerCase().includes(q) ||
          v.sub_district.toLowerCase().includes(q) ||
          v.gram_panchayat_ulb.toLowerCase().includes(q);
        if (!matches) return false;
      }
      return true;
    }).sort((a, b) => {
      let cmp = 0;
      if (sortField === 'risk_score') {
        cmp = a.risk.risk_score - b.risk.risk_score;
      } else if (sortField === 'village_name') {
        cmp = a.village_name.localeCompare(b.village_name);
      } else if (sortField === 'rainfall') {
        cmp = a.live.rainfall_1h_mm - b.live.rainfall_1h_mm;
      } else if (sortField === 'elevation') {
        cmp = a.static.elevation_m - b.static.elevation_m;
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [villages, selectedDistrict, selectedSubDistrict, filterRisk, filterCoverage, filterAlertOnly, search, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const getRiskBadge = (lvl: string) => {
    switch (lvl) {
      case 'VERY HIGH':
        return 'bg-purple-950 text-purple-300 border-purple-600';
      case 'HIGH':
        return 'bg-red-950 text-red-300 border-red-600';
      case 'ELEVATED':
        return 'bg-orange-950 text-orange-300 border-orange-600';
      case 'MODERATE':
        return 'bg-amber-950 text-amber-300 border-amber-600';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-600';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
      {/* Top Filter Bar */}
      <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-900/90">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            placeholder="Search village name, code, LGD, Gram Panchayat..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={filterRisk}
            onChange={(e) => { setFilterRisk(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="VERY HIGH">Very High Risk</option>
            <option value="HIGH">High Risk</option>
            <option value="ELEVATED">Elevated Risk</option>
            <option value="MODERATE">Moderate Risk</option>
            <option value="LOW">Low Risk</option>
          </select>

          <select
            value={filterCoverage}
            onChange={(e) => { setFilterCoverage(e.target.value); setCurrentPage(1); }}
            className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">All Coverage</option>
            <option value="FULL">FULL Coverage Only</option>
            <option value="PART">PART Coverage Only</option>
          </select>

          <button
            onClick={() => { setFilterAlertOnly(!filterAlertOnly); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 font-semibold transition-colors ${
              filterAlertOnly
                ? 'bg-red-950 text-red-300 border-red-600'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
            Active Alerts Only
          </button>
        </div>
      </div>

      {/* Results Header info */}
      <div className="px-4 py-2 bg-slate-850 border-b border-slate-800/80 text-xs text-slate-400 flex items-center justify-between">
        <span>Showing {filtered.length} matching official village records</span>
        <span>Page {currentPage} of {totalPages}</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-800/70 text-slate-300 uppercase tracking-wider font-semibold border-b border-slate-700/80">
            <tr>
              <th className="p-3">Village Name & Cadastre</th>
              <th className="p-3">Sub-District / District</th>
              <th className="p-3">Coverage / LGD</th>
              <th className="p-3">Gram Panchayat / ULB</th>
              <th 
                className="p-3 cursor-pointer hover:text-white"
                onClick={() => toggleSort('rainfall')}
              >
                <div className="flex items-center gap-1">
                  <span>Rain 1h</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3">Soil / Stream</th>
              <th 
                className="p-3 cursor-pointer hover:text-white"
                onClick={() => toggleSort('risk_score')}
              >
                <div className="flex items-center gap-1">
                  <span>Risk Score</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300">
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-500 text-sm">
                  No villages matched the filter criteria.
                </td>
              </tr>
            ) : (
              paginated.map((v) => (
                <tr
                  key={v.id}
                  className="hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onSelectVillage(v)}
                >
                  {/* Village Name & Code */}
                  <td className="p-3 font-medium text-white">
                    <div className="flex items-center gap-1.5 font-bold">
                      {v.village_name}
                      {v.is_reserve_forest && (
                        <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] px-1 rounded">
                          R.F.
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Code: {v.village_code}
                    </div>
                  </td>

                  {/* Sub-District / District */}
                  <td className="p-3">
                    <div className="font-semibold text-slate-200">{v.sub_district}</div>
                    <div className="text-[11px] text-slate-400">{v.district}</div>
                  </td>

                  {/* Coverage & LGD */}
                  <td className="p-3">
                    <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold border ${
                      v.coverage_type === 'FULL'
                        ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
                        : v.coverage_type === 'PART'
                        ? 'bg-amber-950 text-amber-400 border-amber-800'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {v.coverage_type}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-1">
                      LGD: {v.lgd_code}
                    </div>
                  </td>

                  {/* Gram Panchayat / ULB */}
                  <td className="p-3 max-w-[200px]">
                    <div className="truncate text-slate-300 font-medium" title={v.gram_panchayat_ulb}>
                      {v.gram_panchayat_ulb}
                    </div>
                  </td>

                  {/* Rain 1h */}
                  <td className="p-3 font-mono font-bold text-sky-400">
                    {v.live.rainfall_1h_mm} mm/h
                  </td>

                  {/* Soil & Stream */}
                  <td className="p-3 text-[11px]">
                    <div>Soil: <b className="text-white font-mono">{v.live.soil_moisture_pct}%</b></div>
                    <div>Water: <b className="text-white font-mono">{v.live.water_level_m}m</b></div>
                  </td>

                  {/* Risk Score */}
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded font-black text-xs border ${getRiskBadge(v.risk.risk_level)}`}>
                        {v.risk.risk_score}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 hidden sm:inline">
                        {v.risk.risk_level}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectVillage(v); }}
                      className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-[11px] font-bold inline-flex items-center gap-1 transition-colors"
                    >
                      <Eye className="w-3 h-3" />
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 bg-slate-850 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div>
          Showing {Math.min(filtered.length, (currentPage - 1) * pageSize + 1)}–{Math.min(filtered.length, currentPage * pageSize)} of {filtered.length}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 py-1 bg-slate-800 rounded text-slate-200 font-mono font-bold">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
