/**
 * Pathways is one product, not a collection of independent screens.
 *
 * The route-specific files under app/(tabs)/explore/pathways remain as deep-link
 * compatibility wrappers, but they all mount this component and select a
 * section inside the same route-selection experience. Account and user types
 * are deliberately not involved here: the qualification taxonomy is pathway
 * context only.
 */
import React, { useEffect, useMemo, useState } from "react";
import { Feather } from "@expo/vector-icons";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { DetailScaffold } from "@/components/careerIntelligence";
import CareerDisclaimer from "@/components/careerIntelligence/CareerDisclaimer";
import { EntrepreneurshipPathwayScreen } from "@/screens/careerIntelligence/EntrepreneurshipPathwayScreen";
import { careerData } from "@/lib/careerData";
import {
  BRIDGE_LAYER_ORDER,
  comingSoon,
  type BridgePlan,
  type DataState,
  type ElitePathway,
  type ElitePathwaySummary,
  type PhdRoute,
  type QualificationUpgrade,
  type Chartership,
  type CareerChangerPath,
  type CareerChangeType,
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

export type PathwaySection =
  | "overview"
  | "elite"
  | "qualification"
  | "credentials"
  | "research"
  | "career-change"
  | "build";

export interface PathwaysHubScreenProps {
  initialSection?: PathwaySection;
  pathwayId?: string;
  entrepreneurshipContext?: { programmeName?: string; domainId?: string };
}

/** This is intentionally a pathway taxonomy, not an account/user enum. */
const STARTING_POINTS = [
  "SS3 / JAMB",
  "University undergraduate",
  "University graduate · white collar",
  "University graduate · field / blue collar",
  "MSc · Nigerian university",
  "MSc · international university",
  "PhD · limited publications",
  "PhD · published / international",
  "HND",
  "OND / ND",
  "NCE",
  "Technical college / NABTEB / artisan",
] as const;

const SECTIONS: { key: PathwaySection; label: string; icon: keyof typeof Feather.glyphMap }[] = [
  { key: "overview", label: "Overview", icon: "map" },
  { key: "elite", label: "Elite routes", icon: "award" },
  { key: "qualification", label: "Upgrades", icon: "trending-up" },
  { key: "credentials", label: "Credentials", icon: "file-text" },
  { key: "research", label: "PhD & research", icon: "search" },
  { key: "career-change", label: "Career change", icon: "repeat" },
  { key: "build", label: "Build a business", icon: "briefcase" },
];

const SIX_LAYER_COPY: Record<string, string> = {
  global_standard: "The destination standard and selection bar.",
  nigerian_qualification_map: "How the Nigerian starting qualification maps, without assuming equivalence.",
  bridge_inventory: "Top-ups, Direct Entry, ELR, credentials, experience, and other bridge options.",
  timeline_cost: "Cycle-labelled time and cost data; missing figures stay unverified.",
  employer_entry: "Named Nigerian entry institutions, employers, or routes into the field.",
  ownership_path: "Documented proof that the route has been walked; no invented success stories.",
};

const QUALIFICATION_COVERAGE = [
  "OND / ND → JAMB Direct Entry → 200 level degree route",
  "OND → HND → degree top-up",
  "HND → degree top-up or Direct Entry where the institution publishes it",
  "NCE → degree / education progression routes",
  "ELR and professional standing where the regulator publishes the route",
];

const CREDENTIAL_COVERAGE = [
  "Engineering registration, CEng / IEng, COREN and ELR",
  "CFA, ICAN and ACCA professional routes",
  "Medicine, law, surveying and project-management credentials",
  "Exemptions, recognition limits, and current regulator requirements",
];

const RESEARCH_ROUTES = [
  "Academic research and postdoctoral routes",
  "Policy, think-tank and international-organisation research",
  "Quant finance, data science and specialist consulting",
  "Corporate R&D and research entrepreneurship",
];

const CAREER_CHANGE_TYPES: { key: CareerChangeType; label: string }[] = [
  { key: "job_switch", label: "Same field · new role" },
  { key: "adjacent_pivot", label: "Adjacent pivot" },
  { key: "significant_change", label: "Significant change" },
  { key: "forced_change", label: "Forced change" },
];

export function PathwaysHubScreen({
  initialSection = "overview",
  pathwayId,
  entrepreneurshipContext,
}: PathwaysHubScreenProps) {
  const { colors } = useTheme();
  const [section, setSection] = useState<PathwaySection>(initialSection);
  const [startingPoint, setStartingPoint] = useState<string>(STARTING_POINTS[0]);
  const [eliteState, setEliteState] = useState<DataState<ElitePathwaySummary[]>>(() =>
    comingSoon<ElitePathwaySummary[]>("Sourced elite route data is being added.")
  );
  const [eliteDetail, setEliteDetail] = useState<DataState<ElitePathway> | null>(null);
  const [bridgeState, setBridgeState] = useState<DataState<BridgePlan> | null>(null);
  const [qualificationState, setQualificationState] = useState<DataState<QualificationUpgrade[]>>(() =>
    comingSoon<QualificationUpgrade[]>("Verified qualification-upgrade detail is being added.")
  );
  const [credentialState, setCredentialState] = useState<DataState<Chartership[]>>(() =>
    comingSoon<Chartership[]>("Verified credential detail is being added.")
  );
  const [researchState, setResearchState] = useState<DataState<PhdRoute[]>>(() =>
    comingSoon<PhdRoute[]>("Verified PhD and research route detail is being added.")
  );
  const [careerState, setCareerState] = useState<DataState<CareerChangerPath[]>>(() =>
    comingSoon<CareerChangerPath[]>("Verified career-change route detail is being added.")
  );
  const [careerType, setCareerType] = useState<CareerChangeType>("adjacent_pivot");

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  useEffect(() => {
    let active = true;
    (async () => {
      const [elite, upgrades, credentials, research, career] = await Promise.all([
        careerData.getElitePathways(),
        careerData.getQualificationUpgrades(),
        careerData.getCharterships(),
        careerData.getPhdRoutes(),
        careerData.getCareerChangerPaths(),
      ]);
      if (!active) return;
      setEliteState(elite);
      setQualificationState(upgrades);
      setCredentialState(credentials);
      setResearchState(research);
      setCareerState(career);
    })();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (section !== "elite" || !pathwayId) {
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

  const selectedCareerRoutes = useMemo(
    () => careerState.data?.filter((route) => route.type === careerType) ?? [],
    [careerState.data, careerType],
  );

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
            Pathways connects your current position to an academic, professional, capability, or venture destination. The panels below are components of one product; they do not create new account or user types.
          </Text>

          <View style={[styles.contextCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Text style={[styles.sectionLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>WHERE ARE YOU NOW?</Text>
            <Text style={[styles.contextTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{startingPoint}</Text>
            <Text style={[styles.contextBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
              This is pathway context only. It does not change your existing account type.
            </Text>
            <View style={styles.chips}>
              {STARTING_POINTS.map((point) => (
                <TouchableOpacity
                  key={point}
                  onPress={() => setStartingPoint(point)}
                  style={[styles.chip, { borderColor: point === startingPoint ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: point === startingPoint ? colors.surface.subtle : colors.surface.base }]}
                  accessibilityRole="button"
                  accessibilityLabel={`Starting point: ${point}`}
                >
                  <Text style={[styles.chipText, { color: point === startingPoint ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{point}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.sectionTabs}>
            {SECTIONS.map((item) => (
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
          {section === "elite" ? <EliteSection colors={colors} state={eliteState} detail={eliteDetail} bridge={bridgeState} onSelect={loadEliteDetail} /> : null}
          {section === "qualification" ? <QualificationSection colors={colors} state={qualificationState} /> : null}
          {section === "credentials" ? <CredentialsSection colors={colors} state={credentialState} /> : null}
          {section === "research" ? <ResearchSection colors={colors} state={researchState} /> : null}
          {section === "career-change" ? <CareerChangeSection colors={colors} state={careerState} type={careerType} selected={selectedCareerRoutes} onType={setCareerType} /> : null}
          {section === "build" ? <BuildSection colors={colors} context={entrepreneurshipContext} /> : null}

          <CareerDisclaimer variant="footer" />
        </View>
      )}
    </DetailScaffold>
  );
}

function OverviewSection({ colors, onSelect }: { colors: ColorPalette; onSelect: (section: PathwaySection) => void }) {
  const cards: { key: PathwaySection; title: string; body: string; icon: keyof typeof Feather.glyphMap }[] = [
    { key: "elite", title: "Structured and high-competition routes", body: "Sourced global standards, Nigerian qualification maps, bridges, timelines, entry points, and proof.", icon: "award" },
    { key: "qualification", title: "Qualification and credential progression", body: "Upgrades, Direct Entry, top-ups, ELR, and professional credentials in the same route map.", icon: "trending-up" },
    { key: "research", title: "PhD and research destinations", body: "Academic and non-academic outcomes such as policy, quant, consulting, R&D, and venture.", icon: "search" },
    { key: "career-change", title: "Career transitions", body: "Job switches, adjacent pivots, significant changes, and forced-change stability routes.", icon: "repeat" },
    { key: "build", title: "Entrepreneurial opportunity map", body: "Start from a programme, domain, skill, idea, or problem and inspect evidence-led venture options.", icon: "briefcase" },
  ];
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>One pathway layer</Text>
      <Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>Where you are now → the route or transition → the academic, professional, and capability data → the next action.</Text>
      <View style={styles.cards}>
        {cards.map((card) => (
          <TouchableOpacity key={card.key} onPress={() => onSelect(card.key)} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
            <Feather name={card.icon} size={21} color={colors.accentRole.action} />
            <View style={styles.cardText}>
              <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{card.title}</Text>
              <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{card.body}</Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.textRole.muted} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function EliteSection({ colors, state, detail, bridge, onSelect }: { colors: ColorPalette; state: DataState<ElitePathwaySummary[]>; detail: DataState<ElitePathway> | null; bridge: DataState<BridgePlan> | null; onSelect: (id: string) => void }) {
  return (
    <View style={styles.section}>
      <SectionHeading colors={colors} title="Elite pathways" body="Elite routes are sourced data, not decorative screens. Select a domain or role to inspect its evidence layers." />
      {state.data?.length ? (
        <View style={styles.cards}>{state.data.map((path) => <TouchableOpacity key={path.id} onPress={() => onSelect(path.id)} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><Feather name="award" size={20} color={colors.accentRole.action} /><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{path.name}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{path.cluster ?? "Structured pathway"}{path.selectivityLabel ? ` · ${path.selectivityLabel}` : ""}</Text></View><Feather name="chevron-right" size={18} color={colors.textRole.muted} /></TouchableOpacity>)}</View>
      ) : <StateNote colors={colors} state={state} />}
      {detail?.data ? <EliteLayers colors={colors} detail={detail.data} bridge={bridge} /> : null}
      {detail && !detail.data ? <StateNote colors={colors} state={detail} /> : null}
    </View>
  );
}

function EliteLayers({ colors, detail, bridge }: { colors: ColorPalette; detail: ElitePathway; bridge: DataState<BridgePlan> | null }) {
  const layers = bridge?.data?.layers ?? [];
  return (
    <View style={styles.subsection}>
      <Text style={[styles.subsectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{detail.name}: six evidence layers</Text>
      <Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>A layer is actionable only when its claims, numbers, timelines, and route evidence have named sources. Missing evidence remains visible as missing.</Text>
      <View style={styles.layers}>
        {BRIDGE_LAYER_ORDER.map((definition, index) => {
          const layer = layers.find((item) => item.key === definition.key);
          return <View key={definition.key} style={[styles.layer, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><View style={[styles.layerNumber, { backgroundColor: colors.surface.subtle }]}><Text style={[styles.layerNumberText, { color: colors.accentRole.action }, CompassFonts.data]}>{index + 1}</Text></View><View style={styles.cardText}><Text style={[styles.layerTitle, { color: colors.textRole.primary }, CompassFonts.bodySemibold]}>{layer?.title ?? definition.title}</Text><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{layer?.body ?? SIX_LAYER_COPY[definition.key]}</Text>{layer?.items?.length ? layer.items.map((item, itemIndex) => <Text key={`${definition.key}-${itemIndex}`} style={[styles.layerItem, { color: colors.textRole.secondary }, CompassFonts.body]}>• {item}</Text>) : <Text style={[styles.pending, { color: colors.textRole.muted }, CompassFonts.body]}>Verified detail not yet available</Text>}</View></View>;
        })}
      </View>
      {bridge?.meta?.sources?.length ? <Text style={[styles.sourceText, { color: colors.textRole.muted }, CompassFonts.body]}>Sources: {bridge.meta.sources.join(" · ")}</Text> : null}
    </View>
  );
}

function QualificationSection({ colors, state }: { colors: ColorPalette; state: DataState<QualificationUpgrade[]> }) {
  return <View style={styles.section}><SectionHeading colors={colors} title="Qualification upgrades" body="These are route components inside Pathways. The platform should show the entry condition, bridge, time, cost, and source status for each selected route." /><View style={[styles.featureCard, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}><Text style={[styles.featureTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>Canonical route coverage</Text>{QUALIFICATION_COVERAGE.map((item) => <Text key={item} style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>• {item}</Text>)}<Text style={[styles.pending, { color: colors.textRole.muted }, CompassFonts.body]}>Upper Credit and institution-specific Direct Entry conditions must be checked against the current JAMB and university publication before action.</Text></View><DataRows colors={colors} state={state} kind="qualification" /></View>;
}

function CredentialsSection({ colors, state }: { colors: ColorPalette; state: DataState<Chartership[]> }) {
  return <View style={styles.section}><SectionHeading colors={colors} title="Chartership and credentials" body="Credentials are another bridge component. Recognition, exemptions, regulator status, and current fees must be sourced per route." /><View style={styles.cards}>{CREDENTIAL_COVERAGE.map((item) => <View key={item} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><Feather name="file-text" size={19} color={colors.accentRole.action} /><Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{item}</Text></View>)}</View><DataRows colors={colors} state={state} kind="credential" /></View>;
}

function ResearchSection({ colors, state }: { colors: ColorPalette; state: DataState<PhdRoute[]> }) {
  return <View style={styles.section}><SectionHeading colors={colors} title="PhD and research" body="A doctorate is a research credential, not a lectureship guarantee. Academic and non-academic destinations remain in the same pathway map." /><View style={[styles.featureCard, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>{RESEARCH_ROUTES.map((route) => <Text key={route} style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>• {route}</Text>)}<Text style={[styles.pending, { color: colors.textRole.muted }, CompassFonts.body]}>Route-specific bridge, timeline, cost, entry point, and proof remain locked until they have named evidence.</Text></View><DataRows colors={colors} state={state} kind="research" /></View>;
}

function CareerChangeSection({ colors, state, type, selected, onType }: { colors: ColorPalette; state: DataState<CareerChangerPath[]>; type: CareerChangeType; selected: CareerChangerPath[]; onType: (type: CareerChangeType) => void }) {
  return <View style={styles.section}><SectionHeading colors={colors} title="Career change" body="Career change is the most interactive route component: translate existing evidence, show full or partial credit, and make forced-change stability visible." /><View style={styles.chips}>{CAREER_CHANGE_TYPES.map((item) => <TouchableOpacity key={item.key} onPress={() => onType(item.key)} style={[styles.chip, { borderColor: type === item.key ? colors.accentRole.action : colors.borderRole.subtle, backgroundColor: type === item.key ? colors.surface.subtle : colors.surface.raised }]}><Text style={[styles.chipText, { color: type === item.key ? colors.accentRole.action : colors.textRole.secondary }, CompassFonts.bodySemibold]}>{item.label}</Text></TouchableOpacity>)}</View>{selected.length ? <DataRows colors={colors} state={{ status: "real", data: selected }} kind="career" /> : <StateNote colors={colors} state={state} />}</View>;
}

function BuildSection({ context }: { colors: ColorPalette; context?: { programmeName?: string; domainId?: string } }) {
  // Build is the existing entrepreneurship product. Keep its Opportunity Map
  // data loading, context resolution, role filters, evidence labels, and
  // guest entitlement behavior intact while mounting it as one Pathways
  // component.
  return <View style={styles.section}><EntrepreneurshipPathwayScreen embedded initialProgrammeName={context?.programmeName} initialDomainId={context?.domainId} /></View>;
}

function DataRows({ colors, state, kind }: { colors: ColorPalette; state: DataState<(QualificationUpgrade | Chartership | PhdRoute | CareerChangerPath)[]>; kind: string }) {
  if (!state.data?.length) return <StateNote colors={colors} state={state} />;
  return <View style={styles.cards}>{state.data.map((row, index) => { const title = "title" in row ? row.title : row.name; const body = "body" in row ? row.body : undefined; return <View key={`${kind}-${"id" in row ? row.id : index}`} style={[styles.card, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}><View style={styles.cardText}><Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text>{body ? <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{body}</Text> : null}{"steps" in row && row.steps?.length ? row.steps.map((step, stepIndex) => <Text key={stepIndex} style={[styles.layerItem, { color: colors.textRole.secondary }, CompassFonts.body]}>{stepIndex + 1}. {step}</Text>) : null}{"requirements" in row && row.requirements?.length ? row.requirements.map((item, itemIndex) => <Text key={itemIndex} style={[styles.layerItem, { color: colors.textRole.secondary }, CompassFonts.body]}>• {item}</Text>) : null}{"signals" in row && row.signals?.length ? row.signals.map((item, itemIndex) => <Text key={itemIndex} style={[styles.layerItem, { color: colors.textRole.secondary }, CompassFonts.body]}>• {item}</Text>) : null}</View></View>; })}</View>;
}

function SectionHeading({ colors, title, body }: { colors: ColorPalette; title: string; body: string }) {
  return <View style={styles.heading}><Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>{title}</Text><Text style={[styles.sectionBody, { color: colors.textRole.secondary }, CompassFonts.body]}>{body}</Text></View>;
}

function StateNote<T>({ colors, state }: { colors: ColorPalette; state: DataState<T> }) {
  const title = state.status === "real" ? "No verified rows yet" : state.status === "pending" ? "Data pending" : state.status === "fallback" ? "Standard data" : "Evidence-gated detail";
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
  cards: { gap: Spacing.sm },
  card: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.sm, borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md },
  cardText: { flex: 1, gap: 4 },
  cardTitle: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.25 },
  cardBody: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  featureCard: { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: 5 },
  featureTitle: { fontSize: FontSize.md },
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
