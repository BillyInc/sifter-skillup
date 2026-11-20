import React from "react";
import { Dimensions } from "react-native";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { API } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { LearningInterestScreen } from "./LearningInterestScreen";

jest.mock("@/lib/api", () => ({ API: { getLearningInterestAnalytics: jest.fn(), getLearningInterestFilterOptions: jest.fn(), getLearningInterestSchools: jest.fn() } }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: jest.fn() }));
jest.mock("./AdminShell", () => ({ AdminShell: ({ children }: { children: React.ReactNode }) => <>{children}</> }));

const sample = {
  scope: "platform",
  updated_at: "2026-10-27T10:00:00Z",
  activity_window: { since: "2026-09-27T10:00:00Z", until: "2026-10-27T10:00:00Z" },
  learners_who_added: 18,
  learners_who_removed: 2,
  currently_selected_learners: 21,
  currently_selected_contexts: 43,
  currently_selected_route_patterns: 1,
  selection_additions: 27,
  selection_removals: 3,
  route_combinations_total: 62,
  previous_period: {
    since: "2026-09-27T10:00:00Z",
    until: "2026-10-27T10:00:00Z",
    learners_who_added: 12,
    learners_who_removed: 1,
    selection_additions: 20,
    selection_removals: 4,
  },
  top_selections: [{
    entity_type: "domain", entity_id: "D078", entity_label: "Social Sciences",
    currently_selected_learners: 15, current_contexts: 31,
    learners: 18, selected_contexts: 1, additions: 20, removals: 2,
    latest_context: "Sociology → University of Lagos → Social Sciences",
  }],
  top_current_routes: [{ route_key: "current-route-hash", route_label: "Sociology → Social Sciences → Qualitative research", currently_selected_learners: 11, selection_contexts: 13 }],
  top_routes: [{ route_key: "route-hash", route_label: "Sociology → Social Sciences → Qualitative research", learners: 14, additions: 17 }],
  daily_activity: [{ day: "2026-10-27", additions: 7, removals: 3, learners: 12 }],
};

