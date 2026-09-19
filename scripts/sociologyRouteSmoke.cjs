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

const nav = makeExploreNav("/(tabs)/explore");
const context = {
  programmeId: "sociology-id",
  jambProgrammeId: "sociology-jamb-id",
  schoolId: "university-id",
  userType: "senior_secondary",
  focused: true,
  preserveHistory: true,
};
const target = router();

nav.programme(target, "sociology-id", { ...context, resumeStage: "university_offerings" });
nav.programme(target, "sociology-id", { ...context, resumeStage: "university_context" });
nav.domain(target, "D078", context);
nav.subgroup(target, "D078", "D078|sg:research", context);
nav.role(target, "D078|role:social-researcher", context);

const hrefs = target.calls.filter(([kind]) => kind === "push").map(([, href]) => href);
const requiredFragments = [
  "resume=university_offerings",
  "resume=university_context",
  "programme_id=sociology-id",
  "jamb_programme_id=sociology-jamb-id",
  "school_id=university-id",
  "/domain/D078/subgroup/D078%7Csg%3Aresearch",
  "/role/D078|role:social-researcher",
];

for (const fragment of requiredFragments) {
  if (!hrefs.some((href) => href.includes(fragment))) {
    throw new Error(`Sociology route context missing: ${fragment}`);
  }
}

if (target.calls.some(([kind]) => kind === "replace")) {
  throw new Error("Sociology focused route unexpectedly replaced history");
}

if (hrefs.length !== 5) {
  throw new Error(`Expected the complete Sociology route smoke (5 transitions), received ${hrefs.length}`);
}

console.log(`Sociology route smoke passed (programme preview -> university context -> domain -> subgroup -> role; ${hrefs.length} transitions)`);
