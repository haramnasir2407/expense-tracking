import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Button, XStack } from "tamagui";
import { appPressableStyles as styles } from "./styles";

interface AppPressableProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional right-side icon (e.g. chevron-forward). */
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
}

export function AppPressable({
  children,
  style,
  rightIcon,
  activeOpacity = 0.7,
  ...rest
}: AppPressableProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Button
      unstyled
      style={[styles.row, style]}
      pressStyle={{ opacity: activeOpacity }}
      {...rest}
    >
      <XStack style={styles.content}>{children}</XStack>
      {rightIcon != null && (
        <Ionicons name={rightIcon} size={20} color={colors.text + "60"} />
      )}
    </Button>
  );
}
