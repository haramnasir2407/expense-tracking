import { DailySpending } from "@/types/analytics";
import { Circle } from "@shopify/react-native-skia";
import React from "react";
import { Text, View } from "react-native";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { EmptyChartState } from "./EmptyChartState";
import { spendingLineChartStyles as styles } from "./styles";
interface LineChartProps {
  data: DailySpending[];
  height?: number;
  isDark?: boolean;
  xLabel?: string;
  yLabel?: string;
  transactionCount?: number;
}

// useChartPressState is a Victory Native hook that tracks touch interactions
export function SpendingLineChart({
  data,
  height = 200,
  isDark = false,
  xLabel = "Date",
  yLabel = "Amount ($)",
  transactionCount,
}: LineChartProps) {
  const { state, isActive } = useChartPressState({ x: 0, y: { y: 0 } });

  const chartData = data.map((d) => ({
    x: new Date(d.date).getTime(),
    y: d.amount,
  }));

  const effectiveCount = transactionCount ?? data.length;

  // Require at least 2 transactions for a meaningful trend
  if (effectiveCount <= 1) {
    return <EmptyChartState message="Not enough spending data to display" />;
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

      <View style={styles.yAxisLabelContainer}>
        <Text style={styles.yAxisLabelText}>{yLabel}</Text>
      </View>

      <View style={styles.axisLabelsContainer}>
        <Text style={styles.axisLabel}>{xLabel}</Text>
      </View>
    </View>
  );
}
