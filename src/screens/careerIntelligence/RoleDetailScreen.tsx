/**
 * RoleDetailScreen — the deep view for a single role within a matched domain
 * (CCMAS v3.0 Step 2). It surfaces the role's ESCO-coverage fit (Match/Adjacent),
 * what the role does, the role-level bridge skills the programme doesn't cover,
 * the career ladder, matched opportunities, personal notes, and a Level Up CTA.
 *
 * getRole / getOpportunities currently return `coming_soon` envelopes, so the
 * DetailScaffold body and the nested opportunities DataStateView both render
 * their graceful states; the populated branches below are what ship once the
 * NCE/CCMAS rows land — with no UI changes required.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  DetailScaffold,
  DataStateView,
  RoleMatchBadge,
  SkillsBridge,
  NotesWidget,
  LevelUpCTA,
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import {
  comingSoon,
  type DataState,
  type Role,
  type Opportunity,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  Brand,
  type ColorPalette,
} from "@/theme";

export interface RoleDetailScreenProps {
  roleId: string;
}

export function RoleDetailScreen({ roleId }: RoleDetailScreenProps) {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<Role>>(() =>
    comingSoon<Role>("Role detail is being populated."),
  );
  const [opps, setOpps] = useState<DataState<Opportunity[]>>(() =>
    comingSoon<Opportunity[]>("Internships & jobs are being populated."),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const [role, opportunities] = await Promise.all([
        careerData.getRole(roleId),
        careerData.getOpportunities({}),
      ]);
      if (!active) return;
      setState(role);
      setOpps(opportunities);
    })();
    return () => {
      active = false;
    };
  }, [roleId]);

  return (
    <DetailScaffold
      eyebrow="ROLE"
      title={state.data?.name ?? "Role"}
      save={{ entityType: "role", entityId: roleId }}
      pdf
      state={state}
    >
      {(data) => (
        <View style={styles.body}>
          <RoleMatchBadge
            match={data.match}
            coverageRatio={data.coverageRatio}
            elite={data.eliteFlag}
          />

          {data.alsoKnownAs?.length ? (
            <Text style={[styles.aka, { color: colors.textMuted }]}>
              Also known as: {data.alsoKnownAs.join(", ")}
            </Text>
          ) : null}

          {/* What this role does */}
          <View style={styles.section}>
            <SectionHeader title="What this role does" icon="🧭" />
            <Text style={[styles.paragraph, { color: colors.textSoft }]}>
              {data.description ??
                "A description of this role is being populated."}
            </Text>
          </View>

          {/* Role-level bridge skills */}
          <View style={styles.section}>
            <SectionHeader title="Skills to bridge" icon="🌉" />
            <SkillsBridge
              domainBridgeSkills={[]}
              roleBridgeSkills={data.roleBridgeSkills}
            />
          </View>

          {/* Career ladder */}
          {data.careerLadder?.length ? (
            <View style={styles.section}>
              <SectionHeader title="Career ladder" icon="📈" />
              <CareerLadder steps={data.careerLadder} colors={colors} />
            </View>
          ) : null}

          {/* Opportunities — own DataStateView so it degrades independently */}
          <View style={styles.section}>
            <SectionHeader title="Opportunities" icon="💼" />
            <DataStateView state={opps} empty={(list) => list.length === 0}>
              {(list) => (
                <View style={styles.oppList}>
                  {list.map((o) => (
                    <Text
                      key={o.id}
                      style={[styles.oppItem, { color: colors.text }]}
                    >
                      • {o.title} — {o.organisation.name}
                    </Text>
                  ))}
                </View>
              )}
            </DataStateView>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <NotesWidget entityType="role" entityId={roleId} />
          </View>

          <LevelUpCTA
            title="Build toward this role"
            body="Close the skill gap one level at a time — your path starts in your world."
          />
        </View>
      )}
    </DetailScaffold>
  );
}

/** Simple stepped list for the role's progression path. */
function CareerLadder({
  steps,
  colors,
}: {
  steps: string[];
  colors: ColorPalette;
}) {
  return (
    <View style={styles.ladder}>
      {steps.map((step, i) => (
        <View key={`${step}-${i}`} style={styles.ladderRow}>
          <View style={[styles.ladderDot, { backgroundColor: Brand.primary }]}>
            <Text style={styles.ladderNum}>{i + 1}</Text>
          </View>
          <Text style={[styles.ladderText, { color: colors.text }]}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default RoleDetailScreen;

const styles = StyleSheet.create({
  body: {
    gap: Spacing.xl,
  },
  aka: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  section: {
    gap: Spacing.sm,
  },
  paragraph: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  oppList: {
    gap: Spacing.xs,
  },
  oppItem: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  ladder: {
    gap: Spacing.sm,
  },
  ladderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.md,
  },
  ladderDot: {
    width: 24,
    height: 24,
    borderRadius: Radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  ladderNum: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.black,
    color: Brand.onPrimary,
  },
  ladderText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
