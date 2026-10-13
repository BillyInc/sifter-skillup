/**
 * CertPlacementList — certifications placed at their honest gate level.
 *
 *  - "Required in some regulated paths" (gateway) — verified practice gates.
 *  - "Credentials for specialisations" (subgroup) — cluster-specific credentials.
 *  - "Credentials that may strengthen this route" (roleHint) — role-level signals.
 *
 * Each row shows the cert name (+ body in muted text), a region chip (🇳🇬 / 🌍)
 * and the level as a tiny Badge. When ALL three groups are empty this renders a
 * subtle "No formal certification required" line — that absence is meaningful:
 * many fields genuinely have no licensing gate.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";
import type { CareerContextItem, CareerLearningResource, CertificationV2Enriched } from "../../types/career";
import { Badge } from "../ui";
import { ExternalLinkGuard } from "./ExternalLinkGuard";
import { ContextSourceLinks } from "./ContextSourceLinks";
import { contextItemFor, isStudentApprovedContextItem, relationshipTargets as resolveRelationshipTargets } from "./contextRelations";
import { resourceForItem, studentItemLinkUrl } from "./resourceLinks";
import { GuidanceReportButton } from "./GuidanceReportButton";
import { ContextRelationshipChips, relationshipRecords } from "./ContextRelationshipSheet";

export interface CertPlacementListProps {
  gateway?: CertificationV2Enriched[];
  subgroup?: CertificationV2Enriched[];
  roleHint?: CertificationV2Enriched[];
  style?: ViewStyle;
  emptyMessage?: string;
  /** Explicit cross-item edges for this same context, when the API supplies them. */
  contextItems?: CareerContextItem[];
  resources?: CareerLearningResource[];
  /** Optional explicit ownership boundary for a domain/subgroup/role surface. */
  contextLevel?: CareerContextItem["contextLevel"];
  /** Let an authenticated learner include a reviewed certification in the focused report. */
  learningFocus?: boolean;
  targetStudentId?: string;
}

const LEVEL_VARIANT: Record<
  NonNullable<CertificationV2Enriched["level"]>,
  "info" | "warning" | "success"
> = {
  foundation: "info",
  professional: "warning",
  advanced: "success",
};

const CURRENCY_SYMBOL: Record<
  NonNullable<CertificationV2Enriched["currency"]>,
  string
> = {
  USD: "$",
  NGN: "₦",
  GBP: "£",
  EUR: "€",
};

const TIER_LABEL: Record<number, string> = {
  1: "Entry",
  2: "Mid",
  3: "Senior",
};

/** "$450" / "₦50,000" — grouped thousands, no decimals. */
function formatPrice(
  price?: number,
  currency?: CertificationV2Enriched["currency"],
): string | null {
  if (price == null) return null;
  const symbol = currency ? CURRENCY_SYMBOL[currency] : "";
  const amount = Math.round(price).toLocaleString("en-US");
  return `${symbol}${amount}`;
}

function credentialTypeLabel(type: CertificationV2Enriched["credentialType"]): string | null {
  switch (type) {
    case "professional_registration_or_licence":
      return "Professional registration or licence";
    case "membership_or_accreditation":
      return "Membership or accreditation";
    case "training_or_course":
      return "Training or course";
    case "certification_or_qualification":
      return "Certification or qualification";
    default:
      return null;
  }
}

function TierChip({ tier }: { tier?: number }) {
  const { colors } = useTheme();
  if (tier == null) return null;
  const label = TIER_LABEL[tier] ?? `Tier ${tier}`;
  return (
    <View style={[styles.tierChip, { backgroundColor: colors.accentSoft }]}>
      <Text style={[styles.tierText, { color: colors.accent }]}>{label}</Text>
    </View>
  );
}

function RegionChip({
  region,
}: {
  region?: CertificationV2Enriched["region"];
}) {
  const { colors } = useTheme();
  if (!region) return null;
  const glyph = region === "nigeria" ? "🇳🇬" : "🌍";
  const label = region === "nigeria" ? "Nigeria" : "Global";
  return (
    <View style={[styles.region, { backgroundColor: colors.bgSecondary }]}>
      <Text style={styles.regionGlyph}>{glyph}</Text>
      <Text style={[styles.regionText, { color: colors.textMuted }]}>
        {label}
      </Text>
    </View>
  );
}

function marketScopeLabel(scope?: CertificationV2Enriched["marketScope"]): string | null {
  switch (scope) {
    case "nigeria": return "Nigerian context";
    case "global": return "Global context";
    case "nigeria_and_global": return "Nigeria + global evidence";
    default: return null;
  }
}

