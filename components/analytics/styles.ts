import { StyleSheet } from "react-native";

export const analyticsViewStyles = StyleSheet.create({
  container: { flex: 1 },
  rangeSelector: { paddingVertical: 12 },
  rangeSelectorContent: { paddingHorizontal: 16, gap: 8 },
  rangeButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  rangeButtonText: { fontSize: 14, fontWeight: "600" },
  rangeButtonTextActive: { color: "white" },
  summaryGrid: { flexDirection: "row", flexWrap: "wrap", padding: 16, gap: 12 },
  summaryCard: {
    flex: 1,
    minWidth: "45%",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: { fontSize: 12, marginBottom: 4 },
  summaryValue: { fontSize: 20, fontWeight: "700" },
  chartSection: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  insightCard: {
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  insightTitle: { fontSize: 14, marginBottom: 4 },
  insightValue: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  insightDescription: { fontSize: 14 },
});

export const monthlyBarChartStyles = StyleSheet.create({
  container: {
    width: "100%",
  },
  labelsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginTop: 8,
  },
  label: {
    fontSize: 11,
    textAlign: "center",
  },
  yearRangeContainer: {
    marginTop: 6,
    alignItems: "center",
  },
  yearRangeLabel: {
    fontSize: 11,
  },
  axisLabelsContainer: {
    alignItems: "center",
    marginTop: 6,
  },
  axisLabel: {
    fontSize: 11,
    color: "#999",
  },
  yAxisLabelContainer: {
    position: "absolute",
    left: "-12%",
    top: "50%",
    transform: [{ translateY: -40 }, { rotate: "-90deg" }],
    paddingHorizontal: 4,
  },
  yAxisLabelText: {
    fontSize: 11,
    color: "#999",
  },
});

export const emptyChartStateStyles = StyleSheet.create({
  container: {
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
  },
  message: {
    marginTop: 12,
    fontSize: 16,
    color: "#999",
    textAlign: "center",
  },
});

export const spendingLineChartStyles = StyleSheet.create({
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
  axisLabelsContainer: {
    alignItems: "center",
    paddingHorizontal: 4,
    marginTop: 4,
  },
  axisLabel: {
    fontSize: 11,
    color: "#999",
  },
  yAxisLabelContainer: {
    position: "absolute",
    left: "-12%",
    top: "50%",
    transform: [{ translateY: -40 }, { rotate: "-90deg" }],
    paddingHorizontal: 4,
  },
  yAxisLabelText: {
    fontSize: 11,
    color: "#999",
  },
});

export const categoryPieChartStyles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  legend: {
    marginTop: 20,
    width: "100%",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendLabel: {
    fontSize: 14,
  },
});
