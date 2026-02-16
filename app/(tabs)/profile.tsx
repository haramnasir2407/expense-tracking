import { Ionicons } from "@expo/vector-icons";
import {
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, biometricEnabled, setBiometricEnabled } = useAuth();
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
});
