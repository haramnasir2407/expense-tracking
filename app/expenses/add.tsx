import { AddExpenseView } from "@/components/expenses/AddExpenseView";
import { Colors } from "@/constants/theme";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseFormData } from "@/types/expense";
import { router } from "expo-router";
import React from "react";
import { Alert, useColorScheme } from "react-native";

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { addExpense } = useExpenses();

  const handleSubmit = async (data: ExpenseFormData) => {
    const { error } = await addExpense(data);
    if (error) Alert.alert("Error", error);
    else
      Alert.alert("Success", "Expense added successfully", [
        { text: "OK", onPress: () => router.back() },
      ]);
  };

  return (
    <AddExpenseView
      onSubmit={handleSubmit}
      onCancel={() => router.back()}
      colors={colors}
    />
  );
}
