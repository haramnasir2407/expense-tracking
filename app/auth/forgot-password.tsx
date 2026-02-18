import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError, isValidEmail } from "@/lib/auth-utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

export default function ForgotPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { resetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  function validateForm(): boolean {
    setEmailError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      return false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email");
      return false;
    }

    return true;
  }

  async function handleResetPassword() {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await resetPassword(email);

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        setEmailSent(true);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        formatAuthError(error as Error)?.message ||
          "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
        <View style={styles.successContainer}>
          <View
            style={[
              styles.successIcon,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name="mail-outline" size={48} color={colors.tint} />
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Check Your Email
          </Text>
          <Text style={[styles.successMessage, { color: colors.text + "CC" }]}>
            We&apos;ve sent password reset instructions to{" "}
            <Text style={{ fontWeight: "600" }}>{email}</Text>
          </Text>
          <Text style={[styles.successNote, { color: colors.text + "99" }]}>
            If you don&apos;t see the email, check your spam folder.
          </Text>
          <AuthButton
            title="Back to Login"
            variant="outline"
            onPress={() => router.back()}
            containerStyle={styles.backButton}
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name="key-outline" size={40} color={colors.tint} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + "CC" }]}>
            No worries, we&apos;ll send you reset instructions.
          </Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setEmailError("");
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
          />

          <AuthButton
            title="Send Reset Link"
            loading={loading}
            onPress={handleResetPassword}
            containerStyle={styles.submitButton}
          />

          <AuthButton
            title="Back to Login"
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 20,
  },
  form: {
    flex: 1,
  },
  submitButton: {
    marginBottom: 12,
  },
  successContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  successIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 12,
    paddingHorizontal: 20,
    lineHeight: 24,
  },
  successNote: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  backButton: {
    width: "100%",
    maxWidth: 300,
  },
});
