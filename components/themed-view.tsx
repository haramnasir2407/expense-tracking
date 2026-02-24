import { Colors } from "@/constants/theme";
import React from "react";
import { StyleSheet, View, useColorScheme } from "react-native";

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
