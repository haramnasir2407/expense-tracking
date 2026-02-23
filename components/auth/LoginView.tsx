import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { Ionicons } from "@expo/vector-icons";
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

interface LoginViewProps {
  email: string;
  password: string;
  emailError: string;
  passwordError: string;
  loading: boolean;
  biometricEnabled: boolean;
  colors: { background: string; text: string; tint: string };
  isDark: boolean;
  onEmailChange: (text: string) => void;
  onPasswordChange: (text: string) => void;
  onLogin: () => void;
  onBiometricLogin: () => void;
  onForgotPassword: () => void;
  onSignUp: () => void;
}

export function LoginView({
  email,
  password,
  emailError,
  passwordError,
  loading,
  biometricEnabled,
  colors,
  isDark,
  onEmailChange,
  onPasswordChange,
  onLogin,
  onBiometricLogin,
  onForgotPassword,
  onSignUp,
}: LoginViewProps) {
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
          <View
            style={[
              styles.logoContainer,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name="wallet-outline" size={48} color={colors.tint} />
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Welcome Back
          </Text>
          <Text style={[styles.subtitle, { color: colors.text + "CC" }]}>
            Sign in to your expense tracker
          </Text>
        </View>

        <View style={styles.form}>
          {biometricEnabled && (
            <TouchableOpacity
              style={[
                styles.biometricButton,
                {
                  backgroundColor: colors.tint + "10",
                  borderColor: colors.tint,
                },
              ]}
              onPress={onBiometricLogin}
            >
              <Ionicons name="finger-print" size={24} color={colors.tint} />
              <Text style={[styles.biometricText, { color: colors.tint }]}>
                Login with Biometric
              </Text>
            </TouchableOpacity>
          )}

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
            placeholder="Enter your password"
            autoComplete="password"
            error={passwordError}
          />
          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={onForgotPassword}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
          <AuthButton
            title="Login"
            loading={loading}
            onPress={onLogin}
            containerStyle={styles.loginButton}
          />
          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text + "CC" }]}>
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={onSignUp}>
              <Text style={[styles.footerLink, { color: colors.tint }]}>
                Sign Up
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
  scrollContent: { flexGrow: 1, padding: 24, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: { fontSize: 32, fontWeight: "bold", marginBottom: 8 },
  subtitle: { fontSize: 16 },
  form: { flex: 1 },
  biometricButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 24,
    gap: 12,
  },
  biometricText: { fontSize: 16, fontWeight: "600" },
  forgotPassword: { alignSelf: "flex-end", marginBottom: 24 },
  forgotPasswordText: { fontSize: 14, fontWeight: "600" },
  loginButton: { marginBottom: 16 },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: { fontSize: 14 },
  footerLink: { fontSize: 14, fontWeight: "600" },
});
