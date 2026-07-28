import React from "react";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
} from "../../theme";

// ── Status types ───────────────────────────────────────────────

export type StatusKey = "locked" | "pending" | "verified" | "live";

// ── StatusBadge ────────────────────────────────────────────────

export function StatusBadge({
  status,
  size = "sm",
  style,
}: {
  status: StatusKey;
  size?: "sm" | "md";
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  let icon: keyof typeof Feather.glyphMap;
  let label: string;
  let bg: string;
  let text: string;

  switch (status) {
    case "locked":
      icon = "lock"; label = "Locked"; bg = colors.state.lockedSoft; text = colors.state.locked;
      break;
    case "pending":
      icon = "clock"; label = "Pending"; bg = colors.state.pendingSoft; text = colors.state.pending;
      break;
    case "verified":
      icon = "check-circle"; label = "Verified"; bg = colors.state.verifiedSoft; text = colors.state.verified;
      break;
    case "live":
      icon = "radio"; label = "Live"; bg = colors.state.liveSoft; text = colors.state.live;
      break;
  }

  const iconSize = size === "sm" ? 10 : 12;
  const fontSize = size === "sm" ? 9 : 10;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          minHeight: size === "sm" ? 20 : 24,
          paddingHorizontal: size === "sm" ? Spacing.sm : Spacing.md,
        },
        style,
      ]}
    >
      <Feather name={icon} size={iconSize} color={text} />
      <Text style={[styles.label, { color: text, fontSize }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: Radius.full,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    alignSelf: "flex-start",
  },
  label: {
    fontWeight: FontWeight.semibold,
  },
});
