import { fontSize, spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

export const homeViewStyles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: spacing.xl, paddingBottom: 100 },
  emptyListContainer: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
    marginTop: spacing.lg,
  },
  emptySubtext: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
    textAlign: "center",
  },
});
