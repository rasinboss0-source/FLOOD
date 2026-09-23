import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import Svg, { Polygon, Polyline, Circle, Line, Text as SvgText } from "react-native-svg";
import { THEME } from "../styles/theme";

export default function MapScreen({ village, prediction }) {
  const gis = village?.static_gis || {};
  const risk = prediction?.prediction?.risk_level || "LOW";
  const shelters = gis.evacuation_shelters || [];

  const getRiskColor = () => {
    switch (risk) {
      case "VERY HIGH": return THEME.colors.riskVeryHigh;
      case "HIGH": return THEME.colors.riskHigh;
      case "MODERATE": return THEME.colors.riskModerate;
      default: return THEME.colors.riskLow;
    }
  };

  const riskColor = getRiskColor();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>GIS Terrain & Watershed Catchment</Text>
      <Text style={styles.subText}>
        {village?.name || "Village"} ({village?.district}, {village?.state})
      </Text>

      {/* GIS Schematic Vector Map */}
      <View style={styles.mapCard}>
        <Svg width="100%" height={260} viewBox="0 0 320 260">
          {/* Elevation contour guides */}
          <Line x1="10" y1="50" x2="310" y2="50" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
          <SvgText x="15" y="44" fill="#64748b" fontSize="9">HIGH RIDGE CONTOUR (+{gis.elevation_m ? Math.round(gis.elevation_m * 1.15) : 1200}m)</SvgText>

          <Line x1="10" y1="130" x2="310" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
          <SvgText x="15" y="124" fill="#64748b" fontSize="9">MID SLOPE CONTOUR (+{gis.elevation_m || 800}m)</SvgText>

          <Line x1="10" y1="210" x2="310" y2="210" stroke="#334155" strokeWidth="1" strokeDasharray="3,3" />
          <SvgText x="15" y="204" fill="#64748b" fontSize="9">VALLEY BED DRAINAGE CHANNEL</SvgText>

          {/* Upstream Catchment Polygon */}
          <Polygon
            points="60,30 240,40 270,120 180,180 80,140"
            fill={riskColor}
            fillOpacity="0.2"
            stroke={riskColor}
            strokeWidth="2"
            strokeDasharray="4,4"
          />
          <SvgText x="120" y="85" fill={riskColor} fontSize="10" fontWeight="bold">
            CATCHMENT: {gis.catchment_area_sqkm || 25} km²
          </SvgText>

          {/* Drainage Stream Line */}
          <Polyline
            points="230,35 190,90 170,140 160,190"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="4"
          />
          <SvgText x="175" y="155" fill="#38bdf8" fontSize="9" fontWeight="bold">
            {gis.nearest_stream_name ? gis.nearest_stream_name.slice(0, 18) : "Stream"}
          </SvgText>

          {/* Village Center Pin */}
          <Circle cx="160" cy="190" r="14" fill={riskColor} stroke="#ffffff" strokeWidth="3" />
          <SvgText x="153" y="195" fill="#ffffff" fontSize="14">📍</SvgText>
          <SvgText x="125" y="222" fill="#ffffff" fontSize="11" fontWeight="bold">
            {village?.name || "Village"}
          </SvgText>

          {/* Safe Shelter Pin on High Ridge */}
          <Circle cx="70" cy="45" r="12" fill="#059669" stroke="#ffffff" strokeWidth="2" />
          <SvgText x="64" y="50" fill="#ffffff" fontSize="12">🛡️</SvgText>
          <SvgText x="20" y="70" fill="#34d399" fontSize="10" fontWeight="bold">
            Shelter (High Ground)
          </SvgText>
        </Svg>

        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: riskColor }]} />
            <Text style={styles.legendText}>Village Basin</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#38bdf8" }]} />
            <Text style={styles.legendText}>Stream Course</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: "#059669" }]} />
            <Text style={styles.legendText}>Safe Shelter</Text>
          </View>
        </View>
      </View>

      {/* Terrain Specifications */}
      <Text style={styles.sectionTitle}>Digital Elevation Model (DEM) Specs</Text>
      <View style={styles.specCard}>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Surface Elevation:</Text>
          <Text style={styles.specValue}>{gis.elevation_m || 0} metres</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Terrain Slope:</Text>
          <Text style={styles.specValue}>{gis.slope_deg || 0}° ({gis.slope_deg > 15 ? "Steep Mountain" : "Gentle Plain"})</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Nearest Stream:</Text>
          <Text style={styles.specValue}>{gis.nearest_stream_name || "N/A"}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Distance to Stream:</Text>
          <Text style={styles.specValue}>{gis.distance_to_stream_m || 0} m</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Upstream Watershed:</Text>
          <Text style={styles.specValue}>{gis.catchment_area_sqkm || 0} km²</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specLabel}>Dominant Soil:</Text>
          <Text style={styles.specValue}>{gis.soil_type || "Alluvial Clay"}</Text>
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
  mapCard: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.lg,
    padding: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.border,
    marginTop: 6,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: "#cbd5e1",
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: THEME.colors.textMain,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  specCard: {
    backgroundColor: THEME.colors.bgCard,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.borderRadius.md,
    padding: 14,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  specLabel: {
    fontSize: 12,
    color: THEME.colors.textMuted,
  },
  specValue: {
    fontSize: 12,
    fontWeight: "700",
    color: THEME.colors.textMain,
  },
});
