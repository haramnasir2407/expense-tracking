import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { addButtonStyles } from "./styles";

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
