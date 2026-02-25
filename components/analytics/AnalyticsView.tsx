import { MonthlyBarChart } from "@/components/analytics/BarChart";
import { SpendingLineChart } from "@/components/analytics/LineChart";
import { CategoryPieChart } from "@/components/analytics/PieChart";
import { DATE_RANGES } from "@/constants/dateRanges";
import { AnalyticsData, DateRange } from "@/types/analytics";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { analyticsViewStyles as styles } from "./styles";

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  selectedRange: DateRange;
  onSelectRange: (range: DateRange) => void;
  selectedCategory: string;
  categories: string[];
  onSelectCategory: (category: string) => void;
  isDark: boolean;
  colors: { background: string; text: string; tint: string };
}

export function AnalyticsView({
  analytics,
  selectedRange,
  onSelectRange,
  selectedCategory,
  categories,
  onSelectCategory,
  isDark,
  colors,
}: AnalyticsViewProps) {
  const cardBg = isDark ? "#1C1C1E" : "white";
  const buttonBg = isDark ? "#2C2C2E" : "#f0f0f0";
  const labelColor = isDark ? "#8E8E93" : "#999";
  const textColor = isDark ? "#FFFFFF" : "#666";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.rangeSelector, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.rangeSelectorContent}
      >
        {DATE_RANGES.map((range) => (
          <TouchableOpacity
            key={range.value}
            style={[
              styles.rangeButton,
              { backgroundColor: buttonBg },
              selectedRange === range.value && { backgroundColor: colors.tint },
            ]}
            onPress={() => onSelectRange(range.value)}
          >
            <Text
              style={[
                styles.rangeButtonText,
                { color: textColor },
                selectedRange === range.value && styles.rangeButtonTextActive,
              ]}
            >
              {range.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.rangeSelector, { backgroundColor: cardBg }]}
        contentContainerStyle={styles.rangeSelectorContent}
      >
        {categories.map((category) => {
          const isAll = category === "all";
          const isActive = selectedCategory === category;
          const label = isAll ? "All" : category;

          return (
            <TouchableOpacity
              key={category}
              style={[
                styles.rangeButton,
                { backgroundColor: buttonBg },
                isActive && { backgroundColor: colors.tint },
              ]}
              onPress={() => onSelectCategory(category)}
            >
              <Text
                style={[
                  styles.rangeButtonText,
                  { color: textColor },
                  isActive && styles.rangeButtonTextActive,
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.summaryGrid}>
        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Total Spent
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${analytics.totalSpent.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Avg/Day
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${analytics.averagePerDay.toFixed(2)}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Transactions
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {analytics.transactionCount}
          </Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Avg/Transaction
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${analytics.averagePerTransaction.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={[styles.chartSection, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Spending Over Time
        </Text>
        <SpendingLineChart data={analytics.dailyTotals} isDark={isDark} />
      </View>
      <View style={[styles.chartSection, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Category Breakdown
        </Text>
        <CategoryPieChart data={analytics.byCategory} isDark={isDark} />
      </View>
      <View style={[styles.chartSection, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Monthly Comparison
        </Text>
        <MonthlyBarChart
          data={analytics.monthlyTotals}
          isDark={isDark}
          dateRange={selectedRange}
        />
      </View>

      {analytics.monthOverMonthTrend.previous > 0 && (
        <View style={[styles.insightCard, { backgroundColor: cardBg }]}>
          <Text style={[styles.insightTitle, { color: labelColor }]}>
            Month-over-Month
          </Text>
          <Text
            style={[
              styles.insightValue,
              {
                color:
                  analytics.monthOverMonthTrend.trend === "up"
                    ? "#FF6B6B"
                    : colors.tint,
              },
            ]}
          >
            {analytics.monthOverMonthTrend.trend === "up" ? "↑" : "↓"}
            {Math.abs(analytics.monthOverMonthTrend.change).toFixed(1)}%
          </Text>
          <Text style={[styles.insightDescription, { color: labelColor }]}>
            {analytics.monthOverMonthTrend.trend === "up"
              ? "Spending increased from last month"
              : "Spending decreased from last month"}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
