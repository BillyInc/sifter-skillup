import type { DomainLink, Programme, ProgrammeCurriculumContract } from "@/types/career";

type SourceOutcome = {
  outcomeId: string;
  sourceText: string;
  studentText: string;
  sourceLocator: Record<string, unknown>;
  studentDisplay: boolean;
  dataState: string;
};

type SourceAbility = {
  abilityId: string;
  displayTitle: string;
  sourceText: string;
  studentText: string;
  sourceLocator: Record<string, unknown>;
  dataState: string;
};

type SourceContract = {
  sourceAuthority: { parsedSourceFile: string; originalPdf: string };
  curriculumOutcomes: { rows: SourceOutcome[] };
  programmeAbilities: { rows: SourceAbility[] };
  programme: { name: string };
};

// The checked-in audit contract is stored gzipped (it is ~940KB uncompressed)
// and lives outside the Metro-bundled `src/` tree, so it cannot be a static
// `import`. It is loaded lazily, via Node's `fs`/`zlib`, only when this
// dev-only preview actually runs -- which keeps it out of the app bundle
// entirely and means a missing/corrupt file degrades to "no preview"
// instead of crashing the module for every caller.
let cachedContract: SourceContract | null | undefined;

function loadContract(): SourceContract | undefined {
  if (!__DEV__) return undefined;
  if (cachedContract !== undefined) return cachedContract ?? undefined;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const fs = require("fs");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const zlib = require("zlib");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const path = require("path");
    const file = path.join(
      __dirname,
      "../../data/career-mapping/_audit/sociology_curriculum_contract_2026-09-17.json.gz",
    );
    const raw = zlib.gunzipSync(fs.readFileSync(file));
    cachedContract = JSON.parse(raw.toString("utf8")) as SourceContract;
  } catch {
    cachedContract = null;
  }
  return cachedContract ?? undefined;
}

/**
 * Local-only display fallback for the checked-in Sociology curriculum contract.
 * It exists so the programme screen can be tested before the DB seed is applied;
 * it never replaces a populated API contract or exposes other programmes' data.
 */
export function sociologyCurriculumPreview(programme: Programme): ProgrammeCurriculumContract | undefined {
  const contract = loadContract();
  if (!contract || programme.name.trim().toLocaleLowerCase() !== contract.programme.name.trim().toLocaleLowerCase()) {
    return undefined;
  }
  const courses = new Map<string, { displayGroup?: string }>();
  const rawContract = contract as SourceContract & { programme: { courses?: Array<{ code: string; displayGroup?: string }> } };
  for (const course of rawContract.programme.courses ?? []) courses.set(course.code.trim().toLowerCase(), course);

  return {
    status: "available",
    localSourcePreview: true,
    outcomes: contract.curriculumOutcomes.rows
      .filter((row) => row.studentDisplay && row.dataState === "source_backed")
      .map((row) => {
        const locator = row.sourceLocator ?? {};
        const courseCode = String(locator.courseCode ?? "");
        const course = courses.get(courseCode.trim().toLowerCase());
        return {
          outcomeId: row.outcomeId,
          courseCode,
          courseTitle: String(locator.courseTitle ?? "Recorded course"),
          courseLevel: typeof locator.level === "number" ? locator.level : null,
          displayGroup: course?.displayGroup,
          outcomeIndex: typeof locator.outcomeIndex === "number" ? locator.outcomeIndex : 0,
          sourceText: row.sourceText,
          studentText: row.studentText,
          courseSummary: typeof locator.courseSummary === "string" ? locator.courseSummary : null,
          sourceLocator: locator,
          dataState: "source_backed",
        };
      }),
    abilities: contract.programmeAbilities.rows
      .filter((row) => row.dataState === "source_backed")
      .map((row) => ({
        abilityId: row.abilityId,
        displayTitle: row.displayTitle,
        sourceText: row.sourceText,
        studentText: row.studentText,
        sourceLocator: row.sourceLocator,
        dataState: "source_backed",
      })),
    sourceAuthority: {
      parsedSource: contract.sourceAuthority.parsedSourceFile,
      originalPdf: contract.sourceAuthority.originalPdf,
    },
  } as ProgrammeCurriculumContract;
}

export function sociologyDomainLinkPreview(programme: Programme): DomainLink | undefined {
  const contract = loadContract();
  if (!contract || programme.name.trim().toLocaleLowerCase() !== contract.programme.name.trim().toLocaleLowerCase()) return undefined;
  return {
    domainId: "D078",
    domainName: "Social Sciences & Behavioural Research",
    domainDescription: "Social Sciences helps you understand how people live together, how groups and institutions shape everyday life, and how societies change. It connects questions about culture, family, work, inequality, crime, policy and community life to evidence gathered through research.",
    domainDescriptionSources: [{
      title: "NUC Social Sciences CCMAS 2023",
      shortLabel: "Official curriculum source",
      url: "https://www.nuc.edu.ng/wp-content/uploads/2026/03/Social-Sciences-CCMAS-FINAL-2023-A.pdf",
      locator: "Sociology programme curriculum and research-methods outcomes",
      jurisdiction: "Nigeria",
    }],
    matchType: "direct",
    courseAnchorQuality: "strong",
    courseAnchors: [
      { title: "Introduction to Sociology I", matchedAnchors: ["sociology", "social science"] },
      { title: "Introduction to Anthropology", matchedAnchors: ["anthropology", "sociology"] },
      { title: "Methods of Social Research and Statistics", matchedAnchors: ["social research", "research methods"] },
      { title: "Structure of the Nigerian Society", matchedAnchors: ["society", "social structure"] },
    ],
    explanation: "Sociology studies society and social relationships, and this programme also includes Anthropology and social-research learning. Those curriculum links make Social Sciences a direct study connection. The field page adds learning options beyond the programme; it does not mean the programme teaches every item shown there.",
    mappingSource: "local_preview_from_reviewed_programme_domain_evidence",
  };
}

export function programmeCurriculumForDisplay(programme: Programme): ProgrammeCurriculumContract | undefined {
  const stored = programme.curriculumContract;
  if (stored?.status === "available" && (stored.outcomes?.length || stored.abilities?.length)) return stored;
  return sociologyCurriculumPreview(programme) ?? stored;
}

export function programmeDomainsForDisplay(programme: Programme): DomainLink[] {
  const stored = programme.domains ?? [];
  if (stored.length) return stored;
  const curriculum = programme.curriculumContract;
  if (curriculum?.status === "available" && (curriculum.outcomes?.length || curriculum.abilities?.length)) return stored;
  const preview = sociologyDomainLinkPreview(programme);
  return preview ? [preview] : stored;
}
