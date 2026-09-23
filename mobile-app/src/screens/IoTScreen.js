import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { THEME } from "../styles/theme";
import { simulateScenario } from "../services/api";

export default function IoTScreen({ village, prediction, onSimulationApplied }) {
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState("moderate");

  // Sensor state variables
  const [rain1h, setRain1h] = useState(18);
  const [riverLevel, setRiverLevel] = useState(2.3);
  const [riverRise, setRiverRise] = useState(0.15);
  const [soilMoisture, setSoilMoisture] = useState(62);

  const iot = prediction?.iot_status || {};
  const live = prediction?.live_metrics || {};

  const handleApplyPreset = (preset, r, wl, rr, sm) => {
    setActivePreset(preset);
    setRain1h(r);
    setRiverLevel(wl);
    setRiverRise(rr);
    setSoilMoisture(sm);
  };

  const handleApplySimulation = async () => {
    if (!village) return;
    setLoading(true);
    try {
      const payload = {
        village_id: village.village_id,
        scenario: "custom",
        custom_rainfall_1h: rain1h,
        custom_river_level_m: riverLevel,
        custom_river_rise_rate: riverRise,
        custom_soil_moisture: soilMoisture,
      };
      await simulateScenario(payload);
      if (onSimulationApplied) {
        await onSimulationApplied();
      }
    } catch (err) {
      console.error("Simulation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Edge IoT Telemetry Station</Text>
      <Text style={styles.subText}>{village?.name || "Village"} Station Telemetry</Text>

      {/* Edge Station Health Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View>
            <Text style={styles.stationId}>{iot.station_id || `ESP32-${village?.village_id}`}</Text>
            <Text style={styles.stationType}>LoRa / GSM Microcontroller Unit</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{iot.status || "ONLINE"}</Text>
          </View>
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricMini}>
            <Text style={styles.miniLabel}>Battery</Text>
            <Text style={styles.miniVal}>{iot.battery_voltage || 3.95} V</Text>
          </View>
          <View style={styles.metricMini}>
            <Text style={styles.miniLabel}>Signal</Text>
            <Text style={styles.miniVal}>{iot.signal_rssi || -72} dBm</Text>
          </View>
          <View style={styles.metricMini}>
            <Text style={styles.miniLabel}>Rain Gauge</Text>
            <Text style={styles.miniVal}>{live.rainfall_1h || 0} mm</Text>
          </View>
          <View style={styles.metricMini}>
            <Text style={styles.miniLabel}>Water Probe</Text>
            <Text style={styles.miniVal}>{live.river_water_level_m || 1.8} m</Text>
          </View>
        </View>
      </View>

      {/* Simulator Section */}
      <Text style={styles.sectionTitle}>Interactive Hardware Simulator</Text>
      <View style={styles.card}>
        <View style={styles.disclaimerBox}>
          <Text style={styles.disclaimerIcon}>ℹ️</Text>
          <Text style={styles.disclaimerText}>
            IoT data is simulated for the prototype; the architecture supports real ESP32/LoRa/GSM sensors.
          </Text>
        </View>

        <Text style={styles.presetHeading}>Quick Preset Events:</Text>
        <View style={styles.presetGrid}>
          <TouchableOpacity
            style={[styles.presetBtn, activePreset === "dry" && styles.presetBtnActive]}
            onPress={() => handleApplyPreset("dry", 0, 1.2, -0.05, 25)}
          >
            <Text style={styles.presetBtnTitle}>☀️ Dry Day</Text>
            <Text style={styles.presetBtnSub}>0mm, base stream</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, activePreset === "moderate" && styles.presetBtnActive]}
            onPress={() => handleApplyPreset("moderate", 18, 2.3, 0.15, 62)}
          >
            <Text style={styles.presetBtnTitle}>🌧️ Monsoon</Text>
            <Text style={styles.presetBtnSub}>18mm, steady rise</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, activePreset === "heavy" && styles.presetBtnActive]}
            onPress={() => handleApplyPreset("heavy", 54, 3.6, 0.45, 84)}
          >
            <Text style={styles.presetBtnTitle}>⛈️ Heavy Rain</Text>
            <Text style={styles.presetBtnSub}>54mm, surging river</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.presetBtn, activePreset === "cloudburst" && styles.presetBtnActive]}
            onPress={() => handleApplyPreset("cloudburst", 88, 4.8, 0.85, 95)}
          >
            <Text style={[styles.presetBtnTitle, { color: THEME.colors.riskVeryHigh }]}>⚡ Cloudburst</Text>
            <Text style={styles.presetBtnSub}>88mm, flash alert</Text>
          </TouchableOpacity>
        </View>

        {/* Current Tuning Parameters */}
        <View style={styles.tuningBox}>
          <View style={styles.tuningRow}>
            <Text style={styles.tuningLabel}>1h Rainfall Gauge:</Text>
            <Text style={styles.tuningVal}>{rain1h} mm</Text>
          </View>
          <View style={styles.tuningRow}>
            <Text style={styles.tuningLabel}>River Water Level:</Text>
            <Text style={styles.tuningVal}>{riverLevel} m</Text>
          </View>
          <View style={styles.tuningRow}>
            <Text style={styles.tuningLabel}>River Rate of Rise:</Text>
            <Text style={styles.tuningVal}>{riverRise > 0 ? `+${riverRise}` : riverRise} m/h</Text>
          </View>
          <View style={styles.tuningRow}>
            <Text style={styles.tuningLabel}>Soil Moisture Saturation:</Text>
            <Text style={styles.tuningVal}>{soilMoisture}%</Text>
          </View>
        </View>

        {/* Apply Button */}
        <TouchableOpacity
          style={styles.applyBtn}
          onPress={handleApplySimulation}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.applyBtnText}>Apply Scenario to AI Model</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgMain,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textMain,
  },
  subText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    marginBottom: 12,
  },
  card: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    padding: 14,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  stationId: {
    fontSize: 15,
    fontWeight: "800",
    color: THEME.colors.textMain,
  },
  stationType: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  statusBadge: {
    backgroundColor: "rgba(34, 197, 94, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.colors.riskLow,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  metricMini: {
    flex: 1,
    backgroundColor: THEME.colors.bgInput,
    padding: 8,
    borderRadius: 8,
    marginHorizontal: 2,
  },
  miniLabel: {
    fontSize: 10,
    color: THEME.colors.textDim,
  },
  miniVal: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  disclaimerBox: {
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.3)",
    borderRadius: 8,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  disclaimerIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 11,
    color: "#7dd3fc",
    lineHeight: 15,
  },
  presetHeading: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textMuted,
    marginBottom: 8,
  },
  presetGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14,
  },
  presetBtn: {
    width: "48%",
    backgroundColor: THEME.colors.bgInput,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 10,
    borderRadius: 10,
  },
  presetBtnActive: {
    borderColor: THEME.colors.primary,
    backgroundColor: "rgba(2, 132, 199, 0.18)",
  },
  presetBtnTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textMain,
  },
  presetBtnSub: {
    fontSize: 10,
    color: THEME.colors.textDim,
    marginTop: 2,
  },
  tuningBox: {
    backgroundColor: THEME.colors.bgInput,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  tuningRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 4,
  },
  tuningLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  tuningVal: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textMain,
  },
  applyBtn: {
    backgroundColor: THEME.colors.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  applyBtnText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#fff",
  },
});
