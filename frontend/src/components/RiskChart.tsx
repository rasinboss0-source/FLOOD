import React from 'react';
import { TrendPoint } from '../types';
import { TrendingUp, Clock } from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, CartesianGrid 
} from 'recharts';

interface RiskChartProps {
  trendData: TrendPoint[];
  trendDirection: string;
  villageName: string;
}

export const RiskChart: React.FC<RiskChartProps> = ({
  trendData,
  trendDirection,
  villageName,
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            Village Flash Flood Risk Trend — Past 24 Hours
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Calibrated risk trajectory for {villageName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
            trendDirection.includes('Increasing')
              ? 'bg-red-950/60 text-red-300 border-red-600 animate-pulse'
              : 'bg-slate-800 text-slate-300 border-slate-700'
          }`}>
            Risk Trend: {trendDirection}
          </span>
        </div>
      </div>

      <div className="h-56 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#a855f7" stopOpacity={0.6}/>
                <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="hour" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              itemStyle={{ color: '#c084fc', fontWeight: 'bold' }}
              formatter={(val: any) => [`${val} / 100`, 'Risk Score']}
            />
            {/* Warning threshold lines */}
            <ReferenceLine y={80} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Very High', fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={60} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'High', fill: '#f97316', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={40} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Elevated', fill: '#f59e0b', fontSize: 10, position: 'insideTopRight' }} />
            <Area 
              type="monotone" 
              dataKey="risk_score" 
              stroke="#a855f7" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#riskGradient)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          Hourly Model Re-assessment Window
        </span>
        <span className="text-amber-400/90 font-medium">ILLUSTRATIVE SIMULATED TRAJECTORY</span>
      </div>
    </div>
  );
};
