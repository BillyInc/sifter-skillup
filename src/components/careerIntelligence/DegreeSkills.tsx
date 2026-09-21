/**
 * Student-facing programme learning view.
 *
 * The curriculum contract is source data, not a screen layout. This view
 * turns the checked course/outcome record into bounded learning cards so that
 * students see the meaning and progression before the source detail.
 */
import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, FontSize, Radius, Spacing, useTheme } from "@/theme";
import type { ProgrammeCurriculumContract, ProgrammeCurriculumOutcome, CareerLearningResource } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { isStudentResource } from "./resourceLinks";
import { programmeThemeForCourse, type ProgrammeThemeKey } from "./programmeCurriculumThemes";

const INITIAL_THEMES = 5;
const INITIAL_ABILITIES = 4;

function cleanText(value: string | null | undefined): string {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

function lowerFirst(value: string): string {
  return value ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function unique<T>(items: T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = key(item).toLowerCase();
    if (!value || seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

type CourseGroup = {
  code: string;
  title: string;
  level?: number | null;
  displayGroup?: string;
  courseSummary?: string | null;
  outcomes: ProgrammeCurriculumOutcome[];
};

function groupCourses(contract: ProgrammeCurriculumContract): CourseGroup[] {
  const groups = new Map<string, CourseGroup>();
  for (const outcome of contract.outcomes) {
    if (outcome.dataState !== "source_backed") continue;
    const code = cleanText(outcome.courseCode);
    const title = cleanText(outcome.courseTitle) || code || "Recorded course";
    const locator = outcome.sourceLocator as { courseSummary?: unknown } | undefined;
    const courseSummary = cleanText(
      outcome.courseSummary ?? (typeof locator?.courseSummary === "string" ? locator.courseSummary : ""),
    ) || null;
    const key = code || title;
    const current = groups.get(key);
    if (current) {
      if (!current.courseSummary && courseSummary) current.courseSummary = courseSummary;
      current.outcomes.push(outcome);
    } else {
      groups.set(key, { code, title, level: outcome.courseLevel, displayGroup: outcome.displayGroup, courseSummary, outcomes: [outcome] });
    }
  }
  return Array.from(groups.values()).map((course) => ({
    ...course,
    outcomes: unique(course.outcomes, (item) => item.studentText),
  }));
}

type ThemeKey = ProgrammeThemeKey;
type Theme = {
  key: ThemeKey;
  title: string;
  icon: "users" | "book-open" | "search" | "monitor" | "edit-3" | "layers";
  description: string;
  courses: CourseGroup[];
};

const THEME_META: Record<ThemeKey, Omit<Theme, "courses">> = {
  core: { key: "core", title: "Core programme learning", icon: "book-open", description: "The main ideas, knowledge and ways of working that define this programme." },
  shared: { key: "shared", title: "Shared university learning", icon: "layers", description: "University-wide learning recorded alongside the programme, such as communication, entrepreneurship or common foundation courses." },
  people: { key: "people", title: "People, groups and society", icon: "users", description: "Courses in this part help you examine the people, groups, institutions, cultures or systems named in the programme record." },
  ideas: { key: "ideas", title: "Ideas and foundations", icon: "book-open", description: "Courses in this part introduce the concepts, history and theories used to make sense of the programme’s subject area." },
  research: { key: "research", title: "Research and evidence", icon: "search", description: "Courses in this part show how the programme asks questions, gathers information, examines evidence and communicates findings." },
  technology: { key: "technology", title: "Technology and information", icon: "monitor", description: "Courses in this part cover the digital applications and information practices recorded for the programme." },
  application: { key: "application", title: "Using what you learn", icon: "edit-3", description: "Courses in this part show how the programme expects you to apply, explain, present or create something." },
};

function outcomeAction(text: string): string {
  const cleaned = cleanText(text).replace(/[.;]+$/, "");
  const withoutSourceLead = cleaned
    .replace(/^ability to\s+/i, "")
    .replace(/^competence in\s+/i, "build competence in ")
    .replace(/^subject-specific and transferable skills which allow for\s+/i, "develop skills that allow you to ");
  return lowerFirst(withoutSourceLead);
}

function studentAction(text: string): string {
  const cleaned = cleanText(text).replace(/[.;]+$/, "");
  if (/^you will\b/i.test(cleaned)) return `${cleaned}.`;
  return `You will learn to ${outcomeAction(cleaned)}.`;
}

function themeSentence(theme: Theme): string {
  const titles = theme.courses.slice(0, 3).map((course) => course.title);
  const coursePart = titles.length ? `The programme develops this through ${titles.join(", ")}.` : "The programme develops this through its recorded courses in this area.";
  const explanation: Record<ThemeKey, string> = {
    core: "You will build the main knowledge and ways of working that give this programme its identity.",
    shared: "You will also meet wider university learning that helps you communicate, reason, work with others or respond to shared social and professional questions.",
    people: "You will learn to recognise the people, groups, institutions, cultures or systems at the centre of the programme, and explain how they affect one another.",
    ideas: "You will learn to use concepts, theories and historical ideas to interpret questions in this field and compare different explanations.",
    research: "You will learn to frame a question, choose a method, gather and examine evidence, and communicate what it means and where it is limited.",
    technology: "You will learn to use the recorded digital applications and information practices to find, process and communicate information responsibly.",
    application: "You will practise using your learning in analysis, reports, presentations, projects or problem-solving where the curriculum records those activities.",
  };
  return `${explanation[theme.key]} ${coursePart}`;
}

function themePracticeItems(theme: Theme): string[] {
  return unique(
    theme.courses
      .flatMap((course) => course.outcomes.map((outcome) => studentAction(outcome.studentText)))
      .filter((item) => item.length > 18),
    (item) => item,
  ).slice(0, 4);
}

function abilitySentence(text: string): string {
  const cleaned = cleanText(text).replace(/[.;]+$/, "");
  if (/^you will\b/i.test(cleaned)) return `${cleaned}.`;
  const action = outcomeAction(cleaned).replace(/^demonstrate\s+adequate knowledge/i, "demonstrate what you understand");
  return `You will practise ${action}.`;
}

function resourceMatchesTheme(resource: CareerLearningResource, theme: Theme): boolean {
  if (resource.resourceType !== "programme_reading" || !resource.url) return false;
  const provenance = resource.sourceProvenance ?? {};
  const explicitTheme = String(provenance.theme_key ?? provenance.themeKey ?? provenance.display_group ?? "").trim().toLowerCase();
  if (explicitTheme && (explicitTheme === theme.key || explicitTheme === theme.title.toLowerCase())) return true;
  const target = resource.targetName.trim().toLowerCase();
  return theme.courses.some((course) => {
    const title = course.title.trim().toLowerCase();
    const code = course.code.trim().toLowerCase();
    return Boolean(target && ((title && target === title) || (code && target === code)));
  });
}

function resourcesForTheme(resources: CareerLearningResource[] | undefined, theme: Theme): CareerLearningResource[] {
  const approved = (resources ?? []).filter(isStudentResource);
  const exact = approved.filter((resource) => resourceMatchesTheme(resource, theme));
  // Do not attach an unrelated programme book merely because this theme has
  // no exact target match. A missing association is safer than a misleading
  // “learn more” link.
  return unique(exact, (item) => item.targetName + ":" + item.url).slice(0, 2);
}

function buildThemes(courses: CourseGroup[]): Theme[] {
  const byKey = new Map<ThemeKey, CourseGroup[]>();
  for (const course of courses) {
    const key = programmeThemeForCourse(course);
    byKey.set(key, (byKey.get(key) ?? []).concat(course));
  }
  return (Object.keys(THEME_META) as ThemeKey[]).map((key) => ({ ...THEME_META[key], courses: byKey.get(key) ?? [] })).filter((theme) => theme.courses.length);
}

function levelLabel(level?: number | null): string | null {
  return typeof level === "number" ? "Level " + level : null;
}

export interface DegreeSkillsProps {
  curriculumContract?: ProgrammeCurriculumContract | null;
  resources?: CareerLearningResource[];
  variant?: "teaser" | "full";
  color?: string;
}

export function DegreeSkills({ curriculumContract, resources, variant = "full" }: DegreeSkillsProps) {
  const { colors } = useTheme();
  const [themesExpanded, setThemesExpanded] = useState(false);
  const [abilitiesExpanded, setAbilitiesExpanded] = useState(false);
  const [openTheme, setOpenTheme] = useState<ThemeKey | null>(null);
  const courses = useMemo(() => curriculumContract ? groupCourses(curriculumContract) : [], [curriculumContract]);
  const themes = useMemo(() => buildThemes(courses), [courses]);
  const abilities = useMemo(() => unique(
    (curriculumContract?.abilities ?? []).filter((item) => item.dataState === "source_backed" && cleanText(item.studentText)),
    (item) => item.studentText,
  ), [curriculumContract]);

  if (!curriculumContract || curriculumContract.status !== "available" || !courses.length) {
    return (
      <View style={variant === "teaser" ? styles.teaserCard : styles.block}>
        <View style={styles.headingLine}><Feather name="book-open" size={17} color={colors.accentRole.action} /><SectionLabel>What you will study</SectionLabel></View>
        <Text style={[styles.empty, { color: colors.textRole.muted }]}>A checked programme learning preview will appear here when the programme record is available.</Text>
      </View>
    );
  }

  if (variant === "teaser") {
    return (
      <View style={[styles.teaserCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.teaserTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>A quick look at what you will study</Text>
        <Text style={[styles.teaserText, { color: colors.textRole.secondary }]}>{themes.slice(0, 3).map((theme) => theme.title.toLowerCase()).join(", ")}{themes.length > 3 ? " and more" : ""} are brought together so you can understand what this programme studies, how it investigates questions and how you may apply what you learn.</Text>
        <Text style={[styles.teaserMeta, { color: colors.textRole.muted }]}>Choose a university to see its own entry requirements and the fuller programme explanation.</Text>
      </View>
    );
  }

  const visibleThemes = themesExpanded ? themes : themes.slice(0, INITIAL_THEMES);
  return (
    <View style={styles.block}>
      <SectionLabel>What you will study</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>These cards explain the main parts of the programme in plain language. Open one when you want to see which courses support the explanation and what the curriculum asks you to practise.</Text>
      <View style={styles.themeGrid}>
        {visibleThemes.map((theme) => {
          const open = openTheme === theme.key;
          const themeResources = resourcesForTheme(resources, theme);
          return (
            <View key={theme.key} style={[styles.themeCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <View style={styles.headingLine}><Feather name={theme.icon} size={17} color={colors.accentRole.action} /><Text style={[styles.themeTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{theme.title}</Text></View>
              <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{theme.description}</Text>
              <Text style={[styles.themeSentence, { color: colors.textRole.secondary }]}>{themeSentence(theme)}</Text>
              {themeResources.length ? (
                <View style={[styles.learningLinks, { borderTopColor: colors.borderRole.subtle }]}>
                <Text style={[styles.linkHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Materials that explain this part</Text>
                  {themeResources.map((resource) => (
                    <View key={resource.targetName + ":" + resource.url} style={styles.linkRow}>
                      <Text style={[styles.linkName, { color: colors.textRole.secondary }]} numberOfLines={2}>{resource.targetName}</Text>
                      <ExternalLinkGuard url={resource.url} label={`Open ${resource.targetName}`} description={resource.description || "This opens the programme reading for " + resource.targetName + "."} textStyle={{ color: colors.accentRole.action }} />
                    </View>
                  ))}
                </View>
              ) : null}
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenTheme(open ? null : theme.key)} style={styles.moreButton}>
                 <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{open ? "Hide learning detail" : "See what you will practise"}</Text>
              </TouchableOpacity>
              {open ? (
                <View style={[styles.courseDetail, { borderTopColor: colors.borderRole.subtle }]}>
                  {themePracticeItems(theme).length ? (
                    <View style={styles.practiceBlock}>
                       <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What you will practise</Text>
                      {themePracticeItems(theme).map((item) => (
                        <View key={item} style={styles.practiceRow}>
                          <Feather name="check-circle" size={14} color={colors.accentRole.action} />
                          <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{item}</Text>
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Course areas behind this explanation</Text>
                  {theme.courses.map((course) => (
                    <View key={course.code || course.title} style={styles.courseRow}>
                      <Text style={[styles.courseTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{course.title}</Text>
                      <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>{[course.code, levelLabel(course.level)].filter(Boolean).join(" · ")}</Text>
                      {course.courseSummary ? <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{course.courseSummary}</Text> : null}
                    </View>
                  ))}
                </View>
              ) : null}
            </View>
          );
        })}
      </View>
      {themes.length > INITIAL_THEMES ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: themesExpanded }} onPress={() => setThemesExpanded((value) => !value)} style={styles.moreButton}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{themesExpanded ? "Show fewer learning areas" : "See all learning areas"}</Text></TouchableOpacity> : null}

      {abilities.length ? (
        <View style={[styles.abilitiesCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <SectionLabel>How you will use what you learn</SectionLabel>
          <Text style={[styles.abilitiesIntro, { color: colors.textRole.secondary }]}>The programme is not only about knowing ideas. It also asks you to use them, explain them, communicate clearly and work through questions or problems.</Text>
          <View style={styles.abilityGrid}>
            {(abilitiesExpanded ? abilities : abilities.slice(0, INITIAL_ABILITIES)).map((ability) => (
              <View key={ability.abilityId} style={[styles.abilityCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.abilityTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{ability.displayTitle || "Use what you learn"}</Text>
                <Text style={[styles.outcome, { color: colors.textRole.secondary }]}>{abilitySentence(ability.studentText)}</Text>
              </View>
            ))}
          </View>
          {abilities.length > INITIAL_ABILITIES ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: abilitiesExpanded }} onPress={() => setAbilitiesExpanded((value) => !value)} style={styles.moreButton}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{abilitiesExpanded ? "Show fewer abilities" : "See all abilities"}</Text></TouchableOpacity> : null}
        </View>
      ) : null}
    </View>
  );
}

export default DegreeSkills;

const styles = StyleSheet.create({
  block: { gap: Spacing.sm },
  headingLine: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  empty: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  intro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.55 },
  teaserCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  teaserTitle: { fontSize: FontSize.sm },
  teaserText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  teaserMeta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  themeCard: { flex: 1, minWidth: 280, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  themeTitle: { flex: 1, fontSize: FontSize.md, lineHeight: FontSize.md * 1.3 },
  themeDescription: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  themeSentence: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  courseMeta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  learningLinks: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.xs },
  linkHeading: { fontSize: FontSize.xs },
  linkRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  linkName: { flex: 1, fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.35 },
  moreButton: { alignSelf: "flex-start", minHeight: 32, justifyContent: "center", paddingTop: Spacing.xs },
  moreText: { fontSize: FontSize.sm, ...CompassFonts.bodySemibold },
  courseDetail: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.sm },
  courseRow: { gap: 2 },
  courseTitle: { fontSize: FontSize.sm },
  courseSummary: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
  abilitiesCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  practiceBlock: { gap: Spacing.xs, paddingBottom: Spacing.xs },
  detailHeading: { fontSize: FontSize.sm },
  practiceRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  abilitiesIntro: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  abilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  abilityCard: { flex: 1, minWidth: 230, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  abilityTitle: { fontSize: FontSize.sm },
  outcome: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
});
