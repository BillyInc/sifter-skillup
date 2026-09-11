import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { SifterButton } from "@/components/ui";
import { useAuth } from "@/hooks/useAuth";
import { adminLearnerAudienceForOrg, type AdminLearnerAudience } from "@/lib/adminLearnerAudience";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { provisioningData } from "@/lib/provisioningData";
import { guidanceContextQuery } from "@/lib/guidanceRouteContext";
import {
  CompassFonts,
  FontSize,
  Radius,
  Spacing,
  useTheme,
  webContainer,
} from "@/theme";
import type { EducatorProfile, RosterStudent } from "@/types/institution";
import { AdminShell } from "./AdminShell";

type TargetMode = "anonymous" | "student";
type JourneyMode = "full" | "programme_to_role" | "utme_only" | "olevel_only" | "universities_only";

const JOURNEYS: { value: JourneyMode; title: string; body: string; university?: boolean }[] = [
  {
    value: "full",
    title: "Full guidance flow",
    body: "Subjects → programme preview → universities → requirements → domain → subgroup → role.",
  },
  {
    value: "programme_to_role",
    title: "Programme to career route",
    body: "Programme → university context → domain → subgroup → role.",
  },
  {
    value: "utme_only",
    title: "UTME-only check",
    body: "Check UTME subject fit. It remains incomplete until O-level requirements are reviewed.",
  },
  {
    value: "olevel_only",
    title: "O-level-only check",
    body: "Check O-level subject fit. It does not confirm the UTME subject gate.",
  },
  {
    value: "universities_only",
    title: "University options only",
    body: "Review offerings, addresses, requirements and notes without entering career guidance.",
  },
];

function normalizeLearnerType(value?: string | null): string {
  const raw = (value ?? "").trim().toLowerCase();
  if (raw === "ss1" || raw === "ss2" || raw === "ss3" || raw === "jamb" || raw === "undergraduate") return raw;
  return "";
}

function userTypeForLearner(value: string): string {
  if (value === "undergraduate") return "student";
  if (value === "ss1" || value === "ss2") return "senior_secondary";
  if (value === "ss3") return "ss3_secondary";
  return value;
}

