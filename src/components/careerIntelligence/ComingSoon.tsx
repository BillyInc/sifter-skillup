/**
 * ComingSoon / Locked — reusable shells for areas that ship with the new design
 * but aren't populated yet. Per the build strategy, unbuilt areas read
 * as locked previews (never mock data) and are filled in incrementally.
 */
import React, { type ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { Feather } from "@expo/vector-icons";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  webContainer,
} from "../../theme";
import { LevelUpLogo } from "../brand/LevelUpLogo";

export interface ComingSoonProps {
  icon?: string;
  eyebrow?: string;
  title: string;
  body?: string;
  /** Optional bullet list of what's coming. */
  bullets?: { icon: string; title: string; body: string }[];
  /** Optional footer (CTAs etc.). */
  footer?: ReactNode;
  showLogo?: boolean;
}

export function ComingSoon({
  icon = "lock",
  eyebrow = "LOCKED",
  title,
  body,
  bullets,
  footer,
  showLogo,
}: ComingSoonProps) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        {showLogo ? (
          <LevelUpLogo size={72} />
        ) : (
          <View
            style={[
              styles.icon,
              { backgroundColor: colors.state.lockedSoft, borderColor: colors.borderRole.subtle },
            ]}
          >
            <Feather name={icon as keyof typeof Feather.glyphMap} size={22} color={colors.state.locked} />
          </View>
        )}
        <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>
          {eyebrow}
        </Text>
        <Text style={[styles.title, { color: colors.textRole.primary }]}>{title}</Text>
        {body ? (
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{body}</Text>
        ) : null}
        <View
          style={[
            styles.lockBadge,
            { backgroundColor: colors.state.lockedSoft, borderColor: colors.borderRole.subtle },
          ]}
        >
          <Feather name="lock" size={12} color={colors.state.locked} />
          <Text style={[styles.lockBadgeText, { color: colors.state.locked }]}>
            Locked
          </Text>
        </View>
      </View>

      {bullets?.length ? (
        <View style={styles.bullets}>
          {bullets.map((b) => (
            <View
              key={b.title}
              style={[
                styles.bullet,
                { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle },
              ]}
            >
              <Text style={styles.bulletIcon}>{b.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bulletTitle, { color: colors.textRole.primary }]}>
                  {b.title}
                </Text>
                <Text style={[styles.bulletBody, { color: colors.textRole.secondary }]}>
                  {b.body}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : null}

      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </ScrollView>
  );
}

/** Small inline "Locked" pill for gating sub-features inside a populated screen. */
export function LockedPill({ label = "Locked" }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.state.lockedSoft, borderColor: colors.borderRole.subtle },
      ]}
    >
      <Text style={[styles.pillText, { color: colors.state.locked }]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.huge,
    paddingHorizontal: Spacing.xl,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  hero: { alignItems: "center", gap: Spacing.sm, marginTop: Spacing.lg },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: 0.9,
    marginTop: Spacing.sm,
    textTransform: "uppercase",
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "700",
    textAlign: "center",
    lineHeight: FontSize.display * 1.15,
  },
  body: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    textAlign: "center",
    maxWidth: 420,
    marginTop: Spacing.xs,
  },
  lockBadge: {
    minHeight: 24,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: Spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: Spacing.xs,
  },
  lockBadgeText: { fontSize: FontSize.xs, fontWeight: "600" },
  bullets: { gap: Spacing.md },
  bullet: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "flex-start",
  },
  bulletIcon: { fontSize: 24 },
  bulletTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  bulletBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  footer: { gap: Spacing.md },
  pill: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: StyleSheet.hairlineWidth,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: "600" },
});

export default ComingSoon;
