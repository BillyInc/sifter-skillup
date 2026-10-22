import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { StyleSheet, View } from "react-native";
import { DegreeSkills } from "./DegreeSkills";
import { ThemeProvider } from "@/theme";
import type { ProgrammeCurriculumContract } from "@/types/career";
import { SOCIOLOGY_REVIEWED_THEME_BY_CODE } from "./programmeCurriculumThemes";
import abilityLedger from "../../../data/career-mapping/_audit/sociology_theme_student_abilities_2026_10_22.json";
import sociologyCurriculumSource from "../../../data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json";

beforeEach(() => {
  jest.spyOn(global, "requestAnimationFrame").mockImplementation(() => 0);
});

afterEach(() => jest.restoreAllMocks());

function courseOutcome(outcomeId: string, courseCode: string, studentText: string) {
  return {
    outcomeId,
    courseCode,
    courseTitle: `Private source title for ${courseCode}`,
    displayGroup: "sociology_programme",
    outcomeIndex: 1,
    sourceText: studentText,
    studentText,
    sourceLocator: { page: 1 },
    dataState: "source_backed" as const,
  };
}

function treeText(node: unknown): string[] {
  if (typeof node === "string") return [node];
  if (Array.isArray(node)) return node.flatMap(treeText);
  if (!node || typeof node !== "object") return [];
  return treeText((node as { children?: unknown[] }).children ?? []);
}

function readingResource(id: string, targetName: string, url: string, sourceProvenance: Record<string, unknown>) {
  return {
    id,
    programmeId: "sociology",
    ownershipScope: "programme" as const,
    reviewStatus: "approved_guidance_v1" as const,
    resourceType: "programme_reading" as const,
    targetName,
    provider: "Reviewed publisher or courseware",
    region: "global" as const,
    accessType: "free" as const,
    url,
    sourceUrl: url,
    description: "A reviewed resource linked to this theme.",
    dataState: "source_backed" as const,
    sourceProvenance,
  };
}

function researchGuidance(itemKey: string, learningLabel: string, learningUrl: string) {
  return {
    themeKey: "research",
    itemKey,
    itemType: "knowledge" as const,
    title: learningLabel,
    plainMeaning: "A reviewed explanation.",
    everydayExample: "A short example.",
    contextualUse: `Stored rationale for ${learningLabel}.`,
    expectedOutput: "A short comparison.",
    curriculumAnchors: ["SOC 301"],
    claimEvidence: {},
    sources: [],
    learningLabel,
    learningUrl,
    learningResourceType: "open_course",
    learningSourceReference: { title: learningLabel },
    learningVerifiedOn: "2026-10-08",
    selectionState: "fixed_programme_guidance_not_selectable" as const,
    limitations: [],
  };
}

