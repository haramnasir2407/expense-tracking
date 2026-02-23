import { BudgetsView } from "@/components/budgets/BudgetsView";
import { Colors } from "@/constants/theme";
import { useBudgets } from "@/contexts/BudgetContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Budget, BudgetFormData } from "@/types/budget";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";

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
  const {
    budgets,
    currentMonthSummary,
    createBudget,
    updateBudget,
    deleteBudget,
  } = useBudgets();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const currentMonthBudgets = useMemo(() => {
    const key = getCurrentMonthKey();
    return budgets.filter(
      (b) => b.month === key || b.month.startsWith(key.slice(0, 7)),
    );
  }, [budgets]);

  const handleCreateBudget = async (data: BudgetFormData) => {
    const monthKey = getMonthKeyFromDate(data.month);
    const alreadyExists = budgets.some(
      (b) =>
        b.category === data.category &&
        (b.month === monthKey || b.month.startsWith(monthKey.slice(0, 7))),
    );
    if (alreadyExists) {
      Alert.alert(
        "Budget Already Exists",
        "A budget for this category already exists for the selected month. Edit the existing budget from the list instead.",
        [{ text: "OK" }],
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
          onPress: () => deleteBudget(budget.id),
        },
      ],
    );
  };

  return (
    <BudgetsView
      currentMonthSummary={currentMonthSummary}
      currentMonthBudgets={currentMonthBudgets}
      showCreateForm={showCreateForm}
      editingBudget={editingBudget}
      isDark={colorScheme === "dark"}
      colors={colors}
      onCreateBudget={handleCreateBudget}
      onUpdateBudget={handleUpdateBudget}
      onDeleteBudget={handleDeleteBudget}
      onOpenCreate={() => setShowCreateForm(true)}
      onCloseCreate={() => setShowCreateForm(false)}
      onOpenEdit={setEditingBudget}
      onCloseEdit={() => setEditingBudget(null)}
    />
  );
}
