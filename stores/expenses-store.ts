// this zustand store is used to manage the local expenses and sync queue
import { Expense, ExpenseFormData } from "@/types/expense";
import { generateUUID } from "@/utils/uuid";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SyncOperation = "create" | "update" | "delete";

export interface LocalExpense extends Expense {
  synced: boolean;
  sync_error?: string;
  last_sync_at?: string;
}

export interface SyncQueueItem {
  id: string;
  expense_id: string;
  operation: SyncOperation;
  created_at: string;
  retry_count: number;
}

interface ExpensesStoreState {
  hasHydrated: boolean;
  setHasHydrated: (hasHydrated: boolean) => void;

  expensesByUser: Record<string, LocalExpense[]>;
  syncQueueByUser: Record<string, SyncQueueItem[]>;

  getExpenses: (userId: string) => LocalExpense[];
  getExpenseById: (userId: string, id: string) => LocalExpense | undefined;

  addExpense: (
    userId: string,
    data: ExpenseFormData,
    id?: string,
  ) => LocalExpense;
  updateExpense: (
    userId: string,
    id: string,
    updates: Partial<ExpenseFormData>,
  ) => LocalExpense | undefined;
  deleteExpense: (userId: string, id: string) => void;

  upsertExpenseFromRemote: (userId: string, expense: Expense) => LocalExpense;

  markExpenseAsSynced: (userId: string, id: string) => void;
  markExpenseSyncFailed: (userId: string, id: string, error: string) => void;

  getSyncQueue: (userId: string) => SyncQueueItem[];
  removeFromSyncQueue: (userId: string, queueId: string) => void;
  incrementSyncRetryCount: (userId: string, queueId: string) => void;
  removeDuplicateSyncQueueEntries: (userId: string) => number;

  clearUserData: (userId: string) => void;
}

