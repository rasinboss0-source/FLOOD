let map = null;
let villageMarker = null;
let catchmentLayer = null;
let streamLayer = null;
let shelterMarkers = [];
let allVillageMarkers = [];

function initMap() {
    if (map) return;
    const mapEl = document.getElementById("map");
    if (!mapEl) return;

    // Center on India
    map = L.map("map", {
        zoomControl: true,
        attributionControl: false
    }).setView([11.3530, 76.7959], 13);

    // Modern dark tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 18,
        subdomains: 'abcd'
    }).addTo(map);

    // Initial resize trigger
    setTimeout(() => {
        map.invalidateSize();
    }, 400);
}

function updateMapForVillage(villageData, predictionData) {
    if (!map) initMap();
    if (!map || !villageData) return;

    const lat = villageData.latitude;
    const lon = villageData.longitude;
    const gis = villageData.static_gis || {};
    const risk = predictionData?.prediction?.risk_level || "LOW";

    // Set map view smoothly
    map.setView([lat, lon], 13);

    // 1. Clear existing layers
    if (villageMarker) map.removeLayer(villageMarker);
    if (catchmentLayer) map.removeLayer(catchmentLayer);
    if (streamLayer) map.removeLayer(streamLayer);
    shelterMarkers.forEach(m => map.removeLayer(m));
    shelterMarkers = [];

    // 2. Risk color mapping
    const riskColors = {
        "LOW": "#22c55e",
        "MODERATE": "#eab308",
        "HIGH": "#f97316",
        "VERY HIGH": "#ef4444"
    };
    const color = riskColors[risk] || "#0284c7";

    // 3. Upstream Catchment Polygon
    const polyCoords = gis.upstream_polygon;
    if (polyCoords && polyCoords.length > 2) {
        catchmentLayer = L.polygon(polyCoords, {
            color: color,
            weight: 2,
            opacity: 0.8,
            fillColor: color,
            fillOpacity: 0.15,
            dashArray: '4, 6'
        }).addTo(map);
        catchmentLayer.bindTooltip(`Upstream Catchment: ${gis.catchment_area_sqkm} km² (Drains to village)`, {
            sticky: true,
            className: 'catchment-tooltip'
        });
    }

    // 4. Stream representation (Synthetic reach towards village)
    const streamCoords = [
        [lat + 0.015, lon - 0.015],
        [lat + 0.008, lon - 0.005],
        [lat + 0.002, lon + 0.002],
        [lat, lon]
    ];
    streamLayer = L.polyline(streamCoords, {
        color: "#38bdf8",
        weight: 4,
        opacity: 0.85
    }).addTo(map);
    streamLayer.bindTooltip(`Stream: ${gis.nearest_stream_name || 'River Tributary'} (${gis.distance_to_stream_m}m)`, {
        sticky: true
    });

    // 5. Village Center Marker
    const iconHtml = `
        <div style="
            background: ${color};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid #ffffff;
            box-shadow: 0 0 16px ${color};
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            color: #fff;
        ">📍</div>
    `;
    const villageIcon = L.divIcon({
        className: 'custom-pin',
        html: iconHtml,
        iconSize: [28, 28],
        iconAnchor: [14, 28]
    });

    villageMarker = L.marker([lat, lon], { icon: villageIcon }).addTo(map);
    villageMarker.bindPopup(`
        <div style="font-family: inherit; min-width: 160px;">
            <strong style="font-size: 14px;">${villageData.name}</strong><br/>
            <span style="font-size: 11px; color: #64748b;">${villageData.district}, ${villageData.state}</span>
            <hr style="margin: 6px 0; border: none; border-top: 1px solid #e2e8f0;"/>
            <div style="font-size: 12px; margin-top: 4px;">
                <strong>Est. Risk:</strong> <span style="color: ${color}; font-weight: bold;">${risk}</span> (${predictionData?.prediction?.probability_pct || 0}%)<br/>
                <strong>Elevation:</strong> ${gis.elevation_m} m<br/>
                <strong>Slope:</strong> ${gis.slope_deg}°<br/>
                <strong>Nearest Stream:</strong> ${gis.nearest_stream_name}
            </div>
        </div>
    `).openPopup();

    // 6. Shelter Markers
    const shelters = gis.evacuation_shelters || [];
    shelters.forEach((s, idx) => {
        // Place shelter offset from village based on distance
        const offsetLat = lat + (0.005 * (idx + 1));
        const offsetLon = lon + (0.004 * (idx + 1));
        
        const shelterIcon = L.divIcon({
            className: 'shelter-pin',
            html: `<div style="background: #059669; width: 22px; height: 22px; border-radius: 6px; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 11px; color: white;">🛡️</div>`,
            iconSize: [22, 22],
            iconAnchor: [11, 11]
        });

        const sm = L.marker([offsetLat, offsetLon], { icon: shelterIcon }).addTo(map);
        sm.bindPopup(`
            <div style="font-size: 12px;">
                <strong>🛡️ ${s.name}</strong><br/>
                <span>Elevation: ${s.elevation_m} m (High Ground)</span><br/>
                <span>Distance: ${s.distance_km} km</span><br/>
                <span>Capacity: ${s.capacity} persons</span><br/>
                <a href="tel:${s.contact}" style="color: #059669; font-weight: bold; text-decoration: none; display: inline-block; margin-top: 4px;">📞 Call ${s.contact}</a>
            </div>
        `);
        shelterMarkers.push(sm);
    });

    setTimeout(() => {
        map.invalidateSize();
    }, 200);
}
