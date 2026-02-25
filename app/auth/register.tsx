import { RegisterView } from "@/components/auth/RegisterView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  formatAuthError,
  getPasswordStrength,
  isStrongPassword,
  isValidEmail,
  passwordsMatch,
} from "@/lib/auth-utils";
import { router } from "expo-router";
import React, { useState } from "react";
import Toast from "react-native-toast-message";

export default function RegisterScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { signUp } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  const validateForm = (): boolean => {
    setEmailError("");
    setPasswordError("");
    setConfirmPasswordError("");
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
    } else if (!isStrongPassword(password)) {
      setPasswordError(
        "Password must be at least 8 characters with letters and numbers",
      );
      isValid = false;
    }
    if (!confirmPassword) {
      setConfirmPasswordError("Please confirm your password");
      isValid = false;
    } else if (!passwordsMatch(password, confirmPassword)) {
      setConfirmPasswordError("Passwords do not match");
      isValid = false;
    }
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { error } = await signUp(normalizedEmail, password);
      if (error)
        Toast.show({
          type: "error",
          text1: "Registration failed",
          text2: error.message,
        });
      else
        router.replace({
          pathname: "/auth/verify-email",
          params: { email: normalizedEmail },
        });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2:
          formatAuthError(error as Error)?.message ||
          "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <RegisterView
      email={email}
      password={password}
      confirmPassword={confirmPassword}
      emailError={emailError}
      passwordError={passwordError}
      confirmPasswordError={confirmPasswordError}
      passwordStrength={passwordStrength}
      loading={loading}
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
      onConfirmPasswordChange={(text) => {
        setConfirmPassword(text);
        setConfirmPasswordError("");
      }}
      onRegister={handleRegister}
      onLogin={() => router.back()}
    />
  );
}
