import { API } from "@/lib/api";
import { flushQueue, pendingWrites, queueWrite } from "@/lib/careerCache";
import { recordLearningInterest, routeItemRemovalEvents } from "@/lib/learningInterest";

jest.mock("@/lib/api", () => ({
  API: { trackLearningInterest: jest.fn() },
}));

jest.mock("@/lib/careerCache", () => ({
  flushQueue: jest.fn().mockResolvedValue(0),
  pendingWrites: jest.fn().mockResolvedValue(0),
  queueWrite: jest.fn().mockResolvedValue({ id: "queued" }),
}));

describe("learning interest capture ordering", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (pendingWrites as jest.Mock).mockResolvedValue(0);
    (queueWrite as jest.Mock).mockResolvedValue({ id: "queued" });
    (flushQueue as jest.Mock).mockResolvedValue(0);
  });

  it("sends rapid changes for one selection scope in learner action order", async () => {
    let finishFirst!: () => void;
    const firstRequest = new Promise<void>((resolve) => { finishFirst = resolve; });
    (API.trackLearningInterest as jest.Mock)
      .mockImplementationOnce(() => firstRequest)
      .mockResolvedValueOnce({});

    recordLearningInterest("selection_added", "tool", "python", "Python", {
      selection_scope_id: "programme/domain/method-route",
    });
    recordLearningInterest("selection_removed", "tool", "python", "Python", {
      selection_scope_id: "programme/domain/method-route",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(API.trackLearningInterest).toHaveBeenCalledTimes(1);
    expect(API.trackLearningInterest).toHaveBeenNthCalledWith(1, expect.objectContaining({ action: "selection_added" }));

    finishFirst();
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(API.trackLearningInterest).toHaveBeenCalledTimes(2);
    expect(API.trackLearningInterest).toHaveBeenNthCalledWith(2, expect.objectContaining({ action: "selection_removed" }));
  });

  it("removes downstream item intent only from the route scopes being removed", () => {
    const events = routeItemRemovalEvents([
      {
        name: "Python", itemType: "tool", itemKey: "python", domainId: "D078",
        contextLevel: "role", contextKey: "researcher", routeKeys: ["route-a", "route-b"],
      },
      {
        name: "Interview design", itemType: "method", itemKey: "interview", domainId: "D078",
        contextLevel: "subgroup", contextKey: "sociology-area", routeKeys: ["route-c"],
      },
    ], ["route-a"], (routeKey) => ({
      programme_id: "sociology", domain_id: "D078", area_id: "sociology-area",
      role_id: "researcher", route_label: `Sociology → ${routeKey}`,
    }));

    expect(events).toEqual([{
      action: "selection_removed", entity_type: "tool", entity_id: "python", entity_label: "Python",
      context: {
        programme_id: "sociology", domain_id: "D078", area_id: "sociology-area",
        role_id: "researcher", route_label: "Sociology → route-a", selection_scope_id: "route-a",
      },
    }]);
  });

  it("queues a transient network failure and starts a best-effort replay", async () => {
    (API.trackLearningInterest as jest.Mock).mockRejectedValueOnce(new TypeError("Failed to fetch"));
    recordLearningInterest("selection_added", "tool", "python", "Python", {
      selection_scope_id: "offline-route",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(queueWrite).toHaveBeenCalledWith(expect.objectContaining({
      endpoint: "/api/analytics/learning-interest/event",
      method: "POST",
      body: expect.objectContaining({ action: "selection_added", entity_id: "python" }),
    }));
    expect(flushQueue).toHaveBeenCalledTimes(1);
  });

  it("queues subsequent same-scope changes behind already queued writes", async () => {
    (pendingWrites as jest.Mock).mockResolvedValue(1);
    recordLearningInterest("selection_removed", "tool", "python", "Python", {
      selection_scope_id: "queued-route",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(API.trackLearningInterest).not.toHaveBeenCalled();
    expect(queueWrite).toHaveBeenCalledWith(expect.objectContaining({
      body: expect.objectContaining({ action: "selection_removed", selection_scope_id: "queued-route" }),
    }));
  });

  it("does not queue permanent API or configuration errors", async () => {
    (API.trackLearningInterest as jest.Mock).mockRejectedValueOnce(new Error("Analytics schema is not installed"));
    recordLearningInterest("selection_added", "tool", "python", "Python", {
      selection_scope_id: "permanent-error-route",
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(queueWrite).not.toHaveBeenCalled();
    expect(flushQueue).not.toHaveBeenCalled();
  });
});
