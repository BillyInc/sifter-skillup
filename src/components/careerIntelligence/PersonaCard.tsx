import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  CompassFonts,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
} from "../../theme";
import { PressLift } from "../animations/PressLift";

// ── PersonaCard ────────────────────────────────────────────────
// Large selectable card for the Account Type Gate (6 persona options).
// Domain icon + persona title + description. Hover lifts, selected = cobalt ring.

export interface PersonaOption {
  key: string;
  icon: keyof typeof Feather.glyphMap;
  title: string;
  description: string;
}

export function PersonaCard({
  option,
  selected,
  onPress,
  style,
}: {
  option: PersonaOption;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();

  return (
    <PressLift
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.card,
        {
          backgroundColor: selected ? colors.surface.subtle : colors.surface.raised,
          borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle,
        },
        selected && styles.cardSelected,
        style,
      ]}
    >
      {/* Station dot indicator */}
      <View style={styles.dotRow}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: selected ? colors.accentRole.action : "transparent",
              borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle,
            },
          ]}
        />
      </View>

      {/* Icon */}
      <View
        style={[
          styles.iconBox,
          {
            backgroundColor: selected ? colors.accentRole.action + "12" : colors.surface.subtle,
            borderColor: selected ? colors.accentRole.action + "30" : colors.borderRole.subtle,
          },
        ]}
      >
        <Feather
          name={option.icon}
          size={22}
          color={selected ? colors.accentRole.action : colors.textRole.secondary}
        />
      </View>

      {/* Text */}
      <View style={styles.textBlock}>
        <Text
          style={[
            styles.title,
            { color: selected ? colors.accentRole.action : colors.textRole.primary },
          ]}
          numberOfLines={1}
        >
          {option.title}
        </Text>
        <Text
          style={[styles.description, { color: colors.textRole.secondary }]}
          numberOfLines={2}
        >
          {option.description}
        </Text>
      </View>

      {/* Check */}
      {selected ? (
        <Feather name="check-circle" size={18} color={colors.accentRole.action} />
      ) : (
        <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
      )}
    </PressLift>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    minHeight: 72,
  },
  cardSelected: {
    ...Platform.select({
      web: {
        boxShadow: "0 2px 12px rgba(31,94,255,0.12)",
      },
      default: { elevation: 2 },
    }),
  },
  dotRow: {
    width: 12,
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  textBlock: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  description: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.5,
  },
});
