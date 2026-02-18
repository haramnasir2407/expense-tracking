import { Expense, ExpenseFormData } from "@/types/expense";
import { db } from "./db";
import { generateUUID } from "./uuid";

// Extended Expense type with sync fields
export interface LocalExpense extends Expense {
  synced: number; // 0 = not synced, 1 = synced
  sync_error?: string;
  last_sync_at?: string;
}

/**
 * Get all expenses for a user, ordered by date (newest first)
 */
export async function getExpenses(userId: string) {
  try {
    const result = db.getAllSync<LocalExpense>(
      `SELECT * FROM expenses 
       WHERE user_id = ? 
       ORDER BY date DESC, created_at DESC`,
      [userId],
    );

    return { data: result, error: null };
  } catch (error) {
    console.error("Error getting expenses:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch expenses",
      },
    };
  }
}

/**
 * Get a single expense by ID
 */
export async function getExpenseById(id: string) {
  try {
    const result = db.getFirstSync<LocalExpense>(
      "SELECT * FROM expenses WHERE id = ?",
      [id],
    );

    return { data: result, error: null };
  } catch (error) {
    console.error("Error getting expense:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to fetch expense",
      },
    };
  }
}

/**
 * Add a new expense (marked as unsynced)
 */
export async function addExpense(expense: ExpenseFormData, userId: string) {
  try {
    console.log('📱 [SQLite] Adding expense to LOCAL database first...');
    const id = generateUUID(); // Generate proper UUID
    const now = new Date().toISOString();

    const newExpense: LocalExpense = {
      id,
      user_id: userId,
      amount: parseFloat(expense.amount),
      category: expense.category,
      date: expense.date.toISOString(),
      notes: expense.notes || undefined,
      receipt_url: expense.receipt_url || undefined,
      created_at: now,
      updated_at: now,
      synced: 0, // Not synced yet
    };

    db.runSync(
      `INSERT INTO expenses 
       (id, user_id, amount, category, date, notes, receipt_url, created_at, updated_at, synced) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newExpense.id,
        newExpense.user_id,
        newExpense.amount,
        newExpense.category,
        newExpense.date,
        newExpense.notes || null,
        newExpense.receipt_url || null,
        newExpense.created_at,
        newExpense.updated_at,
        newExpense.synced,
      ],
    );

    console.log('✅ [SQLite] Expense saved locally! ID:', id);
    console.log('⏳ [SQLite] Marked as unsynced (synced=0) - will sync to Supabase when online');

    // Add to sync queue
    addToSyncQueue(id, "create", newExpense);
    console.log('📋 [SQLite] Added to sync queue');

    return { data: newExpense, error: null };
  } catch (error) {
    console.error("❌ [SQLite] Error adding expense:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to add expense",
      },
    };
  }
}

/**
 * Update an existing expense (marked as unsynced)
 */
export async function updateExpense(
  id: string,
  updates: Partial<ExpenseFormData>,
) {
  try {
    const updateFields: string[] = [];
    const values: any[] = [];

    // Build dynamic update query
    if (updates.amount !== undefined) {
      updateFields.push("amount = ?");
      values.push(parseFloat(updates.amount));
    }
    if (updates.category !== undefined) {
      updateFields.push("category = ?");
      values.push(updates.category);
    }
    if (updates.date !== undefined) {
      updateFields.push("date = ?");
      values.push(updates.date.toISOString());
    }
    if (updates.notes !== undefined) {
      updateFields.push("notes = ?");
      values.push(updates.notes || null);
    }
    if (updates.receipt_url !== undefined) {
      updateFields.push("receipt_url = ?");
      values.push(updates.receipt_url || null);
    }

    // Mark as unsynced and update timestamp
    updateFields.push("updated_at = ?", "synced = 0");
    values.push(new Date().toISOString());

    // Add id to the end for the WHERE clause
    values.push(id);

    if (updateFields.length === 2) {
      // Only updated_at and synced were added, nothing substantial to update
      return { data: null, error: { message: "No fields to update" } };
    }

    db.runSync(
      `UPDATE expenses 
       SET ${updateFields.join(", ")} 
       WHERE id = ?`,
      values,
    );

    // Add to sync queue
    addToSyncQueue(id, "update", updates);

    // Fetch and return the updated expense
    const result = db.getFirstSync<LocalExpense>(
      "SELECT * FROM expenses WHERE id = ?",
      [id],
    );

    return { data: result, error: null };
  } catch (error) {
    console.error("Error updating expense:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to update expense",
      },
    };
  }
}

/**
 * Delete an expense by ID (marked as unsynced, added to queue)
 */
export async function deleteExpense(id: string) {
  try {
    // Add to sync queue before deleting
    addToSyncQueue(id, "delete", null);

    db.runSync("DELETE FROM expenses WHERE id = ?", [id]);
    return { error: null };
  } catch (error) {
    console.error("Error deleting expense:", error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete expense",
      },
    };
  }
}

/**
 * Upsert expense from remote (used during sync)
 * This won't trigger sync queue
 */
export async function upsertExpenseFromRemote(expense: Expense) {
  try {
    const existing = db.getFirstSync<LocalExpense>(
      "SELECT * FROM expenses WHERE id = ?",
      [expense.id],
    );

    const localExpense: LocalExpense = {
      ...expense,
      synced: 1,
      last_sync_at: new Date().toISOString(),
    };

    if (existing) {
      // Update existing
      db.runSync(
        `UPDATE expenses 
         SET user_id = ?, amount = ?, category = ?, date = ?, notes = ?, 
             receipt_url = ?, created_at = ?, updated_at = ?, synced = 1, 
             last_sync_at = ?
         WHERE id = ?`,
        [
          localExpense.user_id,
          localExpense.amount,
          localExpense.category,
          localExpense.date,
          localExpense.notes || null,
          localExpense.receipt_url || null,
          localExpense.created_at,
          localExpense.updated_at,
          localExpense.last_sync_at || new Date().toISOString(),
          localExpense.id,
        ],
      );
    } else {
      // Insert new
      db.runSync(
        `INSERT INTO expenses 
         (id, user_id, amount, category, date, notes, receipt_url, created_at, 
          updated_at, synced, last_sync_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        [
          localExpense.id,
          localExpense.user_id,
          localExpense.amount,
          localExpense.category,
          localExpense.date,
          localExpense.notes || null,
          localExpense.receipt_url || null,
          localExpense.created_at,
          localExpense.updated_at,
          localExpense.last_sync_at || new Date().toISOString(),
        ],
      );
    }

    return { data: localExpense, error: null };
  } catch (error) {
    console.error("Error upserting expense from remote:", error);
    return {
      data: null,
      error: {
        message:
          error instanceof Error ? error.message : "Failed to upsert expense",
      },
    };
  }
}

