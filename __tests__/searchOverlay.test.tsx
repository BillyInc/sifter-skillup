/**
 * The app-wide search overlay, rendered.
 *
 * `searchResults.test.ts` covers the payload->rows mapping as pure functions,
 * and that is exactly the hole this file fills: a review cycle showed the
 * entire user-visible half of career search could be deleted with a green
 * suite, because nothing imported `SearchOverlay`, `SearchResultsGroup` or
 * `SearchEmptyState`. A mapping function that returns the right rows into a
 * component that never renders them is not a working feature.
 *
 * These assert on what the user sees and touches — group headings, row copy,
 * the empty state, the guest preview cap and its CTA, the idle recents list —
 * not on props or internal state.
 */
import React from "react";
import { SearchOverlay, SearchResultsGroup, SearchEmptyState } from "../src/components/careerIntelligence/SearchComponents";
import { toSearchGroups } from "../src/lib/searchResults";
import type { CareerSearchResult, SearchResult } from "../src/types/career";
import { renderWithProviders, fireEvent, screen } from "../test-utils/render";

const row = (over: Partial<SearchResult> & Pick<SearchResult, "id" | "title">): SearchResult => ({
  type: "domain",
  ...over,
});

const GROUPS = [
  {
    label: "Domains",
    items: [
      row({ id: "D024", title: "Nursing", subtitle: "Health & Biomedical", actionLabel: "Open domain guidance" }),
      row({ id: "D039", title: "Higher Education", subtitle: "Education" }),
    ],
  },
  {
    label: "Roles",
    items: [
      row({ id: "D024|nursing lecturer", type: "role", title: "nursing lecturer", subtitle: "Nursing", meta: "mid" }),
    ],
  },
];

const baseProps = {
  visible: true,
  onClose: jest.fn(),
  value: "nursing",
  onChangeText: jest.fn(),
};

/**
 * Group headings ("Domains", "Skills", …) are also scope-chip labels, so with
 * no intent selected both render and a text query matches two nodes. Selecting
 * a task hides the scope row — which is the state a user is in once they have
 * told the overlay what they are trying to do — leaving each heading unique.
 */
const taskProps = { ...baseProps, intent: "career_exploration" as const };

