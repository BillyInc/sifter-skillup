/**
 * EducatorOnboarding is the institutional/administrator entry flow.
 *
 * Step 1: organisation type, name, and role
 * Step 2: owner-issued access code
 * Step 3: work email / registry-code intent
 * Step 4: summary and dashboard entry
 *
 * Finishing creates the admin workspace through the backend, completes
 * onboarding, stores the educator profile for routing, and lands on the
 * correct admin workspace. Access code is not proof; verification stays pending.
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, CompassFonts, webContainer } from "@/theme";
import { SifterButton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/lib/api";
import { saveEducatorProfile } from "@/lib/educatorProfile";
import { setLocalAccountType } from "@/lib/accountType";
import { adminData } from "@/lib/adminData";
import { adminHomeForProfile } from "@/lib/adminAudience";
import { clearOnboardingDraft, getOnboardingDraft, patchOnboardingDraft } from "@/lib/onboardingDraft";
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
} from "@/components/onboarding/primitives";

// Organisation types.
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
    title: "Tutorial centre / JAMB lesson provider",
    subtitle:
      "Provider/session guidance for students preparing applications",
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
    tutorial_centre: [
      { label: "Owner / Operator", value: "owner" },
      { label: "Tutor / Counsellor", value: "counsellor" },
    ],
    jamb_cafe: [{ label: "Owner / Operator", value: "owner" }],
  };

/** Centres/cafes are provider/session only, never a student roster. */
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
 * Owners/deans run institution-wide management as institution_admin.
 * Everyone else (counsellors, advisors, HODs, tutors) is an educator.
 */
function accountTypeFor(
  t: OrganizationType,
  role: OrgRole | undefined,
): Exclude<AccountType, "pending" | "student"> {
  if (role === "owner" || (t === "university" && role === "dean")) {
    return "institution_admin";
  }
  return "educator";
}

interface EducatorOnboardingProps {
  /**
   * Return to the persona picker. Optional so the screen still works when
   * routed to directly, where there are no choices to go back to.
   */
  onBackToChoices?: () => void;
}

