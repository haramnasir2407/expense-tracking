// these functions are used indirectly by the sync layer

import {
  LocalExpense,
  SyncQueueItem,
  useExpensesStore,
} from "@/stores/expenses-store";
import { Expense, ExpenseFormData } from "@/types/expense";

export async function getExpenses(userId: string) {
  try {
    const data = useExpensesStore.getState().getExpenses(userId);
    return { data, error: null as { message: string } | null };
  } catch (error) {
    return {
      data: null as LocalExpense[] | null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch expenses",
      },
    };
  }
}

export async function getExpenseById(userId: string, id: string) {
  try {
    const data = useExpensesStore.getState().getExpenseById(userId, id);
    return { data: data ?? null, error: null as { message: string } | null };
  } catch (error) {
    return {
      data: null as LocalExpense | null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch expense",
      },
    };
  }
}

export async function addExpense(
  expense: ExpenseFormData,
  userId: string,
  id?: string,
) {
  try {
    const data = useExpensesStore.getState().addExpense(userId, expense, id);
    return { data, error: null as { message: string } | null };
  } catch (error) {
    return {
      data: null as LocalExpense | null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to add expense",
      },
    };
  }
}

export async function updateExpense(
  userId: string,
  id: string,
  updates: Partial<ExpenseFormData>,
) {
  try {
    const data = useExpensesStore.getState().updateExpense(userId, id, updates);
    if (!data) {
      return {
        data: null as LocalExpense | null,
        error: { message: "Not found" },
      };
    }
    return { data, error: null as { message: string } | null };
  } catch (error) {
    return {
      data: null as LocalExpense | null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to update expense",
      },
    };
  }
}

export async function deleteExpense(userId: string, id: string) {
  try {
    useExpensesStore.getState().deleteExpense(userId, id);
    return { error: null as { message: string } | null };
  } catch (error) {
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete expense",
      },
    };
  }
}

export async function upsertExpenseFromRemote(
  userId: string,
  expense: Expense,
) {
  try {
    const data = useExpensesStore
      .getState()
      .upsertExpenseFromRemote(userId, expense);
    return { data, error: null as { message: string } | null };
  } catch (error) {
    return {
      data: null as LocalExpense | null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to upsert expense",
      },
    };
  }
}

export function markExpenseAsSynced(userId: string, id: string) {
  useExpensesStore.getState().markExpenseAsSynced(userId, id);
}

export function markExpenseSyncFailed(
  userId: string,
  id: string,
  error: string,
) {
  useExpensesStore.getState().markExpenseSyncFailed(userId, id, error);
}

export function getUnsyncedExpenses(userId: string): LocalExpense[] {
  const expenses = useExpensesStore.getState().getExpenses(userId);
  return expenses.filter((e) => !e.synced);
}

export function getSyncQueue(userId: string): SyncQueueItem[] {
  return useExpensesStore.getState().getSyncQueue(userId);
}

export function removeFromSyncQueue(userId: string, queueId: string) {
  useExpensesStore.getState().removeFromSyncQueue(userId, queueId);
}

export function incrementSyncRetryCount(userId: string, queueId: string) {
  useExpensesStore.getState().incrementSyncRetryCount(userId, queueId);
}

export function clearSyncQueue(userId: string) {
  const queue = useExpensesStore.getState().getSyncQueue(userId);
  for (const item of queue) {
    useExpensesStore.getState().removeFromSyncQueue(userId, item.id);
  }
}

export function removeDuplicateSyncQueueEntries(userId: string) {
  return useExpensesStore.getState().removeDuplicateSyncQueueEntries(userId);
}
