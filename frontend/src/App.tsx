import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DisclaimerBanner } from './components/DisclaimerBanner';
import { Dashboard } from './pages/Dashboard';
import { LiveMap } from './pages/LiveMap';
import { Districts } from './pages/Districts';
import { VillageDashboard } from './pages/Village';
import { RiskAnalysis } from './pages/RiskAnalysis';
import { Sensors } from './pages/Sensors';
import { Alerts } from './pages/Alerts';
import { Historical } from './pages/Historical';
import { DataSources } from './pages/DataSources';
import { About } from './pages/About';
import { VillageTable } from './components/VillageTable';
import { fetchVillages, fetchDistricts, playAlertSiren } from './services/api';
import { Village, DistrictSummary } from './types';
import { Activity, ShieldAlert, Waves } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [villages, setVillages] = useState<Village[]>([]);
  const [districts, setDistricts] = useState<DistrictSummary[]>([]);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [loading, setLoading] = useState(true);

  // Load master dataset on boot
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [vList, dList] = await Promise.all([
          fetchVillages(),
          fetchDistricts()
        ]);
        setVillages(vList);
        setDistricts(dList);

        // Pre-select a notable village for easy inspection
        if (vList.length > 0) {
          const burliyar = vList.find(v => v.village_name.toLowerCase().includes('burliyar')) || vList[0];
          setSelectedVillage(burliyar);
        }
      } catch (err) {
        console.error('Failed to load system datasets', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectVillage = (village: Village) => {
    setSelectedVillage(village);
    setActiveTab('village');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLocateMap = (target: Village | string) => {
    if (typeof target === 'object') {
      setSelectedVillage(target);
    }
    setActiveTab('livemap');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Automated 2-Minute SIH Demo Scenario
  const handleStartDemoScenario = () => {
    const demoTarget = villages.find(v => v.village_name.toLowerCase().includes('burliyar')) || 
                       villages.find(v => v.district === 'The Nilgiris') || 
                       villages[0];

    if (demoTarget) {
      setSelectedVillage(demoTarget);
      setActiveTab('village');
      playAlertSiren();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const activeAlertCount = villages.filter(v => v.risk.alert_status === 'ACTIVE' || v.risk.risk_score >= 61).length;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      {/* Disclaimer Warning Ticker */}
      <DisclaimerBanner />

      {/* Main Government Disaster Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onSelectVillage={handleSelectVillage}
        activeAlertCount={activeAlertCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {loading ? (
          <div className="h-96 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 animate-spin">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-center">
              <div className="text-base font-bold text-white">Loading Master Cadastre Dataset...</div>
              <div className="text-xs text-slate-400 mt-1 font-mono">
                Connecting 1,872 official Tamil Nadu village records across 5 hilly districts
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                villages={villages}
                districts={districts}
                onSelectVillage={handleSelectVillage}
                onNavigateTab={setActiveTab}
                onStartDemoScenario={handleStartDemoScenario}
              />
            )}

            {activeTab === 'livemap' && (
              <LiveMap
                villages={villages}
                districts={districts}
                onSelectVillage={handleSelectVillage}
                selectedVillageInitial={selectedVillage}
              />
            )}

            {activeTab === 'districts' && (
              <Districts
                districts={districts}
                villages={villages}
                onSelectVillage={handleSelectVillage}
                onLocateMap={(distName) => {
                  setActiveTab('livemap');
                }}
              />
            )}

            {activeTab === 'villages' && (
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
                  <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                    <Waves className="w-6 h-6 text-blue-400" />
                    Tamil Nadu Hilly Villages Master Directory (1,872 Official Records)
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Complete administrative cadastre connecting Sub-Districts, Gram Panchayats, LGD codes, and dynamic flash flood risk scores
                  </p>
                </div>

                <VillageTable
                  villages={villages}
                  onSelectVillage={handleSelectVillage}
                />
              </div>
            )}

            {activeTab === 'village' && selectedVillage && (
              <VillageDashboard
                village={selectedVillage}
                onBack={() => setActiveTab('villages')}
                onLocateMap={handleLocateMap}
              />
            )}

            {activeTab === 'riskanalysis' && (
              <RiskAnalysis />
            )}

            {activeTab === 'sensors' && (
              <Sensors
                villages={villages}
                onSelectVillage={handleSelectVillage}
              />
            )}

            {activeTab === 'alerts' && (
              <Alerts
                villages={villages}
                onSelectVillage={handleSelectVillage}
                onLocateMap={handleLocateMap}
              />
            )}

            {activeTab === 'historical' && (
              <Historical
                villages={villages}
                onSelectVillage={handleSelectVillage}
              />
            )}

            {activeTab === 'datasources' && (
              <DataSources />
            )}

            {activeTab === 'about' && (
              <About />
            )}
          </>
        )}
      </main>

      {/* Emergency Management Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-[10px]">
              TN
            </div>
            <div>
              <span className="font-bold text-white">Tamil Nadu Hyperlocal Flash Flood Early Warning System</span>
              <p className="text-[11px] text-slate-500">Smart India Hackathon Problem Statement SIH26192 Prototype</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <span>Nilgiris • Dindigul • Coimbatore • Theni • Salem</span>
            <span>|</span>
            <span className="text-emerald-400 font-mono">1,872 Cadastre Units Active</span>
            <span>|</span>
            <button
              onClick={() => setActiveTab('about')}
              className="text-blue-400 hover:underline font-semibold"
            >
              System Documentation
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
