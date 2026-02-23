import { ProfileView } from "@/components/profile/ProfileView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import React from "react";
import { Alert } from "react-native";

export default function ProfileScreen() {
  const { user, biometricEnabled, setBiometricEnabled } = useAuth();
  const {
    settings,
    hasPermission,
    requestPermission,
    updateSettings,
    loading: notifLoading,
  } = useNotifications();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const toggleBiometric = async () => {
    try {
      await setBiometricEnabled(!biometricEnabled);
      Alert.alert(
        "Success",
        biometricEnabled
          ? "Biometric authentication has been disabled"
          : "Biometric authentication has been enabled",
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to update biometric settings";
      Alert.alert("Error", message);
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
    if (error) Alert.alert("Error", error);
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
    if (error) Alert.alert("Error", error);
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

  return (
    <ProfileView
      user={user ?? null}
      emailConfirmed={!!user?.email_confirmed_at}
      biometricEnabled={biometricEnabled}
      settings={settings ?? null}
      hasPermission={hasPermission}
      notifLoading={notifLoading}
      colors={colors}
      isDark={colorScheme === "dark"}
      onToggleBiometric={toggleBiometric}
      onToggleBudgetAlerts={toggleBudgetAlerts}
      onToggleDailyReminder={toggleDailyReminder}
      onChangeBudgetThreshold={changeBudgetThreshold}
      onRequestPermission={requestPermission}
      onVerifyEmailPress={() => router.push("/auth/verify-email")}
    />
  );
}
