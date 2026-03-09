import { Colors } from "@/constants/theme";
import { BudgetStatus } from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Button, Progress, Text, View } from "tamagui";
import { budgetCardStyles as styles } from "./styles";

interface BudgetCardProps {
  budget: BudgetStatus;
  onPress?: () => void;
  onDelete?: () => void;
  isDark?: boolean;
}

export function BudgetCard({
  budget,
  onPress,
  onDelete,
  isDark = false,
}: BudgetCardProps) {
  const themeColors = Colors[isDark ? "dark" : "light"];

  const getStatusColor = () => {
    if (budget.isOverBudget) return Colors.error;
    if (budget.percentageUsed >= 80) return Colors.warning;
    return Colors.success;
  };

  const showActions = onDelete != null;

  return (
    <Button
      unstyled
      style={[
        styles.container,
        { backgroundColor: themeColors.cardBackground },
      ]}
      onPress={onPress}
      disabled={!onPress && !showActions}
    >
      <View style={styles.header}>
        <Text style={[styles.category, { color: themeColors.text }]}>
          {budget.category}
        </Text>
        <View style={styles.headerRight}>
          <Text style={[styles.percentage, { color: getStatusColor() }]}>
            {budget.percentageUsed}%
          </Text>
          {showActions && (
            <View style={styles.actions}>
              {onDelete != null && (
                <Button
                  unstyled
                  onPress={(e) => {
                    e?.stopPropagation?.();
                    onDelete();
                  }}
                  style={styles.actionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.error}
                  />
                </Button>
              )}
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.progressBar,
          { backgroundColor: themeColors.cardBorder },
        ]}
      >
        <Progress key={budget.category} value={budget.percentageUsed}>
          <Progress.Indicator
            style={styles.progressFill}
            {...({ backgroundColor: getStatusColor() } as any)}
            transition={{ type: "quick" }}
          />
        </Progress>
      </View>

      <View style={styles.footer}>
        <Text style={[styles.amount, { color: themeColors.textSecondary }]}>
          ${budget.actualAmount.toFixed(2)} of ${budget.budgetAmount.toFixed(2)}
        </Text>
        <Text style={[styles.remaining, { color: getStatusColor() }]}>
          {budget.isOverBudget ? "Over" : "Remaining"}: $
          {Math.abs(budget.remaining).toFixed(2)}
        </Text>
      </View>
    </Button>
  );
}
