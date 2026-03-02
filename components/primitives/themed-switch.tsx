import { Switch } from "react-native";

interface SwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled: boolean;
  trackColor: { false: string; true: string };
  thumbColor: string;
}

export function ThemedSwitch({
  value,
  onValueChange,
  disabled,
  trackColor,
  thumbColor,
}: SwitchProps) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={trackColor}
      thumbColor={thumbColor}
    />
  );
}
