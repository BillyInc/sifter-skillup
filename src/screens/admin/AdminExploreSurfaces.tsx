import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import ExploreScreen from "@/screens/ExploreScreen";
import { adminData } from "@/lib/adminData";
import { adminExploreStateMessage } from "@/lib/adminExploreState";
import { comingSoon } from "@/types/career";
import { useTheme, CompassFonts, FontSize, Radius, Spacing, webContainer } from "@/theme";
import type { DataState } from "@/types/career";
import type { EducatorProfile, InstitutionSummary, PeerInstitutionRow, PeerProgrammeComparison, ProgrammeSkillCoverage } from "@/types/institution";

function Notice({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  return <Text style={[styles.notice, { color: colors.textRole.muted }]}>{children}</Text>;
}

function AdminExploreCard({ title, body, children }: { title: string; body: string; children?: React.ReactNode }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.cardTitle, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{title}</Text>
      <Text style={[styles.body, { color: colors.textRole.secondary }]}>{body}</Text>
      {children}
    </View>
  );
}

function AdvisoryExploreIntro({ profile, provider }: { profile: EducatorProfile | null; provider: boolean }) {
  const name = profile?.organizationName?.trim();
  return (
    <View style={styles.introStack}>
      <AdminExploreCard
        title={name ? `Your ${provider ? "tutorial centre" : "school"}: ${name}` : provider ? "Your tutorial-centre workspace" : "Your school workspace"}
        body={provider
          ? "Browse and compare the national JAMB programme catalogue and published university offerings. Your centre's guidance is JAMB-focused; this view does not imply that the centre owns university curriculum."
          : "Browse and compare published JAMB programmes, university offerings and entry requirements. Your school can guide SS1, SS2 and SS3 learners; this catalogue is shared nationally."}
      >
        <View style={styles.capabilityRow}>
          <Capability title="Your workspace" value={provider ? "JAMB sessions" : "SS1 · SS2 · SS3"} />
          <Capability title="Catalogue access" value="All published programmes" />
          <Capability title="University options" value="Compare available offerings" />
        </View>
        <Notice>Organization features shown here are workspace capabilities, not student records. Individual student information remains consent-controlled.</Notice>
      </AdminExploreCard>
    </View>
  );
}

