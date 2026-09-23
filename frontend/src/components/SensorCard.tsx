import React from 'react';
import { IoTSensor } from '../types';
import { Radio, CloudRain, Droplets, Gauge, Battery, Wifi, CheckCircle2, AlertCircle } from 'lucide-react';

interface SensorCardProps {
  sensors: IoTSensor[];
  villageName: string;
}

export const SensorCard: React.FC<SensorCardProps> = ({
  sensors,
  villageName,
}) => {
  const getIcon = (type: string) => {
    if (type.includes('Rain')) return CloudRain;
    if (type.includes('Soil')) return Droplets;
    return Gauge;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ONLINE':
        return 'bg-emerald-950 text-emerald-300 border-emerald-700/60';
      case 'CALIBRATING':
        return 'bg-amber-950 text-amber-300 border-amber-700/60';
      case 'MAINTENANCE':
        return 'bg-blue-950 text-blue-300 border-blue-700/60';
      default:
        return 'bg-red-950 text-red-300 border-red-700/60';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            Hyperlocal IoT Telemetry Station — {villageName}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            LoRaWAN / 4G solar-powered sensor nodes deployed at village stream headwaters
          </p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/40 border border-emerald-800/60 px-2 py-0.5 rounded">
          <CheckCircle2 className="w-3 h-3" />
          LoRa Gateway Active
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {sensors.map((sensor) => {
          const Icon = getIcon(sensor.type);
          return (
            <div
              key={sensor.sensor_id}
              className="bg-slate-800/70 border border-slate-700/60 rounded-xl p-4 flex flex-col justify-between hover:border-slate-600 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-950/60 border border-blue-700/40 flex items-center justify-center text-blue-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getStatusBadge(sensor.status)}`}>
                    {sensor.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-300">{sensor.type}</div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">{sensor.sensor_id}</div>

                {/* Primary Metric */}
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-3xl font-black text-white font-mono tracking-tight">
                    {sensor.value}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{sensor.unit}</span>
                </div>

                {/* Optional rate of rise for water level sensor */}
                {sensor.rate !== undefined && (
                  <div className="mt-1 text-xs">
                    <span className="text-slate-400">Rate of Rise: </span>
                    <span className={`font-mono font-bold ${sensor.rate > 0.1 ? 'text-red-400' : 'text-slate-200'}`}>
                      {sensor.rate > 0 ? `+${sensor.rate}` : sensor.rate} m/hr
                    </span>
                  </div>
                )}
              </div>

              {/* Node Diagnostics Footer */}
              <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                <div className="flex items-center gap-1 text-slate-300">
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{sensor.battery_pct}%</span>
                </div>
                <div className="flex items-center gap-1 text-slate-400 truncate max-w-[120px]" title={sensor.telemetry}>
                  <Wifi className="w-3.5 h-3.5 text-sky-400" />
                  <span className="truncate">{sensor.telemetry.split(' ')[0]}</span>
                </div>
                <span>{sensor.last_updated}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
        <span>Hardware: ESP32 + SX1276 LoRa + TDR Time-Domain Sensor + JSN-SR04T Ultrasonic</span>
        <span className="text-amber-400/90 font-medium">SIMULATED TELEMETRY FEED</span>
      </div>
    </div>
  );
};
