import { BudgetCard } from "@/components/budgets/BudgetCard";
import { BudgetForm } from "@/components/budgets/BudgetForm";
import {
  Budget,
  BudgetFormData,
  BudgetStatus,
  MonthlyBudgetSummary,
} from "@/types/budget";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Modal, ScrollView } from "react-native";
import { Button, Text, View, YStack } from "tamagui";
import { AddButton } from "../primitives/add-button";
import { Card } from "../primitives/themed-card";
import { budgetsViewStyles as styles } from "./styles";

interface BudgetsViewProps {
  currentMonthSummary: MonthlyBudgetSummary | null;
  currentMonthBudgets: Budget[];
  showCreateForm: boolean;
  editingBudget: Budget | null;
  isDark: boolean;
  colors: { background: string; text: string; tint: string };
  onCreateBudget: (data: BudgetFormData) => Promise<void>;
  onUpdateBudget: (data: BudgetFormData) => Promise<void>;
  onDeleteBudget: (budget: Budget) => void;
  onOpenCreate: () => void;
  onCloseCreate: () => void;
  onOpenEdit: (budget: Budget) => void;
  onCloseEdit: () => void;
}

export function BudgetsView({
  currentMonthSummary,
  currentMonthBudgets,
  showCreateForm,
  editingBudget,
  isDark,
  colors,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  onOpenCreate,
  onCloseCreate,
  onOpenEdit,
  onCloseEdit,
}: BudgetsViewProps) {
  const cardBg = isDark ? "#1C1C1E" : "white";
  const borderColor = isDark ? "#2C2C2E" : "#f0f0f0";
  const emptyIconColor = isDark ? "#3A3A3C" : "#ccc";
  const emptyTextColor = isDark ? "#8E8E93" : "#666";
  const emptySubColor = isDark ? "#636366" : "#999";

  return (
    <YStack style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {currentMonthSummary && (
          <Card
            noShadow
            style={styles.summaryCard}
            backgroundColor={cardBg}
            borderColor={borderColor}
          >
            <Text style={[styles.summaryTitle, { color: colors.text }]}>
              This Month
            </Text>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDark ? "#8E8E93" : "#666" },
                ]}
              >
                Budget
              </Text>
              <Text style={[styles.summaryValue, { color: colors.text }]}>
                ${currentMonthSummary.totalBudget.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: isDark ? "#8E8E93" : "#666" },
                ]}
              >
                Spent
              </Text>
              <Text
                style={[
                  styles.summaryValue,
                  { color: colors.text },
                  currentMonthSummary.percentageUsed > 100 && styles.overBudget,
                ]}
              >
                ${currentMonthSummary.totalSpent.toFixed(2)}
              </Text>
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
                    width: `${Math.min(currentMonthSummary.percentageUsed, 100)}%`,
                    backgroundColor:
                      currentMonthSummary.percentageUsed >= 100
                        ? "#FF6B6B"
                        : currentMonthSummary.percentageUsed >= 80
                          ? "#F39C12"
                          : colors.tint,
                  },
                ]}
              />
            </View>
            <Text
              style={[
                styles.percentageText,
                { color: isDark ? "#8E8E93" : "#666" },
              ]}
            >
              {currentMonthSummary.percentageUsed}% used
            </Text>
          </Card>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Category Budgets
          </Text>
          {currentMonthSummary?.categories.map(
            (budget: BudgetStatus, index: number) => {
              const fullBudget = currentMonthBudgets.find(
                (b) => b.category === budget.category,
              );
              return (
                <BudgetCard
                  key={fullBudget?.id ?? index}
                  budget={budget}
                  isDark={isDark}
                  onPress={
                    fullBudget ? () => onOpenEdit(fullBudget) : undefined
                  }
                  onDelete={
                    fullBudget ? () => onDeleteBudget(fullBudget) : undefined
                  }
                />
              );
            },
          )}
          {(!currentMonthSummary ||
            currentMonthSummary.categories.length === 0) && (
            <View style={styles.emptyState}>
              <Ionicons
                name="wallet-outline"
                size={64}
                color={emptyIconColor}
              />
              <Text style={[styles.emptyText, { color: emptyTextColor }]}>
                No budgets set
              </Text>
              <Text style={[styles.emptySubtext, { color: emptySubColor }]}>
                Create a budget to track your spending
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <AddButton onAddPress={onOpenCreate} colors={colors} />

      <Modal
        visible={showCreateForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Create Budget
            </Text>
            <Button unstyled onPress={onCloseCreate}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Button>
          </View>
          <BudgetForm onSubmit={onCreateBudget} onCancel={onCloseCreate} />
        </View>
      </Modal>

      <Modal
        visible={editingBudget != null}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View
            style={[styles.modalHeader, { borderBottomColor: borderColor }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit Budget
            </Text>
            <Button unstyled onPress={onCloseEdit}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Button>
          </View>
          {editingBudget && (
            <BudgetForm
              editMode
              initialData={{
                category: editingBudget.category,
                amount: String(editingBudget.amount),
                month: new Date(editingBudget.month),
              }}
              onSubmit={onUpdateBudget}
              onCancel={onCloseEdit}
            />
          )}
        </View>
      </Modal>
    </YStack>
  );
}
