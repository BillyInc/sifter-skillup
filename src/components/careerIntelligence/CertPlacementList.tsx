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
  Linking,
  TouchableOpacity,
  type ViewStyle,
} from "react-native";
import { useTheme, Spacing, Radius, FontSize, FontWeight } from "../../theme";
import type { CertificationV2Enriched } from "../../types/career";
import { Badge } from "../ui";

export interface CertPlacementListProps {
  gateway?: CertificationV2Enriched[];
  subgroup?: CertificationV2Enriched[];
  roleHint?: CertificationV2Enriched[];
  style?: ViewStyle;
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

function CertRow({
  cert,
  emphasise,
}: {
  cert: CertificationV2Enriched;
  emphasise: boolean;
}) {
  const { colors } = useTheme();
  const price = formatPrice(cert.price, cert.currency);
  const hasUrl = !!cert.officialUrl;

  const openUrl = () => {
    if (cert.officialUrl) Linking.openURL(cert.officialUrl).catch(() => {});
  };

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
        <Text
          onPress={hasUrl ? openUrl : undefined}
          style={[
            styles.certName,
            { color: hasUrl ? colors.accent : colors.text },
            hasUrl ? styles.certNameLink : null,
          ]}
          numberOfLines={2}
        >
          {cert.name}
          {hasUrl ? " ↗" : ""}
        </Text>
        {cert.body ? (
          <Text
            style={[styles.certBody, { color: colors.textMuted }]}
            numberOfLines={1}
          >
            {cert.body}
          </Text>
        ) : null}
        {price || cert.tierType ? (
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

function CertGroup({
  label,
  certs,
  emphasise,
  expanded,
}: {
  label: string;
  certs: CertificationV2Enriched[];
  emphasise?: boolean;
  expanded: boolean;
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
          <CertRow key={`${c.name}-${i}`} cert={c} emphasise={!!emphasise} />
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
}: CertPlacementListProps) {
  const { colors } = useTheme();
  const g = gateway ?? [];
  const s = subgroup ?? [];
  const r = roleHint ?? [];
  const [expanded, setExpanded] = useState(false);
  const total = g.length + s.length + r.length;
  const visibleCount = Math.min(g.length, 4) + Math.min(s.length, 4) + Math.min(r.length, 4);

  if (!g.length && !s.length && !r.length) {
    return (
      <View style={style}>
        <Text style={[styles.none, { color: colors.textMuted }]}>
          No formal certification requirement is recorded for this domain.
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CertGroup label="Required in some regulated paths" certs={g} emphasise expanded={expanded} />
      <CertGroup label="Credentials for specialisations" certs={s} expanded={expanded} />
      <CertGroup label="Credentials that may strengthen this route" certs={r} expanded={expanded} />
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
  certName: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },
  certNameLink: { textDecorationLine: "underline" },
  certBody: { fontSize: FontSize.xs, fontWeight: FontWeight.medium },
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
