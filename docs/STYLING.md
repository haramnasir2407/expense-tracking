# Styling: Tamagui + StyleSheet

## When to use what

| Use **StyleSheet** for | Use **Tamagui** for |
|------------------------|---------------------|
| Highly custom layouts | Reusable UI components |
| Legacy screens | Buttons, cards, lists |
| One-off styles | Typography |
| | Theme-aware UI |

## StyleSheet + tokens

Existing stylesheets should use design tokens from `@/constants/theme` so values stay in sync with Tamagui.

```ts
import { spacing, size, radius, Colors } from "@/constants/theme";

// Layout/spacing
padding: spacing.lg,
marginBottom: spacing.md,
paddingHorizontal: spacing.lg + spacing.sm,  // 16

// Dimensions
borderRadius: radius.sm * 4,   // 12
width: size.lg,

// Colors (theme-dependent – use in component with useColorScheme)
const colors = Colors[colorScheme ?? "light"];
backgroundColor: colors.background,
color: colors.text,
```

**Exports from `constants/theme.ts`:**
- `Colors` – `Colors.light` / `Colors.dark`: `text`, `background`, `tint`, `icon`, `tabIconDefault`, `tabIconSelected`
- `spacing` – `xs`, `sm`, `md`, `lg`, `true`
- `size` – `sm`, `md`, `lg`, `true`
- `radius` – `none`, `sm`, `true`
- `zIndex` – `sm`, `md`, `lg`

Tokens are sourced from `tamagui.config.ts`; change values there to update both Tamagui and StyleSheet usage.

## Tamagui components and theme

For theme-aware UI, use Tamagui primitives and the Tamagui theme:

```tsx
import { XStack, YStack, Text, Button } from "tamagui";
import { useAppTheme } from "@/hooks/use-tamagui-theme";

// Tamagui components read theme automatically (no prop needed)
<YStack padding="$lg" backgroundColor="$bg">
  <Text color="$color">Hello</Text>
</YStack>

// Or use the hook for inline styles / non-Tamagui components
const { colors } = useAppTheme();
<View style={{ backgroundColor: colors.background }} />
```

## Theme-aware colors in StyleSheet components

Use `useColorScheme()` and `Colors` so colors follow light/dark:

```tsx
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";

const colorScheme = useColorScheme();
const colors = Colors[colorScheme ?? "light"];
// use colors.text, colors.background, colors.tint, etc.
```

Or use `useThemeColor()` for a single token:

```tsx
import { useThemeColor } from "@/hooks/use-theme-color";
const backgroundColor = useThemeColor({}, "background");
```
