# SQLite Setup

### Offline-First

- App works completely without internet
- Instant save/load (no network latency)
- Changes queue for later sync

### Automatic Sync

- Syncs when online automatically
- Syncs on app launch
- Syncs when network reconnects
- Syncs when app comes to foreground

### Dual Storage

- **SQLite** - Fast local storage (primary)
- **Supabase** - Cloud backup & cross-device sync (secondary)

### Core Implementation

- `lib/db.ts` - Database setup & schema
- `lib/expenses-sqlite.ts` - Local CRUD + sync tracking
- `lib/sync-service.ts` - Bidirectional sync logic
- `lib/storage-local.ts` - Local receipt storage

### React Context & UI

- `contexts/SyncContext.tsx` - Sync state management

### What Happens Automatically

1. Database initializes on app start
2. Expenses save to SQLite (instant!)
3. Changes sync to Supabase when online
4. Data pulls from Supabase on login
5. Auto-sync when network reconnects

## How It Works

```
User Action (Add Expense)
          ↓
    Save to SQLite (instant!)
          ↓
    Add to Sync Queue
          ↓
    [Wait for online]
          ↓
    Push to Supabase
          ↓
    Mark as synced
```

## Useful Commands

### View Database Stats

```tsx
import { getDatabaseStats } from "@/lib/db";

const stats = getDatabaseStats();
console.log(stats);
// {
//   totalExpenses: 42,
//   unsyncedExpenses: 3,
//   queuedOperations: 3
// }
```

### Manual Sync

```tsx
import { useSync } from "@/contexts/SyncContext";

const { sync } = useSync();
await sync(); // Trigger sync manually
```

### Force Pull from Remote

```tsx
const { forcePull } = useSync();
await forcePull(); // Overwrite local with remote
```

### Reset Database (Dev Only)

```tsx
import { resetDatabase } from "@/lib/db";

resetDatabase(); // ⚠️ Deletes all local data!
```

## Key Features

### Reliability

- ✅ Never lose data (local backup)
- ✅ Auto-retry failed syncs (up to 3 times)
- ✅ Queue system for offline changes
- ✅ Conflict resolution (last-write-wins)

### Performance

- ✅ Instant UI updates (SQLite)
- ✅ No loading spinners for data
- ✅ Batch sync operations
- ✅ Smart sync triggers

### User Experience

- ✅ Works offline completely
- ✅ Seamless sync (background)
- ✅ Visual sync indicator
- ✅ Manual sync option

### Recommended Additions

1. **Add SyncIndicator to your UI**
   - Show in header or settings
   - Let users see sync status
   - Allow manual sync

2. **Test offline functionality**
   - Turn on airplane mode
   - Create expenses
   - See instant saves
   - Turn off airplane mode
   - Watch auto-sync

3. **Customize sync behavior**
   - Adjust retry count
   - Change sync triggers
   - Add custom conflict resolution

4. **Enhance receipt storage**
   - Sync receipts to Supabase Storage
   - Keep local + remote URLs
   - Background upload

## Troubleshooting

### Data not syncing?

1. Check online status: `const { isOnline } = useSync()`
2. Check unsynced count: `const { unsyncedCount } = useSync()`
3. Try manual sync: `await sync()`
4. Check console for errors

### Want to start fresh?

```tsx
import { resetDatabase } from "@/lib/db";
resetDatabase(); // Deletes all local data
```
