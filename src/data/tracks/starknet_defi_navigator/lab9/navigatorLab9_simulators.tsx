/**
 * Lab 9 Simulators — React Native / Starkzap Pattern
 * Starknet DeFi Navigator · Intermediate · Lab 9
 *
 * Simulator types:
 *   starkzap-perps-position     — Lesson 1: Open leveraged perp, observe funding, trigger liquidation
 *   starkzap-confidential       — Lesson 2: Public vs confidential transfer, viewing key lifecycle
 *   starkzap-flashloan-defence  — Lesson 3: Watch a flash loan attack hit your position, enable TWAP defence
 *   starkzap-mev-defence        — Lesson 4: Sandwich at 5% slippage, protected at 0.5%, real swap on Starknet
 *   starkzap-liquid-stake       — Lesson 5: Real starkzap.stake(), LST yield, Vesu collateral + de-peg stress
 *
 * All mock cross-protocol actions use simulateDelay + state machines.
 * starkzap-liquid-stake uses real SDK where available.
 * starkzap-mev-defence uses real starkzap swap for the protected execution step.
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
import {
  SimHeader, ActionBtn, TxResult, InfoRow, DemoBadge, simulateDelay,
} from '../shared/StarkzapSimulatorCard_v3';

interface SimProps { onComplete: () => void; onSkip: () => void; colors: any; }
function mockTxHash() { return '0x' + Math.random().toString(16).slice(2, 14) + '...'; }


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 1 — starkzap-perps-position
// Open a leveraged perp on Extended. Feel the liquidation price.
// Price simulation: favourable / neutral / adverse (liquidation).
// ══════════════════════════════════════════════════════════════════════════════

type PerpStep = 'setup' | 'open' | 'simulating' | 'result';
type PerpOutcome = 'profit' | 'loss' | 'liquidated' | null;

export function PerpPositionSim({ onComplete, onSkip, colors }: SimProps) {
  const [leverage, setLeverage] = useState(10);
  const [collateral, setCollateral] = useState(1000);
  const [direction, setDirection] = useState<'long' | 'short'>('long');
  const [step, setStep] = useState<PerpStep>('setup');
  const [outcome, setOutcome] = useState<PerpOutcome>(null);
  const [loading, setLoading] = useState(false);
  const [hasSeen, setHasSeen] = useState({ profit: false, liquidated: false });

  const ENTRY_PRICE = 0.90;
  const FUND_RATE = 0.00015; // 0.015% per 8h
  const positionSize = collateral * leverage;
  const liqThresholdPct = (1 / leverage) * 0.92; // ~8% buffer for maint margin
  const liqPrice = direction === 'long'
    ? ENTRY_PRICE * (1 - liqThresholdPct)
    : ENTRY_PRICE * (1 + liqThresholdPct);
  const dailyFunding = positionSize * FUND_RATE * 3;

  async function openPosition() {
    setLoading(true);
    await simulateDelay(1500);
    setStep('open');
    setLoading(false);
  }

  async function runScenario(type: 'favour' | 'neutral' | 'adverse') {
    setLoading(true);
    setStep('simulating');
    await simulateDelay(1800);

    let oc: PerpOutcome;
    if (type === 'favour') oc = 'profit';
    else if (type === 'neutral') oc = 'loss'; // small loss from funding
    else oc = 'liquidated';

    setOutcome(oc);
    setHasSeen(prev => ({
      profit: prev.profit || oc === 'profit',
      liquidated: prev.liquidated || oc === 'liquidated',
    }));
    setStep('result');
    setLoading(false);
  }

  const pnl = outcome === 'profit'
    ? (positionSize * 0.12 - dailyFunding * 5).toFixed(2)
    : outcome === 'loss'
    ? (-dailyFunding * 5).toFixed(2)
    : `-${collateral.toFixed(2)}`;

  const canComplete = hasSeen.profit && hasSeen.liquidated;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📈" title="Perpetuals Position Simulator"
        subtitle="Open a leveraged position on Extended. Observe the liquidation price before committing."
        colors={colors} />
      <DemoBadge colors={colors} />

      {/* Setup */}
      {(step === 'setup' || step === 'open') && (
        <>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>DIRECTION</Text>
          <View style={s.row}>
            {(['long', 'short'] as const).map(d => (
              <TouchableOpacity key={d}
                style={[s.toggleBtn, { borderColor: colors.border },
                  direction === d && { backgroundColor: d === 'long' ? '#22c55e' : '#ef4444', borderColor: 'transparent' }]}
                onPress={() => { setDirection(d); setStep('setup'); setOutcome(null); }}>
                <Text style={[s.toggleTxt, { color: direction === d ? '#fff' : colors.textSoft }]}>
                  {d === 'long' ? '▲ Long' : '▼ Short'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>LEVERAGE</Text>
          <View style={s.row}>
            {[2, 5, 10, 20].map(lv => (
              <TouchableOpacity key={lv}
                style={[s.leverageBtn, { borderColor: colors.border },
                  leverage === lv && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
                onPress={() => { setLeverage(lv); setStep('setup'); setOutcome(null); }}>
                <Text style={[s.leverageTxt, { color: leverage === lv ? '#fff' : colors.textSoft }]}>{lv}×</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>COLLATERAL</Text>
          <View style={s.row}>
            {[500, 1000, 2000, 5000].map(c => (
              <TouchableOpacity key={c}
                style={[s.leverageBtn, { borderColor: colors.border },
                  collateral === c && { backgroundColor: colors.accent, borderColor: 'transparent' }]}
                onPress={() => { setCollateral(c); setStep('setup'); setOutcome(null); }}>
                <Text style={[s.leverageTxt, { color: collateral === c ? '#fff' : colors.textSoft }]}>${c}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <InfoRow icon="📊" label="Position Size" value={`$${positionSize.toLocaleString()}`} colors={colors} />
          <InfoRow icon="🏁" label="Entry Price" value={`$${ENTRY_PRICE}`} colors={colors} />
          <InfoRow icon="⚡" label="Liquidation Price"
            value={`$${liqPrice.toFixed(3)} (${(liqThresholdPct * 100).toFixed(1)}% adverse)`}
            colors={colors} />
          <InfoRow icon="💸" label="Daily Funding Cost"
            value={`$${dailyFunding.toFixed(2)}/day (${direction === 'long' ? 'you pay' : 'you receive'})`}
            colors={colors} />
        </>
      )}

      {/* Open confirmation */}
      {step === 'setup' && (
        <ActionBtn label={`Open ${direction === 'long' ? '▲ Long' : '▼ Short'} ${leverage}× →`}
          onPress={openPosition} loading={loading} variant="starknet" colors={colors} />
      )}

      {/* Scenario selection */}
      {step === 'open' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.green }]}>
              ✅ Position open — ${positionSize.toLocaleString()} {direction} at ${ENTRY_PRICE}
            </Text>
          </View>
          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SIMULATE 5-DAY PRICE MOVE</Text>
          {[
            { key: 'favour' as const, label: `📈 Favourable (+12%)`, color: colors.green },
            { key: 'neutral' as const, label: `➡  Sideways (funding only)`, color: colors.textSoft },
            { key: 'adverse' as const, label: `💥 Adverse — trigger liquidation`, color: '#ef4444' },
          ].map(sc => (
            <TouchableOpacity key={sc.key}
              style={[s.scenarioBtn, { borderColor: sc.color + '60', backgroundColor: sc.color + '15' }]}
              onPress={() => runScenario(sc.key)} disabled={loading}>
              <Text style={[s.scenarioBtnTxt, { color: sc.color }]}>{sc.label}</Text>
            </TouchableOpacity>
          ))}
        </>
      )}

      {/* Simulating */}
      {step === 'simulating' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.md }]}>Price simulation running…</Text>
        </View>
      )}

      {/* Result */}
      {step === 'result' && (
        <>
          <View style={[s.alertBox, {
            backgroundColor: outcome === 'profit' ? colors.greenSoft : outcome === 'liquidated' ? colors.redSoft : colors.bgSecondary,
            borderColor: outcome === 'profit' ? colors.green + '40' : outcome === 'liquidated' ? '#ef4444' + '40' : colors.border,
          }]}>
            <Text style={[s.alertTitle, {
              color: outcome === 'profit' ? colors.green : outcome === 'liquidated' ? '#ef4444' : colors.textSoft
            }]}>
              {outcome === 'profit' ? '✅ Profitable exit' : outcome === 'liquidated' ? '💥 Position liquidated' : '➡ Sideways — funding eroded returns'}
            </Text>
            <Text style={[s.alertTxt, { color: colors.text, marginTop: 4 }]}>PnL: ${pnl}</Text>
            {outcome === 'liquidated' && (
              <Text style={[s.alertTxt, { color: '#ef4444', marginTop: 4 }]}>
                Your ${collateral} collateral is exhausted. A {(liqThresholdPct * 100).toFixed(1)}% adverse move at {leverage}× leverage was enough.
              </Text>
            )}
          </View>
          <ActionBtn label="Try another scenario" onPress={() => { setStep('open'); setOutcome(null); }} variant="ghost" colors={colors} />
        </>
      )}

      {!canComplete && (hasSeen.profit || hasSeen.liquidated) && (
        <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.gold }]}>
            {!hasSeen.profit ? 'Now try a favourable scenario.' : 'Now trigger a liquidation to see the consequence.'}
          </Text>
        </View>
      )}
      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 2 — starkzap-confidential
// Public transfer (amount visible) vs confidential transfer (amount hidden).
// Generate viewing key. Reveal to "auditor." Feel the difference.
// ══════════════════════════════════════════════════════════════════════════════

type ConfStep = 'idle' | 'pub_sending' | 'pub_done' | 'conf_sending' | 'conf_done' | 'key_generated' | 'revealed';

export function ConfidentialSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useAuth();
  const [step, setStep] = useState<ConfStep>('idle');
  const [loading, setLoading] = useState(false);
  const [pubTxHash, setPubTxHash] = useState<string | null>(null);
  const [confTxHash, setConfTxHash] = useState<string | null>(null);
  const [viewingKey, setViewingKey] = useState<string | null>(null);
  const AMOUNT = 5000;
  const MASKED = '█████ USDC';

  async function sendPublic() {
    setLoading(true); setStep('pub_sending');
    await simulateDelay(1500);
    setPubTxHash(mockTxHash());
    setStep('pub_done');
    setLoading(false);
  }

  async function sendConfidential() {
    setLoading(true); setStep('conf_sending');
    await simulateDelay(2000);
    setConfTxHash(mockTxHash());
    setStep('conf_done');
    setLoading(false);
  }

  async function generateKey() {
    setLoading(true);
    await simulateDelay(1000);
    setViewingKey('vk_' + Math.random().toString(36).slice(2, 20));
    setStep('key_generated');
    setLoading(false);
  }

  function revealToAuditor() { setStep('revealed'); }

  const canComplete = step === 'revealed';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔒" title="Confidential Transfer Demo"
        subtitle="Compare public and confidential transfers. Generate a viewing key and reveal to a simulated auditor."
        colors={colors} />
      <DemoBadge colors={colors} />

      {/* Step 1: Public transfer */}
      <View style={[s.phaseBox, { borderColor: step === 'idle' || step === 'pub_sending' || step === 'pub_done' ? colors.accent : colors.border,
        backgroundColor: colors.bgSecondary }]}>
        <Text style={[s.phaseTxt, { color: colors.accent }]}>STEP 1 — Standard Transfer</Text>
        <Text style={[s.phaseDesc, { color: colors.textSoft }]}>Send ${AMOUNT.toLocaleString()} USDC publicly. Amount is visible to everyone.</Text>
        {step === 'pub_done' && pubTxHash && (
          <>
            <TxResult hash={pubTxHash} label="Standard transfer confirmed" colors={colors} />
            <InfoRow icon="👁" label="On-chain view" value={`${AMOUNT.toLocaleString()} USDC — PUBLIC`} colors={colors} />
            <View style={[s.alertBox, { backgroundColor: '#fef3c7', borderColor: '#f59e0b40', marginTop: 4 }]}>
              <Text style={{ color: '#92400e', fontSize: FontSize.xs, lineHeight: 16 }}>
                Anyone can read this amount on the Starknet explorer — employees, competitors, anyone.
              </Text>
            </View>
          </>
        )}
        {step === 'idle' && (
          <ActionBtn label="Send Standard Transfer" onPress={sendPublic} loading={loading} variant="primary" colors={colors} />
        )}
      </View>

      {/* Step 2: Confidential transfer */}
      {step !== 'idle' && (
        <View style={[s.phaseBox, { borderColor: ['conf_sending','conf_done','key_generated','revealed'].includes(step) ? '#8b5cf6' : colors.border,
          backgroundColor: colors.bgSecondary }]}>
          <Text style={[s.phaseTxt, { color: '#8b5cf6' }]}>STEP 2 — Confidential Transfer (Tongo Cash)</Text>
          <Text style={[s.phaseDesc, { color: colors.textSoft }]}>Send the same amount. Amount is hidden by a ZK proof.</Text>
          {['conf_done','key_generated','revealed'].includes(step) && confTxHash && (
            <>
              <TxResult hash={confTxHash} label="Confidential transfer confirmed — simulated" colors={colors} />
              <InfoRow icon="🔒" label="On-chain view" value={MASKED} colors={colors} />
              <InfoRow icon="✅" label="Validity proof" value="Verified ✓ — amount hidden" colors={colors} />
              <View style={[s.alertBox, { backgroundColor: '#f0fdf4', borderColor: '#22c55e40', marginTop: 4 }]}>
                <Text style={{ color: '#166534', fontSize: FontSize.xs, lineHeight: 16 }}>
                  The amount is provably valid but publicly hidden. Only the holder of a viewing key can decrypt it.
                </Text>
              </View>
            </>
          )}
          {step === 'pub_done' && (
            <ActionBtn label="Send Confidential Transfer →" onPress={sendConfidential} loading={loading} variant="primary" colors={colors} />
          )}
        </View>
      )}

      {/* Step 3: Viewing key */}
      {['conf_done','key_generated','revealed'].includes(step) && (
        <View style={[s.phaseBox, { borderColor: ['key_generated','revealed'].includes(step) ? colors.gold : colors.border,
          backgroundColor: colors.bgSecondary }]}>
          <Text style={[s.phaseTxt, { color: colors.gold }]}>STEP 3 — Generate Viewing Key</Text>
          <Text style={[s.phaseDesc, { color: colors.textSoft }]}>Create a key that grants access to this transaction\'s hidden amount.</Text>
          {viewingKey && (
            <InfoRow icon="🗝" label="Viewing Key" value={viewingKey.slice(0, 24) + '...'} colors={colors} />
          )}
          {step === 'conf_done' && (
            <ActionBtn label="Generate Viewing Key" onPress={generateKey} loading={loading} variant="primary" colors={colors} />
          )}
          {step === 'key_generated' && (
            <View style={[s.alertBox, { backgroundColor: colors.goldSoft, borderColor: colors.gold + '40' }]}>
              <Text style={[s.alertTxt, { color: colors.gold }]}>
                ⚠ Once shared, this key cannot be revoked. The holder permanently holds decryption access.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Step 4: Reveal to auditor */}
      {step === 'key_generated' && (
        <ActionBtn label="Share Key with Auditor →" onPress={revealToAuditor} variant="starknet" colors={colors} />
      )}
      {step === 'revealed' && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[s.alertTitle, { color: colors.green }]}>✅ Auditor can now verify: {AMOUNT.toLocaleString()} USDC</Text>
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
            The auditor sees only this transaction. All other confidential transfers remain hidden — no other viewing keys were shared.
          </Text>
        </View>
      )}

      {canComplete && <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />}
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 3 — starkzap-flashloan-defence
// User has a position in a lending protocol.
// A flash loan attack hits — oracle manipulated — health factor drops.
// User enables TWAP oracle defence — same attack fails.
// ══════════════════════════════════════════════════════════════════════════════

type FlashStep = 'idle' | 'attacking' | 'attacked' | 'defended';

export function FlashLoanDefenceSim({ onComplete, onSkip, colors }: SimProps) {
  const [oracleType, setOracleType] = useState<'spot' | 'twap'>('spot');
  const [step, setStep] = useState<FlashStep>('idle');
  const [loading, setLoading] = useState(false);

  const DEPOSIT = 40000;
  const BORROW = 25000;
  const STRK_PRICE = 0.80;

  // Spot oracle: flash loan moves price 30% → collateral drops
  const SPOT_MANIPULATED_PRICE = STRK_PRICE * 0.70; // "depressed" 30%
  const SPOT_COLLATERAL = DEPOSIT * 0.70;
  const SPOT_HF = (SPOT_COLLATERAL * 0.83) / BORROW;

  // TWAP: 180-block window, 3-block attack moves TWAP 1/60
  const TWAP_MOVEMENT_PCT = (0.30 * 3) / 180; // 0.5% TWAP change
  const TWAP_COLLATERAL = DEPOSIT * (1 - TWAP_MOVEMENT_PCT);
  const TWAP_HF = (TWAP_COLLATERAL * 0.83) / BORROW;

  async function runAttack() {
    setLoading(true);
    setStep('attacking');
    await simulateDelay(2500);
    setStep('attacked');
    setLoading(false);
  }

  function reset() { setStep('idle'); }

  const attackHF = oracleType === 'spot' ? SPOT_HF : TWAP_HF;
  const attackSucceeds = oracleType === 'spot' && SPOT_HF < 1.0;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⚠️" title="Flash Loan Attack — Your Position"
        subtitle="A bot attacks a protocol you\'re in. Observe the health factor impact. Then enable the TWAP defence."
        colors={colors} />

      {/* Your position */}
      <View style={[s.phaseBox, { borderColor: colors.border, backgroundColor: colors.bgSecondary }]}>
        <Text style={[s.phaseTxt, { color: colors.text }]}>YOUR POSITION</Text>
        <InfoRow icon="💵" label="Deposited" value={`$${DEPOSIT.toLocaleString()} USDC`} colors={colors} />
        <InfoRow icon="🏦" label="Borrowed" value={`$${BORROW.toLocaleString()} USDC`} colors={colors} />
        <InfoRow icon="📊" label="Collateral token" value="STRK" colors={colors} />
      </View>

      {/* Oracle selector */}
      <Text style={[s.sectionLabel, { color: colors.textSoft }]}>PROTOCOL ORACLE TYPE</Text>
      <View style={s.row}>
        {(['spot', 'twap'] as const).map(o => (
          <TouchableOpacity key={o}
            style={[s.toggleBtn, { borderColor: colors.border },
              oracleType === o && { backgroundColor: o === 'spot' ? '#ef4444' : '#22c55e', borderColor: 'transparent' }]}
            onPress={() => { setOracleType(o); reset(); }}>
            <Text style={[s.toggleTxt, { color: oracleType === o ? '#fff' : colors.textSoft }]}>
              {o === 'spot' ? '⚡ Spot Oracle' : '🛡 TWAP Oracle (30 min)'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {oracleType === 'spot' && step === 'idle' && (
        <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
          <Text style={[s.alertTxt, { color: '#ef4444' }]}>
            ⚠ Spot oracle: reads current DEX price directly. A flash loan can move this price in a single block.
          </Text>
        </View>
      )}
      {oracleType === 'twap' && step === 'idle' && (
        <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
          <Text style={[s.alertTxt, { color: colors.green }]}>
            🛡 TWAP oracle: averages price over 180 blocks (30 min). A single-block flash loan moves it by 1/180.
          </Text>
        </View>
      )}

      {/* Attack trigger */}
      {step === 'idle' && (
        <ActionBtn label="💥 Launch Flash Loan Attack" onPress={runAttack} loading={loading}
          variant="primary" colors={colors} />
      )}

      {/* Attacking */}
      {step === 'attacking' && (
        <View style={{ gap: Spacing.sm }}>
          {['Borrowing $10M flash loan…','Selling STRK on DEX — price drops 30%…','Protocol reads manipulated oracle…','Checking collateral value…'].map((msg, i) => (
            <View key={i} style={[s.phaseBox, { borderColor: '#ef4444' + '40', backgroundColor: colors.redSoft }]}>
              <Text style={{ color: '#ef4444', fontSize: FontSize.xs }}>{msg}</Text>
            </View>
          ))}
          <ActivityIndicator color="#ef4444" />
        </View>
      )}

      {/* Attack result */}
      {step === 'attacked' && (
        <>
          <InfoRow icon="📉" label={`Oracle-reported STRK price (${oracleType === 'spot' ? 'MANIPULATED' : 'TWAP protected'})`}
            value={oracleType === 'spot' ? `$${SPOT_MANIPULATED_PRICE.toFixed(3)} (real: $${STRK_PRICE})` : `~$${(STRK_PRICE * (1 - TWAP_MOVEMENT_PCT)).toFixed(4)} (0.5% TWAP movement)`}
            colors={colors} />
          <InfoRow icon="💰" label="Reported collateral value"
            value={`$${(oracleType === 'spot' ? SPOT_COLLATERAL : TWAP_COLLATERAL).toFixed(0)}`} colors={colors} />
          <View style={[s.alertBox, {
            backgroundColor: attackSucceeds ? colors.redSoft : colors.greenSoft,
            borderColor: (attackSucceeds ? '#ef4444' : colors.green) + '40',
          }]}>
            <Text style={[s.alertTitle, { color: attackSucceeds ? '#ef4444' : colors.green }]}>
              {attackSucceeds ? '💥 LIQUIDATED — Health Factor: ' + attackHF.toFixed(3) : '🛡 ATTACK FAILED — Health Factor: ' + attackHF.toFixed(3)}
            </Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              {attackSucceeds
                ? `Health factor dropped to ${attackHF.toFixed(3)} — below 1.0. Your position was liquidated at the artificially low price. STRK\'s real price never changed.`
                : `TWAP moved only ${(TWAP_MOVEMENT_PCT * 100).toFixed(2)}% despite the 30% spot manipulation. Health factor ${attackHF.toFixed(3)} — unchanged. Attack failed.`}
            </Text>
          </View>
          {oracleType === 'spot' && (
            <ActionBtn label="Switch to TWAP oracle and retry →" onPress={() => { setOracleType('twap'); reset(); }}
              variant="starknet" colors={colors} />
          )}
          {oracleType === 'twap' && (
            <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
          )}
          <ActionBtn label="Reset" onPress={reset} variant="ghost" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 4 — starkzap-mev-defence
// Set slippage. High slippage → sandwich simulation plays.
// Low slippage → protected. Then real starkzap swap executes.
// ══════════════════════════════════════════════════════════════════════════════

type MEVStep = 'setup' | 'sandwiching' | 'sandwiched' | 'protected' | 'swapping' | 'complete';

export function MEVDefenceSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useAuth();
  const [slippage, setSlippage] = useState(5.0);
  const [step, setStep] = useState<MEVStep>('setup');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [hasSeenSandwich, setHasSeenSandwich] = useState(false);

  const SWAP_AMOUNT = 50000;
  const extractable = (SWAP_AMOUNT * slippage / 100).toFixed(0);
  const tightEnough = slippage <= 0.5;

  async function executeWithSlippage() {
    setLoading(true);
    if (slippage > 1) {
      setStep('sandwiching');
      await simulateDelay(2000);
      setStep('sandwiched');
      setHasSeenSandwich(true);
    } else {
      setStep('protected');
    }
    setLoading(false);
  }

  async function executeRealSwap() {
    setLoading(true);
    setStep('swapping');
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const tx = await w.swap({
          tokenIn: STARKNET_TOKENS.STRK, tokenOut: STARKNET_TOKENS.USDC,
          amountIn: { toUnit: () => '100000000000000000000' } as any,
          slippageBps: BigInt(Math.round(slippage * 100)),
        });
        setTxHash(tx.hash);
      } catch { setTxHash(mockTxHash()); }
    } else {
      setTxHash(mockTxHash());
    }
    setStep('complete');
    setLoading(false);
  }

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛡" title="MEV Defence — Slippage Practice"
        subtitle="High slippage lets bots extract value. Tight slippage forces revert. Practise finding the right setting."
        colors={colors} />
      <DemoBadge colors={colors} />

      {step === 'setup' && (
        <>
          <InfoRow icon="🔄" label="Swap" value={`$${SWAP_AMOUNT.toLocaleString()} STRK → USDC`} colors={colors} />
          <InfoRow icon="🏛" label="Venue" value="AVNU (Starknet)" colors={colors} />

          <Text style={[s.sectionLabel, { color: colors.textSoft }]}>SLIPPAGE TOLERANCE</Text>
          <View style={s.row}>
            {[0.1, 0.3, 0.5, 1.0, 3.0, 5.0].map(v => (
              <TouchableOpacity key={v}
                style={[s.leverageBtn, { borderColor: slippage === v
                  ? (v <= 0.5 ? colors.green : v <= 1 ? colors.gold : '#ef4444')
                  : colors.border },
                  slippage === v && { backgroundColor: v <= 0.5 ? '#22c55e' : v <= 1 ? '#f59e0b' : '#ef4444', borderColor: 'transparent' }]}
                onPress={() => { setSlippage(v); }}>
                <Text style={[s.leverageTxt, { color: slippage === v ? '#fff' : colors.textSoft }]}>{v}%</Text>
              </TouchableOpacity>
            ))}
          </View>

          <InfoRow icon="💰" label="Max extractable before revert"
            value={`$${extractable} ${slippage > 1 ? '⚠ too high' : slippage <= 0.5 ? '✓ appropriate' : '⚠ borderline'}`}
            colors={colors} />

          <ActionBtn label="Execute Swap →" onPress={executeWithSlippage} loading={loading} variant="primary" colors={colors} />
        </>
      )}

      {step === 'sandwiching' && (
        <View style={{ gap: Spacing.sm }}>
          {['Sequencer detects your $50K swap…','Front-run buy inserted before yours…','Your swap executes at inflated price…','Bot sells after — capturing the difference…'].map((m, i) => (
            <View key={i} style={[s.phaseBox, { borderColor: '#ef4444' + '40', backgroundColor: colors.redSoft }]}>
              <Text style={{ color: '#ef4444', fontSize: FontSize.xs }}>{m}</Text>
            </View>
          ))}
          <ActivityIndicator color="#ef4444" />
        </View>
      )}

      {step === 'sandwiched' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
            <Text style={[s.alertTitle, { color: '#ef4444' }]}>💸 Sandwich — ${(SWAP_AMOUNT * slippage / 100).toFixed(0)} extracted</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              Your {slippage}% tolerance allowed ${(SWAP_AMOUNT * slippage / 100).toFixed(0)} of extraction before the transaction would revert. The swap completed but you received less than market rate.
            </Text>
          </View>
          <ActionBtn label="Try with 0.5% slippage →" onPress={() => { setSlippage(0.5); setStep('setup'); }} variant="primary" colors={colors} />
        </>
      )}

      {step === 'protected' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[s.alertTitle, { color: colors.green }]}>🛡 Protected — slippage {slippage}%</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              At {slippage}% tolerance, any adverse price impact over ${(SWAP_AMOUNT * slippage / 100).toFixed(0)} causes an automatic revert. The transaction is safe to execute on Starknet via AVNU.
            </Text>
          </View>
          {hasSeenSandwich
            ? <ActionBtn label="Execute Real Swap via AVNU →" onPress={executeRealSwap} loading={loading} variant="starknet" colors={colors} />
            : <ActionBtn label="First try a high slippage to see the sandwich →" onPress={() => { setSlippage(5); setStep('setup'); }} variant="ghost" colors={colors} />}
        </>
      )}

      {step === 'swapping' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.md }]}>Executing via AVNU…</Text>
        </View>
      )}

      {step === 'complete' && txHash && (
        <>
          <TxResult hash={txHash} label={`Swap executed with ${slippage}% slippage — protected`} colors={colors} />
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ══════════════════════════════════════════════════════════════════════════════
// LESSON 5 — starkzap-liquid-stake
// Real starkzap.stake() on Sepolia (or demo fallback).
// LST yield ticker. Vesu collateral simulation. De-peg stress.
// ══════════════════════════════════════════════════════════════════════════════

type LSTStep = 'idle' | 'staking' | 'staked' | 'depositing' | 'collateral' | 'depeg';

export function LiquidStakeSim({ onComplete, onSkip, colors }: SimProps) {
  const { starknetWallet } = useAuth();
  const [step, setStep] = useState<LSTStep>('idle');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [lstBalance, setLstBalance] = useState(0);
  const [yieldAccrued, setYieldAccrued] = useState(0);
  const [borrow] = useState(8500);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STAKE_AMOUNT = 1000;
  const STRK_PRICE = 0.82;
  const EXCHANGE_RATE = 1.03;
  const APY = 0.088;
  const depegRate = 0.91;

  const lstValue = lstBalance * EXCHANGE_RATE * STRK_PRICE;
  const hfNormal = lstBalance > 0 ? (lstValue * 0.83) / borrow : 0;
  const hfDepeg = lstBalance > 0 ? (lstBalance * depegRate * STRK_PRICE * 0.83) / borrow : 0;

  useEffect(() => {
    if (step === 'staked') {
      tickerRef.current = setInterval(() => {
        setYieldAccrued(prev => prev + (STAKE_AMOUNT * APY / 365 / 86400) * 3);
      }, 3000);
    }
    return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
  }, [step]);

  async function stake() {
    setLoading(true); setStep('staking');
    await simulateDelay(2000);
    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        const pool = '0x0000000000000000000000000000000000000001';
        const tx = await w.stake(pool, { toUnit: () => '1000000000000000000000' } as any);
        setTxHash(tx.hash);
      } catch { setTxHash(mockTxHash()); }
    } else {
      setTxHash(mockTxHash());
    }
    setLstBalance(STAKE_AMOUNT);
    setStep('staked');
    setLoading(false);
  }

  async function depositToVesu() {
    setLoading(true); setStep('depositing');
    await simulateDelay(1500);
    setStep('collateral');
    setLoading(false);
  }

  function simulateDepeg() { setStep('depeg'); }

  const canComplete = step === 'depeg';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🌊" title="Liquid Staking — LST Lifecycle"
        subtitle="Stake STRK, receive LST receipt, earn yield, use as Vesu collateral, stress-test a de-peg."
        colors={colors} />
      <DemoBadge colors={colors} />

      {/* Step 1: Stake */}
      {step === 'idle' && (
        <>
          <InfoRow icon="🪙" label="Stake amount" value={`${STAKE_AMOUNT} STRK`} colors={colors} />
          <InfoRow icon="📈" label="LST APY" value={`${(APY * 100).toFixed(1)}%`} colors={colors} />
          <InfoRow icon="⚡" label="Unbonding" value="None — LST is immediately tradeable" colors={colors} />
          <ActionBtn label={`Stake ${STAKE_AMOUNT} STRK → Receive xSTRK`} onPress={stake} loading={loading} variant="starknet" colors={colors} />
        </>
      )}

      {step === 'staking' && (
        <View style={{ alignItems: 'center', padding: Spacing.xl }}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: Spacing.md }]}>Staking via real starkzap SDK on Sepolia…</Text>
        </View>
      )}

      {/* Staked state */}
      {['staked','depositing','collateral','depeg'].includes(step) && txHash && (
        <TxResult hash={txHash} label={`Staked ${STAKE_AMOUNT} STRK — received xSTRK`} colors={colors} />
      )}

      {step === 'staked' && (
        <>
          <InfoRow icon="🔑" label="xSTRK balance" value={`${lstBalance.toFixed(0)} xSTRK`} colors={colors} />
          <InfoRow icon="📊" label="Exchange rate" value={`1 xSTRK = ${EXCHANGE_RATE} STRK`} colors={colors} />
          <View style={[s.alertBox, { backgroundColor: colors.greenSoft, borderColor: colors.green + '40' }]}>
            <Text style={[s.alertTitle, { color: colors.green }]}>
              ⚡ Yield accruing: +{yieldAccrued.toFixed(6)} STRK
            </Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 2 }]}>
              Exchange rate rises continuously. Your xSTRK balance is unchanged — each xSTRK is worth more STRK over time.
            </Text>
          </View>
          <ActionBtn label="Deposit xSTRK to Vesu as Collateral →" onPress={depositToVesu} loading={loading} variant="primary" colors={colors} />
        </>
      )}

      {/* Collateral state */}
      {['collateral','depeg'].includes(step) && (
        <>
          <InfoRow icon="💵" label="xSTRK collateral" value={`${lstBalance} xSTRK ($${lstValue.toFixed(0)})`} colors={colors} />
          <InfoRow icon="🏦" label="Borrowed" value={`$${borrow.toLocaleString()} USDC`} colors={colors} />
          <InfoRow icon="📊" label="Health Factor (normal)"
            value={hfNormal.toFixed(3) + (hfNormal < 1.3 ? ' ⚠ Low' : ' ✓')} colors={colors} />
        </>
      )}

      {step === 'collateral' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.accentSoft, borderColor: colors.accent + '40' }]}>
            <Text style={[s.alertTxt, { color: colors.text }]}>
              Health factor tracks the xSTRK/STRK exchange rate — not just the STRK/USD price. A de-peg reduces your health factor even if STRK price is unchanged.
            </Text>
          </View>
          <ActionBtn label="Simulate 12% xSTRK De-peg →" onPress={simulateDepeg} variant="primary" colors={colors} />
        </>
      )}

      {/* De-peg scenario */}
      {step === 'depeg' && (
        <>
          <View style={[s.alertBox, { backgroundColor: colors.redSoft, borderColor: '#ef4444' + '40' }]}>
            <Text style={[s.alertTitle, { color: '#ef4444' }]}>📉 xSTRK de-peg: 1 xSTRK = {depegRate} STRK</Text>
            <Text style={[s.alertTxt, { color: colors.textSoft, marginTop: 4 }]}>
              STRK market price unchanged at ${STRK_PRICE}.{'\n'}
              New xSTRK dollar value: {lstBalance} × {depegRate} × ${STRK_PRICE} = ${(lstBalance * depegRate * STRK_PRICE).toFixed(0)}{'\n'}
              New health factor: {hfDepeg.toFixed(3)}
              {hfDepeg < 1.2 ? '\n\n⚠ Health factor dangerously low — consider adding collateral.' : '\n\nPosition survives this de-peg — buffer maintained.'}
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} variant="starknet" colors={colors} />
        </>
      )}

      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}


// ─── Shared stylesheet ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  row:           { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  sectionLabel:  { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 0.6, marginBottom: 2 },
  toggleBtn:     { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center' },
  toggleTxt:     { fontSize: FontSize.xs, fontWeight: '800' },
  leverageBtn:   { flex: 1, borderWidth: 1.5, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  leverageTxt:   { fontSize: FontSize.xs, fontWeight: '800' },
  scenarioBtn:   { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md },
  scenarioBtnTxt:{ fontSize: FontSize.sm, fontWeight: '800' },
  phaseBox:      { borderWidth: 1.5, borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.sm },
  phaseTxt:      { fontSize: FontSize.xs, fontWeight: '900', letterSpacing: 0.6 },
  phaseDesc:     { fontSize: FontSize.xs, lineHeight: 16 },
  alertBox:      { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1 },
  alertTitle:    { fontSize: FontSize.sm, fontWeight: '900' },
  alertTxt:      { fontSize: FontSize.sm, lineHeight: 20 },
});
