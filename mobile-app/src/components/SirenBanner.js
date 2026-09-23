import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { THEME } from "../styles/theme";

export default function SirenBanner({ visible, headline }) {
  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <View style={styles.dot} />
      <Text style={styles.text} numberOfLines={1}>
        {headline || "CRITICAL: Flash Flood Emergency Warning"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: "#991b1b",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#f87171",
  },
  text: {
    flex: 1,
    color: "#fef2f2",
    fontSize: 12,
    fontWeight: "700",
  },
});
