/**
 * The badge must say nothing when it knows nothing.
 *
 * `RoleCard.match` and `.coverageRatio` were REQUIRED props, and the domain
 * endpoint returns neither for its roles — so DomainDetailScreen passed
 * `match="match" coverageRatio={0}` to satisfy the types. Every role on every
 * domain then rendered:
 *
 *     Match · 0%
 *
 * which asserts >=50% ESCO coverage ("Match") and 0% coverage at once. A
 * required prop with no honest value is how a type checker talks you into
 * inventing data.
 */
import React from "react";
import { render } from "@testing-library/react-native";
import { RoleMatchBadge } from "../src/components/careerIntelligence/RoleMatchBadge";
import { ThemeProvider } from "../src/theme";

const renderBadge = (props: React.ComponentProps<typeof RoleMatchBadge>) =>
  render(
    <ThemeProvider>
      <RoleMatchBadge {...props} />
    </ThemeProvider>,
  );

describe("RoleMatchBadge", () => {
  it("renders nothing when there is no match and no elite flag", () => {
    const { toJSON } = renderBadge({});
    expect(toJSON()).toBeNull();
  });

  it("renders nothing when coverage is given but the match label is not", () => {
    // Coverage alone cannot be labelled — 0.42 is "Adjacent", 0.8 is "Match",
    // and guessing which is exactly the bug.
    const { toJSON } = renderBadge({ coverageRatio: 0.42 });
    expect(toJSON()).toBeNull();
  });

  it("shows the label without a percentage when coverage is unknown", () => {
    const { getByText, queryByText } = renderBadge({ match: "match" });
    expect(getByText(/Match/)).toBeTruthy();
    expect(queryByText(/%/)).toBeNull();
  });

  it("shows the percentage when coverage is known", () => {
    const { getByText } = renderBadge({ match: "match", coverageRatio: 0.62 });
    expect(getByText(/62%/)).toBeTruthy();
  });

  it("shows a genuine zero when coverage really is zero", () => {
    // 0 is meaningful when it was measured; the bug was 0 standing in for
    // "not measured".
    const { getByText } = renderBadge({ match: "adjacent", coverageRatio: 0 });
    expect(getByText(/0%/)).toBeTruthy();
  });

  it("still marks an elite role that has no coverage label", () => {
    const { getByText } = renderBadge({ elite: true });
    expect(getByText(/⭐/)).toBeTruthy();
  });
});
