import { StyleSheet } from "react-native";

export const budgetsViewStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  summaryCard: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryTitle: { fontSize: 20, fontWeight: "700", marginBottom: 16 },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: { fontSize: 16 },
  summaryValue: { fontSize: 16, fontWeight: "600" },
  overBudget: { color: "#FF6B6B" },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: { height: "100%", borderRadius: 6 },
  percentageText: { fontSize: 14, textAlign: "center" },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16 },
  emptyState: { alignItems: "center", padding: 40 },
  emptyText: { fontSize: 18, fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: "center" },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
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
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 20, fontWeight: "700" },
});

export const budgetCardStyles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionBtn: {
    padding: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
  },
  percentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 14,
  },
  remaining: {
    fontSize: 14,
    fontWeight: "600",
  },
});

export const budgetFormStyles = StyleSheet.create({
  container: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  placeholder: {
    color: "#999",
  },
  buttons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  inputText: {
    color: "#333",
  },
  button: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: "#0a7ea4",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});

