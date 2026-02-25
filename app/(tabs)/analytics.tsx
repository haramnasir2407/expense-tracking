import { AnalyticsView } from "@/components/analytics/AnalyticsView";
import { DUMMY_EXPENSES } from "@/constants/analytics";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useExpenses } from "@/hooks/useExpenses";
import { calculateAnalytics } from "@/service/analytics";
import { DateRange } from "@/types/analytics";
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

export default function AnalyticsScreen() {
  const { expenses } = useExpenses();
  const [selectedRange, setSelectedRange] = useState<DateRange>("month");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const analytics = useMemo(() => {
    const baseExpenses =
      expenses.length > 0 ? expenses : getShiftedDummyExpenses();

    const filteredByCategory =
      selectedCategory === "all"
        ? baseExpenses
        : baseExpenses.filter((e) => e.category === selectedCategory);

    return calculateAnalytics(filteredByCategory, selectedRange);
  }, [expenses, selectedCategory, selectedRange]);

  const categories = useMemo(() => {
    const baseExpenses =
      expenses.length > 0 ? expenses : getShiftedDummyExpenses();
    const unique = Array.from(new Set(baseExpenses.map((e) => e.category)));
    return ["all", ...unique];
  }, [expenses]);

  return (
    <AnalyticsView
      analytics={analytics}
      selectedRange={selectedRange}
      onSelectRange={setSelectedRange}
      selectedCategory={selectedCategory}
      categories={categories}
      onSelectCategory={setSelectedCategory}
      isDark={colorScheme === "dark"}
      colors={colors}
    />
  );
}
