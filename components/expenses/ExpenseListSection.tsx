import { Expense } from "@/types/expense";
import React from "react";
import { Text, XStack, YStack } from "tamagui";
import { ExpenseCard } from "./ExpenseCard";
import { expenseListSectionStyles as styles } from "./styles";
import { useAppTheme } from "@/hooks/use-tamagui-theme";
import { formatTotal, getDateLabel } from "@/utils/expense";

interface ExpenseListSectionProps {
  date: string;
  total: number;
  expenses: Expense[];
}

export function ExpenseListSection({
  date,
  total,
  expenses,
}: ExpenseListSectionProps) {
  const { colors } = useAppTheme();

  return (
    <YStack style={styles.container}>
      <XStack
        style={[styles.header, { borderBottomColor: colors.text + "20" }]}
      >
        <Text style={[styles.dateText, { color: colors.text }]}>
          {getDateLabel(date, expenses)}
        </Text>
        <Text style={[styles.totalText, { color: colors.text + "99" }]}>
          {formatTotal(total)}
        </Text>
      </XStack>

      <YStack style={styles.expensesList}>
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </YStack>
    </YStack>
  );
}
