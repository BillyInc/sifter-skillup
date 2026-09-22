/**
 * Pathways is the route-selection layer for the career graph.
 *
 * A qualification, credential, chartered route, or PhD is not a separate
 * product destination. It is requirement evidence attached to:
 * pathway user type → domain → subgroup → role.
 *
 * The old deep-link files remain compatibility wrappers, but they all mount
 * this screen and focus the relevant requirement lens inside Target path.
 * Existing account/user types are not changed by this pathway taxonomy.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DetailScaffold } from "@/components/careerIntelligence";
import CareerDisclaimer from "@/components/careerIntelligence/CareerDisclaimer";
import { EntrepreneurshipPathwayScreen } from "@/screens/careerIntelligence/EntrepreneurshipPathwayScreen";
import { careerData, type DomainClusterGroup } from "@/lib/careerData";
import { NIGERIAN_USER_TYPES, type NigerianUserTypeKey } from "@/lib/elitePathwayPolicy";
import {
  BRIDGE_LAYER_ORDER,
  comingSoon,
  type BridgePlan,
  type CareerChangeType,
  type CareerChangerPath,
  type DataState,
  type DomainRoleV2,
  type DomainV2,
  type ElitePathway,
  type ElitePathwaySummary,
} from "@/types/career";
import {
  CompassFonts,
  FontSize,
  FontWeight,
  Radius,
  Spacing,
  useTheme,
  type ColorPalette,
} from "@/theme";

export type PathwaySection = "overview" | "target" | "career-change" | "build";
export type PathwayRequirementFocus = "qualification" | "credentials" | "research" | "elite";

export interface PathwaysHubScreenProps {
  initialSection?: PathwaySection;
  /** Legacy deep links use this to load a selected elite destination. */
  pathwayId?: string;
  /** Legacy deep links focus a requirement lens, not a new screen. */
  requirementFocus?: PathwayRequirementFocus;
  entrepreneurshipContext?: { programmeName?: string; domainId?: string };
}

const SECTION_TABS: { key: PathwaySection; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "overview", label: "Overview", icon: "map" },
  { key: "target", label: "Target path", icon: "compass" },
  { key: "career-change", label: "Career change", icon: "repeat" },
  { key: "build", label: "Build a business", icon: "briefcase" },
];

const REQUIREMENT_FOCI: { key: PathwayRequirementFocus; label: string }[] = [
  { key: "qualification", label: "Qualifications & bridges" },
  { key: "credentials", label: "Credentials & chartered routes" },
  { key: "research", label: "PhD & research evidence" },
  { key: "elite", label: "Elite route evidence" },
];

const SIX_LAYER_COPY: Record<string, string> = {
  global_standard: "The destination standard and selection bar.",
  nigerian_qualification_map: "How the Nigerian starting qualification maps, without assuming equivalence.",
  bridge_inventory: "Top-ups, Direct Entry, ELR, credentials, experience, and other bridge options.",
  timeline_cost: "Cycle-labelled time and cost data; missing figures stay unverified.",
  employer_entry: "Named Nigerian entry institutions, employers, or routes into the field.",
  ownership_path: "Documented proof that the route has been walked; no invented success stories.",
};

const CAREER_CHANGE_TYPES: { key: CareerChangeType; label: string }[] = [
  { key: "job_switch", label: "Same field · new role" },
  { key: "adjacent_pivot", label: "Adjacent pivot" },
  { key: "significant_change", label: "Significant change" },
  { key: "forced_change", label: "Forced change" },
];

