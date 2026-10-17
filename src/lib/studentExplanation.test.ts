import { studentContextSections, studentFacingCopy, studentGeographicContext, studentItemLimitations, studentOutputCopy, studentReasonCopy, studentResourceRationale } from "./studentExplanation";

test("separates a source-marked output from the task text", () => {
  expect(studentOutputCopy(
    "Compare records. Output: a cited comparison noting missing evidence.",
    "Compare records. Output: a cited comparison noting missing evidence.",
  )).toBe("a cited comparison noting missing evidence.");
});

test("does not repeat a task as a separate output when no output is stated", () => {
  const task = "Check how people understand a survey question before fieldwork.";
  expect(studentOutputCopy(task, task)).toBe("");
});

test("retains a distinct output even when it has no task/output marker", () => {
  expect(studentOutputCopy("A tested questionnaire and documented response export.", "Build and test the questionnaire."))
    .toBe("A tested questionnaire and documented response export.");
});

test("recovers an embedded output from contextual use when the separate output field is empty", () => {
  const context = "Use the method for the selected question. Task: Compare sources. Output: A cited comparison with one limitation. Guardrail: Do not infer causes from one association.";
  expect(studentOutputCopy(null, context)).toBe("A cited comparison with one limitation.");
  expect(studentContextSections(context)).toEqual({
    meaning: "Use the method for the selected question.",
    task: "Compare sources.",
    output: "A cited comparison with one limitation.",
    guardrail: "Do not infer causes from one association.",
  });
});

test("does not append a guardrail to an output stored in a combined expected-output field", () => {
  expect(studentOutputCopy(
    "Task: Compare sources. Output: A cited comparison with one limitation. Guardrail: Do not infer causes.",
    "Use the method for the selected question.",
  )).toBe("A cited comparison with one limitation.");
});

test("removes staff-only placement notes while retaining learner explanation", () => {
  expect(studentFacingCopy("A useful method for comparing accounts. Route note: show only in the selected area. Task: Compare two accounts."))
    .toBe("A useful method for comparing accounts.");
  expect(studentFacingCopy("Area-specific enrichment candidate for the selected route."))
    .toBe("");
});

test("does not present disposition vocabulary as the learner-facing reason", () => {
  expect(studentReasonCopy("Shared foundation candidate for evidence routes."))
    .toBe("");
  expect(studentReasonCopy("It is useful when a route requires a comparison of groups."))
    .toBe("It is useful when a route requires a comparison of groups.");
});

test("removes an internal useful-edge label without hiding its learner-facing explanation", () => {
  expect(studentReasonCopy("Useful additional edge · useful additional edge"))
    .toBe("");
  expect(studentReasonCopy("Useful additional edge: It can help you compare evidence across groups, while remaining optional."))
    .toBe("It can help you compare evidence across groups, while remaining optional.");
  expect(studentReasonCopy("This useful additional edge can help with a selected research route."))
    .toBe("This useful additional edge can help with a selected research route.");
});

test("explains why an attached resource may help without overstating what it covers", () => {
  expect(studentResourceRationale(
    "question-writing guide",
    "Survey design",
    "In Sociology, the method can compare how groups experience access to education.",
    "Question wording and response options",
  )).toContain("It supports the work explained above, but it may cover only part of that work.");
  expect(studentResourceRationale(undefined, "Survey design", "Draft and test questions.")).toContain(
    "This resource is attached as a place to learn or read more about Survey design.",
  );
  expect(studentResourceRationale(undefined, "Survey design", "Draft and test questions.")).toContain(
    "A learning link is not proof that you can already do the work",
  );
});

test("explains the evidence geography without implying local rules are universal", () => {
  expect(studentGeographicContext("nigeria")).toMatch(/Nigerian sources or application/);
  expect(studentGeographicContext("nigeria")).toMatch(/differ across states, institutions and employers/);
  expect(studentGeographicContext("global")).toMatch(/international/);
  expect(studentGeographicContext("global")).toMatch(/only where local rules, data and working conditions fit/);
  expect(studentGeographicContext("nigeria_to_global")).toMatch(/Nigerian connection/);
});

test("shows an honest non-mastery limit when no item-specific limitation is recorded", () => {
  expect(studentItemLimitations([])).toEqual([
    "No item-specific limitation is recorded. Seeing this item in your learning path does not show that you have mastered it. Where the work requires a qualification, permission or supervision, this learning item does not replace it.",
  ]);
  expect(studentItemLimitations(["This method cannot establish that one factor caused another."]))
    .toEqual(["This method cannot establish that one factor caused another."]);
});
