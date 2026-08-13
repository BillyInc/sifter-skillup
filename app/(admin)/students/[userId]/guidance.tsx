import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

import { AdminShell } from "../../../../src/screens/admin/AdminShell";
import { LiveAdmissionSearchField, type AdmissionSuggestion } from "../../../../src/components/onboarding/LiveAdmissionSearchField";
import { provisioningData } from "../../../../src/lib/provisioningData";
import { CompassFonts, FontSize, Spacing, useTheme, webContainer } from "../../../../src/theme";
import { SifterButton } from "../../../../src/components/ui";

export default function AdminStudentGuidancePage() {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ userId?: string | string[] }>();
  const userId = Array.isArray(params.userId) ? params.userId[0] : params.userId;
  const [programme, setProgramme] = useState<AdmissionSuggestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!userId || !programme?.id || saving) return;
    setSaving(true);
    setError(null);
    try {
      await provisioningData.saveGuidance(userId, { programmeId: programme.id });
      router.replace("/(admin)/students?tab=roster" as never);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save this guidance yet.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell title="Guide learner" eyebrow="Student guidance">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.content, webContainer as object]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.intro}>
          <Text style={[styles.title, CompassFonts.displayBold, { color: colors.text }]}>Choose the learner&apos;s direction</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>Search the official university programme list and save the direction you agreed on with this learner. Their report becomes available after this step.</Text>
        </View>

        <LiveAdmissionSearchField
          label="Programme"
          value={programme?.name ?? ""}
          selectedId={programme?.id}
          onSelect={(item) => setProgramme(item.id ? item : null)}
          placeholder="Search a university programme"
          kind="programme"
          programmeSource="admission"
          helperText="Choose the programme name first. University-specific offerings and admission requirements are reviewed in the next guidance step."
        />

        {error ? <Text style={[styles.error, { color: colors.danger }]}>{error}</Text> : null}
        <SifterButton
          label="Save learner guidance"
          onPress={save}
          loading={saving}
          disabled={!programme?.id || !userId}
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
  error: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
});
