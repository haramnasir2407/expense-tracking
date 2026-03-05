import { StyleSheet } from "react-native";

import { fontSize, radius, size, spacing } from "@/constants/theme";

const cardRadius = radius.sm * 4; // 12

const analyticsCardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: radius.sm,
  elevation: 3,
};

export const analyticsViewStyles = StyleSheet.create({
  container: { flex: 1 },
  rangeSelector: { paddingVertical: spacing.lg },
  rangeSelectorContent: { paddingHorizontal: spacing.xl, gap: spacing.md },
  categoryFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.xl,
    marginHorizontal: spacing.xl,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    borderRadius: cardRadius,
  },
  rangeButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.sm * 4,
  },
  rangeButtonText: { fontSize: fontSize.md, fontWeight: "600" },
  rangeButtonTextActive: { color: "white" },
  summaryGrid: {
    flexWrap: "nowrap",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    minWidth: 72,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: cardRadius,
    ...analyticsCardShadow,
  },
  summaryLabel: { fontSize: fontSize.sm, marginBottom: spacing.sm },
  summaryValue: { fontSize: fontSize.lg, fontWeight: "700" },
  chartSection: {
    flex: 1,
    minWidth: 72,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    borderRadius: cardRadius,
    ...analyticsCardShadow,
  },
  chartSectionStack: {
    flexWrap: "nowrap",
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
    gap: spacing.md,
  },
  chartTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.lg,
  },
  insightCard: {
    padding: spacing.xl,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.xl,
    borderRadius: cardRadius,
    alignItems: "center",
    justifyContent: "center",
    ...analyticsCardShadow,
  },
  insightTitle: {
    fontSize: fontSize.md,
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  insightValue: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.sm,
    textAlign: "center",
  },
  insightDescription: { fontSize: fontSize.md, textAlign: "center" },
});

export const monthlyBarChartStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: spacing.sm,
    marginTop: spacing.md,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
  yearRangeContainer: {
    marginTop: spacing.sm,
    alignItems: "center",
  },
  yearRangeLabel: {
    fontSize: fontSize.sm,
  },
  axisLabelsContainer: {
    alignItems: "center",
    marginTop: spacing.sm,
  },
  axisLabel: {
    fontSize: fontSize.sm,
    color: "#999",
  },
  yAxisLabelContainer: {
    position: "absolute",
    left: "-12%",
    top: "50%",
    transform: [{ translateY: -40 }, { rotate: "-90deg" }],
    paddingHorizontal: spacing.sm,
  },
  yAxisLabelText: {
    fontSize: fontSize.sm,
    color: "#999",
  },
});

export const emptyChartStateStyles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: cardRadius,
  },
  message: {
    marginTop: spacing.lg,
    fontSize: fontSize.lg,
    color: "#999",
    textAlign: "center",
  },
});

export const spendingLineChartStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  legendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  legendDot: {
    width: size.sm,
    height: size.md,
    borderRadius: radius.sm * 2,
  },
  legendText: {
    fontSize: fontSize.sm,
    color: "#666",
  },
  tooltip: {
    position: "absolute",
    top: spacing.sm,
    right: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.sm * 2,
  },
  tooltipText: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
  axisLabelsContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.sm,
    marginTop: spacing.sm,
  },
  axisLabel: {
    fontSize: fontSize.sm,
    color: "#999",
  },
  yAxisLabelContainer: {
    position: "absolute",
    left: "-12%",
    top: "50%",
    transform: [{ translateY: -40 }, { rotate: "-90deg" }],
    paddingHorizontal: spacing.sm,
  },
  yAxisLabelText: {
    fontSize: fontSize.sm,
    color: "#999",
  },
});

export const categoryPieChartStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  legend: {
    marginTop: spacing.lg,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: radius.sm * 4,
    marginRight: spacing.md,
  },
  legendLabel: {
    fontSize: fontSize.md,
  },
});
