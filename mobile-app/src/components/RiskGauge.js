import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { THEME } from "../styles/theme";

export default function RiskGauge({ probabilityPct = 0, riskLevel = "LOW" }) {
  const size = 180;
  const strokeWidth = 14;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * Math.min(100, Math.max(0, probabilityPct))) / 100;

  const getRiskColor = () => {
    switch (riskLevel?.toUpperCase()) {
      case "VERY HIGH":
        return THEME.colors.riskVeryHigh;
      case "HIGH":
        return THEME.colors.riskHigh;
      case "MODERATE":
        return THEME.colors.riskModerate;
      default:
        return THEME.colors.riskLow;
    }
  };

  const riskColor = getRiskColor();

  return (
    <View style={styles.container}>
      <View style={styles.svgWrapper}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#334155"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Animated progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={riskColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${circumference} ${circumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>

        <View style={styles.centerContent}>
          <View style={{ flexDirection: "row", alignItems: "baseline" }}>
            <Text style={[styles.pctText, { color: THEME.colors.textMain }]}>
              {probabilityPct}
            </Text>
            <Text style={[styles.unitText, { color: THEME.colors.textMuted }]}>
              %
            </Text>
          </View>
          <Text style={styles.label}>FLOOD PROBABILITY</Text>
        </View>
      </View>

      <View style={[styles.riskPill, { backgroundColor: riskColor }]}>
        <Text style={[styles.riskPillText, riskLevel === "MODERATE" ? { color: "#000" } : { color: "#fff" }]}>
          {riskLevel}
        </Text>
      </View>

      <Text style={styles.windowText}>Target Window: Next 1–3 Hours</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  svgWrapper: {
    width: 180,
    height: 180,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  svg: {
    position: "absolute",
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  pctText: {
    fontSize: 44,
    fontWeight: "800",
  },
  unitText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 2,
  },
  label: {
    fontSize: 10,
    color: "#94a3b8",
    fontWeight: "700",
    letterSpacing: 0.5,
    marginTop: 2,
  },
  riskPill: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 6,
  },
  riskPillText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  windowText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});
