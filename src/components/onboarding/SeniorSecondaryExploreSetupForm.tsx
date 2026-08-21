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
import { LiveSubjectMultiSelect } from "./LiveSubjectMultiSelect";
import { SelectField, type ChoiceOption } from "./primitives";
import {
  STREAM_OPTIONS,
  type SchoolStream,
} from "../../lib/waecSubjects";
import type { SetupFormProps } from "../../types/onboarding";
import LocalLegalNotice from "../LocalLegalNotice";

const INTENTS: ChoiceOption[] = [
  { label: "Help me choose subjects for future programmes", value: "choose_subjects" },
  { label: "I already have a programme in mind", value: "have_programme" },
];

export function SeniorSecondaryExploreSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();
  const ssClass = value.ssClass;
  const stream = value.stream as SchoolStream | undefined;
  const hasSchool = Boolean(value.secondarySchoolId);
  const selectedIntent = Array.isArray(value.exploreIntent)
    ? value.exploreIntent[0]
    : value.exploreIntent;
  const selectedSubjects = value.olevelSubjects ?? [];
  const classLabel =
    ssClass === "ss2" ? "SS2" : ssClass === "ss1" ? "SS1" : "Secondary student";

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          {classLabel} subject and programme plan
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          We will use your class, school, stream and choices to guide you toward
          suitable programmes and the requirements to prepare for.
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
            label="Your current stream"
            options={STREAM_OPTIONS}
            value={value.stream}
            placeholder="Choose your stream"
            onSelect={(v) =>
              onChange({
                stream: v as SchoolStream,
                exploreIntent: undefined,
                jambSubjects: [],
                olevelSubjects: [],
                intendedProgramme: undefined,
                intendedJambProgrammeId: undefined,
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
        <SelectField
          label="What should LevelUp help you do first?"
          options={INTENTS}
          value={selectedIntent}
          placeholder="Choose what you want to explore first"
          onSelect={(v) =>
            onChange({
              exploreIntent: [v],
              jambSubjects: [],
              olevelSubjects: [],
              intendedProgramme: undefined,
              intendedJambProgrammeId: undefined,
            })
          }
        />
      ) : null}

      {selectedIntent === "have_programme" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveAdmissionSearchField
            label="Programme you are considering"
            value={value.intendedProgramme ?? ""}
            selectedId={value.intendedJambProgrammeId}
            onSelect={(item) => onChange({
              intendedProgramme: item.name,
              intendedJambProgrammeId: item.id || undefined,
            })}
            placeholder="e.g. Nursing, Law, Computer Science"
            kind="programme"
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
             Search by the name you know. We will show the universities that offer
             it and let you choose one before showing its full requirements.
          </Text>
        </View>
      ) : selectedIntent === "choose_subjects" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveSubjectMultiSelect
            label="WAEC/NECO subjects you take or are considering"
            stream={stream}
            examType="olevel"
            value={value.olevelSubjects}
            onChange={(v) => onChange({ olevelSubjects: v as string[] })}
            fixedSubjects={["English Language", "Mathematics"]}
            maxSelected={12}
            minSelected={5}
            showSearch={false}
            helperText="English Language and Mathematics are shown first. Choose at least 3 more subjects. These choices help us suggest programmes, but each programme will still show its own exact requirements."
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            We will compare your subjects with programme requirements, then show
            the UTME combination and university-specific checks before career
            guidance.
          </Text>
        </View>
      ) : null}

      <SifterButton
        label="Continue guidance"
        onPress={onContinue}
        disabled={
          !ssClass ||
          !hasSchool ||
          !stream ||
          !selectedIntent ||
          (selectedIntent === "choose_subjects" && selectedSubjects.length < 5) ||
          (selectedIntent === "have_programme" && !value.intendedProgramme)
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
  note: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
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
