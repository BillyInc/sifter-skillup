import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";

import { useAuth } from "@/hooks/useAuth";
import { entrepreneurshipData } from "@/lib/entrepreneurshipData";
import { getStartingPoint } from "@/lib/startingPoint";
import type {
  EntrepreneurshipEntryMode,
  EntrepreneurshipOpportunityMap,
  EntrepreneurshipRole,
  OpportunityLens,
  VentureMode,
} from "@/types/entrepreneurship";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  webContainer,
  type ColorPalette,
} from "@/theme";
import CareerDisclaimer from "@/components/careerIntelligence/CareerDisclaimer";

const ENTRY_MODES: { label: string; value: EntrepreneurshipEntryMode }[] = [
  { label: "Saved context", value: "programme" },
  { label: "Domain", value: "domain" },
  { label: "Idea", value: "idea" },
  { label: "Skill", value: "skill" },
  { label: "Market problem", value: "market_problem" },
];

const VENTURE_MODES: { label: string; values: VentureMode[] }[] = [
  { label: "Independent operator", values: ["micro", "service"] },
  { label: "Firm / enterprise builder", values: ["service", "trade"] },
  { label: "Scalable venture builder", values: ["scalable"] },
  { label: "Product / IP creator", values: ["creator", "research"] },
];

const LENSES: { label: string; values: OpportunityLens[] }[] = [
  { label: "Technology & automation", values: ["digitize"] },
  { label: "Process & operations", values: ["replicate"] },
  { label: "Business model & distribution", values: ["productize", "distribute"] },
  { label: "Market & contextual adaptation", values: ["adapt"] },
  { label: "Social & systems", values: ["adapt"] },
  { label: "Cultural & creative", values: ["productize"] },
  { label: "Design & accessibility", values: ["productize"] },
  { label: "Knowledge & pedagogy", values: ["productize"] },
];

type OpportunityView = "all" | "documented" | "emerging" | "signals";

const OPPORTUNITY_VIEWS: { label: string; value: OpportunityView }[] = [
  { label: "Show all", value: "all" },
  { label: "Documented roles", value: "documented" },
  { label: "Emerging roles", value: "emerging" },
  { label: "Market signals", value: "signals" },
];

function toggleMany<T>(list: T[], values: T[]): T[] {
  const active = values.every((value) => list.includes(value));
  return active
    ? list.filter((value) => !values.includes(value))
    : Array.from(new Set([...list, ...values]));
}

function ventureModeLabel(mode: VentureMode): string {
  switch (mode) {
    case "micro":
      return "Independent operator";
    case "service":
      return "Service / firm building";
    case "creator":
      return "Product / IP creator";
    case "scalable":
      return "Scalable venture";
    case "research":
      return "Research-led product";
    case "trade":
      return "Firm / trade builder";
  }
}

export interface EntrepreneurshipPathwayScreenProps {
  /** Render as the Build component inside the shared Pathways product. */
  embedded?: boolean;
  /** Context passed from a selected programme/domain before entering Build. */
  initialProgrammeName?: string;
  initialDomainId?: string;
}

