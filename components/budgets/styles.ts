import { StyleSheet } from "react-native";

import { fontSize, radius, spacing } from "@/constants/theme";

const cardRadius = radius.sm * 4;

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

export const budgetsViewStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  summaryCard: {
    margin: spacing.xl,
    padding: spacing.lg,
    borderRadius: cardRadius,
  },
  summaryTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.xl,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  summaryLabel: { fontSize: fontSize.lg },
  summaryValue: { fontSize: fontSize.lg, fontWeight: "600" },
  overBudget: { color: "#FF6B6B" },
  progressBar: {
    borderRadius: radius.sm * 2,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: radius.sm * 2 },
  percentageText: { fontSize: fontSize.md, textAlign: "center" },
  section: { padding: spacing.xl },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "700",
    marginBottom: spacing.xl,
  },
  emptyState: { alignItems: "center", padding: spacing.xl },
  emptyText: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginTop: spacing.xl,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: cardRadius,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
  },
  modalContainer: { flex: 1 },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: fontSize.xl, fontWeight: "700" },
});

export const budgetCardStyles = StyleSheet.create({
  container: {
    borderRadius: cardRadius,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    ...cardShadow,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: spacing.md,
  },
  actionBtn: {
    padding: spacing.sm,
  },
  category: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  percentage: {
    fontSize: fontSize.xl,
    fontWeight: "700",
  },
  progressBar: {
    borderRadius: radius.sm * 2,
    overflow: "hidden",
    marginBottom: spacing.md,
  },
  progressFill: {
    height: "100%",
    borderRadius: radius.sm * 2,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: fontSize.md,
  },
  remaining: {
    fontSize: fontSize.md,
    fontWeight: "600",
  },
});

export const budgetFormStyles = StyleSheet.create({
  container: {
    padding: spacing.lg,
  },
  label: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginBottom: spacing.md,
    marginTop: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: radius.sm * 2,
    padding: spacing.lg,
    fontSize: fontSize.lg,
  },
  inputError: {
    borderColor: "#FF6B6B",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: fontSize.sm,
    marginTop: spacing.sm,
  },
  placeholder: {
    color: "#999",
  },
  buttons: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.xl,
  },
  inputText: {
    color: "#333",
  },
});
