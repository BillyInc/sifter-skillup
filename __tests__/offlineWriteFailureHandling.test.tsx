/**
 * offlineWrite resolves { queued: false } (it does not throw) when nothing was
 * stored. Callers must not report success: they roll back optimistic state and
 * surface the failure; reports, blocks and DMs never look sent.
 */
import React from "react";
import { Share } from "react-native";
import { fireEvent, render, renderHook, act, waitFor, screen } from "@testing-library/react-native";

import { useCommunity, useDMs } from "../src/hooks/useCommunity";
import ReviewModal from "../src/components/ReviewModal";
import { shareOnLevelComplete, shareOnPortfolioArtifact } from "../src/lib/shareEngine";

const mockOfflineWrite = jest.fn();
const mockShare = jest.fn().mockResolvedValue({});

jest.mock("../src/lib/offlineQueue", () => ({
  offlineWrite: (...a: unknown[]) => mockOfflineWrite(...a),
}));
jest.mock("expo-haptics", () => ({
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: "light" },
  NotificationFeedbackType: { Success: "success" },
}));
jest.mock("../src/lib/supabase", () => ({ supabase: null }));
jest.mock("../src/lib/api", () => ({
  API_BASE: "http://api.test",
  API: { getToken: jest.fn().mockResolvedValue("tok") },
}));


const QUEUED = { queued: true, id: "q1" };
const REFUSED = { queued: false, reason: "no_profile" };

const author = (id: string) => ({ id, name: id, avatar: "x", track: "t" });
const post = (id: string, authorId: string, extra: Record<string, unknown> = {}) => ({
  id,
  author: author(authorId),
  content: id,
  reactions: { like: 2 },
  comments: 0,
  quotes: 0,
  isBookmarked: false,
  hashtags: [],
  mentions: [],
  createdAt: "2026-01-01T00:00:00Z",
  ...extra,
});

beforeEach(() => {
  mockOfflineWrite.mockReset();
  (global as any).fetch = jest.fn(async (url: string) => {
    if (String(url).includes("/api/community/feed")) {
      return {
        ok: true,
        json: async () => ({
          posts: [
            post("p1", "other", { poll: { question: "q", options: [{ id: "0", text: "a", votes: 1 }], totalVotes: 1 } }),
            post("p2", "other"),
            post("p3", "third"),
          ],
          has_more: false,
        }),
      };
    }
    return { ok: false, json: async () => ({}) };
  });
});

async function loaded() {
  const hook = renderHook(() => useCommunity("me", "track"));
  await waitFor(() => expect(hook.result.current.feed.posts.length).toBe(3));
  return hook;
}

describe("useCommunity actions when nothing was queued", () => {
  it("react rolls back and throws", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const { result } = await loaded();
    await act(async () => {
      await expect(result.current.react("p2", "like" as any)).rejects.toThrow(/reaction/);
    });
    const p2 = result.current.feed.posts.find((p) => p.id === "p2")!;
    expect(p2.myReaction).toBeUndefined();
    expect(p2.reactions).toEqual({ like: 2 });
  });

  it("votePoll rolls back and throws", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const { result } = await loaded();
    await act(async () => {
      await expect(result.current.votePoll("p1", "0")).rejects.toThrow(/vote/);
    });
    const p1 = result.current.feed.posts.find((p) => p.id === "p1")!;
    expect(p1.poll!.totalVotes).toBe(1);
    expect(p1.poll!.votedId).toBeUndefined();
  });

  it("bookmark rolls back and throws", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const { result } = await loaded();
    await act(async () => {
      await expect(result.current.bookmark("p2")).rejects.toThrow(/bookmark/);
    });
    expect(result.current.feed.posts.find((p) => p.id === "p2")!.isBookmarked).toBe(false);
  });

  it("blockUser and muteUser restore the hidden posts and the id sets, and throw", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const { result } = await loaded();
    await act(async () => {
      await expect(result.current.blockUser("other")).rejects.toThrow(/block/);
    });
    expect(result.current.blockedIds.has("other")).toBe(false);
    expect(result.current.feed.posts.map((p) => p.id).sort()).toEqual(["p1", "p2", "p3"]);

    await act(async () => {
      await expect(result.current.muteUser("other")).rejects.toThrow(/mute/);
    });
    expect(result.current.mutedIds.has("other")).toBe(false);
    expect(result.current.feed.posts.map((p) => p.id).sort()).toEqual(["p1", "p2", "p3"]);
  });

  it("reportPost, followUser and markNotificationsRead throw instead of looking done", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const { result } = await loaded();
    await act(async () => {
      await expect(result.current.reportPost("p1", "spam")).rejects.toThrow(/report/);
      await expect(result.current.followUser("other", false)).rejects.toThrow(/follow/);
      await expect(result.current.markNotificationsRead()).rejects.toThrow(/notifications/);
    });
  });

  it("keeps the optimistic change when the write was queued", async () => {
    mockOfflineWrite.mockResolvedValue(QUEUED);
    const { result } = await loaded();
    await act(async () => { await result.current.bookmark("p2"); });
    expect(result.current.feed.posts.find((p) => p.id === "p2")!.isBookmarked).toBe(true);
    await act(async () => { await result.current.blockUser("other"); });
    expect(result.current.feed.posts.map((p) => p.id)).toEqual(["p3"]);
  });

  it("sendMessage rejects when the DM was not stored", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const { result } = renderHook(() => useDMs("me"));
    await act(async () => {
      await expect(result.current.sendMessage("them", "hi")).rejects.toThrow(/message/);
    });
    mockOfflineWrite.mockResolvedValue(QUEUED);
    await act(async () => { await result.current.sendMessage("them", "hi"); });
  });
});

