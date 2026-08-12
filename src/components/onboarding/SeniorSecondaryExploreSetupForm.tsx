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

const INTENTS: ChoiceOption[] = [
  { label: "Help me choose the right subject mix", value: "choose_subjects" },
  { label: "Check a course I already have in mind", value: "have_programme" },
];

export function SeniorSecondaryExploreSetupForm({
  value,
  onChange,
  onContinue,
}: SetupFormProps) {
  const { colors } = useTheme();
  const ssClass = value.ssClass;
  const stream = value.stream as SchoolStream | undefined;
  const hasSchool = Boolean(value.secondarySchoolName);
  const selectedIntent = Array.isArray(value.exploreIntent)
    ? value.exploreIntent[0]
    : value.exploreIntent;
  const selectedSubjects = value.olevelSubjects ?? [];
  const classLabel =
    ssClass === "ss2" ? "SS2 Student" : ssClass === "ss1" ? "SS1 Student" : "Secondary student";

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          Pre-JAMB secondary setup
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Start with where you are. The next questions adjust to your class,
          stream and goal.
        </Text>
      </View>

      <View
        style={[
          styles.lockedContext,
          { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle },
        ]}
      >
        <Text style={[styles.lockedLabel, { color: colors.textMuted }]}>Selected path</Text>
        <Text style={[styles.lockedText, { color: colors.text }]}>{classLabel}</Text>
      </View>

      {ssClass ? (
        <>
          <LiveAdmissionSearchField
            label="Your secondary school"
            value={value.secondarySchoolName ?? ""}
            onSelect={(item) => onChange({
              secondarySchoolName: item.name,
              secondarySchoolId: item.id || undefined,
            })}
            placeholder="Search or type your school name"
            kind="school"
            institutionType="secondary_school"
            helperText="Your school is required. If it is not listed, type the name and continue."
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
            Stream helps us show the right O-level planning subjects first.
            Each programme still has its own UTME and O-level requirements.
          </Text>
        </>
      ) : null}

      {stream ? (
        <SelectField
          label="What should LevelUp help you do first?"
          options={INTENTS}
          value={selectedIntent}
          placeholder="Choose the first thing you want help with"
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
            label="Course or programme you have in mind"
            value={value.intendedProgramme ?? ""}
            onSelect={(item) => onChange({
              intendedProgramme: item.name,
              intendedJambProgrammeId: item.id || undefined,
            })}
            placeholder="e.g. Medicine, Law, Computer Science"
            kind="programme"
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            We will show programme name variants, universities that offer it, and
            the UTME and O-level requirements before career mapping starts.
          </Text>
        </View>
      ) : selectedIntent === "choose_subjects" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveSubjectMultiSelect
            label="O-level subjects you are taking or considering"
            stream={stream}
            examType="olevel"
            value={value.olevelSubjects}
            onChange={(v) => onChange({ olevelSubjects: v as string[] })}
            fixedSubjects={["English Language", "Mathematics"]}
            maxSelected={12}
            minSelected={5}
            showSearch={false}
            helperText="English Language and Mathematics are shown first. Choose at least 3 more O-level subjects for early guidance; each programme still shows its exact O-level and UTME requirements."
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            We will start with programmes your subject plan can support, then
            show the UTME combination and school-specific requirements before
            career mapping starts.
          </Text>
        </View>
      ) : null}

      <SifterButton
        label="Continue ->"
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
