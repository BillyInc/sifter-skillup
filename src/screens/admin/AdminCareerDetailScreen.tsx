import React, { useEffect, useMemo, useState } from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { careerData } from "@/lib/careerData";
import type { DataState, DomainRoleV2, DomainV2, Programme } from "@/types/career";
import { AdminShell } from "./AdminShell";
import { CompassFonts, FontSize, Radius, Spacing, useTheme, webContainer } from "@/theme";

type Entity = "programme" | "domain" | "role";

function stateMessage<T>(state: DataState<T>): string {
  return state.meta?.notice ?? "This record is not available yet.";
}

function Provenance({ value }: { value: { sourceConfidence?: string; dataState?: string } }) {
  const { colors } = useTheme();
  const parts = [value.sourceConfidence, value.dataState].filter(Boolean);
  return parts.length ? (
    <Text style={[styles.provenance, { color: colors.textRole.muted }]}>Data state: {parts.join(" · ")}</Text>
  ) : null;
}

function Chips({ items, label }: { items: string[]; label: string }) {
  const { colors } = useTheme();
  if (!items.length) return null;
  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.fieldLabel, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>{label}</Text>
      <View style={styles.chips}>
        {items.map((item) => (
          <View key={item} style={[styles.chip, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.chipText, { color: colors.textRole.primary }]}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function AdminProgramme({ programme }: { programme: Programme }) {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <>
      <Text style={[styles.title, CompassFonts.displayBold, { color: colors.textRole.primary }]}>{programme.name}</Text>
      <Text style={[styles.caption, { color: colors.textRole.secondary }]}>Canonical programme record used to connect university teaching outcomes to the career taxonomy.</Text>
      {/* No <Provenance /> here. Programme carries neither sourceConfidence nor
          dataState — /api/career/programmes/{id} does not emit them, unlike the
          domain and role payloads — so the call could only ever render null,
          and tsc rejected it outright (TS2559, no properties in common).
          Restore it if and when the endpoint starts returning provenance. */}
      <View style={styles.card}>
        <Text style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>What the university programme teaches</Text>
        <Chips items={programme.skillsTechnical ?? []} label="Technical learning outcomes" />
        <Chips items={programme.skillsTransferable ?? []} label="Transferable learning outcomes" />
        {!programme.skillsTechnical?.length && !programme.skillsTransferable?.length ? (
          <Text style={[styles.caption, { color: colors.textRole.muted }]}>No programme learning-outcome profile is available in the current data.</Text>
        ) : null}
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Programme → domain mapping</Text>
        <Text style={[styles.caption, { color: colors.textRole.muted }]}>Mapping type is the relationship recorded in the current taxonomy. Open a domain to inspect its skills, tools, competencies and certifications.</Text>
        {programme.domains.length ? programme.domains.map((domain) => (
          <TouchableOpacity key={domain.domainId} onPress={() => router.push(`/(admin)/workspace-explore/domain/${encodeURIComponent(domain.domainId)}` as never)} style={[styles.row, { borderColor: colors.borderRole.subtle }]}>
            <View style={styles.rowBody}>
              <Text style={[styles.rowTitle, { color: colors.textRole.primary }]}>{domain.domainName}</Text>
              <Text style={[styles.caption, { color: colors.textRole.muted }]}>Relationship: {domain.matchType}</Text>
            </View>
            <Text style={[styles.action, { color: colors.accentRole.action }]}>Open</Text>
          </TouchableOpacity>
        )) : <Text style={[styles.caption, { color: colors.textRole.muted }]}>No domain mapping is available for this programme.</Text>}
      </View>
    </>
  );
}

function ResourceSummary({ tools, certifications }: { tools: string[]; certifications: string[] }) {
  return (
    <>
      <Chips items={tools} label="Tools" />
      <Chips items={certifications} label="Certifications" />
    </>
  );
}

function AdminDomain({ domain }: { domain: DomainV2 }) {
  const { colors } = useTheme();
  const router = useRouter();
  const rolesBySubgroup = useMemo(() => {
    const map = new Map<string, typeof domain.roles>();
    for (const role of domain.roles) {
      const key = role.subgroupId ?? "__unassigned";
      map.set(key, [...(map.get(key) ?? []), role]);
    }
    return map;
  }, [domain.roles]);
  return (
    <>
      <Text style={[styles.title, CompassFonts.displayBold, { color: colors.textRole.primary }]}>{domain.name}</Text>
      <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{domain.description ?? "Domain record with source-backed foundation, subgroup and role data."}</Text>
      <Provenance value={domain} />
      <View style={styles.card}>
        <Text style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Domain-level intelligence</Text>
        <Chips items={domain.foundationSkills.map((item) => `${item.skill} (${Math.round(item.prevalence * 100)}% of roles)`)} label="Foundation skills" />
        <ResourceSummary
          tools={[...(domain.tools.distinctive ?? []), ...(domain.tools.common ?? [])].map((item) => item.tool)}
          certifications={[...(domain.gatewayCertifications ?? []), ...(domain.roleHintCertifications ?? [])].map((item) => item.name)}
        />
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Subgroups and their roles</Text>
        {domain.subgroups.map((subgroup) => {
          const roles = rolesBySubgroup.get(subgroup.id) ?? [];
          return (
            <View key={subgroup.id} style={[styles.subgroup, { borderTopColor: colors.borderRole.subtle }]}>
              <Text style={[styles.subgroupTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{subgroup.name}</Text>
              {subgroup.description ? <Text style={[styles.caption, { color: colors.textRole.secondary }]}>{subgroup.description}</Text> : null}
              <Chips items={subgroup.clusterSkills} label="Subgroup skills" />
              <ResourceSummary
                tools={[...(subgroup.tools.distinctive ?? []), ...(subgroup.tools.common ?? [])].map((item) => item.tool)}
                certifications={(subgroup.certifications ?? []).map((item) => item.name)}
              />
              <Text style={[styles.fieldLabel, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>Roles in this subgroup</Text>
              {roles.length ? roles.map((role) => (
                <TouchableOpacity key={role.key} onPress={() => router.push(`/(admin)/workspace-explore/role/${encodeURIComponent(role.key)}` as never)} style={[styles.row, { borderColor: colors.borderRole.subtle }]}>
                  <View style={styles.rowBody}>
                    <Text style={[styles.rowTitle, { color: colors.textRole.primary }]}>{role.name}</Text>
                    <Text style={[styles.caption, { color: colors.textRole.muted }]}>{role.tier ?? "Tier not stated"} · open for role-owned skills and evidence</Text>
                  </View>
                  <Text style={[styles.action, { color: colors.accentRole.action }]}>Open</Text>
                </TouchableOpacity>
              )) : <Text style={[styles.caption, { color: colors.textRole.muted }]}>No role rows are attached to this subgroup.</Text>}
            </View>
          );
        })}
      </View>
    </>
  );
}

function AdminRole({ role }: { role: DomainRoleV2 }) {
  const { colors } = useTheme();
  return (
    <>
      <Text style={[styles.title, CompassFonts.displayBold, { color: colors.textRole.primary }]}>{role.name}</Text>
      <Text style={[styles.caption, { color: colors.textRole.secondary }]}>Role-level record. Skills, methods, tools and credentials below belong to this role; they are not inherited silently from the parent domain.</Text>
      <Provenance value={role} />
      <View style={styles.card}>
        <Chips items={role.essentialSkills ?? []} label="Essential skills" />
        <Chips items={role.optionalSkills ?? []} label="Optional skills" />
        <Chips items={(role.computationalMethods ?? []).map((item) => `${item.name} · ${item.classification} · ${item.competenceStatus}`)} label="Methods and competencies" />
        <ResourceSummary tools={(role.tools ?? []).map((item) => item.name)} certifications={(role.certifications ?? []).map((item) => item.name)} />
        <Chips items={(role.onetEssentialSkills ?? []).map((item) => `${item.elementName}${item.importance != null ? ` (${item.importance})` : ""}`)} label="O*NET essential-skill evidence" />
      </View>
      <View style={styles.card}>
        <Text style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>Domain and subgroup placement</Text>
        {role.appearsIn.map((item) => <Text key={`${item.domainId}-${item.roleKey}`} style={[styles.caption, { color: colors.textRole.secondary }]}>{item.domainName} · {item.domainId}</Text>)}
        {role.subgroupId ? <Text style={[styles.caption, { color: colors.textRole.secondary }]}>Subgroup ID: {role.subgroupId}</Text> : null}
      </View>
    </>
  );
}

export function AdminCareerDetailScreen({ entity, id }: { entity: Entity; id: string }) {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<Programme | DomainV2 | DomainRoleV2>>({ status: "pending", data: null });
  useEffect(() => {
    let active = true;
    const load = entity === "programme"
      ? careerData.getProgramme(id)
      : entity === "domain"
        ? careerData.getDomainV2(id)
        : careerData.getRoleV2(id);
    load.then((result) => { if (active) setState(result as DataState<Programme | DomainV2 | DomainRoleV2>); });
    return () => { active = false; };
  }, [entity, id]);

  return (
    <AdminShell title={`${entity[0].toUpperCase()}${entity.slice(1)} detail`} eyebrow="Structured Explore">
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={[styles.scroll, webContainer as object]}>
        <Text style={[styles.eyebrow, CompassFonts.bodySemibold, { color: colors.textRole.muted }]}>ADMIN CATALOGUE VIEW</Text>
        <Text style={[styles.caption, { color: colors.textRole.secondary }]}>Granular source-backed fields are shown for review. This is not the student guidance summary and it does not expose demand data.</Text>
        {state.status !== "real" || !state.data ? (
          <View style={[styles.card, { borderColor: colors.borderRole.subtle }]}><Text style={[styles.caption, { color: colors.textRole.muted }]}>{state.status === "pending" ? "Loading record…" : stateMessage(state)}</Text></View>
        ) : entity === "programme" ? <AdminProgramme programme={state.data as Programme} /> : entity === "domain" ? <AdminDomain domain={state.data as DomainV2} /> : <AdminRole role={state.data as DomainRoleV2} />}
      </ScrollView>
    </AdminShell>
  );
}

export default AdminCareerDetailScreen;

const styles = StyleSheet.create({
  scroll: { padding: Spacing.lg, gap: Spacing.lg, flexGrow: 1 },
  eyebrow: { fontSize: FontSize.xs, letterSpacing: 1 },
  title: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.2 },
  caption: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  provenance: { fontSize: FontSize.xs },
  card: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.md, padding: Spacing.lg, gap: Spacing.md },
  cardTitle: { fontSize: FontSize.md },
  fieldGroup: { gap: Spacing.xs },
  fieldLabel: { fontSize: FontSize.xs, letterSpacing: 0.4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: { borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  chipText: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.45 },
  row: { flexDirection: "row", alignItems: "center", gap: Spacing.md, borderWidth: StyleSheet.hairlineWidth, borderRadius: Radius.sm, padding: Spacing.sm },
  rowBody: { flex: 1, gap: 2 },
  rowTitle: { fontSize: FontSize.sm },
  action: { fontSize: FontSize.sm },
  subgroup: { gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.md },
  subgroupTitle: { fontSize: FontSize.md },
});
