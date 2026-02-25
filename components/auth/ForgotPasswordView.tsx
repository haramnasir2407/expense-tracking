import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { forgotPasswordStyles as styles } from "./styles";

interface ForgotPasswordViewProps {
  email: string;
  emailError: string;
  loading: boolean;
  emailSent: boolean;
  colors: { background: string; text: string; tint: string };
  isDark: boolean;
  onEmailChange: (text: string) => void;
  onResetPassword: () => void;
  onBackToLogin: () => void;
}

export function ForgotPasswordView({
  email,
  emailError,
  loading,
  emailSent,
  colors,
  isDark,
  onEmailChange,
  onResetPassword,
  onBackToLogin,
}: ForgotPasswordViewProps) {
  if (emailSent) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar style={isDark ? "light" : "dark"} />
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
            onPress={onBackToLogin}
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
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
            onChangeText={onEmailChange}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
          />
          <AuthButton
            title="Send Reset Link"
            loading={loading}
            onPress={onResetPassword}
            containerStyle={styles.submitButton}
          />
          <AuthButton
            title="Back to Login"
            variant="outline"
            onPress={onBackToLogin}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

