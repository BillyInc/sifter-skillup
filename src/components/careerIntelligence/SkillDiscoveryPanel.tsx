import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useTheme, CompassFonts, FontSize, Radius, Spacing } from "@/theme";
import { careerData } from "@/lib/careerData";
import { getStartingPoint } from "@/lib/startingPoint";
import { useAuth } from "@/hooks/useAuth";
import { adminLearnerAudienceForOrg } from "@/lib/adminLearnerAudience";
import { useExploreNav } from "@/lib/exploreNav";
import { useResponsive } from "@/hooks/useResponsive";
import { pending, type DataState, type SkillDiscoveryResult } from "@/types/career";
import { SectionLabel } from "./index";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { isStudentLearningResource, studentSafeUrl } from "@/lib/studentCareerBoundary";

type Intent = "learned" | "intended";
type SkillPath = SkillDiscoveryResult["paths"][number];
type ThemeColors = ReturnType<typeof useTheme>["colors"];

const QUICK_STARTS = ["Python", "Excel", "Communication", "Data analysis"];
type MatcherItemType = "skill" | "competency" | "tool" | "certification";
const MATCHER_ITEM_TYPES: { type: MatcherItemType; label: string }[] = [
  { type: "skill", label: "Skill" },
  { type: "competency", label: "Competency" },
  { type: "tool", label: "Tool" },
  { type: "certification", label: "Certification" },
];
const PRIORITY_LABEL: Record<string, string> = {
  start_here: "Start here",
  build_next: "Build next",
  useful_later: "Useful later",
  optional: "Optional",
};

function labelForIntent(intent: Intent) {
  return intent === "learned" ? "I already know" : "I want to build";
}

function EvidenceChips({ values, color, limit }: { values: string[]; color: string; limit?: number }) {
  if (!values.length) return null;
  const visible = limit ? values.slice(0, limit) : values;
  return (
    <View style={styles.chips}>
      {visible.map((value) => (
        <View key={value} style={[styles.chip, { borderColor: color }]}>
          <Text style={{ color, fontSize: FontSize.xs }}>{value}</Text>
        </View>
      ))}
      {limit && values.length > limit ? (
        <Text style={{ color, fontSize: FontSize.xs, alignSelf: "center" }}>+{values.length - limit} more</Text>
      ) : null}
    </View>
  );
}

function MatchMeta({ score, label, explanation, color }: { score: number; label: string; explanation?: string; color: string }) {
  return (
    <View style={styles.matchMeta}>
      <Text style={[CompassFonts.data, { color, fontSize: FontSize.xs, fontWeight: "800" }]}>
        {score > 0 ? `${Math.round(score * 100)}% · ` : ""}{label}
      </Text>
      {explanation ? <Text style={{ color, fontSize: FontSize.xs, textAlign: "right", maxWidth: 190 }}>{explanation}</Text> : null}
    </View>
  );
}

function PriorityBadge({ priority, colors }: { priority?: string; colors: ThemeColors }) {
  if (!priority) return null;
  return (
    <View style={[styles.priorityBadge, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Text style={{ color: colors.accentRole.action, fontSize: FontSize.xs, fontWeight: "800" }}>
        {PRIORITY_LABEL[priority] ?? priority}
      </Text>
    </View>
  );
}

function ItemTypeBadge({ type, colors }: { type: MatcherItemType; colors: ThemeColors }) {
  const color = type === "skill"
    ? colors.accentRole.action
    : type === "competency"
      ? colors.accentRole.success
      : type === "tool"
        ? colors.textRole.secondary
        : colors.textRole.primary;
  const label = MATCHER_ITEM_TYPES.find((item) => item.type === type)?.label ?? type;
  return (
    <View style={[styles.typeBadge, { borderColor: color, backgroundColor: colors.surface.subtle }]}>
      <Text style={{ color, fontSize: FontSize.xs, fontWeight: "800" }}>{label}</Text>
    </View>
  );
}

export interface SkillDiscoveryPanelProps {
  /** Organisation type drives the lens for admin users. */
  adminType?: string | null;
}

export function SkillDiscoveryPanel({ adminType }: SkillDiscoveryPanelProps) {
  const { colors } = useTheme();
  const { isMobile } = useResponsive();
  const { user } = useAuth();
  const router = useRouter();
  const exploreNav = useExploreNav();
  const adminAudience = adminType === "university" ? null : adminLearnerAudienceForOrg(adminType);
  const matcherAdminType = adminType === "university" ? undefined : adminType ?? undefined;
  const isAdmin = Boolean(adminAudience);
  const isGuest = !user || user.auth_provider === "guest";
  const [userType, setUserType] = useState<string | undefined>();
  const [adminLearnerTypes, setAdminLearnerTypes] = useState<string[]>([]);
  const [intent, setIntent] = useState<Intent>("learned");
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [match, setMatch] = useState<"both" | "either">("both");
  const [category, setCategory] = useState<string | undefined>();
  const [state, setState] = useState<DataState<SkillDiscoveryResult> | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const effectiveUserType = isAdmin
    ? adminLearnerTypes.length === 1
      ? adminLearnerTypes[0]
      : adminLearnerTypes
    : userType;

  useEffect(() => {
    if (!adminAudience) return;
    setAdminLearnerTypes((current) => {
      const allowed = adminAudience.learnerTypes as string[];
      const retained = current.filter((item) => allowed.includes(item));
      return retained.length ? retained : allowed.slice(0, 1);
    });
  }, [adminAudience]);

  useEffect(() => {
    if (adminType || !user?.id || isGuest) return;
    let active = true;
    getStartingPoint(user.id).then((profile) => {
      if (active) setUserType(profile?.userType ?? undefined);
    });
    return () => {
      active = false;
    };
  }, [adminType, isGuest, user?.id]);

  useEffect(() => {
    let active = true;
    setState(null);
    if (isGuest) return () => { active = false; };
    const timer = setTimeout(() => {
      setState(pending<SkillDiscoveryResult>("Updating the map for your selected items…"));
      careerData.discoverBySkills({
        skills: selected,
        match,
        intent,
        category,
        userType: effectiveUserType,
        adminType: matcherAdminType,
      }).then((next) => {
        if (active) setState(next);
      });
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [adminType, category, effectiveUserType, intent, isGuest, match, matcherAdminType, retryCount, selected]);

  const audienceCopy = useMemo(() => {
    if (adminType === "tutorial_centre" || adminType === "jamb_cafe") return "Use a student's interests or skills to explain realistic next study and career routes.";
    if (adminType === "secondary_school") return "Use a student's skills to make the next subject, programme and career step easier to understand.";
    if (userType === "student") return "See how your skills connect to domains, subgroups, entry roles and what to learn next.";
    return "Add one or more skills to see the domains, subgroups and roles they can connect to.";
  }, [adminType, userType]);

  const addSkillValue = (rawValue: string) => {
    const value = rawValue.trim();
    if (!value || selected.some((item) => item.toLowerCase() === value.toLowerCase())) return;
    setSelected((current) => [...current, value]);
    setDraft("");
  };

  const removeSkill = (value: string) => setSelected((current) => current.filter((item) => item !== value));
  const clearSkills = () => {
    setSelected([]);
    setDraft("");
  };
  const data = state?.status === "real" ? state.data : null;

  if (isGuest) {
    return (
      <TouchableOpacity activeOpacity={0.88} onPress={() => router.push("/(auth)/signup" as never)} style={[styles.guestCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <View style={[styles.iconBox, { backgroundColor: colors.surface.subtle }]}>
          <Feather name="compass" size={20} color={colors.accentRole.action} />
        </View>
        <View style={styles.guestCopy}>
          <Text style={[styles.eyebrow, { color: colors.accentRole.action }]}>SKILLS MATCH</Text>
          <Text style={[CompassFonts.bodyBold, styles.guestTitle, { color: colors.textRole.primary }]}>See where your skills can take you</Text>
          <Text style={[styles.help, { color: colors.textRole.secondary }]}>Create an account to match your skills to fields, subgroups and roles, then save what you find.</Text>
          <Text style={[styles.guestAction, { color: colors.accentRole.action }]}>Create account to start →</Text>
        </View>
        <Feather name="arrow-up-right" size={20} color={colors.textRole.muted} />
      </TouchableOpacity>
    );
  }

  const openDomain = (id: string) => exploreNav.domain(router, id);
  const openSubgroup = (domainId: string, subgroupId: string) => exploreNav.subgroup(router, domainId, subgroupId);
  const openRole = (roleId: string) => exploreNav.role(router, roleId);
  const openPath = (path: SkillPath) => {
    if (path.roleKey) return openRole(path.roleKey);
    if (path.subgroupId) return openSubgroup(path.domainId, path.subgroupId);
    return openDomain(path.domainId);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.hero, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <View style={styles.heroHeading}>
          <View style={[styles.iconBox, { backgroundColor: colors.surface.subtle }]}>
            <Feather name="compass" size={20} color={colors.accentRole.action} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={[styles.eyebrow, { color: colors.accentRole.action }]}>SKILL MATCHER</Text>
            <Text style={[CompassFonts.displaySemi, styles.heroTitle, { color: colors.textRole.primary }]}>See where your skills can take you</Text>
          </View>
        </View>
        <Text style={[styles.heroBody, { color: colors.textRole.secondary }]}>{audienceCopy}</Text>
        <View style={[styles.steps, isMobile && styles.stepsMobile]}>
          {[
            ["1", "Choose a skill", "A capability you use or want to learn"],
            ["2", "Read the connection", "Domain → subgroup → role"],
            ["3", "Choose what to learn", "Start with the most useful next step"],
          ].map(([number, title, body]) => (
            <View key={number} style={styles.step}>
              <View style={[styles.stepNumber, { backgroundColor: colors.accentRole.action }]}><Text style={{ color: colors.textRole.inverse, fontWeight: "900", fontSize: FontSize.xs }}>{number}</Text></View>
              <View style={{ flex: 1, gap: 2 }}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs, fontWeight: "800" }}>{title}</Text><Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>{body}</Text></View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.workspace, { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle }]}>
          {isAdmin ? (
            <View style={styles.field}>
              <SectionLabel>WHO ARE YOU GUIDING?</SectionLabel>
              <Text style={[styles.help, { color: colors.textRole.muted }]}>{adminType === "secondary_school" ? "Choose one or more class levels to guide the next-step context." : "The same item can point to different next steps for different learner stages."}</Text>
              <View style={styles.optionRow}>
                {(adminAudience?.learnerTypes ?? []).map((item) => (
                  <TouchableOpacity key={item} onPress={() => setAdminLearnerTypes((current) => current.includes(item) ? (current.length > 1 ? current.filter((value) => value !== item) : current) : [...current, item])} accessibilityRole={adminType === "secondary_school" ? "checkbox" : "radio"} accessibilityState={adminType === "secondary_school" ? { checked: adminLearnerTypes.includes(item) } : { selected: adminLearnerTypes.includes(item) }} style={[styles.option, { borderColor: adminLearnerTypes.includes(item) ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: adminLearnerTypes.includes(item) ? colors.accentRole.action : colors.surface.raised }]}>
                    <Text style={{ color: adminLearnerTypes.includes(item) ? colors.textRole.inverse : colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "700" }}>{item === "undergraduate" ? "Undergraduate" : item.toUpperCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.field}>
              <SectionLabel>WHAT DO YOU WANT TO DO WITH THESE ITEMS?</SectionLabel>
              <View style={styles.optionRow}>
                {(["learned", "intended"] as Intent[]).map((item) => (
                  <TouchableOpacity key={item} onPress={() => setIntent(item)} accessibilityRole="radio" accessibilityState={{ selected: intent === item }} style={[styles.option, { borderColor: intent === item ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: intent === item ? colors.accentRole.action : colors.surface.raised }]}>
                    <Text style={{ color: intent === item ? colors.textRole.inverse : colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "700" }}>{labelForIntent(item)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.help, { color: colors.textRole.muted }]}>{intent === "learned" ? "We will treat these as skills you can already use, then show the routes and gaps that come next." : "We will treat these as skills you want to build, then show the fields and supporting skills where they are useful."}</Text>
            </View>
          )}

          <View style={styles.field}>
            <SectionLabel>THINGS I KNOW OR WANT TO LEARN</SectionLabel>
            <View style={styles.inputRow}>
              <View style={[styles.inputWrap, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                <Feather name="search" size={17} color={colors.textRole.muted} />
                <TextInput value={draft} onChangeText={setDraft} onSubmitEditing={() => addSkillValue(draft)} returnKeyType="done" placeholder="Search Python, research design, Excel or a certification" placeholderTextColor={colors.textRole.muted} accessibilityLabel="Search for a skill, competency, tool, or certification" style={[styles.input, { color: colors.textRole.primary }]} />
              </View>
              <TouchableOpacity onPress={() => addSkillValue(draft)} disabled={!draft.trim()} accessibilityRole="button" style={[styles.addButton, { backgroundColor: draft.trim() ? colors.accentRole.action : colors.borderRole.subtle }]}>
                <Feather name="plus" size={17} color={draft.trim() ? colors.textRole.inverse : colors.textRole.muted} />
                {!isMobile ? <Text style={{ color: draft.trim() ? colors.textRole.inverse : colors.textRole.muted, fontSize: FontSize.sm, fontWeight: "800" }}>Add</Text> : null}
              </TouchableOpacity>
            </View>
            <View style={styles.typeLegend} accessibilityLabel="The matcher accepts four item types">
              <Text style={[styles.help, { color: colors.textRole.muted }]}>One input, four item types:</Text>
              {MATCHER_ITEM_TYPES.map(({ type, label }) => <ItemTypeBadge key={type} type={type} colors={colors} />)}
            </View>
            <Text style={[styles.help, { color: colors.textRole.muted }]}>Add one item at a time; add more to explore combinations. The map updates whenever you add or remove an item.</Text>
            <Text style={[styles.help, { color: colors.textRole.secondary }]}>Skill = an ability you practise · Competency = applying knowledge and abilities in context · Tool = software or equipment · Certification = a formal credential.</Text>
          </View>

          {!selected.length ? (
            <View style={styles.field}>
              <Text style={[styles.helpStrong, { color: colors.textRole.secondary }]}>Start with a common skill</Text>
              <View style={styles.chips}>
                {QUICK_STARTS.map((example) => <TouchableOpacity key={example} onPress={() => addSkillValue(example)} style={[styles.chip, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Text style={{ color: colors.accentRole.action, fontSize: FontSize.xs, fontWeight: "700" }}>{example}</Text></TouchableOpacity>)}
              </View>
            </View>
          ) : (
            <View style={styles.field}>
              <View style={styles.sectionHeading}><Text style={[styles.helpStrong, { color: colors.textRole.secondary }]}>Your selected items ({selected.length})</Text><TouchableOpacity onPress={clearSkills} accessibilityRole="button"><Text style={{ color: colors.accentRole.action, fontSize: FontSize.xs, fontWeight: "800" }}>Clear all</Text></TouchableOpacity></View>
              <View style={styles.chips}>
                {selected.map((item) => <TouchableOpacity key={item} onPress={() => removeSkill(item)} accessibilityRole="button" accessibilityLabel={`Remove ${item}`} style={[styles.selectedChip, { borderColor: colors.accentRole.action, backgroundColor: colors.surface.subtle }]}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs, fontWeight: "700" }}>{item}</Text><Feather name="x" size={13} color={colors.accentRole.action} /></TouchableOpacity>)}
              </View>
            </View>
          )}

          <View style={styles.field}>
            <View style={styles.sectionHeading}><View style={{ flex: 1 }}><Text style={[styles.helpStrong, { color: colors.textRole.secondary }]}>How should the map combine your items?</Text><Text style={[styles.help, { color: colors.textRole.muted }]}>{match === "both" ? "All: show routes connected to every selected item." : "Any: show routes connected to at least one selected item."}</Text></View></View>
            <View style={styles.optionRow}>
              {(["both", "either"] as const).map((option) => <TouchableOpacity key={option} onPress={() => setMatch(option)} accessibilityRole="radio" accessibilityState={{ selected: match === option }} style={[styles.option, { borderColor: match === option ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: match === option ? colors.surface.subtle : colors.surface.raised }]}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.sm, fontWeight: "700" }}>{option === "both" ? "All selected items" : "Any selected item"}</Text></TouchableOpacity>)}
            </View>
          </View>

          {data?.categories?.length ? (
            <View style={styles.field}>
              <SectionLabel>FILTER BY DOMAIN CLUSTER</SectionLabel>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
                <TouchableOpacity onPress={() => setCategory(undefined)} style={[styles.chip, { borderColor: !category ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: !category ? colors.surface.subtle : colors.surface.raised }]}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs, fontWeight: "700" }}>All clusters</Text></TouchableOpacity>
                {data.categories.map((item) => <TouchableOpacity key={item} onPress={() => setCategory(item)} style={[styles.chip, { borderColor: category === item ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: category === item ? colors.surface.subtle : colors.surface.raised }]}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.xs, fontWeight: "700" }}>{item}</Text></TouchableOpacity>)}
              </ScrollView>
            </View>
          ) : null}

          {state?.status === "pending" ? <View accessibilityLiveRegion="polite" style={styles.loading}><ActivityIndicator color={colors.accentRole.action} /><Text style={[styles.help, { color: colors.textRole.muted }]}>{state.meta?.notice ?? "Following your items through the career map…"}</Text></View> : null}
          {data ? <SkillResults data={data} colors={colors} intent={intent} adminMode={isAdmin} onAdd={addSkillValue} onOpenDomain={openDomain} onOpenSubgroup={openSubgroup} onOpenRole={openRole} onOpenPath={openPath} /> : null}
          {state && state.status !== "real" && state.status !== "pending" && state.meta?.notice ? (
            <View style={styles.unavailableState}>
              <Text style={[styles.notice, { color: colors.textRole.muted }]}>{state.meta.notice}</Text>
              {selected.length ? <TouchableOpacity onPress={() => setRetryCount((count) => count + 1)} accessibilityRole="button" style={[styles.retryButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.link, { color: colors.accentRole.action }]}>Try again</Text></TouchableOpacity> : null}
            </View>
          ) : null}
      </View>
    </View>
  );
}

function SkillResults({
  data,
  colors,
  intent,
  adminMode,
  onAdd,
  onOpenDomain,
  onOpenSubgroup,
  onOpenRole,
  onOpenPath,
}: {
  data: SkillDiscoveryResult;
  colors: ThemeColors;
  intent: Intent;
  adminMode: boolean;
  onAdd: (value: string) => void;
  onOpenDomain: (id: string) => void;
  onOpenSubgroup: (domainId: string, subgroupId: string) => void;
  onOpenRole: (id: string) => void;
  onOpenPath: (path: SkillPath) => void;
}) {
  const [showAllPaths, setShowAllPaths] = useState(false);
  const [showAllSuggestions, setShowAllSuggestions] = useState(false);
  const [showAllEntities, setShowAllEntities] = useState(false);
  const [openSuggestion, setOpenSuggestion] = useState<string | null>(null);
  const hasTerms = data.terms.length > 0;
  const suggestions = useMemo(() => data.suggestedNext ?? [], [data.suggestedNext]);
  const paths = useMemo(() => data.paths ?? [], [data.paths]);
  const visiblePaths = showAllPaths ? paths : paths.slice(0, 4);
  const visibleSuggestions = showAllSuggestions ? suggestions : suggestions.slice(0, 4);
  const visibleDomains = showAllEntities ? data.domains : data.domains.slice(0, 3);
  const visibleSubgroups = showAllEntities ? data.subgroups : data.subgroups.slice(0, 4);
  const visibleRoles = showAllEntities ? data.roles : data.roles.slice(0, 5);
  const competencies = data.competencies ?? [];
  const visibleCompetencies = showAllEntities ? competencies : competencies.slice(0, 5);
  const visibleTools = showAllEntities ? data.tools : data.tools.slice(0, 5);
  const visibleCertifications = showAllEntities ? data.certifications : data.certifications.slice(0, 5);
  const resources = data.resources ?? [];
  const visibleResources = showAllEntities ? resources : resources.slice(0, 5);

  return (
    <View style={styles.results}>
      <View style={[styles.resultIntro, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <View style={styles.resultIntroIcon}><Feather name="map" size={18} color={colors.accentRole.action} /></View>
        <View style={{ flex: 1, gap: 3 }}>
          <Text style={[CompassFonts.bodyBold, { color: colors.textRole.primary, fontSize: FontSize.md }]}>{hasTerms ? "Your skills, translated into routes" : "Explore the skill map"}</Text>
          <Text style={[styles.help, { color: colors.textRole.secondary }]}>{hasTerms ? intent === "learned" ? "These are not promises of employment. They are source-backed connections in the career catalogue, with the preparation still needed shown underneath." : "These routes show where the skill is used. Use the suggested additions to build a more complete foundation." : "Choose a cluster or add a skill to see the connected career graph."}</Text>
        </View>
      </View>

      {hasTerms && paths.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>POSSIBLE ROUTES FROM YOUR SKILLS</SectionLabel>
           <Text style={[styles.help, { color: colors.textRole.muted }]}>A route shows how your selected skills connect to a domain, then to a subgroup and role. Entry-level routes are placed first.</Text>
          <View style={styles.pathList}>
            {visiblePaths.map((path, index) => (
              <TouchableOpacity key={`${path.domainId}-${path.roleKey ?? path.subgroupId ?? index}`} onPress={() => onOpenPath(path)} accessibilityRole="button" style={[styles.pathCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                <View style={styles.pathTop}><View style={[styles.pathIndex, { backgroundColor: colors.surface.subtle }]}><Text style={{ color: colors.accentRole.action, fontSize: FontSize.xs, fontWeight: "900" }}>{index + 1}</Text></View><View style={{ flex: 1, gap: 2 }}><Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs, fontWeight: "700" }}>{path.domainName}</Text><Text style={{ color: colors.textRole.primary, fontSize: FontSize.md, fontWeight: "800" }}>{path.subgroupName ? `${path.subgroupName} → ` : ""}{path.roleName ?? "Explore this domain"}</Text></View><Feather name="arrow-up-right" size={17} color={colors.accentRole.action} /></View>
                <View style={styles.routeMeta}><Text style={{ color: colors.textRole.muted, fontSize: FontSize.xs }}>{path.tier ? `${path.tier} route` : "Domain route"}</Text><MatchMeta score={path.matchScore} label={path.matchLabel} color={colors.accentRole.action} /></View>
                <Text style={[styles.help, { color: colors.textRole.secondary }]}>{path.explanation}</Text>
                {path.matchedSkills.length ? <EvidenceChips values={path.matchedSkills} color={colors.accentRole.success} limit={3} /> : null}
                {path.gaps.length ? <Text style={[styles.help, { color: colors.textRole.muted }]}>Preparation still needed: {path.gaps.slice(0, 3).join(", ")}{path.gaps.length > 3 ? ` +${path.gaps.length - 3} more` : ""}</Text> : null}
              </TouchableOpacity>
            ))}
          </View>
          {paths.length > 4 ? <TouchableOpacity onPress={() => setShowAllPaths((current) => !current)} accessibilityRole="button"><Text style={[styles.link, { color: colors.accentRole.action }]}>{showAllPaths ? "Show fewer routes" : `See all ${paths.length} routes`}</Text></TouchableOpacity> : null}
        </View>
      ) : null}

      {hasTerms && suggestions.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>WHAT TO BUILD NEXT</SectionLabel>
          <Text style={[styles.help, { color: colors.textRole.muted }]}>These next steps are attached to a specific domain, subgroup or role. Start with the most foundational suggestion for that route.</Text>
          <View style={styles.suggestionList}>
            {visibleSuggestions.map((item) => {
              const key = `${item.contextKey}-${item.itemType}-${item.name}`;
              const isOpen = openSuggestion === key;
              return <View key={key} style={[styles.suggestion, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>
                <TouchableOpacity onPress={() => setOpenSuggestion(isOpen ? null : key)} accessibilityRole="button" accessibilityState={{ expanded: isOpen }} style={{ flex: 1, gap: 4 }}>
                  <View style={styles.sectionHeading}><Text style={{ color: colors.textRole.primary, fontWeight: "800", flex: 1 }}>{item.name}</Text><ItemTypeBadge type={item.itemType} colors={colors} /><PriorityBadge priority={item.priority} colors={colors} /><Feather name={isOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.textRole.muted} /></View>
                  <Text style={[styles.help, { color: colors.textRole.muted }]}>{item.contextLevel[0].toUpperCase() + item.contextLevel.slice(1)} level · {item.domainName}{item.roleName ? ` · ${item.roleName}` : ""}</Text>
                  <Text style={[styles.help, { color: colors.textRole.secondary }]}>{item.why}</Text>
                  {item.sourceBacked ? <Text style={{ color: colors.accentRole.success, fontSize: FontSize.xs, fontWeight: "700" }}>In the source-backed catalogue</Text> : null}
                  {isOpen ? <View style={[styles.suggestionDetail, { borderTopColor: colors.borderRole.subtle }]}>
                    {item.plainMeaning ? <Text style={[styles.help, { color: colors.textRole.secondary }]}><Text style={{ fontWeight: "800" }}>What it means: </Text>{item.plainMeaning}</Text> : null}
                    {item.contextualUse ? <Text style={[styles.help, { color: colors.textRole.secondary }]}><Text style={{ fontWeight: "800" }}>Why it matters here: </Text>{item.contextualUse}</Text> : null}
                    {item.expectedOutput ? <Text style={[styles.help, { color: colors.textRole.secondary }]}><Text style={{ fontWeight: "800" }}>What it helps you produce: </Text>{item.expectedOutput}</Text> : null}
                    {(() => {
                      const sources = (item.sourceReferences ?? [])
                        .map((source) => ({ ...source, studentUrl: studentSafeUrl(source.url) }))
                        .filter((source) => adminMode ? Boolean(source.url) : Boolean(source.studentUrl))
                        .slice(0, 3);
                      return sources.length ? <View style={{ gap: 3 }}><Text style={[styles.help, { color: colors.textRole.muted, fontWeight: "800" }]}>Evidence</Text>{sources.map((source) => <ExternalLinkGuard key={source.url} audience={adminMode ? "admin" : "student"} url={adminMode ? source.url : source.studentUrl} label={source.title ?? "Open evidence source"} description={`This opens the evidence source recorded for ${item.name}.`} textStyle={[styles.help, { color: colors.accentRole.action }]} />)}</View> : <Text style={[styles.help, { color: colors.textRole.muted }]}>No verified evidence link is available for this match yet.</Text>;
                    })()}
                  </View> : null}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => onAdd(item.name)} accessibilityRole="button" accessibilityLabel={`Add ${item.name} to the skill map`} style={styles.addSuggestion}><Feather name="plus-circle" size={19} color={colors.accentRole.action} /><Text style={{ color: colors.accentRole.action, fontSize: FontSize.xs, fontWeight: "800" }}>Add</Text></TouchableOpacity>
              </View>;
            })}
          </View>
          {suggestions.length > 4 ? <TouchableOpacity onPress={() => setShowAllSuggestions((current) => !current)} accessibilityRole="button"><Text style={[styles.link, { color: colors.accentRole.action }]}>{showAllSuggestions ? "Show fewer suggestions" : `See all ${suggestions.length} suggestions`}</Text></TouchableOpacity> : null}
        </View>
      ) : null}

      {data.domains.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>DOMAINS</SectionLabel>
          {visibleDomains.map((item) => <TouchableOpacity key={item.id} onPress={() => onOpenDomain(item.id)} accessibilityRole="button" style={[styles.entityCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><View style={styles.entityTop}><View style={{ flex: 1, gap: 3 }}><Text style={{ color: colors.textRole.primary, fontSize: FontSize.md, fontWeight: "800" }}>{item.name}</Text>{item.cluster ? <Text style={[styles.help, { color: colors.textRole.muted }]}>{item.cluster}</Text> : null}</View><MatchMeta score={item.matchScore} label={item.matchLabel} explanation={item.matchExplanation} color={colors.accentRole.action} /></View>{item.description ? <Text style={[styles.help, { color: colors.textRole.secondary }]}>{item.description}</Text> : null}{item.matchedSkills.length ? <EvidenceChips values={item.matchedSkills} color={colors.accentRole.success} limit={4} /> : null}{item.gaps.length ? <Text style={[styles.help, { color: colors.textRole.muted }]}>Foundation gaps: {item.gaps.slice(0, 3).join(", ")}{item.gaps.length > 3 ? ` +${item.gaps.length - 3} more` : ""}</Text> : null}<Text style={[styles.link, { color: colors.accentRole.action }]}>Open domain explanation →</Text></TouchableOpacity>)}
        </View>
      ) : null}

      {data.subgroups.length ? (
         <View style={styles.resultSection}><SectionLabel>SUBGROUPS</SectionLabel>{visibleSubgroups.map((item) => <TouchableOpacity key={item.id} onPress={() => item.domainId && onOpenSubgroup(item.domainId, item.id)} accessibilityRole="button" style={[styles.entityRow, { borderBottomColor: colors.borderRole.subtle }]}><View style={{ flex: 1, gap: 2 }}><Text style={{ color: colors.textRole.primary, fontWeight: "800" }}>{item.name ?? "Unnamed subgroup"}</Text><Text style={[styles.help, { color: colors.textRole.muted }]}>{item.domainName ?? "Domain route"}</Text>{item.gaps.length ? <Text style={[styles.help, { color: colors.textRole.muted }]}>Next gaps: {item.gaps.slice(0, 2).join(", ")}</Text> : null}</View><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></TouchableOpacity>)}</View>
      ) : null}

      {data.roles.length ? (
        <View style={styles.resultSection}><SectionLabel>ROLES</SectionLabel><Text style={[styles.help, { color: colors.textRole.muted }]}>Roles are shown after the domain route. Entry-level roles are prioritized so the next step remains realistic.</Text>{visibleRoles.map((item) => <TouchableOpacity key={item.key ?? item.name} onPress={() => item.key && onOpenRole(item.key)} accessibilityRole="button" style={[styles.entityRow, { borderBottomColor: colors.borderRole.subtle }]}><View style={{ flex: 1, gap: 2 }}><Text style={{ color: colors.textRole.primary, fontWeight: "800" }}>{item.name ?? "Unnamed role"}</Text><Text style={[styles.help, { color: colors.textRole.muted }]}>{item.domainName ?? "Domain route"}{item.tier ? ` · ${item.tier}` : ""}</Text>{item.gaps.length ? <Text style={[styles.help, { color: colors.textRole.muted }]}>Essential gaps: {item.gaps.slice(0, 2).join(", ")}</Text> : null}</View><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></TouchableOpacity>)}</View>
      ) : null}

      {competencies.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>COMPETENCIES</SectionLabel>
          <Text style={[styles.help, { color: colors.textRole.muted }]}>Competencies are the demonstrated combinations of knowledge and ability that help you use a skill in a real setting.</Text>
          {visibleCompetencies.map((item) => <View key={`${item.domainId}-${item.name}`} style={[styles.entityRow, { borderBottomColor: colors.borderRole.subtle }]}><View style={{ flex: 1, gap: 4 }}><ItemTypeBadge type="competency" colors={colors} /><Text style={{ color: colors.textRole.primary, fontWeight: "700" }}>{item.name ?? "Unnamed competency"}</Text><Text style={[styles.help, { color: colors.textRole.muted }]}>{item.domainName ?? "Domain route"}</Text></View><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></View>)}
        </View>
      ) : null}

      {data.tools.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>TOOLS</SectionLabel>
          <Text style={[styles.help, { color: colors.textRole.muted }]}>Tools are instruments you may use to practise or deliver work in this route.</Text>
          {visibleTools.map((item) => <View key={`${item.domainId}-${item.name}`} style={[styles.entityRow, { borderBottomColor: colors.borderRole.subtle }]}><View style={{ flex: 1, gap: 4 }}><ItemTypeBadge type="tool" colors={colors} /><Text style={{ color: colors.textRole.primary, fontWeight: "700" }}>{item.name ?? "Unnamed tool"}</Text><Text style={[styles.help, { color: colors.textRole.muted }]}>{item.group ?? "Tool"} · {item.domainName ?? "Domain"}</Text></View><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></View>)}
        </View>
      ) : null}

      {data.certifications.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>CERTIFICATIONS</SectionLabel>
          <Text style={[styles.help, { color: colors.textRole.muted }]}>Certifications are formal credentials; they are separate from the skills and competencies to build.</Text>
          {visibleCertifications.map((item) => <View key={`${item.domainId}-${item.name}`} style={[styles.entityRow, { borderBottomColor: colors.borderRole.subtle }]}><View style={{ flex: 1, gap: 4 }}><ItemTypeBadge type="certification" colors={colors} /><Text style={{ color: colors.textRole.primary, fontWeight: "700" }}>{item.name ?? "Unnamed certification"}</Text><Text style={[styles.help, { color: colors.textRole.muted }]}>{item.body ?? "Certification"}{item.level ? ` · ${item.level}` : ""} · {item.domainName ?? "Domain"}</Text></View><MatchMeta score={item.matchScore} label={item.matchLabel} color={colors.accentRole.action} /></View>)}
        </View>
      ) : null}

      {resources.length ? (
        <View style={styles.resultSection}>
          <SectionLabel>LEARNING LINKS</SectionLabel>
          <Text style={[styles.help, { color: colors.textRole.muted }]}>These approved links are attached to the matched domain, subgroup or role. Open a link to continue learning.</Text>
          {visibleResources.map((resource) => {
            // This panel is a learning surface for students and their guides:
            // never expose review-only, audit-only, unsourced or unsafe links.
            if (!isStudentLearningResource(resource)) return null;
            const url = studentSafeUrl(resource.url);
            if (!url) return null;
            const layer = [resource.domainName, resource.subgroupName, resource.roleName].filter(Boolean).join(" · ");
            return (
              <View key={resource.id} style={[styles.resourceRow, { borderBottomColor: colors.borderRole.subtle }]}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={{ color: colors.textRole.primary, fontWeight: "800" }}>{resource.targetName}</Text>
                  <Text style={[styles.help, { color: colors.textRole.muted }]}>{resource.provider} · {resource.resourceType.replaceAll("_", " ")}{layer ? ` · ${layer}` : ""}</Text>
                  {resource.description ? <Text style={[styles.help, { color: colors.textRole.secondary }]}>{resource.description}</Text> : null}
                </View>
                <ExternalLinkGuard
                  audience={adminMode ? "admin" : "student"}
                  url={url}
                  label="Open"
                  description={`Open ${resource.targetName} from ${resource.provider}.`}
                  textStyle={[styles.link, { color: colors.accentRole.action }]}
                />
              </View>
            );
          })}
        </View>
      ) : null}

      {(data.domains.length > 3 || data.subgroups.length > 4 || data.roles.length > 5 || competencies.length > 5 || data.tools.length > 5 || data.certifications.length > 5 || resources.length > 5) ? <TouchableOpacity onPress={() => setShowAllEntities((current) => !current)} accessibilityRole="button"><Text style={[styles.link, { color: colors.accentRole.action }]}>{showAllEntities ? "Show fewer catalogue items" : "See all connected catalogue items"}</Text></TouchableOpacity> : null}
      {!data.domains.length && hasTerms ? <View style={[styles.empty, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}><Feather name="search" size={18} color={colors.textRole.muted} /><Text style={[styles.help, { color: colors.textRole.secondary }]}>No source-backed route matched those terms yet. Try one of the suggested skills, remove a term, or choose “Use any selected skill.”</Text></View> : null}
      <View style={styles.sourceNote}><Feather name="info" size={15} color={colors.textRole.muted} /><Text style={[styles.help, { color: colors.textRole.muted }]}>Matches are computed from the current career catalogue. They are guidance connections, not a promise that one skill alone qualifies someone for a role.</Text></View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: Spacing.sm },
  guestCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, flexDirection: "row", alignItems: "flex-start", gap: Spacing.md },
  guestCopy: { flex: 1, gap: Spacing.sm },
  guestTitle: { fontSize: FontSize.lg, lineHeight: FontSize.lg * 1.2 },
  guestAction: { fontSize: FontSize.sm, fontWeight: "800", marginTop: Spacing.xs },
  hero: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  heroHeading: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  iconBox: { width: 42, height: 42, borderRadius: Radius.md, alignItems: "center", justifyContent: "center" },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "900", letterSpacing: 1.1 },
  heroTitle: { fontSize: FontSize.lg, lineHeight: FontSize.lg * 1.2 },
  heroBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5, maxWidth: 760 },
  steps: { flexDirection: "row", gap: Spacing.sm },
  stepsMobile: { flexDirection: "column" },
  step: { flex: 1, flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  stepNumber: { width: 22, height: 22, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  workspace: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.lg },
  field: { gap: Spacing.sm },
  optionRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  option: { minHeight: 42, borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, justifyContent: "center" },
  help: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  helpStrong: { fontSize: FontSize.sm, fontWeight: "800" },
  inputRow: { flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  inputWrap: { minHeight: 48, flex: 1, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  input: { flex: 1, minHeight: 44, fontSize: FontSize.sm },
  addButton: { minHeight: 48, minWidth: 48, borderRadius: Radius.md, paddingHorizontal: Spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: Spacing.xs },
  typeLegend: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: Spacing.xs },
  typeBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs, alignItems: "center" },
  chip: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  selectedChip: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 7, flexDirection: "row", alignItems: "center", gap: 5 },
  sectionHeading: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: Spacing.sm },
  loading: { alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.md },
  notice: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  unavailableState: { gap: Spacing.xs, alignItems: "flex-start" },
  retryButton: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 6 },
  results: { gap: Spacing.lg },
  resultIntro: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  resultIntroIcon: { width: 32, height: 32, borderRadius: Radius.full, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.55)" },
  resultSection: { gap: Spacing.sm },
  pathList: { gap: Spacing.sm },
  pathCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  pathTop: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  pathIndex: { width: 26, height: 26, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  routeMeta: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: Spacing.sm },
  matchMeta: { alignItems: "flex-end", gap: 2 },
  suggestionList: { gap: Spacing.xs },
  suggestion: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  suggestionDetail: { borderTopWidth: 1, paddingTop: Spacing.sm, marginTop: Spacing.xs, gap: Spacing.xs },
  addSuggestion: { minHeight: 36, flexDirection: "row", alignItems: "center", gap: 4 },
  priorityBadge: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  entityCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  entityTop: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  entityRow: { paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  resourceRow: { paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, flexDirection: "row", alignItems: "center", gap: Spacing.md },
  link: { fontSize: FontSize.sm, fontWeight: "800" },
  empty: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm },
  sourceNote: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
});

export default SkillDiscoveryPanel;