describe("ReviewModal", () => {
  const renderModal = () => render(<ReviewModal visible userId="u1" context="ctx" onClose={jest.fn()} />);

  it("does not thank the user for feedback that was not stored", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    renderModal();
    fireEvent.press(screen.getAllByText("☆")[0]); // 1 star -> feedback phase
    fireEvent.press(screen.getByText("Send Feedback"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByText("Thank you!")).toBeNull();
    // The form (and the typed text) is still there for a retry.
    expect(screen.getByText("Send Feedback")).toBeTruthy();
  });

  it("thanks the user once the review was queued", async () => {
    mockOfflineWrite.mockResolvedValue(QUEUED);
    renderModal();
    fireEvent.press(screen.getAllByText("☆")[0]);
    fireEvent.press(screen.getByText("Send Feedback"));
    await waitFor(() => expect(screen.getByText("Thank you!")).toBeTruthy());
    expect(mockOfflineWrite).toHaveBeenCalledTimes(2); // review + team copy
  });

  it("does not stay stuck on 'Sending…' when offlineWrite itself throws, and allows a retry", async () => {
    mockOfflineWrite.mockRejectedValueOnce(new Error("boom"));
    renderModal();
    fireEvent.press(screen.getAllByText("☆")[0]);
    fireEvent.press(screen.getByText("Send Feedback"));
    await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByText("Sending…")).toBeNull();
    expect(screen.getByText("Send Feedback")).toBeTruthy();

    mockOfflineWrite.mockResolvedValue(QUEUED);
    fireEvent.press(screen.getByText("Send Feedback"));
    await waitFor(() => expect(screen.getByText("Thank you!")).toBeTruthy());
  });

  it("a failing team copy does not undo the stored review", async () => {
    mockOfflineWrite.mockResolvedValueOnce(QUEUED).mockRejectedValueOnce(new Error("boom"));
    renderModal();
    fireEvent.press(screen.getAllByText("☆")[0]);
    fireEvent.press(screen.getByText("Send Feedback"));
    await waitFor(() => expect(screen.getByText("Thank you!")).toBeTruthy());
  });
});

describe("FlagModal", () => {
  it("resets 'Submitting…' and shows the error when offlineWrite throws", async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const FlagModal = require("../src/components/FlagModal").default;
    mockOfflineWrite.mockRejectedValueOnce(new Error("boom"));
    render(<FlagModal visible lessonId="l1" lessonTitle="Lesson" userId="u1" onClose={jest.fn()} />);
    fireEvent.press(screen.getByText("Something else"));
    fireEvent.press(screen.getByText("Submit Report"));
    await waitFor(() => expect(screen.queryByText("Submitting…")).toBeNull());
    expect(screen.getByText("Submit Report")).toBeTruthy();
  });
});

describe("shareEngine", () => {
  beforeEach(() => {
    jest.spyOn(Share, "share").mockImplementation(mockShare);
  });

  it("returns the queue result so a caller can tell the share was not recorded", async () => {
    mockOfflineWrite.mockResolvedValue(REFUSED);
    const payload = { userId: "u1", trackName: "Quant" } as any;
    expect(await shareOnLevelComplete(payload)).toEqual(REFUSED);
    expect(await shareOnPortfolioArtifact(payload)).toEqual(REFUSED);
    mockOfflineWrite.mockResolvedValue(QUEUED);
    expect(await shareOnLevelComplete(payload)).toEqual(QUEUED);
  });
});
