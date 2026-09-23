import React, { useState } from 'react';
import { CloudRain, BarChart3 } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, Cell 
} from 'recharts';

interface RainfallChartProps {
  rainfall1h: number;
  rainfall3h: number;
  rainfall6h: number;
  rainfall24h: number;
  rainfall3d: number;
  forecast6h: number;
}

export const RainfallChart: React.FC<RainfallChartProps> = ({
  rainfall1h,
  rainfall3h,
  rainfall6h,
  rainfall24h,
  rainfall3d,
  forecast6h,
}) => {
  const [unit, setUnit] = useState<'mm' | 'rate'>('mm');

  // Convert if rate (approx mm/hr over window)
  const data = [
    { period: '1h Total', value: rainfall1h, rate: rainfall1h, isForecast: false },
    { period: '3h Accum', value: rainfall3h, rate: Math.round((rainfall3h / 3) * 10) / 10, isForecast: false },
    { period: '6h Accum', value: rainfall6h, rate: Math.round((rainfall6h / 6) * 10) / 10, isForecast: false },
    { period: '24h Total', value: rainfall24h, rate: Math.round((rainfall24h / 24) * 10) / 10, isForecast: false },
    { period: '3-Day Total', value: rainfall3d, rate: Math.round((rainfall3d / 72) * 10) / 10, isForecast: false },
    { period: '+6h Forecast', value: forecast6h, rate: Math.round((forecast6h / 6) * 10) / 10, isForecast: true },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-sky-400" />
            Rainfall Hyetograph & Short-Range Forecast
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Accumulation profile & radar cloudburst projections
          </p>
        </div>
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            onClick={() => setUnit('mm')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              unit === 'mm' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            mm
          </button>
          <button
            onClick={() => setUnit('rate')}
            className={`px-2.5 py-1 rounded font-medium transition-colors ${
              unit === 'rate' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
            }`}
          >
            mm/hr
          </button>
        </div>
      </div>

      <div className="h-56 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="period" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(val: number) => [`${val} ${unit === 'mm' ? 'mm' : 'mm/hr'}`, unit === 'mm' ? 'Precipitation' : 'Intensity Rate']}
            />
            <Bar dataKey={unit === 'mm' ? 'value' : 'rate'} radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.isForecast ? '#38bdf8' : (entry.value > 100 ? '#ef4444' : '#2563eb')} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>India Meteorological Dept (IMD) AWS Grid • NASA GPM</span>
        <span className="text-amber-400/90 font-medium">SIMULATED RAINFALL FEED</span>
      </div>
    </div>
  );
};
