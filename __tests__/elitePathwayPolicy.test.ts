import {
  ELITE_PATHWAY_QUALITY_CHECKS,
  GUIDE_REQUIRED_BRIDGE_LAYER_KEYS,
  NIGERIAN_USER_TYPES,
  validateElitePathwayCoverage,
} from "../src/lib/elitePathwayPolicy";

describe("elitePathwayPolicy", () => {
  it("keeps the guide taxonomy and quality gates complete", () => {
    expect(NIGERIAN_USER_TYPES).toHaveLength(13);
    expect(ELITE_PATHWAY_QUALITY_CHECKS).toHaveLength(15);
    expect(GUIDE_REQUIRED_BRIDGE_LAYER_KEYS).toEqual([
      "global_standard",
      "nigerian_qualification_map",
      "bridge_inventory",
      "timeline_cost",
      "employer_entry",
    ]);
  });

  it("reports missing coverage before pathway content can be released", () => {
    const issues = validateElitePathwayCoverage({
      bridgeLayerKeys: ["global_standard"],
      userTypeKeys: ["ss3_jamb_candidate"],
      qualityCheckKeys: ["specific_claims_sourced"],
    });

    expect(issues.some((issue) => issue.code === "missing_bridge_layer")).toBe(true);
    expect(issues.some((issue) => issue.code === "missing_user_type")).toBe(true);
    expect(issues.some((issue) => issue.code === "missing_quality_check")).toBe(true);
  });

  it("passes when all non-data release gates are declared", () => {
    const issues = validateElitePathwayCoverage({
      bridgeLayerKeys: GUIDE_REQUIRED_BRIDGE_LAYER_KEYS,
      userTypeKeys: NIGERIAN_USER_TYPES.map((userType) => userType.key),
      qualityCheckKeys: ELITE_PATHWAY_QUALITY_CHECKS.map((check) => check.key),
    });

    expect(issues).toEqual([]);
  });
});
