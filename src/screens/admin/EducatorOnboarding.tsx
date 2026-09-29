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
import { Linking, View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, webContainer } from "@/theme";
import { SifterButton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { API } from "@/lib/api";
import { saveEducatorProfile } from "@/lib/educatorProfile";
import { setLocalAccountType } from "@/lib/accountType";
import { adminData } from "@/lib/adminData";
import { shouldRestoreEducatorDraft } from "@/lib/educatorOnboardingFlow";
import { adminHomeForProfile } from "@/lib/adminAudience";
import { clearOnboardingDraft, getOnboardingDraft, patchOnboardingDraft } from "@/lib/onboardingDraft";
import type {
  AccountType,
  OrganizationType,
  OrgRole,
  VerificationStatus,
  EducatorProfile,
} from "../../types/institution";
import {
  Stepper,
  OptionCard,
  ChoiceChips,
  SearchField,
} from "@/components/onboarding/primitives";
import { LiveAdmissionSearchField } from "@/components/onboarding/LiveAdmissionSearchField";
import LocalLegalNotice from "@/components/LocalLegalNotice";

const ADMIN_ACCESS_REQUEST_EMAIL =
  process.env.EXPO_PUBLIC_ADMIN_ACCESS_EMAIL?.trim() || "learn@sifter.app";
const DEV_ADMIN_ACCESS_CODE = "LEVELUP-EDU-DEV";
const isStagingOrLocalHost = () => {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname.toLowerCase();
  return host === "localhost" || host === "127.0.0.1" || host.startsWith("dev.");
};
const SHOW_DEVELOPER_ACCESS =
  (typeof __DEV__ !== "undefined" && __DEV__) ||
  isStagingOrLocalHost();

// Organisation types.
const ORGS: {
  type: OrganizationType;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    type: "secondary_school",
    icon: "S",
    title: "Secondary school",
    subtitle: "Guide SS1 to SS3 students through subjects and programme choices",
  },
  {
    type: "university",
    icon: "U",
    title: "University",
    subtitle: "Guide students using your university's programmes and requirements",
  },
  {
    type: "tutorial_centre",
    icon: "T",
    title: "Tutorial centre / JAMB lesson provider",
    subtitle:
      "Support students preparing for JAMB and university applications",
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

export default function EducatorOnboarding({
  onBackToChoices,
}: {
  onBackToChoices?: () => void;
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const { refreshUser, user } = useAuth();

  const [step, setStep] = useState(1);
  const [orgType, setOrgType] = useState<OrganizationType | undefined>();
  const [orgName, setOrgName] = useState("");
  const [orgAddress, setOrgAddress] = useState("");
  const [orgId, setOrgId] = useState<string | undefined>();
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
  const organisationChosenDuringLoad = useRef(false);

  useEffect(() => {
    let active = true;
    getOnboardingDraft(user?.id).then((draft) => {
      if (!active) return;
      if (draft?.mode === "educator") {
        // A slow draft read must not undo the organisation the user just
        // selected. This was perceived as the first click collapsing the
        // Admin / Secondary School details; the second click happened after
        // this asynchronous restore had finished.
        if (shouldRestoreEducatorDraft(organisationChosenDuringLoad.current) && draft.step) setStep(draft.step);
        const saved = draft.educatorProfile;
        if (saved && shouldRestoreEducatorDraft(organisationChosenDuringLoad.current)) {
          setOrgType(saved.organizationType);
          setOrgName(saved.organizationName ?? "");
          setOrgAddress(saved.organizationAddress ?? "");
          setOrgId(saved.organizationId);
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
        organizationAddress: orgAddress,
        organizationId: orgId,
        role,
        workEmail,
        registryCode,
        accessCode,
        accessGranted,
      },
    }).catch(() => {});
  }, [accessCode, accessGranted, orgAddress, orgId, orgName, orgType, registryCode, role, step, user?.id, workEmail]);

  const back = () => setStep((s) => Math.max(1, s - 1));

  const pickOrg = (t: OrganizationType) => {
    organisationChosenDuringLoad.current = true;
    if (orgType !== t) {
       setOrgName("");
       setOrgAddress("");
       setOrgId(undefined);
      setRole(undefined);
      setWorkEmail("");
      setRegistryCode("");
      setAccessCode("");
      setAccessGranted(false);
      setAccessError(null);
      setFinishError(null);
    }
    setOrgType(t);
  };

  const organisationLabel = orgType === "university"
    ? "University"
    : orgType === "secondary_school"
      ? "Secondary school"
      : "Tutorial centre";

  const requestAccessCode = () => {
    const subject = encodeURIComponent("Sifter LevelUp admin access request");
    const body = encodeURIComponent(
      `Organisation type: ${organisationLabel}\n` +
      `Organisation name: ${orgName.trim() || "Not entered"}\n` +
      `Role: ${role || "Not selected"}\n` +
      `Work email: ${workEmail.trim() || "Not entered"}\n\n` +
      "Please issue or confirm the appropriate admin access code.",
    );
    Linking.openURL(`mailto:${ADMIN_ACCESS_REQUEST_EMAIL}?subject=${subject}&body=${body}`).catch(() => {
      setAccessError(`Email could not be opened. Contact ${ADMIN_ACCESS_REQUEST_EMAIL} for an access code.`);
    });
  };

  // Every administrator must provide a physical address. Developer access only
  // changes the access-code gate; it never weakens organisation identity.
  const canUseDeveloperWorkspace = SHOW_DEVELOPER_ACCESS && orgName.trim().length > 0;
  const step1Ready =
    !!orgType &&
    !!role &&
    (!!orgId || canUseDeveloperWorkspace) &&
    orgAddress.trim().length >= 8;

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

  const useDevelopmentAccessCode = () => {
    setAccessCode(DEV_ADMIN_ACCESS_CODE);
    setAccessError(null);
    setAccessGranted(false);
  };

  const finish = async () => {
    if (!orgType || !role) return;
    setFinishing(true);
    setFinishError(null);

    const accountType = accountTypeFor(orgType, role);
    // Creating the workspace records a claim. Work email and registry fields
    // are identity anchors, not proof submission by themselves.
    const verificationStatus: VerificationStatus = "claimed";

    const profile: EducatorProfile = {
      accountType,
      organizationType: orgType,
      organizationName: orgName.trim(),
      organizationAddress: orgAddress.trim(),
      organizationId: orgId,
      role,
      workEmail: workEmail.trim() || undefined,
      registryCode: registryCode.trim() || undefined,
      verificationStatus,
      adminAccessStatus: "owner_code",
      accessCode: accessCode.trim().toUpperCase(),
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
      <Stepper step={step} total={4} onBack={step > 1 ? back : onBackToChoices} />

      {/* Step 1: Your organisation */}
      {step === 1 ? (
        <View style={{ gap: Spacing.md }}>
          <Text style={[styles.title, { color: colors.text }]}>
            Your organisation
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            Choose the organisation where you guide students. We will tailor the
            workspace to your institution and the students you support.
          </Text>

          {ORGS.map((o) => (
            <OptionCard
              key={o.type}
              icon={o.title.slice(0, 1)}
              title={o.title}
              subtitle={o.subtitle}
              selected={orgType === o.type}
              accessibilityLabel={`${o.title} organisation`}
              onPress={() => pickOrg(o.type)}
            />
          ))}

          {orgType ? (
            <View style={{ gap: Spacing.lg, marginTop: Spacing.sm }}>
              <LiveAdmissionSearchField
                label={organisationLabel}
                value={orgName}
                selectedId={orgId}
                 onSelect={(item) => {
                   setOrgName(item.name);
                   setOrgId(item.id || undefined);
                   setOrgAddress([item.address, item.city, item.state, item.country].filter(Boolean).join(", "));
                 }}
                placeholder={orgType === "university" ? "Search your university" : "Search your organisation"}
                 kind="school"
                  institutionType={orgType}
                  allowRegister={orgType !== "university"}
                  registerAddress={orgAddress}
                  registerAddressRequired
                 helperText={orgType === "university"
                   ? "Choose your university from the list so its programme records stay connected."
                   : "Select your organisation if it is listed, or add its name so other educators can find it."}
              />
              <View style={{ gap: Spacing.xs }}>
                 <Text style={[styles.fieldLabel, { color: colors.text }]}>
                    Organisation address (required)
                </Text>
                <TextInput
                  value={orgAddress}
                  onChangeText={setOrgAddress}
                  placeholder="Street, area, city, state"
                  placeholderTextColor={colors.textSoft}
                  multiline
                  style={[styles.addressInput, { color: colors.text, borderColor: colors.border, backgroundColor: colors.card }]}
                />
                   {orgAddress ? (
                     <TouchableOpacity onPress={() => setOrgAddress("")} accessibilityRole="button">
                       <Text style={[styles.sub, { color: colors.accentRole.action }]}>Clear address</Text>
                     </TouchableOpacity>
                   ) : null}
                   <Text style={[styles.sub, { color: colors.textSoft }]}>Use the full address so people can distinguish organisations with similar names.</Text>
              </View>
              <ChoiceChips
                label="Your role"
                options={roleOptions}
                value={role}
                onChange={(v) => setRole(v as OrgRole)}
              />
            </View>
          ) : null}

          <SifterButton
            label="Continue ->"
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
            Owners request an access code from the Sifter team. Staff and
            counsellors ask their organisation owner to invite them or issue a
            code. The code opens the admin setup; it does not replace identity
            or institution verification.
          </Text>
          <Text style={[styles.note, { color: colors.textMuted }]}>
            Owner requests are sent to {ADMIN_ACCESS_REQUEST_EMAIL}. Staff should
            receive their code directly from the organisation owner.
          </Text>

          <SearchField
            label="Admin access code"
            value={accessCode}
            onChangeText={(value) => {
              setAccessCode(value.toUpperCase());
              setAccessError(null);
              setAccessGranted(false);
            }}
            placeholder="Enter the code you received"
          />

          {accessError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {accessError}
            </Text>
          ) : null}

          <Text style={[styles.note, { color: colors.textMuted }]}>
            This code is only for educators and institution administrators. A
            student account does not need it.
          </Text>

          {SHOW_DEVELOPER_ACCESS ? (
            <View style={styles.devTools}>
              <Text style={[styles.devHint, { color: colors.accentRole.action }]}>Development test code: {DEV_ADMIN_ACCESS_CODE}</Text>
              <TouchableOpacity
                onPress={useDevelopmentAccessCode}
                style={[styles.devAction, { borderColor: colors.accentRole.action }]}
              >
                <Text style={[styles.devActionText, { color: colors.accentRole.action }]}>Use development code</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            onPress={requestAccessCode}
            style={[styles.requestCode, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.requestCodeText, { color: colors.textRole.primary }]}>Request an access code</Text>
            <Text style={[styles.note, { color: colors.textMuted }]}>Owners contact Sifter. Staff contact the owner of their organisation.</Text>
          </TouchableOpacity>

          <SifterButton
            label="Unlock admin setup ->"
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
          <LocalLegalNotice audience="institution" />
          <Text style={[styles.title, { color: colors.text }]}>
            Verify your institution
          </Text>
          <Text style={[styles.sub, { color: colors.textSoft }]}>
            Add your work details so the workspace can be connected to your
            organisation. Verification may be completed later; you can still
            finish setting up your guidance workspace now.
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
            You do not need to upload a document now. We can request proof of
            affiliation later if the organisation needs verification.
          </Text>

          <SifterButton
            label="Continue ->"
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
              Check these details before you open the workspace. You can update
              them later from settings.
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
                ORGS.find((o) => o.type === orgType)?.title ?? "Not selected"
              }
            />
            <SummaryRow label="Name" value={orgName.trim() || "—"} />
            <SummaryRow
              label="Role"
              value={
                roleOptions.find((r) => r.value === role)?.label ?? "-"
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
            <SummaryRow label="Workspace access" value="Ready after code approval" />
            <SummaryRow
              label="Admin gate"
              value={accessGranted ? "Owner code accepted" : "Code required"}
            />
            {orgType && isProviderSession(orgType) ? (
              <SummaryRow label="Mode" value="Guidance sessions; no student roster" />
            ) : null}
          </View>

          {finishError ? (
            <Text style={[styles.error, { color: colors.danger }]}>
              {finishError}
            </Text>
          ) : null}

          <SifterButton
            label="Open my workspace"
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
  requestCode: {
    borderWidth: 1,
    borderRadius: 10,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  requestCodeText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
  },
  devHint: {
    fontSize: FontSize.xs,
    fontWeight: "700",
  },
  devTools: {
    gap: Spacing.xs,
  },
  devAction: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  devActionText: {
    fontSize: FontSize.sm,
    fontWeight: "700",
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
  fieldLabel: { fontSize: FontSize.sm, fontWeight: "700" },
  addressInput: {
    minHeight: 78,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    textAlignVertical: "top",
    fontSize: FontSize.sm,
  },
});
