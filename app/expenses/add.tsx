import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseFormData } from "@/types/expense";
import { Stack, router } from "expo-router";
import React from "react";
import { Alert, StyleSheet, View } from "react-native";

export default function AddExpenseScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { addExpense } = useExpenses();

  const handleSubmit = async (data: ExpenseFormData) => {
    const { error } = await addExpense(data);

    if (error) {
      Alert.alert("Error", error);
    } else {
      Alert.alert("Success", "Expense added successfully", [
        {
          text: "OK",
          onPress: () => router.back(),
        },
      ]);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Expense",
          headerStyle: {
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerShadowVisible: false,
        }}
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ExpenseForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Add Expense"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
