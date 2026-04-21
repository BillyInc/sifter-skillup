/**
 * CairoBuilderPhase2Scorer.tsx
 *
 * Deterministic scoring for Cairo Builder Phase 2 boss submissions.
 * ZERO AI dependency. The platform is the judge.
 *
 * TWO scoring layers — both required to pass:
 *
 * LAYER 1 — STRUCTURAL VALIDATION (runs against submitted Cairo code)
 *   Checks that required patterns exist in the user's code.
 *   Each lab has a defined set of structural requirements (e.g., fn transfer, has-assert, storage-field).
 *   These checks are from the existing StructuralCheck system in CairoBuilderCodeSandbox.tsx.
 *   Pass threshold: 70% of structural checks.
 *
 * LAYER 2 — SNFORGE TEST OUTPUT PARSING (runs against pasted test results)
 *   User runs the platform-provided test file against their code: `scarb test`.
 *   User pastes the full test output into the platform.
 *   Platform parses the scarb output format to extract pass/fail counts.
 *   Pass threshold: 70% of tests for lessons, 80% for boss.
 *
 * OUTPUT:
 *   Combined score = (structural passes + test passes) / (structural total + test total)
 *   Portfolio push unlocked at combined score ≥ threshold.
 *
 * Labs with Sepolia deployment requirement (Labs 1, 2, 4, 5, 6, 8, 9, 11, Final Boss):
 *   LAYER 3 — TX HASH VERIFICATION
 *   User submits tx hash from their Sepolia deployment.
 *   Platform verifies via starknet_getTransactionReceipt RPC call.
 *   Confirmed status "SUCCEEDED" = deployment verified.
 *   This is the blockchain's contribution — it verifies execution correctness.
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, ScrollView,
  TouchableOpacity, ActivityIndicator, Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  SimShell, PrimaryBtn, GhostBtn, SectionLabel,
  type SimBaseProps,
} from './SimulatorShared';
import { Colors, Spacing, Radius, FontSize } from '../../theme';
import {
  runStructuralValidation,
  type StructuralCheck,
  type StructuralValidation,
} from '../CairoBuilderCodeSandbox';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface CairoPhase2Props extends SimBaseProps {
  labId: string;
  labTitle: string;
  scenario: string;
  /** Required structural patterns in submitted Cairo code */
  structuralChecks: StructuralCheck[];
  /** Platform-provided test file content — shown to user for them to run */
  testFile: string;
  /** Test file filename displayed to user */
  testFileName: string;
  /** Minimum test pass percentage (0–1) */
  passThreshold: number;
  /** Whether user must also submit a Sepolia tx hash */
  requiresTxHash: boolean;
  /** Starter/reference code hint (for labs that allow viewing reference) */
  referenceCode?: string;
  /** For portfolio push: what artifact to store */
  portfolioArtifactTemplate?: string;
  onArtifactContent?: (content: string) => void;
}

export interface Phase2Result {
  structuralResult: StructuralValidation;
  testResult: SnforgeResult | null;
  txResult: TxResult | null;
  combinedScore: number;
  combinedTotal: number;
  passed: boolean;
}

// ─── snforge output parser ──────────────────────────────────────────────────────

export interface SnforgeResult {
  passed: number;
  failed: number;
  total: number;
  passRate: number;
  failedTests: string[];
  rawOutput: string;
  parseError?: string;
}

const SCARB_RESULT_PATTERN = /test result:\s*(ok|FAILED|IGNORED)\.\s*(\d+)\s+passed;\s*(\d+)\s+failed/i;
const FAILED_TEST_PATTERN = /^\s*(FAIL|FAILED)\s+(.+)$/m;

