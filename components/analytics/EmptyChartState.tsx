import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface EmptyChartStateProps {
  message: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function EmptyChartState({
  message,
  icon = "bar-chart-outline",
}: EmptyChartStateProps) {
  return (
    <View style={styles.container}>
      <Ionicons name={icon} size={48} color="#ccc" />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});
