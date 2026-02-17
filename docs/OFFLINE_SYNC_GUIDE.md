# Offline-First Architecture with SQLite and Supabase Sync

## Overview

This expense tracking app uses a **hybrid offline-first architecture** that combines:

- **SQLite** for local storage (primary data source)
- **Supabase** for remote backup and cross-device sync
- **Bidirectional sync** to keep data consistent

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    User Interface                    │
└──────────────────┬──────────────────────────────────┘
                   │
         ┌─────────▼──────────┐
         │  ExpensesContext   │  (State Management)
         └─────────┬──────────┘
                   │
         ┌─────────▼──────────┐
         │    SyncContext     │  (Sync Management)
         └─────────┬──────────┘
                   │
       ┌───────────┴───────────┐
       │                       │
┌──────▼───────┐       ┌──────▼────────┐
│   SQLite     │◄─────►│   Supabase    │
│   (Local)    │ Sync  │   (Remote)    │
└──────────────┘       └───────────────┘
```

## How It Works

### 1. **Local-First Operations**

All CRUD operations (Create, Read, Update, Delete) happen directly on SQLite:

```typescript
// Adding an expense
const expense = await addExpense(data, userId);
// ✅ Saved to SQLite immediately
// ⏳ Queued for sync to Supabase
```

**Benefits:**

- ⚡ Instant response (no network latency)
- 📱 Works completely offline
- 🔋 Better battery life (fewer network requests)

### 2. **Sync Queue System**

Every local change is tracked in a sync queue:

```sql
sync_queue table:
- id (auto-increment)
- expense_id (reference)
- operation (create/update/delete)
- data (JSON)
- retry_count
```

**Flow:**

1. User creates/updates/deletes expense
2. Change saved to local SQLite
3. Operation added to sync queue
4. Sync service processes queue when online

### 3. **Bidirectional Sync**

The sync process has two phases:

#### Phase 1: Push (Local → Remote)

```typescript
// 1. Get all pending changes from sync queue
// 2. For each operation:
//    - Try to sync to Supabase
//    - If success: mark as synced, remove from queue
//    - If failure: increment retry count (max 3 retries)
// 3. Mark records as synced
```

#### Phase 2: Pull (Remote → Local)

```typescript
// 1. Fetch all expenses from Supabase
// 2. For each remote expense:
//    - Check if exists locally
//    - If newer: update local version
//    - If not exists: insert locally
// 3. Mark as synced
```

### 4. **Automatic Sync Triggers**

Sync happens automatically when:

- ✅ App starts (when user is logged in)
- ✅ Network connection restored
- ✅ App comes to foreground
- ✅ User manually triggers sync

### 5. **Conflict Resolution**

Current strategy: **Last-Write-Wins (LWW)**

- Remote changes overwrite local during pull
- Local unsynced changes are pushed first
- Uses `updated_at` timestamp for comparison

## Database Schema

### SQLite Tables

#### `expenses` table

```sql
CREATE TABLE expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  category TEXT NOT NULL,
  date TEXT NOT NULL,
  notes TEXT,
  receipt_url TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  synced INTEGER DEFAULT 0,      -- 0 = not synced, 1 = synced
  sync_error TEXT,                -- Last sync error message
  last_sync_at TEXT              -- Last successful sync timestamp
);
```

#### `sync_queue` table

```sql
CREATE TABLE sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expense_id TEXT NOT NULL,
  operation TEXT NOT NULL,        -- 'create', 'update', 'delete'
  data TEXT,                      -- JSON of the operation data
  created_at TEXT NOT NULL,
  retry_count INTEGER DEFAULT 0
);
```

## Key Components

### 1. Database Layer (`lib/db.ts`)

- Database initialization
- Schema creation
- Index management

### 2. SQLite Operations (`lib/expenses-sqlite.ts`)

- CRUD operations on local SQLite
- Sync queue management
- Marking records as synced/unsynced

### 3. Remote Operations (`lib/expenses.ts`)

- Supabase API calls
- Remote CRUD operations

### 4. Sync Service (`lib/sync-service.ts`)

- Network detection
- Push/pull logic
- Conflict resolution
- Auto-sync setup

### 5. Sync Context (`contexts/SyncContext.tsx`)

- React context for sync state
- Automatic sync triggers
- Sync status management

### 6. Sync Indicator (`components/sync/SyncIndicator.tsx`)

- UI component showing sync status
- Manual sync trigger
- Unsynced count badge

## Usage

### In Your Components

```tsx
import { useSync } from "@/contexts/SyncContext";

function MyComponent() {
  const {
    syncStatus, // 'idle' | 'syncing' | 'success' | 'error'
    lastSyncTime, // Date | null
    unsyncedCount, // number
    isOnline, // boolean
    sync, // () => Promise<void>
    forcePull, // () => Promise<void>
  } = useSync();

  return (
    <View>
      <Text>Status: {syncStatus}</Text>
      <Text>Unsynced: {unsyncedCount}</Text>
      <Button onPress={sync} disabled={!isOnline}>
        Sync Now
      </Button>
    </View>
  );
}
```

### Manual Sync

```tsx
import { syncExpenses } from "@/lib/sync-service";

