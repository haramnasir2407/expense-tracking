import { AuthButton } from "@/components/auth/AuthButton";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { verifyEmailStyles as styles } from "./styles";

interface VerifyEmailViewProps {
  email: string;
  resendLoading: boolean;
  resendCooldown: number;
  checking: boolean;
  colors: { background: string; text: string; tint: string };
  isDark: boolean;
  onCheckVerification: () => void;
  onResendEmail: () => void;
  onSignOut: () => void;
  onSkip: () => void;
}

export function VerifyEmailView({
  email,
  resendLoading,
  resendCooldown,
  checking,
  colors,
  isDark,
  onCheckVerification,
  onResendEmail,
  onSignOut,
  onSkip,
}: VerifyEmailViewProps) {
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
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
          {email || "your email"}
        </Text>
        <Text style={[styles.instructions, { color: colors.text + "99" }]}>
          Click the link in the email to verify your account. If you don&apos;t
          see the email, check your spam folder.
        </Text>

        <View style={styles.buttons}>
          <AuthButton
            title="I've Verified My Email"
            loading={checking}
            onPress={onCheckVerification}
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
            onPress={onResendEmail}
            containerStyle={styles.button}
          />
          <TouchableOpacity style={styles.signOutButton} onPress={onSignOut}>
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

        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={[styles.skipText, { color: colors.tint }]}>
            Skip for now
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

