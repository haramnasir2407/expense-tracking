import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseFormData } from "@/types/expense";
import { Stack } from "expo-router";
import React from "react";
import { StyleSheet, View } from "react-native";

interface AddExpenseViewProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  colors: { background: string; text: string };
}

export function AddExpenseView({ onSubmit, onCancel, colors }: AddExpenseViewProps) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Expense",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ExpenseForm onSubmit={onSubmit} onCancel={onCancel} submitLabel="Add Expense" />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
