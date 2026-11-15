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

export type ProgrammePreviewSection = {
  heading?: string;
  body: string;
};

export function programmePreviewSections(
  data: Programme,
  displayContract: ProgrammeCurriculumContract | null | undefined = data.curriculumContract,
): ProgrammePreviewSection[] | null {
  const name = (data.name || data.studentName || "").trim().toLocaleLowerCase();
  if (name === "sociology") {
    const sections: ProgrammePreviewSection[] = [
      {
        heading: "What Sociology studies",
        body: "Sociology is part of the social sciences: fields that study people, groups and how societies work and change. It examines how people live together, form relationships and groups, organize shared life and shape one another's opportunities. Social institutions (lasting arrangements and organizations that shape shared life), including family life, education, work and government, influence everyday choices. Sociologists compare information from different people and settings to describe patterns and change, checking whose experiences are missing instead of treating one person's story as everyone's.",
      },
      {
        heading: "How sociologists investigate",
        body: "A research question is the focused issue a study aims to answer. Researchers choose evidence (information that can help answer the question) that fits it: a survey asks people a planned set of questions so answers can be compared; an interview is a guided conversation about people's experiences and reasons; observation means watching and recording what happens; document research examines existing texts and records, including who created them, why, and whose views may be missing. No one method fits every question.",
      },
      {
        heading: "Example: understanding a campus service",
        body: "Imagine a university wants to understand why some students use a support service and others do not. Interviews can reveal the reasons students give; observing how students reach the service can show where the process is difficult; records of appointments or visits can show when it is used, but miss students who never reach it. Comparing these sources can reveal a pattern and a gap, but cannot alone prove what caused them or explain every campus.",
      },
      {
        heading: "Protecting people and interpreting results",
        body: "When people take part, researchers explain what the study asks them to do, possible risks and how their information will be used. They seek informed consent (a voluntary decision made after receiving clear information) and follow ethics review (the institution's review of participant rights, possible harms, privacy and safeguards), its rules and applicable law. Review helps identify protections; it cannot guarantee that no harm will occur.",
      },
    ];
    return sections;
  }
  const overview = data.overview?.trim();
  if (overview) return [{ body: overview }];
  const seen = new Set<string>();
  const courseTitles = (displayContract?.outcomes ?? [])
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
  return [{
    heading: "Courses listed in the curriculum record",
    body: `The record lists courses such as ${courseTitles.join(", ")}. Their titles give a starting view of what the programme covers; they do not describe every topic or skill you may develop.`,
  }];
}

export function programmePreviewExplanation(
  data: Programme,
  displayContract: ProgrammeCurriculumContract | null | undefined = data.curriculumContract,
): string | null {
  return programmePreviewSections(data, displayContract)?.map((section) => section.body).join("\n\n") ?? null;
}

export function programmePreviewUnavailableMessage(status?: string | null): string {
  if (status === "not_seeded") {
    return "Programme learning details are not available here yet. You can still choose a university to review its admission requirements.";
  }
  if (status === "available") {
    return "The curriculum record is available, but it does not include course outcomes or programme abilities that can be shown here yet.";
  }
  return "Verified curriculum details are not available for this programme yet. You can still choose a university to review its admission requirements.";
}
