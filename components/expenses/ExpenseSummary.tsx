import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import React from "react";
import { Text, YStack } from "tamagui";
import { Card } from "../primitives/themed-card";
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
    <Card
      noShadow
      style={styles.container}
      backgroundColor={colors.tint + "10"}
      borderColor={colors.tint + "10"}
    >
      <YStack style={styles.mainTotal}>
        <Text style={[styles.label, { color: colors.text + "99" }]}>
          This Month
        </Text>
        <Text style={[styles.amount, { color: colors.text }]}>
          {formatAmount(monthTotal)}
        </Text>
      </YStack>

      <YStack style={styles.statsRow}>
        <YStack style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.text + "99" }]}>
            Today
          </Text>
          <Text style={[styles.statAmount, { color: colors.text }]}>
            {formatAmount(todayTotal)}
          </Text>
        </YStack>

        <YStack
          style={[styles.divider, { backgroundColor: colors.text + "20" }]}
        />

        <YStack style={styles.statItem}>
          <Text style={[styles.statLabel, { color: colors.text + "99" }]}>
            This Week
          </Text>
          <Text style={[styles.statAmount, { color: colors.text }]}>
            {formatAmount(weekTotal)}
          </Text>
        </YStack>
      </YStack>
    </Card>
  );
}
