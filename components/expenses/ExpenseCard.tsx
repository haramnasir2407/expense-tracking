import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Expense } from "@/types/expense";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import { Text, XStack, YStack } from "tamagui";
import { AppPressable } from "../primitives/app-pressable";
import { IconCircle } from "../primitives/icon-circle";
import { expenseCardStyles as styles } from "./styles";

interface ExpenseCardProps {
  expense: Expense;
}

export function ExpenseCard({ expense }: ExpenseCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const handlePress = () => {
    router.push(`/expenses/${expense.id}`);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <AppPressable
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderColor: colors.text + "20",
          borderWidth: 1,
        },
      ]}
      onPress={handlePress}
    >
      <YStack style={styles.iconContainer}>
        <IconCircle
          size={48}
          backgroundColor={colors.tint + "20"}
          style={{ marginRight: 0 }}
        >
          <Ionicons name="receipt-outline" size={24} color={colors.tint} />
        </IconCircle>
      </YStack>

      <YStack style={styles.contentContainer}>
        <XStack style={styles.topRow}>
          <Text style={[styles.category, { color: colors.text }]}>
            {expense.category}
          </Text>
          <Text style={[styles.amount, { color: colors.text }]}>
            {formatAmount(expense.amount)}
          </Text>
        </XStack>

        <XStack style={styles.bottomRow}>
          {expense.notes && (
            <Text
              style={[styles.notes, { color: colors.text + "99" }]}
              numberOfLines={1}
            >
              {expense.notes}
            </Text>
          )}
          <Text style={[styles.time, { color: colors.text + "66" }]}>
            {formatTime(expense.date)}
          </Text>
        </XStack>
      </YStack>
    </AppPressable>
  );
}
