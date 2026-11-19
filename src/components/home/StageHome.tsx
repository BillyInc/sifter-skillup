/**
 * Stage-aware primary block for the student Home (blueprint sections 5-7).
 * Pure presentation: the screen decides the stage and supplies every href.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "../../theme";
import type { HomeStageInfo, HomeRoute } from "../../lib/homeStage";

export interface StageHomeProps {
  stage: HomeStageInfo;
  routes: HomeRoute[];
  /** "Because you selected ..." for the subject-based routes, when it exists. */
  subjectReason: string | null;
  /** Undergraduate only. */
  programme?: { university: string | null; programme: string | null };
  programmeHref?: string | null;
  onOpenRoute: (route: HomeRoute) => void;
  onOpenProgramme: () => void;
  onEditStage: () => void;
}

const HEADINGS: Record<HomeStageInfo["key"], { title: string; body: string }> =
  {
    early_secondary: {
      title: "Your future can start with what you study",
      body: "Explore programmes connected to your O-level subjects, or start with a programme you are curious about. Possible matches are a discovery aid, not an admission decision.",
    },
    admission: {
      title: "Ready to narrow down your options?",
      body: "Choose the route that best describes where you are now. You can change your answers at any time.",
    },
    undergraduate: {
      title: "Your programme",
      body: "See what your programme can connect to. Connections are possible routes, not guaranteed outcomes.",
    },
  };

export function StageHome(props: StageHomeProps) {
  const { colors } = useTheme();
  const { stage, routes } = props;
  const head = HEADINGS[stage.key];
  const card = {
    backgroundColor: colors.surface.raised,
    borderColor: colors.borderRole.subtle,
  };

  return (
    <View style={styles.wrap} testID="stage-home">
      <View style={[styles.stageStrip, card]}>
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.eyebrow,
              { color: colors.textRole.muted },
              CompassFonts.bodyBold,
            ]}
          >
            My learning stage
          </Text>
          <Text
            style={[
              styles.stageValue,
              { color: colors.textRole.primary },
              CompassFonts.displayBold,
            ]}
            testID="stage-label"
          >
            {stage.label}
          </Text>
        </View>
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel="Edit my learning stage"
          activeOpacity={0.7}
          onPress={props.onEditStage}
          style={styles.edit}
          testID="stage-edit"
        >
          <Text
            style={[
              styles.editText,
              { color: colors.accentRole.action },
              CompassFonts.bodyBold,
            ]}
          >
            Edit
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.primary, card]}>
        <Text
          style={[
            styles.title,
            { color: colors.textRole.primary },
            CompassFonts.displayBold,
          ]}
        >
          {head.title}
        </Text>
        <Text
          style={[
            styles.body,
            { color: colors.textRole.secondary },
            CompassFonts.body,
          ]}
        >
          {head.body}
        </Text>

        {stage.key === "undergraduate" ? (
          <UndergraduateProgramme {...props} />
        ) : (
          <View
            style={[
              styles.routes,
              stage.key === "early_secondary" && styles.routesRow,
            ]}
          >
            {routes.map((route, i) => {
              const reason =
                route.mode === "subjects" ? props.subjectReason : null;
              return (
                <TouchableOpacity
                  key={route.key}
                  accessibilityRole="button"
                  accessibilityLabel={route.title}
                  activeOpacity={0.85}
                  onPress={() => props.onOpenRoute(route)}
                  style={[
                    styles.route,
                    {
                      borderColor: colors.borderRole.subtle,
                      backgroundColor: colors.surface.base,
                    },
                  ]}
                  testID={`home-route-${route.key}`}
                >
                  {stage.key === "admission" ? (
                    <Text
                      style={[
                        styles.routeNum,
                        { color: colors.accentRole.action },
                        CompassFonts.displayBold,
                      ]}
                    >
                      {i + 1}
                    </Text>
                  ) : null}
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text
                      style={[
                        styles.routeTitle,
                        { color: colors.textRole.primary },
                        CompassFonts.bodyBold,
                      ]}
                    >
                      {route.title}
                    </Text>
                    <Text
                      style={[
                        styles.body,
                        { color: colors.textRole.muted },
                        CompassFonts.body,
                      ]}
                    >
                      {route.body}
                    </Text>
                    {reason ? (
                      <Text
                        style={[
                          styles.reason,
                          { color: colors.textRole.secondary },
                          CompassFonts.body,
                        ]}
                      >
                        {reason}
                      </Text>
                    ) : null}
                  </View>
                  <Feather
                    name="arrow-right"
                    size={18}
                    color={colors.textRole.muted}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>
    </View>
  );
}

function UndergraduateProgramme(props: StageHomeProps) {
  const { colors } = useTheme();
  const { programme, programmeHref } = props;
  const hasProgramme = Boolean(programme?.programme);
  return (
    <View style={styles.routes}>
      {hasProgramme ? (
        <Text
          style={[
            styles.routeTitle,
            { color: colors.textRole.primary },
            CompassFonts.bodyBold,
          ]}
          testID="home-programme"
        >
          {[programme?.university, programme?.programme]
            .filter(Boolean)
            .join(" · ")}
        </Text>
      ) : (
        <Text
          style={[
            styles.body,
            { color: colors.textRole.muted },
            CompassFonts.body,
          ]}
        >
          No programme is saved yet. Add your university and programme to see
          where it connects.
        </Text>
      )}
      <View style={styles.actions}>
        {hasProgramme && programmeHref ? (
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Open programme intelligence"
            activeOpacity={0.85}
            onPress={props.onOpenProgramme}
            style={[styles.cta, { backgroundColor: colors.accentRole.action }]}
            testID="home-open-programme"
          >
            <Text style={[styles.ctaText, CompassFonts.bodyBold]}>
              Open programme intelligence
            </Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity
          accessibilityRole="button"
          accessibilityLabel={
            hasProgramme ? "Edit details" : "Add programme details"
          }
          activeOpacity={0.7}
          onPress={props.onEditStage}
          style={styles.cardLink}
          testID="home-edit-programme"
        >
          <Text
            style={[
              styles.editText,
              { color: colors.accentRole.action },
              CompassFonts.bodyBold,
            ]}
          >
            {hasProgramme ? "Edit details" : "Add programme details"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.sm },
  stageStrip: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  eyebrow: {
    fontSize: FontSize.sm,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  stageValue: { fontSize: FontSize.lg },
  edit: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    minHeight: 44,
    paddingHorizontal: Spacing.sm,
  },
  editText: { fontSize: FontSize.sm },
  primary: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  title: { fontSize: FontSize.xl },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  routes: { gap: Spacing.sm },
  route: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    minHeight: 64,
  },
  routesRow: { flexDirection: "row", flexWrap: "wrap" },
  routeHalf: { flex: 1, flexBasis: 260, minWidth: 0 },
  routeNum: { fontSize: FontSize.xl, width: 24, textAlign: "center" },
  routeTitle: { fontSize: FontSize.md },
  reason: { fontSize: FontSize.sm, fontStyle: "italic" },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.md,
  },
  cta: {
    minHeight: 44,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    justifyContent: "center",
  },
  ctaText: { color: "#fff", fontSize: FontSize.sm },
  cardLink: { minHeight: 44, justifyContent: "center" },
});
