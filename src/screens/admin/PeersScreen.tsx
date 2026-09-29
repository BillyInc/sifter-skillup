/**
 * PeersScreen — peer-institution domain-coverage benchmark. Reads
 * adminData.getPeerComparison and renders PeerComparisonChart.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";
import {
  useTheme,
  Spacing,
  FontSize,
  CompassFonts,
  webContainer,
} from "@/theme";
import { adminData } from "@/lib/adminData";
import type { DataState } from "../../types/career";
import type { PeerInstitutionRow } from "../../types/institution";
import type { PeerProgrammeComparison } from "../../types/institution";
import { getEducatorProfile } from "@/lib/educatorProfile";
import { useAuth } from "@/hooks/useAuth";
import { AdminShell } from "./AdminShell";
import { ComingSoonPanel } from "./ComingSoonPanel";

export function PeersScreen() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [peers, setPeers] = useState<DataState<PeerInstitutionRow[]>>({
    status: "pending",
    data: null,
  });
  const [organizationType, setOrganizationType] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string | undefined>();
  const [leftId, setLeftId] = useState("");
  const [rightId, setRightId] = useState("");
  const [comparison, setComparison] = useState<DataState<PeerProgrammeComparison>>({ status: "pending", data: null });

  useEffect(() => {
    let active = true;
    (async () => {
      const [p, profile] = await Promise.all([
        adminData.getPeerComparison(),
        getEducatorProfile(user?.id),
      ]);
      if (!active) return;
      setPeers(p);
      setOrganizationType(profile?.organizationType ?? null);
      setOrganizationId(profile?.organizationId);
      const options = p.status === "real" ? (p.data ?? []).filter((row) => !row.isSelf) : [];
      if (profile?.organizationType === "university") setRightId(options[0]?.institutionId ?? "");
      else {
        setLeftId(options[0]?.institutionId ?? "");
        setRightId(options[1]?.institutionId ?? "");
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  useEffect(() => {
    const left = organizationType === "university" ? organizationId : leftId;
    if (!left || !rightId || left === rightId) {
      setComparison({ status: "pending", data: null });
      return;
    }
    let active = true;
    setComparison({ status: "pending", data: null });
    adminData.getPeerProgrammeComparison(rightId, organizationType === "university" ? undefined : left).then((state) => {
      if (active) setComparison(state);
    });
    return () => { active = false; };
  }, [organizationId, organizationType, leftId, rightId]);

  const peerRows = peers.status === "real" ? (peers.data ?? []).filter((row) => !row.isSelf && row.institutionId) : [];

  return (
    <AdminShell title="Peer Comparison" eyebrow="Aggregate intelligence">
      <ScrollView
        style={{ flex: 1, backgroundColor: colors.bg }}
        contentContainerStyle={[styles.scroll, webContainer as object]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, CompassFonts.displayBold, { color: colors.text }]}>
            Compare university programmes
          </Text>
          <Text style={[styles.lede, { color: colors.textMuted }]}>
            {organizationType === "university"
              ? "Compare your university's own JAMB offerings with another university."
              : "Choose any two universities to compare their JAMB programme offerings and curriculum reach."} Counts describe mapped domain, specialization and role reach—not labour-market demand.
          </Text>
          {peers.status !== "real" ? <ComingSoonPanel state={peers} empty={() => false} emptyTitle="Universities unavailable" emptyBody="University comparisons are not available yet.">{() => null}</ComingSoonPanel> : null}
          {organizationType !== "university" ? <UniversityPicker label="Compare first" value={leftId} peers={peerRows} onSelect={setLeftId} /> : null}
          <UniversityPicker label={organizationType === "university" ? "Compare your university with" : "Compare against"} value={rightId} peers={peerRows} onSelect={setRightId} />
          <PortfolioComparison state={comparison} />
        </View>
      </ScrollView>
    </AdminShell>
  );
}

function UniversityPicker({ label, value, peers, onSelect }: { label: string; value: string; peers: PeerInstitutionRow[]; onSelect: (value: string) => void }) {
  const { colors } = useTheme();
  const [query, setQuery] = useState("");
  const options = peers.filter((peer) => peer.institutionName.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).slice(0, 8);
  return <View style={styles.picker}>
    <Text style={[styles.label, CompassFonts.bodyBold, { color: colors.text }]}>{label}</Text>
    <TextInput accessibilityLabel={label} value={query} onChangeText={setQuery} placeholder="Search all universities" placeholderTextColor={colors.textMuted} style={[styles.search, { borderColor: colors.border, color: colors.text }]} />
    {options.map((peer) => <TouchableOpacity key={peer.institutionId} accessibilityRole="radio" accessibilityState={{ selected: value === peer.institutionId }} onPress={() => onSelect(peer.institutionId)} style={[styles.option, { borderColor: value === peer.institutionId ? colors.accent : colors.border }]}>
      <Text style={[styles.optionText, { color: colors.text }]}>{value === peer.institutionId ? "✓  " : "○  "}{peer.institutionName}</Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>{peer.programmesAccessible} programmes · {peer.domainsAccessible} domains · {peer.specializationsAccessible} specializations · {peer.rolesAccessible} roles</Text>
    </TouchableOpacity>)}
    {peers.length > 8 ? <Text style={[styles.meta, { color: colors.textMuted }]}>Enter more of the name to narrow the results.</Text> : null}
  </View>;
}

function PortfolioComparison({ state }: { state: DataState<PeerProgrammeComparison> }) {
  const { colors } = useTheme();
  if (state.status !== "real" || !state.data) return <Text style={[styles.meta, { color: colors.textMuted }]}>{state.status === "pending" ? "Choose universities to load their offering comparison." : "The offering comparison could not be loaded."}</Text>;
  const data = state.data;
  return <View style={[styles.result, { borderColor: colors.border, backgroundColor: colors.card }]}>
    <Text style={[styles.resultTitle, CompassFonts.bodyBold, { color: colors.text }]}>{data.programmesPeerTeachesNotCurrent.length} programmes listed by {data.peer.institutionName} but not by {data.current.institutionName}</Text>
    <Text style={[styles.meta, { color: colors.textMuted }]}>{data.current.institutionName}: {data.current.programmesAccessible} programmes · {data.current.domainsAccessible} domains · {data.current.specializationsAccessible} specializations · {data.current.rolesAccessible} roles</Text>
    <Text style={[styles.meta, { color: colors.textMuted }]}>{data.peer.institutionName}: {data.peer.programmesAccessible} programmes · {data.peer.domainsAccessible} domains · {data.peer.specializationsAccessible} specializations · {data.peer.rolesAccessible} roles</Text>
    {data.programmesPeerTeachesNotCurrent.map((row) => <View key={row.offeringId ?? row.jambProgrammeId} style={[styles.difference, { borderTopColor: colors.border }]}>
      <Text style={[styles.optionText, { color: colors.text }]}>{row.programmeName}</Text>
      <Text style={[styles.meta, { color: colors.textMuted }]}>{row.jambFaculty ? `JAMB faculty: ${row.jambFaculty} · ` : ""}{row.domainsAccessible} domains · {row.specializationsAccessible} specializations · {row.rolesAccessible} roles{row.curriculumAnchor === "unmapped" ? " · No CCMAS anchor" : ""}</Text>
    </View>)}
    <Text style={[styles.resultTitle, { color: colors.text }]}>Market demand: Coming soon</Text>
    <Text style={[styles.meta, { color: colors.textMuted }]}>{data.demandNote} Reach counts do not indicate demand.</Text>
  </View>;
}

export default PeersScreen;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xl,
    flexGrow: 1,
  },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: FontSize.lg },
  lede: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  picker: { gap: Spacing.sm },
  label: { fontSize: FontSize.sm },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  option: { borderWidth: 1, borderRadius: 10, padding: Spacing.sm, gap: 4 },
  optionText: { fontSize: FontSize.sm, fontWeight: "700" },
  meta: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5 },
  result: { borderWidth: 1, borderRadius: 12, padding: Spacing.md, gap: Spacing.sm },
  resultTitle: { fontSize: FontSize.sm, fontWeight: "800" },
  difference: { borderTopWidth: StyleSheet.hairlineWidth, paddingTop: Spacing.sm, gap: 3 },
});
