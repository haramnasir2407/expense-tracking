import { ForgotPasswordView } from "@/components/auth/ForgotPasswordView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError, isValidEmail } from "@/utils/auth";
import { router } from "expo-router";
import React, { useState } from "react";
import Toast from "react-native-toast-message";

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
      if (error)
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      else {
        setEmailSent(true);
        Toast.show({
          type: "success",
          text1: "Reset email sent",
        });
      }
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
