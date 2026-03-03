import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  StyleProp,
  TextInputProps,
  TextStyle,
} from "react-native";
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

  return (
    <Input
      {...(rest as React.ComponentProps<typeof Input>)}
      style={style as any}
      color={colors.text as any}
      placeholderTextColor={
        (placeholderTextColor ?? colors.text + "60") as any
      }
    />
  );
}

