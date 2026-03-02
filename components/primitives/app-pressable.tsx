import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  StyleProp,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native";
import { appPressableStyles as styles } from "./styles";

interface AppPressableProps extends Omit<TouchableOpacityProps, "style"> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Optional right-side icon (e.g. chevron-forward). */
  rightIcon?: keyof typeof Ionicons.glyphMap;
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
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.background }, style]}
      activeOpacity={activeOpacity}
      {...rest}
    >
      <View style={styles.content}>{children}</View>
      {rightIcon != null && (
        <Ionicons name={rightIcon} size={20} color={colors.text + "60"} />
      )}
    </TouchableOpacity>
  );
}
