/**
 * DetailScaffold — shared chrome for every Explore detail screen (programme,
 * role, domain). Provides a back button and an optional Save action row, a
 * title/eyebrow header, and a scrollable body that renders a DataState
 * gracefully (Coming Soon / Pending / Error) before showing content.
 */
import React, { useCallback, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  type NativeSyntheticEvent,
  type NativeScrollEvent,
  useWindowDimensions,
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
import { useAuth } from "@/hooks/useAuth";
import { DetailScrollProvider, DetailViewportOverlayProvider } from "./DetailScrollContext";

export interface DetailScaffoldProps<T> {
  eyebrow?: string;
  title: string;
  /** Compact action rendered alongside the title. */
  titleAccessory?: ReactNode;
  /** Visible contextual back label. */
  backLabel?: string;
  /** A deterministic back transition for a focused guidance flow. */
  onBack?: () => void;
  /** When provided, a Save bookmark action appears in the header. */
  save?: { entityType: SavedEntityType; entityId: string; label?: string };
  /** Show online report printing/download action. */
  pdf?: boolean;
  /** Export is only available after the guidance route reaches its review step. */
  reportActionsEnabled?: boolean;
  pdfTitle?: string;
  /** Authenticated report endpoint; fails closed when offline. */
  pdfPath?: string;
  /** Explicitly add this selected branch to the student's report path. */
  reportSelection?: GuidanceReportSelection;
  /** When an administrator is guiding a student, save to that student. */
  targetStudentId?: string;
  /** The data envelope the body renders from. */
  state: DataState<T>;
  /** Render the populated body. */
  children: (data: T) => ReactNode;
  /** Retry a transient request failure. */
  onRetry?: () => void;
  /** Optional content rendered above the DataStateView (e.g. tabs). */
  header?: ReactNode;
  empty?: (data: T) => boolean;
  /** Show the career-guidance disclaimer at the foot of the body. Default true. */
  disclaimer?: boolean;
  /** External ref to the inner ScrollView (for section nav scroll-to). */
  scrollRef?: RefObject<ScrollView | null>;
  /** Scroll event handler (for section nav active tracking). */
  onScroll?: (e: NativeSyntheticEvent<NativeScrollEvent>) => void;
  /** Gate the full entity body behind an account while leaving a useful preview. */
  requiresAccountForDetails?: boolean;
  guestDescription?: string | null;
  /** Let the D078 method-aware journey use its three-column desktop layout. */
  wideContent?: boolean;
  /** The D078 body supplies its own full-size screen heading. */
  hideScreenTitle?: boolean;
  /** Hide staff-style entity eyebrows on the D078 learning journey. */
  hideEyebrow?: boolean;
}

export function d078ContentGutter(width: number): number {
  return width < 768 ? 16 : 24;
}

export function DetailScaffold<T>({
  eyebrow,
  title,
  titleAccessory,
  backLabel = "Back",
  onBack,
  save,
  pdf,
  reportActionsEnabled = false,
  pdfTitle,
  pdfPath,
  reportSelection,
  targetStudentId,
  state,
  children,
  onRetry,
  header,
  empty,
  disclaimer = true,
  scrollRef,
  onScroll,
  requiresAccountForDetails = false,
  guestDescription,
  wideContent = false,
  hideScreenTitle = false,
  hideEyebrow = false,
}: DetailScaffoldProps<T>) {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const isGuest = !user || user.auth_provider === "guest";
  const fallbackScrollRef = useRef<ScrollView>(null);
  const activeScrollRef = scrollRef ?? fallbackScrollRef;
  const [viewportOverlay, setViewportOverlay] = useState<(() => ReactNode) | null>(null);
  const setViewportOverlayRenderer = useCallback((renderOverlay: (() => ReactNode) | null) => {
    setViewportOverlay(() => renderOverlay);
  }, []);
  const scrollOffsetRef = useRef(0);
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
    onScroll?.(event);
  };
  const goBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    const canGoBack = typeof (router as typeof router & { canGoBack?: () => boolean }).canGoBack === "function"
      && (router as typeof router & { canGoBack: () => boolean }).canGoBack();
    if (canGoBack) {
      router.back();
    } else {
      router.replace("/(tabs)/explore" as never);
    }
  };

  return (
    <DetailScrollProvider value={{ scrollRef: activeScrollRef, scrollOffsetRef }}>
      <DetailViewportOverlayProvider value={{ setOverlay: setViewportOverlayRenderer }}>
      <View style={styles.viewport}>
      <ScrollView
      ref={activeScrollRef}
      onScroll={handleScroll}
      style={{ flex: 1, backgroundColor: colors.surface.base }}
      contentContainerStyle={[
        styles.scroll,
        webContainer as object,
        wideContent ? styles.wideWebContainer : null,
        wideContent ? { paddingHorizontal: d078ContentGutter(width) } : null,
        viewportOverlay ? styles.scrollWithViewportOverlay : null,
      ]}
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
          <TouchableOpacity
            onPress={goBack}
            hitSlop={10}
            style={[styles.back, wideContent ? styles.d078Back : null]}
          >
            <Feather name="arrow-left" size={15} color={colors.textRole.secondary} />
            <Text style={[styles.backText, styles.backLabel, wideContent ? styles.d078BackText : null, { color: colors.textRole.secondary }]}>
              {backLabel}
            </Text>
          </TouchableOpacity>
          {!hideEyebrow ? <>
            <Text style={[styles.crumbSep, { color: colors.textRole.muted }]}>/</Text>
            <Text
              style={[styles.backText, CompassFonts.data, { color: colors.textRole.muted }]}
              numberOfLines={1}
            >
              {eyebrow ?? "DETAIL"}
            </Text>
          </> : null}
        </View>

        <View style={styles.titleRow}>
          {!hideScreenTitle ? <View style={styles.titleBlock}>
            {eyebrow && !hideEyebrow ? (
              <Text style={[styles.eyebrow, { color: colors.textRole.muted }]}>
                {eyebrow}
              </Text>
            ) : null}
            <View style={styles.titleContentRow}>
              <Text style={[styles.title, CompassFonts.displaySemi, { color: colors.textRole.primary }]}>
                {title}
              </Text>
              {titleAccessory}
            </View>
          </View> : null}
          <View style={styles.actions}>
            {save ? (
              <SaveButton
                entityType={save.entityType}
                entityId={save.entityId}
                label={save.label}
                compact
              />
            ) : null}
            {reportSelection && !isGuest ? <GuidanceReportButton selection={reportSelection} targetStudentId={targetStudentId} /> : null}
            {reportActionsEnabled && pdf && !isGuest ? <PdfExportButton title={pdfTitle ?? (pdfPath ? "Open / print report" : "Save as PDF")} documentPath={pdfPath} /> : null}
            {reportActionsEnabled && pdfPath && !isGuest ? <ShareExportButton documentPath={pdfPath} fileName={`${(pdfTitle ?? title).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-report.html`} /> : null}
          </View>
        </View>
      </View>

      {header}

      <View style={styles.bodyWrap}>
        <DataStateView state={state} empty={empty} spinnerOnPending={!state.data} onRetry={onRetry}>
          {isGuest && requiresAccountForDetails
            ? () => (
                <GuestDetailPreview
                  eyebrow={eyebrow}
                  description={guestDescription}
                  onContinue={() => router.push("/(auth)/sign-in" as never)}
                />
              )
            : children}
        </DataStateView>
      </View>

      {disclaimer ? <CareerDisclaimer variant="footer" /> : null}
      </ScrollView>
      {viewportOverlay ? <View pointerEvents="box-none" style={styles.viewportOverlay}>{viewportOverlay()}</View> : null}
      </View>
      </DetailViewportOverlayProvider>
    </DetailScrollProvider>
  );
}

