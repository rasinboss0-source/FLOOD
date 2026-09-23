import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { THEME } from "../styles/theme";

export default function ExplainScreen() {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>AI Model & Hydrological Physics</Text>
      <Text style={styles.subText}>Calibrated Machine Learning Methodology</Text>

      {/* Model Overview Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 Calibrated Random Forest Ensemble</Text>
        <Text style={styles.cardDesc}>
          The system uses a calibrated Random Forest pipeline (`CalibratedClassifierCV`) trained on historical cloudbursts and flash flood occurrences across the Western Ghats, Himalayan valleys, and coastal deltas.
        </Text>
        <Text style={styles.cardDesc}>
          Unlike simple rain forecast apps, FlashFloodWarning combines 20 physical parameters to estimate the exact flood probability for the critical 1–3 hour evacuation lead window.
        </Text>
      </View>

      {/* Hydrological Rational Method */}
      <Text style={styles.sectionTitle}>Hydrological Rational Equation</Text>
      <View style={styles.card}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>Peak Discharge: Q = C × I × A</Text>
        </View>
        <Text style={styles.formulaItem}>
          • <Text style={styles.bold}>C (Runoff Factor):</Text> Derived from soil clay percentage, compaction, and saturation moisture.
        </Text>
        <Text style={styles.formulaItem}>
          • <Text style={styles.bold}>I (Rainfall Intensity):</Text> 1-hour cloudburst volume in mm/hr.
        </Text>
        <Text style={styles.formulaItem}>
          • <Text style={styles.bold}>A (Catchment Area):</Text> Total upstream watershed draining toward village in km².
        </Text>
      </View>

      {/* Risk Threshold Policy */}
      <Text style={styles.sectionTitle}>Risk Classification Policy</Text>
      <View style={styles.thresholdGrid}>
        <View style={[styles.thresholdCard, { borderColor: THEME.colors.riskLow }]}>
          <Text style={[styles.thresholdPct, { color: THEME.colors.riskLow }]}>0 – 30%</Text>
          <Text style={styles.thresholdLabel}>LOW RISK</Text>
          <Text style={styles.thresholdSub}>Normal seasonal drainage</Text>
        </View>

        <View style={[styles.thresholdCard, { borderColor: THEME.colors.riskModerate }]}>
          <Text style={[styles.thresholdPct, { color: THEME.colors.riskModerate }]}>30 – 60%</Text>
          <Text style={styles.thresholdLabel}>MODERATE</Text>
          <Text style={styles.thresholdSub}>Elevated stream flow; stay alert</Text>
        </View>

        <View style={[styles.thresholdCard, { borderColor: THEME.colors.riskHigh }]}>
          <Text style={[styles.thresholdPct, { color: THEME.colors.riskHigh }]}>60 – 80%</Text>
          <Text style={styles.thresholdLabel}>HIGH RISK</Text>
          <Text style={styles.thresholdSub}>Prepare evacuation to high ridge</Text>
        </View>

        <View style={[styles.thresholdCard, { borderColor: THEME.colors.riskVeryHigh }]}>
          <Text style={[styles.thresholdPct, { color: THEME.colors.riskVeryHigh }]}>80 – 100%</Text>
          <Text style={styles.thresholdLabel}>VERY HIGH</Text>
          <Text style={styles.thresholdSub}>Immediate evacuation emergency</Text>
        </View>
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
  cardTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 12,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  codeBox: {
    backgroundColor: THEME.colors.bgInput,
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  codeText: {
    fontFamily: "monospace",
    fontSize: 13,
    color: THEME.colors.primaryLight,
    fontWeight: "700",
  },
  formulaItem: {
    fontSize: 12,
    color: "#cbd5e1",
    lineHeight: 18,
    marginBottom: 4,
  },
  bold: {
    fontWeight: "700",
    color: "#fff",
  },
  thresholdGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  thresholdCard: {
    width: "48%",
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
  },
  thresholdPct: {
    fontSize: 16,
    fontWeight: "800",
  },
  thresholdLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: THEME.colors.textMain,
    marginTop: 2,
  },
  thresholdSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    marginTop: 2,
  },
});
