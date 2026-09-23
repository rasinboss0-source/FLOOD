import { Platform } from "react-native";

// Local IP address detected for real phones on same Wi-Fi
const LOCAL_WIFI_IP = "192.168.1.3";

export let API_BASE_URL = Platform.select({
  android: `http://${LOCAL_WIFI_IP}:8000`,
  ios: `http://${LOCAL_WIFI_IP}:8000`,
  web: "http://127.0.0.1:8000",
  default: `http://${LOCAL_WIFI_IP}:8000`
});

export function setCustomApiUrl(url) {
  if (url) API_BASE_URL = url;
}

export async function getVillages(stateFilter = null) {
  try {
    let url = `${API_BASE_URL}/api/villages`;
    if (stateFilter && stateFilter !== "All") {
      url += `?state=${encodeURIComponent(stateFilter)}`;
    }
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return await resp.json();
  } catch (err) {
    console.warn("API getVillages failed, trying fallback 127.0.0.1:", err.message);
    const fallbackResp = await fetch(`http://127.0.0.1:8000/api/villages`);
    return await fallbackResp.json();
  }
}

export async function getVillageDetail(villageId) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/villages/${villageId}`);
    return await resp.json();
  } catch (err) {
    const fallbackResp = await fetch(`http://127.0.0.1:8000/api/villages/${villageId}`);
    return await fallbackResp.json();
  }
}

export async function getFloodPrediction(villageId, refreshLive = false) {
  try {
    const url = `${API_BASE_URL}/api/villages/${villageId}/predict?refresh_live=${refreshLive}`;
    const resp = await fetch(url);
    return await resp.json();
  } catch (err) {
    const fallbackResp = await fetch(`http://127.0.0.1:8000/api/villages/${villageId}/predict?refresh_live=${refreshLive}`);
    return await fallbackResp.json();
  }
}

export async function simulateScenario(payload) {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/iot/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await resp.json();
  } catch (err) {
    const fallbackResp = await fetch(`http://127.0.0.1:8000/api/iot/simulate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    return await fallbackResp.json();
  }
}

export async function getAlerts() {
  try {
    const resp = await fetch(`${API_BASE_URL}/api/alerts`);
    return await resp.json();
  } catch (err) {
    const fallbackResp = await fetch(`http://127.0.0.1:8000/api/alerts`);
    return await fallbackResp.json();
  }
}
