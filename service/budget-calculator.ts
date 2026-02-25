import { Budget, BudgetStatus, MonthlyBudgetSummary } from "@/types/budget";
import { Expense } from "@/types/expense";

export function calculateBudgetStatus(
  budgets: Budget[],
  expenses: Expense[],
  month: Date,
): MonthlyBudgetSummary {
  const monthStr = formatMonthKey(month);

  const monthExpenses = expenses.filter((e) => {
    const expenseMonth = formatMonthKey(new Date(e.date));
    return expenseMonth === monthStr;
  });

  const categoryStatuses: BudgetStatus[] = budgets.map((budget) => {
    const categoryExpenses = monthExpenses.filter(
      (e) => e.category === budget.category,
    );

    const actualAmount = categoryExpenses.reduce(
      (sum, e) => sum + Number(e.amount),
      0,
    );

    const percentageUsed =
      budget.amount > 0
        ? Math.min(Math.round((actualAmount / budget.amount) * 100), 99)
        : 0;

    return {
      category: budget.category,
      budgetAmount: budget.amount,
      actualAmount,
      percentageUsed,
      remaining: budget.amount - actualAmount,
      isOverBudget: actualAmount > budget.amount,
    };
  });

  const totalBudget = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = categoryStatuses.reduce(
    (sum, s) => sum + s.actualAmount,
    0,
  );
  const percentageUsed =
    totalBudget > 0
      ? Math.min(Math.round((totalSpent / totalBudget) * 100), 99)
      : 0;

  return {
    month: monthStr,
    totalBudget,
    totalSpent,
    percentageUsed,
    categories: categoryStatuses.sort(
      (a, b) => b.percentageUsed - a.percentageUsed,
    ),
  };
}

function formatMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
