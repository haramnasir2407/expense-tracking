import { AnalyticsData, DateRange } from "@/types/analytics";
import { Expense } from "@/types/expense";
import {
  aggregateByCategory,
  aggregateByDay,
  aggregateByMonth,
  calculateAveragePerDay,
  calculateAveragePerTransaction,
  calculateMonthOverMonthTrend,
  calculateTotalSpent,
  filterByDateRange,
  getEmptyAnalytics,
  getTopCategory,
} from "@/utils/analytics";

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
