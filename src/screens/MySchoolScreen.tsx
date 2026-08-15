/**
 * MySchoolScreen — the student-side surface for the provisioning feature.
 *
 * Two independent actions:
 *   1. Redeem a claim code — a school created your account and gave you a
 *      printed/shared code. Redeeming makes the account yours (phone-first
 *      identity; email optional). If you already had an account, the server
 *      merges the two automatically.
 *   2. Link your school by code — self-affiliate. This is aggregate-only by
 *      default; you then explicitly CHOOSE whether to share your individual
 *      progress. Sharing is per-school and can be turned off anytime.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  type TextInputProps,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  useTheme,
  CompassFonts,
  Spacing,
  Radius,
  FontSize,
  Shadow,
  webContainer,
} from "@/theme";
import { studentAccountApi } from "@/lib/provisioningData";
import { useAuth } from "@/hooks/useAuth";
import type { StudentConsentRequest } from "@/types/institution";

type AffiliateResult = { schoolId: string; schoolName?: string } | null;

function ClearableInput({ value, onChangeText, ...props }: TextInputProps) {
  const { colors } = useTheme();
  return (
    <View style={styles.inputWrap}>
      <TextInput
        {...props}
        value={value}
        onChangeText={onChangeText}
        style={[styles.input, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.base }, props.style]}
      />
      {value ? (
        <TouchableOpacity
          onPress={() => onChangeText?.("")}
          accessibilityRole="button"
          accessibilityLabel="Clear input"
          style={styles.clearInput}
          hitSlop={8}
        >
          <Text style={{ color: colors.textRole.muted, fontSize: FontSize.md }}>×</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export default function MySchoolScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ claim?: string | string[]; from?: string | string[] }>();
  const { refreshUser, user } = useAuth();
  const fromGuest = (Array.isArray(params.from) ? params.from[0] : params.from) === "guest";

  // Claim
  const [claimCode, setClaimCode] = useState(() => {
    const value = params.claim;
    return (Array.isArray(value) ? value[0] : value) ?? "";
  });
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [claimBusy, setClaimBusy] = useState(false);
  const [claimMsg, setClaimMsg] = useState<string | null>(null);
  const [claimErr, setClaimErr] = useState<string | null>(null);

  // Affiliate + consent
  const [schoolCode, setSchoolCode] = useState("");
  const [affBusy, setAffBusy] = useState(false);
  const [affErr, setAffErr] = useState<string | null>(null);
  const [affiliated, setAffiliated] = useState<AffiliateResult>(null);
  const [consentBusy, setConsentBusy] = useState(false);
  const [consentState, setConsentState] = useState<"none" | "shared">("none");
  const [consentRequests, setConsentRequests] = useState<StudentConsentRequest[]>([]);
  const [requestBusy, setRequestBusy] = useState<string | null>(null);
  const [requestErr, setRequestErr] = useState<string | null>(null);

  const guestAuthPath = useCallback((route: "signup" | "sign-in") => {
    const query = [
      claimCode.trim() ? `claim=${encodeURIComponent(claimCode.trim())}` : "",
      schoolCode.trim() ? `school_code=${encodeURIComponent(schoolCode.trim())}` : "",
    ].filter(Boolean).join("&");
    return `/(auth)/${route}${query ? `?${query}` : ""}` as any;
  }, [claimCode, schoolCode]);

  const loadConsentRequests = useCallback(async () => {
    try {
      setConsentRequests(await studentAccountApi.listConsentRequests());
    } catch {
      // The privacy migration may not be deployed yet; other school actions
      // remain available while the invitation list is empty.
      setConsentRequests([]);
    }
  }, []);

  useEffect(() => {
    void loadConsentRequests();
  }, [loadConsentRequests]);

  const doClaim = useCallback(async () => {
    setClaimErr(null);
    setClaimMsg(null);
    const code = claimCode.trim();
    if (!code) {
      setClaimErr("Enter the claim code from your card.");
      return;
    }
    if (user?.auth_provider === "guest") {
      router.replace(guestAuthPath("signup"));
      return;
    }
    setClaimBusy(true);
    try {
      await studentAccountApi.claim({
        code,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
      });
      await refreshUser?.();
      await loadConsentRequests();
      setClaimMsg("Your account is now yours. You're all set.");
      setClaimCode("");
    } catch (e) {
      setClaimErr((e as Error)?.message ?? "Could not claim the account.");
    } finally {
      setClaimBusy(false);
    }
  }, [claimCode, phone, email, refreshUser, loadConsentRequests, router, guestAuthPath, user?.auth_provider]);

  const doAffiliate = useCallback(async () => {
    setAffErr(null);
    const code = schoolCode.trim();
    if (!code) {
      setAffErr("Enter your school's code.");
      return;
    }
    if (user?.auth_provider === "guest") {
      router.replace(guestAuthPath("signup"));
      return;
    }
    setAffBusy(true);
    try {
      const r = await studentAccountApi.affiliate(code);
      setAffiliated({ schoolId: r.schoolId, schoolName: r.schoolName });
      setConsentState("none");
    } catch (e) {
      setAffErr((e as Error)?.message ?? "Could not find that school.");
    } finally {
      setAffBusy(false);
    }
  }, [guestAuthPath, router, schoolCode, user?.auth_provider]);

  const setConsent = useCallback(
    async (share: boolean) => {
      if (!affiliated) return;
      setConsentBusy(true);
      try {
        if (share) {
          await studentAccountApi.grantConsent(affiliated.schoolId);
          setConsentState("shared");
        } else {
          await studentAccountApi.revokeConsent(affiliated.schoolId);
          setConsentState("none");
        }
      } catch {
        /* leave state unchanged on failure */
      } finally {
        setConsentBusy(false);
      }
    },
    [affiliated],
  );

  const respondToRequest = useCallback(async (item: StudentConsentRequest, decision: "grant" | "decline") => {
    if (requestBusy) return;
    setRequestBusy(item.id);
    setRequestErr(null);
    try {
      await studentAccountApi.respondToConsentRequest(item.id, decision);
      await loadConsentRequests();
      if (decision === "grant") {
        setAffiliated({ schoolId: item.schoolId, schoolName: item.schoolName ?? undefined });
        setConsentState("shared");
      }
    } catch (e) {
      setRequestErr((e as Error)?.message ?? "Could not update that consent request.");
    } finally {
      setRequestBusy(null);
    }
  }, [loadConsentRequests, requestBusy]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.surface.base }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.back}>
          <Text style={[styles.backText, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={[styles.h1, { color: colors.textRole.primary }, CompassFonts.displayBold]}>My school</Text>
        {fromGuest ? (
          <View style={[styles.card, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.cardBody, { color: colors.textRole.primary }, CompassFonts.body]}>You are browsing as a guest. Link a school code now, or create/log in to keep your school connection.</Text>
            <View style={{ flexDirection: "row", gap: Spacing.sm }}>
              <TouchableOpacity onPress={() => router.replace(guestAuthPath("signup"))} style={[styles.choice, { borderColor: colors.borderRole.subtle }]}><Text style={{ color: colors.textRole.primary }}>Create account</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => router.replace(guestAuthPath("sign-in"))} style={[styles.choice, { borderColor: colors.borderRole.subtle }]}><Text style={{ color: colors.textRole.primary }}>Log in</Text></TouchableOpacity>
            </View>
          </View>
        ) : null}

        {consentRequests.length ? (
          <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
            <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>School permission requests</Text>
            <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>
              A school can ask to follow your progress, but it cannot see your individual account until you choose. Your account stays available even when you keep it private.
            </Text>
            {consentRequests.map((item) => (
              <View key={item.id} style={[styles.consentBox, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                <Text style={[styles.consentTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{item.schoolName ?? "Your school"}</Text>
                {item.schoolAddress ? <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>{item.schoolAddress}</Text> : null}
                <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>
                  Requested access: {item.scope === "progress" ? "career progress" : item.scope === "full" ? "progress and contact" : "contact"}.
                </Text>
                {item.message ? <Text style={[styles.cardBody, { color: colors.textRole.primary }, CompassFonts.body]}>{item.message}</Text> : null}
                <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                  <TouchableOpacity onPress={() => void respondToRequest(item, "grant")} disabled={requestBusy === item.id} style={[styles.choice, { borderColor: colors.borderRole.subtle, backgroundColor: colors.textRole.primary, opacity: requestBusy === item.id ? 0.6 : 1 }]}>
                    <Text style={[styles.choiceText, { color: colors.surface.inverse }, CompassFonts.bodyBold]}>Share</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => void respondToRequest(item, "decline")} disabled={requestBusy === item.id} style={[styles.choice, { borderColor: colors.borderRole.subtle, opacity: requestBusy === item.id ? 0.6 : 1 }]}>
                    <Text style={[styles.choiceText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Keep private</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            {requestErr ? <Text style={[styles.err, { color: colors.accentRole.danger }]}>{requestErr}</Text> : null}
          </View>
        ) : null}

        {/* Claim card */}
        <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
          <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
            Have a claim code?
          </Text>
          <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>
            If your school set up an account for you, enter the code from your
            card to make it yours. Add a phone number (or email) so you can log in
            again later.
          </Text>
          <ClearableInput
            value={claimCode}
            onChangeText={setClaimCode}
            autoCapitalize="characters"
            placeholder="Claim code"
            placeholderTextColor={colors.textRole.muted}
          />
          <ClearableInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={colors.textRole.muted}
          />
          <ClearableInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email (optional)"
            placeholderTextColor={colors.textRole.muted}
          />
          {claimErr && <Text style={[styles.err, { color: colors.accentRole.danger }]}>{claimErr}</Text>}
          {claimMsg && <Text style={[styles.ok, { color: colors.accentRole.success }]}>{claimMsg}</Text>}
          <TouchableOpacity
            onPress={doClaim}
            disabled={claimBusy}
            style={[styles.btnPrimary, { backgroundColor: colors.textRole.primary, opacity: claimBusy ? 0.6 : 1 }]}
          >
            {claimBusy ? (
              <ActivityIndicator color={colors.surface.inverse} />
            ) : (
              <Text style={[styles.btnPrimaryText, { color: colors.surface.inverse }, CompassFonts.bodyBold]}>Claim my account</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Affiliate + consent card */}
        <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }, Shadow.sm]}>
          <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
            Link your school
          </Text>
          <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>
            Enter your school&apos;s code to link your account. By default your school
            only sees anonymous totals — never your individual progress — unless
            you choose to share it below.
          </Text>

          {!affiliated ? (
            <>
              <ClearableInput
                value={schoolCode}
                onChangeText={setSchoolCode}
                autoCapitalize="characters"
                placeholder="School code"
                placeholderTextColor={colors.textRole.muted}
              />
              {affErr && <Text style={[styles.err, { color: colors.accentRole.danger }]}>{affErr}</Text>}
              <TouchableOpacity
                onPress={doAffiliate}
                disabled={affBusy}
                style={[styles.btnPrimary, { backgroundColor: colors.textRole.primary, opacity: affBusy ? 0.6 : 1 }]}
              >
                {affBusy ? (
                  <ActivityIndicator color={colors.surface.inverse} />
                ) : (
                  <Text style={[styles.btnPrimaryText, { color: colors.surface.inverse }, CompassFonts.bodyBold]}>Link school</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <View style={{ gap: Spacing.md }}>
              <Text style={[styles.cardBody, { color: colors.textRole.primary }, CompassFonts.body]}>
                Linked to {affiliated.schoolName ?? "your school"}.
              </Text>
              <View style={[styles.consentBox, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
                <Text style={[styles.consentTitle, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
                  Share your individual progress with {affiliated.schoolName ?? "your school"}?
                </Text>
                <Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>
                  This lets your school&apos;s counsellor see your career progress and
                  report. You can turn it off anytime.
                </Text>
                <View style={{ flexDirection: "row", gap: Spacing.sm }}>
                  <TouchableOpacity
                    onPress={() => setConsent(true)}
                    disabled={consentBusy}
                    style={[
                      styles.choice,
                      {
                        borderColor: colors.borderRole.subtle,
                        backgroundColor: consentState === "shared" ? colors.textRole.primary : "transparent",
                      },
                    ]}
                  >
                    <Text style={[styles.choiceText, { color: consentState === "shared" ? colors.surface.inverse : colors.textRole.primary }, CompassFonts.bodyBold]}>
                      Share
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setConsent(false)}
                    disabled={consentBusy}
                    style={[
                      styles.choice,
                      {
                        borderColor: colors.borderRole.subtle,
                        backgroundColor: consentState === "none" ? colors.textRole.primary : "transparent",
                      },
                    ]}
                  >
                    <Text style={[styles.choiceText, { color: consentState === "none" ? colors.surface.inverse : colors.textRole.primary }, CompassFonts.bodyBold]}>
                      Keep private
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={[styles.consentStatus, { color: colors.textRole.muted }, CompassFonts.bodyMedium]}>
                  {consentState === "shared"
                    ? "Sharing is on — your school can see your progress."
                    : "Private — your school only sees anonymous totals."}
                </Text>
                <Text style={[styles.consentStatus, { color: colors.textRole.muted }, CompassFonts.body]}>
                  If you are under 18, discuss this choice with a parent or guardian. School staff must follow the safeguarding and data-protection rules applicable to your location in Nigeria.
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.lg,
    flexGrow: 1,
  },
  back: { paddingVertical: Spacing.xs },
  backText: { fontSize: FontSize.md, fontWeight: '700' },
  h1: { fontSize: FontSize.xxl, fontWeight: '900' },
  card: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: '900' },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  inputWrap: { position: "relative" },
  clearInput: { position: "absolute", right: Spacing.md, top: Spacing.sm + 1, zIndex: 1 },
  err: { fontSize: FontSize.sm, fontWeight: '700' },
  ok: { fontSize: FontSize.sm, fontWeight: '700' },
  btnPrimary: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  btnPrimaryText: { fontSize: FontSize.md, fontWeight: '700' },
  consentBox: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  consentTitle: { fontSize: FontSize.md, fontWeight: '700' },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  choiceText: { fontSize: FontSize.sm, fontWeight: '700' },
  consentStatus: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});
