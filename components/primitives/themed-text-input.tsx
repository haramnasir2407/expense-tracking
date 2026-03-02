import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  StyleProp,
  TextInput,
  TextInputProps,
  TextStyle,
} from "react-native";

interface ThemedTextInputProps extends TextInputProps {
  style?: StyleProp<TextStyle>;
}

export function ThemedTextInput({
  style,
  placeholderTextColor,
  ...rest
}: ThemedTextInputProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <TextInput
      style={[style, { color: colors.text }]}
      placeholderTextColor={placeholderTextColor ?? colors.text + "60"}
      {...rest}
    />
  );
}

