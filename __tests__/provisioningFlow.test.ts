import {
  provisioningDraftsNeedTicks,
  provisioningModeFor,
  selectedProvisioningDraftIds,
} from "../src/lib/provisioningFlow";

describe("school account creation flow", () => {
  it("uses the saved secondary-school organization even if the route says JAMB", () => {
    expect(provisioningModeFor("secondary_school", "jamb")).toBe("school");
  });

  it("keeps tutorial centres and JAMB cafes on JAMB accounts", () => {
    expect(provisioningModeFor("tutorial_centre", "school")).toBe("jamb");
    expect(provisioningModeFor("jamb_cafe", "school")).toBe("jamb");
  });

  it("uses route mode only when organization type is not yet known", () => {
    expect(provisioningModeFor(null, "school")).toBe("school");
    expect(provisioningModeFor(undefined, "jamb")).toBe("jamb");
  });

  it("does not require a selection tick for a single named student", () => {
    expect(selectedProvisioningDraftIds([{ id: "one", fullName: "Ada" }], {})).toEqual(["one"]);
    expect(provisioningDraftsNeedTicks([{ id: "one" }])).toBe(false);
  });

  it("requires explicit ticks when selecting among multiple students", () => {
    const drafts = [{ id: "one", fullName: "Ada" }, { id: "two", fullName: "Bola" }];
    expect(selectedProvisioningDraftIds(drafts, {})).toEqual([]);
    expect(selectedProvisioningDraftIds(drafts, { two: true })).toEqual(["two"]);
    expect(provisioningDraftsNeedTicks(drafts)).toBe(true);
  });

  it("does not implicitly select a single unnamed draft", () => {
    expect(selectedProvisioningDraftIds([{ id: "one", fullName: " " }], {})).toEqual([]);
  });
});
