/**
 * Step-2 setup for SS3 / UTME candidates.
 *
 * Mirrors the admission mechanism with three doors:
 * know_where -> programme + institution type + school
 * know_what -> programme only
 * unsure -> strongest subjects -> eligible programmes once data is live
 */
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { LiveAdmissionSearchField } from "./LiveAdmissionSearchField";
import { LiveSubjectMultiSelect } from "./LiveSubjectMultiSelect";
import {
  OptionCard,
  ChoiceChips,
  SelectField,
  type ChoiceOption,
} from "./primitives";
import {
  STREAM_OPTIONS,
  type SchoolStream,
} from "../../lib/waecSubjects";
import type {
  SetupFormProps,
  SsDoor,
  InstitutionType,
} from "../../types/onboarding";

const DOORS: {
  value: SsDoor;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "know_where",
    icon: "A",
    title: "I know what I want to study and where",
    subtitle: "Programme + preferred school",
  },
  {
    value: "know_what",
    icon: "B",
    title: "I know what to study, not where",
    subtitle: "We'll show universities, variants, and requirements",
  },
  {
    value: "unsure",
    icon: "C",
    title: "I don't know yet",
    subtitle: "Pick your strongest subjects and explore",
  },
];

const INSTITUTION_TYPES: ChoiceOption[] = [
  { label: "University", value: "university" },
  { label: "College of Education", value: "college_of_education" },
  { label: "Polytechnic", value: "polytechnic" },
  { label: "Monotechnic", value: "monotechnic" },
  { label: "College of Health", value: "college_of_health" },
  { label: "Technical College", value: "technical_college" },
];

const SCORE_BANDS: ChoiceOption[] = [
  "Below 180",
  "180-219",
  "220-249",
  "250-279",
  "280+",
].map((band) => ({ label: band, value: band }));

const JAMB_PREP_MODES: ChoiceOption[] = [
  { label: "I attend a tutorial centre", value: "tutorial_centre" },
  { label: "I am self-taught", value: "self_taught" },
];

