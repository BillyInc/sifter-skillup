/**
 * ApplicationWindowsScreen — the Opportunities list of upcoming application
 * windows and deadlines.
 *
 * Phase 10 redesign: editorial header, responsive card grid, all legacy
 * tokens migrated.
 */
import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, FontSize, CompassFonts } from "@/theme";
import { careerData } from "@/lib/careerData";
import { useResponsive } from "@/hooks/useResponsive";
import {
  pending,
  type DataState,
  type ApplicationWindow,
} from "@/types/career";
import {
  DataStateView,
  ApplicationWindowCard,
  SubscribeButton,
} from "@/components/careerIntelligence";
import CareerDisclaimer from "@/components/careerIntelligence/CareerDisclaimer";

export function ApplicationWindowsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const resp = useResponsive();
  const [state, setState] =
    useState<DataState<ApplicationWindow[]>>(pending<ApplicationWindow[]>("Loading application windows..."));

  const loadWindows = useCallback(() => {
    setState(pending<ApplicationWindow[]>("Loading application windows..."));
    let alive = true;
    void careerData.getApplicationWindows().then((res) => {
      if (alive) setState(res);
    });
    return () => { alive = false; };
  }, []);

  useEffect(() => loadWindows(), [loadWindows]);

  const isGrid = (resp.isDesktop || resp.isTablet) && resp.isWeb;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={styles.scroll}
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
          <Feather name="arrow-left" size={16} color={colors.accentRole.action} style={{ marginRight: 4 }} />
          <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
            Back
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.hero}>
        <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
          OPPORTUNITIES
        </Text>
        <Text style={[styles.title, CompassFonts.displayBold, { color: colors.textRole.primary }]}>
          Application Windows
        </Text>
        <Text style={[styles.subtitle, { color: colors.textRole.secondary }]}>
          Upcoming openings and deadlines — don&apos;t miss these.
        </Text>
      </View>

      <DataStateView
        state={state}
        spinnerOnPending={!state.data}
        onRetry={loadWindows}
        empty={(d) => d.length === 0}
        emptyTitle="No upcoming windows"
      >
        {(windows) => (
          <View style={isGrid ? styles.cardGrid : { gap: Spacing.md }}>
            {windows.map((w) => (
              <View key={w.id} style={isGrid ? styles.cardWrap : undefined}>
                <View style={{ gap: Spacing.sm }}>
                  <ApplicationWindowCard
                    title={w.title}
                    status={w.status}
                    whenLabel={w.whenLabel}
                    onRemind={() => {}}
                  />
                  {w.opportunityId ? (
                    <SubscribeButton
                      target="application_window"
                      targetId={w.id}
                    />
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        )}
      </DataStateView>
      <CareerDisclaimer variant="footer" />
    </ScrollView>
  );
}

export default ApplicationWindowsScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  back: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    minHeight: 44,
    justifyContent: "center",
  },
  backText: { fontSize: FontSize.md },
  hero: { gap: 4 },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 0.9,
  },
  title: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: 2,
  },
  cardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  cardWrap: {
    flexBasis: 320,
    flexGrow: 1,
    minWidth: 280,
  },
});
