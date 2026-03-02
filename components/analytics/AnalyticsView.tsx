import { MonthlyBarChart } from "@/components/analytics/BarChart";
import { SpendingLineChart } from "@/components/analytics/LineChart";
import { CategoryPieChart } from "@/components/analytics/PieChart";
import { CategoryPicker } from "@/components/expenses/CategoryPicker";
import { DATE_RANGES } from "@/constants/dateRanges";
import { AnalyticsData, DailySpending, DateRange } from "@/types/analytics";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { AppPressable } from "../primitives/app-pressable";
import { Card } from "../primitives/themed-card";
import { analyticsViewStyles as styles } from "./styles";

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  selectedRange: DateRange;
  onSelectRange: (range: DateRange) => void;
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  dailyBudgetSeries?: DailySpending[] | null;
  isDark: boolean;
  colors: { background: string; text: string; tint: string };
}

export function AnalyticsView({
  analytics,
  selectedRange,
  onSelectRange,
  selectedCategory,
  onSelectCategory,
  dailyBudgetSeries,
  isDark,
  colors,
}: AnalyticsViewProps) {
  const [categoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const cardBg = isDark ? "#1C1C1E" : "white";
  const buttonBg = isDark ? "#2C2C2E" : "#f0f0f0";
  const labelColor = isDark ? "#8E8E93" : "#999";
  const textColor = isDark ? "#FFFFFF" : "#666";
  const categoryLabel =
    selectedCategory === "all" ? "Filter by category" : selectedCategory;

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

      <AppPressable
        style={[
          styles.rangeSelector,
          styles.categoryFilterButton,
          { backgroundColor: cardBg },
        ]}
        onPress={() => setCategoryPickerVisible(true)}
        rightIcon="chevron-down"
      >
        <Text style={[styles.rangeButtonText, { color: textColor }]}>
          {categoryLabel}
        </Text>
      </AppPressable>

      <CategoryPicker
        visible={categoryPickerVisible}
        selectedCategory={selectedCategory}
        onSelect={onSelectCategory}
        onClose={() => setCategoryPickerVisible(false)}
        showAllOption
      />

      <View style={styles.summaryGrid}>
        <Card
          noShadow
          style={[styles.summaryCard, { backgroundColor: cardBg }]}
        >
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Total Spent
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${analytics.totalSpent.toFixed(2)}
          </Text>
        </Card>
        <Card
          noShadow
          style={[styles.summaryCard, { backgroundColor: cardBg }]}
        >
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Avg/Day
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${analytics.averagePerDay.toFixed(2)}
          </Text>
        </Card>
        <Card
          noShadow
          style={[styles.summaryCard, { backgroundColor: cardBg }]}
        >
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Transactions
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            {analytics.transactionCount}
          </Text>
        </Card>
        <Card
          noShadow
          style={[styles.summaryCard, { backgroundColor: cardBg }]}
        >
          <Text style={[styles.summaryLabel, { color: labelColor }]}>
            Avg/Transaction
          </Text>
          <Text style={[styles.summaryValue, { color: colors.text }]}>
            ${analytics.averagePerTransaction.toFixed(2)}
          </Text>
        </Card>
      </View>

      <Card noShadow style={[styles.chartSection, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Spending Over Time
        </Text>
        <SpendingLineChart
          data={analytics.dailyTotals}
          budgetData={dailyBudgetSeries ?? undefined}
          isDark={isDark}
        />
      </Card>
      <Card noShadow style={[styles.chartSection, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Category Breakdown
        </Text>
        <CategoryPieChart data={analytics.byCategory} isDark={isDark} />
      </Card>
      <Card noShadow style={[styles.chartSection, { backgroundColor: cardBg }]}>
        <Text style={[styles.chartTitle, { color: colors.text }]}>
          Monthly Comparison
        </Text>
        <MonthlyBarChart
          data={analytics.monthlyTotals}
          isDark={isDark}
          dateRange={selectedRange}
        />
      </Card>

      {analytics.monthOverMonthTrend.previous > 0 && (
        <Card
          noShadow
          style={[styles.insightCard, { backgroundColor: cardBg }]}
        >
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
        </Card>
      )}
    </ScrollView>
  );
}