function isStudentCertification(
  cert: CertificationV2Enriched,
  contextLevel?: CareerContextItem["contextLevel"],
  contextItems?: CareerContextItem[],
): boolean {
  return cert.marketScope !== "not_established"
    && (!cert.dataState || cert.dataState === "source_backed")
    && cert.sourceConfidence !== "unsourced"
    && cert.guidanceOwner !== "role_aggregated"
    && cert.guidanceOwner !== "review_only"
    && cert.guidanceOwner !== "audit_only"
    && cert.reviewStatus !== "review_only"
    && cert.reviewStatus !== "unverified"
    && cert.ownershipScope !== "audit_only"
    && (!contextLevel || cert.guidanceOwner === contextLevel)
    && isStudentApprovedContextItem(contextItemFor(contextItems, "certification", cert.name));
}

function studentRelationshipTargets(item: CareerContextItem | undefined, type: "builds_on" | "works_with", contextItems?: CareerContextItem[]) {
  if (!item) return [];
  if (item.relationships !== undefined) {
    return item.relationships
      .filter((edge) => edge.relationshipStatus === "source_backed" && edge.relationshipType === type)
      .map((edge) => edge.toName || edge.toItemKey)
      .filter((name): name is string => Boolean(name));
  }
  return resolveRelationshipTargets(item, type, contextItems);
}

