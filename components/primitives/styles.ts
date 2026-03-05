import { StyleSheet } from "react-native";

import { Colors, fontSize, lineHeight, radius, size, spacing } from "@/constants/theme";

export const themedTextStyles = StyleSheet.create({
  default: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.md,
  },
  defaultSemiBold: {
    fontSize: fontSize.lg,
    lineHeight: lineHeight.md,
    fontWeight: "600",
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    lineHeight: lineHeight.lg,
  },
  subtitle: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
  },
  link: {
    lineHeight: lineHeight.lg,
    fontSize: fontSize.lg,
    color: Colors.light.tint,
  },
});

export const themedViewStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

const cardPadding = spacing.lg + spacing.sm; // 16
const cardRadius = radius.sm * 4;

const cardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

export const cardStyles = StyleSheet.create({
  card: {
    padding: cardPadding,
    borderRadius: cardRadius,
    ...cardShadow,
  },
  cardNoShadow: {
    padding: cardPadding,
    borderRadius: cardRadius,
  },
});

export const appPressableStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: cardPadding,
    paddingVertical: spacing.md,
    borderRadius: cardRadius,
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

export const addButtonStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: spacing.lg + size.sm,
    bottom: spacing.lg + size.sm,
    width: 56,
    height: 56,
    borderRadius: radius.sm * 4,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
