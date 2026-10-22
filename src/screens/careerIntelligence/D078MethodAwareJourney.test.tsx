jest.mock("@/theme/motion", () => ({ useReducedMotion: () => true }));
jest.mock("@/hooks/useAuth", () => ({ useAuth: () => ({ user: { id: "student-1" } }) }));
jest.mock("react-native-safe-area-context", () => ({
  ...jest.requireActual("react-native-safe-area-context"),
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
}));
import React, { useState } from "react";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import { pending, real } from "@/types/career";
import type { GuidanceReportPath } from "@/lib/careerData";
import type { CareerLearningResource } from "@/types/career";
import { d078ShareInputFromSnapshot } from "@/lib/d078Snapshot";
import {
  D078AreaResults,
  D078AreaRoute,
  D078MethodAwareJourney,
  D078JourneyPage,
  isWideD078Layout,
  shouldUseD078ViewportTrayDock,
  D078RelationshipNavigationProvider,
  D078RoleRoute,
  ItemCard,
  d078DefaultTrayMode,
  d078PrimaryActionStyle,
  d078TraySheetStyle,
  d078ShareMessage,
  d078MotionOffset,
  d078RelationshipScrollOffset,
  d078PickerSelection,
  d078RoleStillVisible,
  resolveD078RoleRouteId,
  guidancePathPayload,
  savedD078Selection,
  buildD078SnapshotForSave,
} from "./D078MethodAwareJourney";
import { MethodChoicePanel } from "@/components/careerIntelligence/MethodChoicePanel";
import { DetailScaffold } from "@/components/careerIntelligence/DetailScaffold";
import {
  INITIAL_D078_SELECTION,
  d078Node,
  d078ApplicableLayerItems,
  d078GraphDataForTests,
  projectD078Route,
  selectD078Area,
  selectD078Role,
  toggleD078Combination,
  toggleD078Method,
} from "@/lib/d078RouteProjection";

const INTERVIEWS = "domain-item:d078-interviews";
const CHI_SQUARE = "domain-item:d078-chi-square-tests";
const INTERVIEW_OBSERVATION = "combo:interview-and-observation";
const QUALITATIVE = "domain-item:d078-qualitative-approach";
const SURVEY = "domain-item:d078-survey-method";
const PROGRAMME_KEY = "programme-1::D078";

function JourneyHarness({ initial = INITIAL_D078_SELECTION }: { initial?: typeof INITIAL_D078_SELECTION }) {
  const [selection, setSelection] = useState(initial);
  const projection = projectD078Route(selection);
  return <>
    <MethodChoicePanel
      selection={selection}
      onToggleMethod={(id) => setSelection((current) => toggleD078Method(current, id))}
      onToggleCombination={(id) => setSelection((current) => toggleD078Combination(current, id))}
      onToggleComponentMethod={() => undefined}
      onClear={() => setSelection(INITIAL_D078_SELECTION)}
    />
    {projection.hiddenBecause
      ? <Text>{"Choose one or more ways to investigate. Areas and roles appear only for the methods or named design you select."}</Text>
      : <D078AreaResults projection={projection} onOpenArea={() => undefined} />}
  </>;
}

