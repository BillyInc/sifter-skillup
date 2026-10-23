/**
 * SeniorSecondaryExploreSetupForm - setup for SS1 / SS2 explorers.
 *
 * This is pre-JAMB guidance. The form evolves as the student chooses class,
 * stream and goal, instead of showing every possible question at once.
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { LiveAdmissionSearchField } from "./LiveAdmissionSearchField";
import { LiveSubjectMultiSelect, MAX_OLEVEL_SUBJECTS } from "./LiveSubjectMultiSelect";
import { SelectField } from "./primitives";
import {
  STREAM_OPTIONS,
  type SchoolStream,
} from "../../lib/waecSubjects";
import type { SetupFormProps } from "../../types/onboarding";
import LocalLegalNotice from "../LocalLegalNotice";

export function SeniorSecondaryExploreSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();
  const ssClass = value.ssClass;
  const stream = value.stream as SchoolStream | undefined;
  const hasSchool = Boolean(value.secondarySchoolId);
  const selectedSubjects = value.olevelSubjects ?? [];
  const hasProgramme = Boolean(value.intendedJambProgrammeId);
  const classLabel =
    ssClass === "ss2" ? "SS2" : ssClass === "ss1" ? "SS1" : "Secondary student";

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Plan your {classLabel} subjects
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
            Choose subjects you take or are considering, and optionally choose a
            programme. We will show the programme's general requirements before
            you compare universities.
        </Text>
      </View>
      <LocalLegalNotice audience="student" />

      <View
        style={[
          styles.lockedContext,
          { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
        ]}
      >
        <Text style={[styles.lockedLabel, { color: colors.textMuted }]}>Your current class</Text>
        <Text style={[styles.lockedText, { color: colors.text }]}>{classLabel}</Text>
      </View>

      {ssClass ? (
        <>
          <LiveAdmissionSearchField
            label="Your secondary school"
            value={value.secondarySchoolName ?? ""}
            selectedId={value.secondarySchoolId}
            onSelect={(item) => onChange({
              secondarySchoolName: item.name,
              secondarySchoolId: item.id || undefined,
            })}
            placeholder="Search or type your school name"
            kind="school"
            institutionType="secondary_school"
            allowRegister
            helperText="Add your school so your guidance can be connected to the right students and programmes. If it is listed, select it; otherwise add its name."
          />
        </>
      ) : null}

      {ssClass && hasSchool ? (
        <>
          <SelectField
            label="Your subject stream"
            options={STREAM_OPTIONS}
            value={value.stream}
            placeholder="Choose your stream"
            onSelect={(v) =>
              onChange({
                stream: v as SchoolStream,
              })
            }
          />
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            Your stream helps us show relevant WAEC subjects first. The programme
            results will still explain the exact O-level and UTME requirements.
          </Text>
        </>
      ) : null}

      {stream ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveSubjectMultiSelect
            label={"Subjects in " + streamLabel(stream)}
            stream={stream}
            examType="olevel"
            value={value.olevelSubjects}
            onChange={(v) => onChange({ olevelSubjects: v as string[] })}
            fixedSubjects={["English Language", "Mathematics"]}
            maxSelected={MAX_OLEVEL_SUBJECTS}
            minSelected={5}
            showSearch
            streamScoped
            helperText="Your stream shows the subjects usually taken on that path. A programme can still ask for a subject that is not in this list. We will show that when you open the programme."
          />
        </View>
      ) : null}

      {stream ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveAdmissionSearchField
            label="Or type a programme you are considering"
            value={value.intendedProgramme ?? ""}
            selectedId={value.intendedJambProgrammeId}
            onSelect={(item) => onChange({
              intendedProgramme: item.name,
              intendedJambProgrammeId: item.id || undefined,
            })}
            placeholder="Nursing, Law, Computer Science"
            kind="programme"
          />
        </View>
      ) : null}

      <SifterButton
        label="Continue"
        onPress={onContinue}
        disabled={
          !ssClass ||
          !hasSchool ||
          !stream ||
          (selectedSubjects.length < 5 && !hasProgramme)
        }
        variant="track"
        color={Brand.primary}
        size="lg"
        fullWidth
      />
    </View>
  );
}

const styles = StyleSheet.create({
  heading: {
    fontSize: FontSize.xxl,
    fontWeight: "900",
    lineHeight: FontSize.xxl * 1.2,
  },
  sub: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  caption: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  lockedContext: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: 2,
  },
  lockedLabel: { fontSize: FontSize.xs, fontWeight: "800" },
  lockedText: { fontSize: FontSize.md, fontWeight: "900" },
});

export default SeniorSecondaryExploreSetupForm;

function streamLabel(stream: SchoolStream): string {
  if (stream === "art") return "Arts";
  if (stream === "technical") return "Technical / vocational";
  return stream[0].toUpperCase() + stream.slice(1);
}
