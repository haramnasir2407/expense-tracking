import { BiometricSetup } from "@/components/BiometricSetup";
import { AuthButton } from "@/components/auth/AuthButton";
import { AuthInput } from "@/components/auth/AuthInput";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError, isValidEmail } from "@/lib/auth-utils";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { signIn, authenticateWithBiometric, biometricEnabled, user } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showBiometricSetup, setShowBiometricSetup] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace("/(tabs)");
    }
  }, [user]);

  async function handleBiometricLogin() {
    try {
      const success = await authenticateWithBiometric();
      if (success) {
        router.replace("/(tabs)");
      } else {
        Alert.alert(
          "Authentication Failed",
          "Please try again or use your password.",
        );
      }
    } catch (error) {
      console.error("Biometric auth error:", error);
    }
  }

  function validateForm(): boolean {
    let isValid = true;

    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Please enter a valid email");
      isValid = false;
    }

    if (!password) {
      setPasswordError("Password is required");
      isValid = false;
    }

    return isValid;
  }

  async function handleLogin() {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const { error } = await signIn(email, password);

      if (error) {
        Alert.alert("Login Failed", error.message);
      } else {
        // Show biometric setup on first successful login
        if (!biometricEnabled) {
          console.log("Showing biometric setup: ", biometricEnabled);
          setShowBiometricSetup(true);
        } else {
          router.replace("/(tabs)");
        }
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
          {/* UI for when biometric is enabled */}
          {biometricEnabled && (
            <TouchableOpacity
              style={[
                styles.biometricButton,
                {
                  backgroundColor: colors.tint + "10",
                  borderColor: colors.tint,
                },
              ]}
              onPress={handleBiometricLogin}
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
              setEmail(text);
              setEmailError("");
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
              setPassword(text);
              setPasswordError("");
            }}
            placeholder="Enter your password"
            autoComplete="password"
            error={passwordError}
          />

          <TouchableOpacity
            style={styles.forgotPassword}
            onPress={() => router.push("/auth/forgot-password")}
          >
            <Text style={[styles.forgotPasswordText, { color: colors.tint }]}>
              Forgot Password?
            </Text>
          </TouchableOpacity>

          <AuthButton
            title="Login"
            loading={loading}
            onPress={handleLogin}
            containerStyle={styles.loginButton}
          />

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: colors.text + "CC" }]}>
              Don&apos;t have an account?{" "}
            </Text>
            <TouchableOpacity onPress={() => router.push("/auth/register")}>
              <Text style={[styles.footerLink, { color: colors.tint }]}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Add biometric setup */}
      <BiometricSetup
        visible={showBiometricSetup}
        onClose={() => {
          setShowBiometricSetup(false);
          router.replace("/(tabs)");
        }}
      />
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
    paddingTop: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  form: {
    flex: 1,
  },
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
  biometricText: {
    fontSize: 16,
    fontWeight: "600",
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  loginButton: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
  },
  footerLink: {
    fontSize: 14,
    fontWeight: "600",
  },
});
