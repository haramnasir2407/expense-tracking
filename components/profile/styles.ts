import { StyleSheet } from "react-native";

import { fontSize, lineHeight, radius, spacing } from "@/constants/theme";

const cardRadius = radius.sm * 4; // 12

const profileCardShadow = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

export const profileViewStyles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: 20,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: spacing.xl,
    marginTop: spacing.lg,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: spacing.xl,
  },
  welcomeText: { marginBottom: spacing.md },
  emailText: { opacity: 0.7, fontSize: fontSize.md },
  section: { marginBottom: spacing.xl },
  sectionTitle: { marginBottom: spacing.lg },
  card: {
    borderRadius: cardRadius,
    overflow: "hidden",
  },
  statusCard: {
    padding: spacing.xl,
  },
  statusRow: { flexDirection: "row", justifyContent: "space-around" },
  statusItem: { alignItems: "center", gap: spacing.md },
  statusLabel: { fontSize: fontSize.md, opacity: 0.8 },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.xl,
    borderRadius: cardRadius,
    marginBottom: spacing.lg,
    ...profileCardShadow,
  },
  cardAction: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: cardRadius,
  },
  cardActionBorder: {
    borderTopWidth: 1,
    marginTop: spacing.xs,
    paddingTop: spacing.lg,
  },
  actionLeft: { flexDirection: "row", alignItems: "center", gap: spacing.lg },
  actionTitle: { fontSize: fontSize.md },
  infoRow: {
    flexDirection: "row",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  infoRowText: {
    flex: 1,
    fontSize: fontSize.sm,
    lineHeight: lineHeight.sm,
    opacity: 0.8,
  },
  syncSubtitle: {
    fontSize: fontSize.sm,
    opacity: 0.5,
    marginTop: 2,
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    backgroundColor: "#FF6B6B20",
    borderRadius: radius.sm,
    marginBottom: spacing.xl,
  },
  permissionText: {
    fontSize: fontSize.sm,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    flex: 1,
  },
  settingTextContainer: { flex: 1 },
  settingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  settingTitle: { fontSize: fontSize.md, fontWeight: "600" },
  settingSubtitle: { fontSize: fontSize.sm, opacity: 0.6 },
  thresholdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.xs,
    marginHorizontal: spacing.xl,
    marginBottom: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.sm * 2,
  },
  thresholdText: { fontSize: fontSize.sm, opacity: 0.8 },
});
