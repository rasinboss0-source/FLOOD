import React, { useState, useEffect, useRef } from 'react';
import { 
  Waves, Search, Bell, Volume2, VolumeX, Menu, X, ShieldAlert, 
  MapPin, CheckCircle2, ChevronRight, Activity
} from 'lucide-react';
import { searchVillages, playAlertSiren, getSystemMode, setSystemMode } from '../services/api';
import { Village } from '../types';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSelectVillage: (village: Village) => void;
  activeAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onSelectVillage,
  activeAlertCount,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Village[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mode, setMode] = useState<'demo' | 'live'>('demo');
  const searchRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'livemap', label: 'Live Map' },
    { id: 'districts', label: 'Districts' },
    { id: 'villages', label: 'Villages' },
    { id: 'riskanalysis', label: 'Risk Analysis' },
    { id: 'sensors', label: 'Sensors' },
    { id: 'alerts', label: 'Alerts', badge: activeAlertCount > 0 ? activeAlertCount : undefined },
    { id: 'historical', label: 'Historical Events' },
    { id: 'datasources', label: 'Data Sources' },
    { id: 'about', label: 'About' },
  ];

  useEffect(() => {
    setMode(getSystemMode());
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        setIsSearching(true);
        const res = await searchVillages(searchQuery, 12);
        setSearchResults(res);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchResults([]);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (v: Village) => {
    onSelectVillage(v);
    setSearchQuery('');
    setSearchResults([]);
    setMobileMenuOpen(false);
  };

  const toggleMode = () => {
    const next = mode === 'demo' ? 'live' : 'demo';
    setSystemMode(next);
    setMode(next);
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      {/* Top Banner Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand & Emblem */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Waves className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg text-white tracking-tight flex items-center gap-1.5">
                  Tamil Nadu Hyperlocal Flash Flood Early Warning System
                </span>
                <span className="hidden lg:inline bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] px-1.5 py-0.5 rounded font-mono">
                  TNSDMA Prototype
                </span>
              </div>
              <p className="text-xs text-blue-400/90 font-medium">
                "From District-Level Warnings to Village-Level Prediction."
              </p>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 1,872 villages by name, code, LGD, GP..."
                className="w-full pl-9 pr-4 py-1.5 bg-slate-800/90 border border-slate-700/80 rounded-lg text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              {isSearching && (
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <Activity className="h-3.5 w-3.5 text-blue-400 animate-spin" />
                </div>
              )}
            </div>

            {/* Auto-complete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-96 overflow-y-auto z-50 divide-y divide-slate-800">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 bg-slate-800/50 flex justify-between">
                  <span>FOUND {searchResults.length} VILLAGES</span>
                  <span>CLICK TO VIEW DASHBOARD</span>
                </div>
                {searchResults.map((v) => (
                  <div
                    key={v.id}
                    onClick={() => handleSelect(v)}
                    className="p-2.5 hover:bg-slate-800 cursor-pointer transition-colors flex items-center justify-between text-left"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white flex items-center gap-1.5">
                        {v.village_name}
                        {v.coverage_type !== 'N/A' && (
                          <span className={`text-[10px] px-1 rounded ${v.coverage_type === 'FULL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}`}>
                            {v.coverage_type}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{v.sub_district}, {v.district}</span>
                        <span>•</span>
                        <span>Code: {v.village_code}</span>
                        {v.lgd_code !== 'N/A' && <span>• LGD: {v.lgd_code}</span>}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-0.5 rounded font-bold ${
                        v.risk.risk_level === 'VERY HIGH' ? 'bg-purple-900/60 text-purple-300 border border-purple-600' :
                        v.risk.risk_level === 'HIGH' ? 'bg-red-900/60 text-red-300 border border-red-600' :
                        v.risk.risk_level === 'ELEVATED' ? 'bg-orange-900/60 text-orange-300 border border-orange-600' :
                        v.risk.risk_level === 'MODERATE' ? 'bg-amber-900/60 text-amber-300 border border-amber-600' :
                        'bg-emerald-900/60 text-emerald-300 border border-emerald-600'
                      }`}>
                        {v.risk.risk_score} / 100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mode Switcher */}
            <button
              onClick={toggleMode}
              className={`px-2.5 py-1 rounded text-xs font-semibold border flex items-center gap-1.5 transition-all ${
                mode === 'demo'
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/40 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/20'
              }`}
              title="Click to switch Demo Mode vs Live API Mode"
            >
              <span className={`w-2 h-2 rounded-full ${mode === 'demo' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              {mode === 'demo' ? 'DEMO MODE' : 'LIVE API'}
            </button>

            {/* Siren Audio Test */}
            <button
              onClick={() => {
                if (audioEnabled) playAlertSiren();
                setAudioEnabled(!audioEnabled);
              }}
              className={`p-2 rounded-lg border transition-colors ${
                audioEnabled
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/40 hover:bg-blue-600/30'
                  : 'bg-slate-800 text-slate-500 border-slate-700'
              }`}
              title={audioEnabled ? "Audio Alarm Enabled (Click to test chime)" : "Audio Alarm Muted"}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Alerts Quick Badge */}
            <button
              onClick={() => setActiveTab('alerts')}
              className="relative p-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
              title="Active Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {activeAlertCount}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Desktop Nav Bar */}
        <nav className="hidden md:flex space-x-1 border-t border-slate-800/80 pt-1 pb-2 overflow-x-auto text-xs">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive ? 'bg-white text-blue-700' : 'bg-red-500 text-white'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          {/* Mobile search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 1,872 villages..."
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-400"
            />
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`px-3 py-2 rounded text-left text-xs font-medium flex items-center justify-between ${
                  activeTab === item.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-800/80 text-slate-300'
                }`}
              >
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
