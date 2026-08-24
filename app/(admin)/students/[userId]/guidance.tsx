import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AdminShell } from "../../../../src/screens/admin/AdminShell";
import { CompassFonts, FontSize, Spacing, useTheme, webContainer } from "../../../../src/theme";
import { SifterButton } from "../../../../src/components/ui";
import LocalLegalNotice from "../../../../src/components/LocalLegalNotice";
import { getEducatorProfile } from "../../../../src/lib/educatorProfile";
import { useAuth } from "../../../../src/hooks/useAuth";
import { provisioningData } from "../../../../src/lib/provisioningData";

export default function AdminStudentGuidancePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [adminType, setAdminType] = useState("");
  const [resumeState, setResumeState] = useState<"new" | "resume" | "review">("new");
  const params = useLocalSearchParams<{
    userId?: string | string[];
    student_class?: string | string[];
    class_name?: string | string[];
    stream?: string | string[];
    student_type?: string | string[];
  }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const studentClass = Array.isArray(params.student_class)
    ? params.student_class[0]
    : params.student_class ?? (Array.isArray(params.class_name) ? params.class_name[0] : params.class_name);
  const stream = Array.isArray(params.stream) ? params.stream[0] : params.stream;
  const studentType = Array.isArray(params.student_type) ? params.student_type[0] : params.student_type;
  const contextClass = studentClass || studentType || "";
  const contextUserType = contextClass === "jamb"
    ? "jamb"
    : contextClass === "undergraduate"
      ? "student"
      : "senior_secondary";

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) setAdminType(profile?.organizationType ?? "");
    });
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    provisioningData.getGuidancePath(userId).then((saved) => {
      if (!active) return;
      const path = saved?.path ?? {};
      const resume = path.resume as { status?: string } | undefined;
      const hasProgrammeAndUniversity = Boolean(
        (path.programme as Record<string, unknown> | undefined)?.name &&
        (path.university as Record<string, unknown> | undefined)?.name,
      );
      setResumeState(
        hasProgrammeAndUniversity
          ? "review"
          : resume?.status === "in_progress"
            ? "resume"
            : "new",
      );
    }).catch(() => undefined);
    return () => { active = false; };
  }, [userId]);

  const startGuidance = () => {
    if (!userId) return;
    router.push(
      `/(admin)/workspace-explore/admission?mode=programme&focus=guidance&admin=1&admin_type=${encodeURIComponent(adminType)}&guidance_student_id=${encodeURIComponent(userId)}&resume=1&class_name=${encodeURIComponent(contextClass)}&user_type=${encodeURIComponent(contextUserType)}&student_type=${encodeURIComponent(studentType ?? "")}${stream ? `&stream=${encodeURIComponent(stream)}` : ""}` as never,
    );
  };

  return (
    <AdminShell title="Guide student" eyebrow="Student guidance">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.content, webContainer as object]}
      >
        <View style={styles.intro}>
          <Text style={[styles.title, CompassFonts.displayBold, { color: colors.text }]}>Build this student&apos;s guidance path</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Use the same subject, programme, university and career-field flow the student would see. You can finish it now or leave at any point; this student&apos;s checkpoint is saved so the next visit returns to the same place.</Text>
        </View>
        <LocalLegalNotice audience="institution" />
        <SifterButton
          label={resumeState === "review" ? "Review student guidance" : resumeState === "resume" ? "Resume student guidance" : "Start student guidance"}
          onPress={startGuidance}
          disabled={!userId || !adminType}
          variant="track"
          color={colors.accentRole.action}
          size="lg"
          fullWidth
        />
      </ScrollView>
    </AdminShell>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: Spacing.xl, gap: Spacing.xl },
  intro: { gap: Spacing.sm, maxWidth: 720 },
  title: { fontSize: FontSize.xxl, lineHeight: FontSize.xxl * 1.2 },
  body: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
});
