import { Colors } from "@/constants/theme";
import React from "react";
import { View, useColorScheme } from "react-native";
import { themedViewStyles as styles } from "./styles";

export default function ThemedView({
  children,
}: {
  children: React.ReactNode;
}) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}