export function EntrepreneurshipPathwayScreen({ embedded = false, initialProgrammeName, initialDomainId }: EntrepreneurshipPathwayScreenProps) {
  const { colors } = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = !user || user.auth_provider === "guest";
  const [entryMode, setEntryMode] = React.useState<EntrepreneurshipEntryMode>("programme");
  const [map, setMap] = React.useState<EntrepreneurshipOpportunityMap | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selectedDomainId, setSelectedDomainId] = React.useState<string | null>(null);
  const [ventureModes, setVentureModes] = React.useState<VentureMode[]>([]);
  const [lenses, setLenses] = React.useState<OpportunityLens[]>([]);
  const [showAll, setShowAll] = React.useState(false);
  const [opportunityView, setOpportunityView] = React.useState<OpportunityView>("all");
  const [selectedRole, setSelectedRole] = React.useState<EntrepreneurshipRole | null>(null);
  const [lockedMessage, setLockedMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const startingPoint = await getStartingPoint(user?.id);
      const state = await entrepreneurshipData.getOpportunityMap({
        entryMode,
        domainId: initialDomainId ?? startingPoint?.priorFieldDomainKey,
        programmeName: initialProgrammeName ?? startingPoint?.intendedProgramme ?? startingPoint?.programmeName,
      });
      if (!active) return;
      setMap(state.data);
      const firstDomain = state.data?.domains?.[0]?.id ?? null;
      setSelectedDomainId((current) => current ?? firstDomain);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [entryMode, user?.id, initialDomainId, initialProgrammeName]);

  const roles = React.useMemo(() => {
    if (!map) return [];
    const filtered = entrepreneurshipData.filterRoles(map, {
      domainId: selectedDomainId,
      ventureModes,
      lenses,
      showAll,
    });
    if (opportunityView === "documented") return filtered.filter((role) => role.roleType === "documented");
    if (opportunityView === "emerging") return filtered.filter((role) => role.roleType === "emerging");
    if (opportunityView === "signals") return filtered.filter((role) => role.marketSignals.length > 0);
    return filtered;
  }, [map, selectedDomainId, ventureModes, lenses, showAll, opportunityView]);

  const locked = (action: string) => {
    setLockedMessage(
      isGuest
        ? `Create an account to ${action}.`
        : `${action} will unlock when the Entrepreneurship evidence registry and entitlement rules are configured.`,
    );
  };

  const content = (
    <>
      <TouchableOpacity
        style={embedded ? { display: "none" } : [styles.backButton, { borderColor: colors.borderRole.subtle }]}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/explore/pathways" as any);
        }}
      >
        <Text style={[styles.backText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>Back</Text>
      </TouchableOpacity>

      <Text style={[styles.eyebrow, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
        BUILD PATHWAY
      </Text>
      <Text style={[styles.title, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        Opportunity Map
      </Text>
      <Text style={[styles.lead, { color: colors.textRole.secondary }, CompassFonts.body]}>
        Explore business routes from a saved programme, domain, idea, skill, or market problem.
        Evidence-backed data appears as it is validated; unsupported claims stay marked as not yet evidenced.
      </Text>

      <View style={styles.toolbar}>
        {ENTRY_MODES.map((item) => (
          <FilterChip
            key={item.value}
            label={item.label}
            active={entryMode === item.value}
            onPress={() => {
              setEntryMode(item.value);
              setSelectedRole(null);
            }}
            colors={colors}
          />
        ))}
      </View>

      {loading ? <ActivityIndicator color={colors.accentRole.action} /> : null}

      {map ? (
        <>
          <Section title="Choose a domain lens" colors={colors}>
            <View style={styles.domainGrid}>
              {map.domains.map((domain) => (
                <TouchableOpacity
                  key={domain.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    setSelectedDomainId(domain.id);
                    setSelectedRole(null);
                  }}
                  style={[
                    styles.domainCard,
                    {
                      backgroundColor: selectedDomainId === domain.id ? colors.accentRole.action : colors.surface.raised,
                      borderColor: selectedDomainId === domain.id ? colors.accentRole.action : colors.borderRole.subtle,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.domainRank,
                      { color: selectedDomainId === domain.id ? "#FFFFFF" : colors.textRole.muted },
                      CompassFonts.data,
                    ]}
                  >
                    {domain.rank ? `#${domain.rank}` : "ALT"}
                  </Text>
                  <Text
                    style={[
                      styles.domainName,
                      { color: selectedDomainId === domain.id ? "#FFFFFF" : colors.textRole.primary },
                      CompassFonts.bodyBold,
                    ]}
                  >
                    {domain.name}
                  </Text>
                  <EvidenceLine evidence={domain.evidence.status} inverse={selectedDomainId === domain.id} colors={colors} />
                </TouchableOpacity>
              ))}
            </View>
          </Section>

          <Section title="Filter opportunity roles" colors={colors}>
            <Text style={[styles.smallLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              Opportunity view
            </Text>
            <View style={styles.toolbar}>
              {OPPORTUNITY_VIEWS.map((item) => (
                <FilterChip
                  key={item.value}
                  label={item.label}
                  active={opportunityView === item.value}
                  onPress={() => setOpportunityView(item.value)}
                  colors={colors}
                />
              ))}
            </View>
            <Text style={[styles.smallLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              Venture modes
            </Text>
            <View style={styles.toolbar}>
              {VENTURE_MODES.map((item) => (
                <FilterChip
                  key={item.label}
                  label={item.label}
                  active={item.values.some((value) => ventureModes.includes(value))}
                  onPress={() => setVentureModes((current) => toggleMany(current, item.values))}
                  colors={colors}
                />
              ))}
            </View>
            <Text style={[styles.smallLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              Opportunity lenses
            </Text>
            <View style={styles.toolbar}>
              {LENSES.map((item) => (
                <FilterChip
                  key={item.label}
                  label={item.label}
                  active={item.values.some((value) => lenses.includes(value))}
                  onPress={() => setLenses((current) => toggleMany(current, item.values))}
                  colors={colors}
                />
              ))}
              <FilterChip
                label={showAll ? "Ranked view" : "Show all"}
                active={showAll}
                onPress={() => setShowAll((value) => !value)}
                colors={colors}
              />
            </View>
          </Section>

          {lockedMessage ? (
            <View style={[styles.notice, { backgroundColor: colors.warningSoft, borderColor: colors.warning }]}>
              <Text style={[styles.noticeText, { color: colors.textRole.primary }, CompassFonts.body]}>
                {lockedMessage}
              </Text>
            </View>
          ) : null}

          {roles.length ? (
            <View style={styles.roleGrid}>
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  role={role}
                  selected={selectedRole?.id === role.id}
                  onPress={() => setSelectedRole(role)}
                  onSave={() => locked("save this venture role")}
                  onCompare={() => locked("compare venture roles")}
                  colors={colors}
                />
              ))}
            </View>
          ) : (
            <View style={[styles.notice, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
              <Text style={[styles.noticeText, { color: colors.textRole.secondary }, CompassFonts.body]}>
                No roles or market signals are published for this view yet. This is not evidence that the opportunity does not exist.
              </Text>
            </View>
          )}

          {selectedRole ? <RoleDetail role={selectedRole} colors={colors} /> : null}
        </>
      ) : (
        <View style={[styles.notice, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.noticeText, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Opportunity Map data is not available yet.
          </Text>
        </View>
      )}
      {!embedded ? <CareerDisclaimer variant="footer" /> : null}
    </>
  );

  if (embedded) {
    return <View style={[styles.embedded, { backgroundColor: colors.surface.base }]}>{content}</View>;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      {content}
    </ScrollView>
  );
}

function Section({ title, children, colors }: { title: string; children: React.ReactNode; colors: ColorPalette }) {
  return (
    <View style={[styles.section, { borderTopColor: colors.borderRole.subtle }]}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
  colors,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      style={[
        styles.chip,
        {
          backgroundColor: active ? colors.accentRole.action : colors.surface.raised,
          borderColor: active ? colors.accentRole.action : colors.borderRole.subtle,
        },
      ]}
    >
      <Text style={[styles.chipText, { color: active ? "#FFFFFF" : colors.textRole.primary }, CompassFonts.bodyBold]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function EvidenceLine({ evidence, inverse, colors }: { evidence: string; inverse?: boolean; colors: ColorPalette }) {
  const label = evidence === "not_yet_evidenced" ? "Not yet evidenced" : evidence;
  return (
    <Text style={[styles.evidence, { color: inverse ? "#FFFFFF" : colors.textRole.muted }, CompassFonts.bodySemibold]}>
      {label}
    </Text>
  );
}

function RoleCard({
  role,
  selected,
  onPress,
  onSave,
  onCompare,
  colors,
}: {
  role: EntrepreneurshipRole;
  selected: boolean;
  onPress: () => void;
  onSave: () => void;
  onCompare: () => void;
  colors: ColorPalette;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.86}
      onPress={onPress}
      style={[
        styles.roleCard,
        {
          backgroundColor: colors.surface.raised,
          borderColor: selected ? colors.accentRole.action : colors.borderRole.subtle,
        },
      ]}
    >
      <View style={styles.roleHeader}>
        <Text style={[styles.roleType, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
          {role.roleType.toUpperCase()}
        </Text>
        <EvidenceLine evidence={role.evidence.status} colors={colors} />
      </View>
      <Text style={[styles.roleTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        {role.title}
      </Text>
      <Text style={[styles.roleSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>
        {role.summary}
      </Text>
      <View style={styles.inlineChips}>
        {role.ventureModes.slice(0, 3).map((mode) => (
          <Text key={mode} style={[styles.metaChip, { color: colors.textRole.primary, borderColor: colors.borderRole.subtle }]}>
            {ventureModeLabel(mode)}
          </Text>
        ))}
      </View>
      <View style={styles.actions}>
        <ActionButton label="Details" onPress={onPress} colors={colors} />
        <ActionButton label="Save" onPress={onSave} colors={colors} />
        <ActionButton label="Compare" onPress={onCompare} colors={colors} />
      </View>
    </TouchableOpacity>
  );
}

function RoleDetail({ role, colors }: { role: EntrepreneurshipRole; colors: ColorPalette }) {
  return (
    <View style={[styles.detail, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.sectionTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        {role.title}
      </Text>
      <Text style={[styles.roleSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>
        {role.summary}
      </Text>
      <DetailList title="Venture modes" items={role.ventureModes.map(ventureModeLabel)} colors={colors} />
      <DetailList title="Opportunity lenses" items={role.lenses} colors={colors} />
      <DetailList title="Entry modes" items={role.entryModes} colors={colors} />
      <DetailList title="Capability layers" items={role.capabilityLayers} colors={colors} />
      <DetailList title="Partner requirements" items={role.partnerRequirements} colors={colors} />
      <DetailList title="Regulation" items={role.regulationNotes} colors={colors} />
      <DetailList title="Market conditions" items={role.marketSignals.map((signal) => signal.label)} colors={colors} />
      <View style={styles.contextGrid}>
        <ContextBlock title="Nigeria context" body={role.nigeriaContext} colors={colors} />
        <ContextBlock title="Global context" body={role.globalContext} colors={colors} />
      </View>
      <EvidenceLine evidence={role.evidence.status} colors={colors} />
      {role.evidence.sources.length ? (
        <Text style={[styles.evidence, { color: colors.textRole.muted }, CompassFonts.body]}>Sources: {role.evidence.sources.join(" · ")}</Text>
      ) : null}
    </View>
  );
}

function DetailList({ title, items, colors }: { title: string; items: string[]; colors: ColorPalette }) {
  return (
    <View style={{ gap: Spacing.xs }}>
      <Text style={[styles.smallLabel, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{title}</Text>
      {items.map((item) => (
        <Text key={item} style={[styles.bullet, { color: colors.textRole.secondary }, CompassFonts.body]}>
          - {item}
        </Text>
      ))}
    </View>
  );
}

function ContextBlock({ title, body, colors }: { title: string; body: string; colors: ColorPalette }) {
  return (
    <View style={[styles.contextBlock, { borderColor: colors.borderRole.subtle }]}>
      <Text style={[styles.smallLabel, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>{title}</Text>
      <Text style={[styles.roleSummary, { color: colors.textRole.secondary }, CompassFonts.body]}>{body}</Text>
    </View>
  );
}

function ActionButton({ label, onPress, colors }: { label: string; onPress: () => void; colors: ColorPalette }) {
  return (
    <TouchableOpacity
      activeOpacity={0.78}
      onPress={onPress}
      style={[styles.actionButton, { borderColor: colors.borderRole.subtle }]}
    >
      <Text style={[styles.actionText, { color: colors.textRole.primary }, CompassFonts.bodyBold]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default EntrepreneurshipPathwayScreen;

const styles = StyleSheet.create({
  embedded: { gap: Spacing.md },
  scroll: {
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.md,
    flexGrow: 1,
  },
  backButton: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 40,
    justifyContent: "center",
  },
  backText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 1.5,
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: FontWeight.black,
    lineHeight: FontSize.display * 1.12,
  },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
    maxWidth: 820,
  },
  toolbar: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  chip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  chipText: { fontSize: FontSize.sm },
  section: {
    borderTopWidth: 1,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  sectionTitle: { fontSize: FontSize.xl, fontWeight: FontWeight.black },
  smallLabel: { fontSize: FontSize.sm },
  domainGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  domainCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
    minWidth: 220,
    flex: 1,
  },
  domainRank: { fontSize: FontSize.xs },
  domainName: { fontSize: FontSize.md, lineHeight: FontSize.md * 1.35 },
  evidence: { fontSize: FontSize.xs, textTransform: "uppercase", letterSpacing: 0.5 },
  notice: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  noticeText: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.45 },
  roleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  roleCard: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    minWidth: 270,
    flex: 1,
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.sm,
  },
  roleType: { fontSize: FontSize.xs, letterSpacing: 0.8 },
  roleTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.black },
  roleSummary: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  inlineChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  metaChip: {
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    fontSize: FontSize.xs,
    textTransform: "capitalize",
  },
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  actionText: { fontSize: FontSize.sm },
  detail: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  bullet: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  contextGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
  },
  contextBlock: {
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
    gap: Spacing.xs,
    minWidth: 240,
    flex: 1,
  },
});
