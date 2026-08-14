/**
 * VerificationScreen — institution identity assurance.
 *
 * Reads the local educator profile (getEducatorProfile) for the current
 * verification status, claimed organisation name and registry code, and reads
 * adminData.getMyOrganization() for the (future) server-side record. Explains
 * the tiers (T0 limited access → T2 verified institution dashboard). The
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
  CompassFonts,
  Shadow,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import type { DataState } from "../../types/career";
import type {
  EducatorProfile,
  Organization,
  VerificationStatus,
} from "../../types/institution";
import { AdminShell } from "./AdminShell";
import { StaggerReveal } from "@/components/animations/StaggerReveal";
import LocalLegalNotice from "@/components/LocalLegalNotice";

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

function tiersFor(profile: EducatorProfile | null) {
  const type = profile?.organizationType;
  const role = profile?.role;
  const roleLabel = role ? role.replace(/_/g, " ") : "organisation member";
  if (type === "university") {
    return [
      { tier: "T1", title: "Claimed university", body: `The university workspace is linked for the ${roleLabel}. Proof has not yet been approved.` },
      { tier: "T2", title: "Verified university workspace", body: "Verified university staff can use programme, curriculum and peer-intelligence tools within their role scope." },
    ];
  }
  if (type === "secondary_school") {
    return [
      { tier: "T1", title: "Claimed secondary school", body: `The school workspace is linked for the ${roleLabel}. Proof has not yet been approved.` },
      { tier: "T2", title: "Verified school guidance workspace", body: "Verified school owners and staff unlock school-scoped guidance and session tools. Student records still require consent." },
    ];
  }
  return [
    { tier: "T1", title: "Claimed tutorial provider", body: `The provider workspace is linked for the ${roleLabel}. Proof has not yet been approved.` },
    { tier: "T2", title: "Verified provider guidance workspace", body: "Verified tutorial centres and JAMB cafés unlock provider guidance tools; they do not receive a school roster by default." },
  ];
}

export function VerificationScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
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
    Promise.all([getEducatorProfile(user?.id), adminData.getMyOrganization()]).then(
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
  }, [user?.id]);

  // Contact details and registry anchors do not equal proof submission. Only
  // an explicit proof-submission timestamp may put the account under review.
  const status: VerificationStatus =
    profile?.verificationStatus === "pending" && !profile?.verificationProofSubmittedAt
      ? "claimed"
      : profile?.verificationStatus ?? "unverified";
  const meta = STATUS_META[status];
  const tiers = tiersFor(profile);
  const proofGuidance = profile?.organizationType === "university"
    ? "University proof: institutional email, JAMB/NUC anchor, or an official university document."
    : profile?.organizationType === "secondary_school"
      ? "Secondary-school proof: State MoE approval, school registry anchor, or an official school document."
      : "Provider proof: CAC record, provider registration, or an official tutorial-centre document.";
  const tintColor =
    meta.tint === "green"
      ? colors.green
      : meta.tint === "gold"
        ? colors.gold
        : colors.textMuted;

  const onResubmit = async () => {
    if (!profile || submitting) return;
    if (!profile.verificationProofSubmittedAt) {
      setFeedback("No verification proof has been submitted. Add the appropriate proof for this organisation before requesting review.");
      return;
    }
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
                  <Text style={[styles.statusLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>
                    CURRENT STATUS
                  </Text>
                  <Text style={[styles.statusValue, CompassFonts.displayBold, { color: tintColor }]}>
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
                label="Workspace role"
                value={profile?.role ? profile.role.replace(/_/g, " ") : "Not selected"}
                colors={colors}
              />
              <Row
                label="Verification method"
                value={
                  profile?.verificationMethod
                    ? profile.verificationMethod.replace(/_/g, " ")
                    : "Not submitted"
                }
                colors={colors}
              />
              <Text style={[styles.proofHint, { color: colors.textMuted }]}>{proofGuidance}</Text>
              <LocalLegalNotice audience="institution" />
            </View>

            {/* Tiers */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
                Verification tiers
              </Text>
              <Text style={[styles.lede, { color: colors.textMuted }]}>
                Assurance is tiered — higher tiers unlock more scoped
                intelligence. Peer benchmarks are for verified institutions.
                School and tutorial owners compare external schools as public
                guidance, not their own school against a peer set. Individual
                student data is never unlocked by verification alone; it always
                also requires consent.
              </Text>
              <View style={styles.tiers}>
                {tiers.map((t, i) => (<StaggerReveal key={t.tier} index={i}>
                  <View
                    style={[
                      styles.tierCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text style={[styles.tierBadge, CompassFonts.displayBold, { color: colors.text }]}>
                      {t.tier}
                    </Text>
                    <Text style={[styles.tierTitle, CompassFonts.bodyBold, { color: colors.text }]}>
                      {t.title}
                    </Text>
                    <Text style={[styles.tierBody, { color: colors.textMuted }]}>
                      {t.body}
                    </Text>
                  </View>
                </StaggerReveal>))}
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
                <Text style={[styles.ctaText, CompassFonts.bodyBold, { color: colors.textInverse }]}>
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
      <Text style={[styles.rowLabel, CompassFonts.bodySemibold, { color: colors.textMuted }]}>{label}</Text>
      <Text
        style={[styles.rowValue, CompassFonts.bodyBold, { color: colors.text }]}
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
  statusDot: { fontSize: 26 },
  statusLabel: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
  },
  statusValue: { fontSize: FontSize.xl },
  divider: { height: 1, marginVertical: Spacing.xs },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: Spacing.md,
  },
  rowLabel: { fontSize: FontSize.sm },
  rowValue: {
    flex: 1,
    textAlign: "right",
    fontSize: FontSize.sm,
    textTransform: "capitalize",
  },
  proofHint: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
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
    letterSpacing: 1,
  },
  tierTitle: { fontSize: FontSize.md },
  tierBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  cta: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.lg,
    alignItems: "center",
  },
  ctaText: { fontSize: FontSize.md },
  feedback: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  feedbackText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
