import type { StyleProp, TextStyle, ViewStyle } from "react-native";
import { Button, Text, XStack } from "tamagui";

interface ActionButtonsProps {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  loading?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  cancelButtonStyle?: StyleProp<ViewStyle>;
  submitButtonStyle?: StyleProp<ViewStyle>;
  cancelButtonDisabled?: boolean;
  submitButtonDisabled?: boolean;
  cancelButtonTextStyle?: StyleProp<TextStyle>;
  submitButtonTextStyle?: StyleProp<TextStyle>;
}

export function ActionButtons({
  onCancel,
  onSubmit,
  submitLabel,
  loading,
  containerStyle,
  buttonStyle,
  cancelButtonStyle,
  submitButtonStyle,
  submitButtonDisabled,
  cancelButtonDisabled,
  cancelButtonTextStyle,
  submitButtonTextStyle,
}: ActionButtonsProps) {
  const isSubmitDisabled = !!loading || !!submitButtonDisabled;

  return (
    <XStack style={containerStyle as any}>
      <Button
        unstyled
        style={[buttonStyle, cancelButtonStyle] as any}
        onPress={onCancel}
        disabled={cancelButtonDisabled}
      >
        <Text style={cancelButtonTextStyle as any}>Cancel</Text>
      </Button>

      <Button
        unstyled
        style={[buttonStyle, submitButtonStyle] as any}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <Text style={submitButtonTextStyle as any}>{submitLabel}</Text>
      </Button>
    </XStack>
  );
}
