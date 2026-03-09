/**
 * Design tokens for use in StyleSheet-based screens and legacy components.
 * Values are sourced from Tamagui config so styles stay consistent with theme-aware UI.
 *
 * Use this for:
 * - Highly custom layouts, legacy screens, one-off styles
 *
 * Prefer Tamagui components (XStack, YStack, Text, Button, etc.) and theme tokens
 * for reusable UI, cards, lists, and typography.
 */

import { tokens } from "@/tamagui.config";

/** Get raw value from a Tamagui token (handles both { val } and primitive). */
function tokenVal(t: unknown): string | number {
  if (t != null && typeof t === "object" && "val" in t) {
    return (t as { val: string | number }).val;
  }
  return t as string | number;
}

export const Colors = {
  light: {
    text: tokenVal(tokens.color.lightColor) as string,
    background: tokenVal(tokens.color.lightBackground) as string,
    tint: tokenVal(tokens.color.tintColor) as string,
    icon: tokenVal(tokens.color.lightIcon) as string,
    tabIconDefault: tokenVal(tokens.color.lightTabIconDefault) as string,
    tabIconSelected: tokenVal(tokens.color.tabIconSelected) as string,
    cancelButtonColor: tokenVal(tokens.color.cancelButtonColorLight) as string,
    cancelButtonBg: tokenVal(tokens.color.cancelButtonBgLight) as string,
    cardBackground: tokenVal(tokens.color.cardBackgroundLight) as string,
    cardBorder: tokenVal(tokens.color.cardBorderLight) as string,
    iconMuted: tokenVal(tokens.color.iconMutedLight) as string,
    textSecondary: tokenVal(tokens.color.textSecondaryLight) as string,
    textTertiary: tokenVal(tokens.color.textTertiaryLight) as string,
  },
  dark: {
    text: tokenVal(tokens.color.darkColor) as string,
    background: tokenVal(tokens.color.darkBackground) as string,
    tint: tokenVal(tokens.color.tintColor) as string,
    icon: tokenVal(tokens.color.darkIcon) as string,
    tabIconDefault: tokenVal(tokens.color.darkTabIconDefault) as string,
    tabIconSelected: tokenVal(tokens.color.tabIconSelected) as string,
    cancelButtonColor: tokenVal(tokens.color.cancelButtonColorDark) as string,
    cancelButtonBg: tokenVal(tokens.color.cancelButtonBgDark) as string,
    cardBackground: tokenVal(tokens.color.cardBackgroundDark) as string,
    cardBorder: tokenVal(tokens.color.cardBorderDark) as string,
    iconMuted: tokenVal(tokens.color.iconMutedDark) as string,
    textSecondary: tokenVal(tokens.color.textSecondaryDark) as string,
    textTertiary: tokenVal(tokens.color.textTertiaryDark) as string,
  },
  /** Static semantic colors — same in both light and dark. */
  error: tokenVal(tokens.color.errorColor) as string,
  warning: tokenVal(tokens.color.warningColor) as string,
  tint: tokenVal(tokens.color.tintColor) as string,
  success: tokenVal(tokens.color.successColor) as string,
  spending: tokenVal(tokens.color.spendingColor) as string,
  budget: tokenVal(tokens.color.budgetColor) as string,
  switch: {
    trackColorDisabled: tokenVal(
      tokens.color.switchTrackColorDisabled,
    ) as string,
    trackColorEnabled: tokenVal(tokens.color.switchTrackColorEnabled) as string,
    thumbColorDisabled: tokenVal(
      tokens.color.switchThumbColorDisabled,
    ) as string,
    thumbColorEnabled: tokenVal(tokens.color.switchThumbColorEnabled) as string,
  },
};

/** Spacing tokens for margins/padding in StyleSheets. */
export const spacing = {
  xs: tokenVal(tokens.space.sm) as number,
  sm: tokenVal(tokens.space.sm) as number,
  md: tokenVal(tokens.space.md) as number,
  lg: tokenVal(tokens.space.lg) as number,
  xl: tokenVal(tokens.space.xl) as number,
  /** Alias for default spacing (same as md in current config). */
  true: tokenVal(tokens.space.true) as number,
};

/** Size tokens for dimensions in StyleSheets. */
export const size = {
  sm: tokenVal(tokens.size.sm) as number,
  md: tokenVal(tokens.size.md) as number,
  lg: tokenVal(tokens.size.lg) as number,
  true: tokenVal(tokens.size.true) as number,
};

/** Radius tokens for border radius in StyleSheets. */
export const radius = {
  none: tokenVal(tokens.radius.none) as number,
  sm: tokenVal(tokens.radius.sm) as number,
  md: tokenVal(tokens.radius.md) as number,
  lg: tokenVal(tokens.radius.lg) as number,
  true: tokenVal(tokens.radius.true) as number,
};

/** zIndex tokens for stacking. */
export const zIndex = {
  sm: tokenVal(tokens.zIndex.sm) as number,
  md: tokenVal(tokens.zIndex.md) as number,
  lg: tokenVal(tokens.zIndex.lg) as number,
};

export const fontSize = {
  sm: tokenVal(tokens.fontSize.sm) as number,
  md: tokenVal(tokens.fontSize.md) as number,
  lg: tokenVal(tokens.fontSize.lg) as number,
  xl: tokenVal(tokens.fontSize.xl) as number,
  xxl: tokenVal(tokens.fontSize.xxl) as number,
  xxxl: tokenVal(tokens.fontSize.xxxl) as number,
  true: tokenVal(tokens.fontSize.true) as number,
};

export const lineHeight = {
  sm: tokenVal(tokens.lineHeight.sm) as number,
  md: tokenVal(tokens.lineHeight.md) as number,
  lg: tokenVal(tokens.lineHeight.lg) as number,
  true: tokenVal(tokens.lineHeight.true) as number,
};

export const fontWeight = {
  sm: tokenVal(tokens.fontWeight.sm) as number,
  md: tokenVal(tokens.fontWeight.md) as number,
  lg: tokenVal(tokens.fontWeight.lg) as number,
  true: tokenVal(tokens.fontWeight.true) as number,
};

export const letterSpacing = {
  sm: tokenVal(tokens.letterSpacing.sm) as number,
  md: tokenVal(tokens.letterSpacing.md) as number,
  lg: tokenVal(tokens.letterSpacing.lg) as number,
  true: tokenVal(tokens.letterSpacing.true) as number,
};
