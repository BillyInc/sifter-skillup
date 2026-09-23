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
  adminEvidenceQueueState,
  partitionAdminGuidanceEvidence,
  normaliseAdminGuidanceEvidence,
} = require("../src/screens/admin/adminGuidanceEvidence.ts");

const base = {
  id: "relationship-1",
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
  assert.equal(canExposeToStudents(record).allowed, false, `${state} was student-exposed`);
}

assert.equal(adminEvidenceQueueState(normaliseAdminGuidanceEvidence({ ...base, evidence_state: "review_required" })), "review_required");
assert.equal(
  adminEvidenceQueueState(normaliseAdminGuidanceEvidence({ ...base, evidence_state: "verified" })),
  "awaiting_approval",
);

const missingIdentity = normaliseAdminGuidanceEvidence({
  ...base,
  contextKey: null,
  guidanceOwner: null,
  evidence_state: "verified",
});
assert.equal(canApproveForStudent(missingIdentity).allowed, false, "context-free evidence entered approval");
assert.equal(adminEvidenceQueueState(missingIdentity), "identity_incomplete");

const wrongOwner = normaliseAdminGuidanceEvidence({
  ...base,
  guidanceOwner: "role",
  evidence_state: "verified",
});
assert.equal(canApproveForStudent(wrongOwner).allowed, false, "wrong-owner evidence entered approval");

const verified = normaliseAdminGuidanceEvidence({ ...base, evidence_state: "verified" });
assert.equal(canApproveForStudent(verified).allowed, true);
assert.equal(canExposeToStudents(verified).allowed, false, "verified data bypassed approval");

const approved = normaliseAdminGuidanceEvidence({ ...base, evidence_state: "approved" });
assert.equal(canExposeToStudents(approved).allowed, true);
assert.equal(adminEvidenceQueueState(approved), "student_ready");
assert.equal(canExposeToStudents({ ...approved, sourceLocator: null, sourceUrl: null }).allowed, false);
assert.equal(canExposeToStudents({ ...approved, sourceAccessedAt: null }).allowed, false);
assert.equal(
  canExposeToStudents({ ...approved, linkState: "review_required" }).allowed,
  false,
  "approved evidence with an unresolved link leaked to students",
);
assert.equal(
  canExposeToStudents({ ...approved, sourceUrl: null, sourceLocator: null, sourceLocators: [{ page: 12 }] }).allowed,
  true,
  "structured source locators were not accepted as provenance",
);
assert.equal(
  canExposeToStudents(normaliseAdminGuidanceEvidence({ ...base, evidence_state: "approved", sourceUrl: null, sourceLocator: null, source_url: null, source_locator: null, url: "https://example.org/learning" })).allowed,
  false,
  "an item link was treated as source provenance",
);

const views = partitionAdminGuidanceEvidence([
  approved,
  normaliseAdminGuidanceEvidence({ ...base, evidence_state: "review_required" }),
]);
assert.deepEqual(views.accepted.map((record) => record.id), [approved.id]);
assert.deepEqual(views.internal.map((record) => record.id), ["relationship-1"]);
assert.equal(normaliseAdminGuidanceEvidence({ ...base, review_status: "approved_guidance_v1" }).evidenceState, "approved");

console.log("Admin guidance audit smoke passed (source trace, access date, approval, and student-exposure gates).");
