import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BudgetStatus } from "@/types/budget";

interface BudgetCardProps {
  budget: BudgetStatus;
  onPress?: () => void;
  onDelete?: () => void;
  isDark?: boolean;
}

export function BudgetCard({ budget, onPress, onDelete, isDark = false }: BudgetCardProps) {
  const getStatusColor = () => {
    if (budget.isOverBudget) return "#FF6B6B";
    if (budget.percentageUsed >= 80) return "#F39C12";
    return "#4ECDC4";
  };

  const showActions = onDelete != null;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: isDark ? '#1C1C1E' : 'white' }]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress && !showActions}
    >
      <View style={styles.header}>
        <Text style={[styles.category, { color: isDark ? '#ECEDEE' : '#333' }]}>{budget.category}</Text>
        <View style={styles.headerRight}>
          <Text style={[styles.percentage, { color: getStatusColor() }]}>
            {budget.percentageUsed}%
          </Text>
          {showActions && (
            <View style={styles.actions}>
              {onDelete != null && (
                <TouchableOpacity
                  onPress={(e) => { e?.stopPropagation?.(); onDelete(); }}
                  style={styles.actionBtn}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>

      <View style={[styles.progressBar, { backgroundColor: isDark ? '#2C2C2E' : '#f0f0f0' }]}>
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
        <Text style={[styles.amount, { color: isDark ? '#8E8E93' : '#666' }]}>
          ${budget.actualAmount.toFixed(2)} of ${budget.budgetAmount.toFixed(2)}
        </Text>
        <Text style={[styles.remaining, { color: getStatusColor() }]}>
          {budget.isOverBudget ? "Over" : "Remaining"}: $
          {Math.abs(budget.remaining).toFixed(2)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  actionBtn: {
    padding: 4,
  },
  category: {
    fontSize: 16,
    fontWeight: "600",
  },
  percentage: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amount: {
    fontSize: 14,
  },
  remaining: {
    fontSize: 14,
    fontWeight: "600",
  },
});
