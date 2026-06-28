/**
 * OpportunityDetailScreen — the full detail for a single employment opportunity
 * (internship → contract). Scope is employment only; no NYSC/PPA, IT placement
 * or apprenticeship.
 *
 * Data comes from careerData.getOpportunity, which returns a `coming_soon`
 * envelope today, so DetailScaffold renders the graceful state automatically.
 * The populated body below — organisation row, badges, salary, window, visa,
 * eligibility, description, skills/certifications, Subscribe + Apply + Notes —
 * is what ships once the route is wired; the screen does not change.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { useRouter, type Router } from "expo-router";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  type ColorPalette,
} from "../../theme";
import { SifterButton } from "../../components/ui";
import { careerData } from "../../lib/careerData";
import { opportunitiesNav } from "../../lib/opportunitiesNav";
import {
  comingSoon,
  type DataState,
  type Opportunity,
  type OpportunityType,
  type OpportunityScope,
  type WorkMode,
  type InstitutionType,
} from "../../types/career";
import {
  DetailScaffold,
  SubscribeButton,
  NotesWidget,
} from "../../components/careerIntelligence";

export interface OpportunityDetailScreenProps {
  opportunityId: string;
}

const TYPE_LABEL: Record<OpportunityType, string> = {
  internship: "Internship",
  graduate_trainee: "Graduate Trainee",
  entry_level: "Entry-level",
  fellowship: "Fellowship",
  contract: "Contract",
};

const SCOPE_LABEL: Record<OpportunityScope, string> = {
  local: "🇳🇬 Local",
  global: "✈️ Global",
  remote: "💻 Remote",
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

/** Compact naira formatting: 45000 → ₦45k, 1200000 → ₦1.2m. */
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
  const [state, setState] = useState<DataState<Opportunity>>(() =>
    comingSoon<Opportunity>("This opportunity is being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getOpportunity(opportunityId);
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, [opportunityId]);

  return (
    <DetailScaffold
      eyebrow="OPPORTUNITY"
      title={state.data?.title ?? "Opportunity"}
      save={{ entityType: "opportunity", entityId: opportunityId }}
      pdf
      state={state}
    >
      {(data) => (
        <OpportunityBody
          data={data}
          opportunityId={opportunityId}
          router={router}
          colors={colors}
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
}: {
  data: Opportunity;
  opportunityId: string;
  router: Router;
  colors: ColorPalette;
}) {
  const salary = salaryLabel(data.salaryNgnMin, data.salaryNgnMax);
  const windowLabel =
    data.applicationWindow ?? data.applicationDeadline ?? null;

  const badges: string[] = [
    TYPE_LABEL[data.type],
    SCOPE_LABEL[data.scope],
    ...(data.workMode ? [WORK_MODE_LABEL[data.workMode]] : []),
  ];

  return (
    <View style={styles.body}>
      {/* Organisation row → organisation profile */}
      <TouchableOpacity
        onPress={() =>
          opportunitiesNav.organisation(router, data.organisation.id)
        }
        activeOpacity={0.85}
        accessibilityRole="button"
        style={[
          styles.orgRow,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={styles.orgRowText}>
          <Text style={[styles.orgName, { color: colors.text }]}>
            🏢 {data.organisation.name}
          </Text>
          {[data.organisation.sector, data.organisation.country]
            .filter(Boolean)
            .join(" · ") ? (
            <Text style={[styles.orgMeta, { color: colors.textSoft }]}>
              {[data.organisation.sector, data.organisation.country]
                .filter(Boolean)
                .join(" · ")}
            </Text>
          ) : null}
        </View>
        <Text style={[styles.orgChevron, { color: colors.accent }]}>→</Text>
      </TouchableOpacity>

      {/* Type / scope / work-mode badges */}
      <View style={styles.badgeRow}>
        {badges.map((label) => (
          <View
            key={label}
            style={[
              styles.badge,
              {
                backgroundColor: colors.bgSecondary,
                borderColor: colors.border,
              },
            ]}
          >
            <Text style={[styles.badgeText, { color: colors.textSoft }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      {/* Key facts */}
      <View style={styles.facts}>
        {salary ? (
          <Fact icon="💰" label={`${salary} / month`} colors={colors} strong />
        ) : null}
        {windowLabel ? (
          <Fact icon="🗓️" label={windowLabel} colors={colors} />
        ) : null}
        {data.visaRoute ? (
          <Fact icon="🛂" label={data.visaRoute} colors={colors} />
        ) : null}
      </View>

      {/* Eligibility */}
      {data.eligibleInstitutionTypes.length ? (
        <Section title="Who can apply" colors={colors}>
          <View style={styles.chipRow}>
            {data.eligibleInstitutionTypes.map((t) => (
              <View
                key={t}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.textMuted }]}>
                  {INSTITUTION_LABEL[t]}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {/* Description */}
      {data.description ? (
        <Section title="About this role" colors={colors}>
          <Text style={[styles.paragraph, { color: colors.textSoft }]}>
            {data.description}
          </Text>
        </Section>
      ) : null}

      {/* Skills */}
      {data.skills && data.skills.length ? (
        <Section title="Skills" colors={colors}>
          <View style={styles.chipRow}>
            {data.skills.map((s) => (
              <View
                key={s}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.accentSoft,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.text }]}>
                  {s}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {/* Certifications */}
      {data.certifications && data.certifications.length ? (
        <Section title="Certifications" colors={colors}>
          <View style={styles.chipRow}>
            {data.certifications.map((c) => (
              <View
                key={c}
                style={[
                  styles.chip,
                  {
                    backgroundColor: colors.bgSecondary,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: colors.textMuted }]}>
                  {c}
                </Text>
              </View>
            ))}
          </View>
        </Section>
      ) : null}

      {/* Actions */}
      <View style={styles.actions}>
        <SubscribeButton target="opportunity" targetId={opportunityId} />
        {data.careersUrl ? (
          <SifterButton
            label="Apply"
            icon="🚀"
            variant="primary"
            size="md"
            fullWidth={false}
            onPress={() => {
              const url = data.careersUrl;
              if (url) Linking.openURL(url).catch(() => {});
            }}
          />
        ) : null}
      </View>

      {/* Notes */}
      <NotesWidget entityType="opportunity" entityId={opportunityId} />
    </View>
  );
}

function Section({
  title,
  colors,
  children,
}: {
  title: string;
  colors: ColorPalette;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      {children}
    </View>
  );
}

function Fact({
  icon,
  label,
  colors,
  strong,
}: {
  icon: string;
  label: string;
  colors: ColorPalette;
  strong?: boolean;
}) {
  return (
    <Text
      style={[styles.fact, { color: strong ? colors.text : colors.textSoft }]}
    >
      {icon} {label}
    </Text>
  );
}

export default OpportunityDetailScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.lg },
  orgRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    minHeight: 44,
  },
  orgRowText: { flex: 1, gap: 2 },
  orgName: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
  orgMeta: { fontSize: FontSize.sm, fontWeight: FontWeight.medium },
  orgChevron: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  badge: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  facts: { gap: Spacing.xs },
  fact: { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  section: { gap: Spacing.sm },
  sectionTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.heavy },
  paragraph: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.2,
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: Spacing.md,
  },
});
