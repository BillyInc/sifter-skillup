import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, useWindowDimensions, View } from "react-native";
import { AdminShell } from "./AdminShell";
import { API } from "@/lib/api";
import { buildLearningInterestCsv } from "@/lib/learningAnalyticsCsv";
import { useAuth } from "@/hooks/useAuth";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, webContainer } from "@/theme";
import type { LearningInterestAnalytics, LearningInterestFilterOption, LearningInterestSchoolOption, LearningInterestSelection } from "@/types/learningAnalytics";

const WINDOWS = [7, 30, 90, 365] as const;
const TYPES = [
  ["all", "All choices"], ["programme", "Programmes"], ["institution", "Institutions"],
  ["domain", "Domains"], ["area", "Areas"], ["role", "Roles"],
  ["tool", "Tools"], ["method", "Methods"], ["method_item", "Method-linked items"],
  ["research_design", "Combined designs"], ["skill", "Skills"],
  ["competency", "Competencies"], ["knowledge", "Knowledge"], ["certification", "Certifications"],
  ["other_learning_item", "Other learning items"],
] as const;

function filterKey(option: LearningInterestFilterOption): string {
  const keys: Record<string, string> = {
    programme: "programme_id", institution: "institution_id", domain: "domain_id",
    area: "area_id", role: "role_id", method: "method_id",
    research_design: "design_id", learner_stage: "learner_stage", state: "state",
    affiliation_school: "affiliation_school_id",
  };
  return keys[option.filter_type] ?? `item:${option.filter_type}`;
}

