import React, { useState } from 'react';
import { Sliders, Zap, RotateCcw, AlertTriangle, CloudRain, Droplets, Waves, Sparkles } from 'lucide-react';
import { Village, VillageRisk } from '../types';
import { predictRisk, playAlertSiren } from '../services/api';

interface SimulationPanelProps {
  village: Village;
  onUpdateRisk: (updatedRisk: VillageRisk, updatedLive: Village['live']) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({
  village,
  onUpdateRisk,
}) => {
  const [rfIntensity, setRfIntensity] = useState(village.live.rainfall_1h_mm);
  const [soilMoisture, setSoilMoisture] = useState(village.live.soil_moisture_pct);
  const [waterLevel, setWaterLevel] = useState(village.live.water_level_m);
  const [waterRate, setWaterRate] = useState(village.live.water_level_rate_mh);
  const [isSimulatingEvent, setIsSimulatingEvent] = useState(false);

  // Dynamic slider update
  const handleSliderChange = async (
    rf: number,
    sm: number,
    wl: number,
    wr: number
  ) => {
    setRfIntensity(rf);
    setSoilMoisture(sm);
    setWaterLevel(wl);
    setWaterRate(wr);

    const res = await predictRisk(
      {
        village_id: village.id,
        rainfall_1h: rf,
        rainfall_3h: Math.round(rf * 1.8),
        rainfall_24h: Math.round(rf * 3.2),
        rainfall_7d: village.live.rainfall_7day_mm,           // Group B: antecedent
        soil_moisture: sm,
        water_level: wl,
        water_level_rate: wr,
        river_discharge_cumecs: village.live.river_discharge_cumecs, // Group B: CWC
      },
      village.static.average_slope_deg,
      village.static.upstream_catchment_sqkm,
      village.static.landslide_zone_flag                      // Group A: GSI zone
    );

    const updatedRisk: VillageRisk = {
      ...village.risk,
      risk_score: res.risk_score,
      risk_level: res.risk_level,
      flood_probability: res.flood_probability,
      prediction_window: res.prediction_window,
      lead_time_hrs: res.lead_time_hrs,
      landslide_risk_level: res.landslide_risk_level,
      landslide_probability: res.landslide_probability,
      alert_status: res.risk_score >= 61 ? 'ACTIVE' : (res.risk_score >= 41 ? 'MONITORING' : 'NORMAL'),
      trend: wr > 0.05 || rf > 25 ? '↑ Rapidly Escalating' : '→ Stable',
      shap_factors: res.shap_factors,
    };

    const updatedLive: Village['live'] = {
      ...village.live,
      rainfall_1h_mm: rf,
      rainfall_3h_mm: Math.round(rf * 1.8),
      rainfall_24h_mm: Math.round(rf * 3.2),
      soil_moisture_pct: sm,
      water_level_m: wl,
      water_level_rate_mh: wr,
      weather_warning: res.risk_score >= 81 ? 'Red Alert: Cloudburst Imminent' : (res.risk_score >= 61 ? 'Orange Alert: Severe Runoff' : 'Nominal Conditions')
    };

    onUpdateRisk(updatedRisk, updatedLive);
  };


  // 1-Click SIH Heavy Cloudburst Demo Scenario
  const triggerHeavyRainfallEvent = () => {
    if (isSimulatingEvent) return;
    setIsSimulatingEvent(true);
    playAlertSiren();

    let step = 0;
    const targetRf = 84; // 84 mm/hr extreme intensity
    const targetSm = 94; // 94% saturated
    const targetWl = 3.65; // 3.65m overflow
    const targetWr = 0.38; // +0.38 m/hr rapid swell

    const startRf = rfIntensity;
    const startSm = soilMoisture;
    const startWl = waterLevel;
    const startWr = waterRate;

    const interval = setInterval(() => {
      step++;
      const progress = step / 10;
      const curRf = Math.round(startRf + (targetRf - startRf) * progress);
      const curSm = Math.round(startSm + (targetSm - startSm) * progress);
      const curWl = Math.round((startWl + (targetWl - startWl) * progress) * 100) / 100;
      const curWr = Math.round((startWr + (targetWr - startWr) * progress) * 100) / 100;

      handleSliderChange(curRf, curSm, curWl, curWr);

      if (step >= 10) {
        clearInterval(interval);
        setIsSimulatingEvent(false);
      }
    }, 180);
  };

  // Reset to Baseline
  const resetToBaseline = () => {
    handleSliderChange(
      village.live.rainfall_1h_mm,
      village.live.soil_moisture_pct,
      village.live.water_level_m,
      village.live.water_level_rate_mh
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Simulation Watermark Banner */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-amber-500/20 text-amber-400">
              <Sliders className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-white tracking-wide">
              Flash Flood Scenario Simulator
            </h3>
            <span className="bg-amber-950 text-amber-300 border border-amber-600/60 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider animate-pulse">
              SIMULATION MODE — NOT A REAL WARNING
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Interactively simulate torrential cloudbursts, soil saturation, and river stage response for {village.village_name}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={resetToBaseline}
            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={triggerHeavyRainfallEvent}
            disabled={isSimulatingEvent}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all ${
              isSimulatingEvent
                ? 'bg-red-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-red-600 via-rose-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white shadow-red-900/50'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {isSimulatingEvent ? 'Simulating Cloudburst...' : 'Simulate Heavy Rainfall Event (2-Min Demo)'}
          </button>
        </div>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-5">
        
        {/* Slider 1: Rainfall Intensity */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <CloudRain className="w-4 h-4 text-blue-400" />
              Rainfall Intensity
            </span>
            <span className="font-mono font-bold text-blue-400 text-sm">
              {rfIntensity} mm/hr
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="120"
            step="1"
            value={rfIntensity}
            onChange={(e) => handleSliderChange(Number(e.target.value), soilMoisture, waterLevel, waterRate)}
            className="w-full accent-blue-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 mm</span>
            <span>40 Mod</span>
            <span>80+ Extreme</span>
          </div>
        </div>

        {/* Slider 2: Soil Moisture */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-emerald-400" />
              Soil Saturation (TDR)
            </span>
            <span className="font-mono font-bold text-emerald-400 text-sm">
              {soilMoisture}%
            </span>
          </div>
          <input
            type="range"
            min="20"
            max="100"
            step="1"
            value={soilMoisture}
            onChange={(e) => handleSliderChange(rfIntensity, Number(e.target.value), waterLevel, waterRate)}
            className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>20% Dry</span>
            <span>70% Capacity</span>
            <span>90%+ Runoff</span>
          </div>
        </div>

        {/* Slider 3: Water Level Depth */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Waves className="w-4 h-4 text-cyan-400" />
              Stream Water Level
            </span>
            <span className="font-mono font-bold text-cyan-400 text-sm">
              {waterLevel} m
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="4.5"
            step="0.05"
            value={waterLevel}
            onChange={(e) => handleSliderChange(rfIntensity, soilMoisture, Number(e.target.value), waterRate)}
            className="w-full accent-cyan-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0.5m Safe</span>
            <span>2.5m Warning</span>
            <span>3.2m+ Critical</span>
          </div>
        </div>

        {/* Slider 4: Water Level Rise Rate */}
        <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-purple-400" />
              Rate of Water Rise
            </span>
            <span className="font-mono font-bold text-purple-400 text-sm">
              {waterRate > 0 ? `+${waterRate}` : waterRate} m/hr
            </span>
          </div>
          <input
            type="range"
            min="-0.1"
            max="0.6"
            step="0.02"
            value={waterRate}
            onChange={(e) => handleSliderChange(rfIntensity, soilMoisture, waterLevel, Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer h-2 bg-slate-700 rounded-lg"
          />
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>Receding</span>
            <span>+0.15 Fast</span>
            <span>+0.35 Cloudburst</span>
          </div>
        </div>

      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Real-time AI recalculation: Dynamic inference updates the 0–100 risk gauge and SHAP weights with zero reload.
        </span>
        <span className="text-amber-400/90 font-mono font-bold">
          SIH26192 DEMO ENGINE
        </span>
      </div>
    </div>
  );
};
