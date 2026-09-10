/**
 * Profile for the career-intelligence workspace.
 *
 * XP, stages, workstation art and merchandise belong to the legacy learning
 * game. They must not appear in the career guidance account surface.
 */
import React, { useCallback, useEffect, useState } from "react";
import { Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, CompassFonts, FontSize, Radius, Spacing, webContainer } from "@/theme";
import { useAuth } from "@/hooks/useAuth";
import { getStartingPoint } from "@/lib/startingPoint";
import type { StartingPointProfile, UserType } from "@/types/onboarding";
import { isAdminAccount } from "@/lib/accountType";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { adminHomeForProfile } from "@/lib/adminAudience";
import { WebCard, WebCol, WebDivider, WebPageHeader, WebRow, WebShell, useIsWebWide } from "@/components/web/WebGrid";

const USER_TYPE_LABEL: Record<UserType, string> = {
  senior_secondary: "Senior secondary student",
  ss3_secondary: "SS3 student",
  jamb: "JAMB / UTME candidate",
  student: "Undergraduate student",
  skilled_worker: "Skilled worker",
  professional: "Professional",
  graduate: "Graduate",
};

function AccountRow({ label, sub, onPress, danger = false }: { label: string; sub?: string; onPress: () => void; danger?: boolean }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity style={styles.accountRow} onPress={onPress} activeOpacity={0.75}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.accountLabel, { color: danger ? colors.accentRole.danger : colors.textRole.primary }, CompassFonts.bodySemibold]}>{label}</Text>
        {sub ? <Text style={[styles.accountSub, { color: colors.textRole.muted }]}>{sub}</Text> : null}
      </View>
      <Text style={[styles.arrow, { color: colors.textRole.muted }]}>›</Text>
    </TouchableOpacity>
  );
}

function startingPointSummary(starting: StartingPointProfile | null): string {
  if (!starting) return "Not selected yet";
  const values: string[] = [];
  if (starting.ssClass) values.push(starting.ssClass.toUpperCase());
  if (starting.stream) values.push(`${starting.stream} stream`);
  if (starting.programmeName || starting.intendedProgramme) values.push(starting.programmeName || starting.intendedProgramme || "");
  if (starting.schoolName || starting.preferredSchool) values.push(starting.schoolName || starting.preferredSchool || "");
  return values.filter(Boolean).join(" · ") || USER_TYPE_LABEL[starting.userType] || "Guidance profile saved";
}