export function GuidanceStartScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<EducatorProfile | null>(null);
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [target, setTarget] = useState<TargetMode>("anonymous");
  const [learnerType, setLearnerType] = useState("");
  const [stream, setStream] = useState("");
  const [studentId, setStudentId] = useState("");
  const [journey, setJourney] = useState<JourneyMode>("full");

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      getEducatorProfile(user?.id),
      provisioningData.getRoster().catch(() => null),
    ]).then(([nextProfile, rosterSummary]) => {
      if (!active) return;
      setProfile(nextProfile);
      setRoster(rosterSummary?.students?.filter((student) => student.visible) ?? []);
      if (nextProfile?.organizationType === "university") {
        setLearnerType("undergraduate");
        setJourney("programme_to_role");
      }
    }).catch(() => {
      if (active) setError("We could not load the guidance context. Try again.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [user?.id]);

  const organizationType = profile?.organizationType ?? "";
  const audience: AdminLearnerAudience | null = useMemo(
    () => adminLearnerAudienceForOrg(organizationType),
    [organizationType],
  );
  const providerOnly = Boolean(profile?.providerSessionOnly || organizationType === "tutorial_centre" || organizationType === "jamb_cafe");
  const hasRosterTargets = !providerOnly && roster.length > 0;
  const needsStream = Boolean(audience?.streams.length);
  const selectedStudent = roster.find((student) => student.userId === studentId) ?? null;
  const selectedLearnerType = target === "student"
    ? normalizeLearnerType(selectedStudent?.studentType ?? selectedStudent?.studentClass)
    : learnerType;
  const selectedStream = target === "student" ? (selectedStudent?.stream ?? "") : stream;
  const contextReady = Boolean(
    audience &&
    selectedLearnerType &&
    (!needsStream || selectedStream),
  );

  const start = () => {
    if (!profile || !audience || !contextReady) return;
    const learner = selectedLearnerType;
    const mode = journey === "full" || journey === "utme_only" || journey === "olevel_only" ? "subjects" : "programme";
    const examType = journey === "utme_only" ? "utme" : journey === "olevel_only" ? "olevel" : journey === "full" ? "combined" : "";
    const guidanceContext = guidanceContextQuery({
      className: learner,
      userType: userTypeForLearner(learner),
      stream: selectedStream || undefined,
      journeyMode: journey,
      guidanceTarget: target === "student" ? "authorised_student" : "self",
      guidanceStudentId: target === "student" ? selectedStudent?.userId : undefined,
      resumeStage: "setup",
      entryPath: "/admin/guidance-start",
      focused: true,
    });
    const params = [
      `mode=${mode}`,
      "admin=1",
      `admin_type=${encodeURIComponent(organizationType)}`,
      `journey=${encodeURIComponent(journey)}`,
      examType ? `exam_type=${examType}` : "",
      target === "student" && selectedStudent ? `resume=1&student_type=${encodeURIComponent(selectedStudent.studentType ?? "")}` : "",
      guidanceContext,
    ].filter(Boolean).join("&");
    router.push(`/(admin)/workspace-explore/admission?${params}` as never);
  };

  if (loading) {
    return <AdminShell title="Start guidance" eyebrow="Guidance setup"><View style={styles.center}><ActivityIndicator color={colors.text} /><Text style={[styles.body, { color: colors.textMuted }]}>Loading your guidance scope…</Text></View></AdminShell>;
  }

  if (!profile || !audience || providerOnly) {
    return (
      <AdminShell title="Start guidance" eyebrow="Guidance setup">
        <View style={[styles.scroll, webContainer as object]}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>PROVIDER SESSION</Text>
          <Text style={[styles.title, CompassFonts.displayBold, { color: colors.text }]}>Use Session mode for a walk-in student</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Tutorial centres and JAMB cafés can run temporary guidance sessions without creating a roster record. No arbitrary student account is exposed here.</Text>
          <SifterButton label="Open session mode" onPress={() => router.replace("/(admin)/session" as never)} variant="track" color={colors.accentRole.action} size="lg" fullWidth />
        </View>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Start guidance" eyebrow="Guidance setup">
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[styles.scroll, webContainer as object]} showsVerticalScrollIndicator={false}>
        <View style={styles.intro}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>GUIDANCE SETUP</Text>
          <Text style={[styles.title, CompassFonts.displayBold, { color: colors.text }]}>Choose who and what you are guiding</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Start with yourself/an anonymous exploration, or choose a student already visible to your organisation. You cannot search for or inspect an arbitrary student from this flow.</Text>
        </View>

        {error ? (
          <View style={styles.errorBlock}>
            <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
            <SifterButton label="Try again" onPress={() => router.replace("/(admin)/guidance-start" as never)} variant="ghost" color={colors.accentRole.action} size="sm" />
          </View>
        ) : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.text }]}>Guidance target</Text>
          <View style={styles.optionRow}>
            <Choice title="Myself / anonymous" body="No student identity or student guidance path is saved." active={target === "anonymous"} onPress={() => { setTarget("anonymous"); setStudentId(""); }} colors={colors} />
            {hasRosterTargets ? <Choice title="Authorised student" body="Use a visible provisioned or consented student record." active={target === "student"} onPress={() => setTarget("student")} colors={colors} /> : null}
          </View>
          {target === "student" ? (
            <View style={styles.optionRow}>
              {roster.map((student) => {
                const active = student.userId === studentId;
                return <Choice key={student.userId} title={student.fullName || "Unnamed student"} body={[student.studentType ?? student.studentClass, student.stream, student.hasConsent ? "Consent recorded" : "Provisioned account"].filter(Boolean).join(" · ")} active={active} onPress={() => setStudentId(student.userId)} colors={colors} />;
              })}
            </View>
          ) : null}
        </View>

        {target === "anonymous" ? <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.text }]}>Student context</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>{audience.description} This context controls which admission questions and stream filters appear.</Text>
          <View style={styles.optionRow}>{audience.learnerTypes.map((value) => <Choice key={value} title={value === "undergraduate" ? "Undergraduate" : value.toUpperCase()} body="Use this student context for the guidance check." active={learnerType === value} onPress={() => setLearnerType(value)} colors={colors} />)}</View>
          {needsStream ? <><Text style={[styles.label, { color: colors.textMuted }]}>Stream</Text><View style={styles.optionRow}>{audience.streams.map((value) => <Choice key={value} title={value[0].toUpperCase() + value.slice(1)} body="A guidance filter, not a permanent eligibility judgement." active={stream === value} onPress={() => setStream(value)} colors={colors} />)}</View></> : null}
        </View> : null}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.text }]}>Journey mode</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Choose the smallest useful check. You can return and run a fuller journey later.</Text>
          <View style={styles.optionRow}>{JOURNEYS.filter((item) => organizationType === "university" ? item.value === "programme_to_role" || item.value === "universities_only" : true).map((item) => <Choice key={item.value} title={item.title} body={item.body} active={journey === item.value} onPress={() => setJourney(item.value)} colors={colors} />)}</View>
        </View>

        <SifterButton label={target === "student" ? "Open student guidance" : "Start anonymous guidance"} onPress={start} disabled={!contextReady || (target === "student" && !selectedStudent)} variant="track" color={colors.accentRole.action} size="lg" fullWidth />
        <Text style={[styles.privacy, { color: colors.textMuted }]}>The selected journey and target are shown in the guidance workspace. Anonymous work stays separate from your own account; student work is limited to the selected authorised record.</Text>
      </ScrollView>
    </AdminShell>
  );
}