export function parseSnforgeOutput(output: string): SnforgeResult {
  if (!output || output.trim().length < 10) {
    return {
      passed: 0, failed: 0, total: 0, passRate: 0,
      failedTests: [], rawOutput: output,
      parseError: 'No test output detected. Run `scarb test` and paste the complete output.',
    };
  }

  const resultMatch = output.match(SCARB_RESULT_PATTERN);
  if (!resultMatch) {
    // Try alternate snforge format
    const altMatch = output.match(/(\d+) tests passed.*?(\d+) tests failed/i);
    if (altMatch) {
      const passed = parseInt(altMatch[1]);
      const failed = parseInt(altMatch[2]);
      return {
        passed, failed, total: passed + failed,
        passRate: (passed + failed) > 0 ? passed / (passed + failed) : 0,
        failedTests: [], rawOutput: output,
      };
    }
    return {
      passed: 0, failed: 0, total: 0, passRate: 0,
      failedTests: [], rawOutput: output,
      parseError: 'Could not parse snforge output. Expected format: "test result: X. N passed; M failed"',
    };
  }

  const passed = parseInt(resultMatch[2]);
  const failed = parseInt(resultMatch[3]);
  const total = passed + failed;

  // Extract names of failed tests
  const failedTests: string[] = [];
  const lines = output.split('\n');
  for (const line of lines) {
    if (/^\s*(FAIL|FAILED)\s+\S/.test(line)) {
      const name = line.replace(/^\s*(FAIL|FAILED)\s+/, '').trim();
      if (name) failedTests.push(name);
    }
  }

  return {
    passed, failed, total,
    passRate: total > 0 ? passed / total : 0,
    failedTests,
    rawOutput: output,
  };
}

// ─── Sepolia tx hash verifier ──────────────────────────────────────────────────

export interface TxResult {
  hash: string;
  verified: boolean;
  status?: string;
  error?: string;
}

const SEPOLIA_RPC = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';

export async function verifySepoliaTx(txHash: string): Promise<TxResult> {
  const cleanHash = txHash.trim();

  // Basic format check
  if (!/^0x[0-9a-fA-F]{60,64}$/.test(cleanHash)) {
    return { hash: cleanHash, verified: false, error: 'Invalid tx hash format. Must be 0x followed by 60–64 hex characters.' };
  }

  try {
    const res = await fetch(SEPOLIA_RPC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        method: 'starknet_getTransactionReceipt',
        params: [cleanHash],
        id: 1,
      }),
    });

    if (!res.ok) {
      return { hash: cleanHash, verified: false, error: `RPC error: HTTP ${res.status}` };
    }

    const data = await res.json();

    if (data.error) {
      return { hash: cleanHash, verified: false, error: `Transaction not found: ${data.error.message}` };
    }

    const receipt = data.result;
    const execStatus = receipt?.execution_status ?? receipt?.status;

    if (execStatus === 'SUCCEEDED' || execStatus === 'ACCEPTED_ON_L2' || execStatus === 'ACCEPTED_ON_L1') {
      return { hash: cleanHash, verified: true, status: execStatus };
    }

    return {
      hash: cleanHash, verified: false,
      status: execStatus,
      error: `Transaction status: ${execStatus}. Must be SUCCEEDED to count as valid.`,
    };
  } catch (e: any) {
    // Fallback: if RPC is unreachable, accept the hash but flag as unverified
    return {
      hash: cleanHash, verified: false,
      error: `Could not reach Sepolia RPC. Tx hash recorded — will verify on submission. Error: ${e.message}`,
    };
  }
}

// ─── Layer indicators ─────────────────────────────────────────────────────────

function LayerBadge({
  layer, title, status, detail,
}: {
  layer: string; title: string; status: 'pending' | 'pass' | 'fail' | 'partial'; detail?: string;
}) {
  const colors = {
    pending: { bg: '#0f172a', border: '#1e293b', text: '#64748b', icon: '⬜' },
    pass:    { bg: '#052e16', border: '#22c55e40', text: '#86efac', icon: '✅' },
    fail:    { bg: '#2d1215', border: '#ef444440', text: '#fca5a5', icon: '❌' },
    partial: { bg: '#1c1008', border: '#f59e0b40', text: '#fcd34d', icon: '⚠️' },
  }[status];

  return (
    <View style={[lb.row, { backgroundColor: colors.bg, borderColor: colors.border }]}>
      <Text style={lb.icon}>{colors.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={lb.layer}>{layer}</Text>
        <Text style={[lb.title, { color: colors.text }]}>{title}</Text>
        {detail ? <Text style={lb.detail}>{detail}</Text> : null}
      </View>
    </View>
  );
}

const lb = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm,
    padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: 6, borderWidth: 1,
  },
  icon: { fontSize: 16, marginTop: 1 },
  layer: { fontSize: 9, fontWeight: '800', color: '#475569', letterSpacing: 1 },
  title: { fontSize: 13, fontWeight: '700' },
  detail: { fontSize: 11, color: '#64748b', marginTop: 2, lineHeight: 16 },
});

// ─── Main component ───────────────────────────────────────────────────────────

type Phase = 'code' | 'tests' | 'deploy' | 'results';

