import { StyleSheet } from "react-native";

export const categoryPickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  scrollView: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});

export const receiptUploadStyles = StyleSheet.create({
  container: {
    height: 200,
    borderRadius: 12,
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
    top: 8,
    right: 8,
    borderRadius: 14,
  },
  addText: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  uploadingText: {
    fontSize: 14,
    marginTop: 8,
  },
});

export const expenseSummaryStyles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 20,
    borderRadius: 16,
  },
  mainTotal: {
    alignItems: "center",
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  amount: {
    fontSize: 32,
    fontWeight: "bold",
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
    fontSize: 12,
    marginBottom: 4,
  },
  statAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  divider: {
    width: 1,
    height: 40,
    marginHorizontal: 16,
  },
});

export const expenseCardStyles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  iconContainer: {
    marginRight: 12,
    justifyContent: "center",
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    marginBottom: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  notes: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
  },
  time: {
    fontSize: 12,
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
    padding: 16,
    paddingBottom: 0,
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontWeight: "bold",
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: "600",
  },
  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
  },
  pickerButtonText: {
    fontSize: 16,
  },
  dateDisplay: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    gap: 12,
  },
  dateText: {
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: "#FF4444",
    marginTop: 4,
  },
  footer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonContainer: {
    flex: 1,
  },
});

export const expenseDetailViewStyles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 40 },
  amountCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
  },
  amountLabel: { fontSize: 14, fontWeight: "500", marginBottom: 8 },
  amountValue: { fontSize: 40, fontWeight: "bold" },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "600", marginBottom: 12 },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  detailLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  detailLabel: { fontSize: 16, fontWeight: "500" },
  detailValue: { fontSize: 16, textAlign: "right", flex: 1 },
  notesValue: { marginTop: 8 },
  receiptImage: {
    width: "100%",
    height: 300,
    borderRadius: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  totalText: {
    fontSize: 14,
    fontWeight: "500",
  },
  expensesList: {
    paddingTop: 12,
  },
});

