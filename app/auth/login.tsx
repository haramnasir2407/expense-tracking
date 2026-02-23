import { LoginView } from "@/components/auth/LoginView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError, isValidEmail } from "@/lib/auth-utils";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

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

  useEffect(() => {
    if (user) router.replace("/(tabs)");
  }, [user]);

  const handleBiometricLogin = async () => {
    try {
      const success = await authenticateWithBiometric();
      if (success) router.replace("/(tabs)");
      else
        Alert.alert(
          "Authentication Failed",
          "Please try again or use your password.",
        );
    } catch {
      // ignore
    }
  };

  const validateForm = (): boolean => {
    setEmailError("");
    setPasswordError("");
    let isValid = true;
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
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) Alert.alert("Login Failed", error.message);
      else if (biometricEnabled) router.replace("/(tabs)");
    } catch (error) {
      Alert.alert(
        "Error",
        formatAuthError(error as Error)?.message ||
          "An unexpected error occurred. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LoginView
      email={email}
      password={password}
      emailError={emailError}
      passwordError={passwordError}
      loading={loading}
      biometricEnabled={biometricEnabled}
      colors={colors}
      isDark={colorScheme === "dark"}
      onEmailChange={(text) => {
        setEmail(text);
        setEmailError("");
      }}
      onPasswordChange={(text) => {
        setPassword(text);
        setPasswordError("");
      }}
      onLogin={handleLogin}
      onBiometricLogin={handleBiometricLogin}
      onForgotPassword={() => router.push("/auth/forgot-password")}
      onSignUp={() => router.push("/auth/register")}
    />
  );
}
