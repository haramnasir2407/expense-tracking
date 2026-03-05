import * as BackgroundTask from "expo-background-task";
import * as SecureStore from "expo-secure-store";
import * as TaskManager from "expo-task-manager";

import { isOnline, syncExpenses } from "@/service/sync-service";

// Identifier for the background sync task
export const BACKGROUND_SYNC_TASK_IDENTIFIER = "background-expense-sync";

// Key used to persist the current user id for background sync
const BACKGROUND_SYNC_USER_KEY = "background_sync_user_id";
// Key for last run info (so the app can show "last ran at ...")
export const BACKGROUND_SYNC_LAST_RUN_KEY = "background_sync_last_run";

export type LastBackgroundSyncRun = {
  at: number;
  pushed?: number;
  pulled?: number;
  success?: boolean;
  reason?: "no_user" | "offline" | "sync_failed" | "ok";
};

/**
 * Define the background task.
 *
 * NOTE: This MUST be called in module/global scope (not inside a component),
 * so importing this file is enough to register the task definition.
 */
function saveLastRun(payload: LastBackgroundSyncRun) {
  return SecureStore.setItemAsync(
    BACKGROUND_SYNC_LAST_RUN_KEY,
    JSON.stringify(payload),
  ).catch(() => {});
}

TaskManager.defineTask(BACKGROUND_SYNC_TASK_IDENTIFIER, async () => {
  try {
    const userId = await SecureStore.getItemAsync(BACKGROUND_SYNC_USER_KEY);

    if (!userId) {
      console.log("[BackgroundSync] No user id stored, skipping");
      await saveLastRun({ at: Date.now(), reason: "no_user" });
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const online = await isOnline();
    if (!online) {
      console.log("[BackgroundSync] Device offline, skipping");
      await saveLastRun({ at: Date.now(), reason: "offline" });
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    console.log("[BackgroundSync] Running background expense sync...");
    const result = await syncExpenses(userId);

    if (!result.success) {
      console.log(
        "[BackgroundSync] Sync failed in background task:",
        result.errors,
      );
      await saveLastRun({
        at: Date.now(),
        pushed: result.pushed,
        pulled: result.pulled,
        success: false,
        reason: "sync_failed",
      });
      return BackgroundTask.BackgroundTaskResult.Failed;
    }

    const hasChanges = result.pushed > 0 || result.pulled > 0;
    console.log(
      "[BackgroundSync] Completed. Pushed:",
      result.pushed,
      "Pulled:",
      result.pulled,
    );

    await saveLastRun({
      at: Date.now(),
      pushed: result.pushed,
      pulled: result.pulled,
      success: true,
      reason: "ok",
    });

    return hasChanges
      ? BackgroundTask.BackgroundTaskResult.Success
      : BackgroundTask.BackgroundTaskResult.Failed;
  } catch (error) {
    console.error("[BackgroundSync] Error in background task:", error);
    await saveLastRun({
      at: Date.now(),
      reason: "sync_failed",
    });
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
  return BackgroundTask.registerTaskAsync(BACKGROUND_SYNC_TASK_IDENTIFIER, {
    minimumInterval: 5, // minutes; Android may enforce platform minimum of 15
  });
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
 * When the background task runs, it writes last run info to SecureStore.
 * Call this to show "last ran at ..." in the UI.
 */
export async function getLastBackgroundSyncRun(): Promise<LastBackgroundSyncRun | null> {
  try {
    const raw = await SecureStore.getItemAsync(BACKGROUND_SYNC_LAST_RUN_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as LastBackgroundSyncRun;
    return typeof parsed?.at === "number" ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * Record a last-run entry from the app (e.g. after the test trigger runs sync in foreground).
 * Lets the UI show "last ran just now" without waiting for the real background task.
 */
export async function setLastBackgroundSyncRun(run: LastBackgroundSyncRun) {
  await SecureStore.setItemAsync(
    BACKGROUND_SYNC_LAST_RUN_KEY,
    JSON.stringify(run),
  );
}

/**
 * Trigger the background sync task manually in local development.
 */
export async function triggerBackgroundSyncTaskForTesting() {
  await BackgroundTask.triggerTaskWorkerForTestingAsync();
}
