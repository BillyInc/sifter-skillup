import type { RosterStudent } from "../types/institution";
import {
  ALL,
  EMPTY_ROSTER_FILTERS,
  STAGE_NOT_SET,
  applyRosterFilters,
  buildRosterFilterGroups,
  claimKeyOf,
  getRememberedRosterFilters,
  hasActiveRosterFilters,
  rememberRosterFilters,
  resetRememberedRosterFilters,
  sanitizeRosterFilters,
  sourceKeyOf,
} from "./rosterFilters";

const row = (id: string, over: Partial<RosterStudent> = {}): RosterStudent => ({
  userId: id,
  fullName: id,
  provenance: "provisioned",
  claimState: "unclaimed",
  visible: true,
  hasConsent: false,
  studentClass: "SS3",
  ...over,
});

const students: RosterStudent[] = [
  row("a", { studentClass: "SS3" }),
  row("b", { studentClass: "SS3", claimState: "claimed" }),
  row("c", { studentClass: "SS2", provenance: "self", claimState: null, hasConsent: true }),
  row("d", { studentClass: null }),
];
const stageOf = (s: RosterStudent) => s.studentClass;

describe("rosterFilters", () => {
  beforeEach(() => resetRememberedRosterFilters());

  it("classifies claimed and source the same way as the roster badge", () => {
    expect(claimKeyOf(students[0])).toBe("unclaimed");
    expect(claimKeyOf(students[1])).toBe("claimed");
    expect(claimKeyOf(students[2])).toBe("claimed");
    expect(sourceKeyOf(students[0])).toBe("provisioned");
    expect(sourceKeyOf(students[2])).toBe("self");
  });

  it("filters by stage, claimed and source, and combines them", () => {
    expect(applyRosterFilters(students, { ...EMPTY_ROSTER_FILTERS, stage: "SS3" }, stageOf).map((s) => s.userId)).toEqual(["a", "b"]);
    expect(applyRosterFilters(students, { ...EMPTY_ROSTER_FILTERS, claimed: "unclaimed" }, stageOf).map((s) => s.userId)).toEqual(["a", "d"]);
    expect(applyRosterFilters(students, { ...EMPTY_ROSTER_FILTERS, source: "self" }, stageOf).map((s) => s.userId)).toEqual(["c"]);
    expect(
      applyRosterFilters(students, { stage: "SS3", claimed: "claimed", source: "provisioned" }, stageOf).map((s) => s.userId),
    ).toEqual(["b"]);
    expect(applyRosterFilters(students, { stage: "SS2", claimed: "unclaimed", source: ALL }, stageOf)).toEqual([]);
  });

  it("puts rows without a stage under an honest 'not recorded' option, last", () => {
    const groups = buildRosterFilterGroups(students, EMPTY_ROSTER_FILTERS, stageOf);
    expect(groups.stage.map((o) => o.label)).toEqual(["All", "SS2", "SS3", STAGE_NOT_SET]);
    expect(applyRosterFilters(students, { ...EMPTY_ROSTER_FILTERS, stage: STAGE_NOT_SET }, stageOf).map((s) => s.userId)).toEqual(["d"]);
  });

  it("counts each option against the other groups' selections", () => {
    const groups = buildRosterFilterGroups(students, { ...EMPTY_ROSTER_FILTERS, claimed: "claimed" }, stageOf);
    const stageCounts = Object.fromEntries(groups.stage.map((o) => [o.label, o.count]));
    expect(stageCounts).toEqual({ All: 2, SS2: 1, SS3: 1, [STAGE_NOT_SET]: 0 });
    const claimCounts = Object.fromEntries(buildRosterFilterGroups(students, { ...EMPTY_ROSTER_FILTERS, stage: "SS3" }, stageOf).claimed.map((o) => [o.key, o.count]));
    expect(claimCounts).toEqual({ all: 2, unclaimed: 1, claimed: 1 });
  });

  it("hides a group that cannot narrow anything", () => {
    const onlyProvisioned = [row("x"), row("y")];
    const groups = buildRosterFilterGroups(onlyProvisioned, EMPTY_ROSTER_FILTERS, stageOf);
    expect(groups.stage).toEqual([]);
    expect(groups.claimed).toEqual([]);
    expect(groups.source).toEqual([]);
  });

  it("falls back to All when a chosen option no longer exists", () => {
    const groups = buildRosterFilterGroups([row("x", { studentClass: "SS3" }), row("y", { studentClass: "SS2" })], EMPTY_ROSTER_FILTERS, stageOf);
    expect(sanitizeRosterFilters({ stage: "JSS1", claimed: "claimed", source: "self" }, groups)).toEqual(EMPTY_ROSTER_FILTERS);
    expect(sanitizeRosterFilters({ ...EMPTY_ROSTER_FILTERS, stage: "SS2" }, groups).stage).toBe("SS2");
  });

  it("remembers the last choice for the session and can reset it", () => {
    expect(hasActiveRosterFilters(getRememberedRosterFilters())).toBe(false);
    rememberRosterFilters({ stage: "SS3", claimed: ALL, source: "self" });
    expect(getRememberedRosterFilters()).toEqual({ stage: "SS3", claimed: ALL, source: "self" });
    expect(hasActiveRosterFilters(getRememberedRosterFilters())).toBe(true);
    resetRememberedRosterFilters();
    expect(getRememberedRosterFilters()).toEqual(EMPTY_ROSTER_FILTERS);
  });
});