function sortExpenses(expenses: LocalExpense[]): LocalExpense[] {
  return [...expenses].sort((a, b) => {
    const byDate = new Date(b.date).getTime() - new Date(a.date).getTime();
    if (byDate !== 0) return byDate;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// enqueue a new item to the sync queue, and deduplicate if the same item already exists
function enqueueDeduped(
  queue: SyncQueueItem[],
  expenseId: string,
  operation: SyncOperation,
): SyncQueueItem[] {
  const exists = queue.some(
    (q) => q.expense_id === expenseId && q.operation === operation,
  );
  if (exists) return queue;
  const now = new Date().toISOString();
  const item: SyncQueueItem = {
    id: generateUUID(),
    expense_id: expenseId,
    operation,
    created_at: now,
    retry_count: 0,
  };
  return [...queue, item].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
}

export const useExpensesStore = create<ExpensesStoreState>()(
  persist(
    (set, get) => ({
      hasHydrated: false,
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      expensesByUser: {},
      syncQueueByUser: {},

      getExpenses: (userId) => get().expensesByUser[userId] ?? [],
      getExpenseById: (userId, id) =>
        (get().expensesByUser[userId] ?? []).find((e) => e.id === id),

      addExpense: (userId, data, id) => {
        const expenseId = id ?? generateUUID();
        const now = new Date().toISOString();

        const newExpense: LocalExpense = {
          id: expenseId,
          user_id: userId,
          amount: parseFloat(data.amount),
          category: data.category,
          date: data.date.toISOString(),
          notes: data.notes || undefined,
          receipt_url: data.receipt_url || undefined,
          created_at: now,
          updated_at: now,
          synced: false,
        };

        set((state) => {
          const currentExpenses = state.expensesByUser[userId] ?? [];
          const nextExpenses = sortExpenses([newExpense, ...currentExpenses]);
          const currentQueue = state.syncQueueByUser[userId] ?? [];
          const nextQueue = enqueueDeduped(currentQueue, expenseId, "create");

          return {
            expensesByUser: { ...state.expensesByUser, [userId]: nextExpenses },
            syncQueueByUser: { ...state.syncQueueByUser, [userId]: nextQueue },
          };
        });

        return newExpense;
      },

      updateExpense: (userId, id, updates) => {
        const current = get().expensesByUser[userId] ?? [];
        const existing = current.find((e) => e.id === id);
        if (!existing) return undefined;

        const updated: LocalExpense = {
          ...existing,
          amount:
            updates.amount !== undefined
              ? parseFloat(updates.amount)
              : existing.amount,
          category:
            updates.category !== undefined
              ? updates.category
              : existing.category,
          date:
            updates.date !== undefined
              ? updates.date.toISOString()
              : existing.date,
          notes:
            updates.notes !== undefined
              ? updates.notes || undefined
              : existing.notes,
          receipt_url:
            updates.receipt_url !== undefined
              ? updates.receipt_url || undefined
              : existing.receipt_url,
          updated_at: new Date().toISOString(),
          synced: false,
        };

        set((state) => {
          const nextExpenses = sortExpenses(
            (state.expensesByUser[userId] ?? []).map((e) =>
              e.id === id ? updated : e,
            ),
          );
          const currentQueue = state.syncQueueByUser[userId] ?? [];
          const nextQueue = enqueueDeduped(currentQueue, id, "update");

          return {
            expensesByUser: { ...state.expensesByUser, [userId]: nextExpenses },
            syncQueueByUser: { ...state.syncQueueByUser, [userId]: nextQueue },
          };
        });

        return updated;
      },

      deleteExpense: (userId, id) => {
        set((state) => {
          const nextExpenses = (state.expensesByUser[userId] ?? []).filter(
            (e) => e.id !== id,
          );
          const currentQueue = state.syncQueueByUser[userId] ?? [];
          const nextQueue = enqueueDeduped(currentQueue, id, "delete");

          return {
            expensesByUser: { ...state.expensesByUser, [userId]: nextExpenses },
            syncQueueByUser: { ...state.syncQueueByUser, [userId]: nextQueue },
          };
        });
      },

      // merges a remote expense into the local expenses, and updates the sync queue
      upsertExpenseFromRemote: (userId, expense) => {
        const localExpense: LocalExpense = {
          ...expense,
          synced: true,
          last_sync_at: new Date().toISOString(),
          sync_error: undefined,
        };

        set((state) => {
          const current = state.expensesByUser[userId] ?? [];
          const exists = current.some((e) => e.id === expense.id);
          const next = exists
            ? current.map((e) => (e.id === expense.id ? localExpense : e))
            : [localExpense, ...current];

          return {
            expensesByUser: {
              ...state.expensesByUser,
              [userId]: sortExpenses(next),
            },
          };
        });

        return localExpense;
      },

      markExpenseAsSynced: (userId, id) => {
        set((state) => {
          const current = state.expensesByUser[userId] ?? [];
          const next = current.map((e) =>
            e.id === id
              ? {
                  ...e,
                  synced: true,
                  last_sync_at: new Date().toISOString(),
                  sync_error: undefined,
                }
              : e,
          );
          return {
            expensesByUser: { ...state.expensesByUser, [userId]: next },
          };
        });
      },

      markExpenseSyncFailed: (userId, id, error) => {
        set((state) => {
          const current = state.expensesByUser[userId] ?? [];
          const next = current.map((e) =>
            e.id === id ? { ...e, sync_error: error } : e,
          );
          return {
            expensesByUser: { ...state.expensesByUser, [userId]: next },
          };
        });
      },

      getSyncQueue: (userId) => get().syncQueueByUser[userId] ?? [],

      removeFromSyncQueue: (userId, queueId) => {
        set((state) => {
          const currentQueue = state.syncQueueByUser[userId] ?? [];
          const nextQueue = currentQueue.filter((q) => q.id !== queueId);
          return {
            syncQueueByUser: { ...state.syncQueueByUser, [userId]: nextQueue },
          };
        });
      },

      incrementSyncRetryCount: (userId, queueId) => {
        set((state) => {
          const currentQueue = state.syncQueueByUser[userId] ?? [];
          const nextQueue = currentQueue.map((q) =>
            q.id === queueId ? { ...q, retry_count: q.retry_count + 1 } : q,
          );
          return {
            syncQueueByUser: { ...state.syncQueueByUser, [userId]: nextQueue },
          };
        });
      },

      removeDuplicateSyncQueueEntries: (userId) => {
        const currentQueue = get().syncQueueByUser[userId] ?? [];
        if (currentQueue.length <= 1) return 0;

        const ordered = [...currentQueue].sort(
          (a, b) =>
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
        );

        const seen = new Set<string>();
        const deduped: SyncQueueItem[] = [];
        for (const item of ordered) {
          const key = `${item.expense_id}:${item.operation}`;
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(item);
        }

        const removed = ordered.length - deduped.length;
        if (removed > 0) {
          set((state) => ({
            syncQueueByUser: { ...state.syncQueueByUser, [userId]: deduped },
          }));
        }

        return removed;
      },

      clearUserData: (userId) => {
        set((state) => {
          const { [userId]: _e, ...restExpenses } = state.expensesByUser;
          const { [userId]: _q, ...restQueue } = state.syncQueueByUser;
          return { expensesByUser: restExpenses, syncQueueByUser: restQueue };
        });
      },
    }),
    {
      name: "expenses-store",
      // storage is the backend for the store, and is used to persist the state to the device storage
      // keeps expensesByUser and syncQueueByUser across app restarts
      storage: createJSONStorage(() => AsyncStorage),
      // partialize is used to only persist the expensesByUser and syncQueueByUser states
      // this is more efficient than persisting the entire state, and is used to reduce the size of the persisted data
      partialize: (state) => ({
        expensesByUser: state.expensesByUser,
        syncQueueByUser: state.syncQueueByUser,
      }),
      // onRehydrateStorage is used to set the hasHydrated state to true when the store is rehydrated from the device storage
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error("Failed to rehydrate expenses store:", error);
        }
        state?.setHasHydrated(true);
      },
    },
  ),
);

// wait until the persisted expenses store has finished hydrating from AsyncStorage
export function waitForExpensesStoreHydration(): Promise<void> {
  if (useExpensesStore.getState().hasHydrated) return Promise.resolve();

  return new Promise((resolve) => {
    const unsubscribe = useExpensesStore.subscribe((state) => {
      if (state.hasHydrated) {
        unsubscribe();
        resolve();
      }
    });
  });
}
