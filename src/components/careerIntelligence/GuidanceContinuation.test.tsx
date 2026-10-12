import React from "react";
import { render, screen } from "@testing-library/react-native";
import { ThemeProvider } from "@/theme";
import type { CareerContextItem } from "@/types/career";
import { GuidanceContinuation } from "./GuidanceContinuation";

function contextItem(
  contextLevel: CareerContextItem["contextLevel"],
  name: string,
  overrides: Partial<CareerContextItem> = {},
): CareerContextItem {
  return {
    contextLevel,
    contextKey: `${contextLevel}:test`,
    domainId: "D-test",
    itemType: "skill",
    itemKey: name.toLowerCase().replace(/\s+/g, "_"),
    name,
    plainMeaning: name,
    contextualUse: "Supports the selected learning path.",
    priority: "useful_later",
    priorityReason: "Source-backed path context.",
    prerequisites: [],
    relatedItems: [],
    sourceIds: ["source-test"],
    sourceReferences: [{ title: "Source", url: "https://example.org/source" }],
    sourceLocators: [],
    geographicScope: "global",
    evidenceLimitations: [],
    evidenceType: "source_supported_synthesis",
    sourceConfidence: "high",
    dataState: "source_backed",
    claimReviewState: "approved",
    claimEvidence: {
      claims: {
        item_identity: { source_references: ["source-test"], source_locators: [{ page: 1 }] },
        checkpoint_fit: { source_references: ["source-test"], source_locators: [{ page: 1 }] },
        plain_meaning: { source_references: ["source-test"], source_locators: [{ page: 1 }] },
        contextual_use: { source_references: ["source-test"], source_locators: [{ page: 1 }] },
        priority: { source_references: ["source-test"], source_locators: [{ page: 1 }] },
      },
    },
    linkState: "linked",
    linkUrl: "https://example.org/learn",
    linkTitle: "Learning reference",
    linkSourceReference: { title: "Learning reference", url: "https://example.org/learn" },
    linkAccessedAt: "2026-10-08",
    linkEvidence: { destination_checked: true },
    guidanceOwner: contextLevel,
    verifiedAt: "2026-10-03",
    ...overrides,
  };
}

describe("GuidanceContinuation", () => {
  it("shows only additive learning as the route narrows domain → subgroup → role", () => {
    render(
      <ThemeProvider>
        <GuidanceContinuation
          domainName="Social Sciences"
          subgroupName="Social Data Methods"
          roleName="Social Researcher"
          domainFoundation={[{ skill: "Research reasoning" }]}
          domainItems={[contextItem("domain", "Python") ]}
          subgroupItems={[
            contextItem("subgroup", "Python"),
            contextItem("subgroup", "Survey design"),
            contextItem("subgroup", "Review-only survey package", { guidanceOwner: "review_only" }),
          ]}
          roleItems={[
            contextItem("role", "Survey design"),
            contextItem("role", "Interview synthesis"),
          ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Shared foundation in Social Sciences")).toBeTruthy();
    expect(screen.getByText("This focused area adds capabilities in Social Data Methods")).toBeTruthy();
    expect(screen.getByText("This role applies the path: Social Researcher")).toBeTruthy();
    expect(screen.getAllByText(/Skill: Python/)).toHaveLength(1);
    expect(screen.getAllByText(/Skill: Survey design/)).toHaveLength(1);
    expect(screen.getByText(/Skill: Interview synthesis/)).toBeTruthy();
    expect(screen.queryByText(/Review-only survey package/)).toBeNull();
  });

  it("uses a direct domain → role path when there is no subgroup", () => {
    render(
      <ThemeProvider>
        <GuidanceContinuation
          domainName="Computational Science"
          roleName="Scientific Programmer"
          domainFoundation={[{ skill: "Numerical reasoning" }]}
          roleItems={[contextItem("role", "Model validation")]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Shared foundation in Computational Science")).toBeTruthy();
    expect(screen.getByText("This role applies the foundation: Scientific Programmer")).toBeTruthy();
    expect(screen.getByText(/no subgroup on this route/)).toBeTruthy();
  });

  it("shows the complete programme → domain → area → role route cumulatively", () => {
    render(
      <ThemeProvider>
        <GuidanceContinuation
          programmeName="Sociology"
          connection={{
            programmeId: "sociology",
            programmeName: "Sociology",
            relationship: "direct",
            explanation: "The programme provides checked evidence for this field.",
            curriculumAvailable: true,
            courseAnchors: [{ code: "SOC 301", title: "Methods of Social Research and Statistics", matchedAnchors: ["research methods"] }],
            transferableEvidence: ["Compare quantitative and qualitative evidence."],
          }}
          domainName="Social Sciences and Behavioural Research"
          subgroupName="Computational and Quantitative Social Research"
          roleName="Social Researcher"
          domainFoundation={[{ skill: "Research reasoning" }]}
          domainItems={[contextItem("domain", "Research ethics")]}
          subgroupItems={[contextItem("subgroup", "Data analysis") ]}
          roleItems={[contextItem("role", "Interview synthesis") ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Already covered in Sociology for this field")).toBeTruthy();
    expect(screen.getByText("Shared foundation in Social Sciences and Behavioural Research")).toBeTruthy();
    expect(screen.getByText("This focused area adds capabilities in Computational and Quantitative Social Research")).toBeTruthy();
    expect(screen.getByText("This role applies the path: Social Researcher")).toBeTruthy();
    expect(screen.getByText("Methods of Social Research and Statistics")).toBeTruthy();
    expect(screen.queryByText("SOC 301")).toBeNull();
  });

  it("separates inherited programme curriculum and outcome evidence from additions", () => {
    render(
      <ThemeProvider>
        <GuidanceContinuation
          programmeName="Sociology"
          connection={{
            programmeId: "sociology",
            programmeName: "Sociology",
            relationship: "direct",
            explanation: "The checked Sociology curriculum provides evidence for this field.",
            curriculumAvailable: true,
            courseAnchors: [{ code: "SOC 301", title: "Methods of Social Research and Statistics", matchedAnchors: ["research methods"] }],
            transferableEvidence: ["Compare qualitative and quantitative evidence."],
          }}
          domainName="Social Sciences"
          domainFoundation={[{ skill: "Research reasoning" }]}
          domainItems={[contextItem("domain", "Research ethics")]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("Already covered in Sociology for this field")).toBeTruthy();
    expect(screen.getByText("Relevant curriculum already covered")).toBeTruthy();
    expect(screen.getByText("Methods of Social Research and Statistics")).toBeTruthy();
    expect(screen.getByText("Relevant outcome evidence already covered")).toBeTruthy();
    expect(screen.getByText("Compare qualitative and quantitative evidence.")).toBeTruthy();
    expect(screen.getByText("Shared foundation in Social Sciences")).toBeTruthy();
    expect(screen.queryByText("Include in my focus")).toBeNull();
  });
});