export default function ProfileScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user, signOut, deleteAccount } = useAuth();
  const [starting, setStarting] = useState<StartingPointProfile | null>(null);
  const [accountAction, setAccountAction] = useState<"sign-out" | "delete" | null>(null);
  const [busy, setBusy] = useState(false);
  const isWide = useIsWebWide();
  const isAdmin = isAdminAccount(user?.account_type);
  const isGuest = user?.auth_provider === "guest";

  useEffect(() => {
    let active = true;
    if (!user?.id || isGuest) return () => { active = false; };
    void getStartingPoint(user.id).then((value) => { if (active) setStarting(value); });
    return () => { active = false; };
  }, [isGuest, user?.id]);

  const go = useCallback((href: string) => router.push(href as never), [router]);
  const handleAdmin = useCallback(async () => {
    const profile = await getEducatorProfile(user?.id);
    go(adminHomeForProfile(profile));
  }, [go, user?.id]);
  const runAction = useCallback(async () => {
    if (!accountAction || busy) return;
    setBusy(true);
    try {
      if (accountAction === "delete") await deleteAccount();
      else await signOut();
      setAccountAction(null);
      router.replace("/(auth)/sign-in" as never);
    } finally {
      setBusy(false);
    }
  }, [accountAction, busy, deleteAccount, router, signOut]);

  const context = (
    <View style={[styles.context, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.contextLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>GUIDANCE CONTEXT</Text>
      <Text style={[styles.contextTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        {starting ? USER_TYPE_LABEL[starting.userType] : user?.account_type === "student" ? "Student" : "Account context not selected"}
      </Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>
        {starting ? startingPointSummary(starting) : "Choose a user type to tailor the questions, subjects and results shown to you."}
      </Text>
      {starting?.olevelSubjects?.length ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>O-level subjects: {starting.olevelSubjects.join(", ")}</Text> : null}
      {starting?.jambSubjects?.length ? <Text style={[styles.meta, { color: colors.textRole.muted }]}>UTME subjects: {starting.jambSubjects.join(", ")}</Text> : null}
      <TouchableOpacity onPress={() => go(isGuest ? "/(auth)/signup" : "/(auth)/onboarding?restart=1")} style={styles.inlineAction}>
        <Text style={[styles.inlineActionText, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>{starting ? "Change guidance context" : "Choose guidance context"}</Text>
      </TouchableOpacity>
    </View>
  );

  const account = (
    <View style={[styles.context, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.contextLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>ACCOUNT</Text>
      <Text style={[styles.body, { color: colors.textRole.primary }]}>{user?.email || "Guest session"}</Text>
      {isGuest ? <>
        <Text style={[styles.meta, { color: colors.textRole.muted }]}>Guest browsing does not save guidance until you create an account.</Text>
        <TouchableOpacity onPress={() => go("/(auth)/signup")} style={styles.inlineAction}>
          <Text style={[styles.inlineActionText, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>Create account to start →</Text>
        </TouchableOpacity>
      </> : null}
      {isAdmin ? <AccountRow label="Admin workspace" sub="Organisation tools and student guidance" onPress={handleAdmin} /> : null}
      {!isGuest ? <AccountRow label="Explore guidance" sub="Programmes, universities, domains and roles" onPress={() => go("/(tabs)/explore")} /> : null}
      <AccountRow label="Settings" sub="Notifications, legal choices and account settings" onPress={() => go("/(tabs)/settings")} />
      {!isGuest ? <AccountRow label="Delete account" sub="Start the account deletion cooldown" onPress={() => setAccountAction("delete")} danger /> : null}
      <WebDivider />
      <AccountRow label="Sign out" onPress={() => setAccountAction("sign-out")} danger />
    </View>
  );

  const content = isGuest ? account : (
    <>
      {context}
      {account}
    </>
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.surface.base }]}>
      {isWide ? (
        <WebShell>
          <WebPageHeader title="Profile" subtitle={isGuest ? "Your guest account" : "Your account and guidance context"} accentColor={colors.accentRole.action} />
          <WebRow><WebCol weight={1}>{content}</WebCol>{!isGuest ? <WebCol weight={1}><WebCard title="Career guidance" accentBar accentColor={colors.accentRole.action}><Text style={[styles.body, { color: colors.textRole.secondary }]}>Your guidance is kept here as a connected path: subjects, programmes, universities, domains, subgroups and roles.</Text><TouchableOpacity onPress={() => go("/(tabs)/explore")} style={styles.primaryAction}><Text style={styles.primaryActionText}>Open Explore</Text></TouchableOpacity></WebCard></WebCol> : null}</WebRow>
        </WebShell>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}><Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Profile</Text>{content}</ScrollView>
      )}
      <Modal visible={accountAction !== null} transparent animationType="fade" onRequestClose={() => setAccountAction(null)}>
        <View style={styles.modalOverlay}><View style={[styles.modalCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.modalTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{accountAction === "delete" ? "Delete your account?" : "Sign out?"}</Text>
          <Text style={[styles.body, { color: colors.textRole.secondary }]}>{accountAction === "delete" ? "Your account will be marked for deletion and the recovery cooldown will start immediately." : "You will need to log in again to continue."}</Text>
          <View style={styles.modalActions}><TouchableOpacity onPress={() => setAccountAction(null)} disabled={busy} style={[styles.modalButton, { borderColor: colors.borderRole.subtle }]}><Text style={{ color: colors.textRole.primary }}>Cancel</Text></TouchableOpacity><TouchableOpacity onPress={runAction} disabled={busy} style={[styles.modalButton, { backgroundColor: colors.accentRole.danger, borderColor: colors.accentRole.danger }]}><Text style={{ color: "#fff" }}>{accountAction === "delete" ? "Delete account" : "Sign out"}</Text></TouchableOpacity></View>
        </View></View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { ...webContainer, padding: Spacing.lg, gap: Spacing.md },
  title: { fontSize: FontSize.xxl, marginBottom: Spacing.sm },
  context: { borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.lg, gap: Spacing.sm },
  contextLabel: { fontSize: FontSize.xs, letterSpacing: 0.8 },
  contextTitle: { fontSize: FontSize.lg },
  body: { fontSize: FontSize.sm, lineHeight: 21 },
  meta: { fontSize: FontSize.xs, lineHeight: 18 },
  inlineAction: { alignSelf: "flex-start", paddingVertical: Spacing.xs },
  inlineActionText: { fontSize: FontSize.sm },
  primaryAction: { alignSelf: "flex-start", marginTop: Spacing.md, borderRadius: Radius.md, backgroundColor: "#f59e0b", paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm },
  primaryActionText: { color: "#fff", fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  accountRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.sm },
  accountLabel: { fontSize: FontSize.sm },
  accountSub: { fontSize: FontSize.xs, marginTop: 2 },
  arrow: { fontSize: FontSize.lg },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,.45)", alignItems: "center", justifyContent: "center", padding: Spacing.xl },
  modalCard: { width: "100%", maxWidth: 420, borderWidth: 1, borderRadius: Radius.xl, padding: Spacing.xl, gap: Spacing.md },
  modalTitle: { fontSize: FontSize.xl },
  modalActions: { flexDirection: "row", gap: Spacing.sm },
  modalButton: { flex: 1, minHeight: 44, borderWidth: 1, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
});
