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

## Victory Native

- _TODO: document why `victory-native` was chosen (charting, theming, animations)._ 

## Context Provider vs. Zustand

- _TODO: add more concrete guidelines and examples for when to introduce a new Context vs. using the existing Zustand stores._

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