export function JambSetupForm({ value, onChange, onContinue }: SetupFormProps) {
  const { colors } = useTheme();
  const door = value.ssDoor;
  const selectedSubjects = value.jambSubjects ?? [];
  const selectedOlevelSubjects = value.olevelSubjects ?? [];
  const isSs3Student = value.userType === "ss3_secondary";
  const isJambCandidate = value.userType === "jamb";
  const hasBaseInstitution = isSs3Student
    ? Boolean(value.secondarySchoolName)
    : value.jambPrepMode === "self_taught" || Boolean(value.tutorialCentreName);
  const hasOlevelSubjects = selectedOlevelSubjects.length >= 5;
  const hasDoorFields =
    door === "unsure"
      ? hasOlevelSubjects && selectedSubjects.length >= 4
      : door === "know_what"
        ? hasOlevelSubjects && Boolean(value.intendedProgramme)
        : door === "know_where"
          ? hasOlevelSubjects && Boolean(value.intendedProgramme && value.preferredSchool)
          : false;

  return (
    <View style={{ gap: Spacing.xl }}>
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          {isSs3Student ? "SS3 admission setup" : "JAMB candidate setup"}
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Start with your learning base, then choose what you want LevelUp to
          help you resolve first.
        </Text>
      </View>

      {isSs3Student ? (
        <LiveAdmissionSearchField
          label="Your secondary school"
          value={value.secondarySchoolName ?? ""}
          onSelect={(item) =>
            onChange({
              secondarySchoolName: item.name,
              secondarySchoolId: item.id || undefined,
            })
          }
          placeholder="Search or type your school name"
          kind="school"
          institutionType="secondary_school"
          helperText="Your school is required so guidance can be connected to school cohorts later."
        />
      ) : null}

      {isJambCandidate ? (
        <View style={{ gap: Spacing.lg }}>
          <ChoiceChips
            label="How are you preparing for JAMB?"
            options={JAMB_PREP_MODES}
            value={value.jambPrepMode}
            onChange={(v) =>
              onChange({
                jambPrepMode: v,
                tutorialCentreName: v === "self_taught" ? undefined : value.tutorialCentreName,
                tutorialCentreId: v === "self_taught" ? undefined : value.tutorialCentreId,
              })
            }
          />
          {value.jambPrepMode === "tutorial_centre" ? (
            <LiveAdmissionSearchField
              label="Your tutorial centre"
              value={value.tutorialCentreName ?? ""}
              onSelect={(item) =>
                onChange({
                  tutorialCentreName: item.name,
                  tutorialCentreId: item.id || undefined,
                })
              }
              placeholder="Search or type your tutorial centre"
              kind="school"
              institutionType="tutorial_centre"
              helperText="If your centre is not listed, type the name and continue."
            />
          ) : null}
        </View>
      ) : null}

      {hasBaseInstitution ? (
        <>
      <View style={{ gap: Spacing.md }}>
        {DOORS.map((d) => (
          <OptionCard
            key={d.value}
            icon={d.icon}
            title={d.title}
            subtitle={d.subtitle}
            selected={door === d.value}
            onPress={() =>
              onChange({
                ssDoor: d.value,
                jambSubjects: [],
                intendedProgramme: undefined,
                intendedJambProgrammeId: undefined,
                preferredSchool: undefined,
                preferredSchoolId: undefined,
              })
            }
          />
        ))}
      </View>

      <SelectField
        label="Your school stream (guidance hint)"
        options={STREAM_OPTIONS}
        value={value.stream}
        placeholder="Choose your stream"
        onSelect={(v) =>
          onChange({
            stream: v as SchoolStream,
            jambSubjects: [],
            olevelSubjects: [],
          })
        }
      />
      <Text style={[styles.caption, { color: colors.textMuted }]}>
        Stream helps sort guidance and O-level subject choices. UTME and O-level
        requirements are both checked before a path should be treated as eligible.
      </Text>

      {value.stream ? (
        <LiveSubjectMultiSelect
          label="Your O-level subjects"
          stream={value.stream}
          examType="olevel"
          value={value.olevelSubjects}
          onChange={(v) => onChange({ olevelSubjects: v as string[] })}
          minSelected={5}
          maxSelected={12}
          fixedSubjects={["English Language", "Mathematics"]}
          showSearch={false}
          helperText="English Language and Mathematics are shown first. Choose at least 3 more O-level subjects; these qualify the actual programme requirement after the UTME gate."
        />
      ) : null}

      {door === "know_where" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveAdmissionSearchField
            label="Intended programme"
            value={value.intendedProgramme ?? ""}
            onSelect={(item) =>
              onChange({
                intendedProgramme: item.name,
                intendedJambProgrammeId: item.id || undefined,
              })
            }
            placeholder="e.g. Mechanical Engineering"
            kind="programme"
          />
          <SelectField
            label="Preferred institution type"
            options={INSTITUTION_TYPES}
            value={value.preferredInstitutionType}
            placeholder="Choose institution type"
            onSelect={(v) =>
              onChange({ preferredInstitutionType: v as InstitutionType })
            }
          />
          <LiveAdmissionSearchField
            label="Preferred school"
            value={value.preferredSchool ?? ""}
            onSelect={(item) =>
              onChange({
                preferredSchool: item.name,
                preferredSchoolId: item.id || undefined,
              })
            }
            placeholder="Search universities"
            kind="school"
            institutionType={value.preferredInstitutionType ?? "university"}
            helperText="If your preferred school is not listed, type the name and continue."
          />
        </View>
      ) : null}

      {door === "know_what" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveAdmissionSearchField
            label="Intended programme"
            value={value.intendedProgramme ?? ""}
            onSelect={(item) =>
              onChange({
                intendedProgramme: item.name,
                intendedJambProgrammeId: item.id || undefined,
              })
            }
            placeholder="e.g. Economics"
            kind="programme"
          />
          <Text style={[styles.note, { color: colors.textMuted }]}>
            We'll show the universities offering this programme, its naming
            variants, and cycle-labelled requirements where they are published.
          </Text>
        </View>
      ) : null}

      {door === "unsure" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveSubjectMultiSelect
            label="Your UTME subjects"
            examType="utme"
            value={value.jambSubjects}
            onChange={(v) => onChange({ jambSubjects: v as string[] })}
            minSelected={4}
            maxSelected={4}
            showSearch={false}
            fixedSubjects={["English Language"]}
            helperText="Use of English is fixed. Choose 3 other UTME subjects; programme suggestions use official UTME combinations first, then show O-level requirements on the programme detail."
          />
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            We'll match these to programme options first, then help you choose a
            university before career mapping starts.
          </Text>
          <SelectField
            label="Your JAMB score band (optional)"
            options={SCORE_BANDS}
            value={value.jambScoreBand}
            placeholder="Choose score band"
            onSelect={(v) => onChange({ jambScoreBand: v })}
          />
        </View>
      ) : null}
        </>
      ) : null}

      <SifterButton
        label="Continue"
        onPress={onContinue}
        disabled={!hasBaseInstitution || !hasDoorFields}
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
});

export default JambSetupForm;
