/**
 * DetailScaffold — shared chrome for every Explore detail screen (programme,
 * role, domain). Provides a back button, an optional Save + PDF action row, a
 * title/eyebrow header, and a scrollable body that renders a DataState
 * gracefully (Coming Soon / Pending / Error) before showing content.
 */
import React, { type ReactNode } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import {
  useTheme,
  Spacing,
  FontSize,
  webContainer,
  CompassFonts,
} from "../../theme";
import type { DataState, SavedEntityType } from "../../types/career";
import { DataStateView } from "./DataStateView";
import { SaveButton } from "./SaveButton";
import { PdfExportButton } from "./PdfExportButton";
import { CareerDisclaimer } from "./CareerDisclaimer";
import { RouteLine } from "./RouteLine";

export interface DetailScaffoldProps<T> {
  eyebrow?: string;
  title: string;
  /** When provided, a Save bookmark action appears in the header. */
  save?: { entityType: SavedEntityType; entityId: string; label?: string };
  /** Show the "Save as PDF" action. */
  pdf?: boolean;
  pdfTitle?: string;
  /** The data envelope the body renders from. */
  state: DataState<T>;
  /** Render the populated body. */
  children: (data: T) => ReactNode;
  /** Optional content rendered above the DataStateView (e.g. tabs). */
  header?: ReactNode;
  empty?: (data: T) => boolean;
  /** Show the career-guidance disclaimer at the foot of the body. Default true. */
  disclaimer?: boolean;
}

export function DetailScaffold<T>({
  eyebrow,
  title,
  save,
  pdf,
  pdfTitle,
  state,
  children,
  header,
  empty,
  disclaimer = true,
}: DetailScaffoldProps<T>) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={10}
          style={styles.back}
        >
          <Text style={[styles.backText, { color: colors.accent }]}>
            ← Back
          </Text>
        </TouchableOpacity>
        <View style={styles.actions}>
          {save ? (
            <SaveButton
              entityType={save.entityType}
              entityId={save.entityId}
              label={save.label}
              compact
            />
          ) : null}
          {pdf ? <PdfExportButton title={pdfTitle ?? title} /> : null}
        </View>
      </View>

      {eyebrow ? (
        <Text style={[styles.eyebrow, CompassFonts.data, { color: colors.cobalt }]}>
          {eyebrow}
        </Text>
      ) : null}
      <Text style={[styles.title, CompassFonts.display, { color: colors.text }]}>
        {title}
      </Text>

      {/* Signature: the route-line rule draws in beneath the title. */}
      <RouteLine variant="rule" style={styles.rule} />

      {header}

      <View style={{ marginTop: Spacing.md }}>
        <DataStateView state={state} empty={empty}>
          {children}
        </DataStateView>
      </View>

      {disclaimer ? <CareerDisclaimer variant="footer" /> : null}
    </ScrollView>
  );
}

export default DetailScaffold;

const styles = StyleSheet.create({
  scroll: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    flexGrow: 1,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  back: { paddingVertical: 4 },
  backText: { fontSize: FontSize.md, fontWeight: "700" },
  actions: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginTop: Spacing.sm,
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "900",
    lineHeight: FontSize.display * 1.15,
  },
  rule: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
    maxWidth: 96,
  },
});
