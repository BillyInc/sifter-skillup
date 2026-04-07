/**
 * Lab 8 Bridge Simulators — React Native
 * Starknet DeFi Navigator · Intermediate · Lab 8
 *
 * Simulator types registered here:
 *   starkzap-bridge-lockmint    — Lesson 1: Lock-and-Mint vs Burn-and-Mint
 *   starkzap-bridge-selector    — Lesson 2: ETH→Starknet bridge selector
 *   starkzap-bridge-route       — Lesson 3: Solana→Starknet route planner
 *   starkzap-bridge-calc        — Lesson 4: Round-trip cost calculator
 *   starkzap-bridge-register    — Lesson 5: Multi-chain position register
 *
 * Design rule (pasted_text brief):
 *   Cross-chain bridge execution is mocked — starkzap-native is Starknet-only.
 *   Starknet-side verification (balance check after simulated bridge) uses real SDK.
 *   Time-accelerated: 12-hour Starkgate waits show countdown UI + fast-forward button.
 *   "Teach the concept without inflicting the actual wait."
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, ActivityIndicator, TextInput,
} from 'react-native';
import { useAuth } from '../../../../hooks/useAuth';
import {
  isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
  type StarkzapWallet,
} from '../../../../lib/starkzap';
import { Spacing, Radius, FontSize, useTheme } from '../../../../theme';

// ── Shared UI (re-exported from StarkzapSimulatorCard for use here) ────────────
// These are defined in StarkzapSimulatorCard and must be exported from that file.
// See StarkzapSimulatorCard_v2.tsx for the updated export list.
import {
  SimHeader, ActionBtn, TxResult, InfoRow, DemoBadge, simulateDelay,
} from '../shared/StarkzapSimulatorCard_v3';

// ── Shared types ───────────────────────────────────────────────────────────────

interface SimProps {
  onComplete: () => void;
  onSkip: () => void;
  colors: any;
}

// ── Shared bridge helpers ──────────────────────────────────────────────────────

/** Verify ETH or USDC arrived on Starknet after a simulated bridge. */
async function verifyArrival(
  wallet: StarkzapWallet | null,
  token: 'ETH' | 'USDC',
): Promise<string> {
  if (!wallet || !isStarkzapAvailable()) {
    return token === 'ETH' ? MOCK.strkBalance.replace('STRK', 'ETH') : MOCK.usdcBalance;
  }
  try {
    const tok = token === 'ETH' ? STARKNET_TOKENS.ETH : STARKNET_TOKENS.USDC;
    const bal = await wallet.balanceOf(tok);
    return bal.toFormatted();
  } catch {
    return token === 'ETH' ? '2.00 ETH' : '500.00 USDC';
  }
}

