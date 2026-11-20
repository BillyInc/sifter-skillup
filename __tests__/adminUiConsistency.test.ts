import fs from "fs";
import path from "path";

const read = (rel: string) => fs.readFileSync(path.join(__dirname, "..", rel), "utf8");

describe("admin and settings UI consistency", () => {
  it("uses one phrase for learners the institution added, on the card and in the stage table", () => {
    const card = read("src/screens/admin/GeneralDashboardScreen.tsx");
    const table = read("src/components/admin/StudentStageTable.tsx");
    expect(card).toContain('label="Added by you"');
    expect(table).toContain("Added by you");
    expect(card).not.toContain("Provisioned by you");
  });

  it("shows a single Back on the web Settings route", () => {
    const web = read("web/src/WebApp.tsx");
    const settings = read("src/screens/SettingsScreen.tsx");
    expect(settings).toContain("Back to Profile");
    expect(web).toMatch(/routeHasOwnBack[\s\S]*path === "\/settings"/);
  });

  it("wraps the admin header search onto its own row on narrow screens", () => {
    const css = read("web/src/styles.css");
    expect(css).toMatch(/@media \(max-width: 900px\)[^}]*\.web-admin-header \{ flex-wrap: wrap/);
    expect(css).toMatch(/\.web-admin-global-search \{ order: 10; flex: 1 1 100%/);
  });
});
