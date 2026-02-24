import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Text,
  TextInput,
  TextInputProps,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { authInputStyles as styles } from "./styles";

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isPassword?: boolean;
  containerStyle?: ViewStyle;
}

export function AuthInput({
  label,
  error,
  icon,
  isPassword = false,
  containerStyle,
  ...textInputProps
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: colors.background,
            borderColor: error ? "#ff4444" : colors.text + "20",
          },
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={colors.text}
            style={styles.icon}
          />
        )}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              flex: 1,
            },
          ]}
          placeholderTextColor={colors.text + "60"}
          secureTextEntry={isPassword && !showPassword}
          autoCapitalize="none"
          {...textInputProps}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.text}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