/** Mock bridge tx hash with slight randomisation so each run looks distinct. */
function mockBridgeTxHash() {
  return '0x' + Math.random().toString(16).slice(2, 12) + '...bridge';
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 1 — starkzap-bridge-lockmint
// Lock-and-Mint vs Burn-and-Mint Visualizer
// ══════════════════════════════════════════════════════════════════════════════

type LockMintStep =
  | 'idle' | 'locking' | 'locked' | 'minting' | 'complete'
  | 'exploited' | 'burning' | 'attesting' | 'native_minted';

export function BridgeLockMintSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useAuth();
  const [mode, setMode] = useState<'lock' | 'burn'>('lock');
  const [step, setStep] = useState<LockMintStep>('idle');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function resetStep() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setStep('idle'); setBalance(null); setTxHash(null);
  }

  async function runLockMint() {
    setLoading(true);
    setStep('locking');
    await simulateDelay(900);
    setStep('locked');
    await simulateDelay(700);
    setStep('minting');
    await simulateDelay(1000);
    const hash = mockBridgeTxHash();
    setTxHash(hash);
    // Real SDK: verify ETH balance on Starknet after simulated bridge
    const w = starknetWallet as StarkzapWallet | null;
    const bal = await verifyArrival(w, 'ETH');
    setBalance(bal);
    setStep('complete');
    setLoading(false);
  }

  async function runBurnMint() {
    setLoading(true);
    setStep('burning');
    await simulateDelay(1000);
    setStep('attesting');
    await simulateDelay(1200);
    const hash = mockBridgeTxHash();
    setTxHash(hash);
    const w = starknetWallet as StarkzapWallet | null;
    const bal = await verifyArrival(w, 'USDC');
    setBalance(bal);
    setStep('native_minted');
    setLoading(false);
  }

  async function triggerExploit() {
    setLoading(true);
    await simulateDelay(800);
    setStep('exploited');
    setLoading(false);
  }

  const isLock = mode === 'lock';

  const stepLabels: Partial<Record<LockMintStep, string>> = {
    idle: 'Ready to bridge',
    locking: 'Locking ETH in Starkgate contract on Ethereum…',
    locked: 'ETH locked in contract ✓',
    minting: 'Minting wETH on Starknet…',
    complete: 'Bridge complete — wETH received on Starknet',
    exploited: '⚠ Contract drained — your wETH is worthless',
    burning: 'Burning USDC on Ethereum — permanently destroyed…',
    attesting: 'Circle attestation service confirming burn…',
    native_minted: 'Native USDC minted on Starknet by Circle ✓',
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="⛓"
        title="Bridge Mechanics Visualizer"
        subtitle="Execute a bridge and observe what actually locks, mints, and burns."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Mode toggle */}
      <View style={s.row}>
        {(['lock', 'burn'] as const).map((m) => (
          <TouchableOpacity
            key={m}
            style={[s.modeBtn, { borderColor: colors.border },
              mode === m && { backgroundColor: m === 'lock' ? '#f59e0b' : '#0d9488', borderColor: 'transparent' }]}
            onPress={() => { setMode(m); resetStep(); }}
          >
            <Text style={[s.modeBtnTxt, { color: mode === m ? '#fff' : colors.textSoft }]}>
              {m === 'lock' ? '🔒 Starkgate\nLock-and-Mint' : '🔥 CCTP\nBurn-and-Mint'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status display */}
      {step !== 'idle' && (
        <View style={[s.statusBox, {
          backgroundColor: step === 'exploited' ? colors.redSoft : step === 'native_minted' ? colors.greenSoft : colors.bgSecondary,
          borderColor: step === 'exploited' ? colors.red + '40' : step === 'native_minted' ? colors.green + '40' : colors.border,
        }]}>
          <Text style={[s.statusTxt, { color: step === 'exploited' ? colors.red : step === 'native_minted' ? colors.green : colors.textSoft }]}>
            {stepLabels[step] ?? step}
          </Text>
        </View>
      )}

      {/* Flow steps */}
      {step !== 'idle' && (
        <View style={{ gap: Spacing.xs }}>
          <InfoRow icon="🇺🇸" label="Ethereum" value={
            isLock
              ? (['locked','minting','complete','exploited'].includes(step) ? '2 ETH — LOCKED in contract' : '2 ETH')
              : (['attesting','native_minted'].includes(step) ? 'USDC — BURNED ✓' : 'USDC available')
          } colors={colors} />
          <InfoRow icon="🔗" label={isLock ? 'Starkgate Contract' : 'Circle Attestation'} value={
            step === 'locking' ? 'Receiving…' :
            step === 'locked' ? 'Holding 2 ETH' :
            step === 'minting' ? 'Authorising mint…' :
            step === 'complete' ? '2 ETH locked ✓' :
            step === 'exploited' ? '💥 DRAINED — empty' :
            step === 'burning' ? 'Burn confirmed…' :
            step === 'attesting' ? 'Signing attestation…' :
            step === 'native_minted' ? 'Attested ✓' : '—'
          } colors={colors} />
          <InfoRow icon="⚡" label="Starknet" value={
            isLock
              ? (step === 'minting' ? 'Minting wETH…' : step === 'complete' ? '2 wETH ✓ (representation)' : step === 'exploited' ? 'wETH = worthless IOU' : '—')
              : (step === 'native_minted' ? `${balance ?? 'USDC'} (native — issued by Circle)` : '—')
          } colors={colors} />
        </View>
      )}

      {/* Real balance after bridge */}
      {balance && step !== 'exploited' && (
        <InfoRow icon="💰" label="Your Starknet balance (verified)" value={balance} colors={colors} />
      )}

      {/* Tx result */}
      {txHash && step !== 'exploited' && (
        <TxResult
          hash={txHash}
          label={isLock ? 'Simulated bridge — wETH minted' : 'Simulated CCTP — native USDC minted'}
          colors={colors}
        />
      )}

      {/* Exploit outcome */}
      {step === 'exploited' && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: colors.red + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.red }]}>
            The Starkgate contract held your 2 ETH as backing. The exploit drained it.
            Your Starknet wETH is now a claim with no collateral — worthless.{'\n\n'}
            Switch to CCTP (Burn-and-Mint) to see why this exploit is impossible
            when there is no locked pool.
          </Text>
        </View>
      )}

      {/* CCTP no-exploit note */}
      {step === 'native_minted' && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.green }]}>
            There is no locked USDC on Ethereum to steal. The source token was
            permanently destroyed. Your Starknet USDC is native — issued by Circle.
            No exploit button exists because there is no collateral pool to drain.
          </Text>
        </View>
      )}

      {/* Actions */}
      {step === 'idle' && (
        <ActionBtn
          label={isLock ? '🔒 Bridge 2 ETH via Starkgate' : '🔥 Bridge USDC via CCTP'}
          onPress={isLock ? runLockMint : runBurnMint}
          loading={loading}
          variant={isLock ? 'primary' : 'starknet'}
          colors={colors}
        />
      )}
      {step === 'complete' && (
        <>
          <ActionBtn
            label="💥 Simulate Bridge Exploit"
            onPress={triggerExploit}
            loading={loading}
            variant="primary"
            colors={colors}
          />
          <ActionBtn label="Reset" onPress={resetStep} variant="ghost" colors={colors} />
        </>
      )}
      {step === 'exploited' && (
        <ActionBtn label="Try CCTP instead →" onPress={() => { setMode('burn'); resetStep(); }} variant="starknet" colors={colors} />
      )}
      {step === 'native_minted' && (
        <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      )}
      {!loading && ['locking','locked','minting','burning','attesting'].includes(step) && (
        <View style={{ alignItems: 'center' }}>
          <ActivityIndicator color={colors.accent} />
        </View>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 2 — starkzap-bridge-selector
// ETH → Starknet Bridge Selector with time-accelerated 12-hour wait
// ══════════════════════════════════════════════════════════════════════════════

type BridgeChoice = 'starkgate' | 'cctp' | 'orbiter';
type SelectorStep = 'pick' | 'executing' | 'waiting' | 'complete' | 'error';

const BRIDGE_SCENARIOS = [
  { label: '1  Bridge $80,000 ETH to Starknet', asset: 'ETH' as const, amount: 80000 },
  { label: '2  Bridge $55,000 USDC to Starknet', asset: 'USDC' as const, amount: 55000 },
  { label: '3  Bridge $600 ETH to Starknet', asset: 'ETH' as const, amount: 600 },
];

export function BridgeSelectorSim({ onComplete, onSkip, colors }: SimProps) {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [bridge, setBridge] = useState<BridgeChoice | null>(null);
  const [flowStep, setFlowStep] = useState<SelectorStep>('pick');
  const [loading, setLoading] = useState(false);
  const [fastForwarded, setFastForwarded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [txHash, setTxHash] = useState<string | null>(null);
  const [completedCount, setCompletedCount] = useState(0);

  const scenario = BRIDGE_SCENARIOS[scenarioIdx];

  function reset(newScenario?: number) {
    setBridge(null); setFlowStep('pick'); setLoading(false);
    setFastForwarded(false); setErrorMsg(''); setTxHash(null);
    if (newScenario !== undefined) setScenarioIdx(newScenario);
  }

  function incompatibilityError(b: BridgeChoice): string | null {
    if (b === 'cctp' && scenario.asset === 'ETH')
      return 'CCTP only supports USDC — it cannot bridge ETH. Use Starkgate for ETH.';
    if (b === 'orbiter' && scenario.amount > 15000)
      return `Orbiter's per-transaction limit is ~$15,000. $${scenario.amount.toLocaleString()} would require ${Math.ceil(scenario.amount / 15000)} sequential transactions — use Starkgate instead.`;
    return null;
  }

  async function execute() {
    if (!bridge) return;
    const err = incompatibilityError(bridge);
    if (err) { setErrorMsg(err); setFlowStep('error'); return; }

    setLoading(true);
    setFlowStep('executing');
    await simulateDelay(900);

    if (bridge === 'starkgate') {
      // Show 12-hour countdown UI — learner fast-forwards
      setFlowStep('waiting');
      setLoading(false);
    } else {
      // CCTP ~8 min / Orbiter ~2 min — simulate with short delay
      await simulateDelay(1800);
      setTxHash(mockBridgeTxHash());
      setFlowStep('complete');
      setCompletedCount(c => c + 1);
      setLoading(false);
    }
  }

  function fastForward() {
    setFastForwarded(true);
    setTxHash(mockBridgeTxHash());
    setFlowStep('complete');
    setCompletedCount(c => c + 1);
  }

  const fee = bridge === 'starkgate' ? '$9 gas' :
              bridge === 'cctp' ? '$5 gas' :
              `$${(1.50 + scenario.amount * 0.0006).toFixed(2)}`;

  const trustModel = bridge === 'starkgate' ? 'Starknet STARK proof — no added trust' :
                     bridge === 'cctp' ? 'Circle attestation — burn-and-mint' :
                     'Third-party relayers';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🌉"
        title="ETH → Starknet Bridge Selector"
        subtitle="Pick the right bridge for each scenario. Wrong choices have consequences."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Scenario tabs */}
      <View style={{ gap: Spacing.xs }}>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SCENARIO</Text>
        {BRIDGE_SCENARIOS.map((sc, i) => (
          <TouchableOpacity
            key={i}
            style={[s.scenarioBtn, { borderColor: scenarioIdx === i ? colors.accent : colors.border,
              backgroundColor: scenarioIdx === i ? colors.accentSoft : colors.bgSecondary }]}
            onPress={() => reset(i)}
            disabled={flowStep !== 'pick' && scenarioIdx === i}
          >
            <Text style={[s.scenarioBtnTxt, { color: scenarioIdx === i ? colors.accent : colors.textSoft }]}>
              {sc.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bridge choice */}
      {flowStep === 'pick' && (
        <View style={{ gap: Spacing.xs }}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SELECT BRIDGE</Text>
          {(['starkgate', 'cctp', 'orbiter'] as BridgeChoice[]).map((b) => (
            <TouchableOpacity
              key={b}
              style={[s.bridgeCard, { borderColor: bridge === b ? colors.accent : colors.border,
                backgroundColor: bridge === b ? colors.accentSoft : colors.bgSecondary }]}
              onPress={() => setBridge(b)}
            >
              <Text style={[s.bridgeCardTitle, { color: bridge === b ? colors.accent : colors.text }]}>
                {b === 'starkgate' ? '🔐 Starkgate' : b === 'cctp' ? '🔥 CCTP' : '⚡ Orbiter'}
              </Text>
              <Text style={[s.bridgeCardSub, { color: colors.textSoft }]}>
                {b === 'starkgate' ? 'Canonical · Lock-and-mint · ~5 min deposit · 12 hr withdrawal' :
                 b === 'cctp' ? 'Burn-and-mint · USDC only · ~8 min' :
                 'Relayer · ETH/USDC · ~2 min · max ~$15K/tx'}
              </Text>
            </TouchableOpacity>
          ))}
          {bridge && (
            <ActionBtn label="Execute Bridge →" onPress={execute} loading={loading} variant="primary" colors={colors} />
          )}
        </View>
      )}

      {/* Executing */}
      {flowStep === 'executing' && (
        <View style={[s.statusBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <ActivityIndicator color={colors.accent} style={{ marginBottom: Spacing.sm }} />
          <Text style={[s.statusTxt, { color: colors.textSoft }]}>Initiating bridge transaction…</Text>
        </View>
      )}

      {/* 12-hour wait (Starkgate) */}
      {flowStep === 'waiting' && (
        <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
          <Text style={[s.alertTitle, { color: colors.accent }]}>⏳ STARK Proof Generation</Text>
          <Text style={[s.alertTxt, { color: colors.text, marginTop: Spacing.xs }]}>
            Estimated time: <Text style={{ fontWeight: '800' }}>up to 12 hours</Text>
          </Text>
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.xs }]}>
            A STARK validity proof is being generated and submitted to Ethereum L1.
            This is cryptographic security — not a performance limitation.
            Your Starknet funds are safe at L2 finality while you wait.
          </Text>
          <TouchableOpacity
            style={[s.fastFwdBtn, { borderColor: colors.gold, backgroundColor: colors.goldSoft }]}
            onPress={fastForward}
          >
            <Text style={[s.fastFwdTxt, { color: colors.gold }]}>
              ⏩ Fast-forward to completion (simulation — skip 12-hour wait)
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Error */}
      {flowStep === 'error' && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: colors.red + '40' }]}>
          <Text style={[s.alertTitle, { color: colors.red }]}>⚠ Wrong Bridge for This Asset</Text>
          <Text style={[s.alertTxt, { color: colors.red, marginTop: Spacing.xs }]}>{errorMsg}</Text>
          <TouchableOpacity onPress={() => reset(scenarioIdx)} style={{ marginTop: Spacing.md }}>
            <Text style={[s.linkTxt, { color: colors.accent }]}>← Try a different bridge</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Complete */}
      {flowStep === 'complete' && (
        <>
          <TxResult
            hash={txHash!}
            label={`Bridge via ${bridge === 'starkgate' ? 'Starkgate' : bridge === 'cctp' ? 'CCTP' : 'Orbiter'} — simulated`}
            colors={colors}
          />
          <InfoRow icon="🔐" label="Trust model" value={trustModel} colors={colors} />
          <InfoRow icon="💰" label="Fee paid" value={fee} colors={colors} />
          {fastForwarded && bridge === 'starkgate' && (
            <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
              <Text style={[s.alertTxt, { color: colors.gold }]}>
                ⚡ Simulation only — in production this withdrawal takes up to 12 hours.
                Plan Starkgate exits well in advance.
              </Text>
            </View>
          )}
          {completedCount < 3 ? (
            <ActionBtn label="Try next scenario →" onPress={() => reset((scenarioIdx + 1) % 3)} variant="primary" colors={colors} />
          ) : (
            <ActionBtn label="All scenarios complete →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
          <ActionBtn label="Retry this scenario" onPress={() => reset(scenarioIdx)} variant="ghost" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 3 — starkzap-bridge-route
// Solana → Starknet Route Planner
// ══════════════════════════════════════════════════════════════════════════════

type RouteAsset = 'USDC' | 'wSOL';
type RouteChoice = 'direct' | 'hop';

export function BridgeRouteSim({ onComplete, onSkip, colors }: SimProps) {
  const [asset, setAsset] = useState<RouteAsset>('USDC');
  const [amount, setAmount] = useState('20000');
  const [chosen, setChosen] = useState<RouteChoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [completedPairs, setCompletedPairs] = useState(new Set<string>());

  const amtNum = Math.max(1, parseFloat(amount) || 20000);

  const directFee = amtNum * 0.0005;
  const hopFee = asset === 'USDC' ? 5 : 21;
  const directMin = 9;
  const hopMin = asset === 'USDC' ? 14 : 24;

  const directTrust = asset === 'USDC'
    ? 'Circle attestation (CCTP integration) — identical to standard CCTP'
    : 'Hyperlane 6-of-10 validator multisig';
  const hopTrust = asset === 'USDC'
    ? 'Wormhole guardian set → Circle CCTP on final leg'
    : 'Wormhole guardian (13-of-19) → Starkgate STARK proof on Starknet leg';

  const cheaper: RouteChoice | 'equal' = directFee < hopFee ? 'direct' : directFee > hopFee ? 'hop' : 'equal';
  const safer: RouteChoice | 'equal' = asset === 'USDC' ? 'equal' : 'hop';

  const recommendation = () => {
    if (asset === 'USDC') return 'Both paths use CCTP for USDC — security is identical. Direct is slightly simpler.';
    if (amtNum < 10000) return 'Direct Hyperlane — fees proportionate, security adequate for this size.';
    if (directFee > hopFee) return 'Intermediate hop — cheaper AND provides Starkgate STARK proof on the final Starknet leg.';
    return 'Intermediate hop for amounts above ~$25K — Starkgate security on the final leg is worth the small premium.';
  };

  async function executeRoute() {
    setLoading(true);
    await simulateDelay(2000);
    setTxHash(mockBridgeTxHash());
    setDone(true);
    setCompletedPairs(prev => new Set(prev).add(`${asset}-${chosen}`));
    setLoading(false);
  }

  function reset() {
    setChosen(null); setDone(false); setTxHash(null);
  }

  const allFourSeen = completedPairs.size >= 3;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🔀"
        title="Solana → Starknet Route Planner"
        subtitle="Compare routes. Change asset and amount to see how the recommendation shifts."
        colors={colors}
      />
      <DemoBadge colors={colors} />

      {/* Asset toggle */}
      <View style={s.row}>
        {(['USDC', 'wSOL'] as RouteAsset[]).map((a) => (
          <TouchableOpacity
            key={a}
            style={[s.modeBtn, { borderColor: colors.border },
              asset === a && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
            onPress={() => { setAsset(a); reset(); }}
          >
            <Text style={[s.modeBtnTxt, { color: asset === a ? '#fff' : colors.textSoft }]}>{a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Amount input */}
      <View>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>AMOUNT (USD)</Text>
        <TextInput
          style={[s.input, { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.text }]}
          value={amount}
          onChangeText={(v) => { setAmount(v); reset(); }}
          keyboardType="numeric"
          placeholderTextColor={colors.textSoft}
          placeholder="e.g. 20000"
        />
      </View>

      {/* Route cards */}
      {!done && (
        <View style={{ gap: Spacing.sm }}>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SELECT ROUTE</Text>
          {(['direct', 'hop'] as RouteChoice[]).map((r) => {
            const isCheaper = cheaper === r;
            const isSafer = safer === r && asset !== 'USDC';
            return (
              <TouchableOpacity
                key={r}
                style={[s.bridgeCard, { borderColor: chosen === r ? colors.accent : colors.border,
                  backgroundColor: chosen === r ? colors.accentSoft : colors.bgSecondary }]}
                onPress={() => setChosen(r)}
              >
                <Text style={[s.bridgeCardTitle, { color: chosen === r ? colors.accent : colors.text }]}>
                  {r === 'direct' ? '⚡ Direct — Hyperlane' : `🔗 Intermediate Hop — ${asset === 'USDC' ? 'Wormhole + CCTP' : 'Wormhole + Starkgate'}`}
                </Text>
                <View style={[s.row, { marginTop: Spacing.xs }]}>
                  <Text style={[s.bridgeCardSub, { color: colors.textSoft, flex: 1 }]}>
                    ⏱ ~{r === 'direct' ? directMin : hopMin} min   💰 ${r === 'direct' ? directFee.toFixed(2) : hopFee.toFixed(2)}
                  </Text>
                  {isCheaper && <Text style={[s.badge, { backgroundColor: colors.greenSoft, color: colors.green }]}>Cheaper</Text>}
                  {isSafer && <Text style={[s.badge, { backgroundColor: colors.accentSoft, color: colors.accent }]}>Stronger</Text>}
                </View>
                <Text style={[s.bridgeCardSub, { color: colors.textSoft, marginTop: 2 }]}>
                  🔐 {r === 'direct' ? directTrust : hopTrust}
                </Text>
              </TouchableOpacity>
            );
          })}
          {chosen && (
            <ActionBtn label={`Execute ${chosen === 'direct' ? 'Direct' : 'Intermediate Hop'} →`}
              onPress={executeRoute} loading={loading} variant="primary" colors={colors} />
          )}
        </View>
      )}

      {/* Result */}
      {done && (
        <>
          <TxResult hash={txHash!} label={`Simulated ${chosen === 'direct' ? 'Hyperlane' : 'Wormhole + Starkgate'} route`} colors={colors} />
          <InfoRow icon="💰" label="Fee paid" value={`$${chosen === 'direct' ? directFee.toFixed(2) : hopFee.toFixed(2)}`} colors={colors} />
          <InfoRow icon="🔐" label="Trust model" value={chosen === 'direct' ? directTrust : hopTrust} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.text }]}>
              📋 At ${amtNum.toLocaleString()} {asset}: {recommendation()}
            </Text>
          </View>
          {asset === 'USDC' && (
            <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
              <Text style={[s.alertTxt, { color: colors.green }]}>
                USDC: both routes use the CCTP integration. Hyperlane validators are message
                routers — Circle's attestation service is the security gate regardless of path.
              </Text>
            </View>
          )}
          {!allFourSeen ? (
            <ActionBtn label="Try different asset / amount →" onPress={reset} variant="primary" colors={colors} />
          ) : (
            <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 4 — starkzap-bridge-calc
// Round-Trip Cost Calculator
// ══════════════════════════════════════════════════════════════════════════════

type CalcPreset = { label: string; principal: number; destApy: number; srcApy: number; days: number };

const CALC_PRESETS: CalcPreset[] = [
  { label: 'Small $1K test', principal: 1000, destApy: 20, srcApy: 5, days: 14 },
  { label: 'Medium $25K', principal: 25000, destApy: 14, srcApy: 6, days: 60 },
  { label: 'Large $80K', principal: 80000, destApy: 12, srcApy: 7, days: 90 },
];

export function BridgeCalcSim({ onComplete, onSkip, colors }: SimProps) {
  const [principal, setPrincipal] = useState(25000);
  const [destApy, setDestApy] = useState(14);
  const [srcApy, setSrcApy] = useState(6);
  const [days, setDays] = useState(60);
  const [entryCost, setEntryCost] = useState(5);
  const [exitCost, setExitCost] = useState(16);
  const [hasExplored, setHasExplored] = useState(false);
  const [hasSeenNotViable, setHasSeenNotViable] = useState(false);
  const [hasSeenViable, setHasSeenViable] = useState(false);

  const diff = Math.max(0, destApy - srcApy) / 100;
  const dailyYield = (principal * diff) / 365;
  const totalCost = entryCost + exitCost;
  const breakEvenDays = dailyYield > 0 ? totalCost / dailyYield : Infinity;
  const netAdvantage = dailyYield * days - totalCost;
  const viable = days > breakEvenDays && netAdvantage > 0;

  useEffect(() => {
    setHasExplored(true);
    if (!viable) setHasSeenNotViable(true);
    if (viable && netAdvantage > 50) setHasSeenViable(true);
  }, [principal, destApy, srcApy, days, entryCost, exitCost]);

  function applyPreset(p: CalcPreset) {
    setPrincipal(p.principal); setDestApy(p.destApy); setSrcApy(p.srcApy); setDays(p.days);
  }

  function NumInput({ label, value, onInc, onDec, display }: {
    label: string; value: number; display: string;
    onInc: () => void; onDec: () => void;
  }) {
    return (
      <View style={[s.numRow, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <Text style={[s.numLabel, { color: colors.textSoft }]}>{label}</Text>
        <TouchableOpacity onPress={onDec} style={s.numBtn}>
          <Text style={[s.numBtnTxt, { color: colors.accent }]}>−</Text>
        </TouchableOpacity>
        <Text style={[s.numVal, { color: colors.text }]}>{display}</Text>
        <TouchableOpacity onPress={onInc} style={s.numBtn}>
          <Text style={[s.numBtnTxt, { color: colors.accent }]}>+</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="🧮"
        title="Round-Trip Cost Calculator"
        subtitle="Find the break-even point before committing capital to a cross-chain strategy."
        colors={colors}
      />

      {/* Presets */}
      <View>
        <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LOAD PRESET</Text>
        <View style={s.row}>
          {CALC_PRESETS.map((p) => (
            <TouchableOpacity
              key={p.label}
              style={[s.presetBtn, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}
              onPress={() => applyPreset(p)}
            >
              <Text style={[s.presetBtnTxt, { color: colors.textSoft }]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Inputs */}
      <NumInput
        label="Principal"
        value={principal}
        display={`$${principal.toLocaleString()}`}
        onInc={() => setPrincipal(v => Math.min(v + 5000, 500000))}
        onDec={() => setPrincipal(v => Math.max(v - 5000, 500))}
      />
      <NumInput
        label="Destination APY"
        value={destApy}
        display={`${destApy}%`}
        onInc={() => setDestApy(v => Math.min(v + 1, 100))}
        onDec={() => setDestApy(v => Math.max(v - 1, 1))}
      />
      <NumInput
        label="Source APY (Ethereum)"
        value={srcApy}
        display={`${srcApy}%`}
        onInc={() => setSrcApy(v => Math.min(v + 1, destApy - 1))}
        onDec={() => setSrcApy(v => Math.max(v - 1, 0))}
      />
      <NumInput
        label="Hold duration"
        value={days}
        display={`${days} days`}
        onInc={() => setDays(v => Math.min(v + 5, 365))}
        onDec={() => setDays(v => Math.max(v - 5, 1))}
      />
      <View style={s.row}>
        <NumInput
          label="Entry cost $"
          value={entryCost}
          display={`$${entryCost}`}
          onInc={() => setEntryCost(v => v + 1)}
          onDec={() => setEntryCost(v => Math.max(v - 1, 1))}
        />
        <NumInput
          label="Exit cost $"
          value={exitCost}
          display={`$${exitCost}`}
          onInc={() => setExitCost(v => v + 1)}
          onDec={() => setExitCost(v => Math.max(v - 1, 1))}
        />
      </View>

      {/* Results */}
      <View style={[s.resultsBox, { borderColor: viable ? colors.green + '50' : colors.red + '50',
        backgroundColor: viable ? colors.greenSoft : colors.redSoft }]}>
        <InfoRow icon="📊" label="APY Differential" value={`${(destApy - srcApy).toFixed(1)}%`} colors={colors} />
        <InfoRow icon="💵" label="Daily Yield Advantage" value={`$${dailyYield.toFixed(2)}/day`} colors={colors} />
        <InfoRow icon="🏁" label="Round-Trip Cost" value={`$${totalCost}`} colors={colors} />
        <InfoRow
          icon="⏱"
          label="Break-Even"
          value={isFinite(breakEvenDays) ? `${breakEvenDays.toFixed(1)} days` : '∞ — no differential'}
          colors={colors}
        />
        <View style={[s.verdictBox, { backgroundColor: viable ? colors.green + '20' : colors.red + '20' }]}>
          <Text style={[s.verdictTxt, { color: viable ? colors.green : colors.red }]}>
            {viable
              ? `✅  Net advantage: $${netAdvantage.toFixed(2)} over ${days} days`
              : `❌  Not viable — ${days}d hold is below ${breakEvenDays.toFixed(1)}d break-even`}
          </Text>
        </View>
      </View>

      {hasSeenViable && hasSeenNotViable && (
        <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      )}
      {(!hasSeenViable || !hasSeenNotViable) && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!hasSeenNotViable
              ? 'Adjust inputs to see a ❌ not viable result, then continue.'
              : 'Adjust inputs to see a ✅ viable result, then continue.'}
          </Text>
        </View>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 5 — starkzap-bridge-register
// Multi-Chain Position Register + Rebalancing Threshold Tool
// ══════════════════════════════════════════════════════════════════════════════

type Chain = 'Ethereum' | 'Starknet' | 'Solana';
type RiskLevel = 'None' | 'Low' | 'Medium' | 'High';

interface Pos {
  id: string;
  name: string;
  chain: Chain;
  value: number;
  apy: number;
  bridge: string;
  risk: RiskLevel;
}

const BRIDGE_RISK: Record<string, RiskLevel> = {
  'None': 'None',
  'Starkgate': 'Low',
  'CCTP': 'Low',
  'Hyperlane CCTP': 'Low',
  'Hyperlane (non-USDC)': 'Medium',
  'Orbiter': 'Medium',
  'Third-party multisig': 'High',
};

const CHAIN_FINALITY: Record<Chain, string> = {
  Ethereum: '~15 min',
  Starknet: 'L2 ~30s · L1 up to 12 hrs',
  Solana: '< 1 sec',
};

const RISK_COLOR: Record<RiskLevel, string> = {
  None: '#6b7280',
  Low: '#22c55e',
  Medium: '#f59e0b',
  High: '#ef4444',
};

export function BridgeRegisterSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useAuth();
  const [positions, setPositions] = useState<Pos[]>([
    { id: '1', name: 'Ekubo LP', chain: 'Starknet', value: 50000, apy: 16, bridge: 'Starkgate', risk: 'Low' },
    { id: '2', name: 'Aave USDC', chain: 'Ethereum', value: 40000, apy: 6, bridge: 'None', risk: 'None' },
  ]);
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newChain, setNewChain] = useState<Chain>('Starknet');
  const [newBridge, setNewBridge] = useState('Starkgate');
  const [newValue, setNewValue] = useState('10000');
  const [newApy, setNewApy] = useState('12');

  // Rebalancing check
  const [rPrincipal, setRPrincipal] = useState(25000);
  const [rDest, setRDest] = useState(14);
  const [rSrc, setRSrc] = useState(6);
  const [rDays, setRDays] = useState(30);
  const [rCost, setRCost] = useState(22);

  const rDiff = Math.max(0, rDest - rSrc) / 100;
  const rGain = rPrincipal * rDiff * (rDays / 365);
  const rViable = rGain > rCost;

  const totalValue = positions.reduce((s, p) => s + p.value, 0);
  const bridgeExposed = positions.filter(p => p.risk !== 'None').reduce((s, p) => s + p.value, 0);
  const highRisk = positions.filter(p => p.risk === 'High').reduce((s, p) => s + p.value, 0);

  const [starknetBal, setStarknetBal] = useState<string | null>(null);
  const [loadingBal, setLoadingBal] = useState(false);

  async function fetchStarknetBalance() {
    setLoadingBal(true);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as unknown as StarkzapWallet;
        const bal = await w.balanceOf(STARKNET_TOKENS.STRK);
        setStarknetBal(bal.toFormatted());
      } catch { setStarknetBal(MOCK.strkBalance); }
    } else {
      await simulateDelay(800);
      setStarknetBal(MOCK.strkBalance);
    }
    setLoadingBal(false);
  }

  function addPosition() {
    const risk = BRIDGE_RISK[newBridge] ?? 'Medium';
    setPositions(prev => [...prev, {
      id: Date.now().toString(),
      name: newName || 'Position',
      chain: newChain,
      value: parseFloat(newValue) || 0,
      apy: parseFloat(newApy) || 0,
      bridge: newBridge,
      risk,
    }]);
    setShowAdd(false);
    setNewName(''); setNewValue('10000'); setNewApy('12');
  }

  const addedHighOrMedium = positions.some(p => p.risk === 'Medium' || p.risk === 'High');
  const hasRunRebal = rDays > 0;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader
        icon="📋"
        title="Multi-Chain Position Register"
        subtitle="Track bridge risk, settlement finality, and rebalancing thresholds across chains."
        colors={colors}
      />

      {/* Portfolio summary */}
      <View style={s.row}>
        {[
          { label: 'Portfolio', value: `$${totalValue.toLocaleString()}`, color: colors.text },
          { label: 'Bridge Exposed', value: `$${bridgeExposed.toLocaleString()}`, color: '#f59e0b' },
          { label: 'High Risk', value: highRisk > 0 ? `$${highRisk.toLocaleString()}` : '$0', color: highRisk > 0 ? '#ef4444' : '#22c55e' },
        ].map((s2) => (
          <View key={s2.label} style={[s.statBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
            <Text style={[s.statLabel, { color: colors.textSoft }]}>{s2.label}</Text>
            <Text style={[s.statValue, { color: s2.color }]}>{s2.value}</Text>
          </View>
        ))}
      </View>

      {/* Position list */}
      {positions.map((p) => (
        <View key={p.id} style={[s.posRow, { borderColor: RISK_COLOR[p.risk] + '40',
          backgroundColor: p.risk === 'High' ? colors.redSoft : p.risk === 'Medium' ? colors.goldSoft : colors.bgSecondary }]}>
          <View style={[s.row, { alignItems: 'flex-start' }]}>
            <View style={{ flex: 1 }}>
              <Text style={[s.posName, { color: colors.text }]}>{p.name}</Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>
                {p.chain} · {p.bridge} · {p.apy}% APY · ${p.value.toLocaleString()}
              </Text>
              <Text style={[s.posSub, { color: colors.textSoft }]}>
                Finality: {CHAIN_FINALITY[p.chain]}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 2 }}>
              <Text style={[s.riskBadge, { color: RISK_COLOR[p.risk] }]}>{p.risk}</Text>
              <TouchableOpacity onPress={() => setPositions(prev => prev.filter(x => x.id !== p.id))}>
                <Text style={{ color: colors.textSoft, fontSize: 11 }}>remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      ))}

      {/* Add position */}
      {!showAdd ? (
        <TouchableOpacity
          style={[s.addBtn, { borderColor: colors.accent, backgroundColor: colors.accentSoft }]}
          onPress={() => setShowAdd(true)}
        >
          <Text style={[s.addBtnTxt, { color: colors.accent }]}>+ Add Position</Text>
        </TouchableOpacity>
      ) : (
        <View style={[s.addForm, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
          <TextInput
            style={[s.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            value={newName} onChangeText={setNewName}
            placeholder="Position name" placeholderTextColor={colors.textSoft}
          />
          <View style={s.row}>
            {(['Ethereum', 'Starknet', 'Solana'] as Chain[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[s.toggleChip, { borderColor: newChain === c ? colors.accent : colors.border,
                  backgroundColor: newChain === c ? colors.accentSoft : 'transparent' }]}
                onPress={() => setNewChain(c)}
              >
                <Text style={[s.toggleChipTxt, { color: newChain === c ? colors.accent : colors.textSoft }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={s.row}>
            {Object.keys(BRIDGE_RISK).map((b) => (
              <TouchableOpacity
                key={b}
                style={[s.toggleChip, { borderColor: newBridge === b ? colors.accent : colors.border,
                  backgroundColor: newBridge === b ? colors.accentSoft : 'transparent' }]}
                onPress={() => setNewBridge(b)}
              >
                <Text style={[{ fontSize: 10, fontWeight: '600' }, { color: newBridge === b ? colors.accent : colors.textSoft }]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.autoRisk, { color: RISK_COLOR[BRIDGE_RISK[newBridge] ?? 'Medium'] }]}>
            Auto-risk: {BRIDGE_RISK[newBridge] ?? 'Medium'}
          </Text>
          <View style={s.row}>
            <TextInput
              style={[s.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newValue} onChangeText={setNewValue}
              keyboardType="numeric" placeholder="Value $" placeholderTextColor={colors.textSoft}
            />
            <TextInput
              style={[s.input, { flex: 1, backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
              value={newApy} onChangeText={setNewApy}
              keyboardType="numeric" placeholder="APY %" placeholderTextColor={colors.textSoft}
            />
          </View>
          <View style={s.row}>
            <ActionBtn label="Add" onPress={addPosition} variant="primary" colors={colors} />
            <ActionBtn label="Cancel" onPress={() => setShowAdd(false)} variant="ghost" colors={colors} />
          </View>
        </View>
      )}

      {/* Live Starknet balance */}
      <TouchableOpacity
        style={[s.balanceBtn, { borderColor: colors.accent + '50', backgroundColor: colors.accentSoft }]}
        onPress={fetchStarknetBalance}
        disabled={loadingBal}
      >
        {loadingBal
          ? <ActivityIndicator color={colors.accent} size="small" />
          : <Text style={[s.balanceBtnTxt, { color: colors.accent }]}>
              ⚡ {starknetBal ? `Starknet balance: ${starknetBal}` : 'Check real Starknet balance →'}
            </Text>}
      </TouchableOpacity>

      {/* Rebalancing threshold */}
      <View style={[s.rebalBox, { backgroundColor: colors.bgSecondary, borderColor: colors.border }]}>
        <Text style={[s.sectionLabel, { color: colors.textSoft, marginBottom: Spacing.sm }]}>REBALANCING THRESHOLD CHECK</Text>
        {[
          { label: 'Principal to move', value: rPrincipal, display: `$${rPrincipal.toLocaleString()}`,
            inc: () => setRPrincipal(v => v + 5000), dec: () => setRPrincipal(v => Math.max(v - 5000, 500)) },
          { label: 'Destination APY', value: rDest, display: `${rDest}%`,
            inc: () => setRDest(v => Math.min(v + 1, 60)), dec: () => setRDest(v => Math.max(v - 1, rSrc + 1)) },
          { label: 'Source APY', value: rSrc, display: `${rSrc}%`,
            inc: () => setRSrc(v => Math.min(v + 1, rDest - 1)), dec: () => setRSrc(v => Math.max(v - 1, 0)) },
          { label: 'Hold period (days)', value: rDays, display: `${rDays} days`,
            inc: () => setRDays(v => Math.min(v + 5, 365)), dec: () => setRDays(v => Math.max(v - 5, 1)) },
        ].map((row) => (
          <View key={row.label} style={[s.numRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
            <Text style={[s.numLabel, { color: colors.textSoft }]}>{row.label}</Text>
            <TouchableOpacity onPress={row.dec} style={s.numBtn}>
              <Text style={[s.numBtnTxt, { color: colors.accent }]}>−</Text>
            </TouchableOpacity>
            <Text style={[s.numVal, { color: colors.text }]}>{row.display}</Text>
            <TouchableOpacity onPress={row.inc} style={s.numBtn}>
              <Text style={[s.numBtnTxt, { color: colors.accent }]}>+</Text>
            </TouchableOpacity>
          </View>
        ))}
        <View style={[s.verdictBox, { backgroundColor: rViable ? colors.green + '20' : colors.red + '20',
          marginTop: Spacing.sm }]}>
          <Text style={[s.verdictTxt, { color: rViable ? colors.green : colors.red }]}>
            {rViable
              ? `✅  Rebalance justified — gain $${rGain.toFixed(2)} > cost $${rCost}`
              : `❌  Do not rebalance — gain $${rGain.toFixed(2)} < cost $${rCost}`}
          </Text>
        </View>
      </View>

      {addedHighOrMedium && hasRunRebal && (
        <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
      )}
      {(!addedHighOrMedium || !hasRunRebal) && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!addedHighOrMedium
              ? 'Add a Medium or High risk position to see how the register tracks it.'
              : 'Adjust the rebalancing values and observe the threshold verdict.'}
          </Text>
        </View>
      )}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ─── Shared StyleSheet ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  row:           { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sectionLabel:  { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 4 },
  modeBtn:       { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  modeBtnTxt:    { fontSize: FontSize.xs, fontWeight: '800', textAlign: 'center', lineHeight: 16 },
  statusBox:     { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  statusTxt:     { fontSize: FontSize.sm, fontWeight: '600', textAlign: 'center', lineHeight: 20 },
  alertBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  alertTitle:    { fontSize: FontSize.sm, fontWeight: '900' },
  alertTxt:      { fontSize: FontSize.sm, lineHeight: 20 },
  linkTxt:       { fontSize: FontSize.sm, fontWeight: '700' },
  fastFwdBtn:    { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', marginTop: Spacing.md },
  fastFwdTxt:    { fontSize: FontSize.xs, fontWeight: '700', textAlign: 'center' },
  scenarioBtn:   { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.md },
  scenarioBtnTxt:{ fontSize: FontSize.xs, fontWeight: '700' },
  bridgeCard:    { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  bridgeCardTitle:{ fontSize: FontSize.sm, fontWeight: '900' },
  bridgeCardSub: { fontSize: FontSize.xs, lineHeight: 18 },
  badge:         { borderRadius: Radius.full, paddingHorizontal: 8, paddingVertical: 2, fontSize: FontSize.xs, fontWeight: '800', overflow: 'hidden' },
  input:         { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, fontSize: FontSize.sm, marginBottom: 0 },
  numRow:        { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, gap: Spacing.sm },
  numLabel:      { flex: 1, fontSize: FontSize.xs },
  numBtn:        { paddingHorizontal: Spacing.md, paddingVertical: 4 },
  numBtnTxt:     { fontSize: FontSize.lg, fontWeight: '800', lineHeight: 20 },
  numVal:        { fontSize: FontSize.sm, fontWeight: '800', minWidth: 80, textAlign: 'center' },
  presetBtn:     { flex: 1, borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  presetBtnTxt:  { fontSize: 10, fontWeight: '700', textAlign: 'center' },
  resultsBox:    { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5, gap: Spacing.xs },
  verdictBox:    { borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  verdictTxt:    { fontSize: FontSize.sm, fontWeight: '900', textAlign: 'center' },
  posRow:        { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1.5 },
  posName:       { fontSize: FontSize.sm, fontWeight: '900' },
  posSub:        { fontSize: FontSize.xs, lineHeight: 18, marginTop: 2 },
  riskBadge:     { fontSize: FontSize.xs, fontWeight: '900' },
  addBtn:        { borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', borderStyle: 'dashed' },
  addBtnTxt:     { fontSize: FontSize.sm, fontWeight: '800' },
  addForm:       { borderWidth: 1, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  autoRisk:      { fontSize: FontSize.xs, fontWeight: '800' },
  toggleChip:    { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 4 },
  toggleChipTxt: { fontSize: 10, fontWeight: '700' },
  statBox:       { flex: 1, borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, alignItems: 'center' },
  statLabel:     { fontSize: 10, fontWeight: '600', marginBottom: 2 },
  statValue:     { fontSize: FontSize.md, fontWeight: '900' },
  balanceBtn:    { borderWidth: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center' },
  balanceBtnTxt: { fontSize: FontSize.xs, fontWeight: '700' },
  rebalBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, gap: Spacing.sm },
});
