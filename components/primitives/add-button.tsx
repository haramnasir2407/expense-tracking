import { Ionicons } from "@expo/vector-icons";
import { Button } from "tamagui";
import { addButtonStyles } from "./styles";

interface AddButtonProps {
  onAddPress: () => void;
  colors: {
    tint: string;
  };
}

export function AddButton({ onAddPress, colors }: AddButtonProps) {
  return (
    <Button
      unstyled
      style={[addButtonStyles.fab, { backgroundColor: colors.tint }]}
      onPress={onAddPress}
      pressStyle={{ opacity: 0.8 }}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </Button>
  );
}
