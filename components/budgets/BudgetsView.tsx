import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import {
  Budget,
  BudgetFormData,
  BudgetStatus,
  MonthlyBudgetSummary,
} from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BudgetsViewProps {
  currentMonthSummary: MonthlyBudgetSummary | null;
  currentMonthBudgets: Budget[];
  showCreateForm: boolean;
  editingBudget: Budget | null;
  isDark: boolean;
  colors: { background: string; text: string; tint: string };
  onCreateBudget: (data: BudgetFormData) => Promise<void>;
  onUpdateBudget: (data: BudgetFormData) => Promise<void>;
  onDeleteBudget: (budget: Budget) => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onOpenEdit: (budget: Budget) => void;
  onCloseEdit: () => void;
}

export function BudgetsView({
  currentMonthSummary,
  currentMonthBudgets,
  showCreateForm,
  editingBudget,
  isDark,
  colors,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  onOpenCreate,
  onCloseCreate,
  onOpenEdit,
  onCloseEdit,
}: BudgetsViewProps) {
  const cardBg = isDark ? "#1C1C1E" : "white";
  const borderColor = isDark ? "#2C2C2E" : "#f0f0f0";
  const emptyIconColor = isDark ? "#3A3A3C" : "#ccc";
  const emptyTextColor = isDark ? "#8E8E93" : "#666";
  const emptySubColor = isDark ? "#636366" : "#999";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {currentMonthSummary && (
          <View style={[styles.summaryCard, { backgroundColor: cardBg }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              This Month
            </Text>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDark ? "#8E8E93" : "#666" },
                ]}
              >
                Budget
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${currentMonthSummary.totalBudget.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDark ? "#8E8E93" : "#666" },
                ]}
              >
                Spent
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.text },
                  currentMonthSummary.percentageUsed > 100 && styles.overBudget,
                ]}
              >
                ${currentMonthSummary.totalSpent.toFixed(2)}
              </Text>
            </View>
            <View
              style={[
                styles.progressBar,
                { backgroundColor: isDark ? "#2C2C2E" : "#f0f0f0" },
              ]}
            >
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${Math.min(currentMonthSummary.percentageUsed, 100)}%`,
                    backgroundColor:
                      currentMonthSummary.percentageUsed >= 100
                        ? "#FF6B6B"
                        : currentMonthSummary.percentageUsed >= 80
                          ? "#F39C12"
                          : colors.tint,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.percentageText,
                { color: isDark ? "#8E8E93" : "#666" },
              ]}
            >
              {currentMonthSummary.percentageUsed}% used
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Category Budgets
          </Text>
          {currentMonthSummary?.categories.map(
            (budget: BudgetStatus, index: number) => {
              const fullBudget = currentMonthBudgets.find(
                (b) => b.category === budget.category,
              );
              return (
                <BudgetCard
                  key={fullBudget?.id ?? index}
                  budget={budget}
                  isDark={isDark}
                  onPress={
                    fullBudget ? () => onOpenEdit(fullBudget) : undefined
                  }
                  onDelete={
                    fullBudget ? () => onDeleteBudget(fullBudget) : undefined
                  }
                />
              );
            },
          )}
          {(!currentMonthSummary ||
            currentMonthSummary.categories.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons
                name="wallet-outline"
                size={64}
                color={emptyIconColor}
              />
              <Text style={[styles.emptyText, { color: emptyTextColor }]}>
                No budgets set
              </Text>
              <Text style={[styles.emptySubtext, { color: emptySubColor }]}>
                Create a budget to track your spending
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={onOpenCreate}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showCreateForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Budget
            </Text>
            <TouchableOpacity onPress={onCloseCreate}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <BudgetForm onSubmit={onCreateBudget} onCancel={onCloseCreate} />
        </View>
      </Modal>

      <Modal
        visible={editingBudget != null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Budget
            </Text>
            <TouchableOpacity onPress={onCloseEdit}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          {editingBudget && (
            <BudgetForm
              editMode
              initialData={{
                category: editingBudget.category,
                amount: String(editingBudget.amount),
                month: new Date(editingBudget.month),
              }}
              onSubmit={onUpdateBudget}
              onCancel={onCloseEdit}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
