import React, { useState } from "react";
import { Platform, Pressable, StyleSheet, Text } from "react-native";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";

export const MAIN_CONTENT_ID = "main-content";

/** Moves focus to the element carrying `nativeID="main-content"`. */
export function focusMainContent(): void {
  if (typeof document === "undefined") return;
  const target = document.getElementById(MAIN_CONTENT_ID);
  target?.focus?.();
  target?.scrollIntoView?.();
}

/**
 * Web only. Hidden until it receives keyboard focus, so keyboard users can
 * skip the persistent sidebar. Renders nothing on native.
 */
export function SkipToContent() {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  if (Platform.OS !== "web") return null;
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel="Skip to content"
      onPress={focusMainContent}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={[
        styles.link,
        { backgroundColor: colors.accentRole.action, opacity: focused ? 1 : 0 },
        !focused && styles.hidden,
      ]}
    >
      <Text style={[styles.text, CompassFonts.bodyBold, { color: colors.textRole.inverse }]}>Skip to content</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: { position: "absolute", top: Spacing.sm, left: Spacing.sm, zIndex: 1000, minHeight: 44, paddingHorizontal: Spacing.lg, borderRadius: Radius.md, justifyContent: "center" },
  hidden: { transform: [{ translateY: -200 }] },
  text: { fontSize: FontSize.sm },
});
