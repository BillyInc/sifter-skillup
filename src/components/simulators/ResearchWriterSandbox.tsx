/**
 * ResearchWriterSandbox.tsx
 *
 * simulator type: 'sandbox-research-writer'
 *
 * Structured writing environment for Ecosystem Lab 6 research methodology.
 * Guides users through professional DeFi/Starknet research report sections.
 * Scores against structured rubric — zero AI dependency.
 *
 * Report structure (enforced):
 *   1. Executive Summary    — what + key metric + competitive position + primary risk
 *   2. Protocol Analysis    — mechanism, TVL data, fee model, user growth
 *   3. Risk Assessment      — smart contract, market, regulatory, ecosystem risks
 *   4. Investment Thesis    — bull case + bear case + catalysts + position sizing
 *
 * Scoring:
 *   Each section has required data fields. Platform checks for presence.
 *   Section passes when ≥ 70% of required fields are present.
 *   Overall pass: ≥ 3 of 4 sections passing.
 *
 * Used in:
 *   ecosystemLab6_research_methodology.ts → lessonSimulations (type: 'sandbox-research-writer')
 *   ecosystemLab6 Build Task
 *   ecosystemLab6 Boss Phase 2
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { SimShell, PrimaryBtn, GhostBtn, SectionLabel, type SimBaseProps } from './SimulatorShared';
import { Colors, Spacing, Radius, FontSize } from '../../theme';

// ─── Section definitions ───────────────────────────────────────────────────────

interface SectionDef {
  id: string;
  title: string;
  icon: string;
  description: string;
  wordCountTarget: number;
  placeholder: string;
  requiredFields: RequiredField[];
}

interface RequiredField {
  id: string;
  label: string;
  description: string;
  checkFn: (text: string) => boolean;
}

const makeNumberCheck = (hint: string) => (text: string): boolean =>
  /\$[\d.,]+[MKB]?|\d+\.?\d*%|\d{3,}/.test(text);

const makeKeywordCheck = (keywords: string[]) => (text: string): boolean => {
  const lower = text.toLowerCase();
  return keywords.some(kw => lower.includes(kw.toLowerCase()));
};

const SECTIONS: SectionDef[] = [
  {
    id: 'executive-summary',
    title: 'Executive Summary',
    icon: '📋',
    description: 'Concise overview: what the protocol does, one key metric, its competitive position, and primary risk.',
    wordCountTarget: 150,
    placeholder: 'Write a 100–200 word executive summary.\n\nMust include:\n• What the protocol does (one clear sentence)\n• One specific metric (TVL or daily volume with source)\n• Competitive position on Starknet (one claim)\n• Primary risk (one sentence)',
    requiredFields: [
      {
        id: 'what-it-does',
        label: 'Protocol description',
        description: 'One sentence explaining what the protocol does',
        checkFn: (t) => t.trim().split(/[.!?]/).length >= 2 && t.length > 50,
      },
      {
        id: 'key-metric',
        label: 'Specific metric with value',
        description: 'TVL, daily volume, or users — with a number',
        checkFn: makeNumberCheck('include a specific metric'),
      },
      {
        id: 'competitive-position',
        label: 'Competitive position',
        description: 'Comparison to other Starknet protocols',
        checkFn: makeKeywordCheck(['starknet', 'largest', 'leading', 'compared', 'dominant', 'market share', 'tvl rank']),
      },
      {
        id: 'primary-risk',
        label: 'Primary risk identified',
        description: 'At least one specific risk named',
        checkFn: makeKeywordCheck(['risk', 'vulnerability', 'concern', 'weakness', 'threat', 'audit', 'liquidity risk', 'smart contract']),
      },
    ],
  },
  {
    id: 'protocol-analysis',
    title: 'Protocol Analysis',
    icon: '🔍',
    description: 'Core mechanism, TVL trend data, fee model, and user/volume growth metrics.',
    wordCountTarget: 300,
    placeholder: 'Analyse the protocol:\n\n• Core mechanism (how it works technically)\n• TVL data with trend (growing/stable/declining)\n• Fee model (how does the protocol make money)\n• User/volume growth (any data points)\n• Data sources: Dune, DefiLlama, or Starkscan',
    requiredFields: [
      {
        id: 'mechanism',
        label: 'Core mechanism explained',
        description: 'How the protocol works — AMM, lending, staking etc.',
        checkFn: makeKeywordCheck(['mechanism', 'pool', 'vault', 'borrow', 'lend', 'swap', 'amm', 'liquidity', 'stake', 'concentrated']),
      },
      {
        id: 'tvl-data',
        label: 'TVL with number and source',
        description: 'Specific TVL figure with where you found it',
        checkFn: (t) => {
          const hasTVL = /tvl|\$[\d.,]+[MKB]/i.test(t);
          const hasSource = /defillama|dune|starkscan|voyager|source:/i.test(t);
          return hasTVL && hasSource;
        },
      },
      {
        id: 'fee-model',
        label: 'Fee model described',
        description: 'How the protocol charges fees and where they go',
        checkFn: makeKeywordCheck(['fee', 'revenue', 'reserve factor', 'protocol fee', 'trading fee', 'swap fee', 'bps', 'basis points']),
      },
      {
        id: 'growth-metric',
        label: 'Growth or volume metric',
        description: 'Any data point showing user activity or growth',
        checkFn: (t) => makeNumberCheck('number')(t) && makeKeywordCheck(['volume', 'users', 'transactions', 'daily', 'weekly', 'growth', 'active'])(t),
      },
    ],
  },
  {
    id: 'risk-assessment',
    title: 'Risk Assessment',
    icon: '⚠️',
    description: 'Smart contract risk, market/liquidity risk, regulatory exposure, and ecosystem dependencies.',
    wordCountTarget: 250,
    placeholder: 'Assess the protocol\'s risk profile:\n\n• Smart contract risk (audit status, known issues, upgrade mechanism)\n• Market/liquidity risk (TVL concentration, withdrawal risk)\n• Regulatory risk (token classification, KYC exposure)\n• Ecosystem risk (dependencies on other protocols, bridges)\n\nRate each: LOW / MEDIUM / HIGH',
    requiredFields: [
      {
        id: 'smart-contract-risk',
        label: 'Smart contract risk assessed',
        description: 'Audit status mentioned, vulnerability surface discussed',
        checkFn: makeKeywordCheck(['audit', 'smart contract', 'bug', 'vulnerability', 'security', 'upgrade', 'proxy']),
      },
      {
        id: 'market-risk',
        label: 'Market/liquidity risk assessed',
        description: 'Withdrawal risk, bank run scenario, or liquidity depth discussed',
        checkFn: makeKeywordCheck(['liquidity', 'withdrawal', 'bank run', 'market risk', 'price impact', 'utilization', 'utilisation', 'slippage']),
      },
      {
        id: 'risk-ratings',
        label: 'Risk ratings included',
        description: 'LOW/MEDIUM/HIGH rating for at least two risk categories',
        checkFn: makeKeywordCheck(['low', 'medium', 'high']),
      },
      {
        id: 'ecosystem-dependency',
        label: 'Ecosystem dependencies named',
        description: 'Oracle, bridge, or protocol composability risk mentioned',
        checkFn: makeKeywordCheck(['oracle', 'bridge', 'dependency', 'composability', 'integration', 'relies on', 'depends on', 'pragma', 'chainlink']),
      },
    ],
  },
  {
    id: 'investment-thesis',
    title: 'Investment Thesis',
    icon: '💡',
    description: 'Bull case, bear case, specific catalysts, and position sizing recommendation.',
    wordCountTarget: 200,
    placeholder: 'State your thesis:\n\n• BULL CASE: Two or three reasons to be positive (with specific catalysts)\n• BEAR CASE: Two or three risks that would invalidate the thesis\n• CATALYSTS: Specific upcoming events or conditions\n• POSITION: What % of a portfolio you would allocate and why\n• DISCLOSURE: Any positions held or conflicts of interest',
    requiredFields: [
      {
        id: 'bull-case',
        label: 'Bull case articulated',
        description: 'Positive reasons with at least one specific catalyst',
        checkFn: makeKeywordCheck(['bull', 'bullish', 'positive', 'opportunity', 'upside', 'catalyst', 'growth catalyst']),
      },
      {
        id: 'bear-case',
        label: 'Bear case articulated',
        description: 'Risk that would invalidate the thesis',
        checkFn: makeKeywordCheck(['bear', 'bearish', 'risk', 'concern', 'downside', 'could fail', 'invalidate', 'threat']),
      },
      {
        id: 'position-recommendation',
        label: 'Position sizing recommendation',
        description: 'Specific portfolio allocation percentage or explicit no-position statement',
        checkFn: (t) => /\d+%|no position|not recommend|avoid|allocat/i.test(t),
      },
      {
        id: 'disclosure',
        label: 'Disclosure statement',
        description: 'Position held or explicit no-conflict statement — professional standard',
        checkFn: makeKeywordCheck(['disclosure', 'conflict', 'position', 'hold', 'not financial advice', 'nfa', 'dyor', 'i own', 'i do not']),
      },
    ],
  },
];

// ─── Props ─────────────────────────────────────────────────────────────────────

export interface ResearchWriterProps extends SimBaseProps {
  /** Optional pre-defined scenario (protocol name/context) */
  scenario?: string;
  /** Which sections to show (default: all four) */
  sections?: ('executive-summary' | 'protocol-analysis' | 'risk-assessment' | 'investment-thesis')[];
  /** For boss phase: require all 4 sections; for lesson sim: require 3 of 4 */
  isBoss?: boolean;
  onArtifactContent?: (content: string) => void;
}

