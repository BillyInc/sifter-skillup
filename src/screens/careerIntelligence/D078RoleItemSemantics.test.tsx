jest.mock("@/theme/motion", () => ({ useReducedMotion: () => true }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "student-1" } }) }));

jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { D078RoleRoute } from "./D078MethodAwareJourney";
import {
  INITIAL_D078_SELECTION,
  d078Node,
  projectD078Route,
  selectD078Area,
  selectD078Role,
  toggleD078Method,
} from "@/lib/d078RouteProjection";

describe("D078 role-item learner meaning", () => {
  it("frames role items as route context, not universal employer tasks or job-readiness proof", () => {
    const methodSelection = toggleD078Method(INITIAL_D078_SELECTION, "domain-item:d078-interviews");
    const areaId = "D078:sociology-social-anthropology";
    const routeRole = projectD078Route({ ...methodSelection, areaId }).visibleRoles.find((role) =>
      role.areaId === areaId && role.taskContexts.some((task) => task.roleItemIds.length > 0),
    );
    expect(routeRole).toBeTruthy();
    const taskContext = routeRole!.taskContexts.find((task) => task.roleItemIds.length > 0)!;
    const taskItem = d078Node(taskContext.roleItemIds[0]);
    expect(taskItem).toBeTruthy();

    const selection = selectD078Role(selectD078Area(methodSelection, areaId), routeRole!.roleId);
    const { unmount } = render(<ThemeProvider><D078RoleRoute
      areaId={areaId}
      roleId={routeRole!.roleId}
      roleName={routeRole!.label}
      roleKey={`D078|${routeRole!.label}`}
      initialSelection={selection}
      roles={[]}
      guidanceContext={{ domainId: "D078", areaId }}
    /></ThemeProvider>);

    expect(screen.getByText("Learning linked to this role task")).toBeTruthy();
    expect(screen.getByText(taskContext.familyLabel)).toBeTruthy();
    expect(screen.getByRole("button", { name: `Add ${taskItem!.label} to your learning` })).toBeTruthy();
    expect(screen.queryByText("Role learning within this selected path")).toBeNull();
    expect(screen.queryByText("Other learning options for this role")).toBeNull();
    expect(screen.getAllByText(/not an employer mandate, universal duty, credential, or claim that the learner is job-ready/).length).toBeGreaterThan(0);
    expect(screen.queryByText("Specific to the method you selected")).toBeNull();
    unmount();
  });
});
