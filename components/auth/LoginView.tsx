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
  TouchableOpacity,
  View,
} from "react-native";
import { loginStyles as styles } from "./styles";

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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
