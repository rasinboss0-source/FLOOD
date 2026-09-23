import React, { useState } from 'react';
import { Village } from '../types';
import { Radio, CloudRain, Droplets, Gauge, Battery, Wifi, Search, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

interface SensorsPageProps {
  villages: Village[];
  onSelectVillage: (village: Village) => void;
}

export const Sensors: React.FC<SensorsPageProps> = ({
  villages,
  onSelectVillage
}) => {
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Collect all sensor instances with their parent village reference
  const allSensors = villages.flatMap(v => 
    v.sensors.map(s => ({
      ...s,
      village: v
    }))
  );

  const filtered = allSensors.filter(item => {
    if (filterType !== 'ALL' && !item.type.includes(filterType)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.village.village_name.toLowerCase().includes(q) ||
        item.village.sub_district.toLowerCase().includes(q) ||
        item.sensor_id.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const onlineCount = allSensors.filter(s => s.status === 'ONLINE').length;
  const calibratingCount = allSensors.filter(s => s.status === 'CALIBRATING').length;
  const maintenanceCount = allSensors.filter(s => s.status === 'MAINTENANCE').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Radio className="w-6 h-6 text-sky-400" />
            Hyperlocal IoT Telemetry Station Grid
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time sensor telemetry across mountain ghats, ridgeline raingauges, and stream ultrasonic nodes
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {onlineCount} Online Nodes
          </span>
          <span className="bg-amber-950 text-amber-300 border border-amber-800 px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold">
            <RefreshCw className="w-3.5 h-3.5" />
            {calibratingCount} Calibrating
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sensor node ID, village, or taluk..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-colors ${
              filterType === 'ALL' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            All Sensors ({allSensors.length})
          </button>
          <button
            onClick={() => setFilterType('Rain')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
              filterType === 'Rain' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" />
            Rain Gauges
          </button>
          <button
            onClick={() => setFilterType('Soil')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
              filterType === 'Soil' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            Soil TDR
          </button>
          <button
            onClick={() => setFilterType('Water')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-colors ${
              filterType === 'Water' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Stream Gauges
          </button>
        </div>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, 36).map((item) => (
          <div
            key={`${item.sensor_id}-${item.village.id}`}
            onClick={() => onSelectVillage(item.village)}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl p-4 cursor-pointer hover:bg-slate-850 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400">{item.sensor_id}</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{item.type}</h4>
                  <div className="text-xs text-blue-400 mt-1">
                    {item.village.village_name} ({item.village.sub_district})
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${
                  item.status === 'ONLINE' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                  item.status === 'CALIBRATING' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                  'bg-blue-950 text-blue-300 border-blue-700'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-black text-white font-mono">{item.value}</span>
                <span className="text-xs font-bold text-slate-400">{item.unit}</span>
                {item.rate !== undefined && (
                  <span className="ml-2 text-xs font-mono text-slate-400">
                    ({item.rate > 0 ? `+${item.rate}` : item.rate} m/h)
                  </span>
                )}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <Battery className="w-3.5 h-3.5 text-emerald-400" />
                {item.battery_pct}%
              </span>
              <span className="flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-sky-400" />
                LoRa 868MHz
              </span>
              <span>{item.last_updated}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
