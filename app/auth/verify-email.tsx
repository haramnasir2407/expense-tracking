import { AuthButton } from "@/components/auth/AuthButton";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { formatAuthError } from "@/lib/auth-utils";
import { supabase } from "@/lib/supabase";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function VerifyEmailScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { user, signOut, session } = useAuth();

  // Get email passed from the register screen so we don't rely on a session
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
    // Check if user is already verified
    // ? where is this being set?
    if (user?.email_confirmed_at) {
      router.replace("/(tabs)");
    }
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

      if (error) {
        Alert.alert("Error", error.message);
      } else {
        Alert.alert(
          "Email Sent",
          "Verification email has been resent. Please check your inbox.",
        );
        setResendCooldown(60); // 60 second cooldown
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
          {
            text: "OK",
            onPress: () => router.replace("/(tabs)"),
          },
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <View style={styles.content}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: colors.tint + "20" },
          ]}
        >
          <Ionicons name="mail-outline" size={64} color={colors.tint} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Verify Your Email
        </Text>

        <Text style={[styles.message, { color: colors.text + "CC" }]}>
          We&apos;ve sent a verification link to
        </Text>

        <Text style={[styles.email, { color: colors.text }]}>
          {signupEmail || "your email"}
        </Text>

        <Text style={[styles.instructions, { color: colors.text + "99" }]}>
          Click the link in the email to verify your account. If you don&apos;t
          see the email, check your spam folder.
        </Text>

        <View style={styles.buttons}>
          <AuthButton
            title="I've Verified My Email"
            loading={checking}
            onPress={handleCheckVerification}
            containerStyle={styles.button}
          />

          <AuthButton
            title={
              resendCooldown > 0
                ? `Resend in ${resendCooldown}s`
                : "Resend Verification Email"
            }
            variant="outline"
            loading={resendLoading}
            disabled={resendCooldown > 0}
            onPress={handleResendEmail}
            containerStyle={styles.button}
          />

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Text style={[styles.signOutText, { color: colors.text + "99" }]}>
              Sign out and use a different email
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.infoBox, { backgroundColor: colors.tint + "10" }]}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.tint}
          />
          <Text style={[styles.infoText, { color: colors.text + "CC" }]}>
            You can still use the app while waiting for verification, but some
            features may be limited.
          </Text>
        </View>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => router.replace("/(tabs)")}
        >
          <Text style={[styles.skipText, { color: colors.tint }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 16,
  },
  instructions: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  buttons: {
    width: "100%",
    maxWidth: 400,
  },
  button: {
    marginBottom: 12,
  },
  signOutButton: {
    padding: 12,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
  },
  infoBox: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
    gap: 12,
    width: "100%",
    maxWidth: 400,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  skipButton: {
    padding: 16,
    marginTop: 16,
  },
  skipText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
