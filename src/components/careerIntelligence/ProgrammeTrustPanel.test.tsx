import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";

jest.mock("./MappingFeedbackButton", () => ({
  MappingFeedbackButton: ({ label }: any) => {
    const R = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return R.createElement(Text, null, label);
  },
}));
jest.mock("./ExternalLinkGuard", () => ({
  ExternalLinkGuard: ({ label }: any) => {
    const R = jest.requireActual("react");
    const { Text } = jest.requireActual("react-native");
    return R.createElement(Text, null, label);
  },
}));

import { ProgrammeTrustPanel } from "./ProgrammeTrustPanel";

const wrap = (trust: any) => render(
  <ThemeProvider>
    <ProgrammeTrustPanel trust={trust} programmeId="p1" programmeLabel="Sociology" schoolId="s1" schoolLabel="Uni" />
  </ThemeProvider>,
);

describe("ProgrammeTrustPanel", () => {
  it("shows status and report action but no official source without a URL", () => {
    wrap({ status: "needs_confirmation", statusLabel: "Needs confirmation" });
    expect(screen.getByText("Needs confirmation")).toBeTruthy();
    expect(screen.getByText("Report incorrect information")).toBeTruthy();
    expect(screen.queryByText("Check official source")).toBeNull();
    expect(screen.queryByText(/Record processed/)).toBeNull();
  });
  it("shows source, date and official link only when supplied", () => {
    wrap({ status: "verified", statusLabel: "Verified", sourceLabel: "JAMB brochure", recordedOn: "2026-09-01", officialSourceUrl: "https://example.org/" });
    expect(screen.getByText("Source: JAMB brochure")).toBeTruthy();
    expect(screen.getByText("Record processed: 2026-09-01")).toBeTruthy();
    expect(screen.getByText("Check official source")).toBeTruthy();
  });
  it("says not available honestly", () => {
    wrap({ status: "not_available", statusLabel: "Not available" });
    expect(screen.getByText("Not available")).toBeTruthy();
  });
});
