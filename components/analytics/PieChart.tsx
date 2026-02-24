import { CategorySpending } from "@/types/analytics";
import React from "react";
import { Text, View } from "react-native";
import { Pie, PolarChart } from "victory-native";
import { EmptyChartState } from "./EmptyChartState";
import { categoryPieChartStyles as styles } from "./styles";

interface PieChartProps {
  data: CategorySpending[];
  size?: number;
  isDark?: boolean;
}

export function CategoryPieChart({
  data,
  size = 200,
  isDark = false,
}: PieChartProps) {
  const labelColor = isDark ? "#ECEDEE" : "#333";

  if (data.length === 0) {
    return <EmptyChartState message="No category data to display" />;
  }

  const chartData = data.map((d) => ({
    value: d.amount,
    color: d.color,
    label: d.category,
  }));

  return (
    <View style={styles.container}>
      <View style={{ height: size, width: size }}>
        <PolarChart
          data={chartData}
          labelKey="label"
          valueKey="value"
          colorKey="color"
        >
          <Pie.Chart innerRadius={size * 0.4} />
        </PolarChart>
      </View>

      <View style={styles.legend}>
        {data.slice(0, 5).map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View
              style={[styles.legendColor, { backgroundColor: item.color }]}
            />
            <Text style={[styles.legendLabel, { color: labelColor }]}>
              {item.category}: ${item.amount.toFixed(0)} (
              {item.percentage.toFixed(0)}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
