/**
 * RouteIntegrityGuard — where a user actually ends up.
 *
 * The learning/game layer is off for this release, and ~25 routes under
 * /map, /skills, /fields, /portfolio, /guild, /feed and friends render a
 * "paused" placeholder. This guard is what stops a stale browser entry, a
 * bookmark or a deep link from re-entering that layer at all, and what sends a
 * half-onboarded or password-reset user to the right place instead.
 *
 * It renders null, so nothing about it is visible in a screenshot — but the
 * redirect it performs is the most user-visible thing in the app: it decides
 * which screen you are looking at. It had no test of any kind.
 *
 * `learningGate` is deliberately NOT mocked: which paths count as learning
 * routes is the thing under test, together with the guard's use of it.
 */
import React from "react";
import { renderWithProviders, act } from "../test-utils/render";

const mockReplace = jest.fn();
let mockPathname = "/(tabs)/home";
let mockGlobalParams: Record<string, unknown> = {};
jest.mock("expo-router", () => ({
  usePathname: () => mockPathname,
  useGlobalSearchParams: () => mockGlobalParams,
  useRouter: () => ({ replace: mockReplace, push: jest.fn(), back: jest.fn() }),
}));

let mockAuthState: any = { user: null, loading: false, signOut: jest.fn() };
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => mockAuthState }));

jest.mock("../src/lib/api", () => ({
  API: { getToken: jest.fn(async () => "token") },
}));

let mockAccountTypeState: any = { accountType: "student", hydrated: true };
jest.mock("../src/lib/accountType", () => ({
  useEffectiveAccountType: () => mockAccountTypeState,
  isAdminAccount: (t: string) => t === "admin",
  needsLegacyTypeSelection: (u: any) => u?.needsTypeSelection === true,
}));

jest.mock("../src/lib/adminAudience", () => ({
  adminHomeForProfile: () => "/(admin)/home",
}));
jest.mock("../src/lib/educatorProfile", () => ({
  getEducatorProfile: jest.fn(async () => null),
}));
jest.mock("../src/lib/resumeNavigation", () => ({
  resolvePostAuthHref: () => "/(tabs)/home",
}));

