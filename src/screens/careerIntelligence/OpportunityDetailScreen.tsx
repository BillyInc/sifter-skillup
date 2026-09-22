/**
 * OpportunityDetailScreen — the full detail for a single employment opportunity.
 *
 * Phase 10 redesign: editorial layout, Feather icons (no emoji), semantic
 * tokens, CompassFonts, responsive layout.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { useRouter, type Router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  CompassFonts,
  type ColorPalette,
} from "@/theme";
import { careerData } from "@/lib/careerData";
import { opportunitiesNav } from "@/lib/opportunitiesNav";
import { useResponsive } from "@/hooks/useResponsive";
import { ExternalLinkGuard } from "@/components/careerIntelligence";
import {
  comingSoon,
  type DataState,
  type Opportunity,
  type OpportunityType,
  type OpportunityScope,
  type WorkMode,
  type InstitutionType,
} from "@/types/career";
import {
  DetailScaffold,
  SubscribeButton,
  NotesWidget,
} from "@/components/careerIntelligence";

export interface OpportunityDetailScreenProps {
  opportunityId: string;
}

const TYPE_LABEL: Record<OpportunityType, string> = {
  internship: "Internship",
  graduate_trainee: "Graduate Trainee",
  entry_level: "Entry-level",
  fellowship: "Fellowship",
  contract: "Contract",
  scholarship: "Scholarship",
};

const WORK_MODE_LABEL: Record<WorkMode, string> = {
  onsite: "On-site",
  hybrid: "Hybrid",
  remote: "Remote",
  field: "Field",
  shift: "Shift",
};

const INSTITUTION_LABEL: Record<InstitutionType, string> = {
  university: "University",
  college_of_education: "NCE",
  polytechnic: "Polytechnic",
  monotechnic: "Monotechnic",
  college_of_health: "College of Health",
  technical_college: "Technical College",
};

function formatNgn(value: number): string {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `₦${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}m`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `₦${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `₦${value}`;
}

function salaryLabel(min?: number, max?: number): string | null {
  if (min != null && max != null) return `${formatNgn(min)}–${formatNgn(max)}`;
  if (min != null) return `${formatNgn(min)}+`;
  if (max != null) return `Up to ${formatNgn(max)}`;
  return null;
}

export function OpportunityDetailScreen({
  opportunityId,
}: OpportunityDetailScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const resp = useResponsive();
  const isDesktop = resp.isDesktop && resp.isWeb;
  const [state, setState] = useState<DataState<Opportunity>>(() =>
    comingSoon<Opportunity>("This opportunity is being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOpportunity(opportunityId);
      if (active) setState(result);
    })();
    return () => { active = false; };
  }, [opportunityId]);

  return (
    <DetailScaffold
      eyebrow="OPPORTUNITY"
      title={state.data?.title ?? "Opportunity"}
      save={{ entityType: "opportunity", entityId: opportunityId }}
      state={state}
    >
      {(data) => (
        <OpportunityBody
          data={data}
          opportunityId={opportunityId}
          router={router}
          colors={colors}
          resp={resp}
          isDesktop={isDesktop}
        />
      )}
    </DetailScaffold>
  );
}

function OpportunityBody({
  data,
  opportunityId,
  router,
  colors,
  resp,
  isDesktop,
}: {
  data: Opportunity;
  opportunityId: string;
  router: Router;
  colors: ColorPalette;
  resp: ReturnType<typeof useResponsive>;
  isDesktop: boolean;
}) {
  const salary = salaryLabel(data.salaryNgnMin, data.salaryNgnMax);
  const windowLabel =
    data.applicationWindow ?? data.applicationDeadline ?? null;

  const badges: string[] = [
    TYPE_LABEL[data.type],
    data.scope === "local" ? "Nigeria" : data.scope === "global" ? "Global" : "Remote",
    ...(data.workMode ? [WORK_MODE_LABEL[data.workMode]] : []),
  ];

  const orgContent = (
    <TouchableOpacity
      onPress={() => opportunitiesNav.organisation(router, data.organisation.id)}
      activeOpacity={0.85}
      style={[styles.orgRow, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}
    >
      <View style={styles.orgIcon}>
        <Feather name="briefcase" size={20} color={colors.accentRole.action} />
      </View>
      <View style={styles.orgRowText}>
        <Text style={[styles.orgName, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
          {data.organisation.name}
        </Text>
        {[data.organisation.sector, data.organisation.country].filter(Boolean).join(" · ") ? (
          <Text style={[styles.orgMeta, { color: colors.textRole.secondary }]}>
            {[data.organisation.sector, data.organisation.country].filter(Boolean).join(" · ")}
          </Text>
        ) : null}
      </View>
      <Feather name="chevron-right" size={16} color={colors.textRole.muted} />
    </TouchableOpacity>
  );

  const factsContent = (
    <View style={styles.facts}>
      {salary ? (
        <View style={styles.factRow}>
          <Feather name="dollar-sign" size={14} color={colors.demand} />
          <Text style={[styles.fact, { color: colors.demand }, CompassFonts.data]}>
            {salary}
            <Text style={[CompassFonts.bodyMedium, { color: colors.textRole.muted }]}> / month</Text>
          </Text>
        </View>
      ) : null}
      {windowLabel ? (
        <View style={styles.factRow}>
          <Feather name="calendar" size={14} color={colors.textRole.secondary} />
          <Text style={[styles.fact, { color: colors.textRole.primary }]}>
            {windowLabel}
          </Text>
        </View>
      ) : null}
      {data.visaRoute ? (
        <View style={styles.factRow}>
          <Feather name="globe" size={14} color={colors.textRole.secondary} />
          <Text style={[styles.fact, { color: colors.textRole.secondary }]}>
            {data.visaRoute}
          </Text>
        </View>
      ) : null}
    </View>
  );

  const actionsContent = (
    <View style={styles.actions}>
      <SubscribeButton target="opportunity" targetId={opportunityId} />
      {data.careersUrl ? (
        <View style={[styles.applyBtn, { backgroundColor: colors.accentRole.action }]}>
          <Feather name="external-link" size={14} color="#fff" style={{ marginRight: Spacing.xs }} />
          <ExternalLinkGuard url={data.careersUrl} label="Apply" description="This opens the opportunity page recorded for this listing." textStyle={styles.applyBtnText} />
        </View>
      ) : null}
    </View>
  );

  const mainContent = (
    <>
      {/* Badges */}
      <View style={styles.badgeRow}>
        {badges.map((label) => (
          <View key={label} style={[styles.badge, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.badgeText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Eligibility */}
      {data.eligibleInstitutionTypes.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Who can apply
          </Text>
          <View style={styles.chipRow}>
            {data.eligibleInstitutionTypes.map((t) => (
              <View key={t} style={[styles.chip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
                  {INSTITUTION_LABEL[t]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Description */}
      {data.description ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            About this role
          </Text>
          <Text style={[styles.paragraph, { color: colors.textRole.secondary }]}>
            {data.description}
          </Text>
        </View>
      ) : null}

      {/* Skills */}
      {data.skills && data.skills.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Skills
          </Text>
          <View style={styles.chipRow}>
            {data.skills.map((s) => (
              <View key={s} style={[styles.chip, { backgroundColor: colors.accentSoft, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.accentRole.action }, CompassFonts.bodyMedium]}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      {/* Certifications */}
      {data.certifications && data.certifications.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Certifications
          </Text>
          <View style={styles.chipRow}>
            {data.certifications.map((c) => (
              <View key={c} style={[styles.chip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <NotesWidget entityType="opportunity" entityId={opportunityId} />
    </>
  );

  if (isDesktop) {
    return (
      <View style={styles.desktopRow}>
        <View style={styles.desktopSidebar}>
          <View style={[styles.sidebarSticky]}>
            {orgContent}
            {factsContent}
            {actionsContent}
          </View>
        </View>
        <View style={styles.desktopMain}>
          <View style={{ gap: Spacing.lg }}>
            {mainContent}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.body}>
      {orgContent}
      {/* Badges */}
      <View style={styles.badgeRow}>
        {badges.map((label) => (
          <View key={label} style={[styles.badge, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.badgeText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
              {label}
            </Text>
          </View>
        ))}
      </View>
      {factsContent}
      {/* Eligibility */}
      {data.eligibleInstitutionTypes.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Who can apply
          </Text>
          <View style={styles.chipRow}>
            {data.eligibleInstitutionTypes.map((t) => (
              <View key={t} style={[styles.chip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
                  {INSTITUTION_LABEL[t]}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {/* Description */}
      {data.description ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            About this role
          </Text>
          <Text style={[styles.paragraph, { color: colors.textRole.secondary }]}>
            {data.description}
          </Text>
        </View>
      ) : null}
      {/* Skills */}
      {data.skills && data.skills.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Skills
          </Text>
          <View style={styles.chipRow}>
            {data.skills.map((s) => (
              <View key={s} style={[styles.chip, { backgroundColor: colors.accentSoft, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.accentRole.action }, CompassFonts.bodyMedium]}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {/* Certifications */}
      {data.certifications && data.certifications.length ? (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>
            Certifications
          </Text>
          <View style={styles.chipRow}>
            {data.certifications.map((c) => (
              <View key={c} style={[styles.chip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
                <Text style={[styles.chipText, { color: colors.textRole.secondary }, CompassFonts.bodyMedium]}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}
      {actionsContent}
      <NotesWidget entityType="opportunity" entityId={opportunityId} />
    </View>
  );
}

export default OpportunityDetailScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.lg },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  orgIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  orgRowText: { flex: 1, gap: 2 },
  orgName: { fontSize: FontSize.lg },
  orgMeta: { fontSize: FontSize.sm },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  badge: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs },
  facts: { gap: Spacing.sm },
  factRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  fact: { fontSize: FontSize.md },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.md },
  paragraph: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.6 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  chipText: { fontSize: FontSize.xs, letterSpacing: 0.2 },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.md,
  },
  applyBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.sm,
  },
  applyBtnText: {
    color: "#fff",
    fontSize: FontSize.sm,
    fontFamily: "Inter_600SemiBold",
  },

  // ── Desktop layout ────────────────────────────────────────
  desktopRow: {
    flex: 1,
    flexDirection: "row",
    gap: Spacing.xxl,
  },
  desktopSidebar: {
    width: 280,
    flexShrink: 0,
  },
  sidebarSticky: {
    gap: Spacing.lg,
  },
  desktopMain: {
    flex: 1,
  },
});
