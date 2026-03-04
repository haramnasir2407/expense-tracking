import { useAuth } from "@/contexts/AuthContext";
import { useSync } from "@/contexts/SyncContext";
import { calculateAnalytics } from "@/service/analytics";
import { useExpensesStore } from "@/stores/expenses-store";
import { DateRange } from "@/types/analytics";
import { Expense, ExpenseFormData } from "@/types/expense";
import { groupExpensesByDate, totalForPeriod } from "@/utils/expense";
import { useCallback, useMemo } from "react";

export function useExpenses() {
  const { user } = useAuth();
  const userId = user?.id;
  const { isOnline, sync } = useSync();

  const hasHydrated = useExpensesStore((s) => s.hasHydrated);

  // Selector must return a stable reference when the store state hasn't changed.
  // We return undefined when there's no user and map to [] later to avoid
  // creating a new array on every render (which breaks useSyncExternalStore expectations).
  const rawExpenses = useExpensesStore((s) =>
    userId ? s.expensesByUser[userId] : undefined,
  );
  const addLocalExpense = useExpensesStore((s) => s.addExpense);
  const updateLocalExpense = useExpensesStore((s) => s.updateExpense);
  const deleteLocalExpense = useExpensesStore((s) => s.deleteExpense);

  const expenses: Expense[] = useMemo(() => {
    if (!userId) return [];
    const localExpenses = rawExpenses ?? [];
    return localExpenses.map(
      ({ synced: _synced, sync_error: _e, last_sync_at: _t, ...rest }) => rest,
    );
  }, [rawExpenses, userId]);

  const groupedExpenses = useMemo(
    () => groupExpensesByDate(expenses),
    [expenses],
  );

  const getTotalAmount = useCallback(
    (period?: "today" | "week" | "month" | "all") =>
      totalForPeriod(expenses, period),
    [expenses],
  );

  const getAnalytics = useCallback(
    (dateRange?: DateRange) => {
      return calculateAnalytics(expenses, dateRange);
    },
    [expenses],
  );

  const refresh = useCallback(async () => {
    if (!userId) return;
    if (isOnline) {
      await sync();
    }
  }, [isOnline, sync, userId]);

  const addExpense = useCallback(
    async (data: ExpenseFormData) => {
      try {
        if (!userId) throw new Error("Not authenticated");
        addLocalExpense(userId, data);
        if (isOnline && userId) {
          // Fire-and-forget sync to push changes to Supabase immediately
          sync();
        }
        return { error: null as string | null };
      } catch (err) {
        return {
          error: err instanceof Error ? err.message : "Failed to add expense",
        };
      }
    },
    [addLocalExpense, isOnline, sync, userId],
  );

  const updateExpense = useCallback(
    async (id: string, updates: Partial<ExpenseFormData>) => {
      try {
        if (!userId) throw new Error("Not authenticated");
        const updated = updateLocalExpense(userId, id, updates);
        if (!updated) throw new Error("Expense not found");
        if (isOnline && userId) {
          sync();
        }
        return { error: null as string | null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to update expense",
        };
      }
    },
    [isOnline, sync, updateLocalExpense, userId],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      try {
        if (!userId) throw new Error("Not authenticated");
        deleteLocalExpense(userId, id);
        if (isOnline && userId) {
          sync();
        }
        return { error: null as string | null };
      } catch (err) {
        return {
          error:
            err instanceof Error ? err.message : "Failed to delete expense",
        };
      }
    },
    [deleteLocalExpense, isOnline, sync, userId],
  );

  return {
    expenses,
    groupedExpenses,
    loading: Boolean(userId) && !hasHydrated,
    error: null as string | null,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh,
    getTotalAmount,
    getAnalytics,
  };
}
