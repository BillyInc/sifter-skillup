/*
 * Cross-programme route-contract smoke.
 *
 * This checks that the shared navigation shape carries route-local academic
 * context for more than the reviewed Sociology example. It does not claim
 * that the live curriculum/evidence SQL has been applied.
 */
const assert = require("node:assert/strict");
const tsNode = require("ts-node");

tsNode.register({
  transpileOnly: true,
  compilerOptions: {
    module: "NodeNext",
    moduleResolution: "NodeNext",
    customConditions: [],
  },
});

global.__DEV__ = false;

const { makeExploreNav } = require("../src/lib/exploreNav.ts");

function router() {
  const calls = [];
  return {
    calls,
    push: (href) => calls.push(["push", href]),
    replace: (href) => calls.push(["replace", href]),
    back: () => calls.push(["back"]),
  };
}

const fixtures = [
  {
    label: "Sociology",
    programmeId: "sociology-id",
    jambProgrammeId: "sociology-jamb-id",
    schoolId: "university-id",
    domainId: "D078",
    subgroupId: "D078|sg:research",
    roleId: "D078|role:social-researcher",
  },
  {
    label: "Nursing",
    programmeId: "nursing-id",
    jambProgrammeId: "nursing-jamb-id",
    schoolId: "teaching-hospital-university-id",
    domainId: "D023",
    subgroupId: "D023|sg:clinical-care",
    roleId: "D023|role:registered-nurse",
  },
  {
    label: "Accounting",
    programmeId: "accounting-id",
    jambProgrammeId: "accounting-jamb-id",
    schoolId: "accounting-university-id",
    domainId: "D006",
    subgroupId: "D006|sg:financial-reporting",
    roleId: "D006|role:accountant",
  },
];

const nav = makeExploreNav("/(tabs)/explore");

for (const fixture of fixtures) {
  const target = router();
  const context = {
    programmeId: fixture.programmeId,
    jambProgrammeId: fixture.jambProgrammeId,
    schoolId: fixture.schoolId,
    userType: "senior_secondary",
    focused: true,
    preserveHistory: true,
  };

  nav.programme(target, fixture.programmeId, { ...context, resumeStage: "university_offerings" });
  nav.programme(target, fixture.programmeId, { ...context, resumeStage: "university_context" });
  nav.domain(target, fixture.domainId, context);
  nav.subgroup(target, fixture.domainId, fixture.subgroupId, context);
  nav.role(target, fixture.roleId, context);

  const hrefs = target.calls.filter(([kind]) => kind === "push").map(([, href]) => href);
  assert.equal(target.calls.some(([kind]) => kind === "replace"), false, `${fixture.label} replaced route history`);
  assert.equal(hrefs.length, 5, `${fixture.label} should have five route transitions`);
  for (const fragment of [
    `programme_id=${fixture.programmeId}`,
    `jamb_programme_id=${fixture.jambProgrammeId}`,
    `school_id=${fixture.schoolId}`,
    `resume=university_offerings`,
    `resume=university_context`,
    `/domain/${fixture.domainId}/subgroup/${encodeURIComponent(fixture.subgroupId)}`,
    `/role/${fixture.roleId}`,
  ]) {
    assert.equal(hrefs.some((href) => href.includes(fragment)), true, `${fixture.label} missing ${fragment}`);
  }
}

console.log(`Programme guidance scale smoke passed for ${fixtures.length} programme contracts (15 transitions).`);
