import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { DUMMY_EXPENSES } from "@/constants/analytics";
import { DUMMY_MONTHLY_BUDGETS } from "@/constants/dummyBudgets";
import { Colors } from "@/constants/theme";
import { useBudgets } from "@/contexts/BudgetContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { calculateAnalytics } from "@/service/analytics";
import { DailySpending, DateRange } from "@/types/analytics";
import { Budget } from "@/types/budget";
import { Expense } from "@/types/expense";
import React, { useMemo, useState } from "react";

function getShiftedDummyExpenses(): Expense[] {
  if (DUMMY_EXPENSES.length === 0) return [];

  const latestOriginal = DUMMY_EXPENSES.reduce((latest, expense) => {
    const date = new Date(expense.date);
    return date > latest ? date : latest;
  }, new Date(DUMMY_EXPENSES[0].date));

  const now = new Date();
  const offsetMs = now.getTime() - latestOriginal.getTime();

  return DUMMY_EXPENSES.map((expense) => {
    const originalDate = new Date(expense.date);
    const shiftedDate = new Date(originalDate.getTime() + offsetMs);
    const iso = shiftedDate.toISOString();

    return {
      ...expense,
      date: iso,
      created_at: iso,
      updated_at: iso,
    };
  });
}

function getCategoryBudgetForMonth(
  category: string,
  monthKey: string,
  budgets: Budget[],
): number {
  const monthStart = `${monthKey}-01`;
  const real = budgets.find(
    (b) => b.category === category && b.month === monthStart,
  );
  if (real) return real.amount;
  return DUMMY_MONTHLY_BUDGETS[category] ?? 0;
}

export default function AnalyticsScreen() {
  const { expenses } = useExpenses();
  const { budgets } = useBudgets();
  const [selectedRange, setSelectedRange] = useState<DateRange>("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const analytics = useMemo(() => {
    // const baseExpenses =
    //   expenses.length > 0 ? expenses : getShiftedDummyExpenses();

    const baseExpenses = getShiftedDummyExpenses();

    const filteredByCategory =
      selectedCategory === "all"
        ? baseExpenses
        : baseExpenses.filter((e) => e.category === selectedCategory);

    return calculateAnalytics(filteredByCategory, selectedRange);
  }, [expenses, selectedCategory, selectedRange]);

  const dailyBudgetSeries = useMemo((): DailySpending[] | null => {
    if (analytics.dailyTotals.length === 0) return null;
    return analytics.dailyTotals.map(({ date }) => {
      const d = new Date(date);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthKey = `${y}-${String(m + 1).padStart(2, "0")}`;
      const daysInMonth = new Date(y, m + 1, 0).getDate();

      let monthlyBudget: number;
      if (selectedCategory === "all") {
        // Sum budgets across all categories for the "all" view
        const allCategories = Object.keys(DUMMY_MONTHLY_BUDGETS);
        monthlyBudget = allCategories.reduce(
          (sum, cat) => sum + getCategoryBudgetForMonth(cat, monthKey, budgets),
          0,
        );
      } else {
        monthlyBudget = getCategoryBudgetForMonth(
          selectedCategory,
          monthKey,
          budgets,
        );
      }

      const dailyBudget = daysInMonth > 0 ? monthlyBudget / daysInMonth : 0;
      return { date, amount: dailyBudget };
    });
  }, [selectedCategory, analytics.dailyTotals, budgets]);

  return (
    <AnalyticsView
      analytics={analytics}
      selectedRange={selectedRange}
      onSelectRange={setSelectedRange}
      selectedCategory={selectedCategory}
      onSelectCategory={setSelectedCategory}
      dailyBudgetSeries={dailyBudgetSeries}
      isDark={colorScheme === "dark"}
      colors={colors}
    />
  );
}
