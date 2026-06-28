/**
 * VerificationScreen — institution identity assurance.
 *
 * Reads the local educator profile (getEducatorProfile) for the current
 * verification status, claimed organisation name and registry code, and reads
 * adminData.getMyOrganization() for the (future) server-side record. Explains
 * the tiers (T0 national aggregate → T2 verified institution dashboard). The
 * "Resubmit / update verification" CTA calls adminData.submitVerification(),
 * which returns `coming_soon` — we surface that as an inline "review coming
 * online" message. No fake "verified" badge is ever shown: the badge reflects
 * the profile's own status.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  webContainer,
} from "../../theme";
import { adminData } from "../../lib/adminData";
import { getEducatorProfile } from "../../lib/educatorProfile";
import type { DataState } from "../../types/career";
import type {
  EducatorProfile,
  Organization,
  VerificationStatus,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";

const STATUS_META: Record<
  VerificationStatus,
  { label: string; icon: string; tint: "muted" | "green" | "gold" }
> = {
  unverified: { label: "Unverified", icon: "○", tint: "muted" },
  claimed: { label: "Claimed — awaiting proof", icon: "◔", tint: "gold" },
  pending: { label: "Under review", icon: "◑", tint: "gold" },
  verified: { label: "Verified", icon: "●", tint: "green" },
  rejected: { label: "Rejected", icon: "✕", tint: "muted" },
};

const TIERS = [
  {
    tier: "T0",
    title: "National aggregate",
    body: "Self-declared, unverified. You see national-level aggregate intelligence only.",
  },
  {
    tier: "T1",
    title: "Claimed institution",
    body: "You've claimed an institution and entered a registry anchor; proof is awaited.",
  },
  {
    tier: "T2",
    title: "Verified institution dashboard",
    body: "Verified member access — your institution's own aggregate dashboard, scoped to your programme mix.",
  },
];

export function VerificationScreen() {
  const { colors } = useTheme();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [, setOrg] = useState<DataState<Organization>>({
    status: "pending",
    data: null,
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([getEducatorProfile(), adminData.getMyOrganization()]).then(
      ([p, o]) => {
        if (!active) return;
        setProfile(p);
        setOrg(o);
        setLoaded(true);
      },
    );
    return () => {
      active = false;
    };
  }, []);

  const status: VerificationStatus = profile?.verificationStatus ?? "unverified";
  const meta = STATUS_META[status];
  const tintColor =
    meta.tint === "green"
      ? colors.green
      : meta.tint === "gold"
        ? colors.gold
        : colors.textMuted;

  const onResubmit = async () => {
    if (!profile || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    const res = await adminData.submitVerification(profile);
    setSubmitting(false);
    setFeedback(
      res.meta?.notice ??
        "Verification review is coming online with the institutional rollout.",
    );
  };

  return (
    <AdminShell title="Verification" eyebrow="Identity assurance">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        {!loaded ? null : (
          <>
            {/* Status card */}
            <View
              style={[
                styles.statusCard,
                { backgroundColor: colors.card, borderColor: colors.border },
                Shadow.xs,
              ]}
            >
              <View style={styles.statusHead}>
                <Text style={[styles.statusDot, { color: tintColor }]}>
                  {meta.icon}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.statusLabel, { color: colors.textMuted }]}>
                    CURRENT STATUS
                  </Text>
                  <Text style={[styles.statusValue, { color: tintColor }]}>
                    {meta.label}
                  </Text>
                </View>
              </View>

              <View
                style={[styles.divider, { backgroundColor: colors.border }]}
              />

              <Row
                label="Organisation"
                value={profile?.organizationName || "Not claimed yet"}
                colors={colors}
              />
              <Row
                label="Registry code"
                value={profile?.registryCode || "—"}
                colors={colors}
              />
              <Row
                label="Verification method"
                value={
                  profile?.verificationMethod
                    ? profile.verificationMethod.replace(/_/g, " ")
                    : "—"
                }
                colors={colors}
              />
            </View>

            {/* Tiers */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Verification tiers
              </Text>
              <Text style={[styles.lede, { color: colors.textMuted }]}>
                Assurance is tiered — higher tiers unlock more scoped
                intelligence. Individual student data is never unlocked by
                verification alone; it always also requires consent.
              </Text>
              <View style={styles.tiers}>
                {TIERS.map((t) => (
                  <View
                    key={t.tier}
                    style={[
                      styles.tierCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.tierBadge, { color: colors.text }]}>
                      {t.tier}
                    </Text>
                    <Text style={[styles.tierTitle, { color: colors.text }]}>
                      {t.title}
                    </Text>
                    <Text style={[styles.tierBody, { color: colors.textMuted }]}>
                      {t.body}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Resubmit CTA */}
            <View style={styles.section}>
              <TouchableOpacity
                onPress={onResubmit}
                activeOpacity={0.85}
                disabled={!profile || submitting}
                style={[
                  styles.cta,
                  {
                    backgroundColor: colors.navy,
                    opacity: !profile || submitting ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={[styles.ctaText, { color: colors.textInverse }]}>
                  {submitting ? "Submitting…" : "Resubmit / update verification"}
                </Text>
              </TouchableOpacity>
              {feedback ? (
                <View
                  style={[
                    styles.feedback,
                    {
                      backgroundColor: colors.bgSecondary,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.feedbackText, { color: colors.textSoft }]}>
                    🕐 {feedback}
                  </Text>
                </View>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </AdminShell>
  );
}

function Row({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: ReturnType<typeof useTheme>["colors"];
}) {
  return (
    <View style={styles.row}>
      <Text style={[styles.rowLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text
        style={[styles.rowValue, { color: colors.text }]}
        numberOfLines={1}
      >
        {value}
      </Text>
    </View>
  );
}

export default VerificationScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  statusCard: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  statusHead: { flexDirection: "row", alignItems: "center", gap: Spacing.md },
  statusDot: { fontSize: 26, fontWeight: FontWeight.black },
  statusLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 1,
  },
  statusValue: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  divider: { height: 1, marginVertical: Spacing.xs },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  rowLabel: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold },
  rowValue: {
    flex: 1,
    textAlign: "right",
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    textTransform: "capitalize",
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: -Spacing.xs,
  },
  tiers: { gap: Spacing.sm },
  tierCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: 2,
  },
  tierBadge: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.black,
    letterSpacing: 1,
  },
  tierTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  tierBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  cta: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  ctaText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  feedback: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  feedbackText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
