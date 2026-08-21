import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AdminShell } from "../../../../src/screens/admin/AdminShell";
import { CompassFonts, FontSize, Spacing, useTheme, webContainer } from "../../../../src/theme";
import { SifterButton } from "../../../../src/components/ui";
import LocalLegalNotice from "../../../../src/components/LocalLegalNotice";
import { getEducatorProfile } from "../../../../src/lib/educatorProfile";
import { useAuth } from "../../../../src/hooks/useAuth";

export default function AdminStudentGuidancePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const [adminType, setAdminType] = useState("");
  const params = useLocalSearchParams<{
    userId?: string | string[];
    student_class?: string | string[];
    class_name?: string | string[];
    stream?: string | string[];
  }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const studentClass = Array.isArray(params.student_class)
    ? params.student_class[0]
    : params.student_class ?? (Array.isArray(params.class_name) ? params.class_name[0] : params.class_name);
  const stream = Array.isArray(params.stream) ? params.stream[0] : params.stream;

  useEffect(() => {
    let active = true;
    getEducatorProfile(user?.id).then((profile) => {
      if (active) setAdminType(profile?.organizationType ?? "");
    });
    return () => { active = false; };
  }, [user?.id]);

  const startGuidance = () => {
    if (!userId) return;
    router.push(
      `/(admin)/workspace-explore/admission?mode=programme&admin=1&admin_type=${encodeURIComponent(adminType)}&guidance_student_id=${encodeURIComponent(userId)}${studentClass ? `&class_name=${encodeURIComponent(studentClass)}` : ""}${stream ? `&stream=${encodeURIComponent(stream)}` : ""}` as never,
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
          <Text style={[styles.body, { color: colors.textMuted }]}>Start with the student&apos;s programme and university, then select the domains, sub-groups and career roles that are relevant to the conversation. The report will include the selected branches and their own skills, tools and certifications.</Text>
        </View>
        <LocalLegalNotice audience="institution" />
        <SifterButton
          label="Start student guidance"
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
