/**
 * The workbench is only useful if it is actually mounted on both admin homes
 * (a component-level test cannot notice a module that no screen renders).
 */
import * as fs from "fs";
import * as path from "path";

const read = (rel: string) =>
  fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

/** Source with block and line comments removed, so a comment cannot satisfy or trip an assertion. */
const code = (rel: string) =>
  read(rel).replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");

describe("admin Home workbench wiring", () => {
  it("is mounted on the university dashboard with the loaded student payload", () => {
    const src = read("src/screens/admin/GeneralDashboardScreen.tsx");
    expect(src).toContain('from "@/components/admin/AdminWorkbench"');
    expect(src).toMatch(/<AdminWorkbench students=\{students\}/);
  });

  it("is mounted on the school / provider cohort screen with the provider flag", () => {
    const src = read("src/screens/admin/SchoolGuidanceDashboardScreen.tsx");
    expect(src).toContain('from "@/components/admin/AdminWorkbench"');
    expect(src).toMatch(/<AdminWorkbench[^>]*students=\{students\}[^>]*providerOnly=\{providerOnly\}/);
  });

  it("the school screen reads the real payload field names", () => {
    const src = code("src/screens/admin/SchoolGuidanceDashboardScreen.tsx");
    expect(src).toContain("unclaimedCodes");
    expect(src).toContain("provisionedByYou");
    expect(src).not.toContain("unclaimedProvisioned");
    expect(src).not.toContain("domainName");
  });

  it("uses only existing admin routes", () => {
    const src = read("src/lib/adminNav.ts");
    expect(src).toContain('"/(admin)/students"');
    expect(src).toContain('"/(admin)/students?mode=jamb"');
  });
});
