import { useAppTheme } from "@/hooks/use-tamagui-theme";
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { View } from "tamagui";
import { themedViewStyles as styles } from "./styles";

interface ThemedViewProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function ThemedView({ children, style }: ThemedViewProps) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }, style]}
    >
      {children}
    </View>
  );
}
