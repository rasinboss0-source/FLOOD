import React from 'react';
import { VillageStaticFeatures } from '../types';
import { 
  Mountain, Compass, Waves, AreaChart, TreePine, 
  Layers, History, Users, Home, Navigation, Shield 
} from 'lucide-react';

interface VillageProfileProps {
  staticData: VillageStaticFeatures;
  isReserveForest?: boolean;
}

export const VillageProfile: React.FC<VillageProfileProps> = ({
  staticData,
  isReserveForest = false
}) => {
  const profileItems = [
    { label: 'Elevation (DEM)', value: `${staticData.elevation_m.toLocaleString()} m`, icon: Mountain, color: 'text-sky-400' },
    { label: 'Average Terrain Slope', value: `${staticData.average_slope_deg}°`, icon: AreaChart, color: 'text-amber-400' },
    { label: 'Slope Aspect', value: staticData.aspect, icon: Compass, color: 'text-indigo-400' },
    { label: 'Distance to Main Stream', value: `${staticData.distance_to_stream_m} m`, icon: Waves, color: 'text-blue-400' },
    { label: 'Upstream Catchment Area', value: `${staticData.upstream_catchment_sqkm} km²`, icon: AreaChart, color: 'text-cyan-400' },
    { label: 'Dominant Land Cover', value: staticData.land_cover, icon: TreePine, color: 'text-emerald-400' },
    { label: 'Soil Classification', value: staticData.soil_type, icon: Layers, color: 'text-yellow-400' },
    { label: 'Soil Effective Depth', value: `${staticData.soil_depth_cm} cm`, icon: Layers, color: 'text-orange-400' },
    { label: 'Underlying Geology', value: staticData.geology, icon: Layers, color: 'text-purple-400' },
    { label: 'Historical Flood Events', value: `${staticData.historical_flood_count} events recorded`, icon: History, color: 'text-rose-400' },
    { label: 'Historical Landslide Occurrences', value: `${staticData.historical_landslide_count} recorded`, icon: History, color: 'text-red-400' },
    { label: 'Resident Population', value: staticData.population.toLocaleString(), icon: Users, color: 'text-teal-400' },
    { label: 'Estimated Households', value: staticData.households.toLocaleString(), icon: Home, color: 'text-blue-300' },
    { label: 'Road Ingress / Evacuation Access', value: staticData.road_access, icon: Navigation, color: 'text-emerald-300' },
    { label: 'Designated Relief Shelter', value: staticData.nearest_shelter, icon: Shield, color: 'text-amber-300' },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Mountain className="w-4 h-4 text-emerald-400" />
            Static Village Cadastre & Geomorphology Baseline
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pre-computed topographical, pedological, hydrological and demographic vulnerabilities
          </p>
        </div>
        {isReserveForest && (
          <span className="bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.5 rounded text-[10px] font-bold">
            RESERVE FOREST (R.F.)
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-4">
        {profileItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              className="bg-slate-800/60 border border-slate-800 rounded-lg p-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  {item.label}
                </span>
              </div>
              <div className="text-sm font-bold text-white pl-5 truncate" title={item.value}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Sourced: ISRO Bhuvan SRTM DEM • NBSS&LUP Soil • State Cadastre</span>
        <span className="text-amber-400/90 font-medium">SIMULATED BASELINE PROFILE</span>
      </div>
    </div>
  );
};
