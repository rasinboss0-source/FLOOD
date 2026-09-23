let currentVillageId = "TN-NIL-01";
let allVillages = [];
let currentVillageData = null;
let currentPrediction = null;

// Audio Siren Synthesis (Web Audio API)
let audioCtx = null;
let sirenOsc = null;
let sirenGain = null;
let isSirenMuted = true;
let isEmergencyActive = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function toggleSirenAudio() {
    initAudio();
    const btn = document.getElementById("btn-audio-toggle");
    
    if (isSirenMuted) {
        isSirenMuted = false;
        if (btn) btn.innerHTML = "🔊";
        if (isEmergencyActive) {
            startSirenSound();
        }
    } else {
        isSirenMuted = true;
        if (btn) btn.innerHTML = "🔇";
        stopSirenSound();
    }
}

function startSirenSound() {
    if (isSirenMuted || !audioCtx) return;
    stopSirenSound();

    try {
        sirenOsc = audioCtx.createOscillator();
        sirenGain = audioCtx.createGain();
        sirenOsc.type = "sine";
        
        // Warbling frequency between 600Hz and 950Hz
        const now = audioCtx.currentTime;
        sirenOsc.frequency.setValueAtTime(600, now);
        for (let i = 0; i < 30; i++) {
            sirenOsc.frequency.linearRampToValueAtTime(950, now + (i * 0.8) + 0.4);
            sirenOsc.frequency.linearRampToValueAtTime(600, now + (i * 0.8) + 0.8);
        }

        sirenGain.gain.setValueAtTime(0.15, now);
        sirenOsc.connect(sirenGain);
        sirenGain.connect(audioCtx.destination);
        sirenOsc.start();
    } catch (e) {
        console.warn("Audio siren error:", e);
    }
}

function stopSirenSound() {
    if (sirenOsc) {
        try {
            sirenOsc.stop();
            sirenOsc.disconnect();
        } catch (e) {}
        sirenOsc = null;
    }
}

// Navigation & Tab Switching
function switchTab(tabId) {
    document.querySelectorAll(".tab-screen").forEach(el => el.classList.remove("active"));
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));

    const targetScreen = document.getElementById(`tab-${tabId}`);
    const targetNav = document.getElementById(`nav-${tabId}`);

    if (targetScreen) targetScreen.classList.add("active");
    if (targetNav) targetNav.classList.add("active");

    if (tabId === "map") {
        setTimeout(() => {
            if (window.map) window.map.invalidateSize();
            if (currentVillageData && currentPrediction) {
                updateMapForVillage(currentVillageData, currentPrediction);
            }
        }, 150);
    }
}

// Village Loading and Data Flow
async function loadVillagesList(filterState = null) {
    try {
        let url = "/api/villages";
        if (filterState && filterState !== "All") {
            url += `?state=${encodeURIComponent(filterState)}`;
        }
        const resp = await fetch(url);
        allVillages = await resp.json();

        const selectEl = document.getElementById("village-select");
        if (selectEl) {
            selectEl.innerHTML = "";
            allVillages.forEach(v => {
                const opt = document.createElement("option");
                opt.value = v.village_id;
                opt.innerText = `${v.name} (${v.district}, ${v.state})`;
                selectEl.appendChild(opt);
            });
            selectEl.value = currentVillageId;
        }
    } catch (err) {
        console.error("Failed to load villages list:", err);
    }
}

async function loadVillagePrediction(villageId) {
    currentVillageId = villageId;
    try {
        // 1. Fetch complete village GIS profile
        const detailResp = await fetch(`/api/villages/${villageId}`);
        currentVillageData = await detailResp.json();

        // 2. Fetch AI flood prediction
        const predResp = await fetch(`/api/villages/${villageId}/predict`);
        currentPrediction = await predResp.json();

        // 3. Render UI components
        renderDashboard(currentVillageData, currentPrediction);
        renderShelters(currentVillageData.static_gis?.evacuation_shelters || []);
        renderExplainability(currentPrediction.prediction?.contributing_factors || [], currentPrediction.hydrology || {});
        renderIoTStatus(currentPrediction.iot_status, currentPrediction.live_metrics);

        // 4. Update Map
        if (window.map) {
            updateMapForVillage(currentVillageData, currentPrediction);
        }
    } catch (err) {
        console.error("Error loading prediction for village:", err);
    }
}