// Trigger manual sync
await syncExpenses(userId);
```

### Check Sync Stats

```tsx
import { getSyncStats } from "@/lib/sync-service";

const stats = getSyncStats(userId);
console.log(`${stats.unsyncedCount} expenses need syncing`);
```

## Receipt Storage

Receipts are also stored locally:

```typescript
// Local storage (lib/storage-local.ts)
- Saves to app's document directory
- Files: receipts/{userId}_{timestamp}.jpg
- Works completely offline

// Remote storage (lib/storage.ts)
- Uploads to Supabase Storage
- Public URLs for cross-device access
```

**Note:** Receipt URLs in expenses remain as local file paths. You may want to:

1. Keep both local and remote URLs
2. Sync receipts separately from expense data
3. Use a hybrid approach (show local, upload in background)

## Testing Offline Functionality

### 1. Test Offline Creation

```bash
# Turn on Airplane Mode
# Create/edit/delete expenses
# Turn off Airplane Mode
# Watch sync happen automatically
```

### 2. Monitor Sync Queue

```typescript
import { getDatabaseStats } from "@/lib/db";

const stats = getDatabaseStats();
console.log("Unsynced:", stats.unsyncedExpenses);
console.log("Queue:", stats.queuedOperations);
```

### 3. Force Sync

```typescript
import { useSync } from "@/contexts/SyncContext";

const { sync } = useSync();
await sync(); // Manual trigger
```

## Advantages of This Architecture

### ✅ Offline-First

- App works without internet
- No "loading" delays
- Instant user feedback

### ✅ Reliable

- Changes never lost (queued for sync)
- Retry logic for failed syncs
- Local data always available

### ✅ Fast

- No network latency for reads/writes
- Batch sync operations
- Smart sync triggers

### ✅ Battery Efficient

- Fewer network requests
- Sync on WiFi preferred
- Batch operations

### ✅ Cross-Device Sync

- Data backed up to cloud
- Sync across devices
- Data persistence

## Limitations & Future Improvements

### Current Limitations

1. **Conflict Resolution:** Simple LWW (Last-Write-Wins)
   - Could be improved with CRDT or OT
   - User notification on conflicts

2. **Deletion Tracking:** Deletes only tracked in queue
   - Consider tombstone approach
   - Sync deletion across devices

3. **Receipt Sync:** Receipts only local currently
   - Need separate receipt sync strategy
   - Could use background upload

4. **Large Data:** Pull fetches all expenses
   - Could implement incremental sync
   - Use `last_sync_at` for delta updates

### Possible Enhancements

1. **Delta Sync**

```typescript
// Only fetch changes since last sync
const { data } = await supabase
  .from("expenses")
  .select("*")
  .gt("updated_at", lastSyncTime);
```

2. **Sync Priority**

```typescript
// Prioritize recent/important changes
// Sync most recent first
// Batch older changes
```

3. **Conflict UI**

```typescript
// Show user conflicts
// Let user choose version
// Merge strategies
```

4. **Background Sync**

```typescript
// Use background tasks
// Sync during idle time
// Battery-aware syncing
```

## Debugging

### Enable Logging

All sync operations log to console. Search for:

- `"Starting sync..."`
- `"Pushing ... operations"`
- `"Pulled ... expenses"`
- `"Sync completed:"`

### Inspect Database

```typescript
import { db } from "@/lib/db";

// Check expenses
const expenses = db.getAllSync("SELECT * FROM expenses");

// Check queue
const queue = db.getAllSync("SELECT * FROM sync_queue");

// Check unsynced
const unsynced = db.getAllSync("SELECT * FROM expenses WHERE synced = 0");
```

### Reset Everything

```typescript
import { resetDatabase } from "@/lib/db";

resetDatabase(); // Drops and recreates tables
```

## Best Practices

1. **Always use local operations first**

   ```typescript
   // ✅ Good
   await addExpense(data, userId); // Saves locally, syncs later

   // ❌ Bad
   await supabase.from('expenses').insert(...); // Bypasses local
   ```

2. **Trust the sync system**
   - Don't manually call Supabase in components
   - Let sync service handle remote operations
   - Local DB is source of truth

3. **Handle sync errors gracefully**

   ```typescript
   const { sync } = useSync();
   const result = await sync();

   if (!result.success) {
     // Show user-friendly message
     // Don't prevent app usage
   }
   ```

4. **Show sync status to users**
   - Use `SyncIndicator` component
   - Show unsynced count
   - Allow manual sync

## Migration from Supabase-Only

If you were using Supabase directly before:

1. ✅ Database now initialized with SQLite
2. ✅ All operations now use `expenses-sqlite.ts`
3. ✅ Sync context added to app
4. ⚠️ Old Supabase data needs initial pull

To migrate existing data:

```typescript
import { forcePullFromRemote } from "@/lib/sync-service";

// Pull all remote data to local on first run
await forcePullFromRemote(userId);
```

## Summary

This hybrid architecture gives you:

- **Best of both worlds:** Local speed + Cloud backup
- **Offline capability:** Full app functionality without internet
- **Data safety:** Changes never lost, always synced
- **Great UX:** Instant response, background sync

The local SQLite database is your **primary data source**, with Supabase as a **backup and sync layer** for cross-device functionality.
