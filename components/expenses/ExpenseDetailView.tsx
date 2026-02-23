import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Expense, ExpenseFormData } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";

interface ExpenseDetailViewProps {
  expense: Expense;
  formattedAmount: string;
  formattedDate: string;
  isEditing: boolean;
  colors: { background: string; text: string; tint: string };
  onUpdate: (data: ExpenseFormData) => Promise<void>;
  onCancelEdit: () => void;
}

export function ExpenseDetailView({
  expense,
  formattedAmount,
  formattedDate,
  isEditing,
  colors,
  onUpdate,
  onCancelEdit,
}: ExpenseDetailViewProps) {
  if (isEditing) {
    return (
      <ExpenseForm
        initialData={{
          amount: expense.amount.toString(),
          category: expense.category,
          date: new Date(expense.date),
          notes: expense.notes || "",
          receipt_url: expense.receipt_url,
        }}
        onSubmit={onUpdate}
        onCancel={onCancelEdit}
        submitLabel="Update Expense"
      />
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View
        style={[
          styles.amountCard,
          {
            backgroundColor: colors.tint + "20",
            borderColor: colors.tint + "40",
          },
        ]}
      >
        <Text style={[styles.amountLabel, { color: colors.text + "99" }]}>
          Amount
        </Text>
        <Text style={[styles.amountValue, { color: colors.text }]}>
          {formattedAmount}
        </Text>
      </View>

      <View style={styles.section}>
        <View
          style={[styles.detailRow, { borderBottomColor: colors.text + "20" }]}
        >
          <View style={styles.detailLabelContainer}>
            <Ionicons
              name="pricetag-outline"
              size={20}
              color={colors.text + "99"}
            />
            <Text style={[styles.detailLabel, { color: colors.text + "99" }]}>
              Category
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {expense.category}
          </Text>
        </View>
        <View
          style={[styles.detailRow, { borderBottomColor: colors.text + "20" }]}
        >
          <View style={styles.detailLabelContainer}>
            <Ionicons
              name="calendar-outline"
              size={20}
              color={colors.text + "99"}
            />
            <Text style={[styles.detailLabel, { color: colors.text + "99" }]}>
              Date
            </Text>
          </View>
          <Text style={[styles.detailValue, { color: colors.text }]}>
            {formattedDate}
          </Text>
        </View>
        {expense.notes && (
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <View style={styles.detailLabelContainer}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.text + "99"}
              />
              <Text style={[styles.detailLabel, { color: colors.text + "99" }]}>
                Notes
              </Text>
            </View>
            <Text
              style={[
                styles.detailValue,
                styles.notesValue,
                { color: colors.text },
              ]}
            >
              {expense.notes}
            </Text>
          </View>
        )}
      </View>

      {expense.receipt_url && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Receipt
          </Text>
          <Image
            source={{ uri: expense.receipt_url }}
            style={[styles.receiptImage, { borderColor: colors.text + "20" }]}
            resizeMode="cover"
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
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
