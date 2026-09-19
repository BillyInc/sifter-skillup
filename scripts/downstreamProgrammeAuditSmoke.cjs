/*
 * Focused all-programme downstream audit and admin/student boundary smoke.
 *
 * The Python audit owns the deterministic population inventory.  This test
 * verifies that the generated contract is complete and that the existing
 * admin evidence gate does not expose review-only or provenance-incomplete
 * records to students.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const tsNode = require("ts-node");

tsNode.register({
  transpileOnly: true,
  compilerOptions: { module: "NodeNext", moduleResolution: "NodeNext", customConditions: [] },
});

const reportPath = path.join(
  process.cwd(),
  "data",
  "career-mapping",
  "_audit",
  "DOWNSTREAM_PROGRAMME_ROUTE_AUDIT_2026-09-19.json",
);
assert.equal(fs.existsSync(reportPath), true, "run the deterministic downstream audit first");
const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));

assert.equal(report.scope.requiredProgrammeCount, 237);
assert.equal(report.coverage.programmeRecordsCovered, 237);
assert.equal(report.programmes.length, 237);
assert.equal(report.smokeFixtureCheck.allPresent, true);
assert.deepEqual(report.smokeFixtureCheck.missingFixtures, []);
assert.equal(report.scope.adminEvidenceIsNotAStudentRoute, true);
assert.equal(report.sourceState.studentExposureIsFailClosed, true);
assert.ok(report.coverage.contextRouteDigest.length === 64);

const keys = report.programmes.map((row) => row.programmeKey);
assert.equal(new Set(keys).size, keys.length, "programme inventory contains duplicate keys");
for (const row of report.programmes) {
  assert.equal(typeof row.routeKeyDigest, "string");
  assert.equal(row.routeKeyDigest.length, 64);
  assert.equal(typeof row.routeKeyCount, "number");
  assert.equal(row.routeKeyCount >= 2, true, `${row.programmeKey} lacks programme routes`);
  assert.equal(Array.isArray(row.missingRoutes), true);
  assert.equal(Array.isArray(row.domainRoutes), true);
  for (const domain of row.domainRoutes) {
    assert.equal(typeof domain.domainId, "string");
    assert.equal(typeof domain.relationship, "string");
    assert.equal(typeof domain.domainContextPresent, "boolean");
    assert.equal(typeof domain.subgroupRouteCount, "number");
    assert.equal(typeof domain.roleRouteCount, "number");
  }
}

const {
  canApproveForStudent,
  canExposeToStudents,
  normaliseAdminGuidanceEvidence,
} = require("../src/screens/admin/adminGuidanceEvidence.ts");

const base = {
  id: "downstream-audit-boundary",
  name: "Research methods supports evidence analysis",
  level: "domain",
  itemType: "relationship",
  contextKey: "D078",
  programmeKey: "jamb-sociology",
  guidanceOwner: "domain",
  sourceUrl: "https://example.org/evidence",
  sourceLocator: "p. 12, section 3",
  sourceAccessedAt: "2026-09-19",
};

for (const state of ["review_required", "no_link", "not_established", "audit_only"]) {
  const record = normaliseAdminGuidanceEvidence({ ...base, evidence_state: state });
  assert.equal(canApproveForStudent(record).allowed, false, `${state} was approvable`);
  assert.equal(canExposeToStudents(record).allowed, false, `${state} leaked to students`);
}

const verified = normaliseAdminGuidanceEvidence({ ...base, evidence_state: "verified" });
assert.equal(canApproveForStudent(verified).allowed, true);
assert.equal(canExposeToStudents(verified).allowed, false, "verified evidence bypassed approval");

const approved = normaliseAdminGuidanceEvidence({ ...base, evidence_state: "approved" });
assert.equal(canExposeToStudents(approved).allowed, true);
assert.equal(
  canExposeToStudents({ ...approved, source_locator: null, source_url: null }).allowed,
  false,
  "approved evidence without provenance leaked to students",
);
assert.equal(
  canExposeToStudents({ ...approved, source_accessed_at: null }).allowed,
  false,
  "approved evidence without access date leaked to students",
);

assert.equal(report.sourceState.items.studentRenderableRows <= report.sourceState.items.catalogueRows, true);
assert.equal(report.sourceState.relationships.studentRenderableRows <= report.sourceState.relationships.relationshipRows, true);
assert.equal(report.decision.studentExposureApproved, false);

console.log(
  `Downstream audit smoke passed: ${report.programmes.length} programmes, ` +
    `${report.coverage.uniqueContextRouteCount} context routes, ` +
    "fail-closed item/relationship and admin/student boundary checks.",
);
