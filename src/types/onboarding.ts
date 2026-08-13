/**
 * Onboarding / starting-point detection types.
 *
 * Before showing any pathway the platform captures WHERE the user actually is.
 * Gap analysis differs hugely between, say, a 2:1 Economics graduate with 3
 * years' experience and a fresh JAMB candidate - so we record institution,
 * programme, classification, prior qualifications and experience, not just a
 * coarse user type.
 *
 * No data is required to collect this - selectors that need CCMAS/NCE/IBASS
 * lists render `coming_soon` via careerData until that data is imported.
 */
import type { InstitutionType } from "./career";

export type { InstitutionType };

/** The front-door user types (Mockup 1.2). */
export type UserType =
  | "senior_secondary" // SS1 / SS2 - exploring (career & subject guidance)
  | "ss3_secondary" // SS3 student still attached to a secondary school
  | "jamb" // JAMB / UTME candidate outside ordinary school onboarding
  | "student" // currently in a programme
  | "skilled_worker" // artisan / skilled trade
  | "professional" // working / career change
  | "graduate"; // NYSC / job seeker / early career

/** SS3 "three doors" (no personality test - mirrors the admission mechanism). */
export type SsDoor =
  | "know_where" // knows programme AND school
  | "know_what" // knows programme, not where
  | "unsure"; // input strongest subjects -> eligible programmes

export interface StartingPointProfile {
  userType: UserType;

  //  Student / graduate 
  institutionType?: InstitutionType;
  schoolName?: string;
  schoolAddress?: string;
  schoolCity?: string;
  schoolState?: string;
  /** Optional school affiliation code entered during auth or onboarding. */
  schoolCode?: string;
  discipline?: string;
  programmeName?: string;
  /** Degree classification / grade (e.g. "First Class", "2:1", "Upper Credit"). */
  classification?: string;
  yearOfStudy?: string;

  //  SS3 / JAMB 
  ssDoor?: SsDoor;
  /** UTME/JAMB subjects. Use of English may be fixed by the UI. */
  jambSubjects?: string[];
  /** O-level/WAEC/NECO subjects used for programme eligibility checks. */
  olevelSubjects?: string[];
  preferredInstitutionType?: InstitutionType;
  preferredSchoolId?: string;
  preferredSchool?: string;
  secondarySchoolId?: string;
  secondarySchoolName?: string;
  jambPrepMode?: "tutorial_centre" | "self_taught";
  tutorialCentreId?: string;
  tutorialCentreName?: string;
  intendedProgrammeId?: string;
  intendedJambProgrammeId?: string;
  intendedProgramme?: string;

  //  Senior secondary (SS1 / SS2 - exploring) 
  /** Which senior-secondary class the explorer is currently in. */
  ssClass?: "ss1" | "ss2" | "ss3";
  /** School stream is a guidance hint, never an eligibility gate. */
  stream?: "science" | "art" | "commercial";
  /** Broad interest areas to explore (e.g. "Sciences", "Business"). */
  interestAreas?: string[];
  /** What the explorer wants to do (explore careers / choose subjects / ...). */
  exploreIntent?: string[];
  // SS1/SS2 use `olevelSubjects`; SS3/JAMB use both O-level and UTME subjects.

  //  Professional / skilled 
  background?: string; // "Professional", "White-Collar", "Blue-Collar", ...
  currentField?: string;
  intent?: string[]; // understand field / explore new / start business / global
  highestQualification?: string;
  priorQualifications?: string[]; // CFA, ACCA, COREN, PMP, ...
  yearsExperience?: string;
  trade?: string; // skilled-worker trade

  //  Preferences (Step 3) 
  regions?: string[]; // Nigeria / Africa / Europe / NA / APAC / ME / anywhere
  workTypes?: string[]; // employment / business / freelance / remote / research
  notifications?: Record<string, boolean>;

  /** Bookkeeping. */
  completedAt?: string;

  /** Prior field domain key from career search (for professionals/changers/graduates). */
  priorFieldDomainKey?: string;
}

/** A single field that a branch setup form edits, with a partial update. */
export interface SetupFormProps {
  value: Partial<StartingPointProfile>;
  onChange: (patch: Partial<StartingPointProfile>) => void;
  /** Advance to the next step (Preferences). */
  onContinue: () => void;
}
