## React Query vs. Zustand for Expenses

- **Why not React Query for expenses now**
  - React Query excels at **async server state**: fetch, cache, refetch, and stale/refresh logic.
  - After the refactor, the **source of truth for expenses** is:
    - In-memory state (**Zustand**),
    - Persisted via **AsyncStorage**,
    - With components re-rendering reactively from the store.
  - There is no longer an async `queryFn` like “read from SQLite” that benefits much from React Query’s caching.
  - Using **both React Query and Zustand** for the same expenses list would:
    - Duplicate state,
    - Create “which one is correct?” questions (cache vs. store),
    - Require extra cache invalidation wiring.

## Why Zustand over SQLite (for app state, local storage)

- **Context vs. Zustand**
  - React Context is for **simple shared props within a component tree**, but can have performance trade-offs at scale.
  - Zustand is a **lightweight, high-performance global state store** with granular subscriptions.
  - Context fits when a single hierarchy (parent + children) needs the same data.
  - Zustand fits when **many unrelated parts of the app** need the same state (multiple parents/children).

- **Guideline**
  - Use **Zustand** for global state and local persistence instead of wiring every read directly to SQLite + React Query.

## Offline Expense Sync

- Offline expense adds are:
  - **Stored locally** and **queued immediately**.
  - **Pushed to Supabase automatically** when:
    - The device is back online,
    - The app foregrounds while online, or
    - You trigger a manual sync.

## Background Tasks (Expo)

**Key considerations for Expo Go**

- **iOS limitation**
  - Apple’s `BGTaskScheduler` API (used by `expo-background-task`) requires Info.plist configuration that **cannot** be applied dynamically inside the generic Expo Go app.
- **Android compatibility**
  - On Android, background tasks may run in Expo Go, but behavior:
    - Varies by device/OEM,
    - Is harder to test/debug than in a dedicated dev build.
- **Testing**
  - `BackgroundTask.triggerTaskWorkerForTestingAsync()` is available in **development builds** (not production) to manually trigger tasks, which helps compensate for the OS’s unpredictable scheduling.

# Background tasks

## System constraints

Background tasks are subject to OS limits:

- **Network** – task typically only runs when the device has connectivity.
- **Battery** – low battery or not charging can delay or skip runs.
- **Platform** – Android has a minimum interval of 15 minutes; iOS may delay short intervals.

---

## Testing on localhost (without killing the app)

If you kill the app, the process is gone. When the OS later runs the background task, it may start a new process that needs the JS bundle from Metro; that can fail or be flaky when using a local dev server. So **keep the app alive (in background) and keep Metro running** when you test.

### 1. Run Metro in its own terminal

```bash
npm start
```

Leave this running. Use a **second** terminal for the steps below.

### 2. Test the task logic (app in foreground)

- Open the app, go to **Profile**.
- Tap **Trigger background sync (test)**.
- You get an immediate toast and **Last background sync** updates. This runs the same sync code the background task uses, so you’re testing the logic without the OS scheduler.

### 3. Test the task “in background” (Android)

This runs the real background task while the app is in the background and Metro is still connected:

1. Open the app (so the task is registered and user is set).
2. **Send the app to background** — press the device/emulator **Home** button (or swipe up to go home). The app stays in memory and can still talk to Metro. Do **not** swipe the app away from the recent-apps list (that force-quits it and stops the process).
3. In a **second terminal** (Metro still running in the first), trigger the job:

   ```bash
   npm run trigger-bg-job
   ```

   (or `./scripts/trigger-android-background-job.sh` from project root)

   Manual alternative: get the job ID with `adb shell dumpsys jobscheduler`, then run:
   `adb shell cmd jobscheduler run -f <PACKAGE> <JOB_ID>`.

So the script: finds your app’s background sync job in the system list, gets its numeric id, then tells the device to run that job immediately. The app should be in the background (and Metro running) so when the job runs, it can load JS and update “Last background sync” on Profile.

4. Wait a few seconds, then **reopen the app** and go to Profile.

**If you don’t trigger the job this way**, the OS runs it on its own schedule. We register the task with a **minimum interval of 5 minutes** (Android may enforce a **15‑minute** minimum). The system picks the actual time based on battery, network, and usage — so the job will run **sometime after** that interval when the app is in background (or after you’ve left the app), but not at a fixed clock time. You’d have to leave the app in background and wait 15+ minutes to see it run “naturally”; the script is for testing without waiting.

5. **Last background sync** on Profile should show the run (e.g. "Just now").

On localhost, if you kill the app the process is gone and the task may not run when the OS fires it; the script lets you test without waiting for the 15+ min natural schedule.

### 4. Optional: see task logs (Android)

Background task `console.log` often doesn’t show in Metro. To see it:

```bash
adb logcat | grep -i BackgroundSync
```

Or filter by your app’s package name.

---

## Why use Tamagui?

- Works the same on React Native and React web.
- 100% of Tamagui features work at both runtime and compile-time.
- Built-in theming and strong TypeScript support.
