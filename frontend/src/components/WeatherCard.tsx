import React from 'react';
import { VillageLiveData } from '../types';
import { CloudRain, Droplets, Waves, Thermometer, Wind, AlertTriangle, CloudLightning } from 'lucide-react';

interface WeatherCardProps {
  liveData: VillageLiveData;
  villageName: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  liveData,
  villageName
}) => {
  const getSoilStatus = (moist: number) => {
    if (moist >= 85) return { text: 'CRITICALLY SATURATED', color: 'text-red-400 bg-red-950/60 border-red-700/60' };
    if (moist >= 70) return { text: 'NEAR SATURATION', color: 'text-orange-400 bg-orange-950/60 border-orange-700/60' };
    if (moist >= 50) return { text: 'MODERATE MOISTURE', color: 'text-amber-400 bg-amber-950/60 border-amber-700/60' };
    return { text: 'NOMINAL / DRY', color: 'text-emerald-400 bg-emerald-950/60 border-emerald-700/60' };
  };

  const soilStatus = getSoilStatus(liveData.soil_moisture_pct);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-blue-400" />
            Live Environmental & Hydrometeorological Conditions
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time radar precipitation, catchment runoff, and stream gauge dynamics
          </p>
        </div>
        <div className="flex items-center gap-2">
          {liveData.weather_warning.includes('Red') ? (
            <span className="flex items-center gap-1 bg-red-950 text-red-300 border border-red-600 px-2 py-0.5 rounded text-[11px] font-bold animate-pulse">
              <CloudLightning className="w-3.5 h-3.5" />
              {liveData.weather_warning}
            </span>
          ) : (
            <span className="bg-slate-800 text-slate-300 border border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
              {liveData.weather_warning}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        
        {/* Column 1: Rainfall Hyetograph Breakdown */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-400" />
              Precipitation Accumulation
            </span>
            <span className="text-[11px] font-bold text-blue-400 font-mono">
              {liveData.rainfall_1h_mm} mm/hr
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Past 1 Hour</span>
              <span className="text-base font-bold text-white font-mono">{liveData.rainfall_1h_mm} mm</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Past 3 Hours</span>
              <span className="text-base font-bold text-white font-mono">{liveData.rainfall_3h_mm} mm</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Past 6 Hours</span>
              <span className="text-base font-bold text-white font-mono">{liveData.rainfall_6h_mm} mm</span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Past 24 Hours</span>
              <span className="text-base font-bold text-white font-mono">{liveData.rainfall_24h_mm} mm</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
            <span>3-Day Acc.: <b className="text-slate-200 font-mono">{liveData.rainfall_3day_mm} mm</b></span>
            <span>Forecast (+6h): <b className="text-sky-400 font-mono">{liveData.forecast_rainfall_6h_mm} mm</b></span>
          </div>
        </div>

        {/* Column 2: Soil Moisture & Saturation */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-emerald-400" />
                Soil Percolation & Moisture
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${soilStatus.color}`}>
                {soilStatus.text}
              </span>
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-4xl font-black text-white font-mono">{liveData.soil_moisture_pct}%</span>
              <span className="text-xs text-slate-400">Volumetric Water Content</span>
            </div>

            {/* Gauge progress bar */}
            <div className="w-full bg-slate-900 rounded-full h-3 mt-3 p-0.5 border border-slate-800">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  liveData.soil_moisture_pct >= 85 ? 'bg-gradient-to-r from-orange-500 to-red-500' :
                  liveData.soil_moisture_pct >= 70 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                  'bg-gradient-to-r from-emerald-500 to-teal-400'
                }`}
                style={{ width: `${Math.min(100, liveData.soil_moisture_pct)}%` }}
              ></div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 mt-3 pt-2 border-t border-slate-800/80">
            Field Capacity Threshold: 75% • Saturation Limit: 90%
          </div>
        </div>

        {/* Column 3: Stream Water Level & Weather */}
        <div className="bg-slate-800/60 border border-slate-800 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              Stream Hydrograph Level
            </span>
            <span className={`text-xs font-mono font-bold ${liveData.water_level_rate_mh > 0.1 ? 'text-red-400' : 'text-slate-300'}`}>
              {liveData.water_level_rate_mh > 0 ? `+${liveData.water_level_rate_mh}` : liveData.water_level_rate_mh} m/hr
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800 flex items-baseline justify-between">
            <div>
              <span className="text-slate-400 block text-[10px]">Current Gauge Depth</span>
              <span className="text-2xl font-black text-white font-mono">{liveData.water_level_m} m</span>
            </div>
            <div className="text-right text-[11px] text-slate-400">
              <div>Warning: <b className="text-amber-400 font-mono">2.5 m</b></div>
              <div>Danger: <b className="text-red-400 font-mono">3.2 m</b></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 p-1.5 rounded">
              <Thermometer className="w-3.5 h-3.5 text-orange-400" />
              <span>Temp: <b className="font-mono text-white">{liveData.temperature_c}°C</b></span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900/60 p-1.5 rounded">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Humidity: <b className="font-mono text-white">{liveData.humidity_pct}%</b></span>
            </div>
          </div>
        </div>

      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>CWC River Stage • IMD Automated Weather Station Ingestion</span>
        <span className="text-amber-400/90 font-medium">SIMULATED SENSOR INGESTION</span>
      </div>
    </div>
  );
};