function Capability({ title, value }: { title: string; value: string }) {
  const { colors } = useTheme();
  return <View style={[styles.capability, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
    <Text style={[styles.capabilityTitle, { color: colors.textRole.muted }]}>{title}</Text>
    <Text style={[styles.capabilityValue, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{value}</Text>
  </View>;
}

export function SecondarySchoolExploreSurface({ profile, initialQuery = "" }: { profile: EducatorProfile | null; initialQuery?: string }) {
  const intro = <AdvisoryExploreIntro profile={profile} provider={false} />;
  return <ExploreScreen
    initialQuery={initialQuery}
    adminAudience="school"
    adminType="secondary_school"
    heading="Compare programmes and universities for SS1–SS3"
    intro={intro}
  />;
}

export function TutorialCentreExploreSurface({ profile, initialQuery = "" }: { profile: EducatorProfile | null; initialQuery?: string }) {
  const intro = <AdvisoryExploreIntro profile={profile} provider />;
  return <ExploreScreen
    initialQuery={initialQuery}
    adminAudience="school"
    adminType={profile?.organizationType ?? "tutorial_centre"}
    heading="Explore JAMB programmes and university options"
    intro={intro}
  />;
}

function stateNotice<T>(state: DataState<T>, loading: string, fallback: string): string | null {
  return adminExploreStateMessage(state, loading, fallback);
}

export function UniversityExploreSurface({ profile, initialQuery = "" }: { profile: EducatorProfile | null; initialQuery?: string }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [summary, setSummary] = useState<DataState<InstitutionSummary>>({ status: "pending", data: null });
  const [offerings, setOfferings] = useState<DataState<ProgrammeSkillCoverage[]>>({ status: "pending", data: null });
  const [peers, setPeers] = useState<DataState<PeerInstitutionRow[]>>({ status: "pending", data: null });
  const [query, setQuery] = useState(initialQuery.trim());
  const [peerQuery, setPeerQuery] = useState("");
  const [selectedPeerId, setSelectedPeerId] = useState("");
  const [comparison, setComparison] = useState<DataState<PeerProgrammeComparison>>({ status: "pending", data: null });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setSummary({ status: "pending", data: null });
    setOfferings({ status: "pending", data: null });
    setPeers({ status: "pending", data: null });
    Promise.all([adminData.getInstitutionSummary(), adminData.getProgrammeSkillCoverage(), adminData.getPeerComparison()])
      .then(([nextSummary, nextOfferings, nextPeers]) => {
        if (!active) return;
        setSummary(nextSummary);
        setOfferings(nextOfferings);
        setPeers(nextPeers);
        const firstPeer = nextPeers.status === "real"
          ? (nextPeers.data ?? []).find((row) => !row.isSelf)?.institutionId ?? ""
          : "";
        setSelectedPeerId((current) => current || firstPeer);
      })
      .catch(() => {
        if (!active) return;
        const notice = "The institution workspace could not be loaded. Check your connection and try again.";
        setSummary(comingSoon<InstitutionSummary>(notice));
        setOfferings(comingSoon<ProgrammeSkillCoverage[]>(notice));
        setPeers(comingSoon<PeerInstitutionRow[]>(notice));
      });
    return () => { active = false; };
  }, [reloadKey]);

  useEffect(() => {
    if (!selectedPeerId) {
      setComparison({ status: "pending", data: null });
      return;
    }
    let active = true;
    setComparison({ status: "pending", data: null });
    adminData.getPeerProgrammeComparison(selectedPeerId).then((next) => {
      if (active) setComparison(next);
    });
    return () => { active = false; };
  }, [selectedPeerId, reloadKey]);

  const offeringRows = offerings.status === "real" ? offerings.data ?? [] : [];
  const filteredOfferings = offeringRows.filter((row) =>
    `${row.jambProgrammeName ?? row.programmeName} ${row.jambFaculty ?? ""}`.toLowerCase().includes(query.toLowerCase()),
  );
  const stats = summary.status === "real" ? summary.data : null;
  const peerRows = peers.status === "real" ? peers.data ?? [] : [];
  const comparablePeers = peerRows.filter((peer) => !peer.isSelf && Boolean(peer.institutionId));
  const searchablePeers = comparablePeers.filter((peer) =>
    peer.institutionName.toLocaleLowerCase().includes(peerQuery.trim().toLocaleLowerCase()));
  const hasUnavailableData = [summary, offerings, peers].some((state) => state.status !== "real" && state.status !== "pending");

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.surface.base }} contentContainerStyle={[styles.page, webContainer as object]} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.accentRole.action }]}>UNIVERSITY WORKSPACE</Text>
        <Text style={[styles.title, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>Explore your programmes and compare your institution&apos;s position</Text>
        <Text style={[styles.body, { color: colors.textRole.secondary }]}>{profile?.organizationName ?? "Your institution"} view: institution-scoped offerings, curriculum coverage and aggregate peer context. This workspace is for university planning, not student guidance.</Text>
      </View>

      <AdminExploreCard title="Your institution at a glance" body="Only metrics returned for your institution are shown; no national or other-school totals are substituted.">
        {stats ? <View style={styles.capabilityRow}>
          <Capability title="Programmes recorded" value={stats.activeProgrammes.toLocaleString()} />
          <Capability title="Domains connected" value={stats.domainsAccessible.toLocaleString()} />
          {stats.facultyCount != null ? <Capability title="Faculties recorded" value={stats.facultyCount.toLocaleString()} /> : null}
        </View> : <Notice>{stateNotice(summary, "Loading your institution summary…", "Institution summary is not available yet.")}</Notice>}
      </AdminExploreCard>

      <AdminExploreCard title="Your JAMB programme offerings" body="Each row keeps this university's offering attached to its JAMB identity and faculty context. Shared CCMAS curriculum is supporting evidence, not a claim that every university teaches an identical curriculum.">
        <TextInputLike value={query} onChange={setQuery} placeholder="Search your programme offerings or faculty" />
        {offerings.status !== "real" ? <Notice>{stateNotice(offerings, "Loading your programme offerings…", "Your programme offering reports are not available yet.")}</Notice> : filteredOfferings.length ? filteredOfferings.map((row) => (
          <TouchableOpacity key={row.offeringId ?? `${row.jambProgrammeId}-${row.programmeId}`} accessibilityRole="button" onPress={() => router.push(`/(admin)/skills-gap?jamb_programme_id=${encodeURIComponent(row.jambProgrammeId ?? "")}` as never)} style={[styles.offeringRow, { borderColor: colors.borderRole.subtle }]}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>{row.jambProgrammeName ?? row.programmeName}</Text>
              <Text style={[styles.notice, { color: colors.textRole.muted }]}>{[row.jambFaculty, row.curriculumContractState === "available" ? "CCMAS curriculum available" : "Curriculum evidence unavailable", row.jambAnchorState === "unmapped" ? "No CCMAS anchor; external evidence needed" : null].filter(Boolean).join(" · ")}</Text>
              {row.domains.length ? <Text style={[styles.notice, { color: colors.textRole.secondary }]}>{row.domains.map((domain) => `${domain.matchType}: ${domain.domainName}`).join(" · ")}</Text> : null}
            </View>
            <Text style={[styles.link, { color: colors.accentRole.action }]}>Open report →</Text>
          </TouchableOpacity>
        )) : <Notice>{offeringRows.length ? "No offering matches this search." : "No JAMB offering rows are currently available for this institution. The national programme list is not used as a substitute."}</Notice>}
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/(admin)/skills-gap" as never)} style={styles.actionLink}><Text style={[styles.link, { color: colors.accentRole.action }]}>Open Programme Intelligence →</Text></TouchableOpacity>
      </AdminExploreCard>

      <AdminExploreCard title="Compare programme portfolios" body="Compare your university with another university. Programme differences use JAMB identities; reach counts describe connected curriculum fields and are not employment demand.">
        {peers.status !== "real" ? <Notice>{stateNotice(peers, "Loading peer comparisons…", "Peer comparison is not available yet.")}</Notice> : comparablePeers.length ? comparablePeers.map((peer) => <View key={peer.institutionId} style={[styles.peerRow, { borderColor: colors.borderRole.subtle }]}>
          <View style={{ flex: 1, gap: 2 }}><Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>{peer.institutionName}</Text>{peer.uniqueDomains?.length ? <Text style={[styles.notice, { color: colors.textRole.muted }]}>Fields your university reaches that this peer does not: {peer.uniqueDomains.join(", ")}</Text> : null}</View>
          <Text style={[styles.peerStat, CompassFonts.bodySemibold, { color: colors.textRole.secondary }]}>{peer.programmesAccessible} programmes · {peer.domainsAccessible} domains · {peer.specializationsAccessible} specializations · {peer.rolesAccessible} roles</Text>
        </View>) : <Notice>No university comparison records are available yet. No peer values are estimated.</Notice>}
        {peers.status === "real" && searchablePeers.length ? <View style={{ gap: Spacing.xs }}>
          <TextInputLike value={peerQuery} onChange={setPeerQuery} placeholder="Find a university to compare" />
          {searchablePeers.slice(0, 8).map((peer) => <TouchableOpacity
            key={peer.institutionId}
            accessibilityRole="radio"
            accessibilityState={{ selected: selectedPeerId === peer.institutionId }}
            onPress={() => setSelectedPeerId(peer.institutionId)}
            style={[styles.peerChoice, { borderColor: selectedPeerId === peer.institutionId ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}
          ><Text style={[styles.body, { color: colors.textRole.primary }]}>{selectedPeerId === peer.institutionId ? "✓  " : "○  "}{peer.institutionName}</Text></TouchableOpacity>)}
          {searchablePeers.length > 8 ? <Notice>Type more of the university name to narrow the list.</Notice> : null}
        </View> : null}
        {selectedPeerId ? <PeerPortfolioComparison state={comparison} /> : null}
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/(admin)/peers" as never)} style={styles.actionLink}><Text style={[styles.link, { color: colors.accentRole.action }]}>Open peer comparison →</Text></TouchableOpacity>
      </AdminExploreCard>

      {hasUnavailableData ? <TouchableOpacity accessibilityRole="button" onPress={() => setReloadKey((key) => key + 1)} style={styles.actionLink}>
        <Text style={[styles.link, { color: colors.accentRole.action }]}>Try loading this workspace again</Text>
      </TouchableOpacity> : null}

      <View style={styles.intelligenceLinks}>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/(admin)/skills-gap" as never)} style={[styles.navCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>Programme Intelligence</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>Review curriculum taught against sourced capabilities for each offering.</Text></TouchableOpacity>
        <TouchableOpacity accessibilityRole="button" onPress={() => router.push("/(admin)/market-intelligence" as never)} style={[styles.navCard, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.raised }]}><Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>Market Intelligence</Text><Text style={[styles.body, { color: colors.textRole.secondary }]}>Review sourced demand by domain, specialization and role; no programme curriculum appears here.</Text></TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function TextInputLike({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  const { colors } = useTheme();
  return <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={colors.textRole.muted} accessibilityLabel={placeholder} style={[styles.search, { backgroundColor: colors.surface.base, borderColor: colors.borderRole.subtle, color: colors.textRole.primary }]} />;
}

function PeerPortfolioComparison({ state }: { state: DataState<PeerProgrammeComparison> }) {
  const { colors } = useTheme();
  if (state.status !== "real" || !state.data) {
    return <Notice>{stateNotice(state, "Loading the offering-by-offering comparison…", "Offering comparison is not available yet. No figures have been estimated.")}</Notice>;
  }
  const comparison = state.data;
  const missing = comparison.programmesPeerTeachesNotCurrent;
  return <View style={[styles.comparisonPanel, { borderColor: colors.borderRole.subtle, backgroundColor: colors.surface.subtle }]}>
    <Text style={[styles.cardTitle, { color: colors.textRole.primary }]}>Portfolio difference: {comparison.peer.institutionName} vs {comparison.current.institutionName}</Text>
    <Text style={[styles.body, { color: colors.textRole.secondary }]}>{missing.length} programme{missing.length === 1 ? " is" : "s are"} listed for the peer university and not listed for your university.</Text>
    <View style={styles.capabilityRow}>
      <Capability title={comparison.current.institutionName} value={`${comparison.current.programmesAccessible} programmes · ${comparison.current.domainsAccessible} domains · ${comparison.current.specializationsAccessible} specializations · ${comparison.current.rolesAccessible} roles`} />
      <Capability title={comparison.peer.institutionName} value={`${comparison.peer.programmesAccessible} programmes · ${comparison.peer.domainsAccessible} domains · ${comparison.peer.specializationsAccessible} specializations · ${comparison.peer.rolesAccessible} roles`} />
    </View>
    {missing.length ? <View style={{ gap: Spacing.xs }}>
      <Text style={[styles.metaEmphasis, { color: colors.textRole.primary }]}>Programmes the peer lists but your university does not</Text>
      {missing.map((row) => <View key={`${row.offeringId ?? row.jambProgrammeId}-${row.jambProgrammeId}`} style={[styles.differenceRow, { borderColor: colors.borderRole.subtle }]}>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={[styles.body, CompassFonts.bodySemibold, { color: colors.textRole.primary }]}>{row.programmeName}</Text>
          <Text style={[styles.notice, { color: colors.textRole.muted }]}>{[row.jambFaculty ? `JAMB faculty: ${row.jambFaculty}` : null, row.curriculumAnchor === "mapped" ? "CCMAS anchor mapped" : "No CCMAS anchor"].filter(Boolean).join(" · ")}</Text>
        </View>
        <Text style={[styles.peerStat, { color: colors.textRole.secondary }]}>{row.domainsAccessible} domains · {row.specializationsAccessible} specializations · {row.rolesAccessible} roles</Text>
      </View>)}
    </View> : <Notice>The selected peer and your university list the same JAMB programme identities.</Notice>}
    <Text style={[styles.metaEmphasis, { color: colors.textRole.primary }]}>Market demand: Coming soon</Text>
    <Notice>{comparison.demandNote} Domain, specialization and role reach is structural curriculum coverage, not evidence of demand.</Notice>
  </View>;
}

const styles = StyleSheet.create({
  page: { width: "100%", maxWidth: 1180, alignSelf: "center", padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.huge },
  header: { gap: Spacing.sm, marginBottom: Spacing.xs },
  eyebrow: { fontSize: FontSize.xs, fontWeight: "800", letterSpacing: 1 },
  title: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.2, maxWidth: 850 },
  card: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.sm },
  cardTitle: { fontSize: FontSize.md, fontWeight: "800" },
  body: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  notice: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.55 },
  capabilityRow: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  capability: { minWidth: 150, flexGrow: 1, flexBasis: "30%", borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm, gap: 3 },
  capabilityTitle: { fontSize: FontSize.xs },
  capabilityValue: { fontSize: FontSize.sm },
  offeringRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.sm },
  peerRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.sm },
  peerChoice: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.sm },
  comparisonPanel: { borderWidth: 1, borderRadius: Radius.sm, padding: Spacing.md, gap: Spacing.sm },
  differenceRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm, borderTopWidth: StyleSheet.hairlineWidth, paddingVertical: Spacing.sm },
  metaEmphasis: { fontSize: FontSize.xs, fontWeight: "800" },
  peerStat: { fontSize: FontSize.xs, textAlign: "right" },
  search: { borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, fontSize: FontSize.sm },
  link: { fontSize: FontSize.xs, fontWeight: "800" },
  actionLink: { minHeight: 40, justifyContent: "center", alignSelf: "flex-start" },
  intelligenceLinks: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.sm },
  navCard: { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md, gap: Spacing.xs, flex: 1, minWidth: 240 },
  introStack: { gap: Spacing.sm },
});
