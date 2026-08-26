/**
 * DetailScaffold — shared chrome for every Explore detail screen (programme,
 * role, domain). Provides a back button, an optional Save + PDF action row, a
 * title/eyebrow header, and a scrollable body that renders a DataState
 * gracefully (Coming Soon / Pending / Error) before showing content.
 */
import React, { type ReactNode, type RefObject } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import {
  useTheme,
  Spacing,
  FontSize,
  webContainer,
  CompassFonts,
  Radius,
} from "../../theme";
import type { DataState, SavedEntityType } from "../../types/career";
import { DataStateView } from "./DataStateView";
import { SaveButton } from "./SaveButton";
import { PdfExportButton } from "./PdfExportButton";
import { ShareExportButton } from "./ShareExportButton";
import { CareerDisclaimer } from "./CareerDisclaimer";
import { GuidanceReportButton, type GuidanceReportSelection } from "./GuidanceReportButton";

export interface DetailScaffoldProps<T> {
  eyebrow?: string;
  title: string;
  /** Visible contextual back label; the browser/router history remains the source of truth. */
  backLabel?: string;
  /** When provided, a Save bookmark action appears in the header. */
  save?: { entityType: SavedEntityType; entityId: string; label?: string };
  /** Show the "Save as PDF" action. */
  pdf?: boolean;
  pdfTitle?: string;
  /** Authenticated full-report endpoint. */
  pdfPath?: string;
  /** Explicitly add this selected branch to the student's report path. */
  reportSelection?: GuidanceReportSelection;
  /** When an administrator is guiding a student, save to that student. */
  targetStudentId?: string;
  /** The data envelope the body renders from. */
  state: DataState<T>;
  /** Render the populated body. */
  children: (data: T) => ReactNode;
  /** Optional content rendered above the DataStateView (e.g. tabs). */
  header?: ReactNode;
  empty?: (data: T) => boolean;
  /** Show the career-guidance disclaimer at the foot of the body. Default true. */
  disclaimer?: boolean;
  /** External ref to the inner ScrollView (for section nav scroll-to). */
  scrollRef?: RefObject<ScrollView | null>;
  /** Scroll event handler (for section nav active tracking). */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
}

export function DetailScaffold<T>({
  eyebrow,
  title,
  backLabel = "Back",
  save,
  pdf,
  pdfTitle,
  pdfPath,
  reportSelection,
  targetStudentId,
  state,
  children,
  header,
  empty,
  disclaimer = true,
  scrollRef,
  onScroll,
}: DetailScaffoldProps<T>) {
  const router = useRouter();
  const { colors } = useTheme();
  const goBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)/explore" as never);
    }
  };

  return (
    <ScrollView
      ref={scrollRef}
      onScroll={onScroll}
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[styles.scroll, webContainer as object]}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.borderRole.subtle },
        ]}
      >
        <View style={styles.breadcrumbRow}>
          <TouchableOpacity onPress={goBack} hitSlop={10} style={styles.back}>
            <Feather name="arrow-left" size={15} color={colors.textRole.secondary} />
            <Text style={[styles.backText, { color: colors.textRole.secondary }]}>
              {backLabel}
            </Text>
          </TouchableOpacity>
          <Text style={[styles.crumbSep, { color: colors.textRole.muted }]}>/</Text>
          <Text
            style={[styles.backText, CompassFonts.data, { color: colors.textRole.muted }]}
            numberOfLines={1}
          >
            {eyebrow ?? "DETAIL"}
          </Text>
        </View>

        <View style={styles.titleRow}>
          <View style={styles.titleBlock}>
            {eyebrow ? (
              <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>
                {eyebrow}
              </Text>
            ) : null}
            <Text style={[styles.title, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>
              {title}
            </Text>
          </View>
          <View style={styles.actions}>
            {save ? (
              <SaveButton
                entityType={save.entityType}
                entityId={save.entityId}
                label={save.label}
                compact
              />
            ) : null}
            {reportSelection ? <GuidanceReportButton selection={reportSelection} targetStudentId={targetStudentId} /> : null}
            {pdf ? <PdfExportButton title={pdfTitle ?? (pdfPath ? "Open / print report" : "Save as PDF")} documentPath={pdfPath} /> : null}
            {pdfPath ? (
              <ShareExportButton
                documentPath={pdfPath}
                fileName={`${(pdfTitle ?? title).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.html`}
              />
            ) : null}
          </View>
        </View>
      </View>

      {header}

      <View style={styles.bodyWrap}>
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
    gap: Spacing.md,
    flexGrow: 1,
  },
  header: {
    gap: Spacing.sm,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  breadcrumbRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  back: { minHeight: 28, justifyContent: "center" },
  backText: { fontSize: FontSize.xs, fontWeight: "600" },
  crumbSep: { fontSize: FontSize.xs },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  titleBlock: { flex: 1, minWidth: 220, gap: 3 },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 36,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  title: {
    fontSize: FontSize.display,
    fontWeight: "600",
    lineHeight: FontSize.display * 1.15,
  },
  bodyWrap: {
    marginTop: Spacing.xs,
    borderRadius: Radius.sm,
  },
});
