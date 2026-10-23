/**
 * Student-facing programme learning view.
 *
 * The curriculum contract is source data, not a screen layout. This view
 * turns the checked course/outcome record into bounded learning cards so that
 * students see the meaning and progression before the source detail.
 */
import React, { useMemo, useState } from "react";
import { AccessibilityInfo, findNodeHandle, StyleSheet, Text, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { CompassFonts, Radius, Spacing, useTheme } from "@/theme";
import type { ProgrammeCurriculumContract, ProgrammeCurriculumOutcome, CareerLearningResource, ProgrammeThemeGuidance, ProgrammeThemeRelationship } from "@/types/career";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { isStudentResource } from "./resourceLinks";
import { programmeThemeForCourse, type ProgrammeThemeKey } from "./programmeCurriculumThemes";
import { programmePreviewUnavailableMessage } from "@/lib/programmePreview";
import { explainTechnicalTerms } from "@/lib/studentExplanation";
import sociologyThemeAbilityLedger from "../../../data/career-mapping/_audit/sociology_theme_student_abilities_2026_10_22.json";

const INITIAL_THEMES = 5;
const INITIAL_ABILITIES = 4;
const WIDE_THEME_CARD = 560;

type AbilityLedgerLine = { themeKey: string; lineId: string; studentLine: string; outcomeIds: string[] };
type AbilityLine = { id: string; text: string; outcomeIds: string[] };

const LEDGER_LINES = sociologyThemeAbilityLedger.lines as AbilityLedgerLine[];

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

function themeValue(value: unknown, theme: Theme): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const entries = Object.entries(value as Record<string, unknown>);
  const found = entries.find(([key]) => key.toLocaleLowerCase() === theme.key.toLocaleLowerCase())
    ?? entries.find(([key]) => key.toLocaleLowerCase() === theme.title.toLocaleLowerCase());
  return typeof found?.[1] === "string" && found[1].trim() ? found[1].trim() : null;
}

type CourseGroup = {
  code: string;
  title: string;
  displayGroup?: string;
  outcomes: ProgrammeCurriculumOutcome[];
};

