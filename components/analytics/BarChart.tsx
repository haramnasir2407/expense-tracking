import { DateRange, MonthlySpending } from "@/types/analytics";
import React from "react";
import { Platform } from "react-native";
import { Text, View } from "tamagui";
import { Bar, CartesianChart } from "victory-native";
import { EmptyChartState } from "./EmptyChartState";
import { monthlyBarChartStyles as styles } from "./styles";
interface BarChartProps {
  data: MonthlySpending[];
  height?: number;
  isDark?: boolean;
  xLabel?: string;
  yLabel?: string;
  dateRange?: DateRange;
}

export function MonthlyBarChart({
  data,
  height = 200,
  isDark = false,
  xLabel = "Month",
  yLabel = "Amount ($)",
  dateRange,
}: BarChartProps) {
  const labelColor = isDark ? "#8E8E93" : "#666";

  // Require at least 2 distinct months for comparison
  if (data.length <= 1) {
    return <EmptyChartState message="Not enough monthly data to display" />;
  }

  // Compute year range when using wider ranges
  let yearRangeLabel: string | null = null;
  if (dateRange === "year" || dateRange === "all") {
    const years = data
      .map((d) => parseInt(d.month.split("-")[0], 10))
      .filter((y) => !Number.isNaN(y));
    if (years.length > 0) {
      const minYear = Math.min(...years);
      const maxYear = Math.max(...years);
      yearRangeLabel =
        minYear === maxYear ? `${minYear}` : `${minYear}-${maxYear}`;
    }
  }

  const chartData = data.map((d, index) => ({
    x: index,
    y: d.amount,
    label: formatMonthLabel(d.month, dateRange),
  }));

  return (
    <View style={[styles.container, { height: height + 30 }]}>
      {Platform.OS === "ios" ? (
        <View style={styles.yAxisLabelContainerIos}>
          <Text style={[styles.yAxisLabelText, { color: labelColor }]}>
            {yLabel}
          </Text>
        </View>
      ) : (
        <View style={styles.yAxisLabelContainerAndroid}>
          <Text style={[styles.yAxisLabelText, { color: labelColor }]}>
            {yLabel}
          </Text>
        </View>
      )}

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

      {yearRangeLabel && (
        <View style={styles.yearRangeContainer}>
          <Text style={[styles.yearRangeLabel, { color: labelColor }]}>
            ({yearRangeLabel})
          </Text>
        </View>
      )}
    </View>
  );
}

function formatMonthLabel(month: string, range?: DateRange): string {
  const [year, monthNum] = month.split("-");
  const date = new Date(parseInt(year, 10), parseInt(monthNum, 10) - 1);

  const showYear = range !== "year" && range !== "all";
  return date.toLocaleDateString("en-US", {
    month: "short",
    ...(showYear ? { year: "2-digit" } : {}),
  });
}
