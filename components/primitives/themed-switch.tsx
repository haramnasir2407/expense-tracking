import { Switch } from "tamagui";

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
      checked={value}
      onCheckedChange={onValueChange}
      disabled={disabled}
      size="$3"
      {...({
        backgroundColor: value ? trackColor.true : trackColor.false,
      } as any)}
    >
      <Switch.Thumb
        animation="bouncy"
        {...({
          backgroundColor: thumbColor,
        } as any)}
      />
    </Switch>
  );
}
