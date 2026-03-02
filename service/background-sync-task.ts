import * as BackgroundTask from "expo-background-task";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

import { isOnline, syncExpenses } from "@/service/sync-service";

// Identifier for the background sync task
export const BACKGROUND_SYNC_TASK_IDENTIFIER = "background-expense-sync";

// Key used to persist the current user id for background sync
const BACKGROUND_SYNC_USER_KEY = "background_sync_user_id";

/**
 * Define the background task.
 *
 * NOTE: This MUST be called in module/global scope (not inside a component),
 * so importing this file is enough to register the task definition.
 */
TaskManager.defineTask(BACKGROUND_SYNC_TASK_IDENTIFIER, async () => {
  try {
    const userId = await SecureStore.getItemAsync(BACKGROUND_SYNC_USER_KEY);

    if (!userId) {
      console.log("[BackgroundSync] No user id stored, skipping");
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const online = await isOnline();
    if (!online) {
      console.log("[BackgroundSync] Device offline, skipping");
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    console.log("[BackgroundSync] Running background expense sync...");
    const result = await syncExpenses(userId);

    if (!result.success) {
      console.log(
        "[BackgroundSync] Sync failed in background task:",
        result.errors,
      );
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const hasChanges = result.pushed > 0 || result.pulled > 0;
    console.log(
      "[BackgroundSync] Completed. Pushed:",
      result.pushed,
      "Pulled:",
      result.pulled,
    );

    return hasChanges
      ? BackgroundTask.BackgroundTaskResult.Success
      : BackgroundTask.BackgroundTaskResult.Failed;
  } catch (error) {
    console.error("[BackgroundSync] Error in background task:", error);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

/**
 * Store or clear the user id used for background sync.
 * Call this when auth state changes (e.g. login/logout).
 */
export async function setBackgroundSyncUser(userId: string | null) {
  if (userId) {
    await SecureStore.setItemAsync(BACKGROUND_SYNC_USER_KEY, userId);
  } else {
    await SecureStore.deleteItemAsync(BACKGROUND_SYNC_USER_KEY);
  }
}

/**
 * Register the background sync task with the system.
 * Can be called from a React component (e.g. on app startup or a settings toggle).
 */
export async function registerBackgroundSyncTaskAsync() {
  console.log("[BackgroundSync]: Registering background sync task");
  const status = await BackgroundTask.getStatusAsync();
  console.log(
    "[BackgroundSync]: Status",
    BackgroundTask.BackgroundTaskStatus[status],
  );
  return BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK_IDENTIFIER);
}

/**
 * Unregister the background sync task.
 * After this, the OS will stop calling the task in background.
 */
export async function unregisterBackgroundSyncTaskAsync() {
  return BackgroundTask.unregisterTaskAsync(BACKGROUND_SYNC_TASK_IDENTIFIER);
}

/**
 * Helper to inspect the current background task status and registration flag.
 */
export async function getBackgroundSyncStatus() {
  const status = await BackgroundTask.getStatusAsync();
  const isRegistered = await TaskManager.isTaskRegisteredAsync(
    BACKGROUND_SYNC_TASK_IDENTIFIER,
  );
  console.log("status", status);
  console.log("isRegistered", isRegistered);
  return { status, isRegistered };
}

/**
 * Trigger the background sync task manually in local development.
 */
export async function triggerBackgroundSyncTaskForTesting() {
  await BackgroundTask.triggerTaskWorkerForTestingAsync();
}
