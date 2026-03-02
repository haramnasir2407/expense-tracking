import { StyleSheet } from "react-native";

export const themedTextStyles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    color: "#0a7ea4",
  },
});

export const themedViewStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export const cardStyles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardNoShadow: {
    padding: 16,
    borderRadius: 12,
  },
});

export const appPressableStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    minHeight: 52,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
});

export const iconCircleStyles = StyleSheet.create({
  circle: {
    justifyContent: "center",
    alignItems: "center",
  },
});
