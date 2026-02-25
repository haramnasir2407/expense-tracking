import { useAuth } from "@/contexts/AuthContext";
import { initDatabase } from "@/lib/db";
import * as expenseService from "@/lib/expenses-sqlite";
import { Expense, ExpenseFormData, GroupedExpenses } from "@/types/expense";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";

const expensesQueryKey = (userId: string | undefined) =>
  ["expenses", userId ?? ""] as const;

function groupExpensesByDate(expenses: Expense[]): GroupedExpenses[] {
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

function totalForPeriod(
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

export function useExpenses() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const queryKey = expensesQueryKey(userId);

  const expensesQuery = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      if (!userId) return [];
      initDatabase();
      const { data, error } = await expenseService.getExpenses(userId);
      if (error) throw new Error(error.message);
      return (data ?? []) as Expense[];
    },
  });

  const expenses = useMemo(
    () => (userId ? expensesQuery.data ?? [] : []),
    [userId, expensesQuery.data],
  );

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(expenses),
    [expenses],
  );

  const getTotalAmount = useCallback(
    (period?: "today" | "week" | "month" | "all") =>
      totalForPeriod(expenses, period),
    [expenses],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    await queryClient.invalidateQueries({ queryKey });
    await queryClient.refetchQueries({ queryKey });
  }, [queryClient, queryKey, userId]);

  const addMutation = useMutation({
    mutationFn: async (expenseData: ExpenseFormData) => {
      if (!userId) throw new Error("Not authenticated");
      initDatabase();
      const { data, error } = await expenseService.addExpense(
        expenseData,
        userId,
      );
      if (error) throw new Error(error.message);
      if (!data) throw new Error("Failed to add expense");
      return data as Expense;
    },
    onMutate: async (expenseData) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Expense[]>(queryKey) ?? [];

      const tempId = `temp-${Date.now()}`;
      const now = new Date().toISOString();
      const optimisticExpense: Expense = {
        id: tempId,
        user_id: userId,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: expenseData.date.toISOString(),
        notes: expenseData.notes || undefined,
        receipt_url: expenseData.receipt_url || undefined,
        created_at: now,
        updated_at: now,
      };

      queryClient.setQueryData<Expense[]>(queryKey, [
        optimisticExpense,
        ...previous,
      ]);

      return { previous, tempId };
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (createdExpense, _variables, context) => {
      if (!context) return;
      const current = queryClient.getQueryData<Expense[]>(queryKey) ?? [];
      queryClient.setQueryData<Expense[]>(
        queryKey,
        current.map((e) => (e.id === context.tempId ? createdExpense : e)),
      );
    },
    onSettled: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<ExpenseFormData>;
    }) => {
      initDatabase();
      const { data, error } = await expenseService.updateExpense(id, updates);
      if (error) throw new Error(error.message);
      if (!data) throw new Error("Failed to update expense");
      return data as Expense;
    },
    onMutate: async ({ id, updates }) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Expense[]>(queryKey) ?? [];
      const backup = previous.find((e) => e.id === id);

      if (backup) {
        const optimisticUpdate: Expense = {
          ...backup,
          amount: updates.amount ? parseFloat(updates.amount) : backup.amount,
          category: updates.category ?? backup.category,
          date: updates.date ? updates.date.toISOString() : backup.date,
          notes: updates.notes !== undefined ? updates.notes : backup.notes,
          receipt_url:
            updates.receipt_url !== undefined
              ? updates.receipt_url
              : backup.receipt_url,
          updated_at: new Date().toISOString(),
        };

        queryClient.setQueryData<Expense[]>(
          queryKey,
          previous.map((e) => (e.id === id ? optimisticUpdate : e)),
        );
      }

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKey, context.previous);
    },
    onSuccess: (updatedExpense) => {
      const current = queryClient.getQueryData<Expense[]>(queryKey) ?? [];
      queryClient.setQueryData<Expense[]>(
        queryKey,
        current.map((e) => (e.id === updatedExpense.id ? updatedExpense : e)),
      );
    },
    onSettled: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      initDatabase();
      const { error } = await expenseService.deleteExpense(id);
      if (error) throw new Error(error.message);
      return id;
    },
    onMutate: async (id) => {
      if (!userId) return;
      await queryClient.cancelQueries({ queryKey });

      const previous = queryClient.getQueryData<Expense[]>(queryKey) ?? [];
      queryClient.setQueryData<Expense[]>(
        queryKey,
        previous.filter((e) => e.id !== id),
      );

      return { previous };
    },
    onError: (_err, _variables, context) => {
      if (!context) return;
      queryClient.setQueryData(queryKey, context.previous);
    },
    onSettled: async () => {
      if (!userId) return;
      await queryClient.invalidateQueries({ queryKey });
    },
  });

  const addExpense = useCallback(
    async (data: ExpenseFormData) => {
      try {
        await addMutation.mutateAsync(data);
        return { error: null as string | null };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Failed to add expense",
        };
      }
    },
    [addMutation],
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<ExpenseFormData>) => {
      try {
        await updateMutation.mutateAsync({ id, updates });
        return { error: null as string | null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to update expense",
        };
      }
    },
    [updateMutation],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        await deleteMutation.mutateAsync(id);
        return { error: null as string | null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to delete expense",
        };
      }
    },
    [deleteMutation],
  );

  return {
    expenses,
    groupedExpenses,
    loading: expensesQuery.isLoading || expensesQuery.isFetching,
    error: expensesQuery.error ? (expensesQuery.error as Error).message : null,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh,
    getTotalAmount,
  };
}