export function PathwaysHubScreen({
  initialSection = "overview",
  pathwayId,
  requirementFocus = "qualification",
  entrepreneurshipContext,
}: PathwaysHubScreenProps) {
  const { colors } = useTheme();
  const [section, setSection] = useState<PathwaySection>(initialSection);
  const [focus, setFocus] = useState<PathwayRequirementFocus>(requirementFocus);
  const [startingPoint, setStartingPoint] = useState(NIGERIAN_USER_TYPES[0]?.key ?? "ss3_jamb_candidate");
  const [domainClusters, setDomainClusters] = useState<DataState<DomainClusterGroup[]>>(() =>
    comingSoon<DomainClusterGroup[]>("Domain, subgroup, and role data is being added.")
  );
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [domainState, setDomainState] = useState<DataState<DomainV2>>(() =>
    comingSoon<DomainV2>("Select a domain to inspect its subgroups, roles, and route requirements.")
  );
  const [selectedSubgroupId, setSelectedSubgroupId] = useState<string | null>(null);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string | null>(null);
  const [roleState, setRoleState] = useState<DataState<DomainRoleV2> | null>(null);
  const [eliteState, setEliteState] = useState<DataState<ElitePathwaySummary[]>>(() =>
    comingSoon<ElitePathwaySummary[]>("Sourced elite route data is being added.")
  );
  const [eliteDetail, setEliteDetail] = useState<DataState<ElitePathway> | null>(null);
  const [bridgeState, setBridgeState] = useState<DataState<BridgePlan> | null>(null);
  const [careerState, setCareerState] = useState<DataState<CareerChangerPath[]>>(() =>
    comingSoon<CareerChangerPath[]>("Verified career-change route detail is being added.")
  );
  const [careerType, setCareerType] = useState<CareerChangeType>("adjacent_pivot");

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    setFocus(requirementFocus);
  }, [requirementFocus]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [clusters, elite, career] = await Promise.all([
        careerData.getDomainClusters(),
        careerData.getElitePathways(),
        careerData.getCareerChangerPaths(),
      ]);
      if (!active) return;
      setDomainClusters(clusters);
      setEliteState(elite);
      setCareerState(career);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (section !== "target" || !pathwayId) {
      setEliteDetail(null);
      setBridgeState(null);
      return;
    }
    void loadEliteDetail(pathwayId);
  }, [pathwayId, section]);

  const loadEliteDetail = async (id: string) => {
    const detail = await careerData.getElitePathway(id);
    setEliteDetail(detail);
    setBridgeState(null);
    if (detail.data?.bridgePlanId) {
      setBridgeState(await careerData.getBridgePlan(detail.data.bridgePlanId));
    }
  };

  const chooseDomain = async (domainId: string) => {
    setSelectedDomainId(domainId);
    setSelectedSubgroupId(null);
    setSelectedRoleKey(null);
    setRoleState(null);
    setDomainState(await careerData.getDomainV2(domainId));
  };

  const chooseRole = async (roleKey: string) => {
    setSelectedRoleKey(roleKey);
    setRoleState(await careerData.getRoleV2(roleKey));
  };

  const selectedCareerRoutes = useMemo(
    () => careerState.data?.filter((route) => route.type === careerType) ?? [],
    [careerState.data, careerType],
  );
  const selectedDomain = domainState.data;
  const selectedSubgroup = selectedDomain?.subgroups.find((item) => item.id === selectedSubgroupId);
  const selectedRole = selectedDomain?.roles.find((item) => item.key === selectedRoleKey);
  const selectedUserType = NIGERIAN_USER_TYPES.find((item) => item.key === startingPoint);

  return (
    <DetailScaffold
      eyebrow="PATHWAYS"
      title="Choose the route from where you are"
      pdf
      state={{ status: "real", data: true }}
      disclaimer={false}
    >
      {() => (
        <View style={styles.body}>
          <Text style={[styles.lead, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Pathways connects a pathway user type to a chosen domain, subgroup, and role. Qualifications, credentials, chartered routes, research evidence, and bridge skills explain what is needed to reach that destination.
          </Text>

          <PathwayUserTypePicker value={startingPoint} onChange={setStartingPoint} colors={colors} />

          <View style={styles.sectionTabs}>
            {SECTION_TABS.map((item) => (
              <TouchableOpacity
                key={item.key}
                onPress={() => setSection(item.key)}
                style={[styles.sectionTab, { borderColor: section === item.key ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: section === item.key ? colors.surface.subtle : colors.surface.raised }]}
                accessibilityRole="tab"
                accessibilityState={{ selected: section === item.key }}
              >
                <Feather name={item.icon} size={15} color={section === item.key ? colors.accentRole.action : colors.textRole.muted} />
                <Text style={[styles.sectionTabText, { color: section === item.key ? colors.textRole.primary : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {section === "overview" ? <OverviewSection colors={colors} onSelect={setSection} /> : null}
          {section === "target" ? (
            <TargetPathSection
              colors={colors}
              focus={focus}
              onFocus={setFocus}
              domainClusters={domainClusters}
              selectedDomainId={selectedDomainId}
              onDomain={chooseDomain}
              domainState={domainState}
              selectedSubgroupId={selectedSubgroupId}
              onSubgroup={setSelectedSubgroupId}
              selectedRoleKey={selectedRoleKey}
              onRole={chooseRole}
              roleState={roleState}
              userType={selectedUserType?.label ?? startingPoint}
              domain={selectedDomain ?? undefined}
              subgroup={selectedSubgroup}
              role={selectedRole}
              eliteState={eliteState}
              eliteDetail={eliteDetail}
              bridge={bridgeState}
              onElite={loadEliteDetail}
            />
          ) : null}
          {section === "career-change" ? <CareerChangeSection colors={colors} state={careerState} type={careerType} selected={selectedCareerRoutes} onType={setCareerType} /> : null}
          {section === "build" ? <BuildSection context={entrepreneurshipContext} /> : null}

          <CareerDisclaimer variant="footer" />
        </View>
      )}
    </DetailScaffold>
  );
}

function PathwayUserTypePicker({ value, onChange, colors }: { value: NigerianUserTypeKey; onChange: (value: NigerianUserTypeKey) => void; colors: ColorPalette }) {
  const selected = NIGERIAN_USER_TYPES.find((item) => item.key === value);
  return (
    <View style={[styles.contextCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.sectionLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>PATHWAY USER TYPE</Text>
      <Text style={[styles.contextTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{selected?.label ?? "Choose your current position"}</Text>
      <Text style={[styles.contextBody, { color: colors.textRole.secondary }, CompassFonts.body]}>This is route context, not a new account or user type. It changes the qualification and bridge evidence shown for the destination.</Text>
      <View style={styles.chips}>
        {NIGERIAN_USER_TYPES.map((item) => (
          <TouchableOpacity key={item.key} onPress={() => onChange(item.key)} style={[styles.chip, { borderColor: item.key === value ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: item.key === value ? colors.surface.subtle : colors.surface.base }]} accessibilityRole="button">
            <Text style={[styles.chipText, { color: item.key === value ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function OverviewSection({ colors, onSelect }: { colors: ColorPalette; onSelect: (section: PathwaySection) => void }) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>One pathway layer</Text>
      <Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Where you are now → target domain → subgroup → role → the qualifications, credentials, chartered routes, capabilities, and proof that make the next move credible.</Text>
      <TouchableOpacity onPress={() => onSelect("target")} style={[styles.featureCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <Feather name="compass" size={22} color={colors.accentRole.action} />
        <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Choose a target path</Text>
        <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Select a domain, subgroup, and role. Requirement details then appear in context rather than as disconnected upgrade or credential pages.</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSelect("career-change")} style={[styles.featureCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <Feather name="repeat" size={22} color={colors.accentRole.action} />
        <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Change direction</Text>
        <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Translate existing evidence for a same-field move, adjacent pivot, significant change, or forced change.</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => onSelect("build")} style={[styles.featureCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
        <Feather name="briefcase" size={22} color={colors.accentRole.action} />
        <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Build from knowledge</Text>
        <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Open the existing entrepreneurship Opportunity Map from a programme, domain, skill, idea, or market problem.</Text>
      </TouchableOpacity>
    </View>
  );
}

function TargetPathSection({ colors, focus, onFocus, domainClusters, selectedDomainId, onDomain, domainState, selectedSubgroupId, onSubgroup, selectedRoleKey, onRole, roleState, userType, domain, subgroup, role, eliteState, eliteDetail, bridge, onElite }: {
  colors: ColorPalette;
  focus: PathwayRequirementFocus;
  onFocus: (focus: PathwayRequirementFocus) => void;
  domainClusters: DataState<DomainClusterGroup[]>;
  selectedDomainId: string | null;
  onDomain: (id: string) => void;
  domainState: DataState<DomainV2>;
  selectedSubgroupId: string | null;
  onSubgroup: (id: string) => void;
  selectedRoleKey: string | null;
  onRole: (key: string) => void;
  roleState: DataState<DomainRoleV2> | null;
  userType: string;
  domain?: DomainV2;
  subgroup?: DomainV2["subgroups"][number];
  role?: DomainV2["roles"][number];
  eliteState: DataState<ElitePathwaySummary[]>;
  eliteDetail: DataState<ElitePathway> | null;
  bridge: DataState<BridgePlan> | null;
  onElite: (id: string) => void;
}) {
  return (
    <View style={styles.section}>
      <SectionHeading colors={colors} title="Target path" body="The requirement view is selected after the destination is clear. Qualifications and credentials are route details, not independent destinations." />
      <View style={styles.chips}>
        {REQUIREMENT_FOCI.map((item) => (
          <TouchableOpacity key={item.key} onPress={() => onFocus(item.key)} style={[styles.chip, { borderColor: focus === item.key ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: focus === item.key ? colors.surface.subtle : colors.surface.raised }]}>
            <Text style={[styles.chipText, { color: focus === item.key ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.subsectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>1. Choose a domain</Text>
      {domainClusters.status === "real" && domainClusters.data?.length ? (
        <View style={styles.domainGroups}>{domainClusters.data.map((group) => <View key={group.cluster} style={styles.group}><Text style={[styles.groupTitle, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>{group.cluster}</Text><View style={styles.chips}>{group.domains.map((item) => <TouchableOpacity key={item.id} onPress={() => onDomain(item.id)} style={[styles.chip, { borderColor: item.id === selectedDomainId ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: item.id === selectedDomainId ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.chipText, { color: item.id === selectedDomainId ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.name}</Text></TouchableOpacity>)}</View></View>)}</View>
      ) : <StateNote colors={colors} state={domainClusters} />}

      {selectedDomainId ? <>
        <Text style={[styles.subsectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>2. Choose a subgroup</Text>
        {domain?.subgroups?.length ? <View style={styles.chips}>{domain.subgroups.map((item) => <TouchableOpacity key={item.id} onPress={() => onSubgroup(item.id)} style={[styles.chip, { borderColor: item.id === selectedSubgroupId ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: item.id === selectedSubgroupId ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.chipText, { color: item.id === selectedSubgroupId ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.name}</Text></TouchableOpacity>)}</View> : <StateNote colors={colors} state={domainState} />}
        <Text style={[styles.subsectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>3. Choose a role</Text>
        {domain?.roles?.length ? <View style={styles.cards}>{domain.roles.filter((item) => !selectedSubgroupId || item.subgroupId === selectedSubgroupId).map((item) => <TouchableOpacity key={item.key} onPress={() => onRole(item.key)} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: item.key === selectedRoleKey ? colors.accentRole.action : colors.borderRole.subtle }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{item.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.muted }, CompassFonts.body]}>{item.tier ?? "Role"}{item.eliteStatus ? ` · ${item.eliteStatus}` : ""}</Text></View><Feather name="chevron-right" size={18} color={colors.textRole.muted} /></TouchableOpacity>)}</View> : <StateNote colors={colors} state={domainState} />}
      </> : null}

      {selectedRoleKey ? <RequirementPanel colors={colors} focus={focus} userType={userType} domain={domain} subgroup={subgroup} role={role} roleState={roleState} /> : null}
      <EliteRequirementSection colors={colors} state={eliteState} detail={eliteDetail} bridge={bridge} onSelect={onElite} />
    </View>
  );
}

function RequirementPanel({ colors, focus, userType, domain, subgroup, role, roleState }: { colors: ColorPalette; focus: PathwayRequirementFocus; userType: string; domain?: DomainV2; subgroup?: DomainV2["subgroups"][number]; role?: DomainV2["roles"][number]; roleState: DataState<DomainRoleV2> | null }) {
  const roleDetail = roleState?.data;
  const certifications = [
    ...(domain?.gatewayCertifications ?? []),
    ...(subgroup?.certifications ?? []),
    ...(roleDetail?.certifications ?? []),
  ];
  const bridgeSkills = [
    ...(domain?.domainBridgeSkills ?? []).map((item) => item.name),
    ...(roleDetail?.roleBridgeSkills ?? []).map((item) => item.name),
  ];
  return (
    <View style={[styles.requirements, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.sectionLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>ROUTE REQUIREMENTS</Text>
      <Text style={[styles.subsectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{role?.name ?? "Selected role"}</Text>
      <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Starting point: {userType}</Text>
      <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Domain: {domain?.name ?? "Selected domain"}{subgroup ? ` · ${subgroup.name}` : ""}</Text>
      <RequirementBlock colors={colors} title={focus === "qualification" ? "Qualifications and bridges" : "Qualification context"} items={bridgeSkills} empty="No verified qualification or bridge rows are available for this role yet." />
      <RequirementBlock colors={colors} title={focus === "credentials" ? "Credentials and chartered / registration routes" : "Credential context"} items={certifications.map((item) => `${item.name}${item.body ? ` · ${item.body}` : ""}`)} empty="No verified credential or chartered requirement is published for this role yet." />
      <RequirementBlock colors={colors} title={focus === "research" ? "PhD and research evidence" : "Research evidence"} items={roleDetail?.careerLadder ?? []} empty="Research requirements, publications, and non-academic bridges remain source-gated for this role." />
      <RequirementBlock colors={colors} title="Evidence status" items={roleState?.meta?.sources ?? []} empty={roleState?.meta?.notice ?? "Select a role to load source-backed requirement detail."} />
    </View>
  );
}

function RequirementBlock({ colors, title, items, empty }: { colors: ColorPalette; title: string; items: string[]; empty: string }) {
  return <View style={styles.requirementBlock}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text>{items.length ? items.map((item, index) => <Text key={`${title}-${index}`} style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>• {item}</Text>) : <Text style={[styles.pending, { color: colors.textRole.muted }, CompassFonts.body]}>REQUIRES VERIFICATION · {empty}</Text>}</View>;
}

function EliteRequirementSection({ colors, state, detail, bridge, onSelect }: { colors: ColorPalette; state: DataState<ElitePathwaySummary[]>; detail: DataState<ElitePathway> | null; bridge: DataState<BridgePlan> | null; onSelect: (id: string) => void }) {
  return <View style={styles.subsection}><SectionHeading colors={colors} title="Structured route evidence" body="Elite pathways are destination evidence attached to the selected route. Every detail follows the six-layer bridge model." />{state.data?.length ? <View style={styles.cards}>{state.data.map((path) => <TouchableOpacity key={path.id} onPress={() => onSelect(path.id)} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><Feather name="award" size={20} color={colors.accentRole.action} /><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{path.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{path.cluster ?? "Structured destination"}</Text></View><Feather name="chevron-right" size={18} color={colors.textRole.muted} /></TouchableOpacity>)}</View> : <StateNote colors={colors} state={state} />}{detail?.data ? <EliteLayers colors={colors} detail={detail.data} bridge={bridge} /> : null}{detail && !detail.data ? <StateNote colors={colors} state={detail} /> : null}</View>;
}

function EliteLayers({ colors, detail, bridge }: { colors: ColorPalette; detail: ElitePathway; bridge: DataState<BridgePlan> | null }) {
  const layers = bridge?.data?.layers ?? [];
  return <View style={styles.subsection}><Text style={[styles.subsectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{detail.name}: six evidence layers</Text><Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Claims, numbers, timelines, costs, entry points, and proof remain unavailable until they have named sources.</Text><View style={styles.layers}>{BRIDGE_LAYER_ORDER.map((definition, index) => { const layer = layers.find((item) => item.key === definition.key); return <View key={definition.key} style={[styles.layer, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><View style={[styles.layerNumber, { backgroundColor: colors.surface.subtle }]}><Text style={[styles.layerNumberText, { color: colors.accentRole.action }, CompassFonts.data]}>{index + 1}</Text></View><View style={styles.cardText}><Text style={[styles.layerTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{layer?.title ?? definition.title}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{layer?.body ?? SIX_LAYER_COPY[definition.key]}</Text>{layer?.items?.length ? layer.items.map((item, itemIndex) => <Text key={`${definition.key}-${itemIndex}`} style={[styles.layerItem, { color: colors.textRole.secondary }, CompassFonts.body]}>• {item}</Text>) : <Text style={[styles.pending, { color: colors.textRole.muted }, CompassFonts.body]}>REQUIRES VERIFICATION · Detail not yet available</Text>}</View></View>; })}</View>{bridge?.meta?.sources?.length ? <Text style={[styles.sourceText, { color: colors.textRole.muted }, CompassFonts.body]}>Sources: {bridge.meta.sources.join(" · ")}</Text> : null}</View>;
}

function CareerChangeSection({ colors, state, type, selected, onType }: { colors: ColorPalette; state: DataState<CareerChangerPath[]>; type: CareerChangeType; selected: CareerChangerPath[]; onType: (type: CareerChangeType) => void }) {
  return <View style={styles.section}><SectionHeading colors={colors} title="Career change" body="Career change remains an interactive route component: translate existing evidence, show full or partial credit, and make forced-change stability visible." /><View style={styles.chips}>{CAREER_CHANGE_TYPES.map((item) => <TouchableOpacity key={item.key} onPress={() => onType(item.key)} style={[styles.chip, { borderColor: type === item.key ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: type === item.key ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.chipText, { color: type === item.key ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.label}</Text></TouchableOpacity>)}</View>{selected.length ? <View style={styles.cards}>{selected.map((route) => <View key={route.type} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{route.title}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{route.body ?? "REQUIRES VERIFICATION · Route detail not yet available."}</Text></View></View>)}</View> : <StateNote colors={colors} state={state} />}</View>;
}

function BuildSection({ context }: { context?: { programmeName?: string; domainId?: string } }) {
  return <View style={styles.section}><EntrepreneurshipPathwayScreen embedded initialProgrammeName={context?.programmeName} initialDomainId={context?.domainId} /></View>;
}

function SectionHeading({ colors, title, body }: { colors: ColorPalette; title: string; body: string }) {
  return <View style={styles.heading}><Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text><Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{body}</Text></View>;
}

function StateNote<T>({ colors, state }: { colors: ColorPalette; state: DataState<T> }) {
  const title = state.status === "real" ? "No verified rows yet" : state.status === "pending" ? "Loading your saved items" : state.status === "fallback" ? "Standard data" : "Evidence-gated detail";
  return <View style={[styles.stateNote, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}><Feather name={state.status === "error" ? "alert-triangle" : "lock"} size={17} color={colors.textRole.muted} /><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{title}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{state.meta?.notice ?? "This route will open when its source, cycle, and evidence checks are complete."}</Text></View></View>;
}

export default PathwaysHubScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.lg },
  lead: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.5 },
  contextCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  sectionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.heavy, letterSpacing: 1.2 },
  contextTitle: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.2 },
  contextBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  chip: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs },
  chipText: { fontSize: FontSize.xs },
  sectionTabs: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.xs },
  sectionTab: { flexDirection: "row", alignItems: "center", gap: 5, borderWidth: 1, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.sm },
  sectionTabText: { fontSize: FontSize.xs },
  section: { gap: Spacing.md },
  heading: { gap: Spacing.xs },
  sectionTitle: { fontSize: FontSize.xl, lineHeight: FontSize.xl * 1.2 },
  sectionBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  subsection: { gap: Spacing.sm, marginTop: Spacing.sm },
  subsectionTitle: { fontSize: FontSize.lg, lineHeight: FontSize.lg * 1.25 },
  group: { gap: Spacing.xs },
  groupTitle: { fontSize: FontSize.xs, letterSpacing: 0.5 },
  domainGroups: { gap: Spacing.md },
  cards: { gap: Spacing.sm },
  card: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.25 },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  featureCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.sm },
  requirements: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.lg, gap: Spacing.md },
  requirementBlock: { gap: Spacing.xs },
  layers: { gap: Spacing.sm },
  layer: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  layerNumber: { width: 26, height: 26, borderRadius: Radius.full, alignItems: "center", justifyContent: "center" },
  layerNumberText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  layerTitle: { fontSize: FontSize.sm },
  layerItem: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  pending: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.5, fontStyle: "italic" },
  sourceText: { fontSize: FontSize.xs },
  stateNote: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
});
