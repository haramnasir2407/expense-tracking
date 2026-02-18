import { Colors } from "@/constants/theme";
import { useAuth } from "@/contexts/AuthContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import React, { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface BiometricSetupProps {
  visible: boolean;
  onClose: () => void;
}

export function BiometricSetup({ visible, onClose }: BiometricSetupProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { setBiometricEnabled } = useAuth();
  const [biometricType, setBiometricType] = useState<string>("biometric");
  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  async function checkBiometricAvailability() {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    setIsAvailable(compatible && enrolled);

    if (compatible && enrolled) {
      const types =
        await LocalAuthentication.supportedAuthenticationTypesAsync();
      if (
        types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
        )
      ) {
        setBiometricType(
          Platform.OS === "ios" ? "Face ID" : "Face Recognition",
        );
      } else if (
        types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)
      ) {
        setBiometricType(Platform.OS === "ios" ? "Touch ID" : "Fingerprint");
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        setBiometricType("Iris Recognition");
      }
    }
  }

  async function handleEnable() {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Enable ${biometricType}`,
        fallbackLabel: "Use passcode",
        disableDeviceFallback: false,
      });

      if (result.success) {
        await setBiometricEnabled(true);
        onClose();
      }
    } catch (error) {
      console.error("Error enabling biometric:", error);
    }
  }

  function handleSkip() {
    onClose();
  }

  if (!isAvailable) {
    return null;
  }

  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    if (biometricType.includes("Face")) {
      return "scan-outline";
    } else if (
      biometricType.includes("Fingerprint") ||
      biometricType.includes("Touch")
    ) {
      return "finger-print-outline";
    } else {
      return "eye-outline";
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View
          style={[styles.container, { backgroundColor: colors.background }]}
        >
          <View
            style={[
              styles.iconContainer,
              { backgroundColor: colors.tint + "20" },
            ]}
          >
            <Ionicons name={getIcon()} size={48} color={colors.tint} />
          </View>

          <Text style={[styles.title, { color: colors.text }]}>
            Enable {biometricType}
          </Text>

          <Text style={[styles.description, { color: colors.text + "CC" }]}>
            Use {biometricType} for quick and secure access to your expense
            tracker.
          </Text>

          <TouchableOpacity
            style={[styles.enableButton, { backgroundColor: colors.tint }]}
            onPress={handleEnable}
          >
            <Text style={styles.enableButtonText}>Enable {biometricType}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={[styles.skipButtonText, { color: colors.text }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  enableButton: {
    width: "100%",
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  enableButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    padding: 12,
  },
  skipButtonText: {
    fontSize: 16,
  },
});
