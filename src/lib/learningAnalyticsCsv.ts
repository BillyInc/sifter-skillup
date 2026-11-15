import type { LearningInterestAnalytics } from "@/types/learningAnalytics";

function csvCell(value: unknown): string {
  const source = String(value ?? "");
  // Excel may execute formula-like CSV cells and can strip apostrophe/escape
  // defenses on save/reopen. A leading tab keeps these human-viewed exports
  // inert in Excel; do not use this CSV as a machine-to-machine interchange.
  const safe = /^[\u0000-\u0020\u00a0\ufeff]*[=+\-@＝＋－＠]/u.test(source) ? `\t${source}` : source;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function buildLearningInterestCsv(
  data: LearningInterestAnalytics,
  days: number,
  choiceType: string,
  filters: string[],
): string {
  const rows: unknown[][] = [
    ["Record type", "Choice type", "Name", "Currently selected learners", "Current contexts", "Learners who added in period", "Add actions", "Remove actions", "Recent contexts", "Notes"],
    ["Report metadata", "Audience scope", data.scope === "platform" ? "LevelUp platform-wide aggregate" : "Verified institution aggregate", "", "", "", "", "", "", "Aggregate only; no learner identities"],
    ["Report metadata", "Activity window", `${data.activity_window.since} to ${data.activity_window.until}`, "", "", "", "", "", "", `Last ${days} days; end time is exclusive`],
    ["Report metadata", "Choice type", choiceType, "", "", "", "", "", "", ""],
    ["Report metadata", "Applied filter", filters.length ? filters.join(" | ") : "None", "", "", "", "", "", "", ""],
    ["Report metadata", "Generated at", data.updated_at, "", "", "", "", "", "", ""],
    ["Summary", "all", "Learners who added", "", "", data.learners_who_added, "", "", "", `Unique opted-in learners who added at least one choice during the selected ${days}-day window`],
    ["Summary", "all", "Learners who removed", "", "", data.learners_who_removed, "", "", "", `Unique opted-in learners who removed at least one choice during the selected ${days}-day window`],
    ["Summary", "all", "Add actions", "", "", "", data.selection_additions, "", "", "Explicit selection additions; not page views"],
    ["Summary", "all", "Remove actions", "", "", "", "", data.selection_removals, "", "Explicit selection removals"],
    ["Summary", "all", "Currently selected learners", data.currently_selected_learners, data.currently_selected_contexts, "", "", "", "", "Active consented selections; not completion"],
    ["Summary", "all", "Current route patterns", "", data.currently_selected_route_patterns, "", "", "", "", "Distinct active route contexts with selected choices; not completed routes"],
    ["Summary", "all", "Recent selection contexts", "", "", "", "", "", data.route_combinations_total, "Event contexts attached to additions in the selected window; top 50 are listed below"],
    ...(data.previous_period ? [
      ["Comparison", "all", "Previous-period learners who added", "", "", data.previous_period.learners_who_added, "", "", "", `${data.previous_period.since} to ${data.previous_period.until}`],
      ["Comparison", "all", "Previous-period learners who removed", "", "", data.previous_period.learners_who_removed, "", "", "", `${data.previous_period.since} to ${data.previous_period.until}`],
      ["Comparison", "all", "Previous-period add actions", "", "", "", data.previous_period.selection_additions, "", "", `${data.previous_period.since} to ${data.previous_period.until}`],
      ["Comparison", "all", "Previous-period remove actions", "", "", "", "", data.previous_period.selection_removals, "", `${data.previous_period.since} to ${data.previous_period.until}`],
    ] : []),
    ...data.top_selections.map((row) => ["Choice", row.entity_type, row.entity_label, row.currently_selected_learners, row.current_contexts, row.learners, row.additions, row.removals, row.selected_contexts, row.latest_context || "Multiple learning routes"]),
    ...data.top_current_routes.map((route) => ["Current route context", "route context", route.route_label, route.currently_selected_learners, route.selection_contexts, "", "", "", "", "Active selected context; not proof of a completed or saved route"]),
    ...data.top_routes.map((row) => ["Selection context", "route context", row.route_label, "", "", row.learners, row.additions, "", "", "Attached to added choices; not proof of a complete saved or completed route"]),
    ...data.daily_activity.map((row) => ["Daily activity", "date", row.day, "", "", "", row.additions, row.removals, "", `${row.learners} unique learners who added a choice`]),
  ];
  return rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