/**
 * Mark expense as synced
 */
export function markExpenseAsSynced(id: string) {
  try {
    db.runSync(
      `UPDATE expenses 
       SET synced = 1, last_sync_at = ?, sync_error = NULL 
       WHERE id = ?`,
      [new Date().toISOString(), id],
    );
  } catch (error) {
    console.error("Error marking expense as synced:", error);
  }
}

/**
 * Mark expense sync as failed
 */
export function markExpenseSyncFailed(id: string, error: string) {
  try {
    db.runSync("UPDATE expenses SET sync_error = ? WHERE id = ?", [error, id]);
  } catch (error) {
    console.error("Error marking expense sync as failed:", error);
  }
}

/**
 * Get all unsynced expenses
 */
export function getUnsyncedExpenses(userId: string) {
  try {
    const result = db.getAllSync<LocalExpense>(
      "SELECT * FROM expenses WHERE user_id = ? AND synced = 0",
      [userId],
    );

    return result;
  } catch (error) {
    console.error("Error getting unsynced expenses:", error);
    return [];
  }
}

/**
 * Add operation to sync queue
 * Prevents duplicates - if same expense_id + operation exists, don't add again
 */
function addToSyncQueue(
  expenseId: string,
  operation: "create" | "update" | "delete",
  data: any,
) {
  try {
    // Check if this operation already exists in queue
    const existing = db.getFirstSync<{ id: number }>(
      "SELECT id FROM sync_queue WHERE expense_id = ? AND operation = ?",
      [expenseId, operation],
    );

    if (existing) {
      console.log(
        `⚠️ [SQLite] Sync queue already has ${operation} for ${expenseId}, skipping duplicate`,
      );
      return;
    }

    db.runSync(
      `INSERT INTO sync_queue (expense_id, operation, data, created_at) 
       VALUES (?, ?, ?, ?)`,
      [
        expenseId,
        operation,
        data ? JSON.stringify(data) : null,
        new Date().toISOString(),
      ],
    );
  } catch (error) {
    console.error("Error adding to sync queue:", error);
  }
}

