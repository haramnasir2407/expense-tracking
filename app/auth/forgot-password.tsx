import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError, isValidEmail } from "@/lib/auth-utils";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert } from "react-native";

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
    }
    if (!isValidEmail(email)) {
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
      if (error) Alert.alert("Error", error.message);
      else setEmailSent(true);
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
    <ForgotPasswordView
      email={email}
      emailError={emailError}
      loading={loading}
      emailSent={emailSent}
      colors={colors}
      isDark={colorScheme === "dark"}
      onEmailChange={(text) => {
        setEmail(text);
        setEmailError("");
      }}
      onResetPassword={handleResetPassword}
      onBackToLogin={() => router.back()}
    />
  );
}
