import React from 'react';
import { Waves, AlertTriangle } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  ReferenceLine, CartesianGrid 
} from 'recharts';

interface WaterLevelChartProps {
  currentLevel: number;
  rateOfRise: number;
  villageName: string;
}

export const WaterLevelChart: React.FC<WaterLevelChartProps> = ({
  currentLevel,
  rateOfRise,
  villageName,
}) => {
  // Generate 12-hour hydrograph curve ending at currentLevel
  const hours = ['-12h', '-10h', '-8h', '-6h', '-4h', '-2h', 'Now'];
  const baseline = Math.max(0.4, currentLevel - rateOfRise * 8);

  const hydrographData = hours.map((hr, idx) => {
    const frac = idx / (hours.length - 1);
    const simulatedVal = idx === hours.length - 1 
      ? currentLevel 
      : Math.round((baseline + (currentLevel - baseline) * Math.pow(frac, 1.8)) * 100) / 100;
    return {
      time: hr,
      level: simulatedVal,
    };
  });

  const warningThreshold = 2.5;
  const criticalThreshold = 3.2;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Waves className="w-4 h-4 text-cyan-400" />
            Stream Water Level Hydrograph — Past 12 Hours
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Local stream gauge depth for {villageName}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-slate-400 block text-[10px]">Rate of Rise</span>
            <span className={`font-mono font-bold ${rateOfRise > 0.1 ? 'text-red-400' : 'text-slate-200'}`}>
              {rateOfRise > 0 ? `+${rateOfRise}` : rateOfRise} m/hr
            </span>
          </div>
        </div>
      </div>

      <div className="h-56 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={hydrographData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} domain={[0, 4.0]} ticks={[0, 1.0, 2.0, 2.5, 3.2, 4.0]} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#94a3b8' }}
              formatter={(val: any) => [`${val} meters`, 'Gauge Depth']}
            />
            {/* Warning and Critical thresholds */}
            <ReferenceLine 
              y={warningThreshold} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: 'Warning: 2.5m', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} 
            />
            <ReferenceLine 
              y={criticalThreshold} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              label={{ value: 'Critical Danger: 3.2m', fill: '#ef4444', fontSize: 10, position: 'insideTopLeft' }} 
            />
            <Line 
              type="monotone" 
              dataKey="level" 
              stroke="#06b6d4" 
              strokeWidth={2.5} 
              dot={{ r: 4, fill: '#06b6d4' }}
              activeDot={{ r: 6, fill: '#38bdf8' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Ultrasonic Gauge JSN-SR04T • CWC River Cross-Section Reference</span>
        <span className="text-amber-400/90 font-medium">CONFIGURABLE PROTOTYPE THRESHOLDS</span>
      </div>
    </div>
  );
};
