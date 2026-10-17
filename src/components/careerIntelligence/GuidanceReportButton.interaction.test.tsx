import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { GuidanceReportButton, invalidateGuidancePathCache, toggleGuidanceSelectionPath } from "./GuidanceReportButton";

const savedPaths: Record<string, unknown> = {};
const mockGuidedOpen = jest.fn();

jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "student-1" } }) }));
jest.mock("../../lib/careerData", () => ({
  careerData: {
    getGuidancePath: jest.fn(async () => ({ status: "real", data: { path: savedPaths.student ?? {} } })),
    saveGuidancePath: jest.fn(async ({ path }: { path: unknown }) => {
      savedPaths.student = path;
      return { status: "real" };
    }),
  },
}));
jest.mock("../../lib/provisioningData", () => ({ provisioningData: {} }));

describe("GuidanceReportButton learning-focus interaction", () => {
  beforeEach(() => {
    savedPaths.student = {};
    mockGuidedOpen.mockClear();
    invalidateGuidancePathCache();
  });

  it("adds a focus item, exposes the tray action, then lets the learner remove it", async () => {
    render(
      <ThemeProvider>
        <GuidanceReportButton
          selection={{
            kind: "learningFocus",
            id: "domain:D078:tool:spss",
            name: "SPSS",
            contextLevel: "domain",
            contextKey: "D078",
            itemType: "tool",
            itemKey: "spss",
            domainId: "D078",
            domainName: "Social Sciences",
          }}
          onOpenPlan={mockGuidedOpen}
        />
      </ThemeProvider>,
    );

    fireEvent.press(screen.getByRole("button", { name: "Add to my focus" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Remove from my focus" })).toBeTruthy());
    expect(screen.getByRole("button", { name: "Open my learning tray" })).toBeTruthy();
    expect(mockGuidedOpen).toHaveBeenCalledTimes(1);

    fireEvent.press(screen.getByRole("button", { name: "Remove from my focus" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Add to my focus" })).toBeTruthy());
    expect(screen.queryByRole("button", { name: "Open my learning tray" })).toBeNull();
    expect((savedPaths.student as { learningFocus?: unknown[] }).learningFocus).toEqual([]);
    expect(mockGuidedOpen).toHaveBeenCalledTimes(1);
  });

  it("keeps focus membership and the selected role route scoped to the full route", () => {
    const researchRoute = {
      kind: "learningFocus" as const,
      id: "role:D078|sociologist:tool:nvivo",
      name: "NVivo",
      contextLevel: "role" as const,
      contextKey: "D078|sociologist",
      itemType: "tool",
      itemKey: "nvivo",
      programmeId: "sociology",
      domainId: "D078",
      domainName: "Social Sciences and Behavioural Research",
      subgroupId: "A01",
      subgroupName: "Sociology and Social Anthropology",
      roleId: "D078|sociologist",
      roleName: "Sociologist",
      routeKey: "sociology|D078|A01|D078|sociologist",
    };
    const firstRoute = toggleGuidanceSelectionPath({}, researchRoute);
    expect(firstRoute.learningFocus?.[0]).toMatchObject({
      id: researchRoute.id,
      routeKeys: [researchRoute.routeKey],
    });
    expect(firstRoute.domains).toContainEqual(expect.objectContaining({ id: "D078", name: researchRoute.domainName }));
    expect(firstRoute.subgroups).toContainEqual(expect.objectContaining({ id: "A01", name: researchRoute.subgroupName, domainId: "D078" }));
    expect(firstRoute.roles).toContainEqual(expect.objectContaining({ id: "D078|sociologist", name: "Sociologist", domainId: "D078", subgroupId: "A01" }));

    const secondRoute = toggleGuidanceSelectionPath(firstRoute, {
      ...researchRoute,
      roleId: "D078|policy-analyst",
      roleName: "Policy analyst",
      routeKey: "sociology|D078|A02|D078|policy-analyst",
    });
    expect(secondRoute.learningFocus?.[0]?.routeKeys).toEqual([
      researchRoute.routeKey,
      "sociology|D078|A02|D078|policy-analyst",
    ]);

    const removedFromResearch = toggleGuidanceSelectionPath(secondRoute, researchRoute);
    expect(removedFromResearch.learningFocus?.[0]?.routeKeys).toEqual(["sociology|D078|A02|D078|policy-analyst"]);
  });

  it("removes a legacy global focus item from only the active route", () => {
    const routeKey = "sociology|D078|A01|D078|sociologist";
    const otherRouteKey = "sociology|D078|A02|D078|policy-analyst";
    const legacyPath = {
      learningFocus: [{
        id: "domain:D078:tool:spss",
        name: "SPSS",
        contextLevel: "domain",
        contextKey: "D078",
        itemType: "tool",
        itemKey: "spss",
      }],
    };

    const removed = toggleGuidanceSelectionPath(legacyPath, {
      kind: "learningFocus",
      id: "domain:D078:tool:spss",
      name: "SPSS",
      routeKey,
    });
    expect(removed.learningFocus).toEqual(legacyPath.learningFocus);
    expect(removed.learningPlanRemovedIdsByRoute).toEqual({ [routeKey]: ["domain:D078:tool:spss"] });
    expect((removed.learningPlanRemovedIdsByRoute as Record<string, string[]>)[otherRouteKey]).toBeUndefined();

    const restored = toggleGuidanceSelectionPath(removed, {
      kind: "learningFocus",
      id: "domain:D078:tool:spss",
      name: "SPSS",
      routeKey,
    });
    expect(restored.learningFocus).toEqual(legacyPath.learningFocus);
    expect(restored.learningPlanRemovedIdsByRoute).toBeUndefined();
    expect(restored.learningFocus?.[0]?.routeKeys).toBeUndefined();
  });
});
