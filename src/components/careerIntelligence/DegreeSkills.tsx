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
import type { ProgrammeCurriculumContract, ProgrammeCurriculumOutcome, CareerLearningResource, ProgrammeThemeGuidance, ProgrammeThemeRelationship } from "@/types/career";
import { SectionLabel } from "./RedesignPrimitives";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { isStudentResource } from "./resourceLinks";
import { programmeThemeForCourse, type ProgrammeThemeKey } from "./programmeCurriculumThemes";
import { programmePreviewUnavailableMessage } from "@/lib/programmePreview";

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
  sourceLocatorText?: string | null;
  outcomes: ProgrammeCurriculumOutcome[];
};

function groupCourses(contract: ProgrammeCurriculumContract): CourseGroup[] {
  const groups = new Map<string, CourseGroup>();
  for (const outcome of contract.outcomes) {
    if (outcome.dataState !== "source_backed") continue;
    const code = cleanText(outcome.courseCode);
    const title = cleanText(outcome.courseTitle) || code || "Recorded course";
    const locator = outcome.sourceLocator as { courseSummary?: unknown; sourceLocatorText?: unknown } | undefined;
    const courseSummary = cleanText(
      outcome.courseSummary ?? (typeof locator?.courseSummary === "string" ? locator.courseSummary : ""),
    ) || null;
    const sourceLocatorText = cleanText(typeof locator?.sourceLocatorText === "string" ? locator.sourceLocatorText : "") || null;
    const key = code || title;
    const current = groups.get(key);
    if (current) {
      if (!current.courseSummary && courseSummary) current.courseSummary = courseSummary;
      if (!current.sourceLocatorText && sourceLocatorText) current.sourceLocatorText = sourceLocatorText;
      current.outcomes.push(outcome);
    } else {
      groups.set(key, { code, title, level: outcome.courseLevel, displayGroup: outcome.displayGroup, courseSummary, sourceLocatorText, outcomes: [outcome] });
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
  narration: string;
  courses: CourseGroup[];
};

const THEME_META: Record<ThemeKey, Omit<Theme, "courses" | "narration">> = {
  core: { key: "core", title: "Core programme learning", icon: "book-open", description: "The main ideas, knowledge and ways of working that define this programme." },
  shared_communication: { key: "shared_communication", title: "Communication and academic writing", icon: "layers", description: "Shared university learning in clear English, reading, writing, reasoning and presenting ideas." },
  shared_nigerian_culture: { key: "shared_nigerian_culture", title: "Nigerian peoples and culture", icon: "users", description: "A shared course on Nigerian peoples, history, culture and social life." },
  shared_philosophy: { key: "shared_philosophy", title: "Philosophy and reasoning", icon: "book-open", description: "A shared course on philosophical questions, logic and clear reasoning." },
  shared_peace_conflict: { key: "shared_peace_conflict", title: "Peace, conflict and security", icon: "users", description: "A shared course introducing peace, conflict, security and ways people respond to conflict." },
  shared_enterprise: { key: "shared_enterprise", title: "Entrepreneurship and venture creation", icon: "edit-3", description: "Shared courses on identifying opportunities, developing ideas and understanding how ventures are planned." },
  people: { key: "people", title: "People, groups and society", icon: "users", description: "Courses in this part help you examine the people, groups, institutions, cultures or systems named in the programme record." },
  ideas: { key: "ideas", title: "Ideas and foundations", icon: "book-open", description: "Courses in this part introduce the concepts, history and theories used to make sense of the programme’s subject area." },
  research: { key: "research", title: "Research and evidence", icon: "search", description: "Courses in this part show how the programme asks questions, gathers information, examines evidence and communicates findings." },
  technology: { key: "technology", title: "Technology and information", icon: "monitor", description: "Courses in this part cover the digital applications and information practices recorded for the programme." },
  application: { key: "application", title: "Using what you learn", icon: "edit-3", description: "Courses in this part show how the programme expects you to apply, explain, present or create something." },
  african_societies: { key: "african_societies", title: "African and Nigerian societies", icon: "users", description: "These courses examine African and Nigerian social structures, cultures, histories and regional settings." },
  social_change: { key: "social_change", title: "Social change and development", icon: "edit-3", description: "These courses explore how societies change, what shapes development and how those changes affect people and institutions." },
  social_issues: { key: "social_issues", title: "Inequality, gender and social problems", icon: "users", description: "These courses examine inequality, gender relations, crime and other social problems, including their causes and effects." },
  governance: { key: "governance", title: "Politics and organisations", icon: "layers", description: "These courses examine political life, collective action, formal organisations and how institutions work with society." },
  applied_practice: { key: "applied_practice", title: "Social work and practical change", icon: "edit-3", description: "These courses connect social-science knowledge with social work, community services, innovation and practical responses to social needs." },
};

const SOCIOLOGY_THEME_NARRATION: Partial<Record<ThemeKey, string>> = {
  core: "These courses are part of the programme curriculum. Their titles and outcomes below show the specific learning they cover, even when they do not sit under one of the named themes.",
  shared_communication: "You will practise communicating clearly in speech and writing, understanding written information, and presenting ideas. These are shared university skills that support your Sociology studies; the course does not replace the discipline-specific research and reporting taught elsewhere in the programme.",
  shared_nigerian_culture: "You will study Nigerian peoples and cultures through historical and social examples. This shared course adds Nigerian context to your university learning; it is not a complete account of every community or a substitute for the Sociology programme's own African and Nigerian society courses.",
  shared_philosophy: "You will examine philosophical questions and practise logic—checking whether reasons support a conclusion. These are shared reasoning foundations, while sociological theory and evidence are developed in the Sociology courses.",
  shared_peace_conflict: "You will learn key ways people describe peace, conflict and security, and consider how conflict can arise and be addressed. This shared course introduces broad concepts; the Sociology courses examine particular social institutions, inequalities and settings in greater depth.",
  shared_enterprise: "You will explore how people identify an unmet need, develop an idea and plan a possible venture. These shared courses introduce entrepreneurship and venture creation; they do not promise that an idea will succeed or replace Sociology's study of social and economic conditions.",
  people: "You will examine how people behave and relate to one another, and how families, groups, culture, language and social settings shape everyday life. The courses draw on Sociology, Anthropology and Psychology while keeping their different viewpoints distinct.",
  ideas: "You will learn how Sociology developed, explore key concepts and compare sociological theories. The programme uses these ideas to help explain social institutions, relationships and change.",
  research: "You will move from forming a research question and planning a study to choosing suitable methods, collecting and analysing information, and explaining what the evidence can—and cannot—show. The curriculum includes quantitative approaches, which work with numbers, and qualitative approaches, which examine words, experiences and meaning.",
  technology: "You will practise using a computer and common applications to create, organise and present information. The curriculum names these as general computing skills; it does not make a particular software brand a Sociology requirement.",
  application: "You will connect social-science ideas with practical responses, including social-work services and innovation aimed at social or community needs. These courses introduce possible applications; they do not promise a particular job or business outcome.",
  african_societies: "You will study the histories, cultures, languages, institutions and social organisation of Nigerian and other African societies. Regional examples help you compare how societies differ and change; they are not presented as one story that describes every community.",
  social_change: "You will compare explanations of social change and development, then consider how economic, political and historical conditions affect families, institutions and communities. The curriculum includes African and Nigerian contexts as well as wider theories.",
  social_issues: "You will examine how inequality and gender relations shape people’s opportunities, and how crime and other social problems affect communities. The courses compare explanations and responses rather than treating any single cause or solution as universal.",
  governance: "You will study how social conditions influence political activity, parties and movements, and how formal organisations are structured and operate. This connects institutions to the people and communities around them.",
  applied_practice: "You will consider social causes of problems and the services and organisations that respond to them, then explore how social-science knowledge can support practical ideas and services. The curriculum’s examples are learning topics, not a guarantee of professional qualification.",
};

function outcomeAction(text: string): string {
  const cleaned = cleanText(text).replace(/[.;]+$/, "");
  const withoutSourceLead = cleaned
    .replace(/^ability to\s+/i, "")
    .replace(/^competence in\s+/i, "build competence in ")
    .replace(/^subject-specific and transferable skills which allow for\s+/i, "develop skills that allow you to ");
  return lowerFirst(withoutSourceLead);
}

function themeOverview(theme: Theme): string | null {
  return theme.description || null;
}

function studentSourceLocator(sourceLocatorText: string | null): string | null {
  if (!sourceLocatorText) return null;
  const match = sourceLocatorText.match(/\bprinted\s+(pp?\.)?\s*([\d]+(?:\s*(?:[\u2013\u2014-]|,)\s*[\d]+)*)/i);
  if (!match) return null;
  const pages = match[2].replace(/[\u2013\u2014-]/g, "\u2013").replace(/\s+/g, " ").trim();
  const pageMarker = match[1] || (/[\u2013\u2014,\-]/.test(pages) ? "pp." : "p.");
  return `Curriculum source: printed ${pageMarker} ${pages}`;
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
  const explicitThemes = [
    provenance.theme_keys,
    provenance.themeKeys,
    provenance.theme_key,
    provenance.themeKey,
    provenance.display_group,
  ].flatMap((value) => Array.isArray(value) ? value : value == null ? [] : [value])
    .map((value) => String(value).trim().toLowerCase())
    .filter(Boolean);
  if (explicitThemes.length) return explicitThemes.includes(theme.key) || explicitThemes.includes(theme.title.toLowerCase());
  const target = resource.targetName.trim().toLowerCase();
  return theme.courses.some((course) => {
    const title = course.title.trim().toLowerCase();
    const code = course.code.trim().toLowerCase();
    return Boolean(target && ((title && target === title) || (code && target === code)));
  });
}

function resourcesForTheme(resources: CareerLearningResource[] | undefined, theme: Theme): CareerLearningResource[] {
  const approved = (resources ?? []).filter((resource) => isStudentResource(resource));
  const exact = approved.filter((resource) => resourceMatchesTheme(resource, theme));
  // Do not attach an unrelated programme book merely because this theme has
  // no exact target match. A missing association is safer than a misleading
  // “learn more” link.
  return unique(exact, (item) => item.targetName + ":" + item.url);
}

function programmeReadingLabel(resource: CareerLearningResource): string {
  const provenance = resource.sourceProvenance ?? {};
  const scope = String(provenance.reading_scope ?? provenance.readingScope ?? provenance.sourceType ?? "").trim().toLowerCase();
  if (["prescribed", "prescribed_reading", "required_by_institution"].includes(scope)) return "Course-prescribed reading";
  if (["recommended", "recommended_reference", "recommended_reading"].includes(scope)) return "Recommended reading";
  if (["free_foundation_reference", "open_foundation_reference", "open_learning"].includes(scope)) return "Open foundation reading";
  if (["nigerian_courseware_reference", "nigeria_courseware"].includes(scope)) return "Nigerian courseware reference";
  if (scope === "official_curriculum") return "Official curriculum source";
  return "Further reading";
}

function programmeReadingByline(resource: CareerLearningResource): string | null {
  const provenance = resource.sourceProvenance ?? {};
  const details = [
    provenance.authors,
    provenance.edition,
    provenance.publication_year ?? provenance.publicationYear,
    provenance.isbn,
  ].map((value) => String(value ?? "").trim()).filter(Boolean);
  return details.length ? details.join(" · ") : null;
}

function programmeReadingDescription(resource: CareerLearningResource, theme: Theme): string | null {
  const provenance = resource.sourceProvenance ?? {};
  const descriptions = provenance.theme_descriptions ?? provenance.themeDescriptions;
  if (descriptions && typeof descriptions === "object" && !Array.isArray(descriptions)) {
    const byTheme = descriptions as Record<string, unknown>;
    const specific = byTheme[theme.key] ?? byTheme[theme.title];
    if (typeof specific === "string" && specific.trim()) return specific.trim();
  }
  return resource.description?.trim() || null;
}

function programmeReadingRationale(resource: CareerLearningResource, theme: Theme): string {
  const provenance = resource.sourceProvenance ?? {};
  const rationales = provenance.theme_rationales ?? provenance.themeRationales;
  if (rationales && typeof rationales === "object" && !Array.isArray(rationales)) {
    const byTheme = rationales as Record<string, unknown>;
    const specific = byTheme[theme.key] ?? byTheme[theme.title];
    if (typeof specific === "string" && specific.trim()) return specific.trim();
  }
  return `This material is linked to the reviewed programme record for “${theme.title}”. It can help you explore this theme; the link alone does not mean your university prescribes it.`;
}

function programmeReadingUrl(resource: CareerLearningResource, theme: Theme): string {
  const provenance = resource.sourceProvenance ?? {};
  const urls = provenance.theme_urls ?? provenance.themeUrls;
  if (urls && typeof urls === "object" && !Array.isArray(urls)) {
    const byTheme = urls as Record<string, unknown>;
    const specific = byTheme[theme.key] ?? byTheme[theme.title];
    if (typeof specific === "string" && specific.trim()) return specific.trim();
  }
  return resource.url;
}

function programmeReadingTerms(resource: CareerLearningResource): string | null {
  const provenance = resource.sourceProvenance ?? {};
  const terms = provenance.access_terms_note ?? provenance.accessTermsNote;
  return typeof terms === "string" && terms.trim() ? terms.trim() : null;
}

function buildThemes(courses: CourseGroup[]): Theme[] {
  const byKey = new Map<ThemeKey, CourseGroup[]>();
  for (const course of courses) {
    const key = programmeThemeForCourse(course);
    byKey.set(key, (byKey.get(key) ?? []).concat(course));
  }
  return (Object.keys(THEME_META) as ThemeKey[]).map((key) => ({
    ...THEME_META[key],
    narration: SOCIOLOGY_THEME_NARRATION[key] ?? THEME_META[key].description,
    courses: byKey.get(key) ?? [],
  })).filter((theme) => theme.courses.length);
}

function guidanceForTheme(items: ProgrammeThemeGuidance[] | undefined, theme: Theme): ProgrammeThemeGuidance[] {
  return (items ?? []).filter((item) => item.themeKey === theme.key && item.selectionState === "fixed_programme_guidance_not_selectable");
}

function relationshipsForTheme(items: ProgrammeThemeRelationship[] | undefined, theme: Theme): ProgrammeThemeRelationship[] {
  return (items || []).filter((item) => item.themeKey === theme.key
    && item.selectionState === "fixed_programme_guidance_not_selectable"
    && Boolean(item.learnerExplanation && item.learningUrl && item.learningLabel));
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
  const [openCourseOutlines, setOpenCourseOutlines] = useState<Set<string>>(() => new Set());
  const courses = useMemo(() => curriculumContract ? groupCourses(curriculumContract) : [], [curriculumContract]);
  const themes = useMemo(() => buildThemes(courses), [courses]);
  const abilities = useMemo(() => unique(
    (curriculumContract?.abilities ?? []).filter((item) => item.dataState === "source_backed" && cleanText(item.studentText)),
    (item) => item.studentText,
  ), [curriculumContract]);

  if (!curriculumContract || curriculumContract.status !== "available" || (!courses.length && !abilities.length)) {
    return (
      <View style={variant === "teaser" ? styles.teaserCard : styles.block}>
        <View style={styles.headingLine}><Feather name="book-open" size={17} color={colors.accentRole.action} /><SectionLabel>What you will study</SectionLabel></View>
        <Text style={[styles.empty, { color: colors.textRole.muted }]}>{programmePreviewUnavailableMessage(curriculumContract?.status)}</Text>
      </View>
    );
  }

  if (variant === "teaser") {
    return (
      <View style={[styles.teaserCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.teaserTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>A quick look at what you will study</Text>
        {themes.length ? (
          <Text style={[styles.teaserText, { color: colors.textRole.secondary }]}>{themes.slice(0, 3).map((theme) => theme.title.toLowerCase()).join(", ")}{themes.length > 3 ? " and more" : ""} are brought together so you can understand what this programme studies, how it investigates questions and how you may apply what you learn.</Text>
        ) : (
          <View style={styles.teaserAbilities}>
            {abilities.slice(0, 3).map((ability) => <Text key={ability.abilityId} style={[styles.teaserText, { color: colors.textRole.secondary }]}>{abilitySentence(ability.studentText)}</Text>)}
          </View>
        )}
        <Text style={[styles.teaserMeta, { color: colors.textRole.muted }]}>Choose a university to see its own entry requirements and the fuller programme explanation.</Text>
      </View>
    );
  }

  const visibleThemes = themesExpanded ? themes : themes.slice(0, INITIAL_THEMES);
  return (
    <View style={styles.block}>
      <SectionLabel>What you will study</SectionLabel>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>This is the curriculum your university programme teaches. These cards group its courses into themes and explain the outcomes in clear language; they are fixed programme learning, not a menu of extra learning choices. Open one to see the courses and original outcomes behind each explanation.</Text>
      {curriculumContract.localSourcePreview ? <Text style={[styles.teaserMeta, { color: colors.textRole.muted }]}>Local preview from the reviewed Sociology curriculum source. This source-backed preview is not yet loaded in the database.</Text> : null}
      <View style={styles.themeGrid}>
        {visibleThemes.map((theme) => {
          const open = openTheme === theme.key;
          const themeResources = resourcesForTheme(resources, theme);
          const themeGuidance = guidanceForTheme(curriculumContract.themeGuidance, theme);
          const themeRelationships = relationshipsForTheme(curriculumContract.themeRelationships, theme);
          return (
            <View key={theme.key} style={[styles.themeCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <View style={styles.headingLine}><Feather name={theme.icon} size={17} color={colors.accentRole.action} /><Text style={[styles.themeTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{theme.title}</Text></View>
              {themeOverview(theme) ? <View style={styles.themeCopyBlock}>
                <Text accessibilityRole="header" style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Theme focus</Text>
                <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{themeOverview(theme)}</Text>
              </View> : null}
              <View style={styles.themeCopyBlock}>
                <Text accessibilityRole="header" style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How these courses fit together</Text>
                <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{theme.narration}</Text>
              </View>
              {themeResources.length ? (
                <View style={[styles.learningLinks, { borderTopColor: colors.borderRole.subtle }]}>
                <Text style={[styles.linkHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Materials that explain this part</Text>
                  {themeResources.map((resource) => (
                    <View key={resource.targetName + ":" + resource.url} style={styles.linkRow}>
                      <View style={styles.resourceCopy}>
                        <Text style={[styles.resourceKind, { color: colors.textRole.muted }]}>{programmeReadingLabel(resource)}</Text>
                        <Text style={[styles.linkName, { color: colors.textRole.secondary }]}>{resource.targetName}</Text>
                        {programmeReadingByline(resource) ? <Text style={[styles.resourceProvider, { color: colors.textRole.muted }]}>{programmeReadingByline(resource)}</Text> : null}
                        <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why this material is here</Text>
                        <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{programmeReadingRationale(resource, theme)}</Text>
                        {programmeReadingDescription(resource, theme) ? <><Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What it covers</Text><Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{programmeReadingDescription(resource, theme)}</Text></> : null}
                        <Text style={[styles.resourceProvider, { color: colors.textRole.muted }]}>{resource.provider} · {resource.accessType === "free" ? "Free access" : resource.accessType === "paid" ? "May require payment" : resource.accessType === "mixed" ? "Access varies" : "Check current access"}</Text>
                        {programmeReadingTerms(resource) ? <Text style={[styles.resourceProvider, { color: colors.textRole.muted }]}>{programmeReadingTerms(resource)}</Text> : null}
                      </View>
                      <ExternalLinkGuard url={programmeReadingUrl(resource, theme)} label="Open material" description={programmeReadingDescription(resource, theme) || "This opens the programme reading for " + resource.targetName + "."} style={[styles.resourceButton, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]} textStyle={{ color: colors.accentRole.action }} />
                    </View>
                  ))}
                </View>
              ) : null}
              <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenTheme(open ? null : theme.key)} style={styles.moreButton}>
                 <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{open ? "Hide courses and outcomes" : "See courses and outcomes"}</Text>
              </TouchableOpacity>
              {open ? (
                <View style={[styles.courseDetail, { borderTopColor: colors.borderRole.subtle }]}>
                  {themeGuidance.length ? (
                    <View style={styles.guidanceBlock}>
                      <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Understand the ideas in this theme</Text>
                      <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>These explanations unpack what your programme teaches. They are fixed curriculum guidance, not extra topics to select.</Text>
                      {themeGuidance.map((item) => (
                        <View key={item.itemKey} style={[styles.guidanceCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                          <Text style={[styles.resourceKind, { color: colors.textRole.muted }]}>{item.itemType === "knowledge" ? "Key idea" : item.itemType === "method" ? "A way to find out" : "A way to act responsibly"}</Text>
                          <Text style={[styles.courseTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{item.title}</Text>
                          <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{item.plainMeaning}</Text>
                          <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>A simple example</Text>
                          <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{item.everydayExample}</Text>
                          <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Why your programme covers it</Text>
                          <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{item.contextualUse}</Text>
                          <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Optional way to practise</Text>
                          <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{item.expectedOutput}</Text>
                          {item.sources.length ? (
                            <View style={styles.guidanceSources}>
                              <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Sources behind this explanation</Text>
                              {item.sources.map((source) => (
                                <ExternalLinkGuard
                                  key={`${item.itemKey}:${source.id}`}
                                  url={source.url}
                                  label={`${source.title} — ${Object.values(source.locators).join("; ")}`}
                                  description={`This source supports ${item.title}. ${source.jurisdiction} scope.`}
                                  style={styles.guidanceSourceLink}
                                  textStyle={{ color: colors.accentRole.action, fontSize: 13, lineHeight: 19 }}
                                />
                              ))}
                            </View>
                          ) : null}
                          <View style={[styles.guidanceLearning, { borderTopColor: colors.borderRole.subtle }]}>
                            <View style={styles.resourceCopy}>
                              <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Optional learning resource</Text>
                              {item.learningLevel ? <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>{item.learningLevel}{item.learningDuration ? ` · ${item.learningDuration}` : ""}</Text> : null}
                              {item.learningAccess ? <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>{item.learningAccess}</Text> : null}
                            </View>
                            <ExternalLinkGuard url={item.learningUrl} label={item.learningLabel} description={`${item.learningSourceReference.title || "External learning resource"}. This is optional support, not a course requirement.`} style={[styles.resourceButton, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]} textStyle={{ color: colors.accentRole.action }} />
                          </View>
                          {item.limitations.map((limitation, index) => <Text key={`${item.itemKey}:limit:${index}`} style={[styles.courseMeta, { color: colors.textRole.muted }]}>Note: {limitation}</Text>)}
                        </View>
                      ))}
                    </View>
                  ) : null}
                  {themeRelationships.length ? (
                    <View style={styles.guidanceBlock}>
                      <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How these ideas connect</Text>
                      {themeRelationships.map((relationship) => (
                        <View key={relationship.relationshipKey} style={[styles.guidanceCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                          <Text style={[styles.resourceKind, { color: colors.textRole.muted }]}>{relationship.fromTitle} → {relationship.toTitle}</Text>
                          <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{relationship.learnerExplanation}</Text>
                          {relationship.limitations.map((limitation, index) => <Text key={`${relationship.relationshipKey}:limit:${index}`} style={[styles.courseMeta, { color: colors.textRole.muted }]}>Note: {limitation}</Text>)}
                          <ExternalLinkGuard url={relationship.learningUrl} label={relationship.learningLabel} description={`${relationship.learningSourceReference.title || "External learning resource"}. Optional support for understanding this connection.`} style={[styles.resourceButton, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]} textStyle={{ color: colors.accentRole.action }} />
                        </View>
                      ))}
                    </View>
                  ) : null}
                  <Text style={[styles.detailHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Course areas behind this explanation</Text>
                  {theme.courses.map((course) => (
                    <View key={course.code || course.title} style={styles.courseRow}>
                      <Text style={[styles.courseTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{course.title}</Text>
                      {levelLabel(course.level) ? <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>{levelLabel(course.level)}</Text> : null}
                      {studentSourceLocator(course.sourceLocatorText ?? null) ? <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>{studentSourceLocator(course.sourceLocatorText ?? null)}</Text> : null}
                      {course.outcomes.length ? (
                        <View style={styles.courseOutcomes}>
                          <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>Course outcomes, in learner-friendly wording</Text>
                          {course.outcomes.map((outcome) => (
                            <View key={outcome.outcomeId} style={styles.courseOutcome}>
                              <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{outcome.studentText}</Text>
                            </View>
                          ))}
                        </View>
                      ) : null}
                      {course.courseSummary || course.outcomes.some((outcome) => outcome.sourceText && outcome.sourceText.trim() !== outcome.studentText.trim()) ? <View style={styles.sourceOutline}>
                        <TouchableOpacity
                          accessibilityRole="button"
                          accessibilityState={{ expanded: openCourseOutlines.has(`${theme.key}:${course.code || course.title}`) }}
                          accessibilityLabel={`${openCourseOutlines.has(`${theme.key}:${course.code || course.title}`) ? "Hide" : "View"} original course outline for ${course.title}`}
                          onPress={() => setOpenCourseOutlines((current) => {
                            const key = `${theme.key}:${course.code || course.title}`;
                            const next = new Set(current);
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          })}
                          style={styles.moreButton}
                        >
                          <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{openCourseOutlines.has(`${theme.key}:${course.code || course.title}`) ? "Hide original course outline" : "View original course outline"}</Text>
                        </TouchableOpacity>
                        {openCourseOutlines.has(`${theme.key}:${course.code || course.title}`) ? <View style={[styles.sourceOutlineContent, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                          <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>Original curriculum wording is preserved here for reference. It may be technical or compressed; the learner-friendly outcomes are shown above.</Text>
                          {course.courseSummary ? <><Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Original course outline</Text><Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{course.courseSummary}</Text></> : null}
                          {course.outcomes.filter((outcome) => outcome.sourceText && outcome.sourceText.trim() !== outcome.studentText.trim()).map((outcome) => <View key={`${outcome.outcomeId}:source`} style={styles.sourceOutcomeBlock}>
                            <Text style={[styles.guidanceLabel, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Original curriculum outcome wording</Text>
                            <Text style={[styles.courseSummary, { color: colors.textRole.secondary }]}>{outcome.sourceText}</Text>
                          </View>)}
                        </View> : null}
                      </View> : null}
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
  empty: { fontSize: 16, lineHeight: 24 },
  intro: { fontSize: 16, lineHeight: 25 },
  teaserCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  teaserAbilities: { gap: Spacing.xs },
  teaserTitle: { fontSize: 19, lineHeight: 26 },
  teaserText: { fontSize: 16, lineHeight: 24 },
  teaserMeta: { fontSize: 13, lineHeight: 19 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  themeCard: { flex: 1, minWidth: 280, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  themeTitle: { flex: 1, fontSize: 19, lineHeight: 25 },
  themeDescription: { fontSize: 16, lineHeight: 24 },
  themeCopyBlock: { gap: Spacing.xs, paddingTop: Spacing.xs },
  courseMeta: { fontSize: 13, lineHeight: 19 },
  learningLinks: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.xs },
  linkHeading: { fontSize: 20, lineHeight: 27, ...CompassFonts.bodySemibold },
  linkRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  resourceCopy: { flex: 1, gap: 2 },
  resourceButton: { minHeight: 34, justifyContent: "center", alignItems: "center", borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  resourceKind: { fontSize: 13, lineHeight: 19, fontWeight: "800" },
  resourceProvider: { fontSize: 13, lineHeight: 19 },
  linkName: { fontSize: 16, lineHeight: 24 },
  moreButton: { alignSelf: "flex-start", minHeight: 32, justifyContent: "center", paddingTop: Spacing.xs },
  moreText: { fontSize: 16, lineHeight: 23, ...CompassFonts.bodySemibold },
  courseDetail: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.sm },
  guidanceBlock: { gap: Spacing.sm },
  guidanceCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  guidanceLabel: { fontSize: 16, lineHeight: 23, ...CompassFonts.bodySemibold },
  guidanceSources: { gap: 2, paddingTop: Spacing.xs },
  guidanceSourceLink: { alignSelf: "flex-start", paddingVertical: 2 },
  guidanceLearning: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.xs },
  courseRow: { gap: 2 },
  courseOutcomes: { gap: Spacing.xs, paddingTop: Spacing.xs },
  sourceOutline: { gap: Spacing.xs, alignItems: "flex-start" },
  sourceOutlineContent: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm, width: "100%" },
  sourceOutcomeBlock: { gap: Spacing.xs, paddingTop: Spacing.xs },
  courseOutcome: { gap: 2, paddingLeft: Spacing.sm },
  sourceOutcome: { fontSize: 13, lineHeight: 19, fontStyle: "italic" },
  courseTitle: { fontSize: 18, lineHeight: 25 },
  courseSummary: { fontSize: 16, lineHeight: 24 },
  abilitiesCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  detailHeading: { fontSize: 20, lineHeight: 27, ...CompassFonts.bodySemibold },
  abilitiesIntro: { fontSize: 16, lineHeight: 24 },
  abilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  abilityCard: { flex: 1, minWidth: 230, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  abilityTitle: { fontSize: 18, lineHeight: 25 },
  outcome: { fontSize: 16, lineHeight: 24 },
});
