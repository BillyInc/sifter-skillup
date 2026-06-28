/**
 * ComingSoon / Locked — reusable shells for areas that ship with the new design
 * but aren't populated yet. Per the build strategy, unbuilt areas read
 * "Coming Soon" (never mock data) and are filled in incrementally.
 */
import React, { type ReactNode } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
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
  icon = "🚧",
  eyebrow = "COMING SOON",
  title,
  body,
  bullets,
  footer,
  showLogo,
}: ComingSoonProps) {
  const { colors } = useTheme();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        {showLogo ? (
          <LevelUpLogo size={72} />
        ) : (
          <Text style={styles.icon}>{icon}</Text>
        )}
        <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>
          {eyebrow}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {body ? (
          <Text style={[styles.body, { color: colors.textSoft }]}>{body}</Text>
        ) : null}
      </View>

      {bullets?.length ? (
        <View style={styles.bullets}>
          {bullets.map((b) => (
            <View
              key={b.title}
              style={[
                styles.bullet,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <Text style={styles.bulletIcon}>{b.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.bulletTitle, { color: colors.text }]}>
                  {b.title}
                </Text>
                <Text style={[styles.bulletBody, { color: colors.textSoft }]}>
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
export function LockedPill({ label = "Coming soon" }: { label?: string }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.pill,
        { backgroundColor: colors.bgSecondary, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.pillText, { color: colors.textMuted }]}>
        🔒 {label}
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
  icon: { fontSize: 56 },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
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
  bullets: { gap: Spacing.md },
  bullet: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
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
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  pillText: { fontSize: FontSize.xs, fontWeight: "700" },
});

export default ComingSoon;
