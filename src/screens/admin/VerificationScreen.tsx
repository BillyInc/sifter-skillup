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
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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
import type { VerificationProofMeta } from "@/lib/adminData";
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

function roleOutlookFor(profile: EducatorProfile | null): string {
  switch (profile?.role) {
    case "owner":
      return "Owner outlook: manage the organisation identity, team seats, school code and institution-level settings. Verification proves the organisation; it does not grant access to individual learner data without consent.";
    case "institution_admin":
    case "admin":
      return "Administrator outlook: run the organisation workspace and its approved workflows. Ownership and verification decisions remain scoped to the organisation owner or authorised reviewer.";
    case "counsellor":
    case "course_advisor":
    case "provisioning_manager":
      return "Guidance outlook: advise learners, manage the workflows assigned to your seat and use aggregate or consented information only. You do not inherit owner controls.";
    case "hod":
    case "dean":
    case "admissions_officer":
      return "Academic outlook: use programme and admissions intelligence within your faculty or admissions role. Institution-wide controls remain outside this seat.";
    case "data_viewer":
      return "Read-only outlook: review the aggregate intelligence your organisation has authorised. You cannot change identity, team or learner-provisioning settings.";
    default:
      return "Member outlook: access is limited to the organisation role selected during onboarding and expands only when that role is authorised and verified.";
  }
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
  const [proof, setProof] = useState<VerificationProofMeta | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      getEducatorProfile(user?.id),
      adminData.getMyOrganization(),
      adminData.getVerificationProof(),
    ]).then(
      ([p, o, latestProof]) => {
        if (!active) return;
        setProfile(
          p && o.data
            ? {
                ...p,
                organizationId: o.data.id,
                verificationStatus: o.data.verificationStatus,
                verificationMethod: o.data.verificationMethod ?? p.verificationMethod,
                verificationProofSubmittedAt:
                  o.data.verificationProofSubmittedAt ?? p.verificationProofSubmittedAt,
              }
            : p,
        );
        setOrg(o);
        setProof(latestProof);
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

  const uploadProof = async (file: Blob, fileName: string, contentType: string) => {
    if (!profile || uploading) return;
    setUploading(true);
    setFeedback(null);
    try {
      const uploaded = await adminData.uploadVerificationProof({
        file,
        fileName,
        contentType,
        verificationMethod: profile.verificationMethod ?? "document_upload",
      });
      setProof(uploaded);
      setProfile((current) => current
        ? {
            ...current,
            verificationStatus: "pending",
            verificationMethod: uploaded.verificationMethod as EducatorProfile["verificationMethod"],
            verificationProofSubmittedAt: uploaded.submittedAt,
          }
        : current,
      );
      setFeedback("Proof submitted. Your organisation is now under review.");
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not submit verification proof.");
    } finally {
      setUploading(false);
    }
  };

  const chooseProof = async () => {
    if (uploading) return;
    setFeedback(null);
    try {
      if (Platform.OS === "web" && typeof document !== "undefined") {
        const file = await new Promise<File | null>((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = ".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp";
          input.onchange = () => resolve(input.files?.[0] ?? null);
          input.click();
        });
        if (file) await uploadProof(file, file.name, file.type || "application/octet-stream");
        return;
      }

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        setFeedback("Photo access is needed to select a proof document.");
        return;
      }
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        quality: 0.9,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const file = await fetch(asset.uri).then((response) => response.blob());
      await uploadProof(
        file,
        asset.fileName ?? `verification-proof.${asset.mimeType?.split("/")[1] ?? "jpg"}`,
        asset.mimeType ?? file.type ?? "image/jpeg",
      );
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not select verification proof.");
    }
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
                value={profile?.registryCode || "Not provided"}
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
              <Row
                label="Proof document"
                value={proof?.fileName || (profile?.verificationProofSubmittedAt ? "Submitted" : "Not submitted")}
                colors={colors}
              />
              <Text style={[styles.proofHint, { color: colors.textMuted }]}>{proofGuidance}</Text>
              <View style={[styles.outlook, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
                <Text style={[styles.outlookLabel, CompassFonts.bodyBold, { color: colors.textMuted }]}>WORKSPACE OUTLOOK</Text>
                <Text style={[styles.outlookText, { color: colors.textSoft }]}>{roleOutlookFor(profile)}</Text>
              </View>
              <LocalLegalNotice audience="institution" />
            </View>

            {/* Tiers */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
                Verification tiers
              </Text>
              <Text style={[styles.lede, { color: colors.textMuted }]}>
                Assurance is tiered - higher tiers unlock more scoped
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

            {/* Proof submission */}
            <View style={styles.section}>
              <TouchableOpacity
                onPress={chooseProof}
                activeOpacity={0.85}
                disabled={!profile || uploading}
                style={[
                  styles.cta,
                  {
                    backgroundColor: colors.navy,
                    opacity: !profile || uploading ? 0.6 : 1,
                  },
                ]}
              >
                <Text style={[styles.ctaText, CompassFonts.bodyBold, { color: colors.textInverse }]}>
                  {uploading ? "Uploading proof..." : proof ? "Replace proof document" : "Upload proof document"}
                </Text>
              </TouchableOpacity>
              <Text style={[styles.uploadHint, { color: colors.textMuted }]}>
                Accepted formats: PDF, JPG, PNG, or WEBP; maximum 10 MB. A successful upload is what starts review.
              </Text>
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
                    {feedback}
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
  outlook: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  outlookLabel: { fontSize: FontSize.xs, letterSpacing: 1 },
  outlookText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
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
  uploadHint: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  feedback: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  feedbackText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
