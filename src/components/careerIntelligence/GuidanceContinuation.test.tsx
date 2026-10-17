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
  it("shows the route handoff and keeps optional edges outside the compulsory path", () => {
    render(
      <ThemeProvider>
        <GuidanceContinuation
          domainName="Social Sciences"
          subgroupName="Computational and Digital Social Science"
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

    expect(screen.getByText("Compulsory domain foundations")).toBeTruthy();
    expect(screen.getByText("Compulsory additions for Computational and Digital Social Science")).toBeTruthy();
    expect(screen.getByText("Compulsory additions for Social Researcher")).toBeTruthy();
    expect(screen.getAllByText("Optional useful edges").length).toBeGreaterThan(0);
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

    expect(screen.getByText("Compulsory domain foundations")).toBeTruthy();
    expect(screen.getByText("Compulsory additions for Scientific Programmer")).toBeTruthy();
    expect(screen.getByText(/This role connects directly to a domain that has no area layer\. The selected route therefore moves from the domain to the role without implying area-specific learning\./)).toBeTruthy();
  });

  it("does not describe a mapped D078 role as a direct domain-only route", () => {
    render(
      <ThemeProvider>
        <GuidanceContinuation
          domainName="Social Sciences and Behavioural Research"
          domainId="D078"
          domainHasAreas
          roleName="Social Researcher"
          roleItems={[contextItem("role", "Interview synthesis")]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText(/This role is supported through one or more areas in this domain/)).toBeTruthy();
    expect(screen.queryByText(/no area-specific learning is implied/)).toBeNull();
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
            transferableLearningNarrative: "Your Sociology studies already introduce you to analysing social structures and the dynamics of society. These are relevant starting points for Social Sciences and Behavioural Research, not the whole set of capabilities used across the field. The domain learning path shows what to build beyond that programme learning.",
            curriculumContextHeading: "What your Sociology programme covers",
            domainAddsHeading: "What Social Sciences and Behavioural Research adds",
            domainAddsExplanation: "Beyond your programme, build the field-wide foundations, then explore optional useful edges and focused route additions.",
            curriculumAvailable: true,
            courseAnchors: [{ code: "SOC 301", title: "Methods of Social Research and Statistics", matchedAnchors: ["research methods"] }],
            transferableEvidence: ["Compare quantitative and qualitative evidence."],
          }}
          domainName="Social Sciences and Behavioural Research"
          domainId="D078"
          subgroupName="Computational and Digital Social Science"
          roleName="Social Researcher"
          domainFoundation={[{ skill: "Research reasoning" }]}
          domainItems={[contextItem("domain", "Research ethics")]}
          subgroupItems={[contextItem("subgroup", "Data analysis") ]}
          roleItems={[contextItem("role", "Interview synthesis") ]}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText("What your Sociology programme covers")).toBeTruthy();
    expect(screen.getByText("How that learning carries into Social Sciences and Behavioural Research")).toBeTruthy();
    expect(screen.getByText(/Your Sociology studies already introduce you to analysing social structures/)).toBeTruthy();
    expect(screen.getByText("Compulsory domain foundations")).toBeTruthy();
    expect(screen.getByText("Compulsory additions for Computational and Digital Social Science")).toBeTruthy();
    expect(screen.getByText("Compulsory additions for Social Researcher")).toBeTruthy();
    expect(screen.getByText(/The connection is supported by Methods of Social Research and Statistics\./)).toBeTruthy();
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

    expect(screen.getByText("What your Sociology programme covers")).toBeTruthy();
    expect(screen.getByText("Programme topics connected to this field")).toBeTruthy();
    expect(screen.getByText(/The connection is supported by Methods of Social Research and Statistics\./)).toBeTruthy();
    expect(screen.queryByText("Relevant outcome evidence already covered")).toBeNull();
    expect(screen.queryByText("Compare qualitative and quantitative evidence.")).toBeNull();
    expect(screen.getByText("Compulsory domain foundations")).toBeTruthy();
    expect(screen.queryByText("Include in my focus")).toBeNull();
  });
});
