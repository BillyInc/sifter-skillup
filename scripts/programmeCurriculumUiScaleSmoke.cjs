/*
 * Focused UI-contract smoke for the generic programme curriculum renderer.
 * It proves that one explicitly tagged Sociology course cannot switch generic
 * programme_core courses into Sociology's thematic classifier.
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

const { programmeThemeForCourse } = require("../src/components/careerIntelligence/programmeCurriculumThemes.ts");

assert.equal(programmeThemeForCourse({
  title: "Research Methods in Accounting",
  displayGroup: "programme_core",
  outcomes: [{ studentText: "Analyse evidence and prepare a research report" }],
}), "core");

assert.equal(programmeThemeForCourse({
  title: "Research Methods",
  displayGroup: "sociology_programme",
  outcomes: [{ studentText: "Analyse evidence from fieldwork" }],
}), "research");

assert.equal(programmeThemeForCourse({
  title: "Communication Skills",
  displayGroup: "shared_university",
  outcomes: [],
}), "shared");

console.log("Programme curriculum UI scale smoke passed (generic core isolation, reviewed thematic grouping, shared course grouping).");
