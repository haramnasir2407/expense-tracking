import React from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { iconCircleStyles as styles } from "./styles";

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
  const radius = size / 2;
  return (
    <View
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
