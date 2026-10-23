/**
 * Step-2 setup for SS3 / UTME candidates.
 *
 * Mirrors the admission mechanism with three doors:
 * know_where -> programme + university
 * know_what -> programme only
 * unsure -> strongest subjects -> eligible programmes once data is live
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme, Spacing, FontSize, Brand } from "../../theme";
import { SifterButton } from "../ui";
import { LiveAdmissionSearchField } from "./LiveAdmissionSearchField";
import { LiveSubjectMultiSelect, MAX_OLEVEL_SUBJECTS } from "./LiveSubjectMultiSelect";
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
} from "../../types/onboarding";
import LocalLegalNotice from "../LocalLegalNotice";

const DOORS: {
  value: SsDoor;
  icon: string;
  title: string;
  subtitle: string;
}[] = [
  {
    value: "unsure",
    icon: "A",
    title: "I don’t know the programme yet",
    subtitle: "Use your O-level and UTME subjects to narrow the options",
  },
  {
    value: "know_what",
    icon: "B",
    title: "I know the programme, not the university",
    subtitle: "See universities, official programme names and requirements",
  },
  {
    value: "know_where",
    icon: "C",
    title: "I know the programme and the university",
    subtitle: "Check the programme at a specific university",
  },
];

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
  const [showSubjectCheck, setShowSubjectCheck] = useState(door === "unsure");
  useEffect(() => {
    setShowSubjectCheck(door === "unsure");
  }, [door]);
  const hasBaseInstitution = isSs3Student
    ? Boolean(value.secondarySchoolId)
    : value.jambPrepMode === "self_taught" || Boolean(value.tutorialCentreId);
  const hasOlevelSubjects = selectedOlevelSubjects.length >= 5;
  const hasDoorFields =
    door === "unsure"
      ? hasOlevelSubjects && selectedSubjects.length >= 4
      : door === "know_what"
        ? Boolean(value.intendedJambProgrammeId)
        : door === "know_where"
          ? Boolean(value.intendedJambProgrammeId && value.preferredSchoolId)
          : false;

  return (
    <View style={{ gap: Spacing.xl }}>
      <LocalLegalNotice audience="student" />
      <View style={{ gap: Spacing.xs }}>
        <Text style={[styles.heading, { color: colors.text }]}>
          {isSs3Student ? "Build your SS3 admission plan" : "Build your JAMB admission plan"}
        </Text>
        <Text style={[styles.sub, { color: colors.textSoft }]}>
          Tell us where you are preparing from, then choose the question you want
          answered first. If you already know the programme or university, we will
          show its requirements first. Subjects are only needed when you ask us to
          check your current combination or find options for you.
        </Text>
      </View>

      {isSs3Student ? (
        <LiveAdmissionSearchField
          label="Your secondary school"
          value={value.secondarySchoolName ?? ""}
          selectedId={value.secondarySchoolId}
          onSelect={(item) =>
            onChange({
              secondarySchoolName: item.name,
              secondarySchoolId: item.id || undefined,
            })
          }
          placeholder="Search or type your school name"
          kind="school"
          institutionType="secondary_school"
          allowRegister
           helperText="Your school is required. Select it if it is listed, or add its name so it can be connected to your guidance record."
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
              selectedId={value.tutorialCentreId}
              onSelect={(item) =>
                onChange({
                  tutorialCentreName: item.name,
                  tutorialCentreId: item.id || undefined,
                })
              }
              placeholder="Search or type your tutorial centre"
              kind="school"
              institutionType="tutorial_centre"
                allowRegister
                helperText="Choose your tutorial centre if it is listed, or add its name. You can also choose self-taught."
            />
          ) : null}
        </View>
      ) : null}

      {hasBaseInstitution ? (
        <>
      <View style={{ gap: Spacing.md }}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>What would you like to find out first?</Text>
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

      {door && (door === "unsure" || showSubjectCheck) ? (
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
      ) : null}
      {door && value.stream ? (
        <Text style={[styles.caption, { color: colors.textMuted }]}>
          Your stream helps us organise subject guidance. We will not call a
          programme a match until its UTME and O-level requirements are checked.
        </Text>
      ) : null}

      {door && door !== "unsure" ? (
        <View style={{ gap: Spacing.xs }}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setShowSubjectCheck((current) => !current)}
            style={[styles.subjectCheckButton, { borderColor: colors.borderRole.subtle }]}
          >
            <Text style={[styles.subjectCheckText, { color: colors.accentRole.action }]}>
              {showSubjectCheck ? "Hide optional subject check" : "Check my subjects against this programme"}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            You can continue without entering subjects. We will show the official
            O-level and UTME requirements on the next screen.
          </Text>
        </View>
      ) : null}

      {value.stream && door && (door === "unsure" || showSubjectCheck) ? (
        <LiveSubjectMultiSelect
          label="Your WAEC/NECO subjects"
          stream={value.stream}
          examType="olevel"
          value={value.olevelSubjects}
          onChange={(v) => onChange({ olevelSubjects: v as string[] })}
          minSelected={5}
          maxSelected={MAX_OLEVEL_SUBJECTS}
          fixedSubjects={["English Language", "Mathematics"]}
          showSearch
          streamScoped
          helperText="Your stream shows the subjects usually taken on that path. A programme can still ask for a subject that is not in this list. We will show that when you open the programme."
        />
      ) : null}

      {value.stream && door && (door === "unsure" || showSubjectCheck) ? (
        <LiveSubjectMultiSelect
          label="Your UTME/JAMB subjects"
          stream={value.stream}
          examType="utme"
          value={value.jambSubjects}
          onChange={(v) => onChange({ jambSubjects: v as string[] })}
          minSelected={4}
          maxSelected={4}
          showSearch
          streamScoped
          fixedSubjects={["English Language"]}
          helperText="Use of English is fixed. Choose 3 other UTME subjects from your selected stream. Cross-listed subjects appear in every applicable stream. Exact programme and institution combinations are checked separately and take priority."
        />
      ) : null}

      {door === "know_where" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveAdmissionSearchField
            label="Programme you want to study"
            value={value.intendedProgramme ?? ""}
            selectedId={value.intendedJambProgrammeId}
            onSelect={(item) =>
              onChange({
                intendedProgramme: item.name,
                intendedJambProgrammeId: item.id || undefined,
              })
            }
            placeholder="e.g. Mechanical Engineering"
            kind="programme"
          />
          <LiveAdmissionSearchField
            label="Preferred university"
            value={value.preferredSchool ?? ""}
            selectedId={value.preferredSchoolId}
            onSelect={(item) =>
              onChange({
                preferredSchool: item.name,
                preferredSchoolId: item.id || undefined,
                preferredInstitutionType: "university",
              })
            }
            placeholder="Search universities"
            kind="school"
            institutionType="university"
            helperText="Choose a university from the list. We will check the programme and university requirements together."
          />
        </View>
      ) : null}

      {door === "know_what" ? (
        <View style={{ gap: Spacing.lg }}>
          <LiveAdmissionSearchField
            label="Programme you want to study"
            value={value.intendedProgramme ?? ""}
            selectedId={value.intendedJambProgrammeId}
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
            We will show universities with this exact programme identity.
            If a different JAMB programme name appears, it will be shown as a
            separate programme with its own universities and requirements.
          </Text>
        </View>
      ) : null}

      {door === "unsure" ? (
        <View style={{ gap: Spacing.lg }}>
          <Text style={[styles.caption, { color: colors.textMuted }]}>
            We will show programmes that accept this combination, explain any
            missing O-level requirement, and then show the universities with
            the programme.
          </Text>
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
  sectionLabel: { fontSize: FontSize.sm, fontWeight: "800" },
  subjectCheckButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  subjectCheckText: { fontSize: FontSize.sm, fontWeight: "800" },
});

export default JambSetupForm;
