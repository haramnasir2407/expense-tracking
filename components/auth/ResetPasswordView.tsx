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
import { resetPasswordStyles as styles } from "./styles";

export interface PasswordStrengthDisplay {
  strength: number;
  label: string;
  color: string;
}

interface ResetPasswordViewProps {
  password: string;
  confirmPassword: string;
  passwordError: string;
  confirmPasswordError: string;
  passwordStrength: PasswordStrengthDisplay;
  loading: boolean;
  sessionReady: boolean;
  colors: { background: string; text: string; tint: string };
  isDark: boolean;
  onPasswordChange: (text: string) => void;
  onConfirmChange: (text: string) => void;
  onResetPassword: () => void;
}

export function ResetPasswordView({
  password,
  confirmPassword,
  passwordError,
  confirmPasswordError,
  passwordStrength,
  loading,
  sessionReady,
  colors,
  isDark,
  onPasswordChange,
  onConfirmChange,
  onResetPassword,
}: ResetPasswordViewProps) {
  if (!sessionReady) {
    return (
        <View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              justifyContent: "center",
              alignItems: "center",
            },
          ]}
        >
        <StatusBar style={isDark ? "light" : "dark"} />
        <Text style={[styles.subtitle, { color: colors.text }]}>
          Setting up your session...
        </Text>
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
            <Ionicons
              name="lock-closed-outline"
              size={40}
              color={colors.tint}
            />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Set New Password
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + "CC" }]}>
            Enter a new password for your account
          </Text>
        </View>

        <View style={styles.form}>
          <AuthInput
            label="New Password"
            icon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={onPasswordChange}
            placeholder="Create a strong password"
            autoComplete="password-new"
            error={passwordError}
          />
          {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <View style={styles.strengthBarContainer}>
                <View
                  style={[
                    styles.strengthBar,
                    {
                      width: `${(Math.min(passwordStrength.strength, 4) / 4) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.strengthText, { color: passwordStrength.color }]}
              >
                {passwordStrength.label}
              </Text>
            </View>
          )}
          <AuthInput
            label="Confirm New Password"
            icon="lock-closed-outline"
            isPassword
            value={confirmPassword}
            onChangeText={onConfirmChange}
            placeholder="Re-enter your password"
            autoComplete="password-new"
            error={confirmPasswordError}
          />
          <AuthButton
            title="Reset Password"
            loading={loading}
            onPress={onResetPassword}
            containerStyle={styles.submitButton}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
