/**
 * CareerDisclaimer — a compact, honest disclaimer shown on career-intelligence
 * surfaces. Career guidance here is derived from public data and mappings, so
 * every detail screen carries this so no number reads as a promise.
 *
 *   variant="footer"  → muted, full-width strip at the bottom of a scaffold.
 *   variant="inline"  → a small bordered note for use mid-content.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Radius } from "../../theme";

export interface CareerDisclaimerProps {
  variant?: "footer" | "inline";
}

const DISCLAIMER_TEXT =
  "Career guidance is indicative, based on public data and mappings — not a guarantee of admission or employment.";

export function CareerDisclaimer({ variant = "footer" }: CareerDisclaimerProps) {
  const { colors } = useTheme();

  if (variant === "inline") {
    return (
      <View
        style={[
          styles.inline,
          { backgroundColor: colors.bgSecondary, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.inlineText, { color: colors.textMuted }]}>
          ℹ️ {DISCLAIMER_TEXT}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.footer, { borderTopColor: colors.border }]}>
      <Text style={[styles.footerText, { color: colors.textMuted }]}>
        {DISCLAIMER_TEXT}
      </Text>
    </View>
  );
}

export default CareerDisclaimer;

const styles = StyleSheet.create({
  footer: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    textAlign: "center",
  },
  inline: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  inlineText: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.55,
    fontWeight: "600",
  },
});
