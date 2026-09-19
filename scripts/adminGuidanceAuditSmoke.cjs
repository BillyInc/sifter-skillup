/* Focused admin evidence/exposure contract smoke. */
const assert = require("node:assert/strict");
const tsNode = require("ts-node");

tsNode.register({
  transpileOnly: true,
  compilerOptions: { module: "NodeNext", moduleResolution: "NodeNext", customConditions: [] },
});

const {
  canApproveForStudent,
  canExposeToStudents,
  normaliseAdminGuidanceEvidence,
} = require("../src/screens/admin/adminGuidanceEvidence.ts");

const base = {
  id: "relationship-1",
  name: "Research methods supports evidence analysis",
  level: "domain",
  itemType: "relationship",
  sourceUrl: "https://example.org/evidence",
  sourceLocator: "p. 12, section 3",
  sourceAccessedAt: "2026-09-19",
};

for (const state of ["review_required", "no_link", "not_established", "audit_only"]) {
  const record = normaliseAdminGuidanceEvidence({ ...base, evidence_state: state });
  assert.equal(canApproveForStudent(record).allowed, false, `${state} was approvable`);
  assert.equal(canExposeToStudents(record).allowed, false, `${state} was student-exposed`);
}

const verified = normaliseAdminGuidanceEvidence({ ...base, evidence_state: "verified" });
assert.equal(canApproveForStudent(verified).allowed, true);
assert.equal(canExposeToStudents(verified).allowed, false, "verified data bypassed approval");

const approved = normaliseAdminGuidanceEvidence({ ...base, evidence_state: "approved" });
assert.equal(canExposeToStudents(approved).allowed, true);
assert.equal(canExposeToStudents({ ...approved, sourceLocator: null, sourceUrl: null }).allowed, false);
assert.equal(canExposeToStudents({ ...approved, sourceAccessedAt: null }).allowed, false);

console.log("Admin guidance audit smoke passed (source trace, access date, approval, and student-exposure gates).");