function renderDashboard(village, data) {
    const pred = data.prediction || {};
    const bulletin = data.bulletin || {};
    const live = data.live_metrics || {};
    const prob = pred.probability_pct || 0;
    const risk = pred.risk_level || "LOW";

    // Location badge
    const locBadge = document.getElementById("location-label");
    if (locBadge) locBadge.innerHTML = `📍 ${village.name}, ${village.district} (${village.state})`;

    // Circular Probability Gauge
    const gaugeProgress = document.getElementById("gauge-progress");
    const gaugePct = document.getElementById("gauge-pct");
    if (gaugeProgress) {
        // SVG circle radius = 70 -> circumference = 2 * PI * 70 = 440
        const offset = 440 - (440 * (prob / 100));
        gaugeProgress.style.strokeDashoffset = offset;

        const colors = {
            "LOW": "#22c55e",
            "MODERATE": "#eab308",
            "HIGH": "#f97316",
            "VERY HIGH": "#ef4444"
        };
        gaugeProgress.style.stroke = colors[risk] || "#0284c7";
    }
    if (gaugePct) gaugePct.innerText = prob;

    // Risk Pill
    const riskPill = document.getElementById("risk-pill");
    if (riskPill) {
        riskPill.innerText = risk;
        riskPill.className = `risk-pill ${risk.toLowerCase().replace(' ', '-')}`;
    }

    // Hero card border accent
    const heroCard = document.getElementById("risk-hero-card");
    if (heroCard) {
        heroCard.className = `risk-hero-card ${risk.toLowerCase().replace(' ', '-')}`;
    }

    // Siren button & Emergency state
    isEmergencyActive = (risk === "HIGH" || risk === "VERY HIGH");
    const sirenBtn = document.getElementById("btn-siren-indicator");
    const alertTicker = document.getElementById("alert-ticker");
    const tickerText = document.getElementById("ticker-text");

    if (isEmergencyActive) {
        if (sirenBtn) sirenBtn.classList.add("active");
        if (alertTicker) alertTicker.classList.remove("hidden");
        if (tickerText) tickerText.innerText = bulletin.headline;
        if (!isSirenMuted) startSirenSound();
    } else {
        if (sirenBtn) sirenBtn.classList.remove("active");
        if (alertTicker) alertTicker.classList.add("hidden");
        stopSirenSound();
    }

    // Emergency Bulletin
    const bHeadline = document.getElementById("bulletin-headline");
    const bList = document.getElementById("bulletin-list");
    if (bHeadline) bHeadline.innerText = bulletin.headline;
    if (bList) {
        bList.innerHTML = "";
        (bulletin.instructions || []).forEach(inst => {
            const li = document.createElement("li");
            li.innerText = inst;
            bList.appendChild(li);
        });
    }

    // Live Metrics
    const valRain1h = document.getElementById("metric-rain-1h");
    const valRain24h = document.getElementById("metric-rain-24h");
    const valRiverLevel = document.getElementById("metric-river-level");
    const valRiverTrend = document.getElementById("metric-river-trend");
    const valSoilMoisture = document.getElementById("metric-soil-moisture");
    const valRunoffIndex = document.getElementById("metric-runoff-index");

    if (valRain1h) valRain1h.innerText = `${live.rainfall_1h} mm`;
    if (valRain24h) valRain24h.innerText = `Past 24h: ${live.rainfall_24h} mm`;
    if (valRiverLevel) valRiverLevel.innerText = `${live.river_water_level_m} m`;

    if (valRiverTrend) {
        const rr = live.river_rise_rate_m_per_hr || 0;
        if (rr >= 0.3) {
            valRiverTrend.innerHTML = `<span class="trend-up">↑ Rising rapidly (+${rr} m/h)</span>`;
        } else if (rr > 0.05) {
            valRiverTrend.innerHTML = `<span class="trend-up">↗ Climbing (+${rr} m/h)</span>`;
        } else if (rr < -0.05) {
            valRiverTrend.innerHTML = `<span class="trend-down">↓ Receding (${rr} m/h)</span>`;
        } else {
            valRiverTrend.innerHTML = `<span class="trend-flat">→ Stable</span>`;
        }
    }

    if (valSoilMoisture) valSoilMoisture.innerText = `${live.soil_moisture_pct}%`;
    if (valRunoffIndex) valRunoffIndex.innerText = `${data.hydrology?.runoff_index || 12.4}`;

    // Last updated
    const lastUpdateEl = document.getElementById("last-updated-text");
    if (lastUpdateEl) {
        const d = new Date(live.updated_at);
        lastUpdateEl.innerText = `Updated ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} via ${live.data_source}`;
    }
}

