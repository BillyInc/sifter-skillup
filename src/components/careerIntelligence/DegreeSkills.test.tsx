import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { DegreeSkills } from "./DegreeSkills";
import { ThemeProvider } from "@/theme";
import type { ProgrammeCurriculumContract } from "@/types/career";
import { SOCIOLOGY_REVIEWED_THEME_BY_CODE } from "./programmeCurriculumThemes";

describe("DegreeSkills programme preview", () => {
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

    expect(screen.getByText(/fixed programme learning, not a menu of extra learning choices/i)).toBeTruthy();
    expect(screen.getByText("Research and evidence")).toBeTruthy();
    expect(screen.getByText(/You will move from forming a research question/)).toBeTruthy();
    expect(screen.queryByText(/Include in my focus/i)).toBeNull();
    expect(screen.queryByText("SOC 301")).toBeNull();
    expect(screen.queryByText("SSC 302")).toBeNull();
    fireEvent.press(screen.getByRole("button", { name: "See courses and outcomes" }));
    expect(screen.getByText("Prepare a feasible research proposal and report.")).toBeTruthy();
    expect(screen.getByText("Methods of Social Research and Statistics")).toBeTruthy();
    expect(screen.queryByText("SOC 301")).toBeNull();
    expect(screen.queryByText("SSC 302")).toBeNull();
    expect(screen.getByText("Curriculum source: printed pp. 334–335")).toBeTruthy();
    expect(screen.queryByText(/Original CCMAS source|Social-Sciences-CCMAS-FINAL/)).toBeNull();
    expect(screen.getAllByText("Course outcomes, in learner-friendly wording").length).toBeGreaterThan(1);
    expect(screen.getByText("Curriculum wording: Distinguish research methods.")).toBeTruthy();
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
    fireEvent.press(screen.getByRole("button", { name: "See all learning areas" }));

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
    fireEvent.press(screen.getByRole("button", { name: "See courses and outcomes" }));
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

    expect(screen.getByText("Materials that explain this part")).toBeTruthy();
    expect(screen.getByText("Open material")).toBeTruthy();
    expect(screen.getByText("Recommended reading")).toBeTruthy();
    expect(screen.getByText("Sociology: A Global Introduction (recommended reference)")).toBeTruthy();
    expect(screen.getByText(/Test Sociology Author · 2nd edition · 978-1-23456-789-0/)).toBeTruthy();
    expect(screen.getByText("Use this methodology chapter as a reference when comparing approaches to social research.")).toBeTruthy();
    expect(screen.getByText(/May require payment/)).toBeTruthy();
    expect(screen.getByText("NOUN courseware terms apply.")).toBeTruthy();
    expect(screen.queryByText(/Course-prescribed reading/)).toBeNull();
    fireEvent.press(screen.getByRole("link", { name: "Open material" }));
    expect(screen.getByText("openstax.org")).toBeTruthy();
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

    expect(screen.getByText("Production Systems in Pre-colonial Africa (AEHN, Chapter 3)")).toBeTruthy();
    expect(screen.getByText(/selected history of pre-colonial production systems/)).toBeTruthy();
    expect(screen.getByText("History of Conflicts in Nigeria (NOUN courseware)")).toBeTruthy();
    expect(screen.getByText(/NOUN Modules 1 and 4 include Nigerian historical examples/)).toBeTruthy();
    expect(screen.getByText("Follow NOUN courseware educational-use terms.")).toBeTruthy();
  });
});
