import { VerifyEmailView } from "@/components/auth/VerifyEmailView";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, signOut } = useAuth();
  const { email } = useLocalSearchParams<{ email?: string }>();
  const signupEmail = typeof email === "string" ? email : undefined;

  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(
        () => setResendCooldown(resendCooldown - 1),
        1000,
      );
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (user?.email_confirmed_at) router.replace("/(tabs)");
  }, [user]);

  async function handleResendEmail() {
    if (!signupEmail) {
      Alert.alert(
        "Missing email",
        "We couldn't determine your email address. Please go back and register again.",
      );
      return;
    }
    setResendLoading(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: signupEmail,
      });
      if (error) Alert.alert("Error", error.message);
      else {
        Alert.alert(
          "Email Sent",
          "Verification email has been resent. Please check your inbox.",
        );
        setResendCooldown(60);
      }
    } catch (error) {
      Alert.alert(
        "Error",
        formatAuthError(error as Error)?.message ||
          "Failed to resend verification email. Please try again.",
      );
    } finally {
      setResendLoading(false);
    }
  }

  async function handleCheckVerification() {
    setChecking(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.refreshSession();
      if (session?.user?.email_confirmed_at) {
        Alert.alert("Success", "Your email has been verified!", [
          { text: "OK", onPress: () => router.replace("/(tabs)") },
        ]);
      } else {
        Alert.alert(
          "Not Verified Yet",
          "Please click the verification link in your email and try again.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        formatAuthError(error as Error)?.message ||
          "Failed to check verification status. Please try again.",
      );
    } finally {
      setChecking(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    router.replace("/auth/login");
  }

  return (
    <VerifyEmailView
      email={signupEmail ?? ""}
      resendLoading={resendLoading}
      resendCooldown={resendCooldown}
      checking={checking}
      colors={colors}
      isDark={colorScheme === "dark"}
      onCheckVerification={handleCheckVerification}
      onResendEmail={handleResendEmail}
      onSignOut={handleSignOut}
      onSkip={() => router.replace("/(tabs)")}
    />
  );
}
