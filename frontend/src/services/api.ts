import { Village, DistrictSummary, SubDistrictSummary } from '../types';

let cachedVillages: Village[] | null = null;
let cachedDistricts: DistrictSummary[] | null = null;
let cachedSubDistricts: SubDistrictSummary[] | null = null;

let isDemoMode = true; // Default to Demo Mode as required: "entire website must work without external API keys"

export function getSystemMode(): 'demo' | 'live' {
  return isDemoMode ? 'demo' : 'live';
}

export function setSystemMode(mode: 'demo' | 'live') {
  isDemoMode = mode === 'demo';
}

export async function fetchDistricts(): Promise<DistrictSummary[]> {
  if (cachedDistricts) return cachedDistricts;

  try {
    const res = await fetch('/data/districts_master.json');
    if (res.ok) {
      cachedDistricts = await res.json();
      return cachedDistricts!;
    }
  } catch (err) {
    console.warn('Failed to load districts from public/data, fallback to API/local', err);
  }

  // Live fallback
  if (!isDemoMode) {
    const apiRes = await fetch('/api/districts');
    return await apiRes.json();
  }
  return [];
}

export async function fetchSubDistricts(): Promise<SubDistrictSummary[]> {
  if (cachedSubDistricts) return cachedSubDistricts;

  try {
    const res = await fetch('/data/subdistricts_master.json');
    if (res.ok) {
      cachedSubDistricts = await res.json();
      return cachedSubDistricts!;
    }
  } catch (err) {
    console.warn('Failed to load subdistricts from public/data', err);
  }
  return [];
}

export async function fetchVillages(): Promise<Village[]> {
  if (cachedVillages) return cachedVillages;

  try {
    const res = await fetch('/data/villages_master.json');
    if (res.ok) {
      cachedVillages = await res.json();
      return cachedVillages!;
    }
  } catch (err) {
    console.error('Failed to load villages master dataset', err);
  }

  if (!isDemoMode) {
    const apiRes = await fetch('/api/villages');
    return await apiRes.json();
  }
  return [];
}

export async function getVillageById(id: string): Promise<Village | undefined> {
  const villages = await fetchVillages();
  return villages.find(v => v.id === id || v.village_code === id);
}

export async function searchVillages(query: string, limit = 50): Promise<Village[]> {
  if (!query || query.trim().length === 0) return [];
  const villages = await fetchVillages();
  const q = query.toLowerCase().trim();

  const results: Village[] = [];
  for (const v of villages) {
    if (
      v.village_name.toLowerCase().includes(q) ||
      v.village_code.toLowerCase().includes(q) ||
      v.lgd_code.toLowerCase().includes(q) ||
      v.sub_district.toLowerCase().includes(q) ||
      v.district.toLowerCase().includes(q) ||
      v.gram_panchayat_ulb.toLowerCase().includes(q)
    ) {
      results.push(v);
      if (results.length >= limit) break;
    }
  }
  return results;
}

export interface PredictionInput {
  village_id: string;
  rainfall_1h: number;
  rainfall_3h: number;
  rainfall_24h: number;
  rainfall_7d: number;             // Group B: 7-day antecedent wetness index
  soil_moisture: number;
  water_level: number;
  water_level_rate: number;
  river_discharge_cumecs?: number; // Group B: CWC flow volume
}

export interface PredictionOutput {
  village_id: string;
  // Flood model (Group D)
  risk_score: number;
  risk_level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY HIGH';
  flood_probability: number;
  prediction_window: string;
  lead_time_hrs: number;           // Group D: numeric lead time
  // Landslide model (Group D — separate head)
  landslide_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
  landslide_probability: number;
  timestamp: string;
  shap_factors: {
    factor: string;
    weight: number;
    contribution: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH';
    val: string;
  }[];
}

