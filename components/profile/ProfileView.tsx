import { ThemedText } from "@/components/primitives/themed-text";
import { LastBackgroundSyncRun } from "@/service/background-sync-task";
import { NotificationSettings } from "@/types/notification";
import { Ionicons } from "@expo/vector-icons";
import { User } from "@supabase/supabase-js";
import { ScrollView, View } from "react-native";
import { AppPressable } from "../primitives/app-pressable";
import { Card } from "../primitives/themed-card";

import { ThemedSwitch } from "../primitives/themed-switch";
import { profileViewStyles as styles } from "./styles";

function formatLastSync(run: LastBackgroundSyncRun): string {
  const now = Date.now();
  const diffMs = now - run.at;
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(run.at).toLocaleDateString();
}

interface ProfileViewProps {
  user: User | null;
  emailConfirmed: boolean;
  biometricEnabled: boolean;
  settings: NotificationSettings | null;
  hasPermission: boolean;
  notifLoading: boolean;
  colors: { background: string; text: string; tint: string };
  isDark: boolean;
  onToggleBiometric: () => void;
  onToggleBudgetAlerts: (value: boolean) => void;
  onToggleDailyReminder: (value: boolean) => void;
  onChangeBudgetThreshold: () => void;
  onRequestPermission: () => void;
  onVerifyEmailPress: () => void;
  onTriggerBackgroundSync: () => void;
  lastBackgroundSync: LastBackgroundSyncRun | null;
}

export function ProfileView({
  user,
  emailConfirmed,
  biometricEnabled,
  settings,
  hasPermission,
  notifLoading,
  colors,
  isDark,
  onToggleBiometric,
  onToggleBudgetAlerts,
  onToggleDailyReminder,
  onChangeBudgetThreshold,
  onRequestPermission,
  onVerifyEmailPress,
  onTriggerBackgroundSync,
  lastBackgroundSync,
}: ProfileViewProps) {
  const thresholdRowBg = isDark ? "#2C2C2E" : "#f0f0f0";

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
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

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Account Status
          </ThemedText>
          <Card
            noShadow
            style={[styles.card, { backgroundColor: colors.background }]}
          >
            <View style={styles.statusRow}>
              <View style={styles.statusItem}>
                <Ionicons
                  name={emailConfirmed ? "checkmark-circle" : "time-outline"}
                  size={24}
                  color={emailConfirmed ? "#00C851" : "#ffbb33"}
                />
                <ThemedText style={styles.statusLabel}>
                  {emailConfirmed ? "Email Verified" : "Email Pending"}
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
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Settings
          </ThemedText>
          <AppPressable
            style={[styles.actionCard, { backgroundColor: colors.background }]}
            onPress={onToggleBiometric}
            rightIcon="chevron-forward"
          >
            <View style={styles.actionLeft}>
              <Ionicons name="finger-print" size={24} color={colors.tint} />
              <ThemedText style={styles.actionTitle}>
                {biometricEnabled ? "Disable" : "Enable"} Biometric Login
              </ThemedText>
            </View>
          </AppPressable>

          {!emailConfirmed && (
            <AppPressable
              style={[
                styles.actionCard,
                { backgroundColor: colors.background },
              ]}
              onPress={onVerifyEmailPress}
              rightIcon="chevron-forward"
            >
              <View style={styles.actionLeft}>
                <Ionicons name="mail" size={24} color={colors.tint} />
                <ThemedText style={styles.actionTitle}>
                  Verify Email Address
                </ThemedText>
              </View>
            </AppPressable>
          )}
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Notifications & Alerts
          </ThemedText>
          <Card
            noShadow
            style={[styles.card, { backgroundColor: colors.background }]}
          >
            {!hasPermission && (
              <AppPressable
                style={styles.permissionBanner}
                onPress={onRequestPermission}
              >
                <Ionicons name="notifications-off" size={20} color="#FF6B6B" />
                <ThemedText style={styles.permissionText}>
                  Enable notifications
                </ThemedText>
              </AppPressable>
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
              <ThemedSwitch
                value={settings?.budget_alerts_enabled ?? true}
                onValueChange={onToggleBudgetAlerts}
                disabled={notifLoading}
                trackColor={{ false: "#767577", true: colors.tint + "60" }}
                thumbColor={
                  settings?.budget_alerts_enabled ? colors.tint : "#f4f3f4"
                }
              />
            </View>

            {settings?.budget_alerts_enabled && (
              <AppPressable
                style={[
                  styles.thresholdRow,
                  { backgroundColor: thresholdRowBg },
                ]}
                onPress={onChangeBudgetThreshold}
                rightIcon="create-outline"
              >
                <ThemedText style={styles.thresholdText}>
                  Alert threshold: {settings?.budget_threshold_percent || 80}%
                </ThemedText>
              </AppPressable>
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
              <ThemedSwitch
                value={settings?.daily_reminder_enabled ?? false}
                onValueChange={onToggleDailyReminder}
                disabled={notifLoading}
                trackColor={{ false: "#767577", true: colors.tint + "60" }}
                thumbColor={
                  settings?.daily_reminder_enabled ? colors.tint : "#f4f3f4"
                }
              />
            </View>
          </Card>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            About
          </ThemedText>
          <Card
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
          </Card>
          <Card
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
          </Card>
          <ThemedText
            style={[styles.infoText, { marginTop: 12, opacity: 0.8 }]}
          >
            Last background sync:{" "}
            {lastBackgroundSync
              ? `${formatLastSync(lastBackgroundSync)}${
                  lastBackgroundSync.success != null &&
                  lastBackgroundSync.pushed != null &&
                  lastBackgroundSync.pulled != null
                    ? ` (pushed ${lastBackgroundSync.pushed}, pulled ${lastBackgroundSync.pulled})`
                    : ""
                }${
                  lastBackgroundSync.reason && lastBackgroundSync.reason !== "ok"
                    ? ` [${lastBackgroundSync.reason}]`
                    : ""
                }`
              : "Never"}
          </ThemedText>
          <AppPressable
            style={[
              styles.actionCard,
              { backgroundColor: colors.background, marginTop: 16 },
            ]}
            onPress={onTriggerBackgroundSync}
            rightIcon="chevron-forward"
          >
            <View style={styles.actionLeft}>
              <Ionicons name="sync" size={24} color={colors.tint} />
              <ThemedText style={styles.actionTitle}>
                Trigger background sync (test)
              </ThemedText>
            </View>
          </AppPressable>
        </View>
      </View>
    </ScrollView>
  );
}
