import { BudgetStatus } from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Button, Text, View } from "tamagui";
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
  const getStatusColor = () => {
    if (budget.isOverBudget) return "#FF6B6B";
    if (budget.percentageUsed >= 80) return "#F39C12";
    return "#4ECDC4";
  };

  const showActions = onDelete != null;

  return (
    <Button
      unstyled
      style={[
        styles.container,
        { backgroundColor: isDark ? "#1C1C1E" : "white" },
      ]}
      onPress={onPress}
      disabled={!onPress && !showActions}
    >
      <View style={styles.header}>
        <Text style={[styles.category, { color: isDark ? "#ECEDEE" : "#333" }]}>
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
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </Button>
              )}
            </View>
          )}
        </View>
      </View>

      <View
        style={[
          styles.progressBar,
          { backgroundColor: isDark ? "#2C2C2E" : "#f0f0f0" },
        ]}
      >
        <View
          style={[
            styles.progressFill,
            {
              width: `${Math.min(budget.percentageUsed, 100)}%`,
              backgroundColor: getStatusColor(),
            },
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={[styles.amount, { color: isDark ? "#8E8E93" : "#666" }]}>
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
