import type { ChoiceOption } from "../components/onboarding/primitives";

export type SchoolStream = "science" | "commercial" | "art";

export const WAEC_CORE_SUBJECTS_2026_2027 = [
  "English Language",
  "Mathematics",
];

export const WAEC_STREAM_SUBJECTS: Record<SchoolStream, string[]> = {
  science: [
    ...WAEC_CORE_SUBJECTS_2026_2027,
    "Biology",
    "Chemistry",
    "Physics",
    "Agriculture",
    "Further Mathematics",
    "Physical Education",
    "Health Education",
    "Foods and Nutrition",
    "Geography",
    "Technical Drawing",
  ],
  commercial: [
    ...WAEC_CORE_SUBJECTS_2026_2027,
    "Accounting",
    "Commerce",
    "Marketing",
    "Economics",
    "Geography",
    "Government",
    "French",
    "One Nigerian Language",
  ],
  art: [
    ...WAEC_CORE_SUBJECTS_2026_2027,
    "Nigerian History",
    "Government",
    "Christian Religious Studies",
    "Islamic Studies",
    "One Nigerian Language",
    "French",
    "Arabic",
    "Visual Art",
    "Music",
    "Literature in English",
    "Home Management",
    "Catering Craft",
  ],
};

export const WAEC_TRADE_SUBJECTS = [
  "Fashion Design and Garment Making",
  "Livestock Farming",
  "Beauty and Cosmetology",
  "Computer Hardware and GSM Repairs",
  "Solar Photovoltaic Installation and Maintenance",
  "Horticulture and Crop Production",
];

export const WAEC_ALL_SUBJECTS: string[] = Array.from(
  new Set([
    ...Object.values(WAEC_STREAM_SUBJECTS).flat(),
    ...WAEC_TRADE_SUBJECTS,
  ]),
);

export const STREAM_OPTIONS: ChoiceOption[] = [
  { label: "Science", value: "science" },
  { label: "Commercial", value: "commercial" },
  { label: "Arts", value: "art" },
];

export const toChoiceOptions = (subjects: string[]): ChoiceOption[] =>
  subjects.map((subject) => ({ label: subject, value: subject }));
