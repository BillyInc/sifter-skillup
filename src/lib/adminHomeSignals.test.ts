import {
  attentionItems,
  formatLastOpened,
  pickResume,
} from "./adminHomeSignals";
import type { StudentIntelligenceSummary } from "../types/institution";

const base: StudentIntelligenceSummary = {
  organizationId: "org-1",
  totalAffiliated: 12,
  selfSignedUp: 5,
  provisionedByYou: 7,
  unclaimedCodes: 0,
  stageCounts: [],
  topDomains: [],
};

describe("attentionItems", () => {
  it("is empty when nothing needs attention", () => {
    expect(attentionItems(base)).toEqual([]);
  });

  it("reports unused claim codes with the real count", () => {
    const [item] = attentionItems({ ...base, unclaimedCodes: 4 });
    expect(item.key).toBe("unclaimed_codes");
    expect(item.count).toBe(4);
    expect(item.label).toBe("4 claim codes have not been used yet");
    expect(item.destination).toBe("students");
  });

  it("uses the singular for one", () => {
    expect(attentionItems({ ...base, unclaimedCodes: 1 })[0].label).toBe(
      "1 claim code has not been used yet",
    );
  });

  it("reports students with no recorded stage from stageCounts", () => {
    const items = attentionItems({
      ...base,
      stageCounts: [
        { stage: "ss3_secondary", total: 3, selfSignedUp: 2, provisionedByYou: 1 },
        { stage: "not_recorded", total: 2, selfSignedUp: 1, provisionedByYou: 1 },
      ],
    });
    expect(items).toHaveLength(1);
    expect(items[0].key).toBe("stage_not_recorded");
    expect(items[0].label).toBe("2 students have not recorded a stage yet");
  });

  it("ignores a missing stageCounts (older servers) and zero totals", () => {
    const { stageCounts, ...older } = base;
    void stageCounts;
    expect(attentionItems(older as StudentIntelligenceSummary)).toEqual([]);
    expect(
      attentionItems({
        ...base,
        stageCounts: [{ stage: "not_recorded", total: 0, selfSignedUp: 0, provisionedByYou: 0 }],
      }),
    ).toEqual([]);
  });

  it("orders unclaimed codes first and sends providers to the JAMB accounts", () => {
    const items = attentionItems(
      {
        ...base,
        unclaimedCodes: 2,
        stageCounts: [{ stage: "not_recorded", total: 1, selfSignedUp: 0, provisionedByYou: 1 }],
      },
      { providerOnly: true },
    );
    expect(items.map((i) => i.key)).toEqual(["unclaimed_codes", "stage_not_recorded"]);
    expect(items.every((i) => i.destination === "jambAccounts")).toBe(true);
  });
});

describe("pickResume", () => {
  const task = {
    href: "/(admin)/students",
    label: "Student account creation and roster",
    stage: "ss3_secondary",
    tab: "add",
    updatedAt: "2026-11-20T10:00:00.000Z",
  };
  const page = {
    href: "/(admin)/skills-gap",
    label: "Programme skills review",
    updatedAt: "2026-11-20T12:00:00.000Z",
  };

  it("is null when there is nothing to resume", () => {
    expect(pickResume(null, null)).toBeNull();
  });

  it("never resumes into an admin home page", () => {
    expect(
      pickResume(null, { href: "/(admin)/dashboard", label: "Admin workspace", updatedAt: page.updatedAt }),
    ).toBeNull();
    expect(
      pickResume(null, { href: "/(admin)/guidance?x=1", label: "Guidance workspace", updatedAt: page.updatedAt }),
    ).toBeNull();
  });

  it("picks the most recently saved of the task and the page", () => {
    expect(pickResume(task, page)?.href).toBe("/(admin)/skills-gap");
    expect(pickResume({ ...task, updatedAt: "2026-11-21T00:00:00.000Z" }, page)?.href).toBe(
      "/(admin)/students",
    );
  });

  it("prefers the task on a tie and falls back to the other when one is a home page", () => {
    expect(pickResume(task, { ...page, updatedAt: task.updatedAt })?.source).toBe("task");
    expect(
      pickResume(task, { href: "/(admin)/dashboard", label: "Admin workspace", updatedAt: "2026-11-22T00:00:00.000Z" })?.href,
    ).toBe("/(admin)/students");
  });
});

describe("formatLastOpened", () => {
  it("formats a valid timestamp and returns empty for an unreadable one", () => {
    expect(formatLastOpened("2026-11-20T10:00:00.000Z")).toMatch(/2026/);
    expect(formatLastOpened("")).toBe("");
    expect(formatLastOpened("not a date")).toBe("");
  });
});