function renderShelters(shelters) {
    const listEl = document.getElementById("shelters-list");
    if (!listEl) return;
    listEl.innerHTML = "";

    if (!shelters || shelters.length === 0) {
        listEl.innerHTML = `<p style="font-size: 12px; color: #94a3b8;">No designated shelters registered for this village.</p>`;
        return;
    }

    shelters.forEach(s => {
        const card = document.createElement("div");
        card.className = "shelter-card";
        card.innerHTML = `
            <div class="shelter-info">
                <h4>🛡️ ${s.name}</h4>
                <div class="shelter-details">
                    <span>Elevation: <strong>${s.elevation_m}m</strong> (Safe Ridge)</span>
                    <span>Distance: <strong>${s.distance_km} km</strong></span>
                    <span>Capacity: <strong>${s.capacity}</strong></span>
                </div>
            </div>
            <a href="tel:${s.contact}" class="btn-call">📞 Call</a>
        `;
        listEl.appendChild(card);
    });
}

function renderExplainability(factors, hydrology) {
    const container = document.getElementById("explain-factors-list");
    if (!container) return;
    container.innerHTML = "";

    if (!factors || factors.length === 0) {
        container.innerHTML = `<p style="font-size: 12px; color: #94a3b8;">Normal parameters; no abnormal risk drivers identified.</p>`;
        return;
    }

    factors.forEach(f => {
        const item = document.createElement("div");
        item.className = "factor-item";
        const impactClass = f.impact.toLowerCase();
        item.innerHTML = `
            <div class="factor-top">
                <span class="factor-name">${f.feature} (${f.value})</span>
                <span class="factor-tag ${impactClass}">${f.impact}</span>
            </div>
            <p class="factor-desc">${f.explanation}</p>
        `;
        container.appendChild(item);
    });
}

function renderIoTStatus(iot, live) {
    const stId = document.getElementById("iot-station-id");
    const stStatus = document.getElementById("iot-station-status");
    const stBattery = document.getElementById("iot-station-battery");
    const stRssi = document.getElementById("iot-station-rssi");
    const stRain = document.getElementById("iot-telemetry-rain");
    const stLevel = document.getElementById("iot-telemetry-level");
    const stSoil = document.getElementById("iot-telemetry-soil");

    if (stId) stId.innerText = iot?.station_id || "ESP32-LOCAL-01";
    if (stStatus) stStatus.innerText = iot?.status || "ONLINE";
    if (stBattery) stBattery.innerText = `${iot?.battery_voltage || 3.95} V`;
    if (stRssi) stRssi.innerText = `${iot?.signal_rssi || -72} dBm`;
    if (stRain) stRain.innerText = `${live?.rainfall_1h || 0} mm`;
    if (stLevel) stLevel.innerText = `${live?.river_water_level_m || 1.8} m`;
    if (stSoil) stSoil.innerText = `${live?.soil_moisture_pct || 45}%`;
}

// Setup Event Listeners
document.addEventListener("DOMContentLoaded", async () => {
    // 1. Load villages and initial prediction
    await loadVillagesList();
    await loadVillagePrediction(currentVillageId);

    // 2. Initialize Map & Simulator
    initMap();
    initSimulator();

    // 3. Setup Dropdown listener
    const selectEl = document.getElementById("village-select");
    if (selectEl) {
        selectEl.addEventListener("change", (e) => {
            loadVillagePrediction(e.target.value);
        });
    }

    // 4. State Filter Chips
    document.querySelectorAll(".chip").forEach(chip => {
        chip.addEventListener("click", () => {
            document.querySelectorAll(".chip").forEach(c => c.classList.remove("active"));
            chip.classList.add("active");
            const st = chip.getAttribute("data-state");
            loadVillagesList(st);
        });
    });

    // 5. Bottom Nav Tabs
    document.querySelectorAll(".nav-item").forEach(item => {
        item.addEventListener("click", () => {
            const tab = item.getAttribute("data-tab");
            switchTab(tab);
        });
    });

    // 6. View Mode Toggle (Mobile Mockup vs Full Desktop)
    const btnToggleView = document.getElementById("btn-toggle-view");
    const appContainer = document.querySelector(".app-container");
    if (btnToggleView && appContainer) {
        btnToggleView.addEventListener("click", () => {
            appContainer.classList.toggle("desktop-mode");
            btnToggleView.innerText = appContainer.classList.contains("desktop-mode") ? "📱 Mobile View" : "🖥️ Desktop View";
            setTimeout(() => {
                if (window.map) window.map.invalidateSize();
            }, 300);
        });
    }

    // 7. Audio Siren Toggle Button
    const btnAudio = document.getElementById("btn-audio-toggle");
    if (btnAudio) {
        btnAudio.addEventListener("click", toggleSirenAudio);
    }

    // 8. Refresh Button
    const btnRefresh = document.getElementById("btn-refresh");
    if (btnRefresh) {
        btnRefresh.addEventListener("click", () => {
            loadVillagePrediction(currentVillageId);
        });
    }

    // 9. Auto-refresh polling every 30 seconds
    setInterval(() => {
        loadVillagePrediction(currentVillageId);
    }, 30000);
});
