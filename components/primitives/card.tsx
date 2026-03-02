import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { cardStyles as styles } from "./styles";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** If true, no shadow (e.g. for flat cards inside another card). Default false. */
  noShadow?: boolean;
  /** If set, use this as border color; otherwise no border. */
  borderColor?: string;
}

export function Card({
  children,
  style,
  noShadow,
  borderColor,
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const bg = colors.background;

  return (
    <View
      style={[
        noShadow ? styles.cardNoShadow : styles.card,
        { backgroundColor: bg },
        borderColor != null && { borderWidth: 1, borderColor },
        style,
      ]}
    >
      {children}
    </View>
  );
}
