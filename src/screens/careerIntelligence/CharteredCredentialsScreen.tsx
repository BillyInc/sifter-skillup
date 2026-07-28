/**
 * CharteredCredentialsScreen — the chartership & credentials engine.
 *
 * A fixed editorial overview names the credential FAMILIES the engine covers
 * (CEng/IEng via ELR, COREN, RICS APC, CFA, ACCA/ICAN, PLAB, SQE, PMP, MPH/LLM)
 * as examples of coverage — fixed structure, always rendered, with an HONEST note
 * that NSE / the Washington Accord is only PROVISIONAL. The per-credential DETAIL
 * (name · field · body · exemptions, with a provenance badge) is data and arrives
 * via the inner DataStateView — getCharterships currently returns a `coming_soon`
 * envelope, so nothing is faked.
 *
 * The outer DetailScaffold is forced to a `real` envelope so the fixed overview
 * renders regardless of the data state; the inner DataStateView still shows the
 * graceful "being populated" state for the actual credential rows.
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import {
  DetailScaffold,
  DataStateView,
  DataSourceBadge,
} from "@/components/careerIntelligence";
import { SectionHeader } from "@/components/ui";
import { careerData } from "@/lib/careerData";
import {
  comingSoon,
  type DataState,
  type Chartership,
} from "@/types/career";
import {
  useTheme,
  Spacing,
  Radius,
  FontSize,
  FontWeight,
  CompassFonts,
  type ColorPalette,
} from "@/theme";

export function CharteredCredentialsScreen() {
  const { colors } = useTheme();
  const [state, setState] = useState<DataState<Chartership[]>>(() =>
    comingSoon<Chartership[]>(
      "The chartership & credentials engine is being populated.",
    ),
  );

  useEffect(() => {
    let active = true;
    (async () => {
      const result = await careerData.getCharterships();
      if (active) setState(result);
    })();
    return () => {
      active = false;
    };
  }, []);

  return (
    <DetailScaffold
      eyebrow="CHARTERSHIP & CREDENTIALS"
      title="Chartered routes & credentials"
      pdf
      state={{ status: "real", data: state.data ?? [] }}
    >
      {() => (
        <View style={styles.body}>
          <Text style={[styles.lead, { color: colors.textRole.secondary }, CompassFonts.body]}>
            A credential that travels turns a Nigerian qualification into one an
            employer abroad recognises. The engine maps the chartered routes and
            professional credentials, the exemptions you can claim, and — just as
            importantly — where recognition is only provisional.
          </Text>

          {/* Coverage overview — fixed editorial families, always rendered. */}
          <View
            style={[
              styles.overview,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.overviewLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
              Credential families covered
            </Text>
            {CREDENTIAL_FAMILIES.map((c) => (
              <Text
                key={c}
                style={[styles.overviewItem, { color: colors.textRole.secondary }, CompassFonts.body]}
              >
                • {c}
              </Text>
            ))}
            <Text style={[styles.overviewNote, { color: colors.textRole.muted }, CompassFonts.body]}>
              Examples of coverage — the per-credential detail is being populated
              and appears below once it lands.
            </Text>
          </View>

          {/* Honest provisional-accreditation caveat — fixed, always rendered. */}
          <View
            style={[
              styles.caveat,
              { backgroundColor: colors.bgSecondary, borderColor: colors.border },
            ]}
          >
            <Text style={styles.caveatIcon}>⚠️</Text>
            <Text style={[styles.caveatText, { color: colors.textRole.secondary }, CompassFonts.body]}>
              Be careful with engineering: NSE holds only PROVISIONAL Washington
              Accord signatory status, so a Nigerian engineering degree is not
              automatically recognised for CEng. Plan on the ELR (Experience &
              Learning Route) to chartered standing rather than assuming
              equivalence.
            </Text>
          </View>

          <View style={styles.section}>
            <SectionHeader title="Credential detail" icon="📜" />
            <DataStateView
              state={state}
              empty={(items) => items.length === 0}
              emptyTitle="Credential detail is being populated"
              emptyBody="The credential families above are mapped — each route's exemptions and detail are being added and will appear here automatically."
            >
              {(items) => (
                <View style={styles.list}>
                  {items.map((item) => (
                    <CredentialCard
                      key={item.id}
                      credential={item}
                      colors={colors}
                    />
                  ))}
                </View>
              )}
            </DataStateView>
          </View>
        </View>
      )}
    </DetailScaffold>
  );
}