export async function predictRisk(
  input: PredictionInput,
  villageSlope = 20,
  catchmentArea = 15,
  landslidZoneFlag = false
): Promise<PredictionOutput> {
  if (!isDemoMode) {
    try {
      const res = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      if (res.ok) return await res.json();
    } catch (e) {
      console.warn('API predict failed, fallback to client-side ML engine', e);
    }
  }

  // ── Group A+B+C Fusion: Flood Model (XGBoost/GBT approximation) ──────────
  // Feature components (normalized 0–100)
  const c_rf     = Math.min(100, (input.rainfall_1h / 65.0) * 100);
  const c_ant7d  = Math.min(100, ((input.rainfall_7d ?? 0) / 280.0) * 100); // 7-day antecedent wetness
  const c_soil   = Math.min(100, Math.max(0, (input.soil_moisture - 40) / 55.0 * 100));
  const c_water  = Math.min(100, (input.water_level / 3.5) * 70 + (input.water_level_rate / 0.3) * 30);
  const c_disch  = input.river_discharge_cumecs
    ? Math.min(100, (input.river_discharge_cumecs / 500.0) * 100)
    : c_water * 0.85; // fallback when CWC gauge not available
  const c_terrain    = Math.min(100, (villageSlope / 35.0) * 100);
  const c_catchment  = Math.min(100, (catchmentArea / 45.0) * 100);

  // Weighted fusion — adjusted weights to incorporate antecedent + discharge
  const rawScore = (
    c_rf        * 0.28 +
    c_ant7d     * 0.06 +
    c_soil      * 0.22 +
    c_water     * 0.18 +
    c_disch     * 0.08 +
    c_terrain   * 0.12 +
    c_catchment * 0.06
  );
  const risk_score = Math.min(99, Math.max(5, Math.round(rawScore)));

  let risk_level: 'LOW' | 'MODERATE' | 'ELEVATED' | 'HIGH' | 'VERY HIGH' = 'LOW';
  if (risk_score >= 81)      risk_level = 'VERY HIGH';
  else if (risk_score >= 61) risk_level = 'HIGH';
  else if (risk_score >= 41) risk_level = 'ELEVATED';
  else if (risk_score >= 21) risk_level = 'MODERATE';

  const flood_probability = Math.round((risk_score / 100.0) * 100) / 100;

  // Group D: lead_time_hrs (numeric)
  let lead_time_hrs = 6;
  if (risk_score >= 81)      lead_time_hrs = 1;
  else if (risk_score >= 61) lead_time_hrs = 2;
  else if (risk_score >= 41) lead_time_hrs = 4;
  const prediction_window = `Next ${lead_time_hrs <= 2 ? '1–' + lead_time_hrs : lead_time_hrs <= 4 ? '3–' + lead_time_hrs : '3–6'} hours`;

  // ── Group D: Landslide Model (separate inference head) ───────────────────
  // Inputs: slope, antecedent 7d rainfall, soil moisture, landslide zone flag
  const ls_slope_score = Math.min(100, (villageSlope / 40.0) * 100);
  const ls_ant_score   = Math.min(100, ((input.rainfall_7d ?? 0) / 200.0) * 100);
  const ls_soil_score  = Math.min(100, Math.max(0, (input.soil_moisture - 50) / 45.0 * 100));
  const ls_zone_boost  = landslidZoneFlag ? 18 : 0;

  const rawLsScore = (
    ls_slope_score * 0.40 +
    ls_ant_score   * 0.30 +
    ls_soil_score  * 0.20 +
    ls_zone_boost
  );
  const landslide_score_clamped = Math.min(99, Math.max(5, Math.round(rawLsScore)));
  const landslide_probability   = Math.round((landslide_score_clamped / 100.0) * 100) / 100;

  let landslide_risk_level: 'LOW' | 'MODERATE' | 'HIGH' | 'VERY HIGH' = 'LOW';
  if (landslide_score_clamped >= 75)      landslide_risk_level = 'VERY HIGH';
  else if (landslide_score_clamped >= 55) landslide_risk_level = 'HIGH';
  else if (landslide_score_clamped >= 35) landslide_risk_level = 'MODERATE';

  // ── SHAP-style feature weights for explainability UI ─────────────────────
  const shap_factors = [
    {
      factor: 'Rainfall Intensity (1h)',
      weight: Math.round(c_rf * 0.28 * 10) / 10,
      contribution: c_rf > 65 ? 'VERY HIGH' as const : (c_rf > 45 ? 'HIGH' as const : (c_rf > 25 ? 'MODERATE' as const : 'LOW' as const)),
      val: `${input.rainfall_1h} mm/hr`
    },
    {
      factor: '7-Day Antecedent Wetness',
      weight: Math.round(c_ant7d * 0.06 * 10) / 10,
      contribution: c_ant7d > 60 ? 'HIGH' as const : (c_ant7d > 30 ? 'MODERATE' as const : 'LOW' as const),
      val: `${input.rainfall_7d ?? 0} mm (7d)`
    },
    {
      factor: 'Soil Saturation (TDR)',
      weight: Math.round(c_soil * 0.22 * 10) / 10,
      contribution: c_soil > 65 ? 'HIGH' as const : (c_soil > 35 ? 'MODERATE' as const : 'LOW' as const),
      val: `${input.soil_moisture}%`
    },
    {
      factor: 'Stream Level & Rise Rate',
      weight: Math.round(c_water * 0.18 * 10) / 10,
      contribution: c_water > 75 ? 'VERY HIGH' as const : (c_water > 50 ? 'HIGH' as const : 'LOW' as const),
      val: `${input.water_level} m (+${input.water_level_rate} m/h)`
    },
    {
      factor: 'River Discharge (CWC)',
      weight: Math.round(c_disch * 0.08 * 10) / 10,
      contribution: c_disch > 65 ? 'HIGH' as const : (c_disch > 35 ? 'MODERATE' as const : 'LOW' as const),
      val: input.river_discharge_cumecs ? `${input.river_discharge_cumecs} m³/s` : 'Estimated'
    },
    {
      factor: 'Terrain Steepness (Slope)',
      weight: Math.round(c_terrain * 0.12 * 10) / 10,
      contribution: villageSlope > 25 ? 'HIGH' as const : 'MODERATE' as const,
      val: `${villageSlope}°`
    },
    {
      factor: 'Upstream Catchment Area',
      weight: Math.round(c_catchment * 0.06 * 10) / 10,
      contribution: catchmentArea > 20 ? 'MODERATE' as const : 'LOW' as const,
      val: `${catchmentArea} km²`
    }
  ];

  return {
    village_id: input.village_id,
    risk_score,
    risk_level,
    flood_probability,
    prediction_window,
    lead_time_hrs,
    landslide_risk_level,
    landslide_probability,
    timestamp: new Date().toISOString(),
    shap_factors
  };
}

// Emergency Siren / Sound chime using Web Audio API (No external sound file needed)
let audioCtx: AudioContext | null = null;
export function playAlertSiren() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, audioCtx.currentTime); // High pitch
    osc.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.35); // Two-tone drop
    osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.7);

    gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.85);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.9);
  } catch (e) {
    console.log('Audio notification error:', e);
  }
}
