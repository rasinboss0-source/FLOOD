import React from 'react';
import { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  colorScheme: 'blue' | 'emerald' | 'amber' | 'orange' | 'red' | 'purple';
  onClick?: () => void;
  badge?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  colorScheme,
  onClick,
  badge,
}) => {
  const getColors = () => {
    switch (colorScheme) {
      case 'emerald':
        return {
          iconBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          border: 'hover:border-emerald-500/40',
          text: 'text-emerald-400',
        };
      case 'amber':
        return {
          iconBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
          border: 'hover:border-amber-500/40',
          text: 'text-amber-400',
        };
      case 'orange':
        return {
          iconBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
          border: 'hover:border-orange-500/40',
          text: 'text-orange-400',
        };
      case 'red':
        return {
          iconBg: 'bg-red-500/10 text-red-400 border-red-500/20',
          border: 'hover:border-red-500/40',
          text: 'text-red-400',
        };
      case 'purple':
        return {
          iconBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
          border: 'hover:border-purple-500/40',
          text: 'text-purple-400',
        };
      default:
        return {
          iconBg: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
          border: 'hover:border-blue-500/40',
          text: 'text-blue-400',
        };
    }
  };

  const scheme = getColors();

  return (
    <div
      onClick={onClick}
      className={`bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:bg-slate-850 hover:scale-[1.02]' : ''
      } ${scheme.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg border ${scheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-3xl font-black text-white font-mono tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {badge && (
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {badge}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-slate-400 truncate">
          {subtitle}
        </p>
      )}

      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
        <span>Hyperlocal Watch</span>
        <span className="font-semibold text-amber-400/90 font-mono">DEMO DATA</span>
      </div>
    </div>
  );
};
