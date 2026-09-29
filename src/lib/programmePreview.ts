import type { Programme, ProgrammeCurriculumContract } from "@/types/career";

/** True only when the contract contains student-displayable source evidence. */
export function hasStudentDisplayableProgrammeLearning(
  contract?: ProgrammeCurriculumContract | null,
): boolean {
  if (!contract || contract.status !== "available") return false;
  const hasCourseEvidence = contract.outcomes.some((outcome) =>
    outcome.dataState === "source_backed"
      && Boolean(outcome.courseCode?.trim() || outcome.courseTitle?.trim()),
  );
  const hasProgrammeAbilities = contract.abilities.some((ability) =>
    ability.dataState === "source_backed" && Boolean(ability.studentText?.trim()),
  );
  return hasCourseEvidence || hasProgrammeAbilities;
}

export function programmePreviewExplanation(data: Programme): string | null {
  const overview = data.overview?.trim();
  if (overview) return overview;
  const seen = new Set<string>();
  const courseTitles = (data.curriculumContract?.outcomes ?? [])
    .filter((outcome) => outcome.dataState === "source_backed")
    .map((outcome) => outcome.courseTitle?.trim())
    .filter((title): title is string => Boolean(title))
    .filter((title) => {
      const key = title.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 4);
  if (!courseTitles.length) return null;
  return `The checked curriculum records learning areas including ${courseTitles.join(", ")}.`;
}

export function programmePreviewUnavailableMessage(status?: string | null): string {
  if (status === "not_seeded") {
    return "Source-checked learning details have not been loaded for this programme yet. We will not substitute unreviewed legacy skills.";
  }
  if (status === "available") {
    return "The curriculum record is available, but it has no source-checked course outcomes or programme abilities that can be shown here yet.";
  }
  return "Source-checked curriculum details are not available for this programme yet. University requirements can still be reviewed after choosing a university.";
}
