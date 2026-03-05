import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { spacing } from "@/constants/theme";
import { ExpenseFormData } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import React from "react";
import { Button } from "tamagui";
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
            <Button
              unstyled
              onPress={onCancel}
              style={{ padding: spacing.md, marginLeft: spacing.md }}
            >
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </Button>
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
