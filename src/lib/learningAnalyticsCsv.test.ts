import { buildLearningInterestCsv } from "@/lib/learningAnalyticsCsv";
import type { LearningInterestAnalytics } from "@/types/learningAnalytics";

const sample: LearningInterestAnalytics = {
  scope: "platform",
  updated_at: "2026-10-28T10:00:00Z",
  activity_window: { since: "2026-09-28T10:00:00Z", until: "2026-10-28T10:00:00Z" },
  learners_who_added: 3,
  learners_who_removed: 1,
  currently_selected_learners: 4,
  currently_selected_contexts: 8,
  currently_selected_route_patterns: 1,
  selection_additions: 5,
  selection_removals: 2,
  route_combinations_total: 2,
  top_selections: [{
    entity_type: "tool", entity_id: "tool-1", entity_label: "=HYPERLINK(\"https://bad.invalid\")",
    currently_selected_learners: 2, current_contexts: 2, learners: 3,
    selected_contexts: 2, additions: 4, removals: 1, latest_context: "D078 route",
  }],
  top_current_routes: [{
    route_key: "current-hash", route_label: "Sociology → Social Sciences → Qualitative",
    currently_selected_learners: 2, selection_contexts: 2,
  }],
  top_routes: [{ route_key: "recent-hash", route_label: "Recent Sociology route", learners: 3, additions: 4 }],
  daily_activity: [{ day: "2026-10-27", additions: 2, removals: 1, learners: 2 }],
};

describe("learning-interest CSV export", () => {
  it("includes exact report window, scope, and active filters with both current and recent routes", () => {
    const csv = buildLearningInterestCsv(sample, 30, "tool", ["Programme: Sociology", "State: Lagos"]);
    expect(csv).toContain('"Report metadata","Audience scope","LevelUp platform-wide aggregate"');
    expect(csv).toContain('"2026-09-28T10:00:00Z to 2026-10-28T10:00:00Z"');
    expect(csv).toContain('"Programme: Sociology | State: Lagos"');
    expect(csv).toContain('"Current route context","route context","Sociology → Social Sciences → Qualitative"');
    expect(csv).toContain('"Selection context","route context","Recent Sociology route"');
    expect(csv).toContain('"Daily activity","date","2026-10-27","","","","2","1","","2 unique learners who added a choice"');
  });

  it("neutralizes ASCII and full-width spreadsheet formula markers in learner/item-provided labels", () => {
    const csv = buildLearningInterestCsv(sample, 30, "all", []);
    expect(csv).toContain('"\t=HYPERLINK(');
    const fullWidth = buildLearningInterestCsv({
      ...sample,
      top_selections: sample.top_selections.map((row) => ({ ...row, entity_label: " ＝1+1" })),
    }, 30, "all", []);
    expect(fullWidth).toContain('"\t ＝1+1"');
  });
});
