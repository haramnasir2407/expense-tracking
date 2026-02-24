import { AddExpenseView } from "@/components/expenses/AddExpenseView";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseFormData } from "@/types/expense";
import { router } from "expo-router";
import React from "react";
import Toast from "react-native-toast-message";

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { addExpense } = useExpenses();

  const handleSubmit = async (data: ExpenseFormData) => {
    const { error } = await addExpense(data);
    if (error) {
      Toast.show({
        type: "error",
        text1: "Error adding expense",
        text2: error,
      });
    } else {
      Toast.show({
        type: "success",
        text1: "Expense added",
      });
      router.back();
    }
  };

  return (
    <AddExpenseView
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      colors={colors}
    />
  );
}
