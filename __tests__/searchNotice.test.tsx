/**
 * The notice must actually REACH the screen.
 *
 * Round 6 made the backend compute `skillsNotice`, made `toSearchGroups` carry
 * it, and made the overlay render it. Only the first two halves were tested.
 * No jest test anywhere imported `SearchComponents`, `SearchResultsGroup` or
 * `SearchOverlay` — `grep -rln` over `__tests__/` returned nothing — so four
 * separate mutations to the user-visible half ALL SURVIVED a green suite
 * (140/140, tsc clean):
 *
 *   1. delete the whole `{notice ? (<View style={styles.groupNotice}>…) : null}`
 *      block from `SearchResultsGroup`
 *   2. `showEmpty = hasQuery && !loading && !hasResults && !hasNotice`
 *      → drop `&& !hasNotice`
 *   3. `if (results.length === 0 && !notice) return null;` → drop `&& !notice`
 *   4. `group.items.length > 0 || group.notice ? (` → drop the `|| group.notice`
 *
 * Applying all four reverts the entire user-visible half of round 6: the
 * backend still computes the notice, the mapper still carries it, and the UI
 * silently discards it and renders `No results for "X"` again. That is the
 * round-5 `otherDomainCount` failure one layer up — mapper pinned, component
 * not.
 *
 * These assert on the RENDERED output, so they fail if the notice is dropped,
 * re-wrapped, or rendered but hidden behind an empty state.
 */
import React from "react";
import { render, screen } from "@testing-library/react-native";
import {
  SearchOverlay,
  SearchResultsGroup,
} from "../src/components/careerIntelligence/SearchComponents";
import { ThemeProvider } from "../src/theme";
import type { SearchResult } from "../src/types/career";

const NOTICE =
  "Skill matching failed for this query, so the skills group is missing rather than empty.";

const ROW: SearchResult = {
  id: "sk1",
  type: "skill",
  title: "risk analysis",
  subtitle: "Used in Nursing",
};

const renderInTheme = (node: React.ReactElement) =>
  render(<ThemeProvider>{node}</ThemeProvider>);

describe("SearchResultsGroup renders the API's notice", () => {
  it("shows the notice text when the group has NO rows", () => {
    // Mutation 3 (`results.length === 0 && !notice` → `results.length === 0`)
    // makes this return null, and mutation 1 (deleting the notice JSX) makes
    // the group render without the text.
    renderInTheme(<SearchResultsGroup label="Skills" results={[]} notice={NOTICE} />);
    expect(screen.getByText(NOTICE)).toBeTruthy();
    // The group header must survive too — a bare sentence with no label does
    // not tell the reader WHICH group could not be searched.
    expect(screen.getByText("Skills")).toBeTruthy();
  });

  it("shows the notice text alongside rows when the group is merely incomplete", () => {
    renderInTheme(
      <SearchResultsGroup label="Skills" results={[ROW]} notice="The skill index is incomplete right now." />,
    );
    expect(screen.getByText("The skill index is incomplete right now.")).toBeTruthy();
    expect(screen.getByText("risk analysis")).toBeTruthy();
  });

  it("still renders nothing at all when there are no rows and nothing to say", () => {
    // The other direction: the notice must not become an excuse to render an
    // empty group header for every filtered-out scope.
    const { toJSON } = renderInTheme(<SearchResultsGroup label="Skills" results={[]} />);
    expect(toJSON()).toBeNull();
  });
});

describe("SearchOverlay prefers the notice over its empty state", () => {
  const overlay = (
    results: { label: string; items: SearchResult[]; notice?: string }[],
  ) =>
    renderInTheme(
      <SearchOverlay
        visible
        onClose={() => {}}
        value="risk"
        onChangeText={() => {}}
        results={results}
      />,
    );

  it("renders a notice-only group and NOT the no-results empty state", () => {
    // Mutation 2 (dropping `&& !hasNotice`) shows the empty state; mutation 4
    // (dropping `|| group.notice`) drops the group. Either way the user is
    // told "No results", which asserts the search happened and found nothing
    // — the precise claim the notice exists to contradict.
    overlay([{ label: "Skills", items: [], notice: NOTICE }]);
    expect(screen.getByText(NOTICE)).toBeTruthy();
    expect(screen.queryByText('No results for "risk"')).toBeNull();
  });

  it("still shows the empty state when nothing was found and nothing was said", () => {
    // Guards the assertion above against passing because the empty state can
    // never render at all.
    overlay([{ label: "Skills", items: [] }]);
    expect(screen.getByText('No results for "risk"')).toBeTruthy();
  });

  it("shows rows and a notice together without the empty state", () => {
    overlay([
      { label: "Skills", items: [ROW], notice: "The skill index is incomplete right now." },
    ]);
    expect(screen.getByText("risk analysis")).toBeTruthy();
    expect(screen.getByText("The skill index is incomplete right now.")).toBeTruthy();
    expect(screen.queryByText('No results for "risk"')).toBeNull();
  });

  it("keeps the notice visible when another group DID return rows", () => {
    // A partial answer is the common case: programmes matched, skills failed.
    // Suppressing the notice whenever anything else matched would hide the
    // failure exactly when the response looks healthy.
    overlay([
      { label: "Programmes", items: [{ ...ROW, id: "p1", type: "programme", title: "Nursing" }] },
      { label: "Skills", items: [], notice: NOTICE },
    ]);
    expect(screen.getByText("Nursing")).toBeTruthy();
    expect(screen.getByText(NOTICE)).toBeTruthy();
  });
});