export default function EducatorOnboarding({
  onBackToChoices,
}: EducatorOnboardingProps = {}) {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshUser, user } = useAuth();

  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState<OrganizationType | undefined>();
  const [orgName, setOrgName] = useState("");
  const [role, setRole] = useState<OrgRole | undefined>();
  const [workEmail, setWorkEmail] = useState("");
  const [registryCode, setRegistryCode] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [checkingAccess, setCheckingAccess] = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [finishError, setFinishError] = useState<string | null>(null);
  const draftLoaded = useRef(false);

  useEffect(() => {
    let active = true;
    getOnboardingDraft(user?.id).then((draft) => {
      if (!active) return;
      if (draft?.mode === "educator") {
        if (draft.step) setStep(draft.step);
        const saved = draft.educatorProfile;
        if (saved) {
          setOrgType(saved.organizationType);
          setOrgName(saved.organizationName ?? "");
          setRole(saved.role);
          setWorkEmail(saved.workEmail ?? "");
          setRegistryCode(saved.registryCode ?? "");
          setAccessCode(saved.accessCode ?? "");
          setAccessGranted(Boolean(saved.accessGranted));
        }
      }
      draftLoaded.current = true;
    });
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!draftLoaded.current) return;
    patchOnboardingDraft(user?.id, {
      mode: "educator",
      choice: "educator",
      step,
      educatorProfile: {
        organizationType: orgType,
        organizationName: orgName,
        role,
        workEmail,
        registryCode,
        accessCode,
        accessGranted,
      },
    }).catch(() => {});
  }, [accessCode, accessGranted, orgName, orgType, registryCode, role, step, user?.id, workEmail]);

  const back = () => setStep((s) => Math.max(1, s - 1));

  const pickOrg = (t: OrganizationType) => {
    setOrgType(t);
    // Reset a role that no longer applies to the newly chosen type.
    setRole((prev) =>
      prev && ROLES_FOR[t].some((r) => r.value === prev) ? prev : undefined,
    );
    setAccessGranted(false);
    setAccessError(null);
  };

  const step1Ready = !!orgType && orgName.trim().length > 0 && !!role;

  const validateAccessCode = async () => {
    const code = accessCode.trim().toUpperCase();
    if (!code) {
      setAccessError("Enter the access code issued by the Sifter owner.");
      return;
    }
    setCheckingAccess(true);
    setAccessError(null);
    try {
      await adminData.validateAdminAccessCode({
        code,
        organizationType: orgType,
        organizationName: orgName.trim(),
      });
      setAccessCode(code);
      setAccessGranted(true);
      setStep(3);
    } catch (e) {
      setAccessGranted(false);
      setAccessError((e as Error)?.message ?? "Invalid or expired admin access code.");
    } finally {
      setCheckingAccess(false);
    }
  };

  const finish = async () => {
    if (!orgType || !role) return;
    setFinishing(true);
    setFinishError(null);

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
      registryCode: registryCode.trim() || undefined,
      verificationStatus,
      verificationMethod,
      adminAccessStatus: "owner_code",
      adminAccessGrantedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
      // Centres/cafes are provider/session only; downstream screens use this for gating.
      ...(isProviderSession(orgType) ? { providerSessionOnly: true } : {}),
    } as EducatorProfile & { providerSessionOnly?: boolean };

    try {
      // The backend must create a real workspace; coming_soon is treated as failure.
      const verification = await adminData.submitVerification(profile);
      if (verification.status !== "real" || !verification.data) {
        throw new Error(
          verification.meta?.notice ??
            "Could not create the admin workspace right now.",
        );
      }
      await API.completeOnboarding({ account_type: accountType });
      await refreshUser();
      await saveEducatorProfile(profile, user?.id);
      await setLocalAccountType(accountType, user?.id);
      await clearOnboardingDraft(user?.id);
      router.replace(adminHomeForProfile(profile) as any);
    } catch (e) {
      setFinishError((e as Error)?.message ?? "Could not finish admin onboarding.");
    } finally {
      setFinishing(false);
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
      {/*
        On step 1 there is no earlier step, so `back` is undefined and the
        Stepper rendered no control at all -- an educator who picked this
        persona had no way back to the picker short of a browser reload.
        Falling through to onBackToChoices gives step 1 a real destination.
      */}
      <Stepper step={step} total={4} onBack={step > 1 ? back : onBackToChoices} />

      {/* Step 1: Your organisation */}
      {step === 1 ? (
        <View style={{ gap: Spacing.md }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Your organisation
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            Tell us where you guide students from. Universities look inward at
            their programmes; secondary schools and tutorial centres look
            outward across universities, domains and roles.
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
            color={colors.accentRole.action}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}

      {/* Step 2: Verify your institution */}
      {step === 2 ? (
        <View style={{ gap: Spacing.lg }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Enter admin access code
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            Institution and tutorial-centre dashboards are currently invite-only.
            Request this code from the Sifter owner. This unlocks admin mode only;
            it does not prove ownership or replace verification.
          </Text>

          <SearchField
            label="Owner-issued admin access code"
            value={accessCode}
            onChangeText={(value) => {
              setAccessCode(value.toUpperCase());
              setAccessError(null);
              setAccessGranted(false);
            }}
            placeholder="EDU-XXXX-XXXX-XXXX-XXXX"
          />

          {accessError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {accessError}
            </Text>
          ) : null}

          <Text style={[styles.note, { color: colors.textMuted }]}>
            This is separate from student claim codes and school affiliation
            codes. Students never use this code.
          </Text>

          <SifterButton
            label="Unlock admin setup →"
            onPress={validateAccessCode}
            loading={checkingAccess}
            variant="track"
            color={colors.accentRole.action}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}

      {/* Step 3: Verify your institution */}
      {step === 3 ? (
        <View style={{ gap: Spacing.lg }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Verify your institution
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            You can explore national aggregate intelligence right away. Verifying
            unlocks your institution&apos;s own dashboard — the programmes, domains
            and demand specific to you. We&apos;ll capture your claim now; review
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
            📄 No document needed right now. You&apos;ll be able to upload proof of
            affiliation later — your dashboard stays in the national-aggregate
            tier until verification completes.
          </Text>

          <SifterButton
            label="Continue →"
            onPress={() => setStep(4)}
            variant="track"
            color={colors.accentRole.action}
            size="lg"
            fullWidth
          />
        </View>
      ) : null}

      {/* Step 4: Confirm */}
      {step === 4 ? (
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
            <SummaryRow
              label="Admin gate"
              value={accessGranted ? "Owner code accepted" : "Code required"}
            />
            {orgType && isProviderSession(orgType) ? (
              <SummaryRow label="Mode" value="Provider / session — no roster" />
            ) : null}
          </View>

          {finishError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {finishError}
            </Text>
          ) : null}

          <SifterButton
            label="Enter dashboard →"
            onPress={finish}
            loading={finishing}
            disabled={!accessGranted}
            variant="track"
            color={colors.accentRole.action}
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
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  note: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  error: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.4,
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
  summaryLabel: { fontSize: FontSize.sm },
  summaryValue: {
    fontSize: FontSize.sm,
    flexShrink: 1,
    textAlign: "right",
  },
});
