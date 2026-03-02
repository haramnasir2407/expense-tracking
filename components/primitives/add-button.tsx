import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, TouchableOpacity } from "react-native";

interface AddButtonProps {
  onAddPress: () => void;
  colors: {
    tint: string;
  };
}

export function AddButton({ onAddPress, colors }: AddButtonProps) {
  return (
    <TouchableOpacity
      style={[addButtonStyles.fab, { backgroundColor: colors.tint }]}
      onPress={onAddPress}
      activeOpacity={0.8}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

export const addButtonStyles = StyleSheet.create({
  fab: {
    position: "absolute",
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