function filterLabel(type: string): string {
  if (type === "affiliation_school") return "Affiliated school";
  return type.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function periodComparison(current: number | null, previous: number | null | undefined): string | null {
  if (current === null || current === undefined || previous === null || previous === undefined) return null;
  const difference = current - previous;
  if (difference === 0) return `No change vs previous period (${previous.toLocaleString()})`;
  const direction = difference > 0 ? "+" : "−";
  const magnitude = Math.abs(difference).toLocaleString();
  if (previous === 0) return `${direction}${magnitude} vs previous period; no activity then`;
  const percent = Math.round((difference / previous) * 100);
  return `${direction}${magnitude} (${percent > 0 ? "+" : ""}${percent}%) vs previous period`;
}

function chartBuckets(rows: LearningInterestAnalytics["daily_activity"], days: number) {
  if (days <= 7) return rows.map((row) => ({ key: row.day, label: row.day.slice(5), additions: row.additions, removals: row.removals }));
  const monthly = days > 90;
  const buckets = new Map<string, { key: string; label: string; additions: number; removals: number }>();
  for (const row of rows) {
    const date = new Date(`${row.day}T00:00:00Z`);
    if (Number.isNaN(date.getTime())) continue;
    let key: string;
    let label: string;
    if (monthly) {
      key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
      label = new Intl.DateTimeFormat("en", { month: "short", year: "2-digit", timeZone: "UTC" }).format(date);
    } else {
      const mondayOffset = (date.getUTCDay() + 6) % 7;
      date.setUTCDate(date.getUTCDate() - mondayOffset);
      key = date.toISOString().slice(0, 10);
      label = `${date.getUTCMonth() + 1}/${date.getUTCDate()}`;
    }
    const bucket = buckets.get(key) ?? { key, label, additions: 0, removals: 0 };
    bucket.additions += row.additions ?? 0;
    bucket.removals += row.removals ?? 0;
    buckets.set(key, bucket);
  }
  return [...buckets.values()].sort((a, b) => a.key.localeCompare(b.key));
}

export function LearningInterestScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  // The persistent admin rail consumes 264px on web. Header/content padding and
  // the page gutters leave roughly 935px for the nine-column table only above
  // a 1360px viewport; switch to cards before those columns are squeezed.
  const compactLayout = width < 1360;
  const platformScope = user?.is_internal_staff === true;
  const [days, setDays] = useState<number>(30);
  const [entityType, setEntityType] = useState("all");
  const [schoolOptions, setSchoolOptions] = useState<LearningInterestSchoolOption[]>([]);
  const [schoolId, setSchoolId] = useState("");
  const [schoolLoading, setSchoolLoading] = useState(!platformScope);
  const [schoolError, setSchoolError] = useState("");
  const [filterSearch, setFilterSearch] = useState("");
  const [filterOptions, setFilterOptions] = useState<LearningInterestFilterOption[]>([]);
  const [filterSearchLoading, setFilterSearchLoading] = useState(false);
  const [filterSearchError, setFilterSearchError] = useState("");
  const [selectedFilters, setSelectedFilters] = useState<LearningInterestFilterOption[]>([]);
  const [data, setData] = useState<LearningInterestAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const latestRequest = useRef(0);

  useEffect(() => {
    if (platformScope) return;
    let cancelled = false;
    setSchoolLoading(true);
    setSchoolError("");
    void API.getLearningInterestSchools()
      .then((result) => {
        if (cancelled) return;
        const options = result.schools ?? [];
        setSchoolOptions(options);
        setSchoolId((current) => current && options.some((option) => option.school_id === current)
          ? current
          : options.length === 1 ? options[0].school_id : "");
      })
      .catch(() => { if (!cancelled) { setSchoolOptions([]); setSchoolId(""); setSchoolError("Could not load your verified institution access. Try refreshing the page."); } })
      .finally(() => { if (!cancelled) setSchoolLoading(false); });
    return () => { cancelled = true; };
  }, [platformScope]);

  useEffect(() => {
    const query = filterSearch.trim();
    if (query.length < 2 || (!platformScope && !schoolId)) {
      setFilterOptions([]);
      setFilterSearchLoading(false);
      setFilterSearchError("");
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      setFilterSearchLoading(true);
      setFilterSearchError("");
      void API.getLearningInterestFilterOptions({ query, days, ...(!platformScope && schoolId ? { school_id: schoolId } : {}) })
        .then((result) => { if (!cancelled) setFilterOptions(result.options ?? []); })
        .catch(() => { if (!cancelled) { setFilterOptions([]); setFilterSearchError("Could not load filter options. Try again in a moment."); } })
        .finally(() => { if (!cancelled) setFilterSearchLoading(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [filterSearch, days, platformScope, schoolId]);

  const contextFilters = useMemo(() => selectedFilters.reduce<Record<string, string>>((result, option) => {
    const key = filterKey(option);
    if (key.startsWith("item:")) {
      result.item_type = key.slice("item:".length);
      result.item_id = option.filter_id;
    } else {
      result[key] = option.filter_id;
    }
    return result;
  }, {}), [selectedFilters]);

  const selectFilterOption = (option: LearningInterestFilterOption) => {
    const nextKey = filterKey(option);
    setSelectedFilters((current) => [
      ...current.filter((item) => {
        const currentKey = filterKey(item);
        return currentKey !== nextKey && !(nextKey.startsWith("item:") && currentKey.startsWith("item:"));
      }),
      option,
    ]);
    setFilterSearch("");
    setFilterOptions([]);
  };

  const load = useCallback(async () => {
    const requestId = ++latestRequest.current;
    if (!platformScope && (schoolLoading || !schoolId)) {
      setData(null);
      setError("");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await API.getLearningInterestAnalytics({
        scope: platformScope ? "platform" : "school",
        days,
        ...(!platformScope && schoolId ? { school_id: schoolId } : {}),
        entity_type: entityType === "all" ? undefined : entityType,
        ...contextFilters,
      });
      if (requestId === latestRequest.current) setData(result);
    } catch (cause) {
      if (requestId === latestRequest.current) {
        setError(cause instanceof Error ? cause.message : "Could not load learner-interest analytics.");
      }
    } finally {
      if (requestId === latestRequest.current) setLoading(false);
    }
  }, [platformScope, days, entityType, contextFilters, schoolId, schoolLoading]);

  useEffect(() => {
    void load();
    return () => { latestRequest.current += 1; };
  }, [load]);

  const exportCsv = () => {
    if (Platform.OS !== "web" || !data) return;
    const schoolScopeLabel = schoolOptions.find((option) => option.school_id === schoolId)?.school_name;
    const appliedFilters = [
      ...selectedFilters.map((option) => `${filterLabel(option.filter_type)}: ${option.filter_label}`),
      ...(!platformScope && schoolScopeLabel ? [`Institution scope: ${schoolScopeLabel}`] : []),
    ];
    const csv = buildLearningInterestCsv(data, days, entityType === "all" ? "All choice types" : filterLabel(entityType), appliedFilters);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `levelup-learning-interest-${days}d-${data.updated_at.slice(0, 10)}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  const activityBuckets = useMemo(() => chartBuckets(data?.daily_activity ?? [], days), [data, days]);
  const maxDaily = useMemo(() => Math.max(1, ...activityBuckets.flatMap((row) => [row.additions, row.removals])), [activityBuckets]);
  const subtitle = platformScope
    ? "Platform-wide, opt-in learning choices. Use this to prioritize routes, items and tools learners actually add."
    : "Aggregate choices from students affiliated with your institution who opted in to analytics. Individual student paths are not shown.";

  const chip = (label: string, selected: boolean, onPress: () => void) => (
    <TouchableOpacity key={label} onPress={onPress} accessibilityRole="button" accessibilityState={{ selected }}
      style={[styles.chip, { borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: selected ? colors.accentRole.action : colors.surface.raised }]}>
      <Text style={[styles.chipText, CompassFonts.bodySemibold, { color: selected ? colors.textRole.inverse : colors.textRole.primary }]}>{label}</Text>
    </TouchableOpacity>
  );

  const card = (title: string, value: number | null, detail: string, previous?: number | null) => (
    <View key={title} testID={`learning-interest-metric-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} style={[styles.metric, compactLayout ? styles.metricCompact : null, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.metricTitle, CompassFonts.bodySemibold, { color: colors.textRole.secondary }]}>{title}</Text>
      <Text accessibilityLabel={`${title}: ${value ?? 0}`} style={[styles.metricValue, CompassFonts.displayBold, { color: colors.textRole.primary }]}>{(value ?? 0).toLocaleString()}</Text>
      <Text style={[styles.help, CompassFonts.body, { color: colors.textRole.secondary }]}>{detail}</Text>
      {periodComparison(value, previous) ? <Text style={[styles.comparison, CompassFonts.bodySemibold, { color: colors.textRole.secondary }]}>{periodComparison(value, previous)}</Text> : null}
    </View>
  );

  return <AdminShell title="Learner interest" eyebrow={platformScope ? "LevelUp · aggregate analytics" : "Institution · aggregate analytics"}>
    <ScrollView contentContainerStyle={[styles.page, webContainer]}>
      <View style={styles.headingRow}>
        <View style={styles.headingCopy}>
          <Text accessibilityRole="header" style={[styles.title, CompassFonts.displayBold, { color: colors.textRole.primary }]}>What learners choose to learn</Text>
          <Text style={[styles.subtitle, CompassFonts.body, { color: colors.textRole.secondary }]}>{subtitle}</Text>
        {data ? <Text style={[styles.help, { color: colors.textRole.secondary }]}>Updated {new Date(data.updated_at).toLocaleString()}</Text> : null}
        </View>
        {Platform.OS === "web" ? <TouchableOpacity accessibilityRole="button" onPress={exportCsv} disabled={!data?.top_selections.length} style={[styles.export, { borderColor: colors.borderRole.subtle, opacity: data?.top_selections.length ? 1 : 0.5 }]}><Text style={[CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Download aggregate CSV</Text></TouchableOpacity> : null}
      </View>

      {!platformScope ? <View style={styles.filterBlock}>
        <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Institution scope</Text>
        <Text style={[styles.help, { color: colors.textRole.secondary }]}>Choose which verified institution’s opted-in learner choices to view. Access is checked by the server.</Text>
        {schoolLoading ? <View style={styles.inlineState}><ActivityIndicator color={colors.accentRole.action} /><Text style={[styles.help, { color: colors.textRole.secondary }]}>Loading your institution access…</Text></View>
          : schoolError ? <Text accessibilityRole="alert" style={[styles.help, { color: colors.textRole.secondary }]}>{schoolError}</Text>
            : schoolOptions.length > 1 ? <View style={styles.chips}>{schoolOptions.map((school) => chip(`${school.school_name} · ${school.institution_type}`, schoolId === school.school_id, () => {
              if (schoolId !== school.school_id) {
                setData(null);
                setError("");
                setLoading(true);
              }
              setSchoolId(school.school_id);
              setSelectedFilters([]);
              setFilterSearch("");
              setFilterOptions([]);
            }))}</View>
              : schoolOptions.length === 1 ? <Text style={[styles.schoolScope, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{schoolOptions[0].school_name} · {schoolOptions[0].institution_type}</Text>
                : <Text style={[styles.help, { color: colors.textRole.secondary }]}>No verified institution analytics access is available for this account.</Text>}
      </View> : null}

      <View style={styles.filterBlock}>
        <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Time window</Text>
        <View style={styles.chips}>{WINDOWS.map((window) => chip(`${window} days`, days === window, () => setDays(window)))}</View>
      </View>
      {loading && !data ? <View style={styles.state}><ActivityIndicator color={colors.accentRole.action} /><Text style={[styles.body, { color: colors.textRole.secondary }]}>Loading aggregate learning choices…</Text></View> : error && !data ? <View accessibilityRole="alert" style={[styles.notice, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.body, { color: colors.textRole.primary }]}>{error}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Try again" onPress={() => void load()}><Text style={[CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>Try again</Text></TouchableOpacity></View> : data ? <>
        {loading ? <View accessibilityLiveRegion="polite" style={styles.inlineState}><ActivityIndicator color={colors.accentRole.action} /><Text style={[styles.help, { color: colors.textRole.secondary }]}>Updating results; the dashboard still shows the previous result set until this finishes.</Text></View> : null}
        {error ? <View accessibilityRole="alert" style={[styles.notice, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.help, { color: colors.textRole.primary }]}>Could not refresh analytics. Showing the last successfully loaded results. {error}</Text><TouchableOpacity accessibilityRole="button" accessibilityLabel="Retry analytics refresh" onPress={() => void load()}><Text style={[CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>Try again</Text></TouchableOpacity></View> : null}
        <View style={styles.metrics}>
          {card("Learners with choices selected now", data.currently_selected_learners, "Unique opted-in learners with at least one active selection; independent of the date window")}
          {card("Learners who added a choice", data.learners_who_added, `Unique people who added at least one choice in the last ${days} days`, data.previous_period?.learners_who_added)}
          {card("Learners who removed a choice", data.learners_who_removed, `Unique people who removed at least one choice in the last ${days} days`, data.previous_period?.learners_who_removed)}
          {card("Add actions", data.selection_additions, `Explicit additions in the last ${days} days; not page views`, data.previous_period?.selection_additions)}
          {card("Remove actions", data.selection_removals, `Explicit removals in the last ${days} days`, data.previous_period?.selection_removals)}
          {card(
            "Active route contexts",
            data.currently_selected_contexts,
            `Distinct learner route scopes with at least one current choice; ${data.currently_selected_route_patterns.toLocaleString()} labeled route ${data.currently_selected_route_patterns === 1 ? "pattern is" : "patterns are"} represented.`,
          )}
        </View>
        <Text style={[styles.help, { color: colors.textRole.secondary }]}>
          These figures include only choices recorded while a learner had opted in to analytics. A zero means no matching opted-in choices were recorded; it does not prove that no learners are interested.
        </Text>
        <View style={styles.filterBlock}>
          <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Choice type</Text>
          <View style={styles.chips}>{TYPES.map(([id, label]) => chip(label, entityType === id, () => setEntityType(id)))}</View>
        </View>
      <View style={styles.filterBlock}>
        <Text style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Filter the results</Text>
        <Text style={[styles.help, { color: colors.textRole.secondary }]}>Combine programme, institution, domain, area, role, method/design, learner stage, affiliated school or state with one exact learning item or one named route pattern. “Institution” means the university or centre the learner explored; “Affiliated school” means where the learner was affiliated when the choice was recorded.</Text>
        <TextInput accessibilityLabel="Search learning-interest filters" value={filterSearch} onChangeText={(value) => {
          setFilterSearch(value);
          setFilterOptions([]);
          setFilterSearchError("");
        }} editable={platformScope || Boolean(schoolId)} placeholder="For example, Sociology, Social Sciences, Python, Lagos or school name" placeholderTextColor={colors.textRole.placeholder} style={[styles.input, { borderColor: colors.borderRole.subtle, color: colors.textRole.primary, opacity: !platformScope && !schoolId ? 0.55 : 1 }]} />
        {selectedFilters.length ? <TouchableOpacity accessibilityRole="button" accessibilityLabel="Clear all filters" onPress={() => setSelectedFilters([])}><Text style={[CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>Clear all filters</Text></TouchableOpacity> : null}
        {selectedFilters.length ? <View style={styles.chips}>{selectedFilters.map((option) => <TouchableOpacity key={`${filterKey(option)}:${option.filter_id}`} accessibilityRole="button" accessibilityLabel={`Remove ${option.filter_label} filter`} onPress={() => setSelectedFilters((current) => current.filter((item) => !(filterKey(item) === filterKey(option) && item.filter_id === option.filter_id)))} style={[styles.selectedFilter, { borderColor: colors.accentRole.action, backgroundColor: colors.surface.raised }]}><Text style={[styles.chipText, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{filterLabel(option.filter_type)}: {option.filter_label} ×</Text></TouchableOpacity>)}</View> : null}
        {filterSearchLoading ? <Text style={[styles.help, { color: colors.textRole.secondary }]}>Searching available filters…</Text> : filterSearch.trim().length >= 2 && !filterSearchError ? <View style={[styles.searchResults, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}>{filterOptions.length ? filterOptions.map((option) => <TouchableOpacity key={`${option.filter_type}:${option.filter_id}`} accessibilityRole="button" accessibilityLabel={`Select ${filterLabel(option.filter_type)} filter: ${option.filter_label}`} onPress={() => selectFilterOption(option)} style={[styles.searchResult, { borderBottomColor: colors.borderRole.subtle }]}><View style={styles.searchResultCopy}><Text style={[styles.rowName, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{option.filter_label}</Text><Text style={[styles.help, { color: colors.textRole.secondary }]}>{filterLabel(option.filter_type)} · {option.learners.toLocaleString()} {option.learners === 1 ? "learner" : "learners"} with current selection or recent activity</Text></View><Text style={[CompassFonts.bodySemibold, { color: colors.accentRole.action }]}>Add filter</Text></TouchableOpacity>) : <Text style={[styles.empty, CompassFonts.body, { color: colors.textRole.secondary }]}>No matching current selections or recent activity found.</Text>}</View> : null}
        {filterSearchError ? <Text accessibilityRole="alert" style={[styles.help, { color: colors.textRole.secondary }]}>{filterSearchError}</Text> : null}
      </View>

          <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <View style={styles.panelHeading}><View><Text accessibilityRole="header" style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Learning choices selected now and recently</Text><Text style={[styles.help, { color: colors.textRole.secondary }]}>Ranked first by the number of learners who currently have each choice active, then by recent activity. Current selections are not limited by the selected date window; adds and removals are.</Text><Text style={[styles.help, { color: colors.textRole.secondary }]}>Showing up to 100 choices. Search by name to inspect a specific choice, including one outside this ranked preview.</Text></View></View>
          {!compactLayout ? <View style={[styles.tableHeader, { borderBottomColor: colors.borderRole.subtle }]}><Text style={[styles.tableHead, { color: colors.textRole.secondary }]}>Choice</Text><Text style={[styles.tableHead, styles.typeColumn, { color: colors.textRole.secondary }]}>Type</Text><Text style={[styles.numberColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Selected now</Text><Text style={[styles.numberColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Active contexts now</Text><Text style={[styles.numberColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Recent learners</Text><Text style={[styles.numberColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Adds</Text><Text style={[styles.numberColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Removes</Text><Text style={[styles.numberColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Recent route patterns</Text><Text style={[styles.contextColumn, styles.tableHead, { color: colors.textRole.secondary }]}>Route context</Text></View> : null}
          {data.top_selections.length ? data.top_selections.map((row: LearningInterestSelection) => compactLayout
            ? <View key={`${row.entity_type}:${row.entity_id}`} testID="learning-interest-selection-card" style={[styles.selectionCard, { borderColor: colors.borderRole.subtle }]}>
                <View style={styles.selectionCardHeader}><Text style={[styles.rowName, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{row.entity_label}</Text><Text style={[styles.typeTag, { color: colors.textRole.secondary, borderColor: colors.borderRole.subtle }]}>{filterLabel(row.entity_type)}</Text></View>
                <View style={styles.selectionStats}>{[["Selected now", row.currently_selected_learners], ["Recent learners", row.learners], ["Adds", row.additions], ["Removes", row.removals], ["Active contexts now", row.current_contexts], ["Recent route patterns", row.selected_contexts]].map(([label, value]) => <View key={String(label)} style={styles.selectionStat}><Text style={[styles.help, { color: colors.textRole.secondary }]}>{label}</Text><Text style={[styles.tableText, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{Number(value).toLocaleString()}</Text></View>)}</View>
                <Text style={[styles.help, { color: colors.textRole.secondary }]}>{row.latest_context || "Multiple learning routes"}</Text>
              </View>
            : <View key={`${row.entity_type}:${row.entity_id}`} style={[styles.tableRow, { borderBottomColor: colors.borderRole.subtle }]}><Text style={[styles.rowName, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{row.entity_label}</Text><Text style={[styles.typeColumn, styles.tableText, { color: colors.textRole.secondary }]}>{filterLabel(row.entity_type)}</Text><Text style={[styles.numberColumn, styles.tableText, { color: colors.textRole.primary }]}>{row.currently_selected_learners.toLocaleString()}</Text><Text style={[styles.numberColumn, styles.tableText, { color: colors.textRole.primary }]}>{row.current_contexts.toLocaleString()}</Text><Text style={[styles.numberColumn, styles.tableText, { color: colors.textRole.primary }]}>{row.learners.toLocaleString()}</Text><Text style={[styles.numberColumn, styles.tableText, { color: colors.textRole.primary }]}>{row.additions.toLocaleString()}</Text><Text style={[styles.numberColumn, styles.tableText, { color: colors.textRole.primary }]}>{row.removals.toLocaleString()}</Text><Text style={[styles.numberColumn, styles.tableText, { color: colors.textRole.primary }]}>{row.selected_contexts.toLocaleString()}</Text><Text style={[styles.contextColumn, styles.tableText, { color: colors.textRole.secondary }]}>{row.latest_context || "Multiple learning routes"}</Text></View>) : <Text style={[styles.empty, CompassFonts.body, { color: colors.textRole.secondary }]}>No currently selected choices or recent activity match these filters.</Text>}
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Current route patterns selected now</Text>
          <Text style={[styles.help, { color: colors.textRole.secondary }]}>Each labeled pattern groups matching programme, domain, area, role and method choices, and may represent multiple learners or separate route contexts. Active contexts count the distinct route scopes. These indicate learner interest, not a complete, saved or completed pathway. Showing up to 50 patterns.</Text>
          {data.top_current_routes.length ? data.top_current_routes.map((route) => <View key={route.route_key} style={[styles.routeRow, { borderBottomColor: colors.borderRole.subtle }]}><Text style={[styles.rowName, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{route.route_label}</Text><Text style={[styles.tableText, { color: colors.textRole.secondary }]}>{route.currently_selected_learners.toLocaleString()} learners selected now</Text><Text style={[styles.tableText, { color: colors.textRole.secondary }]}>{route.selection_contexts.toLocaleString()} active contexts</Text></View>) : <Text style={[styles.empty, CompassFonts.body, { color: colors.textRole.secondary }]}>No current selected route contexts match these filters.</Text>}
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Recent route patterns attached to choices</Text>
          <Text style={[styles.help, { color: colors.textRole.secondary }]}>A labeled route pattern groups matching learner stage, programme, institution, domain, area, role and selected methods/designs, even when different learners or separate route contexts created it. It shows the context for recent additions, not proof that a complete route was saved or completed.</Text>
          {data.route_combinations_total ? <Text style={[styles.help, { color: colors.textRole.secondary }]}>Showing up to 50 of {data.route_combinations_total.toLocaleString()} route patterns added in this time window.</Text> : null}
          {data.top_routes.length ? data.top_routes.map((route) => <View key={route.route_key} style={[styles.routeRow, { borderBottomColor: colors.borderRole.subtle }]}><Text style={[styles.rowName, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{route.route_label}</Text><Text style={[styles.tableText, { color: colors.textRole.secondary }]}>{route.learners.toLocaleString()} learners</Text><Text style={[styles.tableText, { color: colors.textRole.secondary }]}>{route.additions.toLocaleString()} additions</Text></View>) : <Text style={[styles.empty, CompassFonts.body, { color: colors.textRole.secondary }]}>No selection contexts were attached to choices during this period with these filters.</Text>}
        </View>

        <View style={[styles.panel, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text accessibilityRole="header" style={[styles.sectionTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Selection activity over time</Text>
          <Text style={[styles.help, { color: colors.textRole.secondary }]}>{days <= 7 ? "Daily" : days <= 90 ? "Weekly" : "Monthly"} additions and removals are grouped for readability. The CSV retains daily rows; these are selection edits, not course completion.</Text>
          <View style={styles.chartLegend}><Text style={[styles.legendItem, CompassFonts.body, { color: colors.textRole.primary }]}>Orange: added choices</Text><Text style={[styles.legendItem, CompassFonts.body, { color: colors.textRole.primary }]}>Grey: removed choices</Text></View>
          {activityBuckets.length ? <ScrollView horizontal accessibilityLabel="Scrollable selection activity chart" showsHorizontalScrollIndicator contentContainerStyle={[styles.chart, { minWidth: Math.max(320, activityBuckets.length * 52) }]}>{activityBuckets.map((row) => <View key={row.key} accessible accessibilityRole="image" accessibilityLabel={`${row.label}: ${row.additions} additions and ${row.removals} removals`} style={styles.barColumn}><View style={styles.chartValues}><Text style={[styles.barValue, CompassFonts.bodySemibold, { color: colors.textRole.secondary }]}>{row.additions}</Text><Text style={[styles.barValue, CompassFonts.bodySemibold, { color: colors.textRole.secondary }]}>{row.removals}</Text></View><View style={styles.barPair}><View style={[styles.bar, { height: row.additions ? Math.max(4, Math.round((row.additions / maxDaily) * 110)) : 0, backgroundColor: colors.accentRole.action }]} /><View style={[styles.bar, { height: row.removals ? Math.max(4, Math.round((row.removals / maxDaily) * 110)) : 0, backgroundColor: colors.borderRole.strong }]} /></View><Text style={[styles.barDate, CompassFonts.body, { color: colors.textRole.secondary }]}>{row.label}</Text></View>)}</ScrollView> : <Text style={[styles.empty, CompassFonts.body, { color: colors.textRole.secondary }]}>No activity in this period.</Text>}
        </View>
      </> : null}
      {!loading && data ? <Text style={[styles.footnote, CompassFonts.body, { color: colors.textRole.secondary }]}>Current counts reflect active route-scoped selections by learners with current analytics consent; recent Add/Remove counts use the selected date window. Exact counts include small groups, so a choice may be inferable in a very small school cohort; use only for authorised planning. A saved path remains available to its owner independently of analytics consent. No names, emails, grades, or individual learner histories are available here.</Text> : null}
    </ScrollView>
  </AdminShell>;
}

const styles = StyleSheet.create({
  page: { padding: Spacing.xl, gap: Spacing.lg, width: "100%", maxWidth: 1440, alignSelf: "center" },
  headingRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: Spacing.lg, flexWrap: "wrap" },
  headingCopy: { flex: 1, minWidth: 280, gap: Spacing.xs },
  title: { fontSize: FontSize.xxl }, subtitle: { fontSize: FontSize.md, lineHeight: 23, maxWidth: 900 },
  export: { minHeight: 42, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, justifyContent: "center" },
  filterBlock: { gap: Spacing.xs }, sectionTitle: { fontSize: FontSize.md }, chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  inlineState: { flexDirection: "row", alignItems: "center", gap: Spacing.sm }, schoolScope: { fontSize: FontSize.sm },
  chip: { borderWidth: 1, borderRadius: Radius.full, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md }, chipText: { fontSize: FontSize.sm },
  input: { minWidth: 220, flexGrow: 1, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.md, minHeight: 42, fontSize: FontSize.sm },
  selectedFilter: { borderWidth: 1, borderRadius: Radius.full, paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md }, searchResults: { borderWidth: 1, borderRadius: Radius.md, overflow: "hidden", maxHeight: 360 }, searchResult: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: Spacing.md, padding: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth }, searchResultCopy: { flex: 1, gap: 2 },
  metrics: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.md }, metric: { flexGrow: 1, flexBasis: 230, minWidth: 210, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.xs }, metricCompact: { flexBasis: 180, minWidth: 170, padding: Spacing.md },
  metricTitle: { fontSize: FontSize.sm }, metricValue: { fontSize: 32 }, help: { fontSize: FontSize.xs, lineHeight: 18 }, comparison: { fontSize: FontSize.xs, lineHeight: 18 }, body: { fontSize: FontSize.sm, lineHeight: 21 },
  panel: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md }, panelHeading: { flexDirection: "row", justifyContent: "space-between", gap: Spacing.md, flexWrap: "wrap" },
  tableHeader: { flexDirection: "row", gap: Spacing.sm, paddingBottom: Spacing.sm, borderBottomWidth: 1 }, tableHead: { fontSize: FontSize.xs, fontWeight: "700" }, tableRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth },
  selectionCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm }, selectionCardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: Spacing.sm }, selectionStats: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm }, selectionStat: { flexGrow: 1, flexBasis: 64, gap: 2 }, typeTag: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 2, fontSize: FontSize.xs, textTransform: "capitalize" },
  rowName: { flex: 1, fontSize: FontSize.sm }, tableText: { fontSize: FontSize.sm }, typeColumn: { width: 115, textTransform: "capitalize" }, contextColumn: { flex: 1.4, minWidth: 180 }, numberColumn: { width: 66, textAlign: "right" }, routeRow: { flexDirection: "row", alignItems: "center", gap: Spacing.md, paddingVertical: Spacing.md, borderBottomWidth: StyleSheet.hairlineWidth }, empty: { fontSize: FontSize.sm, paddingVertical: Spacing.md },
  state: { minHeight: 150, justifyContent: "center", alignItems: "center", gap: Spacing.md }, notice: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.sm },
  chartLegend: { flexDirection: "row", gap: Spacing.lg, flexWrap: "wrap" }, legendItem: { fontSize: FontSize.xs }, chart: { height: 176, flexDirection: "row", alignItems: "flex-end", gap: 4, paddingHorizontal: Spacing.xs }, barColumn: { width: 48, flexGrow: 0, flexShrink: 0, height: "100%", justifyContent: "flex-end", alignItems: "center", gap: 4 }, chartValues: { flexDirection: "row", gap: 10 }, barPair: { height: 116, flexDirection: "row", alignItems: "flex-end", gap: 4 }, bar: { width: 14, minHeight: 4, borderTopLeftRadius: 3, borderTopRightRadius: 3 }, barDate: { fontSize: 10 }, barValue: { fontSize: FontSize.xs }, footnote: { fontSize: FontSize.xs, lineHeight: 18, maxWidth: 1100 },
});
