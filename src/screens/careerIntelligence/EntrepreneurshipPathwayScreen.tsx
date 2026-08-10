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

const ENTRY_MODES: { label: string; value: EntrepreneurshipEntryMode }[] = [
  { label: "Saved context", value: "programme" },
  { label: "Idea", value: "idea" },
  { label: "Skill", value: "skill" },
  { label: "Market problem", value: "market_problem" },
];

const VENTURE_MODES: { label: string; value: VentureMode }[] = [
  { label: "Micro", value: "micro" },
  { label: "Service", value: "service" },
  { label: "Creator", value: "creator" },
  { label: "Scalable", value: "scalable" },
  { label: "Research", value: "research" },
  { label: "Trade", value: "trade" },
];

const LENSES: { label: string; value: OpportunityLens }[] = [
  { label: "Replicate", value: "replicate" },
  { label: "Adapt", value: "adapt" },
  { label: "Digitize", value: "digitize" },
  { label: "Productize", value: "productize" },
  { label: "Distribute", value: "distribute" },
  { label: "Regulated", value: "regulated" },
];

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

export function EntrepreneurshipPathwayScreen() {
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
  const [selectedRole, setSelectedRole] = React.useState<EntrepreneurshipRole | null>(null);
  const [lockedMessage, setLockedMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      const startingPoint = await getStartingPoint();
      const state = await entrepreneurshipData.getOpportunityMap({
        entryMode,
        domainId: startingPoint?.priorFieldDomainKey,
        programmeName: startingPoint?.intendedProgramme ?? startingPoint?.programmeName,
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
  }, [entryMode]);

  const roles = React.useMemo(() => {
    if (!map) return [];
    return entrepreneurshipData.filterRoles(map, {
      domainId: selectedDomainId,
      ventureModes,
      lenses,
      showAll,
    });
  }, [map, selectedDomainId, ventureModes, lenses, showAll]);

  const locked = (action: string) => {
    setLockedMessage(
      isGuest
        ? `Create an account to ${action}.`
        : `${action} will unlock when the Entrepreneurship evidence registry and entitlement rules are configured.`,
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        accessibilityRole="button"
        accessibilityLabel="Go back"
        onPress={() => {
          if (router.canGoBack()) router.back();
          else router.replace("/(tabs)/explore/pathways" as any);
        }}
        style={[styles.backButton, { borderColor: colors.borderRole.subtle }]}
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
              Venture modes
            </Text>
            <View style={styles.toolbar}>
              {VENTURE_MODES.map((item) => (
                <FilterChip
                  key={item.value}
                  label={item.label}
                  active={ventureModes.includes(item.value)}
                  onPress={() => setVentureModes((current) => toggle(current, item.value))}
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
                  key={item.value}
                  label={item.label}
                  active={lenses.includes(item.value)}
                  onPress={() => setLenses((current) => toggle(current, item.value))}
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

          {selectedRole ? <RoleDetail role={selectedRole} colors={colors} /> : null}
        </>
      ) : (
        <View style={[styles.notice, { backgroundColor: colors.surface.raised, borderColor: colors.borderRole.subtle }]}>
          <Text style={[styles.noticeText, { color: colors.textRole.secondary }, CompassFonts.body]}>
            Opportunity Map data is not available yet.
          </Text>
        </View>
      )}
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
            {mode}
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
      <DetailList title="Capability layers" items={role.capabilityLayers} colors={colors} />
      <DetailList title="Partner requirements" items={role.partnerRequirements} colors={colors} />
      <DetailList title="Regulation" items={role.regulationNotes} colors={colors} />
      <View style={styles.contextGrid}>
        <ContextBlock title="Nigeria context" body={role.nigeriaContext} colors={colors} />
        <ContextBlock title="Global context" body={role.globalContext} colors={colors} />
      </View>
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
