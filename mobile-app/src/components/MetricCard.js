import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../styles/theme";

export default function MetricCard({ title, icon, value, subtitle, trendColor }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.value}>{value}</Text>
      {subtitle ? (
        <Text style={[styles.subtitle, trendColor ? { color: trendColor } : {}]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: 12,
    margin: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  title: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  icon: {
    fontSize: 16,
  },
  value: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: THEME.colors.textDim,
  },
});
