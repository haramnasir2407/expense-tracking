import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/contexts/NotificationContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";

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

  async function toggleBiometric() {
    try {
      await setBiometricEnabled(!biometricEnabled);
      Alert.alert(
        "Success",
        biometricEnabled
          ? "Biometric authentication has been disabled"
          : "Biometric authentication has been enabled",
      );
    } catch (error: any) {
      Alert.alert(
        "Error",
        error.message || "Failed to update biometric settings",
      );
    }
  }

  async function toggleBudgetAlerts(value: boolean) {
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
    if (error) {
      Alert.alert("Error", error);
    }
  }

  async function toggleDailyReminder(value: boolean) {
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
    if (error) {
      Alert.alert("Error", error);
    }
  }

  async function changeBudgetThreshold() {
    Alert.prompt(
      "Budget Alert Threshold",
      "Get notified when you reach this % of your budget",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Save",
          onPress: async (value?: string) => {
            const threshold = parseInt(value || "80");
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
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ThemedView style={styles.content}>
        <View style={styles.header}>
          <View
            style={[
              styles.avatarContainer,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name="person" size={40} color={colors.tint} />
          </View>
          <ThemedText type="title" style={styles.welcomeText}>
            Welcome Back!
          </ThemedText>
          <ThemedText style={styles.emailText}>{user?.email}</ThemedText>
        </View>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account Status
          </ThemedText>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons
                  name={
                    user?.email_confirmed_at
                      ? "checkmark-circle"
                      : "time-outline"
                  }
                  size={24}
                  color={user?.email_confirmed_at ? "#00C851" : "#ffbb33"}
                />
                <ThemedText style={styles.statusLabel}>
                  {user?.email_confirmed_at
                    ? "Email Verified"
                    : "Email Pending"}
                </ThemedText>
              </View>
              <View style={styles.statusItem}>
                <Ionicons
                  name={
                    biometricEnabled ? "finger-print" : "finger-print-outline"
                  }
                  size={24}
                  color={biometricEnabled ? colors.tint : colors.text + "60"}
                />
                <ThemedText style={styles.statusLabel}>
                  {biometricEnabled ? "Biometric On" : "Biometric Off"}
                </ThemedText>
              </View>
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>

          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: colors.background }]}
            onPress={toggleBiometric}
          >
            <View style={styles.actionLeft}>
              <Ionicons name="finger-print" size={24} color={colors.tint} />
              <ThemedText style={styles.actionTitle}>
                {biometricEnabled ? "Disable" : "Enable"} Biometric Login
              </ThemedText>
            </View>
            <Ionicons
              name="chevron-forward"
              size={20}
              color={colors.text + "60"}
            />
          </TouchableOpacity>

          {!user?.email_confirmed_at && (
            <TouchableOpacity
              style={[
                styles.actionCard,
                { backgroundColor: colors.background },
              ]}
              onPress={() => router.push("/auth/verify-email")}
            >
              <View style={styles.actionLeft}>
                <Ionicons name="mail" size={24} color={colors.tint} />
                <ThemedText style={styles.actionTitle}>
                  Verify Email Address
                </ThemedText>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={colors.text + "60"}
              />
            </TouchableOpacity>
          )}
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notifications & Alerts
          </ThemedText>

          <View style={[styles.card, { backgroundColor: colors.background }]}>
            {!hasPermission && (
              <TouchableOpacity
                style={styles.permissionBanner}
                onPress={requestPermission}
              >
                <Ionicons name="notifications-off" size={20} color="#FF6B6B" />
                <ThemedText style={styles.permissionText}>
                  Enable notifications
                </ThemedText>
              </TouchableOpacity>
            )}

            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="warning" size={20} color={colors.tint} />
                    <ThemedText style={styles.settingTitle}>
                      Budget Alerts
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.settingSubtitle}>
                    Get notified when approaching budget limit
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings?.budget_alerts_enabled ?? true}
                onValueChange={toggleBudgetAlerts}
                disabled={notifLoading}
                trackColor={{ false: "#767577", true: colors.tint + "60" }}
                thumbColor={
                  settings?.budget_alerts_enabled ? colors.tint : "#f4f3f4"
                }
              />
            </View>

            {settings?.budget_alerts_enabled && (
              <TouchableOpacity
                style={[
                  styles.thresholdRow,
                  {
                    backgroundColor:
                      colorScheme === "dark" ? "#2C2C2E" : "#f0f0f0",
                  },
                ]}
                onPress={changeBudgetThreshold}
              >
                <ThemedText style={styles.thresholdText}>
                  Alert threshold: {settings?.budget_threshold_percent || 80}%
                </ThemedText>
                <Ionicons
                  name="create-outline"
                  size={16}
                  color={colors.text + "60"}
                />
              </TouchableOpacity>
            )}

            <View style={[styles.settingRow, { marginTop: 16 }]}>
              <View style={styles.settingLeft}>
                <View style={styles.settingTextContainer}>
                  <View style={styles.settingTitleRow}>
                    <Ionicons name="time" size={20} color={colors.tint} />
                    <ThemedText style={styles.settingTitle}>
                      Daily Reminder
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.settingSubtitle}>
                    Remind me to log expenses (8:00 PM)
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={settings?.daily_reminder_enabled ?? false}
                onValueChange={toggleDailyReminder}
                disabled={notifLoading}
                trackColor={{ false: "#767577", true: colors.tint + "60" }}
                thumbColor={
                  settings?.daily_reminder_enabled ? colors.tint : "#f4f3f4"
                }
              />
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <View
            style={[styles.infoCard, { backgroundColor: colors.tint + "10" }]}
          >
            <Ionicons
              name="shield-checkmark-outline"
              size={24}
              color={colors.tint}
            />
            <ThemedText style={styles.infoText}>
              Your data is securely stored and only accessible to you with
              end-to-end encryption.
            </ThemedText>
          </View>
          <View
            style={[
              styles.infoCard,
              { backgroundColor: colors.tint + "10", marginTop: 12 },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={colors.tint}
            />
            <ThemedText style={styles.infoText}>
              Track your expenses efficiently with categories, receipts, and
              detailed insights.
            </ThemedText>
          </View>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
    marginTop: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  welcomeText: {
    marginBottom: 8,
  },
  emailText: {
    opacity: 0.7,
    fontSize: 14,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statusItem: {
    alignItems: "center",
    gap: 8,
  },
  statusLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  actionCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionTitle: {
    fontSize: 16,
  },
  infoCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.9,
  },
  permissionBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#FF6B6B20",
    borderRadius: 8,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 13,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  settingSubtitle: {
    fontSize: 12,
    opacity: 0.6,
  },
  thresholdRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  thresholdText: {
    fontSize: 13,
    opacity: 0.8,
  },
});
