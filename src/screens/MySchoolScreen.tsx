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
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import {
  useTheme,
  CompassFonts,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Shadow,
  webContainer,
} from "../theme";
import { studentAccountApi } from "../lib/provisioningData";
import { useAuth } from "../hooks/useAuth";

type AffiliateResult = { schoolId: string; schoolName?: string } | null;

export default function MySchoolScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { refreshUser } = useAuth();

  // Claim
  const [claimCode, setClaimCode] = useState("");
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

  const doClaim = useCallback(async () => {
    setClaimErr(null);
    setClaimMsg(null);
    const code = claimCode.trim();
    if (!code) {
      setClaimErr("Enter the claim code from your card.");
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
      setClaimMsg("Your account is now yours. You're all set.");
      setClaimCode("");
    } catch (e) {
      setClaimErr((e as Error)?.message ?? "Could not claim the account.");
    } finally {
      setClaimBusy(false);
    }
  }, [claimCode, phone, email, refreshUser]);

  const doAffiliate = useCallback(async () => {
    setAffErr(null);
    const code = schoolCode.trim();
    if (!code) {
      setAffErr("Enter your school's code.");
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
  }, [schoolCode]);

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
          <TextInput
            value={claimCode}
            onChangeText={setClaimCode}
            autoCapitalize="characters"
            placeholder="Claim code"
            placeholderTextColor={colors.textRole.muted}
            style={[styles.input, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.base }]}
          />
          <TextInput
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            placeholder="Phone number"
            placeholderTextColor={colors.textRole.muted}
            style={[styles.input, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.base }]}
          />
          <TextInput
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="Email (optional)"
            placeholderTextColor={colors.textRole.muted}
            style={[styles.input, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.base }]}
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
            Enter your school's code to link your account. By default your school
            only sees anonymous totals — never your individual progress — unless
            you choose to share it below.
          </Text>

          {!affiliated ? (
            <>
              <TextInput
                value={schoolCode}
                onChangeText={setSchoolCode}
                autoCapitalize="characters"
                placeholder="School code"
                placeholderTextColor={colors.textRole.muted}
                style={[styles.input, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.base }]}
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
                  This lets your school's counsellor see your career progress and
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
  backText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  h1: { fontSize: FontSize.xxl, fontWeight: FontWeight.black },
  card: {
    borderWidth: 1,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.md,
    marginTop: Spacing.xs,
  },
  err: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  ok: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  btnPrimary: {
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.xs,
  },
  btnPrimaryText: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  consentBox: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  consentTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  choice: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingVertical: Spacing.sm,
    alignItems: "center",
  },
  choiceText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  consentStatus: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});
