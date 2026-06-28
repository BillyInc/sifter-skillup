/**
 * DomainDetailScreen — a single domain: its domain-level bridge skills (entry
 * conditions) and the roles within it (Match/Adjacent, ordered by in-demand).
 *
 * Roles route to the Role detail screen. Skills use the two-layer SkillsBridge
 * (domain layer here; the role layer appears on the role screen). Data comes
 * from careerData.getDomain — `coming_soon` until imported, rendered gracefully
 * by DetailScaffold.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useTheme, Spacing, FontSize } from "../../theme";
import { careerData } from "../../lib/careerData";
import { exploreNav } from "../../lib/exploreNav";
import { comingSoon, type DataState, type Domain } from "../../types/career";
import {
  DetailScaffold,
  SkillsBridge,
  RoleCard,
  RoleTypeFilter,
  NotesWidget,
  LevelUpCTA,
  type RoleTypeFilterValue,
} from "../../components/careerIntelligence";

export interface DomainDetailScreenProps {
  domainId: string;
}

export function DomainDetailScreen({ domainId }: DomainDetailScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const [state, setState] = useState<DataState<Domain>>(comingSoon<Domain>());
  const [filter, setFilter] = useState<RoleTypeFilterValue>("all");

  useEffect(() => {
    let alive = true;
    careerData.getDomain(domainId).then((res) => {
      if (alive) setState(res);
    });
    return () => {
      alive = false;
    };
  }, [domainId]);

  return (
    <DetailScaffold
      eyebrow="DOMAIN"
      title={state.data?.name ?? "Domain"}
      save={{ entityType: "domain", entityId: domainId }}
      pdf
      state={state}
    >
      {(domain) => {
        const roles = (domain.roles ?? [])
          .filter((r) => (filter === "all" ? true : r.match === filter))
          .slice()
          .sort((a, b) => (b.inDemandScore ?? 0) - (a.inDemandScore ?? 0));

        return (
          <View style={{ gap: Spacing.lg }}>
            {domain.description ? (
              <Text style={[styles.body, { color: colors.textSoft }]}>
                {domain.description}
              </Text>
            ) : null}

            {/* Domain-level bridge skills (entry conditions) */}
            <SkillsBridge
              domainBridgeSkills={domain.domainBridgeSkills ?? []}
              conceptualPrerequisites={domain.conceptualPrerequisites}
            />

            {/* Roles within the domain */}
            <View style={{ gap: Spacing.sm }}>
              <Text style={[styles.section, { color: colors.text }]}>
                Roles in this domain
              </Text>
              <RoleTypeFilter value={filter} onChange={setFilter} />
              {roles.length === 0 ? (
                <Text style={[styles.muted, { color: colors.textMuted }]}>
                  No roles for this filter.
                </Text>
              ) : (
                roles.map((r) => (
                  <RoleCard
                    key={r.id}
                    id={r.id}
                    name={r.name}
                    alsoKnownAs={r.alsoKnownAs}
                    match={r.match}
                    coverageRatio={r.coverageRatio}
                    inDemandScore={r.inDemandScore}
                    eliteFlag={r.eliteFlag}
                    onPress={() => exploreNav.role(router, r.id)}
                  />
                ))
              )}
            </View>

            {/* Personal notes */}
            <NotesWidget entityType="domain" entityId={domainId} />

            <LevelUpCTA />
          </View>
        );
      }}
    </DetailScaffold>
  );
}

export default DomainDetailScreen;

const styles = StyleSheet.create({
  body: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  section: { fontSize: FontSize.lg, fontWeight: "800" },
  muted: { fontSize: FontSize.sm },
});
