import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { YStack } from "tamagui";
import { cardStyles as styles } from "./styles";

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** If true, no shadow (e.g. for flat cards inside another card). Default false. */
  noShadow?: boolean;
  /** If set, use this as border color; otherwise no border. */
  borderColor?: string;
  /** Optional explicit background color for the card. */
  backgroundColor?: string;
}

export function Card({
  children,
  style,
  noShadow,
  borderColor,
  backgroundColor,
}: CardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const bg = backgroundColor ?? colors.background;

  return (
    <YStack
      // Tamagui's Stack types don't expose `backgroundColor` directly in our setup,
      // but it is supported at runtime; cast to satisfy TypeScript.
      {...({ backgroundColor: bg } as any)}
      style={[
        noShadow ? styles.cardNoShadow : styles.card,
        borderColor != null && { borderWidth: 1, borderColor },
        style,
      ]}
    >
      {children}
    </YStack>
  );
}
