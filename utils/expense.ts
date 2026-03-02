import { Expense, GroupedExpenses } from "@/types/expense";

export const formatAmount = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

export const formatDate = (date: string) =>
  new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export function groupExpensesByDate(expenses: Expense[]): GroupedExpenses[] {
  const groups: Record<string, Expense[]> = {};

  for (const expense of expenses) {
    const dateKey = new Date(expense.date).toLocaleDateString();
    (groups[dateKey] ??= []).push(expense);
  }

  return Object.entries(groups)
    .map(([date, expenseList]) => ({
      date,
      total: expenseList.reduce((sum, e) => sum + Number(e.amount), 0),
      expenses: expenseList,
    }))
    .sort(
      (a, b) =>
        new Date(b.expenses[0]?.date ?? 0).getTime() -
        new Date(a.expenses[0]?.date ?? 0).getTime(),
    );
}

export function totalForPeriod(
  expenses: Expense[],
  period?: "today" | "week" | "month" | "all",
): number {
  const now = new Date();
  let filteredExpenses = expenses;

  if (period === "today") {
    const today = now.toDateString();
    filteredExpenses = expenses.filter(
      (e) => new Date(e.date).toDateString() === today,
    );
  } else if (period === "week") {
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    filteredExpenses = expenses.filter((e) => new Date(e.date) >= weekAgo);
  } else if (period === "month") {
    const monthAgo = new Date(now.getFullYear(), now.getMonth(), 1);
    filteredExpenses = expenses.filter((e) => new Date(e.date) >= monthAgo);
  }

  return filteredExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
}

export const formatDateString = (date: Date) => {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};