import React, { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
  Platform,
  Share,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme, CompassFonts, FontSize, Radius, Spacing, webContainer } from "@/theme";
import { useAuth } from "@/hooks/useAuth";
import { careerData } from "@/lib/careerData";
import { adminNav, type Nav } from "@/lib/adminNav";
import { ADMIN_EXPLORE_BASE } from "@/lib/exploreNav";
import { exploreQueryHref, searchScopeForExplore } from "@/lib/exploreQuery";
import { resolveSearchHref, toSearchGroups } from "@/lib/searchResults";
import { SearchResultsGroup } from "@/components/careerIntelligence/SearchComponents";
import { SkillDiscoveryPanel } from "@/components/careerIntelligence/SkillDiscoveryPanel";
import type { CareerSearchResult, DataState, SearchResult, SearchScope } from "@/types/career";
import type { EducatorProfile } from "@/types/institution";

export type AdminScope = "all" | "programmes" | "universities" | "domains" | "areas" | "roles" | "skills" | "tools" | "certifications";
type SavedExploreSearch = { text: string; scope: AdminScope; savedAt: string };
const savedSearchKey = (userId: string) => `levelup:admin-explore:saved-searches:${userId}`;

const SCOPES: { value: AdminScope; label: string; searchScope: SearchScope }[] = [
  { value: "all", label: "Everything", searchScope: "all" },
  { value: "programmes", label: "JAMB programmes", searchScope: "programmes" },
  { value: "universities", label: "Universities", searchScope: "universities" },
  { value: "domains", label: "Domains", searchScope: "domains" },
  { value: "areas", label: "Areas of specialisation", searchScope: "subgroups" },
  { value: "roles", label: "Roles", searchScope: "roles" },
  { value: "skills", label: "Skills", searchScope: "skills" },
  { value: "tools", label: "Tools", searchScope: "tools" },
  { value: "certifications", label: "Certifications", searchScope: "certifications" },
];

function readParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function routeForAdmin(result: SearchResult): string | null {
  const href = resolveSearchHref(result);
  return href?.replace("/(tabs)/explore", ADMIN_EXPLORE_BASE) ?? null;
}

function SearchGroupList({
  groups,
  query,
  onPress,
}: {
  groups: ReturnType<typeof toSearchGroups>;
  query: string;
  onPress: (result: SearchResult) => void;
}) {
  return (
    <View style={styles.resultsStack}>
      {groups.map((group) => (
        <SearchResultsGroup
          key={group.label}
          label={group.label}
          results={group.items}
          query={query}
          onResultPress={onPress}
        />
      ))}
    </View>
  );
}

export default function AdminExplorePage({
  profile,
  initialQuery = "",
  initialScope = "all",
}: {
  profile: EducatorProfile | null;
  initialQuery?: string;
  initialScope?: AdminScope;
}) {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [scope, setScope] = useState<AdminScope>(initialScope);
  const [results, setResults] = useState<DataState<CareerSearchResult>>({ status: "pending", data: null });
  const [matcherOpen, setMatcherOpen] = useState(false);
  const [savedSearches, setSavedSearches] = useState<SavedExploreSearch[]>([]);
  const [notice, setNotice] = useState("");
  const searchInput = React.useRef<TextInput>(null);

  useEffect(() => setQuery(initialQuery), [initialQuery]);
  useEffect(() => setScope(initialScope), [initialScope]);

  useEffect(() => {
    let active = true;
    if (!user?.id) {
      setSavedSearches([]);
      return () => { active = false; };
    }
    void AsyncStorage.getItem(savedSearchKey(user.id)).then((raw) => {
      if (!active) return;
      try {
        const parsed: unknown = raw ? JSON.parse(raw) : [];
        setSavedSearches(Array.isArray(parsed) ? parsed.filter((item): item is SavedExploreSearch =>
          Boolean(item && typeof item.text === "string" && typeof item.scope === "string" && typeof item.savedAt === "string"),
        ).slice(0, 12) : []);
      } catch {
        setSavedSearches([]);
      }
    }).catch(() => { if (active) setSavedSearches([]); });
    return () => { active = false; };
  }, [user?.id]);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ status: "pending", data: null });
      return;
    }
    let active = true;
    const timer = setTimeout(() => {
      void careerData.searchCareer(trimmed).then((next) => {
        if (active) setResults(next);
      });
    }, 220);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query]);

  const selectedScope = SCOPES.find((item) => item.value === scope) ?? SCOPES[0];
  const groups = useMemo(
    () => toSearchGroups(results.data, scope === "areas" ? searchScopeForExplore("areas") : selectedScope.searchScope),
    [results.data, scope, selectedScope.searchScope],
  );
  const organizationLabel = profile?.organizationName?.trim() || "your organisation";
  const organizationType = profile?.organizationType ?? "secondary_school";

  const openResult = (result: SearchResult) => {
    const href = routeForAdmin(result);
    if (href) router.push(href as never);
  };

  const openAdmission = (where: "programme" | "school") => {
    router.push(`/(admin)/workspace-explore/admission?mode=${where}&admin=1` as never);
  };

  const saveSearch = async () => {
    const text = query.trim();
    if (!text || !user?.id) return;
    const next = [{ text, scope, savedAt: new Date().toISOString() }, ...savedSearches.filter((item) => item.text !== text || item.scope !== scope)].slice(0, 12);
    setSavedSearches(next);
    try {
      await AsyncStorage.setItem(savedSearchKey(user.id), JSON.stringify(next));
      setNotice("Search saved to this admin account on this device.");
    } catch {
      setNotice("This search could not be saved on this device.");
    }
  };

  const removeSavedSearch = async (target: SavedExploreSearch) => {
    const next = savedSearches.filter((item) => item.text !== target.text || item.scope !== target.scope);
    setSavedSearches(next);
    if (user?.id) await AsyncStorage.setItem(savedSearchKey(user.id), JSON.stringify(next)).catch(() => undefined);
  };

  const exportResults = async () => {
    const rows = groups.flatMap((group) => group.items.map((item) => [group.label, item.title, item.subtitle ?? "", item.meta ?? "", item.contextHint ?? ""]));
    if (!rows.length) {
      setNotice("Search first; there are no current results to export.");
      return;
    }
    const csv = [["Type", "Name", "Context", "Details", "Why it is shown"], ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\r\n");
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `levelup-explore-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
      setNotice("Current catalogue results exported as CSV.");
      return;
    }
    await Share.share({ title: "LevelUp catalogue results", message: csv });
    setNotice("Current catalogue results shared.");
  };

  const openSavedSearch = (item: SavedExploreSearch) => {
    setQuery(item.text);
    setScope(item.scope);
    router.replace(exploreQueryHref(ADMIN_EXPLORE_BASE, { text: item.text, scope: item.scope }) as never);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.page, webContainer as object]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={[styles.eyebrow, CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>ADMIN EXPLORE</Text>
      <Text style={[styles.title, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>Catalogue and reference workspace</Text>
      <Text style={[styles.lede, { color: colors.textRole.secondary }]}>
        Search the shared catalogue of JAMB programmes, universities, occupational domains, areas of specialisation, roles, skills and tools. This is a reference workspace for {organizationLabel}; it is separate from student Guidance and does not expose private student records.
      </Text>

      <View style={[styles.searchCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Search the catalogue</Text>
        <Text style={[styles.helper, { color: colors.textRole.secondary }]}>Search here from any admin page, then open the item in its correct programme, domain, area or role context.</Text>
        <View style={styles.searchRow}>
          <Feather name="search" size={18} color={colors.textRole.muted} />
          <TextInput
            ref={searchInput}
            value={query}
            onChangeText={setQuery}
            placeholder="Search programmes, universities, domains, areas, roles or tools"
            placeholderTextColor={colors.textRole.placeholder}
            returnKeyType="search"
            accessibilityLabel="Search the admin catalogue"
            style={[styles.searchInput, { color: colors.textRole.primary }]}
          />
          {query ? <TouchableOpacity onPress={() => setQuery("")} accessibilityRole="button"><Text style={{ color: colors.accentRole.action }}>Clear</Text></TouchableOpacity> : null}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scopeRow}>
          {SCOPES.map((item) => (
            <TouchableOpacity
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected: scope === item.value }}
              onPress={() => setScope(item.value)}
              style={[styles.scopeChip, { borderColor: scope === item.value ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: scope === item.value ? colors.surface.subtle : colors.surface.base }]}
            >
              <Text style={[styles.scopeText, { color: scope === item.value ? colors.accentRole.action : colors.textRole.secondary }]}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={styles.searchActions}>
          <TouchableOpacity onPress={() => void saveSearch()} disabled={!query.trim()} accessibilityRole="button" style={[styles.actionButton, { borderColor: colors.borderRole.subtle, opacity: query.trim() ? 1 : 0.55 }]}><Text style={[styles.actionButtonText, { color: colors.textRole.primary }]}>Save search</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => void exportResults()} accessibilityRole="button" style={[styles.actionButton, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.actionButtonText, { color: colors.textRole.primary }]}>Export / share results</Text></TouchableOpacity>
        </View>
        {savedSearches.length ? <View style={styles.savedSection}>
          <Text style={[styles.helper, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Saved searches</Text>
          <View style={styles.savedList}>{savedSearches.map((item) => <View key={`${item.scope}:${item.text}`} style={[styles.savedChip, { borderColor: colors.borderRole.subtle }]}><TouchableOpacity onPress={() => openSavedSearch(item)}><Text style={[styles.savedText, { color: colors.accentRole.action }]}>{item.text} · {SCOPES.find((candidate) => candidate.value === item.scope)?.label ?? "Everything"}</Text></TouchableOpacity><TouchableOpacity accessibilityRole="button" accessibilityLabel={`Remove saved search ${item.text}`} onPress={() => void removeSavedSearch(item)}><Feather name="x" size={14} color={colors.textRole.muted} /></TouchableOpacity></View>)}</View>
        </View> : null}
        {notice ? <Text role="status" style={[styles.helper, { color: colors.textRole.muted }]}>{notice}</Text> : null}
        {query.trim().length >= 2 && results.status === "pending" ? <Text style={[styles.helper, { color: colors.textRole.muted }]}>Searching the catalogue…</Text> : null}
        {query.trim().length >= 2 && ["error", "coming_soon", "locked"].includes(results.status) ? <Text style={[styles.empty, { color: colors.textRole.secondary }]}>{results.meta?.notice ?? "This catalogue search is not available right now. Try again or choose another index."}</Text> : null}
        {query.trim().length >= 2 && !["pending", "error", "coming_soon", "locked"].includes(results.status) && groups.length === 0 ? <Text style={[styles.empty, { color: colors.textRole.secondary }]}>No matching records in this catalogue scope. Try a broader term or Everything.</Text> : null}
        {groups.length ? <SearchGroupList groups={groups} query={query.trim()} onPress={openResult} /> : null}
      </View>

      <Text style={[styles.sectionHeading, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>Browse by catalogue door</Text>
      <Text style={[styles.helper, { color: colors.textRole.secondary }]}>These doors are reference indexes. Use Guidance when you are ready to run a student-specific workflow.</Text>
      <View style={styles.doorGrid}>
        <Door icon="book-open" title="JAMB programmes" body="Review programme identities, offerings and published requirements." onPress={() => openAdmission("programme")} colors={colors} />
        <Door icon="briefcase" title="Universities" body="Browse institution records and compare published programme availability." onPress={() => openAdmission("school")} colors={colors} />
        <Door icon="map" title="Domains → areas → roles" body="Follow the occupational hierarchy without exposing legacy subgroup wording." onPress={() => router.push(`${ADMIN_EXPLORE_BASE}/domains` as never)} colors={colors} />
        <Door icon="zap" title="Skills and tools" body="Find the capabilities and named tools attached to reviewed routes." onPress={() => { setScope("skills"); searchInput.current?.focus(); }} colors={colors} />
      </View>

      <Text style={[styles.sectionHeading, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>Admin quick tools</Text>
      <View style={styles.quickGrid}>
        <QuickLink icon="target" title="Skills Matcher" body="Test a learner’s skills against reviewed route contexts." onPress={() => setMatcherOpen((value) => !value)} colors={colors} />
        <QuickLink icon="bar-chart-2" title="Programme Intelligence" body="Review programme and capability signals in the admin workspace." onPress={() => router.push("/(admin)/skills-gap" as never)} colors={colors} />
        <QuickLink icon="users" title="University Comparison" body="Compare institution-level programme and offering context." onPress={() => adminNav.peers(router as Nav)} colors={colors} />
      </View>
      {matcherOpen ? <View style={[styles.matcher, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><SkillDiscoveryPanel adminType={organizationType} /></View> : null}

      <View style={[styles.boundary, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
        <Text style={[styles.boundaryTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Reference boundary</Text>
        <Text style={[styles.helper, { color: colors.textRole.secondary }]}>Explore helps an administrator discover and compare reviewed records. It does not silently turn catalogue records into student requirements, admission decisions or private student analytics.</Text>
      </View>
    </ScrollView>
  );
}

function Door({ icon, title, body, onPress, colors }: { icon: keyof typeof Feather.glyphMap; title: string; body: string; onPress: () => void; colors: ReturnType<typeof useTheme>["colors"] }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[styles.door, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><View style={[styles.iconBox, { backgroundColor: colors.surface.subtle }]}><Feather name={icon} size={18} color={colors.accentRole.action} /></View><Text style={[styles.doorTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{title}</Text><Text style={[styles.doorBody, { color: colors.textRole.secondary }]}>{body}</Text><Text style={[styles.link, { color: colors.accentRole.action }]}>Open index →</Text></TouchableOpacity>;
}

function QuickLink({ icon, title, body, onPress, colors }: { icon: keyof typeof Feather.glyphMap; title: string; body: string; onPress: () => void; colors: ReturnType<typeof useTheme>["colors"] }) {
  return <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={[styles.quick, { borderColor: colors.borderRole.subtle }]}><Feather name={icon} size={18} color={colors.accentRole.action} /><View style={{ flex: 1 }}><Text style={[styles.doorTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{title}</Text><Text style={[styles.doorBody, { color: colors.textRole.secondary }]}>{body}</Text></View></TouchableOpacity>;
}

const styles = StyleSheet.create({
  page: { padding: Spacing.xl, gap: Spacing.md, maxWidth: 1180, alignSelf: "center", width: "100%" },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 1.1 },
  title: { fontSize: 32, lineHeight: 38 },
  lede: { fontSize: FontSize.md, lineHeight: 24, maxWidth: 820 },
  searchCard: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg },
  helper: { fontSize: FontSize.sm, lineHeight: 21 },
  searchRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, minHeight: 48 },
  searchInput: { flex: 1, minHeight: 44, fontSize: FontSize.sm },
  scopeRow: { gap: Spacing.xs, paddingVertical: Spacing.xs },
  scopeChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.md, paddingVertical: 8 },
  scopeText: { fontSize: FontSize.xs, fontWeight: "700" },
  searchActions: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  actionButton: { minHeight: 38, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: "center" },
  actionButtonText: { fontSize: FontSize.xs, fontWeight: "800" },
  savedSection: { gap: Spacing.xs },
  savedList: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  savedChip: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderWidth: 1, borderRadius: 999, paddingHorizontal: Spacing.sm, paddingVertical: 7 },
  savedText: { fontSize: FontSize.xs, fontWeight: "700" },
  resultsStack: { gap: Spacing.md, marginTop: Spacing.sm },
  empty: { paddingVertical: Spacing.md, fontSize: FontSize.sm, lineHeight: 21 },
  sectionHeading: { fontSize: 23, lineHeight: 30, marginTop: Spacing.md },
  doorGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  door: { flexGrow: 1, flexBasis: 240, minHeight: 190, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.sm },
  iconBox: { width: 36, height: 36, alignItems: "center", justifyContent: "center", borderRadius: Radius.sm },
  doorTitle: { fontSize: FontSize.md },
  doorBody: { fontSize: FontSize.sm, lineHeight: 20 },
  link: { fontSize: FontSize.sm, fontWeight: "800", marginTop: "auto" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md },
  quick: { flexGrow: 1, flexBasis: 260, flexDirection: "row", alignItems: "flex-start", gap: Spacing.md, padding: Spacing.lg, borderWidth: 1, borderRadius: Radius.md },
  matcher: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  boundary: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.lg, marginTop: Spacing.md },
  boundaryTitle: { fontSize: FontSize.md, marginBottom: Spacing.xs },
});
