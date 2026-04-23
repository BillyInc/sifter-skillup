import {
  PRIMER_MODULE_META,
  LAB1_META,
  LAB2_META,
  LAB3_META,
  LAB4_META,
  LAB5_META,
  LAB6_META,
  LAB7_META,
  LAB8_META,
  LAB9_META,
} from './ecosystemAllLessons';

export type EcosystemLabLevel = 'junior' | 'intermediate' | 'senior';

export interface EcosystemLabDef {
  id: string;
  number: number;
  title: string;
  lessonCount: number;
  level: EcosystemLabLevel;
  estimatedH: number;
  requiresLevelId: number | null;
  portfolioPush: boolean;
  sqlPrimerRequired: boolean;
  simulatorTypes: string[];
}

export const ECOSYSTEM_LEVEL_COLORS: Record<EcosystemLabLevel, string> = {
  junior: '#22C55E',
  intermediate: '#F59E0B',
  senior: '#6366F1',
};

export const ECOSYSTEM_TRACK = {
  id: 'starknet-ecosystem-deep-dive',
  name: 'Starknet Ecosystem Deep Dive',
  bossLevelIds: {
    primer: 4000,
    lab1: 4001,
    lab2: 4002,
    lab3: 4003,
    lab4: 4004,
    lab5: 4005,
    lab6: 4006,
    lab7: 4007,
    lab8: 4008,
    lab9: 4009,
  },
} as const;

const ECOSYSTEM_SIMULATOR_TYPES: Record<number, string[]> = {
  0: ['starkzap-ecosystem-read'],
  1: ['starkzap-ecosystem-read', 'aggregate'],
  2: ['starkzap-ecosystem-read', 'judgment-dataInterpret'],
  3: ['judgment-riskAssess', 'judgment-dataInterpret'],
  4: ['starkzap-package-install', 'starkzap-mainnet-push'],
  5: ['judgment-dataInterpret', 'aggregate'],
  6: ['sandbox-research-writer', 'judgment-riskAssess'],
  7: ['judgment-dataInterpret', 'aggregate'],
  8: ['opp-options', 'opp-agg', 'opp-rwa'],
  9: ['sandbox-sql', 'sandbox-research-writer', 'forum'],
};

export const ECOSYSTEM_LABS: EcosystemLabDef[] = [
  {
    id: 'primer',
    number: 0,
    title: PRIMER_MODULE_META.title,
    lessonCount: PRIMER_MODULE_META.lessonCount,
    level: PRIMER_MODULE_META.level,
    estimatedH: 1,
    requiresLevelId: null,
    portfolioPush: PRIMER_MODULE_META.portfolioPush,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[0],
  },
  {
    id: 'ecosystem-lab-1',
    number: LAB1_META.labNumber,
    title: LAB1_META.title,
    lessonCount: LAB1_META.lessonCount,
    level: LAB1_META.level,
    estimatedH: LAB1_META.estimatedHours,
    requiresLevelId: 4000,
    portfolioPush: LAB1_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[1],
  },
  {
    id: 'ecosystem-lab-2',
    number: LAB2_META.labNumber,
    title: LAB2_META.title,
    lessonCount: LAB2_META.lessonCount,
    level: LAB2_META.level,
    estimatedH: LAB2_META.estimatedHours,
    requiresLevelId: 4001,
    portfolioPush: LAB2_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[2],
  },
  {
    id: 'ecosystem-lab-3',
    number: LAB3_META.labNumber,
    title: LAB3_META.title,
    lessonCount: LAB3_META.lessonCount,
    level: LAB3_META.level,
    estimatedH: LAB3_META.estimatedHours,
    requiresLevelId: 4002,
    portfolioPush: LAB3_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[3],
  },
  {
    id: 'ecosystem-lab-4',
    number: LAB4_META.labNumber,
    title: LAB4_META.title,
    lessonCount: LAB4_META.lessonCount,
    level: LAB4_META.level,
    estimatedH: LAB4_META.estimatedHours,
    requiresLevelId: 4003,
    portfolioPush: LAB4_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[4],
  },
  {
    id: 'ecosystem-lab-5',
    number: LAB5_META.labNumber,
    title: LAB5_META.title,
    lessonCount: LAB5_META.lessonCount,
    level: LAB5_META.level,
    estimatedH: LAB5_META.estimatedHours,
    requiresLevelId: 4004,
    portfolioPush: LAB5_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[5],
  },
  {
    id: 'ecosystem-lab-6',
    number: LAB6_META.labNumber,
    title: LAB6_META.title,
    lessonCount: LAB6_META.lessonCount,
    level: LAB6_META.level,
    estimatedH: LAB6_META.estimatedHours,
    requiresLevelId: 4005,
    portfolioPush: LAB6_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[6],
  },
  {
    id: 'ecosystem-lab-7',
    number: LAB7_META.labNumber,
    title: LAB7_META.title,
    lessonCount: LAB7_META.lessonCount,
    level: LAB7_META.level,
    estimatedH: LAB7_META.estimatedHours,
    requiresLevelId: 4006,
    portfolioPush: LAB7_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[7],
  },
  {
    id: 'ecosystem-lab-8',
    number: LAB8_META.labNumber,
    title: LAB8_META.title,
    lessonCount: LAB8_META.lessonCount,
    level: LAB8_META.level,
    estimatedH: LAB8_META.estimatedHours,
    requiresLevelId: 4007,
    portfolioPush: LAB8_META.portfolioPushThisLab,
    sqlPrimerRequired: false,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[8],
  },
  {
    id: 'ecosystem-lab-9',
    number: LAB9_META.labNumber,
    title: LAB9_META.title,
    lessonCount: LAB9_META.lessonCount,
    level: LAB9_META.level,
    estimatedH: LAB9_META.estimatedHours,
    requiresLevelId: 4008,
    portfolioPush: LAB9_META.portfolioPushThisLab,
    sqlPrimerRequired: LAB9_META.sqlPrimerIncluded,
    simulatorTypes: ECOSYSTEM_SIMULATOR_TYPES[9],
  },
];

export const ECOSYSTEM_LAB_LESSON_COUNTS: Record<number, number> = Object.fromEntries(
  ECOSYSTEM_LABS.map((lab) => [lab.number, lab.lessonCount]),
) as Record<number, number>;

export const getEcosystemLab = (labNumber: number): EcosystemLabDef | undefined =>
  ECOSYSTEM_LABS.find((lab) => lab.number === labNumber);