function Choice({ title, body, active, onPress, colors }: { title: string; body: string; active: boolean; onPress: () => void; colors: ReturnType<typeof useTheme>["colors"] }) {
  return <TouchableOpacity accessibilityRole="radio" accessibilityState={{ checked: active }} onPress={onPress} activeOpacity={0.82} style={[styles.choice, { backgroundColor: active ? colors.surface.subtle : colors.card, borderColor: active ? colors.accentRole.action : colors.border }]}><View style={{ flex: 1, gap: 3 }}><Text style={[styles.choiceTitle, { color: colors.text }, CompassFonts.bodySemibold]}>{title}</Text><Text style={[styles.choiceBody, { color: colors.textMuted }]}>{body}</Text></View><Text style={[styles.check, { color: active ? colors.accentRole.action : colors.textMuted }]}>{active ? "●" : "○"}</Text></TouchableOpacity>;
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, padding: Spacing.xl, gap: Spacing.xl },
  center: { flex: 1, alignItems: "center", justifyContent: "center", gap: Spacing.md, padding: Spacing.xl },
  intro: { gap: Spacing.sm, maxWidth: 760 },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 1, fontWeight: "800" },
  title: { fontSize: FontSize.xxl, lineHeight: FontSize.xxl * 1.2 },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.55 },
  section: { gap: Spacing.md, maxWidth: 900 },
  sectionTitle: { fontSize: FontSize.lg },
  label: { fontSize: FontSize.sm, fontWeight: "700" },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  choice: { flex: 1, minWidth: 230, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, flexDirection: "row", gap: Spacing.sm, alignItems: "flex-start" },
  choiceTitle: { fontSize: FontSize.sm },
  choiceBody: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  check: { fontSize: FontSize.lg, lineHeight: FontSize.lg },
  error: { fontSize: FontSize.sm },
  errorBlock: { gap: Spacing.sm, alignItems: "flex-start" },
  privacy: { maxWidth: 760, fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});

export default GuidanceStartScreen;
