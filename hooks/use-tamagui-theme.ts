import { useTheme } from "tamagui";

/** Theme-aware colors from Tamagui (for use in Tamagui or inline styles). */
export function useAppTheme() {
  const theme = useTheme();

  return {
    colors: {
      background: theme.bg?.val ?? "#fff",
      text: theme.color?.val ?? "#11181C",
      primary: theme.tintColor?.val ?? "#0a7ea4",
    },
  };
}