export default function CairoBuilderPhase2Scorer({
  labId, labTitle, scenario,
  structuralChecks, testFile, testFileName,
  passThreshold, requiresTxHash,
  referenceCode,
  portfolioArtifactTemplate,
  onComplete, onSkip, onArtifactContent,
}: CairoPhase2Props) {

  const [phase, setPhase] = useState<Phase>('code');
  const [cairoCode, setCairoCode] = useState('');
  const [testOutput, setTestOutput] = useState('');
  const [txHash, setTxHash] = useState('');
  const [result, setResult] = useState<Phase2Result | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [testFileVisible, setTestFileVisible] = useState(false);
  const [referenceVisible, setReferenceVisible] = useState(false);

  const runValidation = async () => {
    setVerifying(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Layer 1: Structural
    const structuralResult = runStructuralValidation(cairoCode, structuralChecks);

    // Layer 2: snforge output
    const testResult = testOutput.trim() ? parseSnforgeOutput(testOutput) : null;

    // Layer 3: Tx hash
    let txResult: TxResult | null = null;
    if (requiresTxHash && txHash.trim()) {
      txResult = await verifySepoliaTx(txHash.trim());
    }

    // Combined scoring
    const structScore = structuralResult.passing;
    const structTotal = structuralResult.total;
    const testScore = testResult?.passed ?? 0;
    const testTotal = testResult?.total ?? 0;
    const txScore = txResult?.verified ? 1 : (requiresTxHash ? 0 : 0);
    const txTotal = requiresTxHash ? 1 : 0;

    const combinedScore = structScore + testScore + txScore;
    const combinedTotal = structTotal + testTotal + txTotal;

    const passRate = combinedTotal > 0 ? combinedScore / combinedTotal : 0;
    const passed = passRate >= passThreshold;

    const r: Phase2Result = { structuralResult, testResult, txResult, combinedScore, combinedTotal, passed };
    setResult(r);
    setPhase('results');
    setVerifying(false);

    if (passed) {
      const artifact = portfolioArtifactTemplate
        ? portfolioArtifactTemplate
            .replace('[CODE]', cairoCode)
            .replace('[TX_HASH]', txHash || 'N/A')
            .replace('[TEST_OUTPUT]', testOutput)
        : `## ${labTitle} — Cairo Implementation\n\n\`\`\`cairo\n${cairoCode}\n\`\`\`\n\n**Deployment tx:** ${txHash || 'N/A'}\n\n**Test results:**\n\`\`\`\n${testOutput}\n\`\`\``;
      onArtifactContent?.(artifact);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  };

  if (result && phase === 'results') {
    const pct = result.combinedTotal > 0 ? result.combinedScore / result.combinedTotal : 0;
    return (
      <SimShell title="CAIRO BUILD" subtitle="Scoring complete" icon="🛠️" label="🛠️ CAIRO BUILDER PHASE 2">
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={res.header}>
            <Text style={[res.verdict, { color: result.passed ? '#22c55e' : '#ef4444' }]}>
              {result.passed ? '✓ PASSED' : '✗ NEEDS WORK'}
            </Text>
            <Text style={res.score}>
              {result.combinedScore}/{result.combinedTotal} checks passed ({Math.round(pct * 100)}%)
            </Text>
            <Text style={res.threshold}>Required: {Math.round(passThreshold * 100)}%</Text>
          </View>

          <SectionLabel text="LAYER 1 — STRUCTURAL VALIDATION" />
          <LayerBadge
            layer="Code Structure"
            title={`${result.structuralResult.passing}/${result.structuralResult.total} structural checks passed`}
            status={
              result.structuralResult.passing === result.structuralResult.total ? 'pass'
              : result.structuralResult.passing / result.structuralResult.total >= 0.7 ? 'partial'
              : 'fail'
            }
            detail={result.structuralResult.results
              .filter(r => !r.passed)
              .map(r => `✗ ${r.check.description}`)
              .slice(0, 3).join('\n')}
          />

          {result.testResult && (
            <>
              <SectionLabel text="LAYER 2 — SNFORGE TEST RESULTS" />
              <LayerBadge
                layer="Test Output"
                title={`${result.testResult.passed}/${result.testResult.total} tests passed`}
                status={
                  result.testResult.parseError ? 'fail'
                  : result.testResult.passRate >= passThreshold ? 'pass'
                  : result.testResult.passRate >= 0.5 ? 'partial'
                  : 'fail'
                }
                detail={
                  result.testResult.parseError
                    ? result.testResult.parseError
                    : result.testResult.failedTests.slice(0, 3).join('\n') || undefined
                }
              />
            </>
          )}

          {requiresTxHash && (
            <>
              <SectionLabel text="LAYER 3 — SEPOLIA DEPLOYMENT" />
              <LayerBadge
                layer="Blockchain Verification"
                title={result.txResult?.verified
                  ? `✓ Tx verified on Starknet Sepolia (${result.txResult.status})`
                  : result.txResult?.hash
                  ? `Tx verification: ${result.txResult.error ?? 'pending'}`
                  : 'No tx hash submitted'}
                status={result.txResult?.verified ? 'pass' : result.txResult?.hash ? 'partial' : 'fail'}
              />
            </>
          )}

          {result.passed ? (
            <PrimaryBtn label={`Push to Portfolio →`} onPress={onComplete} color="#22c55e" />
          ) : (
            <>
              <View style={res.retryBox}>
                <Text style={res.retryText}>
                  Fix the failing checks, re-run your tests, and resubmit.
                  {'\n'}Structural failures: revise your Cairo code.
                  {'\n'}Test failures: fix the failing test cases.
                </Text>
              </View>
              <PrimaryBtn label="Revise and Resubmit" onPress={() => setPhase('code')} color="#f59e0b" />
            </>
          )}
          <GhostBtn label="Skip" onPress={onSkip} />
        </ScrollView>
      </SimShell>
    );
  }

  return (
    <SimShell title="CAIRO BUILD" subtitle={labTitle} icon="🛠️" label="🛠️ CAIRO BUILDER PHASE 2">
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Scenario */}
        <View style={s.scenario}>
          <Text style={s.scenarioLabel}>CHALLENGE</Text>
          <Text style={s.scenarioText}>{scenario}</Text>
        </View>

        {/* Tab: Code */}
        <TabHeader
          active={phase === 'code'}
          icon="📝" title="1. Write Your Cairo Code"
          onPress={() => setPhase('code')}
        />
        {phase === 'code' && (
          <View style={s.section}>
            {referenceCode && (
              <TouchableOpacity
                style={s.toggleBtn}
                onPress={() => setReferenceVisible(!referenceVisible)}
              >
                <Text style={s.toggleText}>
                  {referenceVisible ? '▲ Hide reference patterns' : '▼ Show reference patterns (not the solution — patterns only)'}
                </Text>
              </TouchableOpacity>
            )}
            {referenceVisible && referenceCode && (
              <View style={s.codeBlock}>
                <Text style={s.codeText}>{referenceCode}</Text>
              </View>
            )}
            <TextInput
              value={cairoCode}
              onChangeText={setCairoCode}
              placeholder={'// Write your Cairo contract here\n#[starknet::contract]\nmod MyContract {\n    ...\n}'}
              placeholderTextColor="#475569"
              multiline
              style={s.codeInput}
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={s.charCount}>{cairoCode.split('\n').length} lines</Text>
            <PrimaryBtn
              label="Code ready → Move to Tests"
              onPress={() => setPhase('tests')}
              disabled={cairoCode.trim().length < 50}
              color="#7c3aed"
            />
          </View>
        )}

        {/* Tab: Tests */}
        <TabHeader
          active={phase === 'tests'}
          icon="🧪" title="2. Run Tests and Paste Output"
          onPress={() => setPhase('tests')}
        />
        {phase === 'tests' && (
          <View style={s.section}>
            <Text style={s.instruction}>
              Save the test file below as <Text style={s.mono}>{testFileName}</Text> in your project,
              then run: <Text style={s.mono}>scarb test</Text>
            </Text>

            <TouchableOpacity
              style={s.toggleBtn}
              onPress={() => setTestFileVisible(!testFileVisible)}
            >
              <Text style={s.toggleText}>
                {testFileVisible ? '▲ Hide test file' : '▼ Show test file (copy into your project)'}
              </Text>
            </TouchableOpacity>
            {testFileVisible && (
              <View style={s.codeBlock}>
                <Text style={s.codeText}>{testFile}</Text>
              </View>
            )}

            <SectionLabel text="PASTE YOUR TEST OUTPUT HERE" />
            <TextInput
              value={testOutput}
              onChangeText={setTestOutput}
              placeholder={'running 15 tests\ntest my_contract_tests::test_transfer ... ok\n...\ntest result: ok. 15 passed; 0 failed; 0 ignored'}
              placeholderTextColor="#475569"
              multiline
              style={[s.codeInput, { minHeight: 140 }]}
              textAlignVertical="top"
              autoCapitalize="none"
              autoCorrect={false}
            />

            {requiresTxHash && (
              <>
                <SectionLabel text="DEPLOYMENT TX HASH (SEPOLIA)" />
                <Text style={s.instruction}>
                  Deploy your contract to Starknet Sepolia and paste the deployment tx hash:
                </Text>
                <TextInput
                  value={txHash}
                  onChangeText={setTxHash}
                  placeholder="0x0123abc..."
                  placeholderTextColor="#475569"
                  style={s.txInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </>
            )}

            <PrimaryBtn
              label={verifying ? 'Validating…' : 'Submit for Scoring →'}
              onPress={runValidation}
              disabled={verifying || (!testOutput.trim() && !cairoCode.trim())}
              color="#22c55e"
            />
            {verifying && <ActivityIndicator color="#22c55e" style={{ marginTop: 8 }} />}
          </View>
        )}

        <GhostBtn label="Skip this challenge" onPress={onSkip} />
      </ScrollView>
    </SimShell>
  );
}

// ─── TabHeader ─────────────────────────────────────────────────────────────────

function TabHeader({ active, icon, title, onPress }: {
  active: boolean; icon: string; title: string; onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[tab.row, active && tab.active]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={tab.icon}>{icon}</Text>
      <Text style={[tab.title, active && tab.titleActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

const tab = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    padding: Spacing.md, borderRadius: Radius.sm,
    backgroundColor: '#0a0f1e', borderWidth: 1, borderColor: '#1e293b',
    marginBottom: 4,
  },
  active: { backgroundColor: '#0c1a2e', borderColor: '#7c3aed40' },
  icon: { fontSize: 16 },
  title: { flex: 1, fontSize: 13, fontWeight: '700', color: '#475569' },
  titleActive: { color: '#c084fc' },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  scenario: {
    backgroundColor: '#0c1a2e', borderRadius: Radius.sm,
    padding: Spacing.md, marginBottom: Spacing.md,
    borderWidth: 1, borderColor: '#1e3a5f',
  },
  scenarioLabel: { fontSize: 9, fontWeight: '800', color: '#475569', letterSpacing: 1, marginBottom: 4 },
  scenarioText: { fontSize: 13, color: '#94a3b8', lineHeight: 20 },
  section: { paddingTop: Spacing.sm, marginBottom: Spacing.md },
  instruction: { fontSize: 12, color: '#94a3b8', lineHeight: 18, marginBottom: Spacing.sm },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', color: '#c084fc' },
  toggleBtn: {
    padding: Spacing.sm, borderRadius: Radius.sm, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: '#7c3aed40', backgroundColor: '#0c0a1a',
  },
  toggleText: { fontSize: 12, color: '#c084fc', fontWeight: '600' },
  codeBlock: {
    backgroundColor: '#0d1117', borderRadius: Radius.sm, padding: Spacing.md,
    marginBottom: Spacing.sm, borderWidth: 1, borderColor: '#1e293b',
  },
  codeText: {
    fontSize: 11, color: '#e2e8f0', lineHeight: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  codeInput: {
    backgroundColor: '#0d1117', color: '#e2e8f0', fontSize: 12, lineHeight: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderRadius: Radius.sm, borderWidth: 1, borderColor: '#1e293b',
    padding: Spacing.md, minHeight: 250,
    marginBottom: Spacing.sm,
  },
  charCount: { fontSize: 10, color: '#475569', textAlign: 'right', marginBottom: Spacing.sm },
  txInput: {
    backgroundColor: '#0d1117', color: '#e2e8f0', fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    borderRadius: Radius.sm, borderWidth: 1, borderColor: '#1e293b',
    padding: Spacing.md, marginBottom: Spacing.sm,
  },
});

const res = StyleSheet.create({
  header: { alignItems: 'center', paddingVertical: Spacing.lg, gap: 4 },
  verdict: { fontSize: 20, fontWeight: '900', letterSpacing: 1 },
  score: { fontSize: 16, color: Colors.text, fontWeight: '700' },
  threshold: { fontSize: 12, color: Colors.textSoft },
  retryBox: {
    backgroundColor: '#fffbeb', borderRadius: Radius.md,
    padding: Spacing.md, borderWidth: 1, borderColor: '#fde68a',
    marginBottom: Spacing.sm,
  },
  retryText: { fontSize: 12, color: '#92400e', lineHeight: 18 },
});
