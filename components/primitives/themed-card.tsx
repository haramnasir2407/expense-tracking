import { useAppTheme } from "@/hooks/use-tamagui-theme";
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
  const { colors } = useAppTheme();
  const bg = backgroundColor ?? colors.background;

  return (
    <YStack
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
