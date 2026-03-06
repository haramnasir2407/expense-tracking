import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import type { StyleProp, TextInputProps, TextStyle } from "react-native";
import { StyleSheet } from "react-native";
import { Input } from "tamagui";

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
  const flatStyle = StyleSheet.flatten([{ color: colors.text }, style]);

  return (
    <Input
      unstyled
      {...(rest as any)}
      style={flatStyle as any}
      placeholderTextColor={placeholderTextColor ?? colors.text + "60"}
    />
  );
}

