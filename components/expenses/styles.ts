import { Colors, fontSize, radius, size, spacing } from "@/constants/theme";
import { StyleSheet } from "react-native";

const cardRadius = radius.sm * 4; // 12

export const categoryPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.dark.background + "50",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: radius.sm * 4,
    borderTopRightRadius: radius.sm * 4,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: spacing.xl,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: "bold",
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  loadingContainer: {
    padding: spacing.xl,
    alignItems: "center",
  },
  scrollView: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xl,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: spacing.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.lg,
    borderRadius: cardRadius,
    borderWidth: 1,
    marginBottom: spacing.lg,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: cardRadius,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.lg,
  },
  categoryName: {
    fontSize: fontSize.lg,
    fontWeight: "500",
    flex: 1,
  },
});

export const receiptUploadStyles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: cardRadius,
    borderWidth: 2,
    borderStyle: "dashed",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    borderStyle: "dashed",
  },
  image: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  removeButton: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    borderRadius: cardRadius,
  },
  addText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    marginTop: spacing.md,
  },
  uploadingText: {
    fontSize: fontSize.md,
    marginTop: spacing.md,
  },
});

export const expenseSummaryStyles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.xl,
    padding: spacing.xl,
    borderRadius: cardRadius,
  },
  mainTotal: {
    alignItems: "center",
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.sm,
  },
  amount: {
    fontSize: fontSize.xxxl,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: fontSize.md,
    marginBottom: spacing.xs,
  },
  statAmount: {
    fontSize: fontSize.xxl,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: size.lg,
    marginHorizontal: spacing.lg,
  },
});

export const expenseCardStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: spacing.xl,
    borderRadius: cardRadius,
    marginHorizontal: 0,
    marginBottom: spacing.lg,
    borderColor: Colors.light.text + "20",
    borderWidth: 1,
  },
  iconContainer: {
    marginRight: spacing.lg,
    justifyContent: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: cardRadius,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    flex: 1,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  category: {
    fontSize: fontSize.lg,
    fontWeight: "600",
    flex: 1,
  },
  amount: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    marginLeft: spacing.md,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notes: {
    fontSize: fontSize.md,
    flex: 1,
    marginRight: spacing.md,
  },
  time: {
    fontSize: fontSize.sm,
  },
  receiptBadge: {
    position: "absolute",
    top: 0,
    right: 0,
  },
});

export const expenseFormStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: 0,
  },
  field: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fontSize.md,
    fontWeight: "600",
    marginBottom: spacing.md,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: cardRadius,
    paddingHorizontal: spacing.xl,
    height: 56,
  },
  currencySymbol: {
    fontSize: fontSize.xl,
    fontWeight: "bold",
    marginRight: spacing.md,
  },
  input: {
    flex: 1,
    fontSize: fontSize.xl,
    fontWeight: "600",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: cardRadius,
    paddingHorizontal: spacing.xl,
    height: 56,
  },
  pickerButtonText: {
    fontSize: fontSize.lg,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: cardRadius,
    paddingHorizontal: spacing.xl,
    height: 56,
    gap: spacing.lg,
  },
  dateText: {
    fontSize: fontSize.lg,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: cardRadius,
    padding: spacing.xl,
    fontSize: fontSize.lg,
    minHeight: 100,
  },
  errorText: {
    fontSize: fontSize.sm,
    color: "#FF4444",
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: "row",
    padding: spacing.xl,
    borderTopWidth: 1,
    gap: spacing.lg,
  },
  cancelButtonText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  submitButtonContainer: {
    flex: 1,
  },

  buttons: {
    flexDirection: "row",
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  inputText: {
    color: "#333",
  },
  button: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: cardRadius,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f0f0f0",
  },
  submitButton: {
    backgroundColor: Colors.light.tint,
  },
  cancelText: {
    color: "#666",
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  submitText: {
    color: "white",
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
});

export const expenseDetailViewStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.xl, paddingBottom: spacing.xl },
  amountCard: {
    padding: spacing.lg,
    borderRadius: cardRadius,
    alignItems: "center",
    marginBottom: spacing.lg,
    borderWidth: 1,
  },
  amountLabel: {
    fontSize: fontSize.md,
    fontWeight: "500",
    marginBottom: spacing.md,
  },
  amountValue: { fontSize: fontSize.xl, fontWeight: "bold" },
  section: { marginBottom: spacing.lg },
  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: "600",
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: spacing.xl,
    borderBottomWidth: 1,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    flex: 1,
  },
  detailLabel: { fontSize: fontSize.lg, fontWeight: "500" },
  detailValue: { fontSize: fontSize.lg, textAlign: "right", flex: 1 },
  notesValue: { marginTop: spacing.md },
  receiptImage: {
    width: "100%",
    height: 300,
    borderRadius: cardRadius,
    borderWidth: 1,
  },
});

export const expenseListSectionStyles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  totalText: {
    fontSize: fontSize.md,
    fontWeight: "500",
  },
  expensesList: {
    paddingTop: spacing.lg,
  },
});
