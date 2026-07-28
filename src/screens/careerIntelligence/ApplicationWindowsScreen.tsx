/**
 * ApplicationWindowsScreen — the Opportunities list of upcoming application
 * windows and deadlines.
 *
 * This is a LIST screen, so it ships its own inline back+header chrome
 * (mirroring DetailScaffold visually) and renders the body through
 * DataStateView. Semantic tokens + CompassFonts (BRIEF chrome).
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
import { useTheme, Spacing, FontSize, CompassFonts, webContainer } from "../../theme";
import { careerData } from "../../lib/careerData";
import {
  comingSoon,
  type DataState,
  type ApplicationWindow,
} from "../../types/career";
import {
  DataStateView,
  ApplicationWindowCard,
  SubscribeButton,
} from "../../components/careerIntelligence";

export function ApplicationWindowsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const [state, setState] =
    useState<DataState<ApplicationWindow[]>>(comingSoon<ApplicationWindow[]>());

  useEffect(() => {
    let alive = true;
    careerData.getApplicationWindows().then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
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
          <Text style={[styles.backText, { color: colors.accentRole.action }, CompassFonts.bodyBold]}>
            ← Back
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.eyebrow, { color: colors.textRole.muted }, CompassFonts.bodyBold]}>
        OPPORTUNITIES
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Application Windows
      </Text>
      <Text style={[styles.subtitle, { color: colors.textRole.secondary }, CompassFonts.body]}>
        Upcoming openings & deadlines — don't miss these.
      </Text>

      <View style={{ marginTop: Spacing.md }}>
        <DataStateView
          state={state}
          empty={(d) => d.length === 0}
          emptyTitle="No upcoming windows"
        >
          {(windows) => (
            <View style={{ gap: Spacing.md }}>
              {windows.map((w) => (
                <View key={w.id} style={{ gap: Spacing.sm }}>
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
              ))}
            </View>
          )}
        </DataStateView>
      </View>
    </ScrollView>
  );
}

export default ApplicationWindowsScreen;

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
  backText: { fontSize: FontSize.md },
  eyebrow: {
    fontSize: FontSize.xs,
    letterSpacing: 1,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.15,
  },
  subtitle: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
    marginTop: Spacing.xs,
  },
});
