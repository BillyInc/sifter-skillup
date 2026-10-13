/*
 * Bounded, non-Jest smoke for the Sociology guidance report checkpoint.
 *
 * This intentionally loads the real gate functions and DetailScaffold while
 * replacing native/UI boundaries that cannot run in a plain Node process.
 * It is not a substitute for browser or live-Supabase verification.
 */
const assert = require("node:assert/strict");
const fs = require("node:fs");
const Module = require("node:module");
const React = require("react");

const marker = (name) => {
  const component = () => null;
  component.displayName = name;
  return component;
};

const Native = {
  ActivityIndicator: marker("ActivityIndicator"),
  ScrollView: "ScrollView",
  StyleSheet: { create: (value) => value, hairlineWidth: 1 },
  Text: "Text",
  TouchableOpacity: "TouchableOpacity",
  View: "View",
};
const PdfExportButton = marker("PdfExportButton");
const ShareExportButton = marker("ShareExportButton");

const originalLoad = Module._load;
Module._load = function load(request, parent, isMain) {
  if (request === "react-native") return Native;
  if (request === "expo-router") {
    return {
      useRouter: () => ({ back() {}, canGoBack: () => false, replace() {}, push() {} }),
    };
  }
  if (request === "@expo/vector-icons") return { Feather: marker("Feather") };
  if (request === "@/hooks/useAuth") return { useAuth: () => ({ user: { id: "sociology-student" } }) };
  if (request === "../../theme" || request.endsWith("/theme")) {
    return {
      CompassFonts: { data: {}, displaySemi: {} },
      FontSize: { xs: 12 },
      Radius: { lg: 12 },
      Spacing: { lg: 24, md: 16, sm: 8, xs: 4 },
      useTheme: () => ({ colors: {
        accentRole: { action: "#f97316" },
        borderRole: { subtle: "#ddd" },
        surface: { base: "#fff", raised: "#fff", subtle: "#f7f7f7" },
        textRole: { inverse: "#fff", muted: "#777", primary: "#111", secondary: "#555" },
      } }),
      webContainer: {},
    };
  }
  if (request === "../ui") return { SifterButton: marker("SifterButton") };
  if (request === "../../lib/careerData") return { careerData: {} };
  if (request === "../../lib/provisioningData") return { provisioningData: {} };
  if (request === "./DataStateView") return { DataStateView: marker("DataStateView") };
  if (request === "./SaveButton") return { SaveButton: marker("SaveButton") };
  if (request === "./PdfExportButton") return { PdfExportButton };
  if (request === "./ShareExportButton") return { ShareExportButton };
  if (request === "./CareerDisclaimer") return { CareerDisclaimer: marker("CareerDisclaimer") };
  if (request === "./GuidanceReportButton") {
    return { GuidanceReportButton: marker("GuidanceReportButton") };
  }
  return originalLoad.apply(this, arguments);
};

require("ts-node").register({
  transpileOnly: true,
  compilerOptions: {
    jsx: "react-jsx",
    module: "NodeNext",
    moduleResolution: "NodeNext",
    customConditions: [],
  },
});

const gate = require("../src/components/careerIntelligence/GuidanceReportButton.tsx");
const { DetailScaffold } = require("../src/components/careerIntelligence/DetailScaffold.tsx");

const completedPath = {
  programme: { id: "jamb-sociology", name: "Sociology" },
  university: { id: "university-ibadan", name: "University of Ibadan (UI)" },
  domains: [{ id: "D078", name: "Social Sciences", matchType: "direct" }],
  subgroups: [{ id: "D078|sg:quant", name: "Computational Social Science", domainId: "D078" }],
  roles: [{ id: "statistician", name: "Statistician", domainId: "D078" }],
  resume: { stage: "review", status: "complete" },
};

assert.equal(
  gate.hasGuidanceReportContextForRoute(completedPath, {
    programmeId: "jamb-sociology",
    schoolId: "university-ibadan",
  }),
  true,
);
assert.equal(
  gate.hasGuidanceReportContextForRoute(completedPath, {
    programmeId: "jamb-other-programme",
    schoolId: "university-ibadan",
  }),
  false,
  "a completed path for another programme must not unlock this route",
);
assert.equal(
  gate.hasGuidanceReportContextForRoute(completedPath, {
    programmeId: "jamb-sociology",
    schoolId: "university-other",
  }),
  false,
  "a completed path for another university must not unlock this route",
);
assert.equal(
  gate.isGuidanceReportReadyForRoute(completedPath, {
    programmeId: "jamb-other-programme",
    schoolId: "university-ibadan",
  }),
  false,
  "report actions must stay locked when the restored path is for another route",
);