/**
 * The credential families the engine covers — fixed model labels, not data rows.
 * Provisional accreditation is flagged honestly inline.
 */
const CREDENTIAL_FAMILIES: string[] = [
  "CEng / IEng via ELR (Experience & Learning Route)",
  "NSE — PROVISIONAL Washington Accord signatory (not automatic recognition)",
  "COREN (engineering registration)",
  "RICS APC (surveying)",
  "CFA (investment)",
  "ACCA / ICAN exemptions (accountancy)",
  "PLAB (medicine — UK)",
  "SQE (law — England & Wales)",
  "PMP (project management)",
  "MPH / LLM (postgraduate professional)",
];

/** A single populated credential — name, field, body, exemptions + provenance. */
function CredentialCard({
  credential,
  colors,
}: {
  credential: Chartership;
  colors: ColorPalette;
}) {
  return (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
      ]}
    >
      <Text style={[styles.cardTitle, { color: colors.textRole.primary }, CompassFonts.displayBold]}>
        {credential.name}
      </Text>
      {credential.field ? (
        <Text style={[styles.cardField, { color: colors.accentRole.action }, CompassFonts.bodySemibold]}>
          {credential.field}
        </Text>
      ) : null}
      {credential.body ? (
        <Text style={[styles.cardBody, { color: colors.textRole.secondary }, CompassFonts.body]}>
          {credential.body}
        </Text>
      ) : null}

      {credential.exemptions?.length ? (
        <View style={styles.exemptions}>
          <Text style={[styles.exemptionLabel, { color: colors.textRole.muted }, CompassFonts.bodySemibold]}>
            Exemptions
          </Text>
          {credential.exemptions.map((ex, i) => (
            <Text key={i} style={[styles.exemption, { color: colors.textRole.secondary }, CompassFonts.body]}>
              • {ex}
            </Text>
          ))}
        </View>
      ) : null}

      {credential.meta ? (
        <View style={styles.badge}>
          <DataSourceBadge
            verification={credential.meta.verification}
            date={credential.meta.dataDate}
            source={credential.meta.sources?.[0]}
          />
        </View>
      ) : null}
    </View>
  );
}

export default CharteredCredentialsScreen;

const styles = StyleSheet.create({
  body: { gap: Spacing.xl },
  lead: {
    fontSize: FontSize.md,
    lineHeight: FontSize.md * 1.5,
  },
  overview: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: 4,
  },
  overviewLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.5,
  },
  overviewItem: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  overviewNote: {
    fontSize: FontSize.xs,
    fontStyle: "italic",
    lineHeight: FontSize.xs * 1.5,
    marginTop: 4,
  },
  caveat: {
    flexDirection: "row",
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  caveatIcon: { fontSize: 18 },
  caveatText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  section: { gap: Spacing.sm },
  list: { gap: Spacing.md },
  card: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.xs,
  },
  cardTitle: { fontSize: FontSize.md, fontWeight: FontWeight.bold },
  cardField: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.heavy,
    letterSpacing: 0.5,
  },
  cardBody: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm * 1.5,
  },
  exemptions: { gap: 3, marginTop: Spacing.xs },
  exemptionLabel: { fontSize: FontSize.xs, fontWeight: FontWeight.bold },
  exemption: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  badge: { marginTop: Spacing.xs },
});