/**
 * Get sync queue items
 */
export function getSyncQueue() {
  try {
    const result = db.getAllSync<{
      id: number;
      expense_id: string;
      operation: "create" | "update" | "delete";
      data: string | null;
      created_at: string;
      retry_count: number;
    }>("SELECT * FROM sync_queue ORDER BY created_at ASC");

    return result.map((item) => ({
      ...item,
      data: item.data ? JSON.parse(item.data) : null,
    }));
  } catch (error) {
    console.error("Error getting sync queue:", error);
    return [];
  }
}

/**
 * Remove item from sync queue
 */
export function removeFromSyncQueue(queueId: number) {
  try {
    db.runSync("DELETE FROM sync_queue WHERE id = ?", [queueId]);
  } catch (error) {
    console.error("Error removing from sync queue:", error);
  }
}

/**
 * Increment retry count for sync queue item
 */
export function incrementSyncRetryCount(queueId: number) {
  try {
    db.runSync(
      "UPDATE sync_queue SET retry_count = retry_count + 1 WHERE id = ?",
      [queueId],
    );
  } catch (error) {
    console.error("Error incrementing retry count:", error);
  }
}

/**
 * Clear sync queue
 */
export function clearSyncQueue() {
  try {
    db.runSync("DELETE FROM sync_queue");
    console.log("🗑️ [SQLite] Sync queue cleared");
  } catch (error) {
    console.error("Error clearing sync queue:", error);
  }
}

/**
 * Clear failed sync queue items (retry count >= max)
 */
export function clearFailedSyncItems(maxRetries: number = 3) {
  try {
    const result = db.runSync(
      "DELETE FROM sync_queue WHERE retry_count >= ?",
      [maxRetries]
    );
    console.log(`🗑️ [SQLite] Removed ${result.changes || 0} failed sync items`);
    return result.changes || 0;
  } catch (error) {
    console.error("Error clearing failed sync items:", error);
    return 0;
  }
}

/**
 * Remove duplicate sync queue entries
 * Keeps only the oldest entry for each expense_id + operation combination
 */
export function removeDuplicateSyncQueueEntries() {
  try {
    // Find duplicates
    const duplicates = db.getAllSync<{
      expense_id: string;
      operation: string;
      count: number;
    }>(
      `SELECT expense_id, operation, COUNT(*) as count 
       FROM sync_queue 
       GROUP BY expense_id, operation 
       HAVING COUNT(*) > 1`,
    );

    if (duplicates.length === 0) {
      console.log("✅ [SQLite] No duplicate sync queue entries");
      return 0;
    }

    console.log(`🔍 [SQLite] Found ${duplicates.length} duplicate sets`);

    let totalRemoved = 0;

    // For each duplicate set, keep only the oldest (lowest id)
    for (const dup of duplicates) {
      // Get all entries for this expense_id + operation
      const entries = db.getAllSync<{ id: number }>(
        `SELECT id FROM sync_queue 
         WHERE expense_id = ? AND operation = ? 
         ORDER BY id ASC`,
        [dup.expense_id, dup.operation],
      );

      // Keep first (oldest), delete the rest
      if (entries.length > 1) {
        const idsToDelete = entries.slice(1).map((e) => e.id);

        for (const id of idsToDelete) {
          db.runSync("DELETE FROM sync_queue WHERE id = ?", [id]);
          totalRemoved++;
        }

        console.log(
          `  Removed ${idsToDelete.length} duplicate(s) for ${dup.operation} ${dup.expense_id}`,
        );
      }
    }

    console.log(
      `✅ [SQLite] Removed ${totalRemoved} duplicate sync queue entries`,
    );
    return totalRemoved;
  } catch (error) {
    console.error("Error removing duplicate sync queue entries:", error);
    return 0;
  }
}

/**
 * Delete all expenses for a user (useful for logout/reset)
 */
export async function deleteAllUserExpenses(userId: string) {
  try {
    db.runSync("DELETE FROM expenses WHERE user_id = ?", [userId]);
    return { error: null };
  } catch (error) {
    console.error("Error deleting all user expenses:", error);
    return {
      error: {
        message:
          error instanceof Error ? error.message : "Failed to delete expenses",
      },
    };
  }
}
