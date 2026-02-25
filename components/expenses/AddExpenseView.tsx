import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseFormData } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { TouchableOpacity } from "react-native";
import ThemedView from "../primitives/themed-view";

interface AddExpenseViewProps {
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  onCancel: () => void;
  colors: { background: string; text: string };
}

export function AddExpenseView({
  onSubmit,
  onCancel,
  colors,
}: AddExpenseViewProps) {
  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Expense",
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerShadowVisible: false,
          headerLeft: () => (
            <TouchableOpacity
              onPress={onCancel}
              style={{ padding: 8, marginLeft: 8 }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
          ),
        }}
      />
      <ThemedView>
        <ExpenseForm
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitLabel="Add Expense"
        />
      </ThemedView>
    </>
  );
}
