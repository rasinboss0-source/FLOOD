import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Village } from '../types';
import { Layers, MapPin, Navigation, Eye, CheckSquare, Square, Info } from 'lucide-react';

interface RiskMapProps {
  villages: Village[];
  selectedVillage?: Village | null;
  onSelectVillage: (village: Village) => void;
  selectedDistrict?: string;
  className?: string;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  villages,
  selectedVillage,
  onSelectVillage,
  selectedDistrict,
  className = "h-[600px]"
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const sheltersLayerRef = useRef<L.LayerGroup | null>(null);
  const streamsLayerRef = useRef<L.LayerGroup | null>(null);

  // Layer toggles
  const [showVillageRisk, setShowVillageRisk] = useState(true);
  const [showShelters, setShowShelters] = useState(true);
  const [showStreams, setShowStreams] = useState(true);
  const [showIoTNodes, setShowIoTNodes] = useState(true);
  const [layerControlOpen, setLayerControlOpen] = useState(false);

  // Filter villages by selected district if present
  const activeVillages = villages.filter(v => {
    if (selectedDistrict && selectedDistrict !== 'ALL' && v.district !== selectedDistrict) {
      return false;
    }
    return true;
  });

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [11.15, 77.20],
        zoom: 8,
        minZoom: 7,
        maxZoom: 16,
      });

      // CartoDB Dark Matter or OpenStreetMap tile layer for emergency theme
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 19
      }).addTo(map);

      markersLayerRef.current = L.layerGroup().addTo(map);
      sheltersLayerRef.current = L.layerGroup().addTo(map);
      streamsLayerRef.current = L.layerGroup().addTo(map);

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Markers when villages, selectedDistrict, or layers change
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    if (sheltersLayerRef.current) sheltersLayerRef.current.clearLayers();
    if (streamsLayerRef.current) streamsLayerRef.current.clearLayers();

    if (!showVillageRisk) return;

    // Helper to get marker color & label
    const getMarkerVisuals = (level: string) => {
      switch (level) {
        case 'VERY HIGH':
          return { color: '#a855f7', label: '🟣 VERY HIGH', bgClass: 'bg-purple-600', pulse: true };
        case 'HIGH':
          return { color: '#ef4444', label: '🔴 HIGH', bgClass: 'bg-red-600', pulse: true };
        case 'ELEVATED':
          return { color: '#f97316', label: '🟠 ELEVATED', bgClass: 'bg-orange-500', pulse: false };
        case 'MODERATE':
          return { color: '#f59e0b', label: '🟡 MODERATE', bgClass: 'bg-amber-500', pulse: false };
        default:
          return { color: '#10b981', label: '🟢 LOW', bgClass: 'bg-emerald-500', pulse: false };
      }
    };

    activeVillages.forEach((village) => {
      const { color, label, pulse } = getMarkerVisuals(village.risk.risk_level);
      const isSelected = selectedVillage && selectedVillage.id === village.id;

      // Custom HTML Leaflet DivIcon
      const markerHtml = `
        <div class="relative group cursor-pointer flex flex-col items-center">
          <div style="background-color: ${color}; width: ${isSelected ? '20px' : '14px'}; height: ${isSelected ? '20px' : '14px'};" 
               class="rounded-full border-2 border-white shadow-lg ${pulse ? 'animate-ping opacity-75' : ''}">
          </div>
          <div style="background-color: ${color}; width: ${isSelected ? '20px' : '14px'}; height: ${isSelected ? '20px' : '14px'};" 
               class="rounded-full border-2 border-white shadow-lg absolute top-0">
          </div>
          ${isSelected ? `<span class="bg-slate-900 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow mt-1 whitespace-nowrap border border-slate-700">${village.village_name}</span>` : ''}
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'custom-risk-marker',
        html: markerHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([village.latitude, village.longitude], { icon: customIcon });

      // Popup Content
      const popupHtml = `
        <div style="font-family: system-ui, sans-serif; min-width: 220px; color: #0f172a; padding: 2px;">
          <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; margin-bottom: 6px;">
            <strong style="font-size: 14px; color: #0f172a;">${village.village_name}</strong>
            <span style="font-size: 10px; font-weight: bold; background: ${color}20; color: ${color}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${color}50;">
              ${village.risk.risk_score} / 100
            </span>
          </div>
          <div style="font-size: 11px; color: #475569; line-height: 1.5;">
            <div><b>Sub-District:</b> ${village.sub_district} (${village.district})</div>
            <div><b>Village Code:</b> ${village.village_code} | <b>LGD:</b> ${village.lgd_code}</div>
            <div><b>Coverage:</b> ${village.coverage_type}</div>
            <div><b>Rainfall:</b> ${village.live.rainfall_1h_mm} mm/hr</div>
            <div><b>Soil Moisture:</b> ${village.live.soil_moisture_pct}%</div>
            <div><b>Stream Level:</b> ${village.live.water_level_m} m</div>
            <div style="margin-top: 4px; font-weight: bold; color: ${color};">
              Status: ${label}
            </div>
          </div>
          <button id="btn-select-${village.id}" style="width: 100%; margin-top: 8px; background: #2563eb; color: white; border: none; padding: 5px 8px; border-radius: 6px; font-size: 11px; font-weight: bold; cursor: pointer;">
            Open Village Risk Dashboard →
          </button>
        </div>
      `;

      marker.bindPopup(popupHtml);
      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${village.id}`);
        if (btn) {
          btn.onclick = () => onSelectVillage(village);
        }
      });

      markersLayerRef.current?.addLayer(marker);

      // Add shelter marker if enabled
      if (showShelters && sheltersLayerRef.current && village.static.nearest_shelter && isSelected) {
        const shelterIcon = L.divIcon({
          className: 'shelter-marker',
          html: `<div style="background: #0284c7; color: white; border: 2px solid white; border-radius: 6px; padding: 2px 5px; font-size: 9px; font-weight: bold; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">🏛️ Relief Shelter</div>`,
          iconSize: [80, 20],
          iconAnchor: [40, 25]
        });
        const shelterMarker = L.marker([village.latitude + 0.005, village.longitude + 0.004], { icon: shelterIcon });
        shelterMarker.bindPopup(`<b>Relief Shelter:</b><br/>${village.static.nearest_shelter}<br/>Capacity: Approx. 400 persons`);
        sheltersLayerRef.current.addLayer(shelterMarker);
      }
    });

    // Zoom to selected village or fit bounds to district
    if (selectedVillage && map) {
      map.flyTo([selectedVillage.latitude, selectedVillage.longitude], 12, { duration: 1.2 });
    } else if (activeVillages.length > 0 && map && selectedDistrict && selectedDistrict !== 'ALL') {
      const group = L.featureGroup(markersLayerRef.current?.getLayers() || []);
      map.fitBounds(group.getBounds().pad(0.1));
    }
  }, [activeVillages, selectedVillage, showVillageRisk, showShelters, selectedDistrict]);

  return (
    <div className={`relative w-full rounded-xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900 ${className}`}>
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Floating Layer Control Panel */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col items-end">
        <button
          onClick={() => setLayerControlOpen(!layerControlOpen)}
          className="bg-slate-900/90 text-white border border-slate-700 p-2.5 rounded-lg shadow-xl hover:bg-slate-800 flex items-center gap-2 text-xs font-semibold backdrop-blur"
        >
          <Layers className="w-4 h-4 text-blue-400" />
          <span>GIS Layers</span>
        </button>

        {layerControlOpen && (
          <div className="mt-2 w-64 bg-slate-900/95 border border-slate-700 rounded-xl p-3.5 shadow-2xl backdrop-blur text-xs space-y-2.5 text-slate-200 animate-in fade-in slide-in-from-top-2">
            <div className="font-bold text-slate-100 uppercase tracking-wider text-[11px] pb-1.5 border-b border-slate-800 flex justify-between">
              <span>Interactive Map Layers</span>
              <span className="text-blue-400 font-mono">SIH26192</span>
            </div>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showVillageRisk}
                onChange={(e) => setShowVillageRisk(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Village Hyperlocal Risk Markers</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showShelters}
                onChange={(e) => setShowShelters(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Designated Evacuation Shelters</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showIoTNodes}
                onChange={(e) => setShowIoTNodes(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>IoT Telemetry Sensor Nodes</span>
            </label>

            <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-1">
              <div>• Elevation / SRTM: Connected</div>
              <div>• Streams & Rivers: Hydrological Flow Grid</div>
              <div className="text-amber-400/90 font-medium">
                Village boundary data not connected — point location shown.
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating Risk Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 shadow-xl backdrop-blur text-xs flex flex-wrap items-center gap-3">
        <span className="font-bold text-slate-300 text-[11px]">RISK STATUS:</span>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
          <span className="text-slate-300 font-medium text-[11px]">0-20 LOW</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
          <span className="text-slate-300 font-medium text-[11px]">21-40 MODERATE</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500 inline-block"></span>
          <span className="text-slate-300 font-medium text-[11px]">41-60 ELEVATED</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
          <span className="text-slate-300 font-medium text-[11px]">61-80 HIGH</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block animate-pulse"></span>
          <span className="text-slate-300 font-medium text-[11px]">81-100 VERY HIGH</span>
        </div>
      </div>
    </div>
  );
};