describe("DegreeSkills programme preview", () => {
  it("uses readable theme, outcome and section hierarchy at the documented minimum sizes", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "readable-outcome",
        courseCode: "SOC 301",
        courseTitle: "Methods of Social Research and Statistics",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Compare research methods.",
        studentText: "Compare quantitative and qualitative approaches to a research question.",
        sourceLocator: { page: 1 },
        dataState: "source_backed",
      }],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    const sectionHeading = screen.getByText("What you will study");
    expect(StyleSheet.flatten(sectionHeading.props.style)).toMatchObject({ fontSize: 20, lineHeight: 26 });
    const themeButton = screen.getByRole("button", { name: "Open Research and evidence" });
    const themeTitle = screen.getByText("Research and evidence");
    expect(StyleSheet.flatten(themeTitle.props.style)).toMatchObject({ fontSize: 16, lineHeight: 22 });
    let themeCard = themeTitle.parent;
    while (themeCard && !(themeCard.type === View && StyleSheet.flatten(themeCard.props.style).gap === 8 && StyleSheet.flatten(themeCard.props.style).padding === 12)) themeCard = themeCard.parent;
    expect(themeCard).toBeTruthy();
    let themeGrid = themeTitle.parent;
    while (themeGrid && !(themeGrid.type === View && StyleSheet.flatten(themeGrid.props.style).flexWrap === "wrap")) themeGrid = themeGrid.parent;
    expect(themeGrid).toBeTruthy();
    expect(StyleSheet.flatten(themeGrid!.props.style).gap).toBe(8);
    expect(screen.getByText(/1 ability · 0 readings/)).toBeTruthy();
    const narration = /You will move from forming a research question/;
    expect(screen.queryByText("Theme focus")).toBeNull();
    expect(screen.queryByText(narration)).toBeNull();
    fireEvent.press(themeButton);
    expect(screen.getByText("Reading")).toBeTruthy();
    expect(screen.getByText("You will be able to")).toBeTruthy();
    expect(screen.getByText(narration)).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByText(narration).props.style)).toMatchObject({ fontSize: 14, lineHeight: 20 });
    expect(StyleSheet.flatten(screen.getByText("Compare quantitative and qualitative approaches to a research question.").props.style)).toMatchObject({ fontSize: 14, lineHeight: 20 });
  });

  it("explains ungrouped programme courses without exposing review workflow language", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "ungrouped-outcome",
        courseCode: "SOC 999",
        courseTitle: "Special Topics in Sociology",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Discuss a selected sociological topic.",
        studentText: "Discuss a selected sociological topic using relevant social-science ideas.",
        sourceLocator: { page: 1 },
        dataState: "source_backed",
      }],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);

    expect(screen.getByText("Core programme learning")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open Core programme learning" }));
    expect(screen.getByText(/This learning is part of the official programme record/)).toBeTruthy();
    expect(screen.queryByText(/assigned to a reviewed theme/i)).toBeNull();
  });

  it("shows source-backed programme abilities in the preview when no course outcomes exist", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [],
      abilities: [{
        abilityId: "ability-1",
        displayTitle: "Use evidence",
        sourceText: "You will use evidence to explain a practical issue",
        studentText: "You will use evidence to explain a practical issue",
        sourceLocator: { page: 12 },
        dataState: "source_backed",
      }],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);

    const sectionHeading = screen.getByText("How you will use what you learn");
    expect(StyleSheet.flatten(sectionHeading.props.style)).toMatchObject({ fontSize: 20, lineHeight: 26 });
    expect(screen.getByText(/Across these themes, you do more than learn definitions/)).toBeTruthy();
  });

  it("shows a brief preview of source-backed programme abilities when no course outcomes exist", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [],
      abilities: [{
        abilityId: "ability-1",
        displayTitle: "Use evidence",
        sourceText: "You will use evidence to explain a practical issue",
        studentText: "You will use evidence to explain a practical issue",
        sourceLocator: { page: 12 },
        dataState: "source_backed",
      }],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} variant="teaser" /></ThemeProvider>);

    expect(screen.getByText("A quick look at what you will study")).toBeTruthy();
    expect(screen.getByText("You will use evidence to explain a practical issue.")).toBeTruthy();
    expect(screen.queryByText(/checked programme learning preview will appear here/i)).toBeNull();
  });

  it("groups multiple Sociology research courses into a student-friendly theme without making curriculum selectable", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [
        { outcomeId: "outcome-1", courseCode: "SOC 301", courseTitle: "Methods of Social Research and Statistics", displayGroup: "sociology_programme", outcomeIndex: 1, sourceText: "Distinguish research methods.", studentText: "Distinguish quantitative and qualitative research methods.", sourceLocator: { page: 334, sourceLocatorText: "Original CCMAS source: Sociology; SOC 301; Social-Sciences-CCMAS-FINAL-2023-A.pdf, printed pp. 334–335" }, dataState: "source_backed" },
        { outcomeId: "outcome-2", courseCode: "SSC 302", courseTitle: "Research Method I", displayGroup: "sociology_programme", outcomeIndex: 1, sourceText: "Discuss research procedures.", studentText: "Discuss procedures for conducting research.", sourceLocator: { page: 334 }, dataState: "source_backed" },
        { outcomeId: "outcome-3", courseCode: "SSC 401", courseTitle: "Research Method II", displayGroup: "supporting_social_sciences", outcomeIndex: 1, sourceText: "Collect and organize data.", studentText: "Collect and organize meaningful data.", sourceLocator: { page: 112 }, dataState: "source_backed" },
        { outcomeId: "outcome-4", courseCode: "SOC 408", courseTitle: "Research Project", displayGroup: "sociology_programme", outcomeIndex: 1, sourceText: "Prepare a research proposal.", studentText: "Prepare a feasible research proposal and report.", sourceLocator: { page: 339 }, dataState: "source_backed" },
      ],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);

    expect(screen.getByText("Research and evidence")).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));
    expect(screen.getByText(/You will move from forming a research question/)).toBeTruthy();
    expect(screen.queryByText(/Include in my focus/i)).toBeNull();
    expect(screen.queryByText("SOC 301")).toBeNull();
    expect(screen.queryByText("SSC 302")).toBeNull();
    expect(screen.getByRole("button", { name: "Close Research and evidence" })).toBeTruthy();
    expect(screen.getByText("You will be able to")).toBeTruthy();
    expect(screen.queryByText("Methods of Social Research and Statistics")).toBeNull();
    expect(screen.queryByText("Research Method I")).toBeNull();
    expect(screen.queryByText("Research Method II")).toBeNull();
    expect(screen.queryByText("Research Project")).toBeNull();
    expect(screen.queryByText("SOC 301")).toBeNull();
    expect(screen.queryByText("SSC 302")).toBeNull();
    expect(screen.queryByText(/Original CCMAS source|Social-Sciences-CCMAS-FINAL/)).toBeNull();
    expect(screen.queryByText("Curriculum wording: Distinguish research methods.")).toBeNull();
    expect(screen.queryByText(/View original course outline|Original curriculum outcome wording/)).toBeNull();
  });

  it("gives every mapped Sociology theme a distinct student-facing outcome synthesis", () => {
    const outcomes = Object.entries(SOCIOLOGY_REVIEWED_THEME_BY_CODE).map(([courseCode], index) => ({
      outcomeId: `theme-outcome-${index}`,
      courseCode,
      courseTitle: `Course ${courseCode}`,
      displayGroup: "sociology_programme",
      outcomeIndex: 1,
      sourceText: "Explain a source-backed course idea.",
      studentText: "Explain a source-backed course idea.",
      sourceLocator: { page: 1 },
      dataState: "source_backed" as const,
    }));
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes,
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    expect(screen.getByRole("button", { name: "Open Entrepreneurship and venture creation" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Open People, groups and society" })).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "See all 14 learning areas" }));

    [
      "Communication and academic writing",
      "Nigerian peoples and culture",
      "Philosophy and reasoning",
      "Peace, conflict and security",
      "Entrepreneurship and venture creation",
      "People, groups and society",
      "Ideas and foundations",
      "Research and evidence",
      "Technology and information",
      "African and Nigerian societies",
      "Social change and development",
      "Inequality, gender and social problems",
      "Politics and organisations",
      "Social work and practical change",
    ].forEach((title) => expect(screen.getByText(title)).toBeTruthy());
    ["African and Nigerian societies", "Research and evidence", "Technology and information"].forEach((title) => {
      fireEvent.press(screen.getByRole("button", { name: `Open ${title}` }));
    });
    expect(screen.getByText(/Nigerian and other African societies/)).toBeTruthy();
    expect(screen.getByText(/quantitative approaches, which work with numbers/)).toBeTruthy();
    expect(screen.getByText(/general computing skills/)).toBeTruthy();
    expect(screen.queryByText(/In this theme, you will practise/)).toBeNull();
  });

  it("shows source-backed theme explanations and optional learning links as fixed programme guidance", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "outcome-1",
        courseCode: "SOC 301",
        courseTitle: "Methods of Social Research and Statistics",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Compare quantitative and qualitative methods.",
        studentText: "Compare number-based and detailed account-based research.",
        sourceLocator: { page: 334 },
        dataState: "source_backed",
      }],
      abilities: [],
      themeGuidance: [{
        themeKey: "research",
        itemKey: "evidence-types",
        displayOrder: 10,
        itemType: "knowledge",
        title: "Quantitative and qualitative evidence",
        plainMeaning: "Quantitative evidence is information shown as numbers, such as how many students use the library. Qualitative evidence is people's words and explanations, such as why they go or stay away. Each shows a different part of the picture.",
        everydayExample: "A survey can show how many students use the library after class. Interviews can help explain why some stay and others leave.",
        contextualUse: "Your Sociology programme teaches students to compare these approaches and their limits.",
        expectedOutput: "Write one short comparison and note one limitation of each approach.",
        curriculumAnchors: ["SOC 301", "SSC 302"],
        claimEvidence: { claims: { item_identity: ["source:locator"] } },
        sources: [{
          id: "source",
          title: "NUC Social Sciences CCMAS 2023",
          publisher: "National Universities Commission",
          url: "https://www.nuc.edu.ng/ccmas/",
          jurisdiction: "Nigeria",
          locators: { locator: "Sociology programme learning outcomes, printed p. 334" },
        }],
        learningLabel: "Open optional research-methods lesson",
        learningUrl: "https://www.open.edu/openlearn/society-politics-law/sociology/reading-evidence/content-section-0?intro=1",
        learningResourceType: "open_course",
        learningSourceReference: { title: "OpenLearn: Reading evidence" },
        learningLevel: "Introductory",
        learningDuration: "3 hours",
        learningAccess: "Free access",
        learningVerifiedOn: "2026-10-08",
        selectionState: "fixed_programme_guidance_not_selectable",
        limitations: ["Optional support, not a curriculum requirement."],
      }],
      themeRelationships: [{
        themeKey: "research",
        relationshipKey: "research_question_guides_method_choice",
        fromItemType: "concept",
        fromItemKey: "research_question",
        fromTitle: "Research question",
        toItemType: "method",
        toItemKey: "social_research_method_selection",
        toTitle: "Choose a research method for a question",
        relationshipType: "supports",
        learnerExplanation: "Choose a method that can provide the kind of evidence needed to answer the question, then compare what the method can and cannot show.",
        evidence: ["curriculum:research_methods"],
        sources: [],
        learningLabel: "See how a research question guides the choice of method",
        learningUrl: "https://learn.example.org/research-methods",
        learningResourceType: "learning_article",
        learningSourceReference: { title: "Research methods" },
        learningVerifiedOn: "2026-10-08",
        selectionState: "fixed_programme_guidance_not_selectable",
        limitations: ["This does not establish a fixed order."],
      }],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);

    expect(screen.queryByText("Quantitative and qualitative evidence")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));
    fireEvent.press(screen.getByRole("button", { name: "Explore the ideas and connections" }));
    expect(screen.getByText("Understand the ideas in this theme")).toBeTruthy();
    expect(screen.getByText(/Quantitative evidence is information shown as numbers/)).toBeTruthy();
    expect(screen.getByText(/Your Sociology programme teaches students/)).toBeTruthy();
    expect(screen.getByText(/Optional support, not a curriculum requirement/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open optional research-methods lesson" })).toBeTruthy();
    expect(screen.getByText("How these ideas connect")).toBeTruthy();
    expect(screen.getByText(/Choose a method that can provide the kind of evidence needed/)).toBeTruthy();
    expect(screen.getByRole("link", { name: "See how a research question guides the choice of method" })).toBeTruthy();
    expect(screen.getByRole("link", { name: /NUC Social Sciences CCMAS 2023/ })).toBeTruthy();
    expect(screen.queryByText(/Select this item|Include in my focus|I know this/)).toBeNull();
  });

  it("shows only approved programme readings explicitly attached to a theme", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "outcome-1",
        courseCode: "SOC 301",
        courseTitle: "Methods of Social Research and Statistics",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Explain research methods.",
        studentText: "Explain research methods.",
        sourceLocator: { page: 334 },
        dataState: "source_backed",
      }],
      abilities: [],
    };
    const resources = [{
      id: "programme-reading-1",
      programmeId: "sociology",
      ownershipScope: "programme" as const,
      reviewStatus: "approved_guidance_v1" as const,
      resourceType: "programme_reading" as const,
      targetName: "Sociology: A Global Introduction (recommended reference)",
      provider: "Publisher / library access",
      region: "global" as const,
      accessType: "paid" as const,
      url: "https://example.org/sociology-book",
      sourceUrl: "https://example.org/reading-list",
      description: "A recommended reference for introductory sociological themes; access may depend on a library or purchase.",
      dataState: "source_backed" as const,
      sourceProvenance: {
        theme_keys: ["research", "ideas"],
        theme_descriptions: { research: "Use this methodology chapter as a reference when comparing approaches to social research." },
        theme_urls: { research: "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods" },
        reading_scope: "recommended_reference",
        access_terms_note: "NOUN courseware terms apply.",
        authors: "Test Sociology Author",
        edition: "2nd edition",
        isbn: "978-1-23456-789-0",
      },
    }];

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} resources={resources} /></ThemeProvider>);

    expect(screen.queryByText("Sociology: A Global Introduction (recommended reference)")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));
    expect(screen.getByText("Recommended reading")).toBeTruthy();
    expect(screen.getByText("Sociology: A Global Introduction (recommended reference)")).toBeTruthy();
    fireEvent.press(screen.getAllByRole("button", { name: "Why included?" })[0]);
    expect(screen.getByText("Use this methodology chapter as a reference when comparing approaches to social research.")).toBeTruthy();
    expect(screen.queryByText(/Course-prescribed reading/)).toBeNull();
    const resourceAction = screen.getByRole("link", { name: "Open" });
    expect(StyleSheet.flatten(resourceAction.props.style).minHeight).toBeGreaterThanOrEqual(44);
    fireEvent.press(resourceAction);
    expect(screen.getByText("openstax.org")).toBeTruthy();
  });

  it("shows the Haralambos publisher resource on its approved themes when the seed is present", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "theory-outcome",
        courseCode: "SOC 201",
        courseTitle: "Classical Sociological Theory",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Compare sociological theories.",
        studentText: "Compare sociological theories.",
        sourceLocator: { page: 1 },
        dataState: "source_backed",
      }],
      abilities: [],
    };
    const resources = [
      {
        id: "haralambos-holborn",
        programmeId: "sociology",
        ownershipScope: "programme" as const,
        reviewStatus: "approved_guidance_v1" as const,
        resourceType: "programme_reading" as const,
        targetName: "Sociology: Themes and Perspectives (8th edition)",
        provider: "Collins",
        region: "global" as const,
        accessType: "paid" as const,
        url: "https://collins.co.uk/products/9780007498826",
        sourceUrl: "https://collins.co.uk/products/9780007498826",
        description: "Publisher-verified Sociology reference; paid or library access.",
        dataState: "source_backed" as const,
        sourceProvenance: { theme_keys: ["ideas"], reading_scope: "recommended_reference" },
      },
      readingResource("openstax-theory", "OpenStax theoretical perspectives", "https://example.org/openstax", {
        theme_keys: "[\"ideas\"]",
        theme_urls: { IDEAS: "https://openstax.org/books/introduction-sociology-3e/pages/1-3-theoretical-perspectives-in-sociology" },
        theme_descriptions: { ideas: "OpenStax section 1.3 introduces theoretical perspectives." },
        reading_scope: "free_foundation_reference",
      }),
    ];

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} resources={resources} /></ThemeProvider>);

    expect(screen.getByRole("button", { name: "Open Ideas and foundations" })).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open Ideas and foundations" }));
    expect(screen.getAllByText("Sociology: Themes and Perspectives (8th edition)")).toHaveLength(2);
    expect(screen.getByText("OpenStax theoretical perspectives")).toBeTruthy();
    expect(screen.getAllByRole("link", { name: "Open" })).toHaveLength(2);
    fireEvent.press(screen.getAllByRole("link", { name: "Open" })[1]);
    expect(screen.getByText("openstax.org")).toBeTruthy();
  });

  it("shows Giddens and Haralambos as optional main Sociology readings after the overview", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [courseOutcome("soc-overview", "SOC 101", "Explain foundational sociological ideas.")],
      abilities: [],
    };
    const resources = [
      readingResource("giddens-sociology", "Sociology", "https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2", {
        theme_keys: ["ideas"],
        theme_urls: { ideas: "https://www.wiley-vch.de/en/areas-interest/humanities-social-sciences/sociology-12so/general-sociology-12so0/sociology-978-1-5095-3922-2" },
        theme_descriptions: { ideas: "The 9th-edition contents identify chapter 3 as Theories and Perspectives." },
        theme_rationales: { ideas: "Wiley identifies the stored ninth edition and chapter 3, Theories and Perspectives." },
        reading_scope: "recommended_reference",
      }),
      readingResource("haralambos-themes", "Sociology: Themes and Perspectives (8th edition)", "https://publisher.example/haralambos", { theme_keys: ["ideas"] }),
    ];

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} resources={resources} /></ThemeProvider>);

    expect(screen.getByRole("header", { name: "Main Sociology books" })).toBeTruthy();
    expect(screen.getByText("Sociology — Anthony Giddens and Philip W. Sutton")).toBeTruthy();
    expect(screen.getByText("Sociology: Themes and Perspectives (8th edition)")).toBeTruthy();
    expect(screen.getByText("Theme: Ideas and foundations")).toBeTruthy();
    expect(screen.getAllByText(/optional reading, not a programme requirement/)).toHaveLength(2);
    expect(screen.getAllByRole("link", { name: "Open publisher page" })).toHaveLength(2);
    fireEvent.press(screen.getByRole("button", { name: "Open Ideas and foundations" }));
    expect(screen.getByText("Sociology")).toBeTruthy();
    fireEvent.press(screen.getAllByRole("button", { name: "Why included?" })[0]);
    expect(screen.getByText("Wiley identifies the stored ninth edition and chapter 3, Theories and Perspectives.")).toBeTruthy();
  });

  it("does not repeat programme abilities below themes when course outcomes are available", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "research-outcome",
        courseCode: "SOC 301",
        courseTitle: "Methods of Social Research and Statistics",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Evaluate research evidence.",
        studentText: "Evaluate research evidence and explain its limits.",
        sourceLocator: { page: 1 },
        dataState: "source_backed",
      }],
      abilities: [{
        abilityId: "research-ability",
        displayTitle: "Evaluate research evidence",
        sourceText: "Evaluate research evidence and explain its limits.",
        studentText: "Evaluate research evidence and explain its limits.",
        sourceLocator: { page: 12 },
        dataState: "source_backed",
      }],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);

    expect(screen.queryByText("How you will use what you learn")).toBeNull();
    expect(screen.queryByText(/Across these themes, you do more than learn definitions/)).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));
    expect(screen.getByText("Evaluate research evidence and explain its limits.")).toBeTruthy();
  });

  it("shows Africa-wide and Nigerian context resources under their matching Sociology themes", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [
        {
          outcomeId: "outcome-africa",
          courseCode: "SOC 103",
          courseTitle: "Introduction to African Societies",
          displayGroup: "sociology_programme",
          outcomeIndex: 1,
          sourceText: "Describe African societies.",
          studentText: "Describe African societies.",
          sourceLocator: { page: 18 },
          dataState: "source_backed",
        },
        {
          outcomeId: "outcome-peace",
          courseCode: "GST 312",
          courseTitle: "Peace and Conflict Resolution",
          displayGroup: "shared_university",
          outcomeIndex: 1,
          sourceText: "Explain peace and conflict resolution.",
          studentText: "Explain peace and conflict resolution.",
          sourceLocator: { page: 42 },
          dataState: "source_backed",
        },
      ],
      abilities: [],
    };
    const resources = [
      {
        id: "aehn-production-systems",
        programmeId: "sociology",
        ownershipScope: "programme" as const,
        reviewStatus: "approved_guidance_v1" as const,
        resourceType: "programme_reading" as const,
        targetName: "Production Systems in Pre-colonial Africa (AEHN, Chapter 3)",
        provider: "African Economic History Network",
        region: "global" as const,
        accessType: "free" as const,
        url: "https://www.aehnetwork.org/textbook/production-systems-in-pre-colonial-africa/",
        sourceUrl: "https://www.aehnetwork.org/textbook/production-systems-in-pre-colonial-africa/",
        description: "A free chapter about selected African historical examples.",
        dataState: "source_backed" as const,
        sourceProvenance: {
          theme_keys: ["african_societies"],
          theme_descriptions: { african_societies: "A selected history of pre-colonial production systems; not a complete survey of African societies." },
          theme_urls: { african_societies: "https://www.aehnetwork.org/textbook/production-systems-in-pre-colonial-africa/" },
          reading_scope: "free_foundation_reference",
        },
      },
      {
        id: "noun-nigerian-conflicts",
        programmeId: "sociology",
        ownershipScope: "programme" as const,
        reviewStatus: "approved_guidance_v1" as const,
        resourceType: "programme_reading" as const,
        targetName: "History of Conflicts in Nigeria (NOUN courseware)",
        provider: "National Open University of Nigeria",
        region: "nigeria" as const,
        accessType: "free" as const,
        url: "https://nou.edu.ng/coursewarecontent/PCR331%20HISTORY%20OF%20CONFLICTS%20IN%20NIGERIA.pdf",
        sourceUrl: "https://nou.edu.ng/coursewarecontent/PCR331%20HISTORY%20OF%20CONFLICTS%20IN%20NIGERIA.pdf",
        description: "Optional Nigerian courseware on conflict and peace history.",
        dataState: "source_backed" as const,
        sourceProvenance: {
          theme_keys: ["shared_peace_conflict"],
          theme_descriptions: { shared_peace_conflict: "NOUN Modules 1 and 4 include Nigerian historical examples; this is not a current conflict assessment." },
          theme_urls: { shared_peace_conflict: "https://nou.edu.ng/coursewarecontent/PCR331%20HISTORY%20OF%20CONFLICTS%20IN%20NIGERIA.pdf" },
          reading_scope: "nigerian_courseware_reference",
          access_terms_note: "Follow NOUN courseware educational-use terms.",
        },
      },
    ];

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} resources={resources} /></ThemeProvider>);

    fireEvent.press(screen.getByRole("button", { name: "Open African and Nigerian societies" }));
    fireEvent.press(screen.getByRole("button", { name: "Open Peace, conflict and security" }));
    expect(screen.getByText("Production Systems in Pre-colonial Africa (AEHN, Chapter 3)")).toBeTruthy();
    expect(screen.getByText("History of Conflicts in Nigeria (NOUN courseware)")).toBeTruthy();
    fireEvent.press(screen.getAllByRole("button", { name: "Why included?" })[1]);
    expect(screen.getByText(/selected history of pre-colonial production systems/)).toBeTruthy();
  });

  it("never exposes raw course-outline wording in the student theme view", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [{
        outcomeId: "course-outcome",
        courseCode: "SOC 301",
        courseTitle: "Methods of Social Research and Statistics",
        displayGroup: "sociology_programme",
        outcomeIndex: 1,
        sourceText: "Distinguish methods.",
        studentText: "Explain when numerical and interview evidence answer different questions.",
        sourceLocator: { courseSummary: "RAW CCMAS OUTLINE: sample surveys, data processing and statistical tests." },
        dataState: "source_backed",
      }],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));
    expect(screen.getByText("Explain when numerical and interview evidence answer different questions.")).toBeTruthy();
    expect(screen.queryByText("RAW CCMAS OUTLINE: sample surveys, data processing and statistical tests.")).toBeNull();

    expect(screen.queryByText(/View original course outline|Original curriculum outcome wording/)).toBeNull();
  });

  it("keeps the People abilities inside one theme card and leaves course identifiers in the source only", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [
        courseOutcome("SOC 102:1", "SOC 102", "You will learn to explain the historical and methodological perspectives of Social Anthropology."),
        courseOutcome("SOC 104:1", "SOC 104", "You will learn to discuss the biological foundations of human behaviour."),
      ],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open People, groups and society" }));

    expect(screen.getByText("You will be able to")).toBeTruthy();
    expect(screen.getByText("You will learn to explain the historical and methodological perspectives of Social Anthropology.")).toBeTruthy();
    expect(screen.getByText("You will learn to discuss the biological foundations of human behaviour.")).toBeTruthy();
    expect(screen.queryByText(/SOC 102|SOC 104|Private source title/)).toBeNull();
    expect(screen.queryByRole("button", { name: /course outcomes for/i })).toBeNull();
    const abilityLine = screen.getByText("You will learn to explain the historical and methodological perspectives of Social Anthropology.").parent;
    expect(StyleSheet.flatten(abilityLine?.props.style).borderWidth).toBeUndefined();
  });

  it("uses the narrow reading-first order and the wide side-by-side layout at 560px", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [courseOutcome("SOC 301:1", "SOC 301", "You will learn to distinguish quantitative and qualitative research methods.")],
      abilities: [],
    };

    const narrow = render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    const narrowOpen = screen.getByRole("button", { name: "Open Research and evidence" });
    const narrowCard = narrowOpen.parent;
    fireEvent(narrowCard!, "layout", { nativeEvent: { layout: { width: 420, height: 240, x: 0, y: 0 } } });
    fireEvent.press(narrowOpen);
    const narrowText = treeText(narrow.toJSON());
    expect(narrowText.indexOf("Reading")).toBeGreaterThanOrEqual(0);
    expect(narrowText.indexOf("Reading")).toBeLessThan(narrowText.indexOf("You will be able to"));
    narrow.unmount();

    const wide = render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    const wideOpen = screen.getByRole("button", { name: "Open Research and evidence" });
    fireEvent(wideOpen.parent!, "layout", { nativeEvent: { layout: { width: 720, height: 240, x: 0, y: 0 } } });
    fireEvent.press(wideOpen);
    const abilityHeading = screen.getByText("You will be able to");
    let wideRow = abilityHeading.parent;
    while (wideRow && StyleSheet.flatten(wideRow.props.style).flexDirection !== "row") wideRow = wideRow.parent;
    expect(wideRow).toBeTruthy();
  });

  it("falls back to distinct source sentences when the ledger is incomplete and groups repeated Sociology wording once", () => {
    const repeated = "You will learn to discuss the founding fathers and the emergence of sociology as a discipline.";
    const other = "You will learn to define key concepts in sociological discourse.";
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [
        courseOutcome("SOC 101:2", "SOC 101", repeated),
        courseOutcome("SOC 101:8", "SOC 101", repeated),
        courseOutcome("SOC 105:2", "SOC 105", repeated),
        courseOutcome("SOC 101:6", "SOC 101", other),
      ],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open Ideas and foundations" }));
    expect(screen.getAllByText(repeated)).toHaveLength(1);
    expect(screen.getByText(other)).toBeTruthy();
    expect(screen.queryByText(/SOC 101|SOC 105|Private source title/)).toBeNull();
  });

  it("shows four ability lines first and expands the rest in the same list", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [
        courseOutcome("SOC 301:1", "SOC 301", "You will learn to identify research strategies."),
        courseOutcome("SOC 301:2", "SOC 301", "You will learn to describe research methods."),
        courseOutcome("SOC 301:3", "SOC 301", "You will learn to distinguish quantitative and qualitative methods."),
        courseOutcome("SOC 301:4", "SOC 301", "You will learn to explain method strengths and weaknesses."),
        courseOutcome("SOC 301:5", "SOC 301", "You will learn to choose methods for a question about people or society."),
      ],
      abilities: [],
    };

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} /></ThemeProvider>);
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));
    expect(screen.getByText("You will learn to identify research strategies.")).toBeTruthy();
    expect(screen.getByText("You will learn to explain method strengths and weaknesses.")).toBeTruthy();
    expect(screen.queryByText("You will learn to choose methods for a question about people or society.")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "See the rest of what you will be able to do" }));
    expect(screen.getByText("You will learn to choose methods for a question about people or society.")).toBeTruthy();
  });

  it("shows four Research readings and three guidance links in one band, parses string keys, and keeps unthemed rows off-card", () => {
    const curriculumContract: ProgrammeCurriculumContract = {
      status: "available",
      outcomes: [courseOutcome("SOC 301:1", "SOC 301", "You will learn to distinguish quantitative and qualitative research methods.")],
      abilities: [],
      themeGuidance: [
        researchGuidance("evidence-types", "Research evidence types", "https://learn.example.org/evidence"),
        researchGuidance("method-choice", "Choosing a research method", "https://learn.example.org/method-choice"),
        researchGuidance("research-ethics", "Research ethics", "https://learn.example.org/research-ethics"),
      ],
      themeRelationships: [{
        themeKey: "RESEARCH",
        relationshipKey: "question-guides-method",
        fromItemType: "concept",
        fromItemKey: "question",
        fromTitle: "Research question",
        toItemType: "method",
        toItemKey: "method-choice",
        toTitle: "Method choice",
        relationshipType: "supports",
        learnerExplanation: "A method should fit the question.",
        evidence: [],
        sources: [],
        learningLabel: "Research question and method",
        learningUrl: "https://learn.example.org/question-and-method",
        learningResourceType: "learning_article",
        learningSourceReference: { title: "Research question and method" },
        learningVerifiedOn: "2026-10-08",
        selectionState: "fixed_programme_guidance_not_selectable",
        limitations: [],
      }],
    };
    const resources = [
      readingResource("openstax-methods", "OpenStax research methods", "https://example.org/book", {
        theme_keys: "[\"RESEARCH\"]",
        theme_urls: { research: "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods" },
        theme_descriptions: { research: "The OpenStax research-methods section." },
        theme_rationales: { research: "The stored rationale connects this section to research methods." },
        reading_scope: "free_foundation_reference",
      }),
      readingResource("openstax-methods-duplicate", "Duplicate OpenStax research methods", "https://example.org/book", {
        theme_keys: ["research"],
        theme_urls: { RESEARCH: "https://openstax.org/books/introduction-sociology-3e/pages/2-2-research-methods" },
        reading_scope: "free_foundation_reference",
      }),
      readingResource("haralambos-methods", "Haralambos methodology reference", "https://collins.co.uk/book", {
        theme_keys: ["research"],
        reading_scope: "recommended_reference",
      }),
      readingResource("noun-methods", "NOUN research methodology", "https://nou.edu.ng/methods.pdf", {
        theme_keys: ["research"],
        reading_scope: "nigerian_courseware_reference",
      }),
      readingResource("noun-statistics", "NOUN social-science statistics", "https://nou.edu.ng/statistics.pdf", {
        theme_descriptions: { Research: "NOUN statistics support for research." },
        reading_scope: "nigerian_courseware_reference",
      }),
      readingResource("nuc-hub", "NUC CCMAS: Sociology", "https://nuc.edu.ng/ccmas", { theme_keys: [] }),
      readingResource("giddens-volume", "Giddens and Sutton Sociology volume", "https://example.org/giddens", { theme_keys: ["ideas"] }),
    ];

    render(<ThemeProvider><DegreeSkills curriculumContract={curriculumContract} resources={resources} /></ThemeProvider>);
    expect(screen.getByText(/1 ability · 8 readings/)).toBeTruthy();
    fireEvent.press(screen.getByRole("button", { name: "Open Research and evidence" }));

    expect(screen.getByText("OpenStax research methods")).toBeTruthy();
    expect(screen.queryByText("Duplicate OpenStax research methods")).toBeNull();
    expect(screen.getByText("Haralambos methodology reference")).toBeTruthy();
    expect(screen.getByText("NOUN research methodology")).toBeTruthy();
    expect(screen.getByText("NOUN social-science statistics")).toBeTruthy();
    expect(screen.getAllByText("Open course")).toHaveLength(3);
    expect(screen.getByText("Learning resource")).toBeTruthy();
    expect(screen.queryByText("NUC CCMAS: Sociology")).toBeNull();
    expect(screen.queryByText("Giddens and Sutton Sociology volume")).toBeNull();

    fireEvent.press(screen.getAllByRole("button", { name: "Why included?" })[0]);
    expect(screen.getByText("The stored rationale connects this section to research methods.")).toBeTruthy();
    fireEvent.press(screen.getAllByRole("link", { name: "Open" })[0]);
    expect(screen.getByText("openstax.org")).toBeTruthy();
  });

  it("maps all 236 source outcomes exactly once to at most eight source-worded lines per theme", () => {
    const sourceRows = sociologyCurriculumSource.curriculumOutcomes.rows.filter((row) => row.dataState === "source_backed");
    const allIds = abilityLedger.lines.flatMap((line) => line.outcomeIds);
    expect(abilityLedger.sourceCount).toBe(236);
    expect(abilityLedger.lineCount).toBe(35);
    expect([...allIds].sort()).toEqual(sourceRows.map((row) => row.outcomeId).sort());

    const perTheme = new Map<string, number>();
    abilityLedger.lines.forEach((line) => {
      perTheme.set(line.themeKey, (perTheme.get(line.themeKey) ?? 0) + 1);
      line.outcomeIds.forEach((outcomeId) => {
        const source = sourceRows.find((row) => row.outcomeId === outcomeId)!;
        const courseCode = source.sourceLocator.courseCode;
        expect(SOCIOLOGY_REVIEWED_THEME_BY_CODE[courseCode]).toBe(line.themeKey);
        const sourceWords = new Set(line.outcomeIds.flatMap((id) => {
          const row = sourceRows.find((item) => item.outcomeId === id)!;
          return row.studentText.toLocaleLowerCase().match(/[a-z0-9]+/g) ?? [];
        }));
        expect(line.studentLine.toLocaleLowerCase().match(/[a-z0-9]+/g)?.every((word) => sourceWords.has(word))).toBe(true);
      });
    });
    expect(perTheme.size).toBe(14);
    expect([...perTheme.values()].every((count) => count <= 8)).toBe(true);
    expect(perTheme.get("ideas")).toBe(4);
    expect(perTheme.get("people")).toBe(5);
    expect(perTheme.get("research")).toBe(5);

    const duplicateGroups = new Map<string, string[]>();
    sourceRows.forEach((row) => {
      const theme = SOCIOLOGY_REVIEWED_THEME_BY_CODE[row.sourceLocator.courseCode];
      const key = `${theme}:${row.studentText.toLocaleLowerCase()}`;
      duplicateGroups.set(key, [...(duplicateGroups.get(key) ?? []), row.outcomeId]);
    });
    duplicateGroups.forEach((ids) => {
      if (ids.length < 2) return;
      const containingLines = abilityLedger.lines.filter((line) => line.outcomeIds.some((id) => ids.includes(id)));
      expect(containingLines).toHaveLength(1);
    });
  });
});
