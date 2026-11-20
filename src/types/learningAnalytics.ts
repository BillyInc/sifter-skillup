export interface LearningInterestSelection {
  entity_type: string;
  entity_id: string;
  entity_label: string;
  currently_selected_learners: number;
  current_contexts: number;
  learners: number;
  selected_contexts: number;
  additions: number;
  removals: number;
  latest_context: string | null;
}

export interface LearningInterestRoute {
  route_key: string;
  route_label: string;
  learners: number;
  additions: number;
}

export interface LearningInterestCurrentRoute {
  route_key: string;
  route_label: string;
  currently_selected_learners: number;
  selection_contexts: number;
}

export interface LearningInterestAnalytics {
  scope: "platform" | "school";
  updated_at: string;
  activity_window: { since: string; until: string };
  learners_who_added: number;
  learners_who_removed: number;
  currently_selected_learners: number;
  currently_selected_contexts: number;
  currently_selected_route_patterns: number;
  selection_additions: number | null;
  selection_removals: number | null;
  route_combinations_total: number;
  previous_period?: {
    since: string;
    until: string;
    learners_who_added: number;
    learners_who_removed: number;
    selection_additions: number;
    selection_removals: number;
  } | null;
  top_selections: LearningInterestSelection[];
  top_current_routes: LearningInterestCurrentRoute[];
  top_routes: LearningInterestRoute[];
  daily_activity: Array<{ day: string; additions: number; removals: number; learners: number }>;
}

export interface LearningInterestFilterOption {
  filter_type: string;
  filter_id: string;
  filter_label: string;
  learners: number;
}

export interface LearningInterestSchoolOption {
  school_id: string;
  school_name: string;
  institution_type: string;
}
