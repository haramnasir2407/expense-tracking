import { Expense } from "@/types/expense";
import NetInfo from "@react-native-community/netinfo";
import * as sqliteExpenses from "./expenses-sqlite";
import * as supabaseExpenses from "./expenses-supabase";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

export interface SyncResult {
  success: boolean;
  pushed: number;
  pulled: number;
  errors: string[];
}

/**
 * Check if device is online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return state.isConnected === true && state.isInternetReachable === true;
}

/**
 * Sync local changes to Supabase (push)
 */
async function pushToRemote(
  userId: string,
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let successCount = 0;

  try {
    // Clean up any duplicate sync queue entries first
    sqliteExpenses.removeDuplicateSyncQueueEntries();

    // Get sync queue
    const queue = sqliteExpenses.getSyncQueue();

    console.log(`Pushing ${queue.length} operations to remote...`);

    for (const item of queue) {
      const MAX_RETRIES = 3;

      // Skip if too many retries
      if (item.retry_count >= MAX_RETRIES) {
        console.warn(`Skipping queue item ${item.id} - too many retries`);
        continue;
      }

      try {
        switch (item.operation) {
          case "create":
          case "update": {
            // Get current expense data from local DB
            const { data: localExpense } = await sqliteExpenses.getExpenseById(
              item.expense_id,
            );

            if (!localExpense) {
              console.warn(
                `Expense ${item.expense_id} not found locally, removing from queue`,
              );
              sqliteExpenses.removeFromSyncQueue(item.id);
              continue;
            }

            // Prepare expense data for sync
            const expenseData = {
              amount: localExpense.amount.toString(),
              category: localExpense.category,
              date: new Date(localExpense.date),
              notes: localExpense.notes || "",
              receipt_url: localExpense.receipt_url,
            };

            // Try to sync to Supabase - use upsert strategy
            console.log(
              `☁️ [Sync] Syncing ${item.operation} to Supabase for expense:`,
              item.expense_id,
            );

            if (item.operation === "create") {
              // For create, insert with the same ID from SQLite
              const { error } = await supabaseExpenses.addExpense(
                expenseData,
                userId,
                item.expense_id,
              );

              if (error) {
                // Check if it's a duplicate key error (already exists)
                const isDuplicate =
                  error.code === "23505" ||
                  error.message?.includes("duplicate key") ||
                  error.message?.includes("unique constraint");

                if (isDuplicate) {
                  // Already exists in Supabase, just mark as synced
                  console.log(
                    "⚠️ [Sync] Record already exists in Supabase, marking as synced",
                  );
                } else {
                  // Real error, throw it
                  console.error("❌ [Sync] Create failed:", error);
                  throw error;
                }
              } else {
                console.log("✅ [Sync] Created in Supabase successfully");
              }
            } else {
              // For update, try update first, if fails (doesn't exist), create it
              const { error: updateError } =
                await supabaseExpenses.updateExpense(
                  item.expense_id,
                  expenseData,
                );

              if (updateError) {
                // If update failed because record doesn't exist, try to create it with the same ID
                console.log(
                  "⚠️ [Sync] Update failed, attempting to create instead...",
                );
                const { error: createError } =
                  await supabaseExpenses.addExpense(
                    expenseData,
                    userId,
                    item.expense_id,
                  );

                if (createError) {
                  console.error(
                    "❌ [Sync] Both update and create failed:",
                    createError,
                  );
                  throw createError;
                }
                console.log(
                  "✅ [Sync] Created in Supabase (after update failed)",
                );
              } else {
                console.log("✅ [Sync] Updated in Supabase successfully");
              }
            }

            // Mark as synced
            sqliteExpenses.markExpenseAsSynced(item.expense_id);
            sqliteExpenses.removeFromSyncQueue(item.id);
            console.log("✓ [Sync] Marked as synced in local database");
            successCount++;
            break;
          }

          case "delete": {
            console.log(
              `☁️ [Sync] Syncing delete to Supabase for expense:`,
              item.expense_id,
            );

            const { error } = await supabaseExpenses.deleteExpense(
              item.expense_id,
            );

            // Ignore errors for:
            // 1. Record not found (already deleted)
            // 2. Invalid UUID (old SQLite IDs that never made it to Supabase)
            if (error) {
              const errorMsg = error.message || "";
              const isNotFound =
                errorMsg.includes("not found") || errorMsg.includes("No rows");
              const isInvalidUUID = errorMsg.includes(
                "invalid input syntax for type uuid",
              );

              if (!isNotFound && !isInvalidUUID) {
                // Real error, throw it
                throw error;
              }

              // Ignore not found or invalid UUID - just remove from queue
              console.log(
                `⚠️ [Sync] Delete skipped (${isInvalidUUID ? "invalid UUID" : "not found"})`,
              );
            } else {
              console.log("✅ [Sync] Deleted from Supabase successfully");
            }

            sqliteExpenses.removeFromSyncQueue(item.id);
            successCount++;
            break;
          }
        }
      } catch (error) {
        let errorMsg = "Unknown error";

        if (error instanceof Error) {
          errorMsg = error.message;
        } else if (typeof error === "object" && error !== null) {
          // Try to extract message from error object
          errorMsg = JSON.stringify(error);
        } else if (typeof error === "string") {
          errorMsg = error;
        }

        console.error(
          `❌ [Sync] Error syncing ${item.operation} for expense ${item.expense_id}:`,
          errorMsg,
        );
        console.error("Full error object:", error);

        errors.push(`${item.operation} ${item.expense_id}: ${errorMsg}`);

        // Increment retry count
        sqliteExpenses.incrementSyncRetryCount(item.id);
        sqliteExpenses.markExpenseSyncFailed(item.expense_id, errorMsg);
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error pushing to remote:", errorMsg);
    errors.push(`Push failed: ${errorMsg}`);
  }

  return { count: successCount, errors };
}

/**
 * Pull remote changes from Supabase and update local DB
 */
async function pullFromRemote(
  userId: string,
): Promise<{ count: number; errors: string[] }> {
  const errors: string[] = [];
  let successCount = 0;

  try {
    console.log("Pulling expenses from remote...");

    // Get all expenses from Supabase
    const { data: remoteExpenses, error } =
      await supabaseExpenses.getExpenses(userId);

    if (error) {
      throw error;
    }

    if (!remoteExpenses || remoteExpenses.length === 0) {
      console.log("No remote expenses to pull");
      return { count: 0, errors: [] };
    }

    console.log(`Pulled ${remoteExpenses.length} expenses from remote`);

    // Upsert each remote expense into local DB
    for (const remoteExpense of remoteExpenses) {
      try {
        await sqliteExpenses.upsertExpenseFromRemote(remoteExpense as Expense);
        successCount++;
      } catch (error) {
        const errorMsg =
          error instanceof Error ? error.message : "Unknown error";
        console.error(`Error upserting expense ${remoteExpense.id}:`, errorMsg);
        errors.push(`Upsert ${remoteExpense.id}: ${errorMsg}`);
      }
    }

    // TODO: Handle deletions - detect expenses that exist locally but not remotely
    // This requires storing deletion timestamps or using a tombstone approach
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Unknown error";
    console.error("Error pulling from remote:", errorMsg);
    errors.push(`Pull failed: ${errorMsg}`);
  }

  return { count: successCount, errors };
}

/**
 * Perform bidirectional sync
 * 1. Push local changes to remote
 * 2. Pull remote changes to local
 */
export async function syncExpenses(userId: string): Promise<SyncResult> {
  console.log("Starting sync...");

  // Check if online
  const online = await isOnline();
  if (!online) {
    console.log("Device is offline, skipping sync");
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      errors: ["Device is offline"],
    };
  }

  const allErrors: string[] = [];

  // Step 1: Push local changes to remote
  const pushResult = await pushToRemote(userId);
  allErrors.push(...pushResult.errors);

  // Step 2: Pull remote changes to local
  const pullResult = await pullFromRemote(userId);
  allErrors.push(...pullResult.errors);

  const result: SyncResult = {
    success: allErrors.length === 0,
    pushed: pushResult.count,
    pulled: pullResult.count,
    errors: allErrors,
  };

  console.log("Sync completed:", result);
  return result;
}

/**
 * Force pull from remote (useful for initial sync or refresh)
 */
export async function forcePullFromRemote(userId: string): Promise<SyncResult> {
  console.log("Force pulling from remote...");

  const online = await isOnline();
  if (!online) {
    return {
      success: false,
      pushed: 0,
      pulled: 0,
      errors: ["Device is offline"],
    };
  }

  const pullResult = await pullFromRemote(userId);

  return {
    success: pullResult.errors.length === 0,
    pushed: 0,
    pulled: pullResult.count,
    errors: pullResult.errors,
  };
}

/**
 * Setup automatic sync on network state change
 */
export function setupAutoSync(
  userId: string,
  onSyncComplete?: (result: SyncResult) => void,
) {
  const unsubscribe = NetInfo.addEventListener(async (state) => {
    // Only sync when we go from offline to online
    if (state.isConnected && state.isInternetReachable) {
      console.log("Network connected, starting auto-sync...");
      const result = await syncExpenses(userId);
      onSyncComplete?.(result);
    }
  });

  return unsubscribe;
}

/**
 * Get sync status/stats
 */
export function getSyncStats(userId: string) {
  const unsyncedExpenses = sqliteExpenses.getUnsyncedExpenses(userId);
  const syncQueue = sqliteExpenses.getSyncQueue();

  return {
    unsyncedCount: unsyncedExpenses.length,
    queuedOperations: syncQueue.length,
    hasUnsyncedChanges: unsyncedExpenses.length > 0 || syncQueue.length > 0,
  };
}
