import {
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

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
    <View style={containerStyle}>
      <TouchableOpacity
        style={[buttonStyle, cancelButtonStyle]}
        onPress={onCancel}
        disabled={cancelButtonDisabled}
      >
        <Text style={cancelButtonTextStyle}>Cancel</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[buttonStyle, submitButtonStyle]}
        onPress={onSubmit}
        disabled={isSubmitDisabled}
      >
        <Text style={submitButtonTextStyle}>{submitLabel}</Text>
      </TouchableOpacity>
    </View>
  );
}