describe("D078 method-aware journey UI acceptance", () => {
  it("renders carried programme course titles at the card-title scale", () => {
    const themeKey = "ideas";
    const outcomeId = "programme-outcome:sociology:SOC 101:11";
    const programmeConnection = {
      programmeId: "programme:social-sciences:sociology",
      programmeName: "Sociology",
      relationship: "direct",
      explanation: "Your Sociology studies connect to this field.",
      curriculumAvailable: true,
      programmeCurriculumThemes: [{
        themeKey,
        title: "Ideas and foundations",
        summary: "Core sociological ideas.",
        narration: "Learn key sociological ideas.",
        connectionExplanation: "This theme is part of Sociology.",
        directTransferEvidenceStatus: "matched",
        matchedCourseCodes: ["SOC 101"],
        matchedOutcomeIds: [outcomeId],
        courseAnchors: [],
        matchedCourseAnchors: [],
        programmeOutcomes: [{ outcomeId, courseCode: "SOC 101", courseTitle: "Introduction to Sociology", studentText: "Explain sociological ideas.", sourceLocator: {} }],
        transferableEvidence: [],
      }],
    } as any;
    const initialSelection = { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] };

    render(<ThemeProvider><D078MethodAwareJourney
      domainKey="D078"
      programmeName="Sociology"
      programmeConnection={programmeConnection}
      initialSelection={initialSelection}
      guidanceContext={{ domainId: "D078" }}
    /></ThemeProvider>);

    const courseTitle = screen.getByText("Introduction to Sociology");
    expect(StyleSheet.flatten(courseTitle.props.style)).toMatchObject({ fontSize: 16, lineHeight: 22 });
  });

  it("uses full-screen journey stages without a non-actionable side rail", () => {
    expect(isWideD078Layout(1600, "web")).toBe(true);
    expect(isWideD078Layout(1366, "web")).toBe(true);
    expect(isWideD078Layout(1280, "web")).toBe(true);
    expect(isWideD078Layout(1279, "web")).toBe(false);
    expect(isWideD078Layout(1600, "ios")).toBe(false);
    expect(d078DefaultTrayMode(1600, "web")).toBe("mid");
    expect(d078DefaultTrayMode(1366, "web")).toBe("mid");
    expect(d078DefaultTrayMode(390, "ios")).toBe("icon");
    expect(d078PrimaryActionStyle(390, "ios")).toEqual({ width: "100%" });
    expect(d078PrimaryActionStyle(1024, "web")).toEqual({ width: "100%" });
    expect(d078PrimaryActionStyle(1366, "web")).toEqual({ minWidth: 160, alignSelf: "flex-start" });
    expect(d078PrimaryActionStyle(1600, "web")).toEqual({ minWidth: 160, alignSelf: "flex-start" });
    expect(d078TraySheetStyle(767)).toBeUndefined();
    expect(d078TraySheetStyle(768)).toMatchObject({ width: "100%", maxWidth: 560, alignSelf: "flex-end", marginRight: 16, marginBottom: 16 });
    expect(d078TraySheetStyle(390, "full")).toMatchObject({ width: "100%", height: "100%", maxHeight: "100%", flex: 1, margin: 0, borderRadius: 0 });
    expect(d078TraySheetStyle(768, "full")).toMatchObject({ width: "100%", height: "100%", flex: 1, maxWidth: "100%", alignSelf: "stretch" });
    expect(shouldUseD078ViewportTrayDock(390, "web", true)).toBe(true);
    expect(shouldUseD078ViewportTrayDock(767, "ios", true)).toBe(true);
    expect(shouldUseD078ViewportTrayDock(768, "web", true)).toBe(true);
    expect(shouldUseD078ViewportTrayDock(1024, "web", true)).toBe(true);
    expect(shouldUseD078ViewportTrayDock(1279, "web", true)).toBe(true);
    expect(shouldUseD078ViewportTrayDock(1280, "web", true)).toBe(false);
    expect(shouldUseD078ViewportTrayDock(1439, "web", true)).toBe(false);
    expect(shouldUseD078ViewportTrayDock(1440, "web", true)).toBe(false);
    expect(shouldUseD078ViewportTrayDock(1440, "ios", true)).toBe(true);
    expect(shouldUseD078ViewportTrayDock(390, "web", false)).toBe(false);
    const priorWindow = Dimensions.get("window");
    const priorScreen = Dimensions.get("screen");
    Dimensions.set({
      window: { ...priorWindow, width: 390 },
      screen: { ...priorScreen, width: 390 },
    });
    const mobile = render(<ThemeProvider><D078JourneyPage stage="field" tray={<Text>Mobile plan tray</Text>}><Text>Mobile reading column</Text></D078JourneyPage></ThemeProvider>);
    try {
      const mobileRoot = mobile.UNSAFE_getByType(View);
      expect(StyleSheet.flatten(mobileRoot.props.style).flexDirection).not.toBe("row");
      expect(mobile.getByText("Mobile plan tray")).toBeTruthy();
      expect(mobile.getByTestId("d078-full-screen-field-stage")).toBeTruthy();
      expect(mobile.queryByText("What you study")).toBeNull();
      expect(mobile.queryByText("An area")).toBeNull();
      expect(mobile.queryByText("A role")).toBeNull();
    } finally {
      mobile.unmount();
      Dimensions.set({ window: priorWindow, screen: priorScreen });
    }
  });

  it("keeps the collapsed mobile tray fixed outside the scrolling detail content", () => {
    const rendered = render(<ThemeProvider><DetailScaffold title="Social Sciences" state={real({})} disclaimer={false}>
      {() => <D078JourneyPage stage="field" tray={<Text>Persistent native learning plan</Text>}><Text>Scrollable journey content</Text></D078JourneyPage>}
    </DetailScaffold></ThemeProvider>);
    const hasScrollViewAncestor = (instance: ReturnType<typeof rendered.getByText>) => {
      let current: typeof instance | null = instance;
      while (current) {
        if (current.type === ScrollView) return true;
        current = current.parent;
      }
      return false;
    };
    const hasAbsolutePositionParent = (instance: ReturnType<typeof rendered.getByText>) => {
      let current: typeof instance | null = instance;
      while (current) {
        if (current.type === View && StyleSheet.flatten(current.props.style).position === "absolute") return true;
        current = current.parent;
      }
      return false;
    };
    expect(hasScrollViewAncestor(rendered.getByText("Scrollable journey content"))).toBe(true);
    const trayLabel = rendered.getByText("Persistent native learning plan");
    expect(hasScrollViewAncestor(trayLabel)).toBe(false);
    expect(hasAbsolutePositionParent(trayLabel)).toBe(true);
    const detailScroll = rendered.UNSAFE_getAllByType(ScrollView).find((instance) => StyleSheet.flatten(instance.props.contentContainerStyle).paddingBottom === 112);
    expect(detailScroll).toBeTruthy();
  });

  it("refreshes the fixed viewport tray when its selected content changes", () => {
    const priorWindow = Dimensions.get("window");
    const priorScreen = Dimensions.get("screen");
    Dimensions.set({ window: { ...priorWindow, width: 390 }, screen: { ...priorScreen, width: 390 } });
    function ChangingTrayContent() {
      const [selected, setSelected] = useState(false);
      return <>
        <D078JourneyPage stage="field" trayRevision={selected ? "selected" : "empty"} tray={<Text>{selected ? "1 selected item" : "0 selected items"}</Text>}>
          <Text>Scrollable route</Text>
        </D078JourneyPage>
        <TouchableOpacity onPress={() => setSelected(true)}><Text>Select an item</Text></TouchableOpacity>
      </>;
    }
    const rendered = render(<ThemeProvider><DetailScaffold title="Social Sciences" state={real({})} disclaimer={false}>
      {() => <ChangingTrayContent />}
    </DetailScaffold></ThemeProvider>);
    try {
      expect(screen.getByText("0 selected items")).toBeTruthy();
      fireEvent.press(screen.getByText("Select an item"));
      expect(screen.getByText("1 selected item")).toBeTruthy();
      expect(screen.queryByText("0 selected items")).toBeNull();
    } finally {
      rendered.unmount();
      Dimensions.set({ window: priorWindow, screen: priorScreen });
    }
  });

  it("shares the selected route layers and makes the saved stop point explicit", () => {
    const baseRoute = {
      routeLabel: "Sociology · Social Sciences",
      choices: [{ id: "interviews", label: "Interviews", kind: "method" as const }],
      foundations: ["Frame a researchable question", "Evaluate evidence", "Communicate findings"],
      selectedItems: [{ id: "guide", label: "Prepare an interview guide", lane: "Useful for interviews", contextLevel: "domain" }],
      onRemoveChoice: () => undefined,
      onRemoveItem: () => undefined,
    };
    const areaMessage = d078ShareMessage({ ...baseRoute, areaLabel: "Sociology and Social Anthropology" }, "Sociology");
    expect(areaMessage).toContain("Methods and designs selected: Interviews");
    expect(areaMessage).toContain("Area of specialization: Sociology and Social Anthropology");
    expect(areaMessage).toContain("No role selected; this route stops at the selected level.");
    expect(areaMessage).toContain("Prepare an interview guide — Useful for interviews");
    const roleMessage = d078ShareMessage({ ...baseRoute, areaLabel: "Sociology and Social Anthropology", roleLabel: "Social Researcher" }, "Sociology");
    expect(roleMessage).toContain("Role explored: Social Researcher");
  });

  it("shows no areas at zero selection, then shows and removes Interviews areas", () => {
    render(<ThemeProvider><JourneyHarness /></ThemeProvider>);
    expect(screen.getByText("Choose one or more ways to investigate. Areas and roles appear only for the methods or named design you select.")).toBeTruthy();
    expect(screen.queryByText("Economics and Applied Economic Analysis")).toBeNull();
    const select = screen.getByRole("button", { name: "Select Interviews" });
    expect(StyleSheet.flatten(select.props.style).minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(select);
    expect(screen.getByText("Areas for what you selected")).toBeTruthy();
    const interviewAreas = projectD078Route(toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS)).visibleAreas;
    expect(interviewAreas).toHaveLength(4);
    interviewAreas.forEach((area) => expect(screen.getByText(area.label)).toBeTruthy());
    const openArea = screen.getByRole("button", { name: `Select area ${interviewAreas[0].label}` });
    expect(StyleSheet.flatten(openArea.props.style).minHeight).toBeGreaterThanOrEqual(44);
    expect(StyleSheet.flatten(openArea.props.style).width).toBe("100%");
    expect(screen.queryByText("Economics and Applied Economic Analysis")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Deselect Interviews" }));
    expect(screen.queryByText("Areas for what you selected")).toBeNull();
    expect(screen.getByText("Choose one or more ways to investigate. Areas and roles appear only for the methods or named design you select.")).toBeTruthy();
  });

  it("reveals only route-linked Layer 2/3 items after method selection", () => {
    const graph = d078GraphDataForTests();
    const layerIds = graph.domain_learning_layers.filter((layer) => layer.layer === 2 || layer.layer === 3).flatMap((layer) => layer.item_ids ?? []);
    const linkedToInterviews = new Set([
      ...d078ApplicableLayerItems(2, toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS)),
      ...d078ApplicableLayerItems(3, toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS)),
    ]);
    const rendered = render(<ThemeProvider><D078MethodAwareJourney domainKey="D078" programmeName="Sociology" guidanceContext={{ domainId: "D078" }} /></ThemeProvider>);
    const methodHeading = screen.getByText("Methods of investigation/research");
    expect(methodHeading).toBeTruthy();
    layerIds.forEach((id) => expect(screen.queryByText(d078Node(id)?.label ?? id)).toBeNull());
    expect(screen.getByText("Choose one or more ways to investigate. Areas and roles appear only for the methods or named design you select.")).toBeTruthy();
    expect(screen.queryByTestId("d078-intermediate-learning-layers")).toBeNull();

    fireEvent.press(screen.getByRole("button", { name: "Select Interviews" }));
    expect(screen.getByText("Preparation for your selected method")).toBeTruthy();
    expect(screen.getByText("Field-wide knowledge and useful learning")).toBeTruthy();
    for (const id of layerIds) {
      const label = d078Node(id)?.label ?? id;
      if (linkedToInterviews.has(id)) expect(screen.getByText(label)).toBeTruthy();
      else expect(screen.queryByText(label)).toBeNull();
    }
    const renderedText = rendered.UNSAFE_getAllByType(Text);
    const methodIndex = renderedText.findIndex((entry) => entry.props.children === methodHeading.props.children);
    const preparationIndex = renderedText.findIndex((entry) => entry.props.children === "Preparation for your selected method");
    expect(preparationIndex).toBeGreaterThan(methodIndex);
    expect(screen.getByText("Areas for what you selected")).toBeTruthy();

    const chosenLayer2Id = layerIds.find((id) => graph.domain_learning_layers.find((layer) => layer.layer === 2)?.item_ids?.includes(id) && linkedToInterviews.has(id));
    expect(chosenLayer2Id).toBeTruthy();
    const chosenLayer2Label = d078Node(chosenLayer2Id!)?.label ?? chosenLayer2Id!;
    fireEvent.press(screen.getByRole("button", { name: `Add ${chosenLayer2Label} to your learning` }));
    fireEvent.press(screen.getByRole("button", { name: "Open learning plan tray with 4 selected route details or learning choices" }));
    expect(screen.getByText("Domain learning")).toBeTruthy();
    expect(screen.getByText(chosenLayer2Label)).toBeTruthy();
  });

  it("keeps Build as a separate sibling destination beside the domain overview", () => {
    const rendered = render(<ThemeProvider><D078MethodAwareJourney domainKey="D078" programmeName="Sociology" guidanceContext={{ domainId: "D078" }} /></ThemeProvider>);
    expect(rendered.getByTestId("d078-build-domain-entry")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Open Build in this domain" })).toBeTruthy();
    expect(screen.getByText("Knowledge of society and the social world")).toBeTruthy();
  });

  it("keeps every Layer 2/3-to-method gap unresolved until local and external evidence are searched", () => {
    const audit = d078GraphDataForTests().method_item_fit_audit;
    expect(audit).toBeDefined();
    expect(audit?.candidate_item_count).toBe(10);
    expect(audit?.method_count).toBe(22);
    expect(audit?.pair_count).toBe(220);
    expect(audit?.dispositions).toHaveLength(220);
    expect(audit?.dispositions.every((entry) => entry.disposition !== "no_supported_fit")).toBe(true);
    expect(audit?.dispositions.every((entry) => entry.no_fit_allowed === false)).toBe(true);
    const conditional = audit?.dispositions.filter((entry) => entry.disposition === "externally_supported_conditional_fit") ?? [];
    expect(conditional).toHaveLength(71);
    expect(conditional.every((entry) => Boolean(entry.condition) && entry.external_search_status === "recorded" && entry.external_sources?.length)).toBe(true);
    expect(conditional.flatMap((entry) => entry.external_sources ?? []).every((sourceId) => Boolean(d078GraphDataForTests().external_source_registry?.[sourceId]?.url))).toBe(true);
    expect(audit?.dispositions.filter((entry) => entry.disposition === "domain_orientation_context_not_method_item")).toHaveLength(22);
  });

  it("waits for a named design before revealing Layer 2/3 for a multi-method selection", () => {
    const interviewOnly = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const twoMethods = toggleD078Method(interviewOnly, "domain-item:d078-observation-ethnography");
    expect(d078ApplicableLayerItems(2, twoMethods)).toEqual([]);
    expect(d078ApplicableLayerItems(3, twoMethods)).toEqual([]);

    const namedDesign = toggleD078Combination(twoMethods, INTERVIEW_OBSERVATION);
    expect(namedDesign.combinationIds).toEqual([INTERVIEW_OBSERVATION]);
    expect(d078ApplicableLayerItems(2, namedDesign).length + d078ApplicableLayerItems(3, namedDesign).length).toBeGreaterThan(0);
  });

  it("carries the selected named design explanation and its own route into downstream", () => {
    render(<ThemeProvider><D078MethodAwareJourney domainKey="D078" programmeName="Sociology" guidanceContext={{ domainId: "D078" }} /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: `Select ${d078Node(QUALITATIVE)?.label}` }));
    fireEvent.press(screen.getByRole("button", { name: `Select ${d078Node(SURVEY)?.label}` }));
    fireEvent.press(screen.getByRole("button", { name: "Select Explore first, measure next" }));

    expect(screen.getByTestId("d078-selected-combined-design")).toBeTruthy();
    for (const heading of ["Why these methods fit together", "How the work proceeds", "What each method contributes", "Use this design when", "Keep in mind"]) {
      expect(screen.getByText(heading)).toBeTruthy();
    }
    expect(screen.getByText("Areas for what you selected")).toBeTruthy();
  });

  it("counts and reveals a selected method in the wired mobile learning-plan tray", () => {
    const priorWindow = Dimensions.get("window");
    const priorScreen = Dimensions.get("screen");
    Dimensions.set({
      window: { ...priorWindow, width: 390 },
      screen: { ...priorScreen, width: 390 },
    });
    const rendered = render(<ThemeProvider><D078MethodAwareJourney
      domainKey="D078"
      programmeName="Sociology"
      guidanceContext={{ domainId: "D078" }}
    /></ThemeProvider>);
    try {
      fireEvent.press(screen.getByRole("button", { name: "Select Interviews" }));
      const openTray = screen.getByRole("button", { name: "Open learning plan tray with 3 selected route details or learning choices" });
      expect(openTray).toBeTruthy();
      fireEvent.press(openTray);
      expect(screen.getByText("Your selected approaches")).toBeTruthy();
      expect(screen.getAllByText("Interviews").length).toBeGreaterThan(1);
      expect(screen.getByText("1 selected method/design · 0 added items")).toBeTruthy();
    } finally {
      rendered.unmount();
      Dimensions.set({ window: priorWindow, screen: priorScreen });
    }
  });

  it("does not merge separate method routes until the learner selects a named combined design", () => {
    const { rerender } = render(<ThemeProvider><JourneyHarness key="spatial" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: /Select Spatial/ }));
    expect(screen.getByText("Computational and Digital Social Science")).toBeTruthy();
    expect(screen.getByText("Human Geography and Population Studies")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Select Interviews" }));
    expect(screen.getByText("Choose one or more ways to investigate. Areas and roles appear only for the methods or named design you select.")).toBeTruthy();
    expect(screen.queryByText("Areas for what you selected")).toBeNull();

    const design = d078GraphDataForTests().combination_designs.find((entry) => entry.id === INTERVIEW_OBSERVATION)!;
    const exactMethods = design.required_method_ids.reduce((state, methodId) => toggleD078Method(state, methodId), INITIAL_D078_SELECTION);
    rerender(<ThemeProvider><JourneyHarness key="combination" initial={toggleD078Combination(exactMethods, INTERVIEW_OBSERVATION)} /></ThemeProvider>);
    expect(screen.getByText("Areas for what you selected")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Deselect Interviews" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Deselect Observation" })).toBeNull();
  });

  it("groups area task-family text in a readable section without rewriting the stored labels", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const area = projectD078Route(selection).visibleAreas.find((entry) => entry.taskFamilyIds.length > 0);
    expect(area).toBeTruthy();
    const areaRoles = projectD078Route(selection).visibleRoles.filter((role) => role.areaId === area!.areaId);
    expect(areaRoles.length).toBeGreaterThan(0);

    render(<ThemeProvider><D078AreaRoute
      domainKey="D078"
      areaId={area!.areaId}
      initialSelection={selection}
      roles={areaRoles.map((role) => ({ key: `D078|${role.label}`, name: role.label, areaIds: [area!.areaId] }))}
      guidanceContext={{ domainId: "D078", areaId: area!.areaId }}
    /></ThemeProvider>);

    const areaTitle = screen.getByRole("header", { name: area!.label });
    expect(StyleSheet.flatten(areaTitle.props.style)).toMatchObject({ fontSize: 26, lineHeight: 32 });
    const backButton = screen.getByRole("button", { name: "Back to Social Sciences domain" });
    expect(StyleSheet.flatten(backButton.props.style)).toMatchObject({ alignSelf: "flex-start" });
    const routeContextButton = screen.getByRole("button", { name: `Show what carries into ${area!.label}` });
    expect(StyleSheet.flatten(routeContextButton.props.style)).toMatchObject({ alignSelf: "flex-start" });
    const sectionHeading = screen.getByRole("header", { name: "What this area covers" });
    expect(StyleSheet.flatten(sectionHeading.props.style)).toMatchObject({ fontSize: 16, lineHeight: 22 });
    const sequenceHeading = screen.getByText("Roles in this area for your selected methods");
    expect(StyleSheet.flatten(sequenceHeading.props.style)).toMatchObject({ fontSize: 20, lineHeight: 26 });
    for (const taskFamilyId of area!.taskFamilyIds) {
      const label = d078Node(taskFamilyId)?.label;
      if (label) {
        const taskFamily = screen.getByText(label);
        expect(StyleSheet.flatten(taskFamily.props.style).fontSize).toBeGreaterThanOrEqual(16);
        expect(StyleSheet.flatten(taskFamily.props.style).lineHeight).toBeGreaterThanOrEqual(24);
      }
    }
    const openRoleButtons = screen.getAllByRole("button", { name: /^Select role/ });
    expect(openRoleButtons.length).toBe(areaRoles.length);
    openRoleButtons.forEach((button) => expect(StyleSheet.flatten(button.props.style)).toMatchObject({ width: "100%" }));
  });

  it("uses the handoff type scale for item titles, summaries and expanded explanations", () => {
    const node = d078Node(INTERVIEWS)!;
    const meaning = String(node.meaning ?? node.plain_language_meaning ?? node.meaning_in_domain).replace(/D078/g, "this field");
    render(<ThemeProvider><ItemCard id={INTERVIEWS} selection={INITIAL_D078_SELECTION} contextLevel="domain" stepIndex={1} /></ThemeProvider>);

    const title = screen.getByRole("header", { name: node.label });
    expect(StyleSheet.flatten(title.props.style)).toMatchObject({ fontSize: 16, lineHeight: 22 });
    const summary = screen.getByText(meaning);
    expect(StyleSheet.flatten(summary.props.style)).toMatchObject({ fontSize: 14, lineHeight: 20 });
    expect(StyleSheet.flatten(screen.getByText("Step 1 of 3").props.style)).toMatchObject({ fontSize: 13, lineHeight: 18 });
    let card = title.parent;
    while (card && !(card.type === View && StyleSheet.flatten(card.props.style).padding === 12)) card = card.parent;
    expect(card).toBeTruthy();
    expect(StyleSheet.flatten(card!.props.style)).toMatchObject({ padding: 12, gap: 6 });

    fireEvent.press(screen.getByRole("button", { name: new RegExp(`^See more about ${node.label}`) }));
    const explanations = screen.getAllByText(meaning);
    expect(explanations).toHaveLength(2);
    expect(StyleSheet.flatten(explanations[1].props.style)).toMatchObject({ fontSize: 16, lineHeight: 24 });
    expect(StyleSheet.flatten(screen.getByText("What it is").props.style)).toMatchObject({ fontSize: 16, lineHeight: 22 });
    let expandedSections = screen.getByText("What it is").parent;
    while (expandedSections && !(expandedSections.type === View
      && StyleSheet.flatten(expandedSections.props.style).paddingTop === 6
      && StyleSheet.flatten(expandedSections.props.style).gap === 8)) {
      expandedSections = expandedSections.parent;
    }
    expect(expandedSections).toBeTruthy();
    expect(StyleSheet.flatten(expandedSections!.props.style).gap).toBe(8);
  });

  it("explains how an optional statistics technique builds on programme preparation without claiming the exact test was taught", () => {
    const node = d078Node(CHI_SQUARE)!;
    render(<ThemeProvider><ItemCard id={CHI_SQUARE} selection={INITIAL_D078_SELECTION} contextLevel="domain" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: /^See more about Chi-square tests/ }));

    expect(screen.getByText("How this relates to your Sociology curriculum")).toBeTruthy();
    expect(screen.getByText(/introduces research statistics and expects you to apply appropriate analysis/i)).toBeTruthy();
    expect(screen.getByText(/published curriculum record available here confirms the broader statistics foundation, not coverage or mastery of this exact procedure/i)).toBeTruthy();
    expect(screen.getByText("SSC 401 · Research Method II")).toBeTruthy();
    expect(screen.getByText("SOC 301 · Methods of Social Research and Statistics")).toBeTruthy();
    expect(node.programme_learning_context).toBeDefined();
  });

  it("omits the learning-resource section when no approved item resource exists", () => {
    const itemId = "domain-item:d078-nvivo-tool";
    const { unmount } = render(<ThemeProvider><ItemCard id={itemId} selection={INITIAL_D078_SELECTION} contextLevel="domain" /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: /^See more about NVivo/ }));
    expect(screen.queryByText("Learning resources")).toBeNull();
    expect(screen.queryByText("A learning link has not been verified yet.")).toBeNull();
    unmount();

    const itemLabel = d078Node(itemId)!.label;
    const resource: CareerLearningResource = {
      id: "nvivo-learning-resource",
      ownershipScope: "domain",
      reviewStatus: "approved_guidance_v1",
      resourceType: "tool_learning",
      targetName: itemLabel,
      provider: "NVivo",
      region: "global",
      accessType: "free",
      url: "https://example.org/nvivo-guide",
    };
    const secondResource: CareerLearningResource = {
      ...resource,
      id: "nvivo-methods-reference",
      provider: "Open Social Science",
      url: "https://example.org/nvivo-methods",
    };
    render(<ThemeProvider><ItemCard id={itemId} selection={INITIAL_D078_SELECTION} contextLevel="domain" resources={[resource, secondResource]} /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: /^See more about NVivo/ }));
    expect(screen.getByText("Learning resources")).toBeTruthy();
    expect(screen.getAllByText(itemLabel).length).toBeGreaterThan(1);
    expect(screen.getByRole("button", { name: `Tool guide. ${itemLabel}. NVivo. Free to access. Open.` })).toBeTruthy();
    expect(screen.getByRole("button", { name: `Tool guide. ${itemLabel}. Open Social Science. Free to access. Open.` })).toBeTruthy();
  });

  it("renders the graph-backed complementary relation without mislabelling it as an alternative", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    selection = selectD078Area(selection, "D078:sociology-social-anthropology");
    render(<ThemeProvider><ItemCard
      id="domain-item:d078-nvivo-tool"
      selection={selection}
      contextLevel="subgroup"
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: /^See more about NVivo/ }));
    expect(screen.getByText("How this connects")).toBeTruthy();
    expect(screen.getAllByText("Tool for this method").length).toBeGreaterThan(0);
    expect(screen.queryByRole("button", { name: /Compare NVivo.*Thematic\/framework analysis/ })).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "See Interviews" }));
    expect(screen.getByText("Connected option")).toBeTruthy();
    expect(screen.getByText("An interview is a planned conversation for learning how someone understands or experiences an issue. It can add depth, but does not automatically measure how common an experience is.")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Back to NVivo for organizing and coding substantial qualitative material" }));
    expect(screen.queryByText("Connected option")).toBeNull();
  });

  it("opens the actual projected relationship target card and returns to the source card", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    selection = selectD078Area(selection, "D078:sociology-social-anthropology");
    render(<ThemeProvider><D078RelationshipNavigationProvider>
      <ItemCard id="domain-item:d078-nvivo-tool" selection={selection} contextLevel="subgroup" />
      <ItemCard id={INTERVIEWS} selection={selection} contextLevel="subgroup" />
    </D078RelationshipNavigationProvider></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: /^See more about NVivo/ }));
    fireEvent.press(screen.getByRole("button", { name: "See Interviews" }));

    expect(screen.getByRole("button", { name: /^Hide details for Interviews/ })).toBeTruthy();
    expect(screen.queryByText("Connected option")).toBeNull();
    expect(screen.getByRole("button", { name: "Back to NVivo for organizing and coding substantial qualitative material" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Back to NVivo for organizing and coding substantial qualitative material" }));
    expect(screen.queryByRole("button", { name: "Back to NVivo for organizing and coding substantial qualitative material" })).toBeNull();
    expect(screen.getByText("How this connects")).toBeTruthy();
  });

  it("positions a relationship target twenty pixels below the detail viewport top", () => {
    expect(d078RelationshipScrollOffset(300, 540, 100)).toBe(720);
    expect(d078RelationshipScrollOffset(10, 15, 100)).toBe(0);
  });

  it("does not expose a connected area item as available while still at the field stop", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, "domain-item:d078-document-analysis");
    render(<ThemeProvider><ItemCard
      id="domain-item:d078-nvivo-tool"
      selection={selection}
      onToggle={jest.fn()}
      contextLevel="domain"
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: /^See more about NVivo/ }));
    expect(screen.getByText("That item is hidden until you select a method that uses it.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Compare NVivo with/ })).toBeNull();
  });

  it("returns to the picker when the open role loses its last supporting method and Undo restores that role", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    selection = selectD078Area(selection, "D078:sociology-social-anthropology");
    const role = projectD078Route(selection).visibleRoles.find((entry) => entry.areaId === selection.areaId);
    expect(role).toBeTruthy();
    const roleSelection = selectD078Role(selection, role!.roleId);
    const afterRemoval = toggleD078Method(roleSelection, INTERVIEWS);
    expect(d078RoleStillVisible(afterRemoval, role!.roleId, role!.areaId)).toBe(false);
    expect(d078PickerSelection(afterRemoval)).toMatchObject({ areaId: undefined, roleId: undefined });
    expect(projectD078Route(roleSelection).visibleRoles.some((entry) => entry.roleId === role!.roleId && entry.areaId === role!.areaId)).toBe(true);
  });

  it("does not resolve or open a D078 role until its selected area is explicit", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const role = projectD078Route(selection).visibleRoles[0];
    expect(role).toBeTruthy();
    expect(resolveD078RoleRouteId(selection, undefined, role!.roleId, role!.label)).toBeUndefined();
    expect(resolveD078RoleRouteId(selection, role!.areaId, role!.roleId, role!.label)).toBe(role!.roleId);

    selection = selectD078Area(selection, role!.areaId);
    expect(resolveD078RoleRouteId(selection, "D078:unselected-area", role!.roleId, role!.label)).toBeUndefined();
  });

  it("renders the safe fallback instead of a role page when a role URL has no selected area", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const role = projectD078Route(selection).visibleRoles[0];
    expect(role).toBeTruthy();

    render(<ThemeProvider><D078RoleRoute
      roleId={role!.roleId}
      roleName={role!.label}
      roleKey={`D078|${role!.label}`}
      initialSelection={selection}
      roles={[]}
      guidanceContext={{ domainId: "D078" }}
    /></ThemeProvider>);

    expect(screen.getByText("This role is not in your selected route")).toBeTruthy();
    expect(screen.getByText("Roles appear after you choose a method, open one of its areas, and select a role connected to that area.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back to Social Sciences domain" })).toBeTruthy();
    expect(screen.queryByText(new RegExp(`^${role!.label}$`, "i"))).toBeNull();
  });

  it("renders a role only when the explicit selected area contains that role", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const role = projectD078Route(selection).visibleRoles.find((entry) => entry.areaId === "D078:sociology-social-anthropology");
    expect(role).toBeTruthy();

    render(<ThemeProvider><D078RoleRoute
      areaId="D078:economics-applied-analysis"
      roleId={role!.roleId}
      roleName={role!.label}
      roleKey={`D078|${role!.label}`}
      initialSelection={selection}
      roles={[]}
      guidanceContext={{ domainId: "D078" }}
    /></ThemeProvider>);

    expect(screen.getByText("This role is not in your selected route")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Back to area" })).toBeTruthy();
    expect(screen.queryByText(new RegExp(`^${role!.label}$`, "i"))).toBeNull();

    selection = selectD078Area(selection, role!.areaId);
    const { unmount } = render(<ThemeProvider><D078RoleRoute
      areaId={role!.areaId}
      roleId={role!.roleId}
      roleName={role!.label}
      roleKey={`D078|${role!.label}`}
      initialSelection={selection}
      roles={[]}
      guidanceContext={{ domainId: "D078", areaId: role!.areaId }}
    /></ThemeProvider>);
    const roleTitle = screen.getByRole("header", { name: new RegExp(`^${role!.label}$`, "i") });
    expect(StyleSheet.flatten(roleTitle.props.style)).toMatchObject({ fontSize: 26, lineHeight: 32 });
    const roleAreaLabel = projectD078Route(selection).visibleAreas.find((area) => area.areaId === role!.areaId)?.label ?? "area";
    const roleBackButton = screen.getByRole("button", { name: `Back to ${roleAreaLabel}` });
    expect(StyleSheet.flatten(roleBackButton.props.style)).toMatchObject({ alignSelf: "flex-start" });
    expect(screen.getByRole("button", { name: "Back to Social Sciences domain" })).toBeTruthy();
    const roleRouteContextButton = screen.getByRole("button", { name: /Show what carries into/ });
    expect(StyleSheet.flatten(roleRouteContextButton.props.style)).toMatchObject({ alignSelf: "flex-start" });
    const roleContext = screen.getByText("Available with the method you selected. This does not make the method a requirement of the role.");
    expect(StyleSheet.flatten(roleContext.props.style)).toMatchObject({ fontSize: 16, lineHeight: 24 });
    expect(screen.queryByText("This role is not in your selected route")).toBeNull();
    unmount();
  });

  it("returns from a role to the method picker with the complete prior role route available for Undo", () => {
    let selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const role = projectD078Route(selection).visibleRoles.find((entry) => entry.areaId === "D078:sociology-social-anthropology");
    expect(role).toBeTruthy();
    selection = selectD078Area(selection, role!.areaId);
    selection = selectD078Role(selection, role!.roleId);

    const router = { push: jest.fn(), replace: jest.fn(), back: jest.fn(), canGoBack: () => false };
    const routerModule = jest.requireMock("expo-router");
    const useRouterSpy = jest.spyOn(routerModule, "useRouter").mockReturnValue(router);
    const { unmount } = render(<ThemeProvider><D078RoleRoute
      areaId={role!.areaId}
      roleId={role!.roleId}
      roleName={role!.label}
      roleKey={`D078|${role!.label}`}
      initialSelection={selection}
      roles={[]}
      guidanceContext={{ domainId: "D078", areaId: role!.areaId }}
    /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: /Open learning plan tray with/ }));
    fireEvent.press(screen.getAllByRole("button", { name: "Show learning plan mid size" }).at(-1)!);
    fireEvent.press(screen.getByRole("button", { name: "Remove Interviews from your selected approaches" }));

    expect(router.replace).toHaveBeenCalledTimes(1);
    const destination = new URL(String(router.replace.mock.calls[0][0]), "http://localhost");
    expect(destination.pathname).toContain("/domain/D078");
    expect(destination.searchParams.has("d078_undo_selection")).toBe(true);
    const priorRoleSelection = JSON.parse(destination.searchParams.get("d078_undo_selection") ?? "{}");
    expect(priorRoleSelection).toMatchObject({
      methodIds: [INTERVIEWS],
      areaId: role!.areaId,
      roleId: role!.roleId,
    });

    unmount();
    router.replace.mockClear();
    const { unmount: unmountField } = render(<ThemeProvider><D078MethodAwareJourney
      domainKey="D078"
      initialSelection={d078PickerSelection(priorRoleSelection)}
      initialUndoSelection={priorRoleSelection}
      domainRoles={[{ name: role!.label, key: `D078|${role!.label}` } as never]}
      guidanceContext={{ domainId: "D078" }}
    /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Undo route change" }));
    expect(router.replace).toHaveBeenCalledTimes(1);
    const restoredRoleRoute = new URL(String(router.replace.mock.calls[0][0]), "http://localhost");
    expect(restoredRoleRoute.pathname).toContain("/role/");
    expect(restoredRoleRoute.searchParams.get("d078_role_id")).toBe(role!.roleId);
    expect(JSON.parse(restoredRoleRoute.searchParams.get("d078_selection") ?? "{}")).toMatchObject({
      methodIds: [INTERVIEWS],
      areaId: role!.areaId,
      roleId: role!.roleId,
    });
    unmountField();
    useRouterSpy.mockRestore();
  });

  it("shows and clears Undo when a reused field journey receives changed route query state", () => {
    const selected = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const role = projectD078Route(selected).visibleRoles.find((entry) => entry.areaId === "D078:sociology-social-anthropology");
    expect(role).toBeTruthy();
    const prior = selectD078Role(selectD078Area(selected, role!.areaId), role!.roleId);
    const props = {
      domainKey: "D078",
      initialSelection: INITIAL_D078_SELECTION,
      domainRoles: [{ name: role!.label, key: `D078|${role!.label}` } as never],
      guidanceContext: { domainId: "D078" },
    };
    const view = render(<ThemeProvider><D078MethodAwareJourney {...props} /></ThemeProvider>);
    expect(screen.queryByRole("button", { name: "Undo route change" })).toBeNull();

    view.rerender(<ThemeProvider><D078MethodAwareJourney {...props} initialUndoSelection={prior} /></ThemeProvider>);
    expect(screen.getByRole("button", { name: "Undo route change" })).toBeTruthy();

    view.rerender(<ThemeProvider><D078MethodAwareJourney {...props} /></ThemeProvider>);
    expect(screen.queryByRole("button", { name: "Undo route change" })).toBeNull();
  });

  it("rehydrates a saved route and removes translation when reduced motion is enabled", () => {
    const selection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    const restored = savedD078Selection({ learningPlanSnapshot: {
      dataVersion: "guided-experience-d078-v1",
      d078SelectionsByRoute: { [PROGRAMME_KEY]: selection },
    } }, "programme-1");
    const visibleAreas = projectD078Route(restored ?? INITIAL_D078_SELECTION).visibleAreas;
    expect(visibleAreas).toHaveLength(4);
    render(<ThemeProvider><JourneyHarness initial={restored ?? INITIAL_D078_SELECTION} /></ThemeProvider>);
    expect(screen.getByText("Areas for what you selected")).toBeTruthy();
    visibleAreas.forEach((area) => expect(screen.getByText(area.label)).toBeTruthy());
    const reducedMotionSelection = toggleD078Method(INITIAL_D078_SELECTION, INTERVIEWS);
    expect(projectD078Route(reducedMotionSelection).visibleAreas).toHaveLength(4);
    expect(d078MotionOffset(true, 8)).toBe(0);
    expect(d078MotionOffset(false, 8)).toBe(8);
  });

  it("normalizes the distinct provisioned-student and self-service guidance response shapes", () => {
    const studentPath = { learningPlanSnapshot: { marker: "student" } };
    const selfServicePath = { learningPlanSnapshot: { marker: "self-service" } };
    expect(guidancePathPayload({ path: studentPath })).toEqual(studentPath);
    expect(guidancePathPayload(real<GuidanceReportPath | null>({ path: selfServicePath }))).toEqual(selfServicePath);
    expect(guidancePathPayload(pending<GuidanceReportPath | null>())).toEqual({});
  });

  it("saves field-only and area/role D078 routes independently as a fresh archive version", () => {
    const originalSnapshot = {
      snapshotId: "d078-version-1",
      createdAt: "2026-10-19T10:00:00.000Z",
      d078SelectionsByRoute: {
        [PROGRAMME_KEY]: { methodIds: ["domain-item:d078-document-analysis"], combinationIds: [], componentMethodIds: {}, addedItemIds: [] },
        "other-programme::D078": { methodIds: ["domain-item:d078-document-analysis"], combinationIds: [], componentMethodIds: {}, addedItemIds: [] },
      },
    };
    const path = { learningPlanSnapshot: originalSnapshot, programme: { id: "programme-1", name: "Sociology" } };
    const stacks = {
      activeStackId: "d078-route-3",
      stacks: [
        { id: "d078-route-1", selection: { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, addedItemIds: [] } },
        { id: "d078-route-2", selection: { methodIds: [INTERVIEWS], combinationIds: [], componentMethodIds: {}, areaId: "D078:sociology-social-anthropology", roleId: "role:D078:3:sociologist", addedItemIds: ["area_enrichment_item:d078-soc-thematic-analysis"] } },
        { id: "d078-route-3", selection: { methodIds: ["domain-item:d078-spatial-social-analysis"], combinationIds: [], componentMethodIds: {}, areaId: "D078:computational-digital-social-science", addedItemIds: ["domain-item:d078-python"] } },
      ],
    };

    const next = buildD078SnapshotForSave(
      path,
      stacks.stacks[2].selection,
      "programme-1",
      "Sociology",
      stacks,
      "d078-version-2",
      "2026-10-20T10:00:00.000Z",
    );

    const savedSelections = next.d078SelectionsByRoute as Record<string, unknown>;
    expect(next.snapshotId).toBe("d078-version-2");
    expect(next.createdAt).toBe("2026-10-20T10:00:00.000Z");
    expect(next.d078RouteStackIds).toEqual(["d078-route-1", "d078-route-2", "d078-route-3"]);
    expect(next.d078ActiveStackId).toBe("d078-route-3");
    expect(savedSelections[PROGRAMME_KEY]).toMatchObject({ methodIds: [INTERVIEWS], addedItemIds: [] });
    expect((savedSelections[PROGRAMME_KEY] as Record<string, unknown>).areaId).toBeUndefined();
    expect(savedSelections[`${PROGRAMME_KEY}::d078-route-2`]).toMatchObject({ areaId: "D078:sociology-social-anthropology", roleId: "role:D078:3:sociologist", addedItemIds: ["area_enrichment_item:d078-soc-thematic-analysis"] });
    expect(savedSelections[`${PROGRAMME_KEY}::d078-route-3`]).toMatchObject({ areaId: "D078:computational-digital-social-science", addedItemIds: ["domain-item:d078-python"] });
    expect(savedSelections["other-programme::D078"]).toEqual(originalSnapshot.d078SelectionsByRoute["other-programme::D078"]);
    expect(originalSnapshot.createdAt).toBe("2026-10-19T10:00:00.000Z");
  });

  it("reopens only the currently supported D078 route and keeps field-only saves valid", () => {
    const requiredMethods = d078GraphDataForTests().combination_designs.find((design) => design.id === "combo:exploratory-sequential")!.required_method_ids;
    const selected = toggleD078Combination({ ...INITIAL_D078_SELECTION, methodIds: requiredMethods }, "combo:exploratory-sequential");
    const projection = projectD078Route(selected);
    const area = projection.visibleAreas[0];
    const role = projection.visibleRoles.find((entry) => entry.areaId === area.areaId);
    const supportedItem = [...projection.domainItemIds, ...projection.toolIds, ...(projection.areaItemIdsByArea[area?.areaId ?? ""] ?? [])][0];
    expect(area).toBeTruthy();
    expect(supportedItem).toBeTruthy();
    const selection = {
      ...selected,
      methodIds: [...selected.methodIds, "method:hidden-or-removed"],
      componentMethodIds: { "combo:exploratory-sequential": ["domain-item:d078-survey-method"] },
      areaId: area.areaId,
      roleId: role?.roleId,
      addedItemIds: [supportedItem, "item:removed-from-current-graph"],
    };
    const snapshot = { dataVersion: "guided-experience-d078-v1", d078SelectionsByRoute: { [PROGRAMME_KEY]: selection } };
    const restored = savedD078Selection({ learningPlanSnapshot: snapshot }, "programme-1");
    expect(restored?.methodIds).toHaveLength(0);
    expect(restored?.methodIds).not.toContain("method:hidden-or-removed");
    expect(restored?.combinationIds).toContain("combo:exploratory-sequential");
    expect(restored?.componentMethodIds["combo:exploratory-sequential"]).toBeUndefined();
    expect(restored?.areaId).toBe(area.areaId);
    expect(restored?.roleId).toBe(role?.roleId);
    expect(restored?.addedItemIds).toContain(supportedItem);
    expect(restored?.addedItemIds).not.toContain("item:removed-from-current-graph");

    const share = d078ShareInputFromSnapshot(snapshot, "programme-1");
    expect(share?.routeDetails).toContain(`Area: ${area.label}`);
    expect(share?.routeDetails.join(" ")).not.toContain("removed-from-current-graph");

    const fieldOnly = savedD078Selection({ learningPlanSnapshot: {
      dataVersion: "guided-experience-d078-v1",
      d078SelectionsByRoute: { [PROGRAMME_KEY]: { methodIds: [], combinationIds: [], componentMethodIds: {}, addedItemIds: [] } },
    } }, "programme-1");
    expect(fieldOnly).toMatchObject({ methodIds: [], combinationIds: [], areaId: undefined, roleId: undefined, addedItemIds: [] });
  });
});
