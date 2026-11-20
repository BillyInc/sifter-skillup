/**
 * The end of the programme page must clear BOTH floating elements: the
 * collapsed learning-plan dock (88px) and the notes button (52px + margin),
 * otherwise the legal disclaimer's right edge sits under the notes button.
 */
import * as fs from "fs";
import * as path from "path";

const source = fs.readFileSync(path.join(__dirname, "ProgrammeDetailRefinedScreen.tsx"), "utf8");
const fab = fs.readFileSync(path.join(__dirname, "../../components/careerIntelligence/NotesFab.tsx"), "utf8");

describe("programme page bottom clearance", () => {
  it("adds the notes button's height to the dock clearance", () => {
    const dock = Number(/const DOCK_CLEARANCE = (\d+);/.exec(source)?.[1]);
    const extra = Number(/const NOTES_FAB_CLEARANCE = (\d+);/.exec(source)?.[1]);
    const fabHeight = Number(/height: (\d+),/.exec(fab.slice(fab.indexOf('position: "absolute"')))?.[1]);
    expect(dock).toBeGreaterThanOrEqual(88);
    expect(fabHeight).toBeGreaterThan(0);
    // clearance for the FAB itself plus a gap
    expect(extra).toBeGreaterThanOrEqual(fabHeight + 8);
    expect(source).toMatch(/contentDockClearance: \{ paddingBottom: Spacing\.xxl \+ DOCK_CLEARANCE \+ NOTES_FAB_CLEARANCE \}/);
  });
});
