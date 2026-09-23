import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Modal,
  FlatList,
} from "react-native";
import { THEME } from "../styles/theme";
import RiskGauge from "../components/RiskGauge";
import MetricCard from "../components/MetricCard";

const STATES = ["All", "Tamil Nadu", "Kerala", "Uttarakhand", "Assam", "Maharashtra", "Himachal Pradesh"];

export default function MonitorScreen({
  villages = [],
  selectedVillage,
  prediction,
  onSelectVillage,
  onRefresh,
  refreshing,
}) {
  const [activeState, setActiveState] = useState("All");
  const [modalVisible, setModalVisible] = useState(false);

  const filteredVillages = activeState === "All"
    ? villages
    : villages.filter((v) => v.state === activeState);

  const pred = prediction?.prediction || {};
  const live = prediction?.live_metrics || {};
  const bulletin = prediction?.bulletin || {};
  const factors = pred?.contributing_factors || [];

  const getSurgeColor = (rr) => {
    if (rr >= 0.3) return THEME.colors.riskVeryHigh;
    if (rr > 0.05) return THEME.colors.riskModerate;
    return THEME.colors.textDim;
  };

  const getSurgeText = (rr) => {
    if (rr >= 0.3) return `↑ Surge (+${rr} m/h)`;
    if (rr > 0.05) return `↗ Climbing (+${rr} m/h)`;
    if (rr < -0.05) return `↓ Receding (${rr} m/h)`;
    return "→ Stable";
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
      }
    >
      {/* State Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {STATES.map((st) => (
          <TouchableOpacity
            key={st}
            style={[styles.chip, activeState === st && styles.chipActive]}
            onPress={() => setActiveState(st)}
          >
            <Text style={[styles.chipText, activeState === st && styles.chipTextActive]}>
              {st}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Village Picker Trigger */}
      <TouchableOpacity style={styles.pickerBtn} onPress={() => setModalVisible(true)}>
        <View>
          <Text style={styles.pickerLabel}>SELECT VILLAGE</Text>
          <Text style={styles.pickerTitle}>
            {selectedVillage ? `${selectedVillage.name}, ${selectedVillage.district}` : "Choose a Village"}
          </Text>
        </View>
        <Text style={styles.pickerArrow}>▼</Text>
      </TouchableOpacity>

      {/* Risk Hero Card */}
      <View style={[styles.heroCard, { borderColor: THEME.colors.border }]}>
        <View style={styles.locBadge}>
          <Text style={styles.locBadgeText}>
            📍 {selectedVillage?.name || "Village"}, {selectedVillage?.state || "India"}
          </Text>
        </View>

        <RiskGauge
          probabilityPct={pred?.probability_pct || 0}
          riskLevel={pred?.risk_level || "LOW"}
        />
      </View>

      {/* Emergency Bulletin */}
      <View style={styles.bulletinCard}>
        <Text style={styles.bulletinHeadline}>
          {bulletin?.headline || "🟢 Normal Seasonal Flow"}
        </Text>
        {(bulletin?.instructions || []).map((inst, idx) => (
          <View key={idx} style={styles.instructionRow}>
            <Text style={styles.bulletDot}>•</Text>
            <Text style={styles.instructionText}>{inst}</Text>
          </View>
        ))}
      </View>

      {/* 2x2 Metrics Grid */}
      <Text style={styles.sectionTitle}>Live Environmental Telemetry</Text>
      <View style={styles.gridRow}>
        <MetricCard
          title="1h Rainfall"
          icon="🌧️"
          value={`${live?.rainfall_1h ?? 0} mm`}
          subtitle={`Past 24h: ${live?.rainfall_24h ?? 0} mm`}
        />
        <MetricCard
          title="River Gauge"
          icon="🌊"
          value={`${live?.river_water_level_m ?? 1.5} m`}
          subtitle={getSurgeText(live?.river_rise_rate_m_per_hr ?? 0)}
          trendColor={getSurgeColor(live?.river_rise_rate_m_per_hr ?? 0)}
        />
      </View>

      <View style={styles.gridRow}>
        <MetricCard
          title="Soil Moisture"
          icon="🌱"
          value={`${live?.soil_moisture_pct ?? 45}%`}
          subtitle={live?.soil_moisture_pct > 80 ? "Saturated Ground" : "Normal Infiltration"}
          trendColor={live?.soil_moisture_pct > 80 ? THEME.colors.riskHigh : null}
        />
        <MetricCard
          title="Runoff Index"
          icon="⚡"
          value={`${prediction?.hydrology?.runoff_index ?? 12.4}`}
          subtitle="Q = C·I·A rational"
        />
      </View>

      {/* Explainable AI Factors */}
      <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Key Risk Drivers (Explainable AI)</Text>
      {factors.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>All monitored parameters within normal thresholds.</Text>
        </View>
      ) : (
        factors.map((f, idx) => (
          <View key={idx} style={styles.factorCard}>
            <View style={styles.factorHeader}>
              <Text style={styles.factorName}>{f.feature} ({f.value})</Text>
              <View style={[
                styles.impactBadge,
                f.impact === "CRITICAL" ? { backgroundColor: "rgba(239, 68, 68, 0.2)", borderColor: THEME.colors.riskVeryHigh } :
                f.impact === "ELEVATED" ? { backgroundColor: "rgba(249, 115, 22, 0.2)", borderColor: THEME.colors.riskHigh } :
                { backgroundColor: "rgba(234, 179, 8, 0.2)", borderColor: THEME.colors.riskModerate }
              ]}>
                <Text style={[
                  styles.impactBadgeText,
                  f.impact === "CRITICAL" ? { color: THEME.colors.riskVeryHigh } :
                  f.impact === "ELEVATED" ? { color: THEME.colors.riskHigh } :
                  { color: THEME.colors.riskModerate }
                ]}>
                  {f.impact}
                </Text>
              </View>
            </View>
            <Text style={styles.factorExplanation}>{f.explanation}</Text>
          </View>
        ))
      )}

      {/* Village Selection Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Monitored Village</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={filteredVillages}
              keyExtractor={(item) => item.village_id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.villageItem,
                    selectedVillage?.village_id === item.village_id && styles.villageItemActive,
                  ]}
                  onPress={() => {
                    onSelectVillage(item.village_id);
                    setModalVisible(false);
                  }}
                >
                  <View>
                    <Text style={styles.vItemTitle}>{item.name}</Text>
                    <Text style={styles.vItemSub}>{item.district}, {item.state}</Text>
                  </View>
                  <Text style={styles.vItemElev}>{item.elevation_m}m</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.bgMain,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
  },
  chipsRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  chip: {
    backgroundColor: THEME.colors.bgInput,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  chipText: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  chipTextActive: {
    color: "#fff",
    fontWeight: "700",
  },
  pickerBtn: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  pickerLabel: {
    fontSize: 10,
    color: THEME.colors.textDim,
    fontWeight: "700",
    marginBottom: 2,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.colors.textMain,
  },
  pickerArrow: {
    color: THEME.colors.textMuted,
    fontSize: 12,
  },
  heroCard: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderRadius: THEME.borderRadius.lg,
    padding: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  locBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  locBadgeText: {
    fontSize: 12,
    color: "#cbd5e1",
    fontWeight: "600",
  },
  bulletinCard: {
    backgroundColor: THEME.colors.bgCard,
    borderLeftWidth: 4,
    borderLeftColor: THEME.colors.primary,
    borderRadius: THEME.borderRadius.md,
    padding: 14,
    marginBottom: 14,
  },
  bulletinHeadline: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 8,
  },
  instructionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  bulletDot: {
    color: THEME.colors.primary,
    fontSize: 14,
    marginRight: 6,
    marginTop: -2,
  },
  instructionText: {
    flex: 1,
    fontSize: 11,
    color: "#cbd5e1",
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  gridRow: {
    flexDirection: "row",
    marginHorizontal: -4,
  },
  factorCard: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    marginBottom: 8,
  },
  factorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  factorName: {
    fontSize: 13,
    fontWeight: "700",
    color: THEME.colors.textMain,
  },
  impactBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  impactBadgeText: {
    fontSize: 10,
    fontWeight: "800",
  },
  factorExplanation: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    lineHeight: 16,
  },
  emptyCard: {
    backgroundColor: THEME.colors.bgCard,
    padding: 14,
    borderRadius: THEME.borderRadius.md,
  },
  emptyText: {
    fontSize: 12,
    color: THEME.colors.textDim,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: THEME.colors.bgCard,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: THEME.colors.textMain,
  },
  modalClose: {
    fontSize: 18,
    color: THEME.colors.textMuted,
    paddingHorizontal: 8,
  },
  villageItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.05)",
  },
  villageItemActive: {
    backgroundColor: "rgba(2, 132, 199, 0.15)",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  vItemTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.colors.textMain,
  },
  vItemSub: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
  vItemElev: {
    fontSize: 12,
    color: THEME.colors.primaryLight,
    fontWeight: "600",
  },
});
