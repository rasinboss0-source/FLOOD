import React from 'react';
import { Database, CloudRain, Waves, CheckCircle2, Clock, Activity, ShieldCheck } from 'lucide-react';

export const DataSources: React.FC = () => {
  const sources = [
    {
      category: 'Static / Topographical / GIS Cadastre',
      icon: Database,
      items: [
        { name: 'Tamil Nadu Village Master Cadastre (Official 5 Districts)', status: 'CONNECTED', desc: '1,872 official cadastre records from district gazetteers (Nilgiris, Dindigul, Coimbatore, Theni, Salem) with FULL/PART coverage preserved.' },
        { name: 'ISRO Bhuvan SRTM Digital Elevation Model (DEM)', status: 'CONNECTED', desc: '30m spatial resolution elevation model providing catchment gradient and slope calculations.' },
        { name: 'OpenStreetMap (OSM) Road Network & Stream Lines', status: 'CONNECTED', desc: 'Hydrological stream order and evacuation road network connectivity vectors.' },
        { name: 'NBSS&LUP Soil Taxonomy & SoilGrids', status: 'SIMULATED', desc: 'Hydraulic conductivity, sand/clay percentages, and effective percolation depth.' },
        { name: 'Geological Survey of India (GSI) Lithology', status: 'PLANNED', desc: 'Bedrock permeability and Charnockite/Khondalite mountain jointing index.' },
        { name: 'ESA WorldCover Land Use / Land Cover (LULC)', status: 'PLANNED', desc: '10m spatial resolution forest canopy and tea estate runoff coefficient classification.' },
      ]
    },
    {
      category: 'Meteorological & Precipitation Radar',
      icon: CloudRain,
      items: [
        { name: 'India Meteorological Department (IMD) AWS Grid', status: 'SIMULATED', desc: 'Hourly automated rain gauge ingestion and heavy rainfall alert polygon feeds.' },
        { name: 'NASA GPM IMERG Near Real-Time Precipitation', status: 'PLANNED', desc: 'Multi-satellite half-hourly rainfall accumulation grids for cloudburst tracking.' },
        { name: 'Open-Meteo High-Resolution Numerical Weather Prediction', status: 'CONNECTED', desc: 'API endpoints for 6-hour short-range precipitation forecasting.' },
        { name: 'ERA5-Land ECMWF Reanalysis Baseline', status: 'PLANNED', desc: 'Decadal climatological normals for antecedent precipitation index (API) calibration.' },
      ]
    },
    {
      category: 'Hydrology & In-Situ IoT Telemetry',
      icon: Waves,
      items: [
        { name: 'Hyperlocal IoT Rain Gauge & TDR Soil Moisture Nodes', status: 'SIMULATED', desc: 'Edge sensor nodes deployed along upper catchment ridge lines with LoRaWAN telemetry.' },
        { name: 'Ultrasonic Stream Stage Level Sensors (JSN-SR04T)', status: 'SIMULATED', desc: 'High-frequency water level sounding at key culverts and stream headwaters.' },
        { name: 'Central Water Commission (CWC) River Stage Gauges', status: 'PLANNED', desc: 'National telemetry feed for major river outlets and dam inflow regulation.' },
        { name: 'GloFAS (Global Flood Awareness System)', status: 'PLANNED', desc: 'Ensemble streamflow forecasting and upstream river discharge estimations.' },
      ]
    }
  ];

  const getBadge = (status: string) => {
    switch (status) {
      case 'CONNECTED':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'SIMULATED':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Database className="w-6 h-6 text-blue-400" />
            Data Sources & Sensor Integration Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Transparent transparency of connected GIS layers, weather radar grids, and IoT telemetry feeds
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">CONNECTED</span>
          <span className="px-2.5 py-1 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">SIMULATED</span>
          <span className="px-2.5 py-1 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold">PLANNED</span>
        </div>
      </div>

      {/* Sources Groups */}
      <div className="space-y-6">
        {sources.map((grp, idx) => {
          const Icon = grp.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Icon className="w-5 h-5 text-sky-400" />
                {grp.category}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {grp.items.map((item, i) => (
                  <div
                    key={i}
                    className="bg-slate-850/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-bold text-white">{item.name}</h4>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${getBadge(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-500 font-mono">
                      Data Integrity: {item.status === 'CONNECTED' ? 'Active In-Memory / Leaflet Tile' : (item.status === 'SIMULATED' ? 'Calibrated Local Baseline' : 'API Interface Ready')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