function groupCourses(contract: ProgrammeCurriculumContract): CourseGroup[] {
  const groups = new Map<string, CourseGroup>();
  for (const outcome of contract.outcomes) {
    if (outcome.dataState !== "source_backed") continue;
    const code = cleanText(outcome.courseCode);
    const title = cleanText(outcome.courseTitle) || code || "Recorded course";
    const key = code || title;
    const current = groups.get(key);
    if (current) {
      current.outcomes.push(outcome);
    } else {
      groups.set(key, { code, title, displayGroup: outcome.displayGroup, outcomes: [outcome] });
    }
  }
  return Array.from(groups.values()).map((course) => ({
    ...course,
    // Keep course ownership intact. Two courses can legitimately describe a
    // similar ability; deduplicating by student wording would silently detach
    // an outcome from its source course.
    outcomes: unique(course.outcomes, (item) => item.outcomeId || `${course.code}:${item.outcomeIndex}:${item.studentText}`),
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
  shared_communication: { key: "shared_communication", title: "Communication and academic writing", icon: "layers", description: "University learning in clear English, reading, writing, reasoning and presenting ideas." },
  shared_nigerian_culture: { key: "shared_nigerian_culture", title: "Nigerian peoples and culture", icon: "users", description: "Learning about Nigerian peoples, history, culture and social life." },
  shared_philosophy: { key: "shared_philosophy", title: "Philosophy and reasoning", icon: "book-open", description: "Learning about philosophical questions, logic and clear reasoning." },
  shared_peace_conflict: { key: "shared_peace_conflict", title: "Peace, conflict and security", icon: "users", description: "An introduction to peace, conflict, security and ways people respond to conflict." },
  shared_enterprise: { key: "shared_enterprise", title: "Entrepreneurship and venture creation", icon: "edit-3", description: "Learning to identify opportunities, develop ideas and understand how ventures are planned." },
  people: { key: "people", title: "People, groups and society", icon: "users", description: "How people, groups, institutions and cultures shape one another." },
  ideas: { key: "ideas", title: "Ideas and foundations", icon: "book-open", description: "The main ideas, history and theories used to make sense of social life." },
  research: { key: "research", title: "Research and evidence", icon: "search", description: "How you ask a question, gather information, check evidence and explain what you found." },
  technology: { key: "technology", title: "Technology and information", icon: "monitor", description: "How digital tools and information are used to study people and society." },
  application: { key: "application", title: "Using what you learn", icon: "edit-3", description: "How you apply, explain, present or create something from what you have studied." },
  african_societies: { key: "african_societies", title: "African and Nigerian societies", icon: "users", description: "African and Nigerian social life, cultures, histories and places." },
  social_change: { key: "social_change", title: "Social change and development", icon: "edit-3", description: "How societies change, what shapes that change, and how it affects people and institutions." },
  social_issues: { key: "social_issues", title: "Inequality, gender and social problems", icon: "users", description: "Inequality, gender, crime and other social problems, including why they happen and what they do to people." },
  governance: { key: "governance", title: "Politics and organisations", icon: "layers", description: "Political life, people acting together, organisations, and how institutions work with society." },
  applied_practice: { key: "applied_practice", title: "Social work and practical change", icon: "edit-3", description: "Using what you learn to support people, communities and practical responses to social needs." },
};

const SOCIOLOGY_THEME_NARRATION: Partial<Record<ThemeKey, string>> = {
  core: "This learning is part of the official programme record. The outcomes below describe capabilities you are expected to develop, even when the record does not place them under a named theme.",
  shared_communication: "You will practise communicating clearly in speech and writing, understanding written information, and presenting ideas. These abilities support your Sociology studies; they complement, rather than replace, the programme's research and reporting work.",
  shared_nigerian_culture: "You will study Nigerian peoples and cultures through historical and social examples. This theme adds Nigerian context to your university learning; it is not a complete account of every community or a substitute for the programme's African and Nigerian societies theme.",
  shared_philosophy: "You will examine philosophical questions and practise logic—checking whether reasons support a conclusion. This builds general reasoning, while the programme's Sociology themes apply ideas and evidence to social life.",
  shared_peace_conflict: "You will learn key ways people describe peace, conflict and security, and consider how conflict can arise and be addressed. This introduces broad concepts; the Sociology themes examine particular institutions, inequalities and settings in greater depth.",
  shared_enterprise: "You will explore how people identify an unmet need, develop an idea and plan a possible venture. This introduces entrepreneurship and venture creation; it does not promise that an idea will succeed or replace the programme's study of social and economic conditions.",
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

function abilitySentence(text: string): string {
  const cleaned = cleanText(text).replace(/[.;]+$/, "");
  if (/^you will\b/i.test(cleaned)) return `${cleaned}.`;
  const action = outcomeAction(cleaned).replace(/^demonstrate\s+adequate knowledge/i, "demonstrate what you understand");
  return `You will learn to ${action}.`;
}

function resourceMatchesTheme(resource: CareerLearningResource, theme: Theme): boolean {
  if (resource.resourceType !== "programme_reading" || !resource.url) return false;
  const provenance = resource.sourceProvenance ?? {};
  const parseThemeKeys = (value: unknown): string[] => {
    if (Array.isArray(value)) return value.flatMap(parseThemeKeys);
    if (typeof value !== "string" || !value.trim()) return [];
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.flatMap(parseThemeKeys);
    } catch {
      // A plain key such as "research" is also a valid stored value.
    }
    return [value.trim().toLocaleLowerCase()];
  };
  const explicitThemes = [provenance.theme_keys, provenance.themeKeys, provenance.theme_key, provenance.themeKey]
    .flatMap(parseThemeKeys);
  const themeMap = (value: unknown): string[] => {
    if (!value || typeof value !== "object" || Array.isArray(value)) return [];
    return Object.keys(value as Record<string, unknown>).map((key) => key.toLocaleLowerCase());
  };
  return explicitThemes.includes(theme.key.toLocaleLowerCase())
    || explicitThemes.includes(theme.title.toLocaleLowerCase())
    || [...themeMap(provenance.theme_urls), ...themeMap(provenance.themeUrls)].includes(theme.key.toLocaleLowerCase())
    || [...themeMap(provenance.theme_descriptions), ...themeMap(provenance.themeDescriptions)].includes(theme.key.toLocaleLowerCase());
}

function resourcesForTheme(resources: CareerLearningResource[] | undefined, theme: Theme): CareerLearningResource[] {
  const approved = (resources ?? []).filter((resource) => isStudentResource(resource));
  const exact = approved.filter((resource) => resourceMatchesTheme(resource, theme));
  // Do not attach an unrelated programme book merely because this theme has
  // no exact target match. A missing association is safer than a misleading
  // “learn more” link.
  const seen = new Set<string>();
  return exact.filter((item) => {
    const url = programmeReadingUrl(item, theme).trim();
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function plainAbilityClauses(line: string): string[] {
  const body = line.replace(/^You will\s+/i, "").replace(/\.\s*$/, "").trim();
  const chunks = body
    .split(/;\s+|,\s+(?:and\s+)?(?=(?:identify|analyse|analyze|explain|discuss|describe|apply|construct|practise|practice|write|distinguish|compare|evaluate|demonstrate|outline|examine|assess|develop|prepare|collect|design|interpret|use|show|list|state|define|recognise|recognize|relate|illustrate|calculate|choose|select|present|communicate|review|critique|formulate|propose|recommend|summarise|summarize)\b)/i)
    .map((part) => part.trim().replace(/^and\s+/i, ""))
    .filter((part) => part.length > 8);
  const parts = chunks.length ? chunks : [body];
  return parts.map((part) => {
    const sentence = part.charAt(0).toUpperCase() + part.slice(1);
    return /[.!?]$/.test(sentence) ? sentence : `${sentence}.`;
  });
}

function abilityLinesForTheme(theme: Theme): AbilityLine[] {
  const outcomes = theme.courses.flatMap((course) => course.outcomes)
    .filter((outcome) => outcome.dataState === "source_backed" && cleanText(outcome.studentText));
  const outcomeIds = new Set(outcomes.map((outcome) => outcome.outcomeId).filter(Boolean) as string[]);
  const candidates = LEDGER_LINES.filter((line) => line.themeKey.toLocaleLowerCase() === theme.key.toLocaleLowerCase());
  const coveredIds = candidates.flatMap((line) => line.outcomeIds);
  const complete = outcomeIds.size > 0
    && outcomeIds.size === outcomes.length
    && coveredIds.length === outcomeIds.size
    && new Set(coveredIds).size === coveredIds.length
    && coveredIds.every((id) => outcomeIds.has(id));
  if (complete) return candidates.flatMap((line) => plainAbilityClauses(line.studentLine).map((text, index) => ({
    id: `${line.lineId}:${index}`,
    text: explainTechnicalTerms(text),
    outcomeIds: line.outcomeIds,
  })));

  const distinct = new Map<string, AbilityLine>();
  outcomes.forEach((outcome, index) => {
    const text = cleanText(outcome.studentText);
    const key = text.toLocaleLowerCase();
    const current = distinct.get(key);
    const id = outcome.outcomeId || `${theme.key}-fallback-${index}`;
    if (current) current.outcomeIds.push(id);
    else distinct.set(key, { id, text: explainTechnicalTerms(text), outcomeIds: [id] });
  });
  return Array.from(distinct.values());
}

type ReadingRow = { id: string; kind: string; title: string; url: string; description: string; why: string };

function readingRowsForTheme(
  resources: CareerLearningResource[] | undefined,
  theme: Theme,
  guidance: ProgrammeThemeGuidance[],
  relationships: ProgrammeThemeRelationship[],
): ReadingRow[] {
  const rows: ReadingRow[] = resourcesForTheme(resources, theme).map((resource) => ({
    id: `resource:${programmeReadingUrl(resource, theme)}`,
    kind: programmeReadingLabel(resource),
    title: resource.targetName,
    url: programmeReadingUrl(resource, theme),
    description: programmeReadingDescription(resource, theme) || "Optional reading to explore this theme.",
    why: programmeReadingRationale(resource, theme),
  }));
  guidance.forEach((item) => {
    if (!item.learningUrl) return;
    rows.push({
      id: `guidance:${item.itemKey}:${item.learningUrl}`,
      kind: item.learningResourceType === "open_course" ? "Open course" : "Learning resource",
      title: item.learningLabel,
      url: item.learningUrl,
      description: `${item.learningSourceReference.title || item.learningLabel}. Optional support, not a course requirement.`,
      why: item.contextualUse,
    });
  });
  relationships.forEach((item) => {
    if (!item.learningUrl) return;
    rows.push({
      id: `relationship:${item.relationshipKey}:${item.learningUrl}`,
      kind: item.learningResourceType === "open_course" ? "Open course" : "Learning resource",
      title: item.learningLabel,
      url: item.learningUrl,
      description: `${item.learningSourceReference.title || item.learningLabel}. Optional support for understanding this connection.`,
      why: item.learnerExplanation,
    });
  });
  const seen = new Set<string>();
  return rows.filter((row) => {
    const url = row.url.trim();
    if (!url || seen.has(url)) return false;
    seen.add(url);
    return true;
  });
}

function mainSociologyReadings(resources: CareerLearningResource[] | undefined): CareerLearningResource[] {
  const primaryBookNames = new Set([
    "sociology",
    "sociology: themes and perspectives (8th edition)",
  ]);
  return unique(
    (resources ?? []).filter((resource) => isStudentResource(resource)
      && resource.resourceType === "programme_reading"
      && primaryBookNames.has(cleanText(resource.targetName).toLocaleLowerCase())),
    (resource) => resource.targetName,
  );
}

function freeSociologyAlternatives(resources: CareerLearningResource[] | undefined): CareerLearningResource[] {
  const freeTitles = new Set([
    "introduction to sociology 3e",
    "introduction to sociology (noun courseware)",
  ]);
  return unique(
    (resources ?? []).filter((resource) => isStudentResource(resource)
      && resource.resourceType === "programme_reading"
      && resource.accessType === "free"
      && freeTitles.has(cleanText(resource.targetName).toLocaleLowerCase())),
    (resource) => resource.targetName,
  );
}

export function ProgrammeBooksLink({ resources }: { resources?: CareerLearningResource[] }) {
  const { colors } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const books = mainSociologyReadings(resources);
  const freeAlternatives = freeSociologyAlternatives(resources);
  if (!books.length) return null;
  return (
    <View style={styles.booksLinkRow}>
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Hide Sociology books" : "Show Sociology books"}
        accessibilityState={{ expanded }}
        onPress={() => setExpanded((value) => !value)}
        style={styles.booksLinkTrigger}
      >
        <Text style={[styles.booksLabel, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>Books</Text>
        <Feather name={expanded ? "chevron-up" : "chevron-down"} size={14} color={colors.accentRole.action} />
      </TouchableOpacity>
      {expanded ? <View style={styles.booksList}>
        <Text style={[styles.booksGroupHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Optional reference books</Text>
        <Text style={[styles.booksGroupNote, { color: colors.textRole.secondary }]}>These books are useful references, but may require purchase or library access. They are not required for every Sociology student.</Text>
        {books.map((book) => <ExternalLinkGuard key={book.id} url={book.url}
          label={book.targetName === "Sociology" ? "Sociology by Giddens and Sutton (9th edition) · publisher/library access" : `${book.targetName} · publisher/library access`}
          description={book.description || "Optional Sociology reference book. It is not a confirmed required text for every university."}
          hideUnavailable style={styles.booksLinkButton} textStyle={styles.booksLinkText} />)}
        {freeAlternatives.length ? <View style={styles.freeAlternativeGroup}>
          <Text style={[styles.booksGroupHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Free learning alternatives</Text>
          <Text style={[styles.booksGroupNote, { color: colors.textRole.secondary }]}>These are separate, legally free learning materials covering many of the same introductory Sociology themes; they are not free copies of the books above.</Text>
          {freeAlternatives.map((resource) => <View key={resource.id} style={styles.freeAlternativeRow}>
            <ExternalLinkGuard url={resource.url} label={resource.targetName}
              description={resource.description || "Free Sociology learning material. Open it to read the resource and its access terms."}
              hideUnavailable style={styles.booksLinkButton} textStyle={styles.booksLinkText} />
            {resource.description ? <Text style={[styles.booksGroupNote, { color: colors.textRole.secondary }]}>{resource.description}</Text> : null}
          </View>)}
        </View> : null}
      </View> : null}
    </View>
  );
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

function programmeReadingDescription(resource: CareerLearningResource, theme: Theme): string | null {
  const provenance = resource.sourceProvenance ?? {};
  const descriptions = themeValue(provenance.theme_descriptions, theme) ?? themeValue(provenance.themeDescriptions, theme);
  return descriptions ?? (resource.description?.trim() || null);
}

function programmeReadingRationale(resource: CareerLearningResource, theme: Theme): string {
  const provenance = resource.sourceProvenance ?? {};
  const descriptions = themeValue(provenance.theme_descriptions, theme) ?? themeValue(provenance.themeDescriptions, theme);
  return themeValue(provenance.theme_rationales, theme) ?? themeValue(provenance.themeRationales, theme)
    ?? descriptions ?? resource.description?.trim() ?? "";
}

function programmeReadingUrl(resource: CareerLearningResource, theme: Theme): string {
  const provenance = resource.sourceProvenance ?? {};
  const specific = themeValue(provenance.theme_urls, theme) ?? themeValue(provenance.themeUrls, theme);
  if (specific) return specific;
  return resource.url;
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
  return (items ?? []).filter((item) => item.themeKey.toLocaleLowerCase() === theme.key.toLocaleLowerCase()
    && item.selectionState === "fixed_programme_guidance_not_selectable");
}

function relationshipsForTheme(items: ProgrammeThemeRelationship[] | undefined, theme: Theme): ProgrammeThemeRelationship[] {
  return (items || []).filter((item) => item.themeKey.toLocaleLowerCase() === theme.key.toLocaleLowerCase()
    && item.selectionState === "fixed_programme_guidance_not_selectable"
    && Boolean(item.learnerExplanation && item.learningUrl && item.learningLabel));
}

function toggleTheme(current: Set<ThemeKey>, key: ThemeKey): Set<ThemeKey> {
  const next = new Set(current);
  if (next.has(key)) next.delete(key);
  else next.add(key);
  return next;
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
  const dimensions = useWindowDimensions();
  const [openThemes, setOpenThemes] = useState<Set<ThemeKey>>(() => new Set());
  const [expandedAbilities, setExpandedAbilities] = useState<Set<ThemeKey>>(() => new Set());
  const [expandedReadingWhy, setExpandedReadingWhy] = useState<Set<string>>(() => new Set());
  const [themeCardWidths, setThemeCardWidths] = useState<Record<string, number>>({});
  const themeTitleRefs = React.useRef<Record<string, Text | null>>({});
  const [openThemeExplanations, setOpenThemeExplanations] = useState<Set<ThemeKey>>(() => new Set());
  const courses = useMemo(() => curriculumContract ? groupCourses(curriculumContract) : [], [curriculumContract]);
  const themes = useMemo(() => buildThemes(courses), [courses]);
  const abilities = useMemo(() => unique(
    (curriculumContract?.abilities ?? []).filter((item) => item.dataState === "source_backed" && cleanText(item.studentText)),
    (item) => item.studentText,
  ), [curriculumContract]);

  if (!curriculumContract || curriculumContract.status !== "available" || (!courses.length && !abilities.length)) {
    return (
      <View style={variant === "teaser" ? styles.teaserCard : styles.block}>
        <View style={styles.headingLine}><Feather name="book-open" size={17} color={colors.accentRole.action} /><Text accessibilityRole="header" style={[styles.sectionHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What you will study</Text></View>
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
      <Text accessibilityRole="header" style={[styles.sectionHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What you will study</Text>
      <Text style={[styles.intro, { color: colors.textRole.secondary }]}>Each theme is one part of what this programme covers. The short line is the summary. The longer paragraph is the full explanation of that part. Under it are the abilities the programme aims to help you develop by the end. Every recorded outcome for that theme is included.</Text>
      <View style={styles.themeGrid}>
        {visibleThemes.map((theme) => {
          const open = openThemeExplanations.has(theme.key);
          const cardOpen = openThemes.has(theme.key);
          const lines = abilityLinesForTheme(theme);
          const themeGuidance = guidanceForTheme(curriculumContract.themeGuidance, theme);
          const themeRelationships = relationshipsForTheme(curriculumContract.themeRelationships, theme);
          const readingRows = readingRowsForTheme(resources, theme, themeGuidance, themeRelationships);
          const wideCard = (themeCardWidths[theme.key] ?? dimensions.width) >= WIDE_THEME_CARD;
          const expandedLines = expandedAbilities.has(theme.key);
          const shownLines = expandedLines ? lines : lines.slice(0, INITIAL_ABILITIES);
          const titleRef = (node: Text | null) => { themeTitleRefs.current[theme.key] = node; };
          const toggle = (setter: React.Dispatch<React.SetStateAction<Set<ThemeKey>>>) => setter((current) => toggleTheme(current, theme.key));
          const heading = <Text ref={titleRef} accessibilityRole="header" style={[styles.themeTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{theme.title}</Text>;
          const narration = <View style={styles.narrationBlock}>
            <Text style={[styles.abilityNote, { color: colors.textRole.muted }]}>In short</Text>
            <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{THEME_META[theme.key].description}</Text>
            <Text style={[styles.abilityNote, { color: colors.textRole.muted }]}>The full explanation</Text>
            <Text style={[styles.themeDescription, { color: colors.textRole.secondary }]}>{explainTechnicalTerms(theme.narration)}</Text>
          </View>;
          const readingBand = <View style={[styles.readingBand, { borderTopColor: colors.borderRole.subtle }]}>
            <Text style={[styles.readingBandTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>Resources for this theme</Text>
            {readingRows.length ? readingRows.map((row) => <View key={row.id} style={styles.readingRow}>
              <Text style={[styles.resourceKind, styles.readingKind, { color: colors.textRole.muted }]}>{row.kind}</Text>
              <Text style={[styles.readingTitle, { color: colors.textRole.primary }]}>{row.title}</Text>
              <ExternalLinkGuard url={row.url} label="Open" description={row.description} style={styles.readingOpen} textStyle={{ color: colors.accentRole.action, fontSize: 12, lineHeight: 17 }} />
              {row.why ? <>
                <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: expandedReadingWhy.has(row.id) }} onPress={() => setExpandedReadingWhy((current) => {
                  const next = new Set(current); if (next.has(row.id)) next.delete(row.id); else next.add(row.id); return next;
                })} style={styles.whyButton}><Text style={[styles.whyButtonLabel, { color: colors.accentRole.action }]}>{expandedReadingWhy.has(row.id) ? "Hide why" : "Why included?"}</Text></TouchableOpacity>
                {expandedReadingWhy.has(row.id) ? <Text style={[styles.courseMeta, { color: colors.textRole.secondary }]}>{row.why}</Text> : null}
              </> : null}
            </View>) : null}
          </View>;
          const abilityList = <View style={styles.abilityList}>
            <Text style={[styles.abilityListTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>What this part aims to help you develop by the end</Text>
            {shownLines.map((line) => <View key={line.id} style={styles.abilityLine}>
              <Text style={[styles.abilityBullet, { color: colors.accentRole.action }]}>•</Text>
              <Text style={[styles.abilityLineText, { color: colors.textRole.secondary }]}>{line.text}</Text>
            </View>)}
            {lines.length > INITIAL_ABILITIES ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: expandedLines }} onPress={() => toggle(setExpandedAbilities)} style={styles.moreButton}>
              <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{expandedLines ? "Show fewer abilities" : "See every ability in this theme"}</Text>
            </TouchableOpacity> : null}
            <Text style={[styles.abilityNote, { color: colors.textRole.muted }]}>These are the abilities this part of the programme aims to help you develop by the end. Each line comes from the programme record for this theme, and together they cover every recorded outcome here.</Text>
          </View>;
          return (
            <View key={theme.key} onLayout={(event) => {
              const width = event.nativeEvent.layout.width;
              if (width && themeCardWidths[theme.key] !== width) setThemeCardWidths((current) => ({ ...current, [theme.key]: width }));
            }} style={[styles.themeCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              {!cardOpen ? <View style={styles.closedThemeCard}><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Open ${theme.title}`} accessibilityState={{ expanded: false }} onPress={() => {
                setOpenThemes((current) => toggleTheme(current, theme.key));
                requestAnimationFrame(() => {
                  const node = themeTitleRefs.current[theme.key];
                  const handle = node ? findNodeHandle(node) : null;
                  if (handle != null) AccessibilityInfo.setAccessibilityFocus(handle);
                });
              }} style={styles.closedThemeContent}>
                <Text accessibilityRole="header" style={[styles.themeTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{theme.title}</Text>
                <Text numberOfLines={2} style={[styles.closedThemeDescription, { color: colors.textRole.secondary }]}>{THEME_META[theme.key].description}</Text>
                <Text style={[styles.courseMeta, { color: colors.textRole.muted }]}>{lines.length} {lines.length === 1 ? "theme outcome" : "theme outcomes"} · {readingRows.length} {readingRows.length === 1 ? "reading" : "readings"}</Text>
              </TouchableOpacity>{readingRows.length ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={`View ${readingRows.length} resources for ${theme.title}`} onPress={() => setOpenThemes((current) => toggleTheme(current, theme.key))} style={styles.themeResourcesButton}>
                <Text style={[styles.resourceTinyLink, { color: colors.accentRole.action }]}>{`View ${readingRows.length} ${readingRows.length === 1 ? "resource" : "resources"}`}</Text>
              </TouchableOpacity> : null}</View> : <>
                {wideCard ? <View style={styles.openThemeWide}>
                  <View style={styles.themeNarrationColumn}>{heading}{narration}{readingRows.length ? readingBand : null}</View>
                  {abilityList}
                </View> : <View style={styles.openThemeNarrow}>{heading}{narration}{readingRows.length ? readingBand : null}{abilityList}</View>}
                <TouchableOpacity accessibilityRole="button" accessibilityLabel={`Close ${theme.title}`} accessibilityState={{ expanded: true }} onPress={() => setOpenThemes((current) => toggleTheme(current, theme.key))} style={styles.closeThemeButton}><Text style={[styles.smallTextButtonLabel, { color: colors.accentRole.action }]}>Close</Text></TouchableOpacity>
              {(guidanceForTheme(curriculumContract.themeGuidance, theme).length || relationshipsForTheme(curriculumContract.themeRelationships, theme).length) ? <TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenThemeExplanations((current) => toggleTheme(current, theme.key))} style={styles.moreButton}>
                 <Text style={[styles.moreText, { color: colors.accentRole.action }]}>{open ? "Hide theme explanations" : "Explore the ideas and connections"}</Text>
              </TouchableOpacity> : null}
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
                </View>
              ) : null}</>}
            </View>
          );
        })}
      </View>
      {themes.length > INITIAL_THEMES ? <TouchableOpacity accessibilityRole="button" accessibilityLabel={themesExpanded ? "Show fewer learning areas" : `See all ${themes.length} learning areas`} accessibilityState={{ expanded: themesExpanded }} onPress={() => setThemesExpanded((value) => !value)} style={styles.moreButton}><Text style={[styles.moreText, { color: colors.accentRole.action }]}>{themesExpanded ? "Show fewer learning areas" : `See all ${themes.length} learning areas`}</Text></TouchableOpacity> : null}

      {/* Course outcomes already carry the programme's learning abilities and
          are shown in their relevant theme above. The separate ability list is
          only a fallback for contracts that have abilities but no course
          outcomes; rendering both makes the same curriculum appear twice. */}
      {abilities.length && !courses.length ? (
        <View style={[styles.abilitiesCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text accessibilityRole="header" style={[styles.sectionHeading, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>How you will use what you learn</Text>
          <Text style={[styles.abilitiesIntro, { color: colors.textRole.secondary }]}>Across these themes, you do more than learn definitions. You practise using ideas to ask focused questions, choosing suitable ways to investigate them, checking what the evidence can and cannot show, and explaining your conclusions clearly. The abilities below describe the kinds of work your programme prepares you to practise; seeing them here does not mean you have already mastered them.</Text>
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
  sectionHeading: { fontSize: 20, lineHeight: 26 },
  empty: { fontSize: 16, lineHeight: 24 },
  intro: { fontSize: 16, lineHeight: 24 },
  teaserCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs },
  teaserAbilities: { gap: Spacing.xs },
  teaserTitle: { fontSize: 20, lineHeight: 26 },
  teaserText: { fontSize: 16, lineHeight: 24 },
  teaserMeta: { fontSize: 13, lineHeight: 19 },
  themeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  themeCard: { flex: 1, minWidth: 280, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: 12, gap: 8 },
  closedThemeCard: { minHeight: 72, justifyContent: "center", gap: 3 },
  closedThemeContent: { gap: 3 },
  themeResourcesButton: { minHeight: 44, alignSelf: "flex-start", justifyContent: "center", paddingHorizontal: 2 },
  resourceTinyLink: { fontSize: 15, lineHeight: 22, ...CompassFonts.bodySemibold },
  closedThemeDescription: { fontSize: 14, lineHeight: 20 },
  openThemeWide: { flexDirection: "row", alignItems: "flex-start", gap: 16 },
  openThemeNarrow: { flexDirection: "column", gap: 8 },
  themeNarrationColumn: { flex: 42, minWidth: 0, gap: 6 },
  narrationBlock: { gap: 2 },
  smallTextButton: { alignSelf: "flex-start", minHeight: 36, justifyContent: "center", paddingVertical: 4 },
  smallTextButtonLabel: { fontSize: 14, lineHeight: 20, ...CompassFonts.bodySemibold },
  readingBand: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 8, gap: 6, marginTop: 4 },
  readingBandTitle: { fontSize: 15, lineHeight: 22 },
  readingRow: { minHeight: 44, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, paddingVertical: 2 },
  readingKind: { fontSize: 12, lineHeight: 17, paddingHorizontal: 5, paddingVertical: 2, borderRadius: 6, backgroundColor: "rgba(120,120,120,0.08)" },
  readingTitle: { flex: 1, minWidth: 120, fontSize: 15, lineHeight: 22 },
  readingOpen: { minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center", paddingHorizontal: 2 },
  whyButton: { minHeight: 40, justifyContent: "center", paddingHorizontal: 4 },
  whyButtonLabel: { fontSize: 12, lineHeight: 18, ...CompassFonts.bodySemibold },
  abilityList: { flex: 58, minWidth: 0, gap: 8 },
  abilityListTitle: { fontSize: 15, lineHeight: 21 },
  abilityLine: { flexDirection: "row", alignItems: "flex-start", gap: 8, marginTop: 5 },
  abilityBullet: { width: 12, fontSize: 14, lineHeight: 20 },
  abilityLineText: { flex: 1, fontSize: 14, lineHeight: 20 },
  abilityNote: { fontSize: 13, lineHeight: 19, marginTop: 2 },
  closeThemeButton: { alignSelf: "flex-end", minHeight: 40, justifyContent: "center", paddingHorizontal: 8 },
  themeTitle: { flex: 1, fontSize: 16, lineHeight: 22 },
  themeDescription: { fontSize: 14, lineHeight: 20 },
  themeCopyBlock: { gap: Spacing.xs, paddingTop: Spacing.xs },
  courseMeta: { fontSize: 13, lineHeight: 19 },
  learningLinks: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: Spacing.xs },
  linkHeading: { fontSize: 20, lineHeight: 26, ...CompassFonts.bodySemibold },
  linkRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  resourceCopy: { flex: 1, gap: 2 },
  resourceButton: { minHeight: 44, justifyContent: "center", alignItems: "center", paddingHorizontal: 2 },
  resourceKind: { fontSize: 14, lineHeight: 20, fontWeight: "800" },
  resourceProvider: { fontSize: 14, lineHeight: 20 },
  linkName: { fontSize: 16, lineHeight: 24 },
  moreButton: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingVertical: Spacing.xs },
  moreText: { fontSize: 16, lineHeight: 20, ...CompassFonts.bodySemibold },
  courseDetail: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: 8 },
  courseOutcomeGroup: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  courseOutcomeTitle: { fontSize: 16, lineHeight: 22 },
  guidanceBlock: { gap: 8 },
  guidanceCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  outcomeCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm },
  guidanceLabel: { fontSize: 16, lineHeight: 22, ...CompassFonts.bodySemibold },
  guidanceSources: { gap: 2, paddingTop: Spacing.xs },
  guidanceSourceLink: { alignSelf: "flex-start", minHeight: 44, justifyContent: "center", paddingHorizontal: 2 },
  guidanceLearning: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.xs },
  courseTitle: { fontSize: 16, lineHeight: 22 },
  courseSummary: { fontSize: 16, lineHeight: 24 },
  abilitiesCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  mainReadingCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  mainReadingRow: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm },
  mainReadingTheme: { fontSize: 14, lineHeight: 20, ...CompassFonts.bodySemibold },
  booksLinkRow: { alignSelf: "flex-start", gap: Spacing.xs, paddingVertical: 2 },
  booksLinkTrigger: { minHeight: 44, minWidth: 44, flexDirection: "row", alignItems: "center", justifyContent: "flex-start", gap: 4 },
  booksLabel: { fontSize: 15, lineHeight: 22 },
  booksList: { gap: 2, paddingLeft: Spacing.sm },
  booksGroupHeading: { fontSize: 15, lineHeight: 22, marginTop: Spacing.xs },
  booksGroupNote: { fontSize: 14, lineHeight: 20 },
  freeAlternativeGroup: { gap: 4, marginTop: Spacing.sm, paddingTop: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: "#D7DCE4" },
  freeAlternativeRow: { gap: 2 },
  booksLinkButton: { minHeight: 44, minWidth: 44, alignSelf: "flex-start", paddingHorizontal: 0, paddingVertical: 0, borderWidth: 0, borderRadius: 0 },
  booksLinkText: { fontSize: 15, lineHeight: 22 },
  detailHeading: { fontSize: 20, lineHeight: 26, ...CompassFonts.bodySemibold },
  abilitiesIntro: { fontSize: 16, lineHeight: 24 },
  abilityGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  abilityCard: { flex: 1, minWidth: 230, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm, gap: Spacing.xs },
  abilityTitle: { fontSize: 16, lineHeight: 22 },
  outcome: { fontSize: 16, lineHeight: 24 },
});
