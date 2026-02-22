import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import { Colors } from "@/constants/theme";
import { useBudgets } from "@/contexts/BudgetContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Budget, BudgetFormData } from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function getCurrentMonthKey(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

function getMonthKeyFromDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

export default function BudgetsScreen() {
  const { budgets, currentMonthSummary, createBudget, updateBudget, deleteBudget } = useBudgets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const currentMonthBudgets = useMemo(() => {
    const key = getCurrentMonthKey();
    return budgets.filter((b) => b.month === key || b.month.startsWith(key.slice(0, 7)));
  }, [budgets]);

  const handleCreateBudget = async (data: BudgetFormData) => {
    const monthKey = getMonthKeyFromDate(data.month);
    const alreadyExists = budgets.some(
      (b) => b.category === data.category && (b.month === monthKey || b.month.startsWith(monthKey.slice(0, 7)))
    );
    if (alreadyExists) {
      Alert.alert(
        "Budget Already Exists",
        "A budget for this category already exists for the selected month. Edit the existing budget from the list instead.",
        [{ text: "OK" }]
      );
      return;
    }

    const { error } = await createBudget(data);
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }]);
      return;
    }
    setShowCreateForm(false);
    Alert.alert("Success", "Budget created successfully.", [{ text: "OK" }]);
  };

  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return;
    const { error } = await updateBudget(editingBudget.id, data.amount);
    if (error) {
      Alert.alert("Error", error, [{ text: "OK" }]);
      return;
    }
    setEditingBudget(null);
    Alert.alert("Success", "Budget updated successfully.", [{ text: "OK" }]);
  };

  const handleDeleteBudget = (budget: Budget) => {
    Alert.alert(
      "Delete Budget",
      `Remove the ${budget.category} budget ($${budget.amount.toFixed(2)}/month)?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteBudget(budget.id);
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {currentMonthSummary && (
          <View style={[styles.summaryCard, { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : 'white' }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>This Month</Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#8E8E93' : '#666' }]}>Budget</Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${currentMonthSummary.totalBudget.toFixed(2)}
              </Text>
            </View>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#8E8E93' : '#666' }]}>Spent</Text>
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

            <View style={[styles.progressBar, { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#f0f0f0' }]}>
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
                          : "#4ECDC4",
                  },
                ]}
              />
            </View>

            <Text style={[styles.percentageText, { color: colorScheme === 'dark' ? '#8E8E93' : '#666' }]}>
              {currentMonthSummary.percentageUsed}% used
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</Text>

          {currentMonthSummary?.categories.map((budget, index) => {
            const fullBudget = currentMonthBudgets.find((b) => b.category === budget.category);
            return (
              <BudgetCard
                key={fullBudget?.id ?? index}
                budget={budget}
                isDark={colorScheme === "dark"}
                onPress={fullBudget ? () => setEditingBudget(fullBudget) : undefined}
                onDelete={fullBudget ? () => handleDeleteBudget(fullBudget) : undefined}
              />
            );
          })}

          {(!currentMonthSummary ||
            currentMonthSummary.categories.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons name="wallet-outline" size={64} color={colorScheme === 'dark' ? '#3A3A3C' : '#ccc'} />
              <Text style={[styles.emptyText, { color: colorScheme === 'dark' ? '#8E8E93' : '#666' }]}>No budgets set</Text>
              <Text style={[styles.emptySubtext, { color: colorScheme === 'dark' ? '#636366' : '#999' }]}>
                Create a budget to track your spending
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint }]}
        onPress={() => setShowCreateForm(true)}
      >
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        visible={showCreateForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colorScheme === "dark" ? "#2C2C2E" : "#f0f0f0" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Budget</Text>
            <TouchableOpacity onPress={() => setShowCreateForm(false)}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <BudgetForm
            onSubmit={handleCreateBudget}
            onCancel={() => setShowCreateForm(false)}
          />
        </View>
      </Modal>

      <Modal
        visible={editingBudget != null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colorScheme === "dark" ? "#2C2C2E" : "#f0f0f0" }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Budget</Text>
            <TouchableOpacity onPress={() => setEditingBudget(null)}>
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
              onSubmit={handleUpdateBudget}
              onCancel={() => setEditingBudget(null)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
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
  summaryTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  overBudget: {
    color: "#FF6B6B",
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
    marginTop: 16,
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  percentageText: {
    fontSize: 14,
    textAlign: "center",
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
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
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
});
