import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import { ActivityIndicator, ViewStyle } from "react-native";

import { Button, Text } from "tamagui";
import { authButtonStyles as styles } from "./styles";

interface AuthButtonProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  containerStyle?: ViewStyle;
  onPress: () => void;
  disabled?: boolean;
}

export function AuthButton({
  title,
  loading = false,
  variant = "primary",
  containerStyle,
  onPress,
}: AuthButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isDisabled = loading;

  const getButtonStyle = () => {
    if (variant === "primary") {
      return {
        backgroundColor: isDisabled ? colors.text + "40" : colors.tint,
      };
    } else if (variant === "secondary") {
      return {
        backgroundColor: isDisabled ? colors.text + "20" : colors.text + "10",
      };
    } else {
      return {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: isDisabled ? colors.text + "40" : colors.tint,
      };
    }
  };

  const getTextColor = () => {
    if (variant === "primary") {
      return "#ffffff";
    } else if (variant === "outline") {
      return isDisabled ? colors.text + "40" : colors.tint;
    } else {
      return colors.text;
    }
  };

  return (
    <Button
      unstyled
      style={[styles.button, getButtonStyle(), containerStyle]}
      disabled={isDisabled}
      onPress={onPress}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.buttonText, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </Button>
  );
}