function CertRow({
  cert,
  emphasise,
  contextItems,
  resources,
  learningFocus,
  targetStudentId,
}: {
  cert: CertificationV2Enriched;
  emphasise: boolean;
  contextItems?: CareerContextItem[];
  resources?: CareerLearningResource[];
  learningFocus?: boolean;
  targetStudentId?: string;
}) {
  const { colors } = useTheme();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const price = formatPrice(cert.price, cert.currency);
  const resource = resourceForItem(resources, "certification", cert.name);
  const relation = contextItemFor(contextItems, "certification", cert.name);
  const url = studentItemLinkUrl(relation, resource, cert.officialUrl);
  const hasUrl = !!url;
  const hasDetails = Boolean(
    relation?.expectedOutput
    || relation?.requirementLevel
    || relation?.requirementReason
    || relation?.prerequisites?.length
    || relation?.evidenceLimitations?.length,
  );

  return (
    <View
      style={[
        styles.certRow,
        {
          backgroundColor: colors.bgSecondary,
          borderColor: colors.border,
        },
        emphasise ? { borderLeftWidth: 3, borderLeftColor: colors.gold } : null,
      ]}
    >
      <View style={styles.certMain}>
        <View style={styles.certTitleRow}>
        <Feather name="award" size={16} color={colors.text} />
        <Text style={[styles.certName, { color: colors.text }]} numberOfLines={2}>
          {cert.name}
        </Text>
        {learningFocus && relation ? <GuidanceReportButton
          targetStudentId={targetStudentId}
          selection={{
            kind: "learningFocus",
            id: `${relation.contextLevel}:${relation.contextKey}:certification:${relation.itemKey}`,
            name: relation.name,
            contextLevel: relation.contextLevel,
            contextKey: relation.contextKey,
            itemType: "certification",
            itemKey: relation.itemKey,
            domainId: relation.domainId,
          }}
        /> : null}
        </View>
        {relation?.plainMeaning ? <Text style={[styles.certBody, { color: colors.textMuted }]}>What it is: {relation.plainMeaning}</Text> : null}
        {relation?.contextualUse ? <Text style={[styles.certBody, { color: colors.textMuted }]}>How it is used here: {relation.contextualUse}</Text> : null}
        {relation ? <ContextRelationshipChips itemName={relation.name} relationships={relationshipRecords(relation)} /> : null}
        {hasDetails ? <TouchableOpacity
          accessibilityRole="button"
          accessibilityState={{ expanded: detailsOpen }}
          onPress={() => setDetailsOpen((value) => !value)}
          style={[styles.certDetailButton, { borderColor: colors.border }]}
        >
          <Feather name={detailsOpen ? "chevron-up" : "chevron-down"} size={14} color={colors.accent} />
          <Text style={[styles.certDetailButtonText, { color: colors.accent }]}>{detailsOpen ? "Hide how this credential fits" : "How this credential fits"}</Text>
        </TouchableOpacity> : null}
        {detailsOpen ? <View style={[styles.certDetails, { borderTopColor: colors.border }]}>
          {relation?.expectedOutput ? <CertDetail label="Capability or route it supports" value={relation.expectedOutput} colors={colors} /> : null}
          {relation?.requirementLevel ? <CertDetail label="Place in this route" value={`${relation.requirementLevel}${relation.requirementReason ? ` — ${relation.requirementReason}` : ""}`} colors={colors} /> : null}
          {relation?.prerequisites?.length ? <CertDetail label="Builds on" value={relation.prerequisites.join(" · ")} colors={colors} /> : null}
          {relation?.evidenceLimitations?.length ? <CertDetail label="What it cannot prove or replace" value={relation.evidenceLimitations.join("; ")} colors={colors} /> : null}
          <Text style={[styles.certBody, { color: colors.textMuted }]}>Holding a credential does not by itself prove practical competence or guarantee employment.</Text>
        </View> : null}
        <ExternalLinkGuard url={url} label={hasUrl ? `Open information for ${cert.name}` : `No verified link for ${cert.name}`} description={resource?.description || `This opens the official information or reference page recorded for ${cert.name}.`} textStyle={[styles.certBody, { color: colors.accent }]} />
        {cert.body ? (
          <Text
            style={[styles.certBody, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {cert.body}
          </Text>
          ) : null}
        {cert.gateReason ? (
          <Text style={[styles.certBody, { color: colors.textMuted }]}>
            Why it appears here: {cert.gateReason}
          </Text>
        ) : null}
        {studentRelationshipTargets(relation, "builds_on", contextItems).length ? (
          <Text style={[styles.certBody, { color: colors.textMuted }]}>Builds on: {studentRelationshipTargets(relation, "builds_on", contextItems).join(" · ")}</Text>
        ) : null}
        {studentRelationshipTargets(relation, "works_with", contextItems).length ? (
          <Text style={[styles.certBody, { color: colors.textMuted }]}>Works with: {studentRelationshipTargets(relation, "works_with", contextItems).join(" · ")}</Text>
        ) : null}
        <ContextSourceLinks item={relation} resource={resource} />
        {marketScopeLabel(cert.marketScope) ? (
          <Text style={[styles.certBody, { color: colors.textMuted }]}>
            {marketScopeLabel(cert.marketScope)}{cert.marketNote ? ` — ${cert.marketNote}` : ""}
          </Text>
        ) : null}
        {cert.availabilityStatus && cert.availabilityStatus !== "active" ? (
          <Text
            style={[styles.certBody, { color: colors.textMuted }]}
            accessibilityLabel={`${cert.name} is ${cert.availabilityStatus.replaceAll("_", " ")}`}
          >
            {cert.availabilityNote || (cert.availabilityStatus === "temporarily_unavailable"
              ? "Currently unavailable; check the issuer for reopening."
              : cert.availabilityStatus === "superseded"
                ? "Replaced by a newer issuer route."
                : "Retired by the issuer.")}
          </Text>
        ) : null}
        {cert.replacementName && !cert.replacementUrl ? (
          <View>
            <Text style={[styles.certBody, styles.certNameLink, { color: colors.accent }]}>
              Current route: {cert.replacementName} â†—
            </Text>
          </View>
        ) : null}
        {cert.replacementName && cert.replacementUrl ? <ExternalLinkGuard url={studentItemLinkUrl(undefined, undefined, cert.replacementUrl)} label={`Current route: ${cert.replacementName}`} description={`This opens the current route recorded for ${cert.name}.`} textStyle={[styles.certBody, { color: colors.accent }]} /> : null}
        {price || cert.tierType || cert.credentialType ? (
          <View style={styles.certFacts}>
            {price ? (
              <Text style={[styles.price, { color: colors.textSoft }]}>
                {price}
              </Text>
            ) : null}
            {cert.tierType ? (
              <Text style={[styles.tierType, { color: colors.textMuted }]}>
                {cert.tierType === "ladder" ? "Ladder" : "Stages"}
              </Text>
            ) : null}
            {credentialTypeLabel(cert.credentialType) ? (
              <Text style={[styles.tierType, { color: colors.textMuted }]}>
                {credentialTypeLabel(cert.credentialType)}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      <View style={styles.certMeta}>
        <TierChip tier={cert.seniorityTier} />
        <RegionChip region={cert.region} />
        {cert.level ? (
          <Badge
            label={cert.level}
            variant={LEVEL_VARIANT[cert.level]}
            size="sm"
          />
        ) : null}
      </View>
    </View>
  );
}

function CertDetail({ label, value, colors }: { label: string; value: string; colors: ReturnType<typeof useTheme>["colors"] }) {
  return <View style={styles.certDetailGroup}>
    <Text style={[styles.certDetailLabel, { color: colors.text }]}>{label}</Text>
    <Text style={[styles.certBody, { color: colors.textMuted }]}>{value}</Text>
  </View>;
}

function CertGroup({
  label,
  certs,
  emphasise,
  expanded,
  contextItems,
  resources,
  learningFocus,
  targetStudentId,
}: {
  label: string;
  certs: CertificationV2Enriched[];
  emphasise?: boolean;
  expanded: boolean;
  contextItems?: CareerContextItem[];
  resources?: CareerLearningResource[];
  learningFocus?: boolean;
  targetStudentId?: string;
}) {
  const { colors } = useTheme();
  if (!certs.length) return null;
  const visible = expanded ? certs : certs.slice(0, 4);
  return (
    <View style={styles.group}>
      <Text style={[styles.groupLabel, { color: colors.textMuted }]}>
        {label}
      </Text>
      <View style={styles.groupRows}>
        {visible.map((c, i) => (
          <CertRow key={`${c.name}-${i}`} cert={c} emphasise={!!emphasise} contextItems={contextItems} resources={resources} learningFocus={learningFocus} targetStudentId={targetStudentId} />
        ))}
      </View>
    </View>
  );
}

export function CertPlacementList({
  gateway,
  subgroup,
  roleHint,
  style,
  contextItems,
  resources,
  emptyMessage,
  contextLevel,
  learningFocus,
  targetStudentId,
}: CertPlacementListProps) {
  const { colors } = useTheme();
  const seen = new Set<string>();
  const selectStudentCerts = (certs?: CertificationV2Enriched[]) => (certs ?? []).filter((cert) => isStudentCertification(cert, contextLevel, contextItems)).filter((cert) => {
    const key = cert.name.trim().toLowerCase();
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  const g = selectStudentCerts(gateway);
  const s = selectStudentCerts(subgroup);
  const r = selectStudentCerts(roleHint);
  const [expanded, setExpanded] = useState(false);
  const total = g.length + s.length + r.length;
  const visibleCount = Math.min(g.length, 4) + Math.min(s.length, 4) + Math.min(r.length, 4);

  if (!g.length && !s.length && !r.length) {
    return (
      <View style={style}>
        <Text style={[styles.none, { color: colors.textMuted }]}>
          {emptyMessage || "No formal certification requirement is recorded for this level."}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CertGroup label="Required in some regulated paths" certs={g} emphasise expanded={expanded} contextItems={contextItems} resources={resources} learningFocus={learningFocus} targetStudentId={targetStudentId} />
      <CertGroup label="Credentials for specific areas" certs={s} expanded={expanded} contextItems={contextItems} resources={resources} learningFocus={learningFocus} targetStudentId={targetStudentId} />
      <CertGroup label="Credentials that may strengthen this route" certs={r} expanded={expanded} contextItems={contextItems} resources={resources} learningFocus={learningFocus} targetStudentId={targetStudentId} />
      {total > visibleCount ? <View style={styles.moreWrap}><Text style={[styles.moreHint, { color: colors.textMuted }]}>The first credentials are shown by placement level. The rest remain available when you want the full list.</Text><TouchableOpacity accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded((value) => !value)}><Badge label={expanded ? "Show fewer credentials" : `See all ${total} credentials`} variant="info" size="sm" /></TouchableOpacity></View> : null}
    </View>
  );
}

export default CertPlacementList;

const styles = StyleSheet.create({
  container: { gap: Spacing.lg },
  group: { gap: Spacing.sm },
  groupLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  groupRows: { gap: Spacing.sm },
  certRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  certMain: { flex: 1, gap: 2 },
  certTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: Spacing.xs },
  certName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  certNameLink: { textDecorationLine: "underline" },
  certBody: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
  certDetailButton: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", gap: Spacing.xs, borderWidth: 1, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: Spacing.xs, marginTop: Spacing.xs },
  certDetailButtonText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  certDetails: { borderTopWidth: 1, paddingTop: Spacing.sm, gap: Spacing.sm, marginTop: Spacing.xs },
  certDetailGroup: { gap: 2 },
  certDetailLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  certFacts: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginTop: 2,
  },
  price: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    fontVariant: ["tabular-nums"],
  },
  tierType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  certMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flexShrink: 0,
  },
  tierChip: {
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  tierText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    letterSpacing: 0.3,
  },
  region: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    borderRadius: Radius.full,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  regionGlyph: { fontSize: FontSize.xs },
  regionText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  none: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.5,
  },
  moreWrap: { gap: Spacing.sm, alignItems: "flex-start" },
  moreHint: { fontSize: FontSize.xs, lineHeight: FontSize.xs * 1.4 },
});
