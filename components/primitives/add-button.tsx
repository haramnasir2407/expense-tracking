import { useAppTheme } from "@/hooks/use-tamagui-theme";
import { Ionicons } from "@expo/vector-icons";
import { Button } from "tamagui";
import { addButtonStyles } from "./styles";

interface AddButtonProps {
  onAddPress: () => void;
}

export function AddButton({ onAddPress }: AddButtonProps) {
  const { colors } = useAppTheme();

  return (
    <Button
      unstyled
      style={[addButtonStyles.fab, { backgroundColor: colors.primary }]}
      onPress={onAddPress}
      pressStyle={{ opacity: 0.8 }}
    >
      <Ionicons name="add" size={28} color="#FFFFFF" />
    </Button>
  );
}
