import {
  admissionDoorCue,
  d078FieldCue,
  D078_AREA_CUE,
  D078_AREA_LIST_CUE,
  D078_ROLE_CUE,
  fieldHandoffCue,
  guidanceStepCue,
  programmePreviewCue,
  secondarySetupCue,
  TRAY_CUE,
  TRAY_EMPTY_CUE,
  UNDERGRADUATE_PROGRAMME_CUE,
  UNDERGRADUATE_SETUP_CUE,
  universityListCue,
  universitySelectedCue,
  savedReportCue,
  startingPointCue,
} from "./studentFlowCopy";

describe("student flow cues", () => {
  it("gives each starting point its own next step", () => {
    expect(startingPointCue("ss1_secondary").here).toContain("SS1");
    expect(startingPointCue("ss2_secondary").next).toContain("View universities");
    expect(startingPointCue("ss3_secondary").next).toContain("subjects");
    expect(startingPointCue("jamb").here).toContain("UTME");
    expect(startingPointCue("student").next).toContain("university");
    expect(startingPointCue(null).here).toContain("starting point");
  });

  it("keeps the three admission doors distinct", () => {
    expect(admissionDoorCue("unsure", true).next).toContain("preview");
    expect(admissionDoorCue("know_what", false).next).toContain("compare");
    expect(admissionDoorCue("know_where", true).next).toContain("that university");
  });

  it("explains secondary setup, undergraduate setup, and university transitions", () => {
    expect(secondarySetupCue("SS1").here).toContain("SS1");
    expect(secondarySetupCue("SS2").next).toContain("View universities");
    expect(UNDERGRADUATE_SETUP_CUE.next).toContain("Choose your university");
    expect(UNDERGRADUATE_PROGRAMME_CUE.next).toContain("open a field");
    expect(universityListCue().next).toContain("Open one university");
    expect(universitySelectedCue("University of Lagos").next).toContain("UTME subjects");
  });

  it("names Social Sciences only when that field is linked", () => {
    expect(fieldHandoffCue(true).next).toContain("Social Sciences");
    expect(fieldHandoffCue(false).next).not.toContain("Social Sciences");
    expect(programmePreviewCue("Sociology").next).toContain("View universities");
  });

  it("changes the Social Sciences cue after a method is selected", () => {
    expect(d078FieldCue(false).here).toContain("after Sociology");
    expect(d078FieldCue(true).here).toContain("selected method");
    expect(D078_AREA_LIST_CUE.next).toContain("Roles come after the area");
    expect(D078_AREA_CUE.next).toContain("open a role");
    expect(D078_ROLE_CUE.next).toContain("learning plan");
  });

  it("points the guidance review and tray to their actual next action", () => {
    expect(guidanceStepCue("review").next).toContain("Print / download");
    expect(TRAY_EMPTY_CUE.next).toContain("Use Add this");
    expect(TRAY_CUE.next).toContain("Saved");
  });

  it("tells a saved plan whether printing is available", () => {
    expect(savedReportCue(true).next).toContain("Print / save report");
    expect(savedReportCue(false).here).toContain("institution attached");
    expect(savedReportCue(false).next).toContain("tutorial centre");
  });
});