function actionsFor(path) {
  const enabled = gate.isGuidanceReportReady(path);
  const tree = DetailScaffold({
    title: "Sociology",
    pdf: enabled,
    pdfPath: enabled ? "/api/student/report.html" : undefined,
    reportActionsEnabled: enabled,
    state: { status: "real", data: {} },
    children: () => null,
    disclaimer: false,
  });
  const found = { pdf: [], share: [] };
  const visit = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.type === PdfExportButton) found.pdf.push(node.props);
    if (node.type === ShareExportButton) found.share.push(node.props);
    if (Array.isArray(node.props?.children)) node.props.children.forEach(visit);
    else visit(node.props?.children);
  };
  visit(tree);
  return { enabled, ...found };
}

assert.equal(gate.isGuidanceReportReady({ ...completedPath, resume: { stage: "review", status: "in_progress" } }), false);
const beforeReview = actionsFor({ ...completedPath, resume: { stage: "review", status: "in_progress" } });
assert.equal(beforeReview.enabled, false);
assert.equal(beforeReview.pdf.length, 0, "print/download must stay locked before Review is complete");
assert.equal(beforeReview.share.length, 0, "share must stay locked before Review is complete");

const afterReview = actionsFor(completedPath);
assert.equal(afterReview.enabled, true);
assert.equal(afterReview.pdf.length, 1, "print/download must open after completed Review");
assert.equal(afterReview.share.length, 1, "share must open after completed Review");
assert.equal(afterReview.pdf[0].title, "Open / print report");
assert.equal(afterReview.share[0].documentPath, "/api/student/report.html");

const changed = gate.toggleGuidanceSelectionPath(completedPath, {
  kind: "roles",
  id: "researcher",
  name: "Social Researcher",
  domainId: "D078",
});
assert.equal(gate.isGuidanceReportReady(changed), false, "a selection change must reopen Review");
const afterChange = actionsFor(changed);
assert.equal(afterChange.pdf.length, 0, "print/download must relock after a selection change");
assert.equal(afterChange.share.length, 0, "share must relock after a selection change");

const reReviewed = { ...changed, resume: { stage: "review", status: "complete" } };
const afterReReview = actionsFor(reReviewed);
assert.equal(afterReReview.pdf.length, 1, "print/download must reopen after Review is completed again");
assert.equal(afterReReview.share.length, 1, "share must reopen after Review is completed again");

const scaffoldSource = fs.readFileSync("src/components/careerIntelligence/DetailScaffold.tsx", "utf8");
const guidedSource = fs.readFileSync("src/screens/careerIntelligence/GuidedFieldSelectionScreen.tsx", "utf8");
const myWorldSource = fs.readFileSync("src/screens/MyWorldScreen.tsx", "utf8");
assert.match(scaffoldSource, /reportActionsEnabled\s*&&\s*pdf\s*&&\s*!isGuest/);
assert.match(scaffoldSource, /reportActionsEnabled\s*&&\s*pdfPath\s*&&\s*!isGuest/);
assert.match(guidedSource, /reportActionsEnabled=\{reviewComplete && !saving\}/);
assert.match(guidedSource, /onPrint=\{reviewComplete && !saving \? printLearningPlan : undefined\}/);
assert.match(guidedSource, /onShare=\{reviewComplete && !saving \? shareLearningPlan : undefined\}/);
assert.match(guidedSource, /setShareInput\(\{ routeLabel: routeLabels, focusNames \}\)/);
assert.match(guidedSource, /shareTextSummary\(copy\.title, copy\.message\)/);
assert.doesNotMatch(guidedSource, /shareStudentDocument\(reportDocumentPath/);
assert.match(guidedSource, /learningPlanRemovedIdsByRoute/);
assert.match(guidedSource, /params\.snapshot_id/);
assert.match(guidedSource, /learningFocus: sanitizedFocus/);
assert.match(guidedSource, /How your route is organized/);
assert.match(guidedSource, /does not make every item in an earlier layer a prerequisite/);
assert.match(myWorldSource, /Saved learning plan route stacks/);
assert.match(myWorldSource, /not included in this route/);
assert.match(myWorldSource, /savedReportContext\.domains/);
assert.match(myWorldSource, /savedReportContext\.subgroups/);
assert.match(myWorldSource, /savedReportContext\.roles/);
assert.match(myWorldSource, /deleteGuidanceSnapshot\(snapshotId\)/);
assert.match(myWorldSource, /snapshot_id=\$\{encodeURIComponent\(activeSnapshotId\)\}/);

console.log("Sociology report smoke passed: locked before Review, open after Review, relocked after selection change, reopened after re-review.");
