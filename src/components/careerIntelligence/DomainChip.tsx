/**
 * DomainChip — a programme→domain link rendered with its match type.
 *
 * Per CCMAS v3.0: domains are Direct / Functional / Adjacent. There is no
 * Primary/Secondary — relative importance is conveyed by ORDER (the in-demand
 * signal), which callers handle when sorting, not by this chip.
 */
import React from "react";
import {
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  type ViewStyle,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  getDomainBadge,
} from "../../theme";
import type { DomainMatchType } from "../../types/career";

export interface DemandIndicator {
  postingsPerMonth: number;
  growthRate?: number | null;
  label: string;
}

export interface DomainChipProps {
  label: string;
  matchType: DomainMatchType;
  /** Optional leading emoji/glyph. */
  glyph?: string;
  /** Show the match-type word (Direct/Functional/Adjacent) after the label. */
  showType?: boolean;
  elite?: boolean;
  /** Demand indicator from domain_demand_metrics */
  demandIndicator?: DemandIndicator;
  onPress?: () => void;
  style?: ViewStyle;
}

export function DomainChip({
  label,
  matchType,
  glyph,
  showType = true,
  elite,
  demandIndicator,
  onPress,
  style,
}: DomainChipProps) {
  const { colors, isDark } = useTheme();
  const badge = getDomainBadge(matchType, isDark);

  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container
      {...(onPress ? { onPress, activeOpacity: 0.85 } : {})}
      style={[
        styles.chip,
        { backgroundColor: badge.bg, borderColor: badge.border },
        style,
      ]}
    >
      {glyph ? <Text style={styles.glyph}>{glyph}</Text> : null}
      <Text style={[styles.label, { color: badge.text }]} numberOfLines={1}>
        {elite ? "⭐ " : ""}
        {label}
      </Text>
      {showType ? (
        <View style={[styles.typeDot, { backgroundColor: badge.text }]}>
          <Text style={[styles.typeText, { color: badge.bg }]}>
            {badge.label}
          </Text>
        </View>
      ) : null}
      {demandIndicator ? (
        <Text style={[styles.demandChip, { color: colors.green }]}>
          📈 {demandIndicator.label}
        </Text>
      ) : null}
    </Container>
  );
}

export default DomainChip;

const styles = StyleSheet.create({
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingLeft: Spacing.md,
    paddingRight: 6,
    paddingVertical: 6,
  },
  glyph: { fontSize: 13 },
  label: { fontSize: FontSize.sm, fontWeight: "700", flexShrink: 1 },
  typeDot: {
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  typeText: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  demandChip: {
    fontSize: 9,
    fontWeight: "900",
    letterSpacing: 0.3,
    marginLeft: 2,
  },
});
