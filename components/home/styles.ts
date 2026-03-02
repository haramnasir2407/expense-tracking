import { StyleSheet } from "react-native";

export const homeViewStyles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 100 },
  emptyListContainer: { flexGrow: 1 },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyText: { fontSize: 20, fontWeight: "600", marginTop: 16 },
  emptySubtext: { fontSize: 14, marginTop: 8, textAlign: "center" },
});
