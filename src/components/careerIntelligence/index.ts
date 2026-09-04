/**
 * Career Intelligence component library — public barrel.
 *
 * Import everything from '@/components/careerIntelligence'. Components are
 * presentational and consume the contract in src/types/career.ts; data-driven
 * surfaces wrap content in <DataStateView> so unbuilt areas read "Coming Soon".
 */

// ── Foundation atoms ──────────────────────────────────────────
export { ComingSoon, LockedPill } from "./ComingSoon";
export { DataStateView } from "./DataStateView";
export type { DataStateViewProps } from "./DataStateView";
export { DetailScaffold } from "./DetailScaffold";
export type { DetailScaffoldProps } from "./DetailScaffold";
export { DataSourceBadge } from "./DataSourceBadge";
export { DomainMappingExplainer } from "./DomainMappingExplainer";
export type { DomainMappingExplainerProps } from "./DomainMappingExplainer";
export { DomainChip } from "./DomainChip";
export { RoleMatchBadge } from "./RoleMatchBadge";
export {
  FilterChip,
  ListRow,
  LockedTile,
  SearchBar,
  SectionLabel,
  TextTabs,
} from "./RedesignPrimitives";

// ── Search system (Phase 7) ────────────────────────────────────
export {
  SearchOverlay,
  SearchResultRow,
  SearchResultsGroup,
  SearchLoadingSkeleton,
  SearchEmptyState,
  ScopeChip,
  TermHighlight,
} from "./SearchComponents";

// ── Layout primitives (shared across all screen families) ─────
export {
  ScreenHeader,
  Card,
  Banner,
  SettingsRow,
  LinkButton,
  KeyValueRow,
  InfoCard,
  Callout,
  StatCard,
  EmptyState,
} from "./LayoutPrimitives";

// ── Career intelligence design system ─────────────────────────
export { RouteLine } from "./RouteLine";
export type {
  RouteLineProps, RouteStation, StationState, EdgeKind,
} from "./RouteLine";
export { StatTile } from "./StatTile";
export type { StatTileProps, StatTrend } from "./StatTile";


// ── Role / skill cluster ──────────────────────────────────────
export { RoleCard } from "./RoleCard";
export { RoleTypeFilter } from "./RoleTypeFilter";
export type { RoleTypeFilterValue } from "./RoleTypeFilter";
export { SkillsBridge } from "./SkillsBridge";
export { RoleClusterSection } from "./RoleClusterSection";
export type { RoleClusterSectionProps } from "./RoleClusterSection";
export { TierBadgeView } from "./TierBadgeView";
export type { TierBadgeViewProps } from "./TierBadgeView";
export { ReadinessBadgeView } from "./ReadinessBadgeView";
export type { ReadinessBadgeViewProps } from "./ReadinessBadgeView";

// ── Phase 9 enrichment display ────────────────────────────────
export { FoundationSkillsBlock } from "./FoundationSkillsBlock";
export type { FoundationSkillsBlockProps } from "./FoundationSkillsBlock";
export { ContextualItemList } from "./ContextualItemList";
export { ToolGroupsBlock } from "./ToolGroupsBlock";
export type { ToolGroupsBlockProps } from "./ToolGroupsBlock";
export { LearningResourcesBlock } from "./LearningResourcesBlock";
export type { LearningResourcesBlockProps } from "./LearningResourcesBlock";
export { MethodEvidenceBlock } from "./MethodEvidenceBlock";
export type { MethodEvidenceBlockProps } from "./MethodEvidenceBlock";
export { GuidanceEvidenceBlock } from "./GuidanceEvidenceBlock";
export type { GuidanceEvidenceBlockProps } from "./GuidanceEvidenceBlock";
export { NigerianContextBlock } from "./NigerianContextBlock";
export { RoleWorkEvidenceBlock } from "./RoleWorkEvidenceBlock";
export type { NigerianContextBlockProps } from "./NigerianContextBlock";
export { CertPlacementList } from "./CertPlacementList";
export type { CertPlacementListProps } from "./CertPlacementList";

// ── Opportunity / elite cluster ───────────────────────────────
export { OpportunityCard } from "./OpportunityCard";
export { OrganisationCard } from "./OrganisationCard";
export { ScholarshipCard } from "./ScholarshipCard";
export { ApplicationWindowCard } from "./ApplicationWindowCard";
export type { ApplicationWindowStatus } from "./ApplicationWindowCard";
export { ElitePathwayCard } from "./ElitePathwayCard";
export { BridgeView } from "./BridgeView";
export type { BridgeViewProps } from "./BridgeView";

// ── Cross-cutting widgets ─────────────────────────────────────
export { LevelUpCTA } from "./LevelUpCTA";
export type { LevelUpCTAProps } from "./LevelUpCTA";
export { SaveButton } from "./SaveButton";
export { SubscribeButton } from "./SubscribeButton";
export { NotesWidget } from "./NotesWidget";
export { PdfExportButton } from "./PdfExportButton";
export { ShareExportButton } from "./ShareExportButton";
export { GuidanceReportButton, invalidateGuidancePathCache } from "./GuidanceReportButton";
export { MappingFeedbackButton } from "./MappingFeedbackButton";
export type { MappingFeedbackButtonProps } from "./MappingFeedbackButton";

// ── Toast system ───────────────────────────────────────────────
export { Toast, ToastProvider, showToast } from "./Toast";
export type { ToastVariant } from "./Toast";

// ── Status badge ───────────────────────────────────────────────
export { StatusBadge } from "./StatusBadge";
export type { StatusKey } from "./StatusBadge";

// ── Skeleton shimmer set ───────────────────────────────────────
export {
  Skeleton,
  SkeletonText,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonRow,
  SkeletonStat,
} from "./SkeletonRedesign";

// ── Persona card ───────────────────────────────────────────────
export { PersonaCard } from "./PersonaCard";
export type { PersonaOption } from "./PersonaCard";

// ── Application window timeline ────────────────────────────────
export { ApplicationWindowTimeline } from "./ApplicationWindowTimeline";
export type { TimelineWindow } from "./ApplicationWindowTimeline";

// ── Phase 10–13 shells (UX / comprehension / legal) ───────────
export { InfoTooltip } from "./InfoTooltip";
export type { InfoTooltipProps } from "./InfoTooltip";
export { CareerDisclaimer } from "./CareerDisclaimer";
export type { CareerDisclaimerProps } from "./CareerDisclaimer";
export { NotesFab } from "./NotesFab";
export type { NotesFabProps } from "./NotesFab";
export { CoachMark } from "./CoachMark";
export type { CoachMarkProps } from "./CoachMark";
export { ExploreGuide } from "./ExploreGuide";

// ── Metric tooltip (relocated from admin/) ────────────────────
export { MetricTooltip } from "./MetricTooltip";
export type { MetricTooltipProps } from "./MetricTooltip";

// ── Input components (Phase 8) ───────────────────────────────
export {
  SifterTextInput,
  SifterSelect,
  ChipSelect,
  SifterDatePicker,
} from "./InputComponents";
export type { SelectOption } from "./InputComponents";

// ── Banner variants (Phase 8) ────────────────────────────────
export type { BannerVariant } from "./LayoutPrimitives";

// ── Domain icon system (Phase 12) ────────────────────────────
export { DomainIcon } from "./DomainIcon";
export type { DomainIconProps } from "./DomainIcon";

// ── What a degree teaches (CCMAS learning-outcome profile) ────
export { DegreeSkills } from "./DegreeSkills";
export type { DegreeSkillsProps } from "./DegreeSkills";
