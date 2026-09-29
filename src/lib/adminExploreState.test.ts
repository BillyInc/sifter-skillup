import { adminExploreStateMessage } from "./adminExploreState";
import { comingSoon, pending, real } from "@/types/career";

describe("admin Explore data states", () => {
  it("describes pending data as loading rather than unavailable", () => {
    expect(adminExploreStateMessage(pending(), "Loading offerings…", "Offerings unavailable.")).toBe("Loading offerings…");
  });

  it("preserves API notices for unavailable data", () => {
    expect(adminExploreStateMessage(comingSoon("Peer comparison is not available yet."), "Loading peers…", "Peers unavailable.")).toBe("Peer comparison is not available yet.");
  });

  it("does not show an error notice for a successful empty result", () => {
    expect(adminExploreStateMessage(real([]), "Loading offerings…", "Offerings unavailable.")).toBeNull();
  });
});
