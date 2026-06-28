/**
 * EducatorOnboarding — the institutional/administrator entry flow (Part 1, the
 * educator fork of onboarding). Mirrors OnboardingFlow's 3-step Stepper shape:
 *
 *   Step 1  Your organisation   → OrganizationType + name + role
 *   Step 2  Verify              → work email / registry code (intent only)
 *   Step 3  Confirm             → summary → Enter dashboard
 *
 * Finishing persists the educator profile locally (src/lib/educatorProfile.ts —
 * the seam to swap for a real endpoint later), flips the local account type so
 * routing sends them to the admin side, fires a (currently coming_soon)
 * verification submit, completes onboarding on the backend, then lands on
 * /(admin). Verification stays pending: we capture intent, not proof.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, Brand, webContainer } from "../../theme";
import { SifterButton } from "../../components/ui";
import { useAuth } from "../../hooks/useAuth";
import { API } from "../../lib/api";
import { saveEducatorProfile } from "../../lib/educatorProfile";
import { setLocalAccountType } from "../../lib/accountType";
import { adminData } from "../../lib/adminData";
import type {
  AccountType,
  OrganizationType,
  OrgRole,
  VerificationStatus,
  VerificationMethod,
  EducatorProfile,
} from "../../types/institution";
import {
  Stepper,
  OptionCard,
  ChoiceChips,
  SearchField,
} from "../../components/onboarding/primitives";

// ─── Organisation types ───────────────────────────────────────
const ORGS: {
  type: OrganizationType;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    type: "secondary_school",
    icon: "🏫",
    title: "Secondary school",
    subtitle: "SS1–SS3 guidance & counselling — your students' programme paths",
  },
  {
    type: "university",
    icon: "🎓",
    title: "University / polytechnic",
    subtitle: "Faculty, department or institution-wide programme intelligence",
  },
  {
    type: "tutorial_centre",
    icon: "📚",
    title: "Tutorial centre",
    subtitle:
      "Provider/session — career guidance with students, no student roster",
  },
  {
    type: "jamb_cafe",
    icon: "🖥️",
    title: "JAMB registration café",
    subtitle:
      "Provider/session — career guidance with students, no student roster",
  },
];

/** Roles offered per organisation type. */
const ROLES_FOR: Record<OrganizationType, { label: string; value: OrgRole }[]> =
  {
    secondary_school: [
      { label: "Owner / Principal", value: "owner" },
      { label: "Counsellor", value: "counsellor" },
    ],
    university: [
      { label: "Course advisor", value: "course_advisor" },
      { label: "HOD", value: "hod" },
      { label: "Dean", value: "dean" },
      { label: "Owner / Administrator", value: "owner" },
    ],
    tutorial_centre: [{ label: "Owner / Operator", value: "owner" }],
    jamb_cafe: [{ label: "Owner / Operator", value: "owner" }],
  };

/** Centres/cafés are provider/session only — never a student roster. */
function isProviderSession(t: OrganizationType): boolean {
  return t === "tutorial_centre" || t === "jamb_cafe";
}

/** Registry-code label adapts to the organisation type. */
function registryLabel(t: OrganizationType): string {
  switch (t) {
    case "university":
      return "JAMB / NUC institution code (optional)";
    case "secondary_school":
      return "State MoE approval no. (optional)";
    default:
      return "CAC registration no. (optional)";
  }
}

/**
 * University owners/deans run institution-wide management → institution_admin.
 * Everyone else (counsellors, advisors, HODs, centre operators) → educator.
 */
function accountTypeFor(
  t: OrganizationType,
  role: OrgRole | undefined,
): Exclude<AccountType, "student"> {
  if (t === "university" && (role === "owner" || role === "dean")) {
    return "institution_admin";
  }
  return "educator";
}

