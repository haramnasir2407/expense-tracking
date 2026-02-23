import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface PasswordStrength {
  strength: number;
  label: string;
  color: string;
}

interface RegisterViewProps {
  email: string;
  password: string;
  confirmPassword: string;
  emailError: string;
  passwordError: string;
  confirmPasswordError: string;
  passwordStrength: PasswordStrength;
  loading: boolean;
  colors: { background: string; text: string; tint: string };
  isDark: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onConfirmPasswordChange: (text: string) => void;
  onRegister: () => void;
  onLogin: () => void;
}

export function RegisterView({
  email,
  password,
  confirmPassword,
  emailError,
  passwordError,
  confirmPasswordError,
  passwordStrength,
  loading,
  colors,
  isDark,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onRegister,
  onLogin,
}: RegisterViewProps) {
  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style={isDark ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            Create Account
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + "CC" }]}>
            Start tracking your expenses today
          </Text>
        </View>
        <View style={styles.form}>
          <AuthInput
            label="Email"
            icon="mail-outline"
            value={email}
            onChangeText={(text) => {
              onEmailChange(text);
            }}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoComplete="email"
            error={emailError}
          />
          <AuthInput
            label="Password"
            icon="lock-closed-outline"
            isPassword
            value={password}
            onChangeText={(text) => {
              onPasswordChange(text);
            }}
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
            label="Confirm Password"
            icon="lock-closed-outline"
            isPassword
            value={confirmPassword}
            onChangeText={(text) => {
              onConfirmPasswordChange(text);
            }}
            placeholder="Re-enter your password"
            autoComplete="password-new"
            error={confirmPasswordError}
          />
          <AuthButton
            title="Create Account"
            loading={loading}
            onPress={onRegister}
            containerStyle={styles.registerButton}
          />
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text + "CC" }]}>
              Already have an account?{" "}
            </Text>
            <TouchableOpacity onPress={onLogin}>
              <Text style={[styles.footerLink, { color: colors.tint }]}>
                Login
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { flex: 1 },
  strengthContainer: { marginBottom: 16 },
  strengthBarContainer: {
    height: 4,
    backgroundColor: "#e0e0e0",
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 8,
  },
  strengthBar: { height: "100%", borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: "600" },
  registerButton: { marginBottom: 16 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "600" },
});
