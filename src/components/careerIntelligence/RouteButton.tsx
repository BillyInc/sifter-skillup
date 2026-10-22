import React, { forwardRef, useState, type ComponentRef, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, type AccessibilityRole, type StyleProp, type ViewStyle } from "react-native";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";

export type RouteButtonVariant = "primary" | "secondary" | "selected" | "quiet";

export function routeButtonFocusStyle(focused: boolean, accentColor: string) {
  return focused ? { borderWidth: 2, borderColor: accentColor } : undefined;
}

export const RouteButton = forwardRef<ComponentRef<typeof Pressable>, {
  label?: string;
  icon?: ReactNode;
  children?: ReactNode;
  accessibilityRole?: AccessibilityRole;
  accessibilityLabel?: string;
  onPress: () => void;
  variant?: RouteButtonVariant;
  disabled?: boolean;
  expanded?: boolean;
  selected?: boolean;
  style?: StyleProp<ViewStyle>;
}>(function RouteButton({
  label,
  icon,
  children,
  accessibilityRole = "button",
  accessibilityLabel,
  onPress,
  variant = "secondary",
  disabled = false,
  expanded,
  selected,
  style,
}, ref) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);
  const backgroundColor = variant === "primary" ? colors.accentRole.fill
    : variant === "selected" ? colors.surface.subtle : "transparent";
  const borderColor = variant === "primary" ? "transparent"
    : variant === "selected" ? colors.accentRole.action
      : variant === "quiet" ? colors.borderRole.subtle : colors.accentRole.action;
  const color = variant === "primary" ? colors.accentRole.onFill
    : colors.textRole.primary;
  return (
    <Pressable
      ref={ref}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label ?? "Action"}
      accessibilityState={{ disabled, ...(expanded === undefined ? {} : { expanded }), ...(selected === undefined ? {} : { selected }) }}
      disabled={disabled}
      onPress={onPress}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor, borderColor, opacity: disabled ? 0.45 : pressed ? 0.85 : 1 },
        style,
        routeButtonFocusStyle(focused, colors.accentRole.action),
      ]}
    >
      {icon}
      {label ? <Text style={[styles.label, { color }, CompassFonts.bodySemibold]}>{label}</Text> : null}
      {children}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    minWidth: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: Radius.md,
  },
  label: { fontSize: 16, lineHeight: 20, fontWeight: "600", textAlign: "center" },
});

export default RouteButton;