export default function EducatorOnboarding() {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshUser } = useAuth();

  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState<OrganizationType | undefined>();
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState<OrgRole | undefined>();
  const [workEmail, setWorkEmail] = useState("");
  const [registryCode, setRegistryCode] = useState("");
  const [finishing, setFinishing] = useState(false);

  const back = () => setStep((s) => Math.max(1, s - 1));

  const pickOrg = (t: OrganizationType) => {
    setOrgType(t);
    // Reset a role that no longer applies to the newly chosen type.
    setRole((prev) =>
      prev && ROLES_FOR[t].some((r) => r.value === prev) ? prev : undefined,
    );
  };

  const step1Ready = !!orgType && orgName.trim().length > 0 && !!role;

  const finish = async () => {
    if (!orgType || !role) return;
    setFinishing(true);

    const accountType = accountTypeFor(orgType, role);
    const hasEmail = workEmail.trim().length > 0;
    // A work email is a claim awaiting domain proof; no email = a softer claim.
    const verificationStatus: VerificationStatus = hasEmail
      ? "claimed"
      : "pending";
    const verificationMethod: VerificationMethod = hasEmail
      ? "email_domain"
      : "document_upload";

    const profile: EducatorProfile = {
      accountType,
      organizationType: orgType,
      organizationName: orgName.trim(),
      role,
      workEmail: hasEmail ? workEmail.trim() : undefined,
      verificationStatus,
      verificationMethod,
      completedAt: new Date().toISOString(),
      // Centres/cafés are provider/session only — captured for downstream gating.
      ...(isProviderSession(orgType) ? { providerSessionOnly: true } : {}),
    } as EducatorProfile & { providerSessionOnly?: boolean };

    await saveEducatorProfile(profile);
    await setLocalAccountType(accountType);

    try {
      // coming_soon now — fired so the seam is exercised; result ignored.
      await adminData.submitVerification(profile);
      await API.completeOnboarding({});
      await refreshUser();
    } catch {
      // Even if the network calls fail, the local profile + account type are
      // saved, so routing into the admin side still works. Proceed.
    } finally {
      router.replace("/(admin)");
    }
  };

  const roleOptions = orgType ? ROLES_FOR[orgType] : [];

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Stepper step={step} total={3} onBack={step > 1 ? back : undefined} />

      {/* ── Step 1: Your organisation ── */}
      {step === 1 ? (
        <View style={{ gap: Spacing.md }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Your organisation
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            Tell us where you guide students from. Tutorial centres and JAMB
            cafés operate as a provider/session — career guidance with students,
            no student roster.
          </Text>

          {ORGS.map((o) => (
            <OptionCard
              key={o.type}
              icon={o.icon}
              title={o.title}
              subtitle={o.subtitle}
              selected={orgType === o.type}
              onPress={() => pickOrg(o.type)}
            />
          ))}

          {orgType ? (
            <View style={{ gap: Spacing.lg, marginTop: Spacing.sm }}>
              <SearchField
                label="Organisation name"
                value={orgName}
                onChangeText={setOrgName}
                placeholder="e.g. Federal Government College, Lagos"
              />
              <ChoiceChips
                label="Your role"
                options={roleOptions}
                value={role}
                onChange={(v) => setRole(v as OrgRole)}
              />
            </View>
          ) : null}

          <SifterButton
            label="Continue →"
            onPress={() => setStep(2)}
            disabled={!step1Ready}
            variant="track"
            color={Brand.primary}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}

      {/* ── Step 2: Verify your institution ── */}
      {step === 2 ? (
        <View style={{ gap: Spacing.lg }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Verify your institution
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            You can explore national aggregate intelligence right away. Verifying
            unlocks your institution's own dashboard — the programmes, domains
            and demand specific to you. We'll capture your claim now; review
            happens during the institutional rollout, so verification stays
            pending until then.
          </Text>

          <SearchField
            label="Institutional work email (optional)"
            value={workEmail}
            onChangeText={setWorkEmail}
            placeholder="you@yourinstitution.edu.ng"
          />

          <SearchField
            label={orgType ? registryLabel(orgType) : "Registry code (optional)"}
            value={registryCode}
            onChangeText={setRegistryCode}
            placeholder="Enter code if you have it"
          />

          <Text style={[styles.note, { color: colors.textMuted }]}>
            📄 No document needed right now. You'll be able to upload proof of
            affiliation later — your dashboard stays in the national-aggregate
            tier until verification completes.
          </Text>

          <SifterButton
            label="Continue →"
            onPress={() => setStep(3)}
            variant="track"
            color={Brand.primary}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}

      {/* ── Step 3: Confirm ── */}
      {step === 3 ? (
        <View style={{ gap: Spacing.xl }}>
          <View style={{ gap: Spacing.xs }}>
            <Text style={[styles.title, { color: colors.text }]}>
              Confirm your details
            </Text>
            <Text style={[styles.sub, { color: colors.textSoft }]}>
              You can refine any of this from your dashboard later.
            </Text>
          </View>

          <View
            style={[
              styles.summary,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <SummaryRow
              label="Organisation"
              value={
                ORGS.find((o) => o.type === orgType)?.title ?? "—"
              }
            />
            <SummaryRow label="Name" value={orgName.trim() || "—"} />
            <SummaryRow
              label="Role"
              value={
                roleOptions.find((r) => r.value === role)?.label ?? "—"
              }
            />
            <SummaryRow
              label="Work email"
              value={workEmail.trim() || "Not provided"}
            />
            {orgType ? (
              <SummaryRow
                label="Registry code"
                value={registryCode.trim() || "Not provided"}
              />
            ) : null}
            <SummaryRow label="Access tier" value="National aggregate (pending verification)" />
            {orgType && isProviderSession(orgType) ? (
              <SummaryRow label="Mode" value="Provider / session — no roster" />
            ) : null}
          </View>

          <SifterButton
            label="Enter dashboard →"
            onPress={finish}
            loading={finishing}
            variant="track"
            color={Brand.primary}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}
    </ScrollView>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.summaryRow}>
      <Text style={[styles.summaryLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <Text style={[styles.summaryValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  note: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  summary: {
    borderWidth: 1,
    borderRadius: 14,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: Spacing.md,
  },
  summaryLabel: { fontSize: FontSize.sm, fontWeight: "600" },
  summaryValue: {
    fontSize: FontSize.sm,
    fontWeight: "700",
    flexShrink: 1,
    textAlign: "right",
  },
});
