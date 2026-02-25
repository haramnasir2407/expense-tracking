import * as SQLite from "expo-sqlite";

const DB_NAME = "expenses.db";

// Open database connection
export const db = SQLite.openDatabaseSync(DB_NAME);

/**
 * Initialize database and create tables if they don't exist
 */
export function initDatabase() {
  try {
    // Create expenses table with sync tracking
    db.execSync(`
      CREATE TABLE IF NOT EXISTS expenses (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount REAL NOT NULL,
        category TEXT NOT NULL,
        date TEXT NOT NULL,
        notes TEXT,
        receipt_url TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        sync_error TEXT,
        last_sync_at TEXT
      );
    `);

    // Create sync queue table for tracking pending operations
    db.execSync(`
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        expense_id TEXT NOT NULL,
        operation TEXT NOT NULL,
        data TEXT,
        created_at TEXT NOT NULL,
        retry_count INTEGER DEFAULT 0
      );
    `);

    // Create indexes for better query performance
    db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
      CREATE INDEX IF NOT EXISTS idx_expenses_synced ON expenses(synced);
      CREATE INDEX IF NOT EXISTS idx_sync_queue_expense_id ON sync_queue(expense_id);
    `);

    console.log("Database initialized successfully");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}

/**
 * Drop all tables (useful for development/testing)
 */
export function dropAllTables() {
  try {
    db.execSync("DROP TABLE IF EXISTS expenses;");
    db.execSync("DROP TABLE IF EXISTS sync_queue;");
    console.log("All tables dropped");
  } catch (error) {
    console.error("Error dropping tables:", error);
    throw error;
  }
}

/**
 * Reset database (drop and recreate)
 */
export function resetDatabase() {
  dropAllTables();
  initDatabase();
}

/**
 * Get database statistics
 */
export function getDatabaseStats() {
  try {
    const expenseCount = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM expenses",
    );

    const unsyncedCount = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM expenses WHERE synced = 0",
    );

    const queueCount = db.getFirstSync<{ count: number }>(
      "SELECT COUNT(*) as count FROM sync_queue",
    );

    return {
      totalExpenses: expenseCount?.count || 0,
      unsyncedExpenses: unsyncedCount?.count || 0,
      queuedOperations: queueCount?.count || 0,
    };
  } catch (error) {
    console.error("Error getting database stats:", error);
    return {
      totalExpenses: 0,
      unsyncedExpenses: 0,
      queuedOperations: 0,
    };
  }
}
