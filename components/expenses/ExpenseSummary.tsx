import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import React from "react";
import { Text, View } from "react-native";
import { expenseSummaryStyles as styles } from "./styles";

export function ExpenseSummary() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { getTotalAmount } = useExpenses();

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const todayTotal = getTotalAmount("today");
  const weekTotal = getTotalAmount("week");
  const monthTotal = getTotalAmount("month");

  return (
    <View style={[styles.container, { backgroundColor: colors.tint + "10" }]}>
      <View style={styles.mainTotal}>
        <Text style={[styles.label, { color: colors.text + "99" }]}>
          This Month
        </Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatAmount(monthTotal)}
        </Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.text + "99" }]}>
            Today
          </Text>
          <Text style={[styles.statAmount, { color: colors.text }]}>
            {formatAmount(todayTotal)}
          </Text>
        </View>

        <View
          style={[styles.divider, { backgroundColor: colors.text + "20" }]}
        />

        <View style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.text + "99" }]}>
            This Week
          </Text>
          <Text style={[styles.statAmount, { color: colors.text }]}>
            {formatAmount(weekTotal)}
          </Text>
        </View>
      </View>
    </View>
  );
}