// ─── Per-section editor ────────────────────────────────────────────────────────

function SectionTab({
  def,
  content,
  onContentChange,
  validated,
  active,
  onActivate,
}: {
  def: SectionDef;
  content: string;
  onContentChange: (s: string) => void;
  validated: { passed: boolean; passCount: number; total: number } | null;
  active: boolean;
  onActivate: () => void;
}) {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const wordReady = wordCount >= Math.round(def.wordCountTarget * 0.6);

  const bgColor = !validated
    ? (active ? '#0c1a2e' : '#0a0f1e')
    : validated.passed
    ? '#052e16'
    : '#2d1215';

  const borderColor = !validated
    ? (active ? '#3b82f6' : '#1e293b')
    : validated.passed
    ? '#22c55e40'
    : '#ef444440';

  return (
    <TouchableOpacity
      style={[tab.container, { backgroundColor: bgColor, borderColor }]}
      onPress={onActivate}
      activeOpacity={0.85}
    >
      <View style={tab.header}>
        <Text style={tab.icon}>{def.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={tab.title}>{def.title}</Text>
          <Text style={tab.meta}>
            {validated
              ? `${validated.passCount}/${validated.total} fields · ${wordCount} words`
              : `${wordCount}/${def.wordCountTarget} words`}
          </Text>
        </View>
        <Text style={{ fontSize: 14 }}>
          {validated ? (validated.passed ? '✅' : '❌') : (wordReady ? '📝' : '⬜')}
        </Text>
      </View>

      {active && (
        <View style={tab.editor}>
          <Text style={tab.desc}>{def.description}</Text>
          <TextInput
            value={content}
            onChangeText={onContentChange}
            placeholder={def.placeholder}
            placeholderTextColor="#475569"
            multiline
            style={tab.input}
            textAlignVertical="top"
            autoCapitalize="sentences"
          />
          <Text style={[tab.wc, { color: wordReady ? '#22c55e' : '#64748b' }]}>
            {wordCount} words {wordReady ? '✓' : `(target: ${def.wordCountTarget})`}
          </Text>

          {/* Required fields checklist */}
          {validated && (
            <View style={tab.checks}>
              <Text style={tab.checksLabel}>REQUIRED FIELDS:</Text>
              {def.requiredFields.map(field => {
                const fieldPassed = field.checkFn(content);
                return (
                  <View key={field.id} style={tab.checkRow}>
                    <Text style={{ fontSize: 11 }}>{fieldPassed ? '✅' : '⬜'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[tab.fieldLabel, { color: fieldPassed ? '#86efac' : '#94a3b8' }]}>
                        {field.label}
                      </Text>
                      {!fieldPassed && (
                        <Text style={tab.fieldHint}>{field.description}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const tab = StyleSheet.create({
  container: {
    borderRadius: Radius.md, borderWidth: 1,
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  icon: { fontSize: 20 },
  title: { fontSize: FontSize.sm, fontWeight: '700', color: '#e2e8f0' },
  meta: { fontSize: 11, color: '#64748b', marginTop: 2 },
  desc: { fontSize: 12, color: '#64748b', lineHeight: 18, marginBottom: Spacing.sm, fontStyle: 'italic' },
  editor: { marginTop: Spacing.md },
  input: {
    backgroundColor: '#0d1117', color: '#e2e8f0',
    borderRadius: Radius.sm, borderWidth: 1, borderColor: '#1e293b',
    padding: Spacing.md, minHeight: 200,
    fontSize: 13, lineHeight: 20, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  wc: { fontSize: 11, textAlign: 'right', marginTop: 4, fontWeight: '600' },
  checks: { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: Spacing.sm },
  checksLabel: { fontSize: 10, fontWeight: '800', color: '#475569', letterSpacing: 1, marginBottom: 6 },
  checkRow: { flexDirection: 'row', gap: 6, alignItems: 'flex-start', marginBottom: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600' },
  fieldHint: { fontSize: 11, color: '#64748b', lineHeight: 16 },
});

// ─── Main component ────────────────────────────────────────────────────────────

export default function ResearchWriterSandbox({
  scenario,
  sections: sectionFilter,
  isBoss = false,
  onComplete,
  onSkip,
  onArtifactContent,
}: ResearchWriterProps) {
  const activeSections = sectionFilter
    ? SECTIONS.filter(s => sectionFilter.includes(s.id as any))
    : SECTIONS;

  const passRequired = isBoss ? activeSections.length : Math.ceil(activeSections.length * 0.75);

  const [activeTab, setActiveTab] = useState(activeSections[0]?.id ?? '');
  const [contents, setContents] = useState<Record<string, string>>(
    Object.fromEntries(activeSections.map(s => [s.id, '']))
  );
  const [validated, setValidated] = useState<Record<string, { passed: boolean; passCount: number; total: number } | null>>(
    Object.fromEntries(activeSections.map(s => [s.id, null]))
  );
  const [submitted, setSubmitted] = useState(false);

  const validateSection = (def: SectionDef, content: string) => {
    const results = def.requiredFields.map(f => f.checkFn(content));
    const passCount = results.filter(Boolean).length;
    const total = results.length;
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
    const wordReady = wordCount >= Math.round(def.wordCountTarget * 0.6);
    return { passed: passCount >= Math.ceil(total * 0.7) && wordReady, passCount, total };
  };

  const handleValidateSection = (sectionId: string) => {
    const def = activeSections.find(s => s.id === sectionId);
    if (!def) return;
    const result = validateSection(def, contents[sectionId] ?? '');
    setValidated(prev => ({ ...prev, [sectionId]: result }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = () => {
    // Validate all sections first
    const allValidated = Object.fromEntries(
      activeSections.map(def => [def.id, validateSection(def, contents[def.id] ?? '')])
    );
    setValidated(allValidated);

    const passCount = Object.values(allValidated).filter(v => v?.passed).length;
    if (passCount < passRequired) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSubmitted(true);

    // Build artifact content
    const artifact = activeSections
      .map(s => `## ${s.title}\n\n${contents[s.id] ?? ''}`)
      .join('\n\n---\n\n');
    onArtifactContent?.(artifact);
  };

  const allValidatedResults = Object.values(validated).filter(Boolean);
  const passCount = allValidatedResults.filter(v => v?.passed).length;
  const canSubmit = passCount >= passRequired;
  const blockingMessage = !canSubmit
    ? `${passRequired - passCount} more section${passRequired - passCount > 1 ? 's' : ''} needed. Validate each section before submitting.`
    : null;

  if (submitted) {
    return (
      <SimShell title="RESEARCH REPORT" subtitle="Report submitted" icon="📄" label="📄 RESEARCH WRITER">
        <View style={done.container}>
          <Text style={done.emoji}>✅</Text>
          <Text style={done.title}>Research Report Complete</Text>
          <Text style={done.body}>
            Your report passed {passCount} of {activeSections.length} sections.
            {isBoss ? ' This qualifies for Portfolio Push.' : ''}
          </Text>
          <PrimaryBtn label="Continue →" onPress={onComplete} color="#22c55e" />
        </View>
      </SimShell>
    );
  }

  return (
    <SimShell
      title="RESEARCH WRITER"
      subtitle={scenario ?? 'Write a professional DeFi protocol research report'}
      icon="📝"
      label="📝 RESEARCH WRITER SANDBOX"
    >
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Instructions */}
        <View style={main.instructions}>
          <Text style={main.instrText}>
            Complete each section. Tap "Validate Section" to check required fields before moving on.
            {isBoss
              ? ` All ${activeSections.length} sections required for Portfolio Push.`
              : ` ${passRequired} of ${activeSections.length} sections required to pass.`}
          </Text>
        </View>

        {/* Progress bar */}
        <View style={main.progress}>
          <View style={[main.progressFill, { width: `${(passCount / activeSections.length) * 100}%` }]} />
          <Text style={main.progressText}>
            {passCount}/{activeSections.length} sections passing
          </Text>
        </View>

        {/* Section tabs */}
        {activeSections.map(def => (
          <View key={def.id}>
            <SectionTab
              def={def}
              content={contents[def.id] ?? ''}
              onContentChange={text => setContents(prev => ({ ...prev, [def.id]: text }))}
              validated={validated[def.id] ?? null}
              active={activeTab === def.id}
              onActivate={() => setActiveTab(activeTab === def.id ? '' : def.id)}
            />
            {activeTab === def.id && (
              <TouchableOpacity
                style={main.validateBtn}
                onPress={() => handleValidateSection(def.id)}
                activeOpacity={0.8}
              >
                <Text style={main.validateText}>✓ Validate Section</Text>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Submit */}
        {blockingMessage && (
          <View style={main.blockMsg}>
            <Text style={main.blockText}>⚠️ {blockingMessage}</Text>
          </View>
        )}

        <PrimaryBtn
          label={isBoss ? 'Submit Report for Portfolio Push →' : 'Submit Report →'}
          onPress={handleSubmit}
          disabled={!canSubmit}
          color="#6366f1"
        />
        <GhostBtn label="Skip" onPress={onSkip} />
      </ScrollView>
    </SimShell>
  );
}

const main = StyleSheet.create({
  instructions: {
    backgroundColor: '#0c1a2e', borderRadius: Radius.sm,
    padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#1e3a5f',
  },
  instrText: { fontSize: 13, color: '#94a3b8', lineHeight: 19 },
  progress: {
    height: 6, backgroundColor: '#1e293b', borderRadius: 3,
    marginBottom: Spacing.md, overflow: 'hidden', position: 'relative',
  },
  progressFill: {
    position: 'absolute', left: 0, top: 0, bottom: 0,
    backgroundColor: '#22c55e', borderRadius: 3,
  },
  progressText: {
    position: 'absolute', right: 0, top: 8,
    fontSize: 10, color: '#64748b', fontWeight: '700',
  },
  validateBtn: {
    backgroundColor: '#0f172a', borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: '#22c55e40', alignItems: 'center',
  },
  validateText: { fontSize: 13, color: '#22c55e', fontWeight: '700' },
  blockMsg: {
    backgroundColor: '#fef2f2', borderRadius: Radius.sm,
    padding: Spacing.sm, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: '#fecaca',
  },
  blockText: { fontSize: 12, color: '#7f1d1d' },
});

const done = StyleSheet.create({
  container: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md },
  emoji: { fontSize: 48 },
  title: { fontSize: 18, fontWeight: '800', color: '#22c55e' },
  body: { fontSize: FontSize.sm, color: Colors.textSoft, textAlign: 'center', lineHeight: 22 },
});
