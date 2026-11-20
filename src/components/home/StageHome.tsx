/**
 * Stage-aware primary block for the student Home (blueprint sections 5-7).
 * Pure presentation: the screen decides the stage and supplies every href.
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, CompassFonts } from "../../theme";
import type {
  HomeStageInfo,
  HomeRoute,
  HomeConnectionGroup,
} from "../../lib/homeStage";

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
  /** Undergraduate only: the programme's existing domain links, by relationship. */
  connections?: HomeConnectionGroup[];
  onOpenDomain?: (domainId: string, matchType: string) => void;
  /** Opens the existing student Skills Matcher. */
  onOpenSkillsMatcher?: () => void;
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

      {stage.key === "undergraduate" && props.connections?.length ? (
        <ProgrammeConnections
          groups={props.connections}
          onOpenDomain={props.onOpenDomain}
        />
      ) : null}

      {props.onOpenSkillsMatcher ? (
        <SkillsMatcherCard onOpen={props.onOpenSkillsMatcher} />
      ) : null}
    </View>
  );
}

function ProgrammeConnections({
  groups,
  onOpenDomain,
}: {
  groups: HomeConnectionGroup[];
  onOpenDomain?: (domainId: string, matchType: string) => void;
}) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.primary,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
      ]}
      testID="home-connections"
    >
      <Text
        accessibilityRole="header"
        style={[
          styles.title,
          { color: colors.textRole.primary },
          CompassFonts.displayBold,
        ]}
      >
        Where your programme can take you
      </Text>
      <Text
        style={[
          styles.body,
          { color: colors.textRole.secondary },
          CompassFonts.body,
        ]}
      >
        The domains linked to your programme, grouped by how closely they
        connect. Choose one to see its roles.
      </Text>
      {groups.map((group) => (
        <View
          key={group.key}
          style={styles.tier}
          testID={`home-connections-${group.key}`}
        >
          <Text
            style={[
              styles.routeTitle,
              { color: colors.textRole.primary },
              CompassFonts.bodyBold,
            ]}
          >
            {group.title} · {group.domains.length}
          </Text>
          <Text
            style={[
              styles.body,
              { color: colors.textRole.muted },
              CompassFonts.body,
            ]}
          >
            {group.hint}
          </Text>
          <View style={styles.chips}>
            {group.domains.map((d) => (
              <TouchableOpacity
                key={d.domainId}
                accessibilityRole="button"
                accessibilityLabel={`${d.domainName}, ${group.title} link`}
                activeOpacity={0.85}
                onPress={() => onOpenDomain?.(d.domainId, group.key)}
                style={[
                  styles.chip,
                  {
                    borderColor: colors.borderRole.control,
                    backgroundColor: colors.surface.base,
                  },
                ]}
                testID={`home-domain-${d.domainId}`}
              >
                <Text
                  style={[
                    styles.chipText,
                    { color: colors.textRole.primary },
                    CompassFonts.bodyMedium,
                  ]}
                >
                  {d.domainName}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function SkillsMatcherCard({ onOpen }: { onOpen: () => void }) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Skills Matcher. See where your skills could connect to domains and roles."
      activeOpacity={0.88}
      onPress={onOpen}
      style={[
        styles.route,
        {
          backgroundColor: colors.surface.raised,
          borderColor: colors.borderRole.subtle,
        },
      ]}
      testID="home-skills-matcher"
    >
      <Feather name="compass" size={22} color={colors.accentRole.action} />
      <View style={{ flex: 1, gap: 2 }}>
        <Text
          style={[
            styles.eyebrow,
            { color: colors.accentRole.action },
            CompassFonts.bodyBold,
          ]}
        >
          Skills Matcher
        </Text>
        <Text
          style={[
            styles.routeTitle,
            { color: colors.textRole.primary },
            CompassFonts.bodyBold,
          ]}
        >
          Start from what you can do
        </Text>
        <Text
          style={[
            styles.body,
            { color: colors.textRole.muted },
            CompassFonts.body,
          ]}
        >
          Add skills you have or want to learn and see the domains and roles
          they could connect to.
        </Text>
      </View>
      <Feather name="arrow-right" size={18} color={colors.textRole.muted} />
    </TouchableOpacity>
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
  tier: { gap: 4, marginTop: Spacing.xs },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: {
    minHeight: 44,
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
  },
  chipText: { fontSize: FontSize.sm },
});
