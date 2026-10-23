import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { LiveAdmissionSearchField } from "./LiveAdmissionSearchField";
import { SelectField } from "./primitives";
import { careerData } from "../../lib/careerData";
import type { SetupFormProps } from "../../types/onboarding";
import LocalLegalNotice from "../LocalLegalNotice";

/** University-only setup for the current undergraduate user type. */
export function CurrentStudentSetupForm({ value, onChange, onContinue }: SetupFormProps) {
  const { colors } = useTheme();
  const [faculties, setFaculties] = React.useState<{ label: string; value: string }[]>([]);
  const schoolId = value.preferredSchoolId;

  React.useEffect(() => {
    let active = true;
    setFaculties([]);
    if (!schoolId) return () => { active = false; };
    careerData.getSchoolFaculties(schoolId).then((state) => {
      if (!active || state.status !== "real") return;
      setFaculties((state.data ?? []).map((item) => ({ label: item.name, value: item.value })));
    });
    return () => { active = false; };
  }, [schoolId]);

  return (
    <View style={styles.form}>
      <View style={styles.heading}>
        <Text style={[styles.title, { color: colors.text }]}>Tell us what you study</Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>Choose your university first. Then we will show only the faculties and programme names recorded for that university.</Text>
      </View>
      <LocalLegalNotice audience="student" />

      <Text style={[styles.note, { color: colors.textMuted }]}>This path is for a student currently studying at a university.</Text>

      <LiveAdmissionSearchField
        label="Your university"
        value={value.schoolName ?? ""}
        selectedId={value.preferredSchoolId}
        onSelect={(item) => onChange({
          institutionType: "university",
          schoolName: item.name,
          preferredSchoolId: item.id || undefined,
          discipline: undefined,
          programmeName: undefined,
          intendedProgramme: undefined,
          intendedJambProgrammeId: undefined,
        })}
        placeholder="Search your university"
        kind="school"
        institutionType="university"
        helperText="Choose your university from the list. You cannot add a new university from this step yet."
      />

      {schoolId && faculties.length ? (
        <SelectField
          label="Faculty (if listed)"
          value={value.discipline}
          placeholder="Select your faculty"
          options={faculties}
          onSelect={(v) => onChange({ discipline: v, programmeName: undefined, intendedProgramme: undefined, intendedJambProgrammeId: undefined })}
        />
      ) : null}

      {schoolId ? (
        <LiveAdmissionSearchField
          label="Your programme"
          value={value.programmeName ?? ""}
          selectedId={value.intendedJambProgrammeId}
          onSelect={(item) => onChange({
            programmeName: item.name,
            intendedProgramme: item.name,
            intendedJambProgrammeId: item.id || undefined,
          })}
          placeholder="Search this university's programmes"
          kind="programme"
          schoolId={schoolId}
          faculty={value.discipline}
          helperText="Choose the programme name your university uses. This keeps your university and programme details connected."
        />
      ) : null}

      <Text style={[styles.note, { color: colors.textMuted }]}>If faculty information is available for your university, you can use it to narrow the programme list. Your final choice remains tied to that university.</Text>

      <SifterButton
        label="Continue"
        onPress={onContinue}
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
        disabled={!schoolId || !value.intendedJambProgrammeId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: Spacing.xl },
  heading: { gap: Spacing.xs },
  title: { fontSize: FontSize.xxl, fontWeight: "900", lineHeight: FontSize.xxl * 1.2 },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  note: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
});

export default CurrentStudentSetupForm;
