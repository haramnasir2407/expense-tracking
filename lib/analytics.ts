import { CATEGORY_COLORS } from "@/constants/categories";
import {
  AnalyticsData,
  CategorySpending,
  DailySpending,
  DateRange,
  MonthlySpending,
  SpendingTrend,
} from "@/types/analytics";
import { Expense } from "@/types/expense";

export function calculateAnalytics(
  expenses: Expense[],
  dateRange?: DateRange,
): AnalyticsData {
  const filteredExpenses = filterByDateRange(expenses, dateRange);

  if (filteredExpenses.length === 0) {
    return getEmptyAnalytics();
  }

  return {
    totalSpent: calculateTotalSpent(filteredExpenses),
    averagePerDay: calculateAveragePerDay(filteredExpenses, dateRange),
    averagePerTransaction: calculateAveragePerTransaction(filteredExpenses),
    transactionCount: filteredExpenses.length,
    byCategory: aggregateByCategory(filteredExpenses),
    dailyTotals: aggregateByDay(filteredExpenses),
    monthlyTotals: aggregateByMonth(filteredExpenses),
    monthOverMonthTrend: calculateMonthOverMonthTrend(expenses),
    topCategory: getTopCategory(filteredExpenses),
  };
}

function filterByDateRange(expenses: Expense[], range?: DateRange): Expense[] {
  if (!range || range === "all") return expenses;

  const now = new Date();
  const cutoffDate = new Date();

  switch (range) {
    case "week":
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case "month":
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case "3months":
      cutoffDate.setMonth(now.getMonth() - 3);
      break;
    case "6months":
      cutoffDate.setMonth(now.getMonth() - 6);
      break;
    case "year":
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return expenses.filter((e) => new Date(e.date) >= cutoffDate);
}

function calculateTotalSpent(expenses: Expense[]): number {
  return expenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

function calculateAveragePerDay(
  expenses: Expense[],
  range?: DateRange,
): number {
  if (expenses.length === 0) return 0;

  const total = calculateTotalSpent(expenses);
  const days = getDaysInRange(range);

  return total / days;
}

function calculateAveragePerTransaction(expenses: Expense[]): number {
  if (expenses.length === 0) return 0;
  return calculateTotalSpent(expenses) / expenses.length;
}

function aggregateByCategory(expenses: Expense[]): CategorySpending[] {
  const categoryMap = new Map<string, { amount: number; count: number }>();
  const total = calculateTotalSpent(expenses);

  expenses.forEach((expense) => {
    const current = categoryMap.get(expense.category) || {
      amount: 0,
      count: 0,
    };
    categoryMap.set(expense.category, {
      amount: current.amount + Number(expense.amount),
      count: current.count + 1,
    });
  });

  return Array.from(categoryMap.entries())
    .map(([category, { amount, count }]) => ({
      category,
      amount,
      percentage: total > 0 ? (amount / total) * 100 : 0,
      color: CATEGORY_COLORS[category] || "#999999",
      transactionCount: count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function aggregateByDay(expenses: Expense[]): DailySpending[] {
  const dayMap = new Map<string, number>();

  expenses.forEach((expense) => {
    const date = new Date(expense.date).toISOString().split("T")[0];
    const current = dayMap.get(date) || 0;
    dayMap.set(date, current + Number(expense.amount));
  });

  return Array.from(dayMap.entries())
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function aggregateByMonth(expenses: Expense[]): MonthlySpending[] {
  const monthMap = new Map<string, { amount: number; count: number }>();

  expenses.forEach((expense) => {
    const date = new Date(expense.date);
    const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const current = monthMap.get(month) || { amount: 0, count: 0 };
    monthMap.set(month, {
      amount: current.amount + Number(expense.amount),
      count: current.count + 1,
    });
  });

  return Array.from(monthMap.entries())
    .map(([month, { amount, count }]) => ({
      month,
      amount,
      transactionCount: count,
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

function calculateMonthOverMonthTrend(expenses: Expense[]): SpendingTrend {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const currentExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });

  const previousExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
  });

  const current = calculateTotalSpent(currentExpenses);
  const previous = calculateTotalSpent(previousExpenses);
  const change = previous > 0 ? ((current - previous) / previous) * 100 : 0;

  return {
    current,
    previous,
    change,
    trend: change > 5 ? "up" : change < -5 ? "down" : "stable",
  };
}

function getTopCategory(expenses: Expense[]): CategorySpending | null {
  const byCategory = aggregateByCategory(expenses);
  return byCategory.length > 0 ? byCategory[0] : null;
}

function getDaysInRange(range?: DateRange): number {
  switch (range) {
    case "week":
      return 7;
    case "month":
      return 30;
    case "3months":
      return 90;
    case "6months":
      return 180;
    case "year":
      return 365;
    default:
      return 30;
  }
}

function getEmptyAnalytics(): AnalyticsData {
  return {
    totalSpent: 0,
    averagePerDay: 0,
    averagePerTransaction: 0,
    transactionCount: 0,
    byCategory: [],
    dailyTotals: [],
    monthlyTotals: [],
    monthOverMonthTrend: {
      current: 0,
      previous: 0,
      change: 0,
      trend: "stable",
    },
    topCategory: null,
  };
}
