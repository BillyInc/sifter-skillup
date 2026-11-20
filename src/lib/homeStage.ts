/**
 * Pure stage logic for the student Home (blueprint sections 3-7).
 *
 * Everything here is derived from the saved starting point only: no scores,
 * no recommendations and no values that the student did not supply. Profiles
 * outside the four student stages (graduate, professional, skilled worker) and
 * profiles without a usable stage resolve to `null`, which keeps the existing
 * Home behaviour.
 */
import type { StartingPointProfile } from "../types/onboarding";

export type HomeStageKey = "early_secondary" | "admission" | "undergraduate";

export interface HomeStageInfo {
  key: HomeStageKey;
  /** Short label shown after "My learning stage". */
  label: string;
}

export type HomeRouteKey =
  | "subjects"
  | "programme_in_mind"
  | "know_both"
  | "know_programme"
  | "not_sure";

export interface HomeRoute {
  key: HomeRouteKey;
  title: string;
  body: string;
  /** Mode and options for the existing `exploreNav.admissionHub`. */
  mode: "programme" | "subjects";
  options: {
    entry: "programme_and_university" | "programme_search" | "subject_match";
    userType?: string;
    className?: string;
    stream?: string;
    examType?: "olevel" | "combined";
  };
}

export function resolveHomeStage(
  p: StartingPointProfile | null | undefined,
): HomeStageInfo | null {
  if (!p) return null;
  switch (p.userType) {
    case "senior_secondary":
      if (p.ssClass === "ss1" || p.ssClass === "ss2") {
        return { key: "early_secondary", label: p.ssClass.toUpperCase() };
      }
      if (p.ssClass === "ss3") return { key: "admission", label: "SS3" };
      return null;
    case "ss3_secondary":
      return { key: "admission", label: "SS3" };
    case "jamb":
      return { key: "admission", label: "UTME applicant" };
    case "student":
      return { key: "undergraduate", label: "Undergraduate" };
    default:
      return null;
  }
}

/** The explicit routes for a stage, in display order (existing Explore flows). */
export function homeRoutesFor(
  stage: HomeStageKey,
  p: StartingPointProfile,
): HomeRoute[] {
  const base = {
    userType: p.userType,
    className: p.ssClass,
    stream: p.stream,
  };
  const examType = p.userType === "senior_secondary" ? "olevel" : "combined";
  if (stage === "early_secondary") {
    return [
      {
        key: "subjects",
        title: "Start with my subjects",
        body: "View or add your O-level subjects and see programmes that may match them.",
        mode: "subjects",
        options: { ...base, entry: "subject_match", examType: "olevel" },
      },
      {
        key: "programme_in_mind",
        title: "I have a programme in mind",
        body: "Search a programme, then see the universities that offer it.",
        mode: "programme",
        options: { ...base, entry: "programme_search" },
      },
    ];
  }
  if (stage === "admission") {
    return [
      {
        key: "know_both",
        title: "I know my university and programme",
        body: "Pick your programme and open the details for that university.",
        mode: "programme",
        options: { ...base, entry: "programme_and_university" },
      },
      {
        key: "know_programme",
        title: "I know my programme, not the university",
        body: "See which universities offer it, then review each one's requirements.",
        mode: "programme",
        options: { ...base, entry: "programme_search" },
      },
      {
        key: "not_sure",
        title: "I am not sure about either",
        body: "Enter your O-level and UTME subjects separately to see possible matches and the reasons.",
        mode: "subjects",
        options: { ...base, entry: "subject_match", examType },
      },
    ];
  }
  return [];
}

function listNames(names: string[]): string {
  if (names.length <= 3) {
    return names.length > 1
      ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`
      : names[0];
  }
  return `${names.slice(0, 3).join(", ")} and ${names.length - 3} more`;
}

/** "Because you selected ..." only when the student actually selected subjects. */
export function subjectReason(
  p: StartingPointProfile | null | undefined,
): string | null {
  if (!p) return null;
  const olevel = (p.olevelSubjects ?? []).filter(Boolean);
  const utme = (p.jambSubjects ?? []).filter(Boolean);
  if (olevel.length && utme.length) {
    return `Because you selected ${olevel.length} O-level and ${utme.length} UTME subjects`;
  }
  if (olevel.length) return `Because you selected ${listNames(olevel)}`;
  if (utme.length) return `Because you selected ${listNames(utme)} for UTME`;
  return null;
}

/** University and programme only: no year of study and no faculty. */
export function undergraduateProgramme(p: StartingPointProfile): {
  university: string | null;
  programme: string | null;
} {
  const clean = (v?: string) => (v && v.trim() ? v.trim() : null);
  return {
    university: clean(p.schoolName),
    programme: clean(p.programmeName) ?? clean(p.intendedProgramme),
  };
}
