import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "tamagui";
import { emptyChartStateStyles as styles } from "./styles";

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
