/**
 * ScholarshipsScreen — the Opportunities list of scholarships / funding routes.
 *
 * Scholarships are a SECONDARY, supporting feature (they never compete with the
 * primary employment opportunities). This is a LIST screen, so it ships its own
 * inline back+header chrome (mirroring DetailScaffold visually) and renders the
 * body through DataStateView. Data comes from careerData.getScholarships, which
 * returns a `coming_soon` envelope in this phase — DataStateView renders the
 * graceful "Coming soon" panel for it, and flips to real cards (or the empty
 * state) automatically once data lands, with no changes here.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize, webContainer } from "../../theme";
import { careerData } from "../../lib/careerData";
import {
  comingSoon,
  type DataState,
  type Scholarship,
} from "../../types/career";
import {
  DataStateView,
  ScholarshipCard,
} from "../../components/careerIntelligence";

export function ScholarshipsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [state, setState] =
    useState<DataState<Scholarship[]>>(comingSoon<Scholarship[]>());

  useEffect(() => {
    let alive = true;
    careerData.getScholarships().then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/(tabs)/explore/pathways" as any);
          }}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: colors.accent }]}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.eyebrow, { color: colors.textMuted }]}>
        OPPORTUNITIES
      </Text>
      <Text style={[styles.title, { color: colors.text }]}>Scholarships</Text>
      <Text style={[styles.subtitle, { color: colors.textSoft }]}>
        🎓 A secondary, supporting feature — funding routes alongside the main
        opportunities.
      </Text>

      <View style={{ marginTop: Spacing.md }}>
        <DataStateView
          state={state}
          empty={(d) => d.length === 0}
          emptyTitle="No scholarships yet"
        >
          {(scholarships) => (
            <View style={{ gap: Spacing.md }}>
              {scholarships.map((s) => (
                <ScholarshipCard
                  key={s.id}
                  name={s.name}
                  funded={s.funded}
                  level={s.level}
                  destination={s.destination}
                  opensLabel={s.opensLabel}
                  onRemind={() => {}}
                />
              ))}
            </View>
          )}
        </DataStateView>
      </View>
    </ScrollView>
  );
}

export default ScholarshipsScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { paddingVertical: 4, minHeight: 44, justifyContent: "center" },
  backText: { fontSize: FontSize.md, fontWeight: "700" },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: Spacing.xs,
  },
});
