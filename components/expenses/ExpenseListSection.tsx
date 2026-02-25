import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Expense } from "@/types/expense";
import React from "react";
import { Text, View } from "react-native";
import { ExpenseCard } from "./ExpenseCard";
import { expenseListSectionStyles as styles } from "./styles";

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const formatTotal = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getDateLabel = (dateString: string) => {
    const date = new Date(expenses[0].date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { borderBottomColor: colors.text + "20" }]}>
        <Text style={[styles.dateText, { color: colors.text }]}>
          {getDateLabel(date)}
        </Text>
        <Text style={[styles.totalText, { color: colors.text + "99" }]}>
          {formatTotal(total)}
        </Text>
      </View>

      <View style={styles.expensesList}>
        {expenses.map((expense) => (
          <ExpenseCard key={expense.id} expense={expense} />
        ))}
      </View>
    </View>
  );
}