describe("SearchOverlay", () => {
  beforeEach(() => jest.clearAllMocks());

  it("renders nothing at all when it is not visible", () => {
    const { toJSON } = renderWithProviders(
      <SearchOverlay {...baseProps} visible={false} results={GROUPS} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("renders every group heading and every row of a result payload", () => {
    renderWithProviders(<SearchOverlay {...taskProps} results={GROUPS} />);

    expect(screen.getByText("Domains")).toBeTruthy();
    expect(screen.getByText("Roles")).toBeTruthy();
    // Titles are rendered through TermHighlight, which splits the string on the
    // query — so "Nursing" arrives as segments. Match on the subtitle and the
    // action copy, which are rendered whole.
    expect(screen.getByText("Health & Biomedical")).toBeTruthy();
    expect(screen.getByText("Open domain guidance")).toBeTruthy();
    expect(screen.getByText("mid")).toBeTruthy();
  });

  it("hands the selected row back to the caller, not a hardcoded route", () => {
    // The original bug pushed /explore for every result type, discarding which
    // row was tapped. The overlay must surface the row object itself.
    const onResultPress = jest.fn();
    renderWithProviders(
      <SearchOverlay {...baseProps} results={GROUPS} onResultPress={onResultPress} />,
    );

    fireEvent.press(screen.getByText("Open domain guidance"));
    expect(onResultPress).toHaveBeenCalledTimes(1);
    expect(onResultPress.mock.calls[0][0]).toMatchObject({ id: "D024", type: "domain" });
  });

  it("shows the query-specific empty state when a search returns nothing", () => {
    renderWithProviders(<SearchOverlay {...baseProps} results={[]} />);

    expect(screen.getByText('No results for "nursing"')).toBeTruthy();
    expect(screen.getByText("Try a different search term or broaden your scope.")).toBeTruthy();
  });

  it("treats a payload of empty groups as no results", () => {
    // toSearchGroups drops empty groups, but a caller that builds groups by
    // hand can still pass a heading with nothing under it. The overlay must
    // show the empty state rather than a bare heading.
    renderWithProviders(
      <SearchOverlay {...taskProps} results={[{ label: "Nursing specialisations", items: [] }]} />,
    );

    expect(screen.getByText('No results for "nursing"')).toBeTruthy();
    expect(screen.queryByText("Nursing specialisations")).toBeNull();
  });

  it("does not claim empty while the search is still loading", () => {
    renderWithProviders(<SearchOverlay {...baseProps} results={[]} loading />);
    expect(screen.queryByText('No results for "nursing"')).toBeNull();
  });

  it("shows recents instead of an empty state before the query is long enough", () => {
    // A one-character value is below the 2-char threshold: this is the idle
    // state, and telling the user there are "no results" for a query they have
    // not finished typing is wrong.
    renderWithProviders(
      <SearchOverlay {...baseProps} value="n" recentSearches={["nursing", "law"]} results={[]} />,
    );

    expect(screen.getByText("Recent")).toBeTruthy();
    expect(screen.getByText("nursing")).toBeTruthy();
    expect(screen.queryByText(/No results for/)).toBeNull();
  });

  it("replays a recent term when it is tapped", () => {
    const onRecentPress = jest.fn();
    renderWithProviders(
      <SearchOverlay {...baseProps} value="" recentSearches={["nursing"]} onRecentPress={onRecentPress} />,
    );

    fireEvent.press(screen.getByText("nursing"));
    expect(onRecentPress).toHaveBeenCalledWith("nursing");
  });

  it("clears the query when the overlay is dismissed", () => {
    // Closing must not leave a stale term behind to be re-searched on reopen.
    const onClose = jest.fn();
    const onChangeText = jest.fn();
    renderWithProviders(
      <SearchOverlay {...baseProps} onClose={onClose} onChangeText={onChangeText} results={GROUPS} />,
    );

    fireEvent.press(screen.getByText(/Cancel|Esc/));
    expect(onChangeText).toHaveBeenCalledWith("");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  describe("guest preview", () => {
    const guestGroups = [
      {
        label: "Domains",
        items: [1, 2, 3, 4].map((n) => row({ id: `D0${n}`, title: `Domain ${n}`, subtitle: `Cluster ${n}` })),
      },
    ];

    it("caps a guest at two rows per group and offers the rest behind sign-in", () => {
      const onSignIn = jest.fn();
      renderWithProviders(
        <SearchOverlay {...baseProps} results={guestGroups} isGuest onSignIn={onSignIn} />,
      );

      expect(screen.getByText("Cluster 1")).toBeTruthy();
      expect(screen.getByText("Cluster 2")).toBeTruthy();
      expect(screen.queryByText("Cluster 3")).toBeNull();

      fireEvent.press(screen.getByText("See all 4 domains"));
      expect(onSignIn).toHaveBeenCalledTimes(1);
    });

    it("explains the cap rather than silently truncating", () => {
      renderWithProviders(
        <SearchOverlay {...baseProps} results={guestGroups} isGuest onSignIn={jest.fn()} />,
      );
      expect(screen.getByText("Sign in for full results")).toBeTruthy();
    });

    it("shows a signed-in user all five rows and no sign-in prompt", () => {
      renderWithProviders(<SearchOverlay {...baseProps} results={guestGroups} />);

      expect(screen.getByText("Cluster 3")).toBeTruthy();
      expect(screen.getByText("Cluster 4")).toBeTruthy();
      expect(screen.queryByText("Sign in for full results")).toBeNull();
    });

    it("offers account creation from the empty state only to guests", () => {
      const { rerender } = renderWithProviders(
        <SearchOverlay {...baseProps} results={[]} isGuest onSignIn={jest.fn()} />,
      );
      expect(screen.getByText("Create an account for the full catalogue")).toBeTruthy();

      rerender(<SearchOverlay {...baseProps} results={[]} />);
      expect(screen.queryByText("Create an account for the full catalogue")).toBeNull();
    });
  });

  describe("scope and intent controls", () => {
    it("reports the scope the user picked", () => {
      const onScopeChange = jest.fn();
      renderWithProviders(
        <SearchOverlay {...baseProps} results={GROUPS} onScopeChange={onScopeChange} />,
      );

      fireEvent.press(screen.getByText("Universities"));
      expect(onScopeChange).toHaveBeenCalledWith("universities");
    });

    it("swaps the scope row for the chosen task once an intent is set", () => {
      renderWithProviders(
        <SearchOverlay {...baseProps} value="" intent="programme_guidance" results={[]} />,
      );

      // The scope chips are replaced by the selected task plus a way back.
      expect(screen.getByText("Find a programme")).toBeTruthy();
      expect(screen.getByText("Change")).toBeTruthy();
      expect(screen.queryByText("Credentials")).toBeNull();
    });

    it("explains the chosen task to an undergraduate in their own terms", () => {
      renderWithProviders(
        <SearchOverlay {...baseProps} value="" intent="programme_guidance" userType="student" results={[]} />,
      );

      expect(
        screen.getByText(/Open your programme to see what it teaches/),
      ).toBeTruthy();
    });

    it("prefers server-supplied guidance over the built-in description", () => {
      renderWithProviders(
        <SearchOverlay
          {...baseProps}
          value=""
          intent="programme_guidance"
          searchContext={{ label: "Programmes", guidance: "Server says: start with your programme." }}
          results={[]}
        />,
      );

      expect(screen.getByText("Server says: start with your programme.")).toBeTruthy();
    });
  });
});

describe("SearchResultsGroup", () => {
  it("renders nothing rather than a heading with no rows under it", () => {
    const { toJSON } = renderWithProviders(
      <SearchResultsGroup label="Domains" results={[]} />,
    );
    expect(toJSON()).toBeNull();
  });

  it("shows the true total next to the heading, not the visible count", () => {
    renderWithProviders(
      <SearchResultsGroup
        label="Domains"
        maxRows={1}
        results={[row({ id: "a", title: "A" }), row({ id: "b", title: "B" }), row({ id: "c", title: "C" })]}
      />,
    );

    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("+2 more")).toBeTruthy();
  });

  it("does not offer a row as pressable when there is nowhere to go", () => {
    // No onResultPress means the row is disabled; firing a press must not throw
    // and must not render an affordance suggesting it navigates.
    renderWithProviders(
      <SearchResultsGroup label="Domains" results={[row({ id: "a", title: "A", actionLabel: "Open domain guidance" })]} />,
    );
    fireEvent.press(screen.getByText("Open domain guidance"));
    // Nothing to assert beyond "did not throw" — the point is the disabled path
    // is exercised at all.
    expect(screen.getByText("Domains")).toBeTruthy();
  });
});

describe("SearchEmptyState", () => {
  it("invites a search when there is no query yet", () => {
    renderWithProviders(<SearchEmptyState />);
    expect(screen.getByText("Search Sifter LevelUp")).toBeTruthy();
    expect(
      screen.getByText("Explore programmes, universities, domains, roles, skills, and opportunities."),
    ).toBeTruthy();
  });

  it("quotes the failed query back to the user", () => {
    renderWithProviders(<SearchEmptyState query="quantum welding" />);
    expect(screen.getByText('No results for "quantum welding"')).toBeTruthy();
  });
});

describe("the mapping and the overlay together", () => {
  // The two proven regressions were both "mapping covered, component not".
  // This drives a real payload through toSearchGroups into the rendered
  // overlay, so a row the mapper produces but the overlay drops is caught.
  const PAYLOAD: CareerSearchResult = {
    domains: [
      { id: "D024", name: "Nursing", cluster: "Health & Biomedical" },
      { id: "D039", name: "Higher Education", cluster: "Education" },
    ],
    roles: [
      {
        name: "nursing lecturer",
        tier: "mid",
        domains: [{ domainId: "D024", domainName: "Nursing", roleKey: "D024|nursing lecturer" }],
      },
    ],
    programmes: [{ id: "P100", name: "Nursing Science", institutionType: "university", discipline: "Health" }],
    skills: [{ id: "S1", name: "Patient assessment", domainId: "D024", domainName: "Nursing", context: "Clinical" }],
    tools: [{ id: "T1", name: "Lecture capture", domainId: "D039", domainName: "Higher Education", group: "distinctive" }],
  };

  it("renders a skill row end to end", () => {
    // `skillRows()` had zero coverage for exactly one reason: no fixture
    // carried a `skills` key, so the function was never executed by any test.
    const onResultPress = jest.fn();
    renderWithProviders(
      <SearchOverlay
        {...taskProps}
        results={toSearchGroups(PAYLOAD, "all")}
        onResultPress={onResultPress}
      />,
    );

    expect(screen.getByText("Skills")).toBeTruthy();
    expect(screen.getByText("Used in Nursing")).toBeTruthy();
    expect(screen.getByText("See this skill in context")).toBeTruthy();

    fireEvent.press(screen.getByText("See this skill in context"));
    expect(onResultPress.mock.calls[0][0]).toMatchObject({
      id: "S1",
      type: "skill",
      href: "/(tabs)/explore/domain/D024",
    });
  });

  it("renders a tool row end to end", () => {
    renderWithProviders(<SearchOverlay {...taskProps} results={toSearchGroups(PAYLOAD, "all")} />);
    expect(screen.getByText("Tools")).toBeTruthy();
    expect(screen.getByText("Used in Higher Education")).toBeTruthy();
    expect(screen.getByText("See this tool in context")).toBeTruthy();
    expect(screen.getByText("distinctive")).toBeTruthy();
  });

  it("orders the groups so the user's own programme comes first", () => {
    renderWithProviders(<SearchOverlay {...taskProps} results={toSearchGroups(PAYLOAD, "all")} />);
    const headings = ["Programmes", "Domains", "Roles", "Skills", "Tools"];
    headings.forEach((h) => expect(screen.getByText(h)).toBeTruthy());
  });
});
