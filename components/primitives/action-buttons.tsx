import { Colors, fontSize, radius, spacing } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { StyleProp, ViewStyle } from "react-native";
import { StyleSheet } from "react-native";
import { Button, Text, XStack } from "tamagui";

interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  cancelLabel?: string;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  cancelButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
}

export function ActionButtons({
  onCancel,
  onSubmit,
  submitLabel,
  cancelLabel = "Cancel",
  loading,
  containerStyle,
  submitButtonDisabled,
  cancelButtonDisabled,
}: ActionButtonsProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const isDark = colorScheme === "dark";

  const cancelBg = isDark
    ? Colors.dark.cancelButtonBg
    : Colors.light.cancelButtonBg;
  const cancelTextColor = isDark
    ? Colors.dark.cancelButtonColor
    : Colors.light.cancelButtonColor;
  const isSubmitDisabled = !!loading || !!submitButtonDisabled;

  return (
    <XStack style={containerStyle as any}>
      <Button
        unstyled
        style={[styles.button, { backgroundColor: cancelBg }] as any}
        onPress={onCancel}
        disabled={cancelButtonDisabled}
      >
        <Text style={[styles.buttonText, { color: cancelTextColor }] as any}>
          {cancelLabel}
        </Text>
      </Button>

      <Button
        unstyled
        style={
          [
            styles.button,
            { backgroundColor: colors.tint },
            isSubmitDisabled && styles.disabled,
          ] as any
        }
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <Text style={[styles.buttonText, styles.submitText] as any}>
          {submitLabel}
        </Text>
      </Button>
    </XStack>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    padding: spacing.xl,
    borderRadius: radius.sm * 2,
    alignItems: "center",
  },
  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: "600",
  },
  submitText: {
    color: "white",
  },
  disabled: {
    opacity: 0.5,
  },
});
