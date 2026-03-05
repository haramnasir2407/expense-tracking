import { BudgetsView } from "@/components/budgets/BudgetsView";
import { Colors } from "@/constants/theme";
import { useBudgets } from "@/contexts/BudgetContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Budget, BudgetFormData } from "@/types/budget";
import React, { useMemo, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";
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
      Toast.show({ type: "error", text1: "Error creating budget", text2: error });
      return;
    }
    setShowCreateForm(false);
    Toast.show({ type: "success", text1: "Budget created" });
  };

  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return;
    const { error } = await updateBudget(editingBudget.id, data.amount);
    if (error) {
      Toast.show({ type: "error", text1: "Error updating budget", text2: error });
      return;
    }
    setEditingBudget(null);
    Toast.show({ type: "success", text1: "Budget updated" });
  };

  const handleDeleteBudget = (budget: Budget) => {
    deleteBudget(budget.id);
    Toast.show({ type: "success", text1: "Budget deleted" });
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
