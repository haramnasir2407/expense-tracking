import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableOpacityProps,
  ViewStyle,
} from "react-native";

interface AuthButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
  containerStyle?: ViewStyle;
}

export function AuthButton({
  title,
  loading = false,
  variant = "primary",
  containerStyle,
  disabled,
  ...touchableProps
}: AuthButtonProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const isDisabled = disabled || loading;

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
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), containerStyle]}
      disabled={isDisabled}
      {...touchableProps}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={[styles.buttonText, { color: getTextColor() }]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 52,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
