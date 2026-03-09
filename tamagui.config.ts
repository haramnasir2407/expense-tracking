import { createAnimations } from "@tamagui/animations-react-native";
import { createFont, createTamagui, createTokens } from "tamagui";

const animations = createAnimations({
  bouncy: { type: "spring", damping: 9, mass: 0.9, stiffness: 150 },
  lazy: { type: "spring", damping: 18, stiffness: 50 },
  quick: { type: "spring", damping: 20, mass: 1.2, stiffness: 250 },
});

export const tokens = createTokens({
  color: {
    tintColor: "#0a7ea4",
    errorColor: "#FF6B6B",
    warningColor: "#F39C12",
    successColor: "#4ECDC4",
    spendingColor: "#4ECDC4",
    budgetColor: "#F7A072",
    tabIconSelected: "#0a7ea4",
    lightColor: "#11181C",
    lightBackground: "#fff",
    lightIcon: "#687076",
    lightTabIconDefault: "#687076",
    darkColor: "#ECEDEE",
    darkBackground: "#151718",
    darkIcon: "#9BA1A6",
    darkTabIconDefault: "#9BA1A6",
    switchTrackColorDisabled: "#767577",
    switchTrackColorEnabled: "#0a7ea460",
    switchThumbColorDisabled: "#f4f3f4",
    switchThumbColorEnabled: "#0a7ea4",
    cancelButtonColorLight: "#666",
    cancelButtonColorDark: "#ffff",
    cancelButtonBgLight: "#f0f0f0",
    cancelButtonBgDark: "#2C2C2E",
    // Surface colors
    cardBackgroundLight: "#ffffff",
    cardBackgroundDark: "#1C1C1E",
    cardBorderLight: "#f0f0f0",
    cardBorderDark: "#2C2C2E",
    // Muted/secondary text and icon colors
    iconMutedLight: "#cccccc",
    iconMutedDark: "#3A3A3C",
    textSecondaryLight: "#666666",
    textSecondaryDark: "#8E8E93",
    textTertiaryLight: "#999999",
    textTertiaryDark: "#636366",
  },
  size: { sm: 8, md: 12, lg: 20, true: 12 },
  space: { sm: 4, md: 8, lg: 12, xl: 16, xxl: 20, true: 8 },
  radius: { none: 0, sm: 3, true: 0, md: 6, lg: 12 },
  zIndex: { sm: 0, md: 100, lg: 200, true: 100 },
  fontSize: { sm: 12, md: 14, lg: 16, xl: 18, xxl: 20, xxxl: 24, true: 16 },
  lineHeight: { sm: 22, md: 24, lg: 26, true: 26 },
  fontWeight: { sm: "300", md: "400", lg: "500", true: "600" },
  letterSpacing: { sm: 0, md: -1, lg: -1, true: -1 },
});

export const themes = {
  light: {
    color: "#11181C",
    bg: "#fff",
    tintColor: "#0a7ea4",
  },
  dark: {
    color: "#ECEDEE",
    bg: "#151718",
    tintColor: "#0a7ea4",
  },
};

const systemFont = createFont({
  family: "System",
  size: {
    1: 12,
    2: 14,
    3: 15,
  },
  lineHeight: {
    // 1 will be 22
    2: 22,
  },
  weight: {
    1: "300",
    // 2 will be 300
    3: "600",
  },
  letterSpacing: {
    1: 0,
    2: -1,
    // 3 will be -1
  },
  // (native only) swaps out fonts by face/style
  face: {
    300: { normal: "InterLight", italic: "InterItalic" },
    600: { normal: "InterBold" },
  },
});

export const tamaguiConfig = createTamagui({
  animations,
  fonts: {
    heading: systemFont,
    body: systemFont,
  },

  tokens,
  themes,
  media: {
    sm: { maxWidth: 860 },
    gtSm: { minWidth: 860 + 1 },
    short: { maxHeight: 820 },
    hoverable: { hover: "hover" },
    touchable: { pointer: "coarse" },
  },

  shorthands: {
    px: "paddingHorizontal",
  },

  settings: {
    disableSSR: true,
    allowedStyleValues: "somewhat-strict-web",
  },
});

type OurConfig = typeof tamaguiConfig;

declare module "tamagui" {
  interface TamaguiCustomConfig extends OurConfig {}
}
