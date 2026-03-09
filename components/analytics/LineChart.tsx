import { Colors } from "@/constants/theme";
import { DailySpending } from "@/types/analytics";
import { Circle } from "@shopify/react-native-skia";
import React from "react";
import { Text, View } from "tamagui";
import { CartesianChart, Line, useChartPressState } from "victory-native";
import { EmptyChartState } from "./EmptyChartState";
import { spendingLineChartStyles as styles } from "./styles";

const SPENDING_COLOR = Colors.spending;
const BUDGET_LINE_COLOR = Colors.budget;

interface LineChartProps {
  data: DailySpending[];
  /** When a category is selected, daily budget (monthly budget / days in month) per date; same order as data. */
  budgetData?: DailySpending[];
  height?: number;
  isDark?: boolean;
  xLabel?: string;
  yLabel?: string;
  transactionCount?: number;
}

// useChartPressState is a Victory Native hook that tracks touch interactions
export function SpendingLineChart({
  data,
  budgetData,
  height = 200,
  isDark = false,
  xLabel = "Date",
  yLabel = "Amount ($)",
  transactionCount,
}: LineChartProps) {
  const showBudget =
    budgetData &&
    budgetData.length === data.length &&
    budgetData.some((b) => b.amount > 0);
  const stateSingle = useChartPressState({ x: 0, y: { y: 0 } });
  const stateDual = useChartPressState({ x: 0, y: { y: 0, budget: 0 } });
  const { state, isActive } = showBudget ? stateDual : stateSingle;

  const chartData = data.map((d, i) => ({
    x: new Date(d.date).getTime(),
    y: d.amount,
    ...(showBudget && budgetData ? { budget: budgetData[i]?.amount ?? 0 } : {}),
  }));

  const effectiveCount = transactionCount ?? data.length;

  // Require at least 2 transactions for a meaningful trend
  if (effectiveCount <= 1) {
    return <EmptyChartState message="Not enough spending data to display" />;
  }

  return (
    <View style={[styles.container, { height }]}>
      {showBudget ? (
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y", "budget"]}
          domainPadding={{ left: 20, right: 20, top: 20 }}
          chartPressState={stateDual.state}
        >
          {({ points }) => (
            <>
              <Line
                points={points.y}
                color={SPENDING_COLOR}
                strokeWidth={3}
                curveType="catmullRom"
                animate={{ type: "timing", duration: 300 }}
              />
              {points.budget && (
                <Line
                  points={points.budget}
                  color={BUDGET_LINE_COLOR}
                  strokeWidth={2}
                  curveType="linear"
                  animate={{ type: "timing", duration: 300 }}
                />
              )}
              {isActive && (
                <Circle
                  cx={state.x.position}
                  cy={state.y.y.position}
                  r={5}
                  color={SPENDING_COLOR}
                />
              )}
            </>
          )}
        </CartesianChart>
      ) : (
        <CartesianChart
          data={chartData}
          xKey="x"
          yKeys={["y"]}
          domainPadding={{ left: 20, right: 20, top: 20 }}
          chartPressState={stateSingle.state}
        >
          {({ points }) => (
            <>
              <Line
                points={points.y}
                color={SPENDING_COLOR}
                strokeWidth={3}
                curveType="catmullRom"
                animate={{ type: "timing", duration: 300 }}
              />
              {isActive && (
                <Circle
                  cx={state.x.position}
                  cy={state.y.y.position}
                  r={5}
                  color={SPENDING_COLOR}
                />
              )}
            </>
          )}
        </CartesianChart>
      )}

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

      {showBudget && (
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: SPENDING_COLOR }]}
            />
            <Text style={[styles.legendText, isDark && { color: "#8E8E93" }]}>
              Spending
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: BUDGET_LINE_COLOR }]}
            />
            <Text style={[styles.legendText, isDark && { color: "#8E8E93" }]}>
              Budget
            </Text>
          </View>
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