// The master switch defaults OFF in this release. Reading the real module would
// make these assertions depend on the developer's shell environment.
let mockLearningGameEnabled = false;
jest.mock("../src/lib/featureFlags", () => ({
  get featureFlags() {
    return { learningGameEnabled: mockLearningGameEnabled, myWorldLive: false };
  },
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { RouteIntegrityGuard } = require("../src/components/RouteIntegrityGuard");

const SIGNED_IN = { id: "u1", onboarding_completed: true, auth_provider: "email" };

/**
 * The guard's bfcache reconciliation calls window.addEventListener behind a
 * `typeof window === "undefined"` check. Under the React Native test
 * environment `window` IS defined (RN aliases it to global) but has no
 * addEventListener, so the guard throws on mount — the same shape the native
 * runtime presents. Web, the only target this app currently ships to, has both.
 * These tests model the web environment; see the report for the native caveat.
 */
beforeAll(() => {
  if (typeof (window as any).addEventListener !== "function") {
    (window as any).addEventListener = jest.fn();
    (window as any).removeEventListener = jest.fn();
  }
});

const mountAt = async (path: string, params: Record<string, unknown> = {}) => {
  mockPathname = path;
  mockGlobalParams = params;
  const view = renderWithProviders(<RouteIntegrityGuard />);
  await act(async () => undefined);
  return view;
};

beforeEach(() => {
  jest.clearAllMocks();
  mockLearningGameEnabled = false;
  mockAccountTypeState = { accountType: "student", hydrated: true };
  mockAuthState = { user: SIGNED_IN, loading: false, signOut: jest.fn() };
});

describe("RouteIntegrityGuard", () => {
  it("renders nothing of its own", async () => {
    const { toJSON } = await mountAt("/(tabs)/home");
    expect(toJSON()).toBeNull();
  });

  it("leaves a live route alone", async () => {
    await mountAt("/(tabs)/explore/domain/D024");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  describe("the disabled learning layer", () => {
    it.each([
      ["/(tabs)/map/lesson"],
      ["/(tabs)/map/island"],
      ["/(tabs)/skills/quant-map"],
      ["/(tabs)/fields"],
      ["/(tabs)/portfolio/hub"],
      ["/(tabs)/guild"],
      ["/(tabs)/feed"],
      ["/(tabs)/streaks"],
      ["/(tabs)/profile/diary"],
      ["/starknet-track"],
      ["/cairo-builder-track"],
      ["/world"],
    ])("sends a signed-in user off %s", async (path) => {
      await mountAt(path);
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/myworld");
    });

    it("sends a signed-out visitor to sign-in rather than a tab they cannot see", async () => {
      mockAuthState = { user: null, loading: false, signOut: jest.fn() };
      await mountAt("/(tabs)/map/lesson");
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/sign-in");
    });

    it("redirects a deep link that carries the My World origin too", async () => {
      // The My World escape hatch only applies once the layer is switched back
      // on. While the master switch is off, `?from=myworld` must not reopen it.
      await mountAt("/(tabs)/map/lesson", { from: "myworld" });
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/myworld");
    });

    it("redirects a learning path that arrives with a query string", async () => {
      await mountAt("/(tabs)/skills/lesson?id=42");
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/myworld");
    });

    it("does not mistake a live route for a learning one by prefix alone", async () => {
      // "/profile" is live; only "/profile/diary" and "/profile/github" are not.
      await mountAt("/(tabs)/profile");
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("honours the My World origin again once the layer is switched back on", async () => {
      mockLearningGameEnabled = true;
      await mountAt("/(tabs)/map/lesson", { from: "myworld" });
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("still blocks a bare deep link once the layer is switched back on", async () => {
      mockLearningGameEnabled = true;
      await mountAt("/(tabs)/map/lesson");
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/myworld");
    });
  });

  describe("password reset", () => {
    it("is left alone for a visitor who is not signed in", async () => {
      mockAuthState = { user: null, loading: false, signOut: jest.fn() };
      await mountAt("/forgot-password");
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("is taken away from a user who is already signed in", async () => {
      await mountAt("/forgot-password");
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/home");
    });

    it("sends a user who never finished onboarding back into it", async () => {
      mockAuthState = {
        user: { ...SIGNED_IN, onboarding_completed: false },
        loading: false,
        signOut: jest.fn(),
      };
      await mountAt("/forgot-password");
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/onboarding");
    });

    it("restarts onboarding for a legacy account with no chosen type", async () => {
      mockAuthState = {
        user: { ...SIGNED_IN, needsTypeSelection: true },
        loading: false,
        signOut: jest.fn(),
      };
      await mountAt("/forgot-password");
      expect(mockReplace).toHaveBeenCalledWith("/(auth)/onboarding?restart=1");
    });
  });

  describe("admin accounts", () => {
    it("are taken out of the legacy community surface", async () => {
      mockAccountTypeState = { accountType: "admin", hydrated: true };
      await mountAt("/community/thread/7");
      expect(mockReplace).toHaveBeenCalledWith("/(admin)/home");
    });

    it("leave a non-admin on the same route alone — it is a learning route for them", async () => {
      await mountAt("/community/thread/7");
      // /community is in the learning prefix list, so a student is sent to My
      // World, not to an admin home they have no access to.
      expect(mockReplace).toHaveBeenCalledWith("/(tabs)/myworld");
    });
  });

  describe("while the session is still resolving", () => {
    it("decides nothing until auth has loaded", async () => {
      mockAuthState = { user: null, loading: true, signOut: jest.fn() };
      await mountAt("/(tabs)/map/lesson");
      expect(mockReplace).not.toHaveBeenCalled();
    });

    it("decides nothing until the account type has hydrated", async () => {
      // Redirecting on an unhydrated account type routes admins as students.
      mockAccountTypeState = { accountType: undefined, hydrated: false };
      await mountAt("/forgot-password");
      expect(mockReplace).not.toHaveBeenCalled();
    });
  });
});
