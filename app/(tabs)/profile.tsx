import { ProfileView } from "@/components/profile/ProfileView";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useAppTheme } from "@/hooks/use-tamagui-theme";
import {
  getLastBackgroundSyncRun,
  LastBackgroundSyncRun,
  setLastBackgroundSyncRun,
  triggerBackgroundSyncTaskForTesting,
} from "@/service/background-sync-task";
import { syncExpenses } from "@/service/sync-service";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert } from "react-native";
import Toast from "react-native-toast-message";

export default function ProfileScreen() {
  const { user, biometricEnabled, setBiometricEnabled } = useAuth();
  const [lastBackgroundSync, setLastBackgroundSync] =
    useState<LastBackgroundSyncRun | null>(null);

  useFocusEffect(
    useCallback(() => {
      getLastBackgroundSyncRun().then(setLastBackgroundSync);
    }, []),
  );
  const {
    settings,
    hasPermission,
    requestPermission,
    updateSettings,
    loading: notifLoading,
  } = useNotifications();
  const { colors } = useAppTheme();

  const toggleBiometric = async () => {
    try {
      await setBiometricEnabled(!biometricEnabled);
      Toast.show({
        type: "success",
        text1: "Biometric settings updated",
        text2: biometricEnabled
          ? "Biometric authentication has been disabled."
          : "Biometric authentication has been enabled.",
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update biometric settings";
      Toast.show({ type: "error", text1: "Error", text2: message });
    }
  };

  const toggleBudgetAlerts = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings to receive budget alerts.",
        );
        return;
      }
    }
    const { error } = await updateSettings({ budget_alerts_enabled: value });
    if (error) Toast.show({ type: "error", text1: "Error", text2: error });
  };

  const toggleDailyReminder = async (value: boolean) => {
    if (value && !hasPermission) {
      const granted = await requestPermission();
      if (!granted) {
        Alert.alert(
          "Permission Required",
          "Please enable notifications in your device settings.",
        );
        return;
      }
    }
    const { error } = await updateSettings({ daily_reminder_enabled: value });
    if (error) Toast.show({ type: "error", text1: "Error", text2: error });
  };

  const changeBudgetThreshold = () => {
    Alert.prompt(
      "Budget Alert Threshold",
      "Get notified when you reach this % of your budget",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (value?: string) => {
            const threshold = parseInt(value || "80", 10);
            if (threshold < 0 || threshold > 100) {
              Alert.alert("Invalid", "Please enter a value between 0-100");
              return;
            }
            await updateSettings({ budget_threshold_percent: threshold });
          },
        },
      ],
      "plain-text",
      settings?.budget_threshold_percent.toString() || "80",
      "number-pad",
    );
  };

  const handleTriggerBackgroundSync = async () => {
    try {
      // Fire the native background task (runs in worker; logs may not show in Metro)
      await triggerBackgroundSyncTaskForTesting();
      // Run the same sync in the foreground so you see immediate feedback in the toast
      if (!user?.id) {
        Toast.show({
          type: "info",
          text1: "Background sync triggered",
          text2: "No user; background task will skip. Log in to sync.",
        });
        return;
      }
      const result = await syncExpenses(user.id);
      const run: LastBackgroundSyncRun = {
        at: Date.now(),
        pushed: result.pushed,
        pulled: result.pulled,
        success: result.success,
        reason: result.success ? "ok" : "sync_failed",
      };
      await setLastBackgroundSyncRun(run);
      setLastBackgroundSync(run);
      const detail = result.success
        ? `Pushed ${result.pushed}, pulled ${result.pulled}`
        : (result.errors?.join(", ") ?? "Sync failed");
      Toast.show({
        type: result.success ? "success" : "error",
        text1: "Background sync test",
        text2: detail,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to trigger sync";
      Toast.show({
        type: "error",
        text1: "Error triggering background sync",
        text2: message,
      });
    }
  };

  return (
    <ProfileView
      user={user ?? null}
      emailConfirmed={!!user?.email_confirmed_at}
      biometricEnabled={biometricEnabled}
      settings={settings ?? null}
      hasPermission={hasPermission}
      notifLoading={notifLoading}
      colors={{
        background: colors.background,
        text: colors.text,
        tint: colors.primary,
      }}
      onToggleBiometric={toggleBiometric}
      onToggleBudgetAlerts={toggleBudgetAlerts}
      onToggleDailyReminder={toggleDailyReminder}
      onChangeBudgetThreshold={changeBudgetThreshold}
      onRequestPermission={requestPermission}
      onVerifyEmailPress={() => router.push("/auth/verify-email")}
      onTriggerBackgroundSync={handleTriggerBackgroundSync}
      lastBackgroundSync={lastBackgroundSync}
    />
  );
}
