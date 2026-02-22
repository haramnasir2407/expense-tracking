import { DailySpending } from "@/types/analytics";
import { Circle } from "@shopify/react-native-skia";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { EmptyChartState } from "./EmptyChartState";

interface LineChartProps {
  data: DailySpending[];
  height?: number;
  isDark?: boolean;
}

// useChartPressState is a Victory Native hook that tracks touch interactions
export function SpendingLineChart({
  data,
  height = 200,
  isDark = false,
}: LineChartProps) {
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  const chartData = data.map((d) => ({
    x: new Date(d.date).getTime(),
    y: d.amount,
  }));

  if (data.length === 0) {
    return <EmptyChartState message="No spending data to display" />;
  }

  return (
    <View style={[styles.container, { height }]}>
      <CartesianChart
        data={chartData}
        xKey="x"
        yKeys={["y"]}
        domainPadding={{ left: 20, right: 20, top: 20 }}
        chartPressState={state}
      >
        {({ points }) => (
          <>
            <Line
              points={points.y}
              color="#4ECDC4"
              strokeWidth={3}
              curveType="catmullRom"
              animate={{ type: "timing", duration: 300 }}
            />
            {isActive && (
              <Circle
                cx={state.x.position}
                cy={state.y.y.position}
                r={5}
                color="#4ECDC4"
              />
            )}
          </>
        )}
      </CartesianChart>

      {isActive && (
        <View
          style={[
            styles.tooltip,
            {
              backgroundColor: isDark
                ? "rgba(28,28,30,0.95)"
                : "rgba(0,0,0,0.7)",
            },
          ]}
        >
          <Text style={[styles.tooltipText, { color: "white" }]}>
            ${state.y.y.value.value.toFixed(2)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  tooltip: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    borderRadius: 4,
  },
  tooltipText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
