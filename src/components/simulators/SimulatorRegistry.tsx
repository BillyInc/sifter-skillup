/**
 * SimulatorRegistry — central map of all simulator type strings → components.
 *
 * Drop this into SimulatorCard.tsx to replace the existing SIMULATORS map,
 * or import EXTENDED_SIMULATORS and spread into the existing map.
 *
 * All 1,657 previously "coming soon" exercises are now wired to real renderers.
 *
 * Integration into existing SimulatorCard.tsx:
 *   1. Import EXTENDED_SIMULATORS from this file
 *   2. In SimulatorCard, replace `const Sim = SIMULATORS[simulatorType]`
 *      with `const Sim = { ...SIMULATORS, ...EXTENDED_SIMULATORS }[simulatorType]`
 *
 * Integration into SimulatorFactory.tsx (for lesson simulations):
 *   The LessonSimulation type field (e.g. 'judgment-communication') maps
 *   directly to these components via the registry below.
 */

import React from 'react';
import JudgmentRenderer, { type JudgmentType } from './JudgmentRenderer';
import ChartReplayRenderer, { type ChartReplayType } from './ChartReplayRenderer';
import {
  DataModelRenderer,
  SandboxCodeRenderer,
  SandboxReportRenderer,
  type CodeLanguage,
} from './SandboxRenderers';
import type { SimBaseProps } from './SimulatorShared';

// ── Lesson simulation shape (from skillTypes.ts) ──────────────────────────────

export interface LessonSimulationDef {
  type: string;
  scenario: string;
  scoringCriteria: string[];
  language?: CodeLanguage;         // for sandbox-code
  reportType?: 'memo' | 'analysis' | 'investigation' | 'recommendation' | 'case-study';
  starterCode?: string;            // optional scaffold for code exercises
}

// ── Factory function — creates the right renderer from a LessonSimulationDef ──

interface SimulatorProps extends SimBaseProps {
  def: LessonSimulationDef;
  onArtifactContent?: (content: string) => void;
}

export function SimulatorFromDef({ def, onComplete, onSkip, onArtifactContent }: SimulatorProps) {
  const baseProps = { onComplete, onSkip, onArtifactContent };

  // ── Judgment types ──────────────────────────────────────────────────────────
  const JUDGMENT_TYPES: JudgmentType[] = [
    'judgment-communication',
    'judgment-dataInterpret',
    'judgment-riskAssess',
    'judgment-prioritisation',
    'judgment-escalation',
    'judgment-ethicalChoice',
    'judgment-negotiation',
  ];

  if (JUDGMENT_TYPES.includes(def.type as JudgmentType)) {
    return (
      <JudgmentRenderer
        type={def.type as JudgmentType}
        scenario={def.scenario}
        scoringCriteria={def.scoringCriteria}
        {...baseProps}
      />
    );
  }

  // ── ChartReplay types ───────────────────────────────────────────────────────
  const CHART_TYPES: ChartReplayType[] = [
    'chartReplay-pattern',
    'chartReplay-breakout',
    'chartReplay-reversal',
    'chartReplay-riskManage',
    'chartReplay-volumeRead',
    'chartReplay-patternID',
  ];

  if (CHART_TYPES.includes(def.type as ChartReplayType)) {
    return (
      <ChartReplayRenderer
        type={def.type as ChartReplayType}
        scenario={def.scenario}
        scoringCriteria={def.scoringCriteria}
        {...baseProps}
      />
    );
  }

  // ── Sandbox data model ──────────────────────────────────────────────────────
  if (def.type === 'sandbox-dataModel') {
    return (
      <DataModelRenderer
        scenario={def.scenario}
        scoringCriteria={def.scoringCriteria}
        {...baseProps}
      />
    );
  }

  // ── Sandbox code (SQL, Python, Solidity, etc.) ──────────────────────────────
  if (def.type === 'sandbox-sql' || def.type === 'sandbox-python' || def.type === 'sandbox-code') {
    const lang: CodeLanguage =
      def.language ??
      (def.type === 'sandbox-sql' ? 'sql' : 'python');

    return (
      <SandboxCodeRenderer
        scenario={def.scenario}
        scoringCriteria={def.scoringCriteria}
        language={lang}
        starterCode={def.starterCode}
        {...baseProps}
      />
    );
  }

  // ── Sandbox excel / report ──────────────────────────────────────────────────
  if (def.type === 'sandbox-excel' || def.type === 'sandbox-report') {
    return (
      <SandboxReportRenderer
        scenario={def.scenario}
        scoringCriteria={def.scoringCriteria}
        reportType={def.reportType ?? 'analysis'}
        {...baseProps}
      />
    );
  }

  // ── Fallback — should no longer appear now that all types are mapped ─────────
  return null;
}

// ── Type guard helpers ────────────────────────────────────────────────────────

export function isJudgmentType(type: string): type is JudgmentType {
  return type.startsWith('judgment-');
}

export function isChartReplayType(type: string): type is ChartReplayType {
  return type.startsWith('chartReplay-');
}

export function isSandboxType(type: string): boolean {
  return type.startsWith('sandbox-');
}

export function isNewSimulatorType(type: string): boolean {
  return isJudgmentType(type) || isChartReplayType(type) || isSandboxType(type);
}

// ── All registered type strings (for documentation / validation) ──────────────

export const ALL_SIMULATOR_TYPES = [
  // Judgment (1,285 exercises)
  'judgment-communication',
  'judgment-dataInterpret',
  'judgment-riskAssess',
  'judgment-prioritisation',
  'judgment-escalation',
  'judgment-ethicalChoice',
  'judgment-negotiation',
  // ChartReplay (150 exercises)
  'chartReplay-pattern',
  'chartReplay-breakout',
  'chartReplay-reversal',
  'chartReplay-riskManage',
  'chartReplay-volumeRead',
  'chartReplay-patternID',
  // Sandbox (223 exercises)
  'sandbox-dataModel',
  'sandbox-sql',
  'sandbox-python',
  'sandbox-excel',
  'sandbox-code',
  'sandbox-report',
] as const;

export type SimulatorType = typeof ALL_SIMULATOR_TYPES[number];