export default DetailScaffold;

function GuestDetailPreview({
  eyebrow,
  description,
  onContinue,
}: {
  eyebrow?: string;
  description?: string | null;
  onContinue: () => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.guestPreview, { backgroundColor: colors.surface.subtle, borderColor: colors.borderRole.subtle }]}>
      <Feather name="lock" size={20} color={colors.accentRole.action} />
      <Text style={[styles.guestEyebrow, { color: colors.textRole.muted }]}>{eyebrow ?? "PREVIEW"}</Text>
      <Text style={[styles.guestTitle, { color: colors.textRole.primary }]}>You are viewing a public preview</Text>
      {description ? <Text style={[styles.guestDescription, { color: colors.textRole.secondary }]}>{description}</Text> : null}
      <Text style={[styles.guestDescription, { color: colors.textRole.secondary }]}>
        Create an account to open the full explanation, priority preparation, connected items, and guided next steps.
      </Text>
      <TouchableOpacity onPress={onContinue} activeOpacity={0.8} style={[styles.guestCta, { backgroundColor: colors.accentRole.action }]}>
        <Text style={[styles.guestCtaText, { color: colors.textRole.inverse }]}>Sign in or create account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { flex: 1, backgroundColor: "transparent" },
  viewportOverlay: { ...StyleSheet.absoluteFillObject },
  scrollWithViewportOverlay: { paddingBottom: 112 },
  wideWebContainer: { maxWidth: 1440 },
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
  back: { minHeight: 28, flexDirection: "row", alignItems: "center", gap: Spacing.xs },
  d078Back: { minHeight: 44 },
  backText: { fontSize: FontSize.xs, fontWeight: "600" },
  backLabel: { fontSize: FontSize.md },
  d078BackText: { fontSize: 16, lineHeight: 20 },
  crumbSep: { fontSize: FontSize.xs },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: Spacing.md,
    flexWrap: "wrap",
  },
  titleBlock: { flex: 1, minWidth: 220, gap: 3 },
  titleContentRow: { flexDirection: "row", alignItems: "center", gap: Spacing.sm },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    minHeight: 36,
  },
  guestPreview: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    alignItems: "flex-start",
  },
  guestEyebrow: { fontSize: FontSize.xs, fontWeight: "700", letterSpacing: 0.9 },
  guestTitle: { fontSize: FontSize.lg, fontWeight: "800" },
  guestDescription: { fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.5 },
  guestCta: { minHeight: 44, borderRadius: Radius.full, paddingHorizontal: Spacing.lg, justifyContent: "center", marginTop: Spacing.xs },
  guestCtaText: { fontSize: FontSize.sm, fontWeight: "800" },
  eyebrow: {
    fontSize: FontSize.xs,
    fontWeight: "600",
    letterSpacing: 0.9,
    textTransform: "uppercase",
  },
  title: {
    flexShrink: 1,
    fontSize: FontSize.display,
    fontWeight: "600",
    lineHeight: FontSize.display * 1.15,
  },
  bodyWrap: {
    marginTop: Spacing.xs,
    borderRadius: Radius.sm,
  },
});
