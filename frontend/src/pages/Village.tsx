import React, { useState } from 'react';
import { Village, VillageRisk } from '../types';
import { RiskGauge } from '../components/RiskGauge';
import { RiskFactors } from '../components/RiskFactors';
import { VillageProfile } from '../components/VillageProfile';
import { SensorCard } from '../components/SensorCard';
import { WeatherCard } from '../components/WeatherCard';
import { RiskChart } from '../components/RiskChart';
import { RainfallChart } from '../components/RainfallChart';
import { WaterLevelChart } from '../components/WaterLevelChart';
import { SimulationPanel } from '../components/SimulationPanel';
import { 
  MapPin, Shield, AlertTriangle, ArrowLeft, Radio, 
  Layers, Sliders, FileText, CheckCircle2 
} from 'lucide-react';

interface VillageDashboardProps {
  village: Village;
  onBack: () => void;
  onLocateMap: (v: Village) => void;
}

export const VillageDashboard: React.FC<VillageDashboardProps> = ({
  village: initialVillage,
  onBack,
  onLocateMap,
}) => {
  const [village, setVillage] = useState<Village>(initialVillage);
  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'iot' | 'profile'>('overview');

  const handleUpdateRisk = (updatedRisk: VillageRisk, updatedLive: Village['live']) => {
    setVillage(prev => ({
      ...prev,
      risk: updatedRisk,
      live: updatedLive,
      sensors: prev.sensors.map(s => {
        if (s.type.includes('Rain')) return { ...s, value: updatedLive.rainfall_1h_mm };
        if (s.type.includes('Soil')) return { ...s, value: updatedLive.soil_moisture_pct };
        if (s.type.includes('Water')) return { ...s, value: updatedLive.water_level_m, rate: updatedLive.water_level_rate_mh };
        return s;
      })
    }));
  };

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Village Identity Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-blue-400 hover:text-blue-300 font-bold inline-flex items-center gap-1.5 mb-2 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Village Directory
          </button>
          
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-2xl font-black text-white tracking-tight">
              {village.village_name}
            </h1>
            {village.coverage_type !== 'N/A' && (
              <span className={`text-xs px-2 py-0.5 rounded font-bold border ${
                village.coverage_type === 'FULL'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                  : 'bg-amber-950 text-amber-300 border-amber-700/60'
              }`}>
                {village.coverage_type} Coverage
              </span>
            )}
            {village.is_reserve_forest && (
              <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-xs font-bold">
                Reserve Forest (R.F.)
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400 mt-1 font-mono">
            <span>Sub-District: <b className="text-slate-200">{village.sub_district}</b></span>
            <span>•</span>
            <span>District: <b className="text-slate-200">{village.district}</b></span>
            <span>•</span>
            <span>Village Code: <b className="text-blue-400">{village.village_code}</b></span>
            {village.lgd_code !== 'N/A' && (
              <>
                <span>•</span>
                <span>LGD Code: <b className="text-emerald-400">{village.lgd_code}</b></span>
              </>
            )}
            {village.gram_panchayat_ulb !== 'N/A' && (
              <>
                <span>•</span>
                <span className="font-sans text-slate-300">GP: {village.gram_panchayat_ulb}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onLocateMap(village)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <MapPin className="w-4 h-4 text-sky-400" />
            <span>Locate on GIS Map</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'overview'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Village Risk Overview</span>
        </button>
        <button
          onClick={() => setActiveTab('simulator')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'simulator'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Scenario Simulator</span>
        </button>
        <button
          onClick={() => setActiveTab('iot')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'iot'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>IoT Sensor Station</span>
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
            activeTab === 'profile'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
              : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Static Vulnerability Profile</span>
        </button>
      </div>

      {/* Primary Hero Row: Large Risk Gauge + SHAP Explainability Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskGauge
            score={village.risk.risk_score}
            level={village.risk.risk_level}
            floodProbability={village.risk.flood_probability}
            predictionWindow={village.risk.prediction_window}
          />
        </div>
        <div className="lg:col-span-2">
          <RiskFactors
            factors={village.risk.shap_factors}
            modelVersion={village.risk.model_version}
          />
        </div>
      </div>

      {/* Simulator Section (Always prominently accessible) */}
      <SimulationPanel
        village={village}
        onUpdateRisk={handleUpdateRisk}
      />

      {/* Live Conditions & IoT Sensor Cards */}
      <div className="grid grid-cols-1 gap-6">
        <WeatherCard
          liveData={village.live}
          villageName={village.village_name}
        />
        <SensorCard
          sensors={village.sensors}
          villageName={village.village_name}
        />
      </div>

      {/* Hydrometeorological & Risk Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <RiskChart
            trendData={village.risk.trend_24h}
            trendDirection={village.risk.trend}
            villageName={village.village_name}
          />
        </div>
        <div className="lg:col-span-1">
          <RainfallChart
            rainfall1h={village.live.rainfall_1h_mm}
            rainfall3h={village.live.rainfall_3h_mm}
            rainfall6h={village.live.rainfall_6h_mm}
            rainfall24h={village.live.rainfall_24h_mm}
            rainfall3d={village.live.rainfall_3day_mm}
            forecast6h={village.live.forecast_rainfall_6h_mm}
          />
        </div>
        <div className="lg:col-span-1">
          <WaterLevelChart
            currentLevel={village.live.water_level_m}
            rateOfRise={village.live.water_level_rate_mh}
            villageName={village.village_name}
          />
        </div>
      </div>

      {/* Static Profile */}
      <VillageProfile
        staticData={village.static}
        isReserveForest={village.is_reserve_forest}
      />
    </div>
  );
};
