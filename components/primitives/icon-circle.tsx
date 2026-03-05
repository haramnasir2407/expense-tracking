import React from "react";
import type { StyleProp, ViewStyle } from "react-native";
import { Circle } from "tamagui";

interface IconCircleProps {
  children: React.ReactNode;
  size?: number;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
}

export function IconCircle({
  children,
  size = 40,
  backgroundColor,
  style,
}: IconCircleProps) {
  return (
    <Circle
      size={size}
      {...({ backgroundColor } as any)}
      style={style}
    >
      {children}
    </Circle>
  );
}
