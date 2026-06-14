import colors from "@/constants/colors";

/**
 * Returns the design tokens for the current color scheme.
 * Includes compatibility mappings for template values.
 */
export function useColors() {
  return {
    ...colors,
    foreground: colors.text,
    mutedForeground: colors.textMuted,
    primaryForeground: colors.white,
  };
}
