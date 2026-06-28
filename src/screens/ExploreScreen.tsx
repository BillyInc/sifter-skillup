/**
 * ExploreScreen — the core entry point (and the guest landing).
 *
 * This is where every user searches programmes → sees the domains, roles and
 * skills they map to. The live University + NCE search lands here in the next
 * phase. For now it presents the three SS3 "doors" and the search affordance,
 * with the data-backed results marked Coming Soon so nothing reads as fake.
 */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  Brand,
  webContainer,
} from "../theme";
import { DataStateView, LockedPill } from "../components/careerIntelligence";
import { careerData } from "../lib/careerData";
import { exploreNav } from "../lib/exploreNav";
import {
  comingSoon,
  type DataState,
  type ProgrammeSearchResult,
} from "../types/career";
import { useAuth } from "../hooks/useAuth";

const DOORS = [
  {
    key: "know",
    icon: "🎯",
    title: "I know what & where",
    body: "Pick your programme and see the fields and jobs it unlocks.",
    live: true,
  },
  {
    key: "what",
    icon: "🏫",
    title: "I know what, not where",
    body: "See which institutions offer it, with JAMB & Post-UTME cut-offs.",
    live: false,
  },
  {
    key: "unsure",
    icon: "🧭",
    title: "I don't know yet",
    body: "Enter your strongest subjects and see the programmes you qualify for.",
    live: false,
  },
];

export default function ExploreScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const isGuest = user?.auth_provider === "guest";

  const searchRef = useRef<TextInput>(null);
  const [query, setQuery] = useState("");
  // Only hold a result state once the user has actually searched, so the
  // Coming-Soon panel doesn't show before anyone has typed.
  const [results, setResults] = useState<DataState<
    ProgrammeSearchResult[]
  > | null>(null);

  // Debounced live search — careerData returns `coming_soon` for now, which
  // DataStateView renders gracefully; the populated branch ships when data lands.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }
    let active = true;
    const t = setTimeout(async () => {
      const state = await careerData.searchProgrammes(q);
      if (active) setResults(state);
    }, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  const runSearch = async () => {
    const q = query.trim();
    if (!q) {
      searchRef.current?.focus();
      return;
    }
    setResults(comingSoon<ProgrammeSearchResult[]>());
    const state = await careerData.searchProgrammes(q);
    setResults(state);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={[styles.eyebrow, { color: Brand.primaryDeep }]}>
        EXPLORE
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>
        See the domains, roles{"\n"}& jobs your programme unlocks
      </Text>

      {isGuest ? (
        <View
          style={[
            styles.banner,
            {
              backgroundColor: colors.goldSoft,
              borderColor: `${Brand.primary}40`,
            },
          ]}
        >
          <Text style={[styles.bannerText, { color: Brand.primaryDeep }]}>
            You're browsing as a guest. Create an account to save matches and
            get alerts.
          </Text>
        </View>
      ) : null}

      {/* Live programme search */}
      <View
        style={[
          styles.search,
          { backgroundColor: colors.inputBg, borderColor: colors.inputBorder },
        ]}
      >
        <Text style={[styles.searchIcon, { color: colors.textMuted }]}>🔍</Text>
        <TextInput
          ref={searchRef}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={runSearch}
          placeholder="Search a programme…"
          placeholderTextColor={colors.textMuted}
          returnKeyType="search"
          autoCorrect={false}
          style={[styles.searchInput, { color: colors.text }]}
        />
      </View>

      {/* Results region — coming_soon renders gracefully; future rows are tappable. */}
      {results ? (
        <DataStateView state={results} empty={(r) => r.length === 0}>
          {(rows) => (
            <View style={styles.results}>
              {rows.map((r) => (
                <TouchableOpacity
                  key={r.id}
                  activeOpacity={0.85}
                  style={[
                    styles.resultRow,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => exploreNav.programme(router, r.id)}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={[styles.resultTitle, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {r.name}
                    </Text>
                    {r.discipline ? (
                      <Text
                        style={[styles.resultMeta, { color: colors.textMuted }]}
                        numberOfLines={1}
                      >
                        {r.discipline}
                      </Text>
                    ) : null}
                  </View>
                  <Text
                    style={[styles.resultChevron, { color: colors.textMuted }]}
                  >
                    →
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </DataStateView>
      ) : null}

      <Text style={[styles.section, { color: colors.textSoft }]}>
        Where are you starting from?
      </Text>

      {DOORS.map((d) => (
        <TouchableOpacity
          key={d.key}
          activeOpacity={0.85}
          onPress={
            d.key === "know" ? () => searchRef.current?.focus() : undefined
          }
          style={[
            styles.card,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Text style={styles.cardIcon}>{d.icon}</Text>
          <View style={{ flex: 1 }}>
            <View style={styles.cardHeadRow}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {d.title}
              </Text>
              {d.live ? null : <LockedPill />}
            </View>
            <Text style={[styles.cardBody, { color: colors.textSoft }]}>
              {d.body}
            </Text>
          </View>
        </TouchableOpacity>
      ))}

      {/* Browse the full domain map (context-free explorer). */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => exploreNav.domains(router)}
        style={styles.browse}
      >
        <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
          🧭 Browse all domains →
        </Text>
      </TouchableOpacity>

      {/* Aspirational + every-starting-point routes (Phase 7). */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => exploreNav.elitePathways(router)}
        style={styles.browse}
      >
        <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
          ⭐ Explore elite pathways →
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => exploreNav.pathways(router)}
        style={styles.browse}
      >
        <Text style={[styles.browseText, { color: Brand.primaryDeep }]}>
          🚪 Special pathways — PhD · career change · upgrades · credentials →
        </Text>
      </TouchableOpacity>

      <Text style={[styles.note, { color: colors.textMuted }]}>
        University and College of Education programmes come online first. Other
        institution types, opportunities and elite pathways are being populated.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
    lineHeight: FontSize.display * 1.15,
  },
  banner: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  bannerText: {
    fontSize: FontSize.sm,
    fontWeight: "600",
    lineHeight: FontSize.sm * 1.4,
  },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.md,
    paddingVertical: 13,
    marginTop: Spacing.xs,
  },
  searchIcon: { fontSize: 16 },
  searchInput: { flex: 1, fontSize: FontSize.md, paddingVertical: 0 },
  results: { gap: Spacing.sm, marginTop: Spacing.xs },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    minHeight: 44,
  },
  resultTitle: { fontSize: FontSize.md, fontWeight: "700" },
  resultMeta: { fontSize: FontSize.xs, marginTop: 2 },
  resultChevron: { fontSize: FontSize.lg, fontWeight: "800" },
  browse: {
    minHeight: 44,
    justifyContent: "center",
    paddingVertical: Spacing.xs,
  },
  browseText: { fontSize: FontSize.sm, fontWeight: "800" },
  section: {
    fontSize: FontSize.sm,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginTop: Spacing.md,
    textTransform: "uppercase",
  },
  card: {
    flexDirection: "row",
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    alignItems: "flex-start",
  },
  cardIcon: { fontSize: 26 },
  cardHeadRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexWrap: "wrap",
  },
  cardTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  note: {
    fontSize: FontSize.xs,
    lineHeight: FontSize.xs * 1.6,
    marginTop: Spacing.md,
  },
});
