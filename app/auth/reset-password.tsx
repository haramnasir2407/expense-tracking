import { ResetPasswordView } from "@/components/auth/ResetPasswordView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getPasswordStrength,
  isStrongPassword,
  passwordsMatch,
} from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

export default function ResetPasswordScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { updatePassword } = useAuth();
  const params = useLocalSearchParams();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    async function setupSession() {
      try {
        const accessToken = params.access_token as string | undefined;
        const refreshToken = params.refresh_token as string | undefined;
        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (error) {
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to validate reset link. Please request a new one.",
            });
            router.replace("/auth/forgot-password");
          } else {
            setSessionReady(true);
          }
        } else {
          Toast.show({
            type: "error",
            text1: "Invalid link",
            text2: "Use the link from your email to reset your password.",
          });
          router.replace("/auth/forgot-password");
        }
      } catch (error) {
        console.error("Error setting up session:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Something went wrong. Please try again.",
        });
        router.replace("/auth/forgot-password");
      }
    }
    setupSession();
  }, [params]);

  function validateForm(): boolean {
    let isValid = true;
    setPasswordError("");
    setConfirmPasswordError("");
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
  }

  async function handleResetPassword() {
    if (!sessionReady) {
      Toast.show({
        type: "info",
        text1: "Please wait",
        text2: "Setting up your session...",
      });
      return;
    }
    if (!validateForm()) return;
    setLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error)
        Toast.show({
          type: "error",
          text1: "Error",
          text2: error.message,
        });
      else {
        Toast.show({
          type: "success",
          text1: "Password reset",
          text2: "Your password has been reset successfully.",
        });
        router.replace("/auth/login");
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetPasswordView
      password={password}
      confirmPassword={confirmPassword}
      passwordError={passwordError}
      confirmPasswordError={confirmPasswordError}
      passwordStrength={passwordStrength}
      loading={loading}
      sessionReady={sessionReady}
      colors={colors}
      isDark={colorScheme === "dark"}
      onPasswordChange={(text) => {
        setPassword(text);
        setPasswordError("");
      }}
      onConfirmChange={(text) => {
        setConfirmPassword(text);
        setConfirmPasswordError("");
      }}
      onResetPassword={handleResetPassword}
    />
  );
}