describe("LearningInterestScreen", () => {
  beforeEach(() => {
    (API.getLearningInterestAnalytics as jest.Mock).mockResolvedValue(sample);
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [] });
    (API.getLearningInterestSchools as jest.Mock).mockResolvedValue({ schools: [] });
  });

  it("shows current selection counts separately from programme/domain activity and route aggregates", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await waitFor(() => expect(screen.getAllByText("Social Sciences").length).toBeGreaterThan(0));
    expect(screen.getByText("Programmes")).toBeTruthy();
    expect(screen.getByText("Domains")).toBeTruthy();
    expect(screen.getByText("Active route contexts")).toBeTruthy();
    expect(screen.getByLabelText("Active route contexts: 43")).toBeTruthy();
    expect(screen.getByText(/Distinct learner route scopes with at least one current choice; 1 labeled route pattern is represented\./)).toBeTruthy();
    expect(screen.getByText(/62 route patterns added in this time window/)).toBeTruthy();
    expect(screen.getByText(/Showing up to 100 choices/)).toBeTruthy();
    expect(screen.getAllByText("Sociology → Social Sciences → Qualitative research").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Learners who added a choice")).toBeTruthy();
    expect(screen.getByText("Learners with choices selected now")).toBeTruthy();
    expect(screen.getByText(/A zero means no matching opted-in choices were recorded/)).toBeTruthy();
    const firstMetric = screen.getAllByTestId(/^learning-interest-metric-/)[0];
    expect(within(firstMetric).getByText("Learners with choices selected now")).toBeTruthy();
    expect(screen.getByText("Current route patterns selected now")).toBeTruthy();
    expect(screen.getByText("13 active contexts")).toBeTruthy();
    expect(screen.getByText("Recent route patterns attached to choices")).toBeTruthy();
    expect(screen.getByText("11 learners selected now")).toBeTruthy();
    expect(screen.getByText("Learning choices selected now and recently")).toBeTruthy();
    expect(screen.getByText("15", { exact: true })).toBeTruthy();
    expect(screen.getByText("Learners who removed a choice")).toBeTruthy();
    expect(screen.getByText("+7 (+35%) vs previous period")).toBeTruthy();
    expect(screen.getByText("+6 (+50%) vs previous period")).toBeTruthy();
    expect(screen.getByText("+1 (+100%) vs previous period")).toBeTruthy();
    expect(API.getLearningInterestAnalytics).toHaveBeenCalledWith(expect.objectContaining({ scope: "platform" }));
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [{ filter_type: "state", filter_id: "LAGOS", filter_label: "Lagos", learners: 8 }] });
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Lagos");
    await waitFor(() => expect(API.getLearningInterestFilterOptions).toHaveBeenCalledWith({ query: "Lagos", days: 30 }));
    fireEvent.press(await screen.findByRole("button", { name: "Select State filter: Lagos" }));
    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({ state: "LAGOS" })));
    expect(screen.getByLabelText("Remove Lagos filter")).toBeTruthy();
    fireEvent.press(screen.getByLabelText("Clear all filters"));
    await waitFor(() => expect(screen.queryByLabelText("Remove Lagos filter")).toBeNull());
    fireEvent.press(screen.getByText("365 days"));
    await waitFor(() => expect(screen.getByText(/Monthly additions and removals are grouped for readability/)).toBeTruthy());
    expect(screen.getByText("Oct 26")).toBeTruthy();
    expect(screen.getByLabelText("Scrollable selection activity chart")).toBeTruthy();
    expect(screen.getByLabelText("Oct 26: 7 additions and 3 removals")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Oct 26: 7 additions and 3 removals" })).toBeTruthy();
  });

  it("uses school-scoped aggregates for non-product staff", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: false } });
    (API.getLearningInterestSchools as jest.Mock).mockResolvedValue({ schools: [
      { school_id: "school-1", school_name: "School One", institution_type: "secondary_school" },
    ] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);
    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenCalledWith(expect.objectContaining({ scope: "school", school_id: "school-1" })));
    expect(screen.getByText("School One · secondary_school")).toBeTruthy();
  });

  it("explains that analytics setup is pending and offers a retry", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestAnalytics as jest.Mock).mockRejectedValueOnce(new Error(
      "Learner-interest analytics is not ready yet. The database updates may be missing or the schema cache may need refreshing. Ask the system administrator to complete the analytics setup, then try again.",
    ));
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    expect(await screen.findByText(/Learner-interest analytics is not ready yet/)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Try again" })).toBeTruthy();
  });

  it("requires a multi-school admin to choose a verified school and scopes analytics and filter search to it", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: false } });
    (API.getLearningInterestSchools as jest.Mock).mockResolvedValue({ schools: [
      { school_id: "school-1", school_name: "School One", institution_type: "secondary_school" },
      { school_id: "school-2", school_name: "School Two", institution_type: "university" },
    ] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    fireEvent.press(await screen.findByRole("button", { name: "School One · secondary_school" }));
    await screen.findByLabelText("Learners with choices selected now: 21");
    let finishSchoolRefresh!: (value: typeof sample) => void;
    (API.getLearningInterestAnalytics as jest.Mock).mockImplementationOnce(() => new Promise((resolve) => {
      finishSchoolRefresh = resolve;
    }));
    const schoolChoice = await screen.findByRole("button", { name: "School Two · university" });
    fireEvent.press(schoolChoice);
    expect(await screen.findByText("Loading aggregate learning choices…")).toBeTruthy();
    expect(screen.queryByLabelText("Learners with choices selected now: 21")).toBeNull();
    await waitFor(() => expect(finishSchoolRefresh).toBeDefined());
    await act(async () => { finishSchoolRefresh({ ...sample, currently_selected_learners: 9 }); });
    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenCalledWith(expect.objectContaining({
      scope: "school", school_id: "school-2",
    })));
    expect(await screen.findByLabelText("Learners with choices selected now: 9")).toBeTruthy();
    await screen.findByText("Learning choices selected now and recently");
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Python");
    await waitFor(() => expect(API.getLearningInterestFilterOptions).toHaveBeenCalledWith({
      query: "Python", days: 30, school_id: "school-2",
    }));
  });

  it("uses stacked choice cards on a narrow desktop with the admin navigation rail", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    const priorWindow = Dimensions.get("window");
    const priorScreen = Dimensions.get("screen");
    Dimensions.set({ window: { ...priorWindow, width: 1024 }, screen: { ...priorScreen, width: 1024 } });
    const rendered = render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);
    try {
      await waitFor(() => expect(screen.getByTestId("learning-interest-selection-card")).toBeTruthy());
      expect(screen.queryByText("Choice", { exact: true })).toBeNull();
      expect(screen.getByText("Current route patterns selected now")).toBeTruthy();
    } finally {
      rendered.unmount();
      act(() => Dimensions.set({ window: priorWindow, screen: priorScreen }));
    }
  });

  it("uses stacked choice cards at a 1280px desktop width after shell padding", async () => {
    const priorWindow = Dimensions.get("window");
    const priorScreen = Dimensions.get("screen");
    Dimensions.set({ window: { ...priorWindow, width: 1280 }, screen: { ...priorScreen, width: 1280 } });
    try {
      (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
      render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

      expect(await screen.findAllByTestId("learning-interest-selection-card")).toHaveLength(sample.top_selections.length);
      expect(screen.queryByText("Choice", { exact: true })).toBeNull();
    } finally {
      act(() => Dimensions.set({ window: priorWindow, screen: priorScreen }));
    }
  });

  it("filters analytics by selected programme and domain labels, not typed IDs", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [
      { filter_type: "programme", filter_id: "sociology-id", filter_label: "Sociology", learners: 12 },
      { filter_type: "domain", filter_id: "D078", filter_label: "Social Sciences", learners: 12 },
    ] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await screen.findByText("Learning choices selected now and recently");
    const search = screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name");
    fireEvent.changeText(search, "Sociology");
    fireEvent.press(await screen.findByRole("button", { name: "Select Programme filter: Sociology" }));
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Social Sciences");
    fireEvent.press(await screen.findByRole("button", { name: "Select Domain filter: Social Sciences" }));

    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({
      programme_id: "sociology-id", domain_id: "D078", scope: "platform",
    })));
    expect(screen.getByLabelText("Remove Sociology filter")).toBeTruthy();
    expect(screen.getByLabelText("Remove Social Sciences filter")).toBeTruthy();
  });

  it("searches and filters a named route pattern beyond the route preview", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [{
      filter_type: "route_pattern", filter_id: "route-hash",
      filter_label: "Sociology → Social Sciences → Qualitative research", learners: 4,
    }] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await screen.findByText("Learning choices selected now and recently");
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Qualitative");
    fireEvent.press(await screen.findByRole("button", { name: /Select Route Pattern filter: Sociology/ }));

    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({
      item_type: "route_pattern", item_id: "route-hash", scope: "platform",
    })));
    expect(screen.getByLabelText("Remove Sociology → Social Sciences → Qualitative research filter")).toBeTruthy();
  });

  it("keeps filters and current results available while a filtered aggregate refreshes", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [
      { filter_type: "programme", filter_id: "sociology-id", filter_label: "Sociology", learners: 12 },
    ] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);
    await screen.findByText("Learning choices selected now and recently");

    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Sociology");
    fireEvent.press(await screen.findByRole("button", { name: "Select Programme filter: Sociology" }));

    const pendingRefreshes: Array<(value: typeof sample) => void> = [];
    (API.getLearningInterestAnalytics as jest.Mock).mockImplementation(() => new Promise((resolve) => {
      pendingRefreshes.push(resolve);
    }));
    fireEvent.press(screen.getByLabelText("Remove Sociology filter"));
    expect(await screen.findByText(/Updating results; the dashboard still shows the previous result set/)).toBeTruthy();
    expect(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name")).toBeTruthy();
    expect(screen.getByText("Learning choices selected now and recently")).toBeTruthy();

    await waitFor(() => expect(pendingRefreshes.length).toBeGreaterThan(0));
    await act(async () => {
      pendingRefreshes.forEach((resolve) => resolve(sample));
    });
    await waitFor(() => expect(screen.queryByText(/Updating results; the dashboard still shows the previous result set/)).toBeNull());
  });

  it("keeps the last successful dashboard visible and retryable when a refresh fails", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);
    await screen.findByText("Learning choices selected now and recently");

    (API.getLearningInterestAnalytics as jest.Mock).mockRejectedValueOnce(new Error("temporary refresh failure"));
    fireEvent.press(screen.getByText("90 days"));

    expect(await screen.findByText(/Could not refresh analytics\. Showing the last successfully loaded results\. temporary refresh failure/)).toBeTruthy();
    expect(screen.getByText("Learning choices selected now and recently")).toBeTruthy();
    expect(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name")).toBeTruthy();

    fireEvent.press(screen.getByRole("button", { name: "Retry analytics refresh" }));
    await waitFor(() => expect(screen.queryByText(/Could not refresh analytics/)).toBeNull());
  });

  it("ignores an older analytics response that arrives after a newer filter response", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);
    await screen.findByText("Learning choices selected now and recently");

    let resolve90!: (value: typeof sample) => void;
    let resolve365!: (value: typeof sample) => void;
    (API.getLearningInterestAnalytics as jest.Mock)
      .mockImplementationOnce(() => new Promise((resolve) => { resolve90 = resolve; }))
      .mockImplementationOnce(() => new Promise((resolve) => { resolve365 = resolve; }));

    fireEvent.press(screen.getByText("90 days"));
    fireEvent.press(screen.getByText("365 days"));
    resolve365({ ...sample, currently_selected_learners: 99 });
    await waitFor(() => expect(screen.getByLabelText("Learners with choices selected now: 99")).toBeTruthy());

    resolve90({ ...sample, currently_selected_learners: 88 });
    await waitFor(() => expect(screen.getByLabelText("Learners with choices selected now: 99")).toBeTruthy());
    expect(screen.queryByLabelText("Learners with choices selected now: 88")).toBeNull();
  });

  it("keeps only one exact item filter because the analytics API accepts one item ID", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [
      { filter_type: "tool", filter_id: "python", filter_label: "Python", learners: 8 },
      { filter_type: "skill", filter_id: "sampling", filter_label: "Sampling", learners: 5 },
    ] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await screen.findByText("Learning choices selected now and recently");
    const search = screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name");
    fireEvent.changeText(search, "Python");
    fireEvent.press(await screen.findByRole("button", { name: "Select Tool filter: Python" }));
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Sampling");
    fireEvent.press(await screen.findByRole("button", { name: "Select Skill filter: Sampling" }));

    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({
      item_type: "skill", item_id: "sampling", scope: "platform",
    })));
    expect(screen.queryByLabelText("Remove Python filter")).toBeNull();
    expect(screen.getByLabelText("Remove Sampling filter")).toBeTruthy();
  });

  it("filters platform results by affiliated school separately from the explored institution", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestFilterOptions as jest.Mock).mockResolvedValue({ options: [{
      filter_type: "affiliation_school", filter_id: "26ce26b0-5eac-5286-b8b5-179e56a6b320",
      filter_label: "University of Lagos", learners: 17,
    }] });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await screen.findByText("Learning choices selected now and recently");
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "University of Lagos");
    fireEvent.press(await screen.findByRole("button", { name: "Select Affiliated school filter: University of Lagos" }));

    await waitFor(() => expect(API.getLearningInterestAnalytics).toHaveBeenLastCalledWith(expect.objectContaining({
      scope: "platform", affiliation_school_id: "26ce26b0-5eac-5286-b8b5-179e56a6b320",
    })));
    expect(screen.getByText(/“Institution” means the university or centre the learner explored/)).toBeTruthy();
    expect(screen.getByLabelText("Remove University of Lagos filter")).toBeTruthy();
  });

  it("shows exact small-cohort counts instead of suppressing them", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: false } });
    (API.getLearningInterestSchools as jest.Mock).mockResolvedValue({ schools: [
      { school_id: "school-1", school_name: "School One", institution_type: "secondary_school" },
    ] });
    (API.getLearningInterestAnalytics as jest.Mock).mockResolvedValue({
      ...sample,
      currently_selected_learners: 1,
      scope: "school",
      learners_who_added: 1,
      learners_who_removed: 1,
      top_selections: [{ ...sample.top_selections[0], learners: 1, additions: 1, removals: 0 }],
      top_routes: [{ ...sample.top_routes[0], learners: 1, additions: 1 }],
      daily_activity: [{ day: "2026-10-27", additions: 1, removals: 1, learners: 1 }],
    });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await waitFor(() => expect(screen.getAllByText("1", { exact: true }).length).toBeGreaterThan(0));
    expect(screen.queryByText(/hidden because fewer than/i)).toBeNull();
    expect(screen.queryByText(/privacy threshold/i)).toBeNull();
  });

  it("explains increases from a zero-activity previous period without inventing a percentage", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestAnalytics as jest.Mock).mockResolvedValue({
      ...sample,
      selection_additions: 3,
      previous_period: { ...sample.previous_period, selection_additions: 0 },
    });
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    expect(await screen.findByText("+3 vs previous period; no activity then")).toBeTruthy();
  });

  it("distinguishes a failed filter search from an empty result", async () => {
    (useAuth as jest.Mock).mockReturnValue({ user: { is_internal_staff: true } });
    (API.getLearningInterestFilterOptions as jest.Mock).mockRejectedValue(new Error("network unavailable"));
    render(<ThemeProvider><LearningInterestScreen /></ThemeProvider>);

    await screen.findByText("Learning choices selected now and recently");
    fireEvent.changeText(screen.getByPlaceholderText("For example, Sociology, Social Sciences, Python, Lagos or school name"), "Python");
    expect(await screen.findByText("Could not load filter options. Try again in a moment.")).toBeTruthy();
    expect(screen.queryByText("No matching current selections or recent activity found.")).toBeNull();
  });
});
