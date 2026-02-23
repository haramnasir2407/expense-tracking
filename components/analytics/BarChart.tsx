import { MonthlySpending } from "@/types/analytics";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Bar, CartesianChart } from "victory-native";
import { EmptyChartState } from "./EmptyChartState";

interface BarChartProps {
  data: MonthlySpending[];
  height?: number;
  isDark?: boolean;
}

export function MonthlyBarChart({
  data,
  height = 200,
  isDark = false,
}: BarChartProps) {
  const labelColor = isDark ? "#8E8E93" : "#666";

  if (data.length === 0) {
    return <EmptyChartState message="No monthly data to display" />;
  }

  const chartData = data.map((d, index) => ({
    x: index,
    y: d.amount,
    label: formatMonthLabel(d.month),
  }));

  return (
    <View style={[styles.container, { height: height + 30 }]}>
      <View style={{ height }}>
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y"]}
          domainPadding={{ left: 20, right: 20, top: 20 }}
        >
          {({ points, chartBounds }) => (
            <Bar
              points={points.y}
              chartBounds={chartBounds}
              color="#95E1D3"
              roundedCorners={{ topLeft: 5, topRight: 5 }}
              animate={{ type: "timing", duration: 300 }}
            />
          )}
        </CartesianChart>
      </View>

      {/* Month Labels */}
      <View style={styles.labelsContainer}>
        {chartData.map((item, index) => (
          <Text key={index} style={[styles.label, { color: labelColor }]}>
            {item.label}
          </Text>
        ))}
      </View>
    </View>
  );
}

function formatMonthLabel(month: string): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
});
