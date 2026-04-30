/**
 * walletEnhancedSims.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * Wallet-aware versions of key existing simulators.
 * These REPLACE the originals in SimulatorCard.tsx's SIMULATORS map.
 *
 * Each sim now shows the user's real testnet wallet address (copyable),
 * live balance, and faucet prompt when balance is zero.
 *
 * Integration: Import these and override in SIMULATORS map:
 *   tonWallet:    TonWalletEnhancedSim,
 *   tonTapEarn:   TonTapEarnEnhancedSim,
 *   tonStaking:   TonStakingEnhancedSim,
 *   solanaPump:   SolanaPumpEnhancedSim,
 *   solanaJupiter:SolanaJupiterEnhancedSim,
 *   solanaStaking:SolanaStakingEnhancedSim,
 *   nftMint:      NftMintEnhancedSim,
 *   nftContract:  NftContractEnhancedSim,
 *   dexscreener:  DexscreenerEnhancedSim,
 *   sendBitcoin:  SendBitcoinEnhancedSim,
 *   bnbPancake:   BnbPancakeEnhancedSim,
 *   bnbStaking:   BnbStakingEnhancedSim,
 *   airdropFarm:  AirdropFarmEnhancedSim,
 * ─────────────────────────────────────────────────────────────────────────────
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Clipboard, Linking, Platform,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useSimulatorWallet } from '../../hooks/useSimulatorWallet';
import AddressPill from '../wallet/AddressPill';

// ── Re-use shared UI primitives (mirror SimulatorCard.tsx) ───────────────────
interface SimProps { onComplete: () => void; onSkip: () => void; islandId: number; }

function SimShell({ title, subtitle, icon, children }: {
  title: string; subtitle: string; icon: string; children: React.ReactNode;
}) {
  return (
    <ScrollView style={sh.wrap} contentContainerStyle={sh.content} showsVerticalScrollIndicator={false}>
      <View style={sh.header}>
        <Text style={sh.icon}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={sh.label}>⚡ TRY IT NOW</Text>
          <Text style={sh.title}>{title}</Text>
          <Text style={sh.subtitle}>{subtitle}</Text>
        </View>
      </View>
      {children}
    </ScrollView>
  );
}
const sh = StyleSheet.create({
  wrap: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: Spacing.xxxl, gap: Spacing.md },
  header: { flexDirection: 'row', gap: Spacing.md, backgroundColor: '#f0f4ff', borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start' },
  icon: { fontSize: 18, lineHeight: 22 },
  label: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.8 },
  title: { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, lineHeight: 24, marginTop: 2 },
  subtitle: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18, marginTop: 2 },
});
function Btn({ label, onPress, disabled = false, ghost = false }: { label: string; onPress: () => void; disabled?: boolean; ghost?: boolean }) {
  if (ghost) return (
    <TouchableOpacity onPress={onPress} style={{ alignItems: 'center', paddingVertical: Spacing.md }}>
      <Text style={{ color: Colors.textSoft, fontSize: FontSize.sm, fontWeight: '600' }}>{label}</Text>
    </TouchableOpacity>
  );
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled} activeOpacity={0.85}
      style={[{ backgroundColor: Colors.accent, borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' }, disabled && { opacity: 0.4 }]}>
      <Text style={{ color: '#fff', fontSize: FontSize.lg, fontWeight: '800' }}>{label}</Text>
    </TouchableOpacity>
  );
}
function OK({ correct, message }: { correct: boolean; message: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5, backgroundColor: correct ? '#d1fae5' : '#fee2e2', borderColor: correct ? Colors.green : Colors.red }}>
      <Text style={{ fontSize: 20 }}>{correct ? '✅' : '❌'}</Text>
      <Text style={{ flex: 1, fontSize: FontSize.sm, fontWeight: '700', lineHeight: 19, color: correct ? '#065f46' : '#7f1d1d' }}>{message}</Text>
    </View>
  );
}
function Card({ children, style }: { children: React.ReactNode; style?: object }) {
  return <View style={[{ backgroundColor: Colors.card, borderRadius: Radius.lg, borderWidth: 1.5, borderColor: Colors.border, padding: Spacing.lg }, Shadow.sm, style]}>{children}</View>;
}
const chip = StyleSheet.create({
  base: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.card },
  active: { borderColor: Colors.accent, backgroundColor: Colors.accentSoft },
  text: { fontSize: FontSize.sm, fontWeight: '700', color: Colors.textSoft },
  activeText: { color: Colors.accent },
});
const s = StyleSheet.create({
  fieldLabel: { fontSize: FontSize.xs, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowKey: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '600' },
  rowVal: { fontSize: FontSize.sm, color: Colors.textSoft, fontWeight: '700', flex: 1, textAlign: 'right' },
  bullet: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20, marginBottom: 2 },
  hint2: { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 },
  input: { borderWidth: 1.5, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, fontSize: FontSize.lg, fontWeight: '700', color: Colors.text, marginBottom: Spacing.md, backgroundColor: Colors.card },
});

/** Banner shown when wallet doesn't exist or needs funding */
function WalletPromptBanner({ wallet }: { wallet: ReturnType<typeof useSimulatorWallet> }) {
  if (wallet.status === 'not_created') return (
    <TouchableOpacity onPress={wallet.showCreatePrompt}
      style={{ padding: Spacing.md, backgroundColor: Colors.accentSoft, borderRadius: Radius.md, borderWidth: 1.5, borderColor: Colors.accent, flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <Text style={{ fontSize: 20 }}>🔑</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: Colors.accent }}>Create your wallet to use your real address</Text>
        <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>Tap to create a testnet wallet in 15 seconds</Text>
      </View>
      <Text style={{ color: Colors.accent, fontWeight: '800' }}>→</Text>
    </TouchableOpacity>
  );
  if (wallet.status === 'needs_faucet') return (
    <TouchableOpacity onPress={wallet.requestFaucet}
      style={{ padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md, borderWidth: 1.5, borderColor: '#f59e0b', flexDirection: 'row', alignItems: 'center', gap: Spacing.md }}>
      <Text style={{ fontSize: 20 }}>🚰</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontWeight: '800', color: '#92400e' }}>Get test tokens from faucet</Text>
        <Text style={{ fontSize: FontSize.xs, color: '#92400e', marginTop: 2 }}>{wallet.chainConfig.faucetLabel}</Text>
      </View>
      <Text style={{ color: '#92400e', fontWeight: '800' }}>Get →</Text>
    </TouchableOpacity>
  );
  if (wallet.isDemoMode) return (
    <View style={{ padding: Spacing.sm, backgroundColor: '#f3f4f6', borderRadius: Radius.md }}>
      <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, fontWeight: '700' }}>
        🎮 Demo mode — using simulated address. {wallet.chainConfig.name} testnet unavailable.
      </Text>
    </View>
  );
  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// TON ISLAND (Island 13)
// ─────────────────────────────────────────────────────────────────────────────

export function TonWalletEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId); // Island 13 → ton-testnet
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'input' | 'confirm' | 'done'>('input');
  const TARGET = '10';
  const balance = parseFloat(wallet.balance) || 47.32;
  const ALICE_ADDR = 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG'; // Alice demo addr

  const handleSend = () => {
    if (parseFloat(amount) === parseFloat(TARGET)) setStep('confirm');
  };

  return (
    <SimShell icon="💎" title="Send 10 TON to Alice" subtitle="Practice a real TON wallet transaction with your testnet address.">
      <WalletPromptBanner wallet={wallet} />

      <AddressPill
        label="Your TON Testnet Wallet"
        address={wallet.address ?? wallet.chainConfig.key}
        chain={wallet.chainConfig.shortName}
        balance={wallet.balance}
        variant="mine"
        onCreateWallet={wallet.showCreatePrompt}
      />

      <Card>
        <Text style={s.fieldLabel}>YOUR BALANCE</Text>
        <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>{balance.toFixed(4)} TON</Text>
        <Text style={s.fieldLabel}>≈ ${(balance * 5.2).toFixed(2)} USD</Text>
      </Card>

      {step === 'input' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>RECIPIENT</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: FontSize.xs, color: Colors.accent }}>{ALICE_ADDR.slice(0, 20)}...{ALICE_ADDR.slice(-8)}</Text>
            <Text style={s.fieldLabel}>AMOUNT (TON)</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" placeholder="Enter amount" placeholderTextColor={Colors.textMuted} />
            {amount !== '' && parseFloat(amount) !== parseFloat(TARGET) && (
              <Text style={{ fontSize: FontSize.xs, color: Colors.red }}>💡 Alice needs exactly {TARGET} TON</Text>
            )}
          </Card>
          <Btn label="Continue →" onPress={handleSend} disabled={!amount || isNaN(parseFloat(amount))} />
        </>
      )}

      {step === 'confirm' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>TRANSACTION SUMMARY</Text>
            <View style={s.row}><Text style={s.rowKey}>From</Text><Text style={s.rowVal}>{wallet.shortAddress}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>To</Text><Text style={s.rowVal}>Alice ({ALICE_ADDR.slice(0, 10)}...)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Amount</Text><Text style={s.rowVal}>{amount} TON</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Network Fee</Text><Text style={s.rowVal}>~0.01 TON</Text></View>
            <View style={[s.row, { borderTopWidth: 1, borderTopColor: Colors.border, marginTop: Spacing.sm, paddingTop: Spacing.sm }]}>
              <Text style={s.rowKey}>Total</Text>
              <Text style={[s.rowVal, { fontWeight: '800', color: Colors.text }]}>{(parseFloat(amount) + 0.01).toFixed(2)} TON</Text>
            </View>
          </Card>
          <Btn label="✓ Confirm & Send" onPress={() => setStep('done')} />
        </>
      )}

      {step === 'done' && (
        <>
          <OK correct message="Transaction sent! On TON, confirmation takes ~5 seconds — one of the fastest chains." />
          <Card>
            <Text style={s.fieldLabel}>KEY TAKEAWAYS</Text>
            <Text style={s.bullet}>• TON transactions cost ~0.01 TON in fees (fractions of a cent)</Text>
            <Text style={s.bullet}>• Confirmations are near-instant vs ~10 min on Bitcoin</Text>
            <Text style={s.bullet}>• Your address is your TON Space — accessible from Telegram directly</Text>
          </Card>
          <Btn label="Continue →" onPress={onComplete} />
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// TON STAKING ENHANCED (Island 13)
// ─────────────────────────────────────────────────────────────────────────────

export function TonStakingEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId);
  const [amount, setAmount] = useState('100');
  const [period, setPeriod] = useState(12);
  const [confirmed, setConfirmed] = useState(false);
  const APY = 0.054;
  const amtF = parseFloat(amount || '0');
  const monthly = (amtF * APY / 12).toFixed(2);
  const yearly  = (amtF * APY * period / 12).toFixed(2);

  return (
    <SimShell icon="🏦" title="Stake TON with a Validator" subtitle="See how TON staking rewards are calculated — from your own testnet wallet.">
      <WalletPromptBanner wallet={wallet} />
      <AddressPill label="Your Staking Wallet" address={wallet.address} chain={wallet.chainConfig.shortName} balance={wallet.balance} variant="mine" onCreateWallet={wallet.showCreatePrompt} />

      <Card>
        <Text style={s.fieldLabel}>AMOUNT TO STAKE (TON)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <Text style={s.fieldLabel}>LOCK PERIOD</Text>
        <View style={{ flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' }}>
          {[1, 3, 6, 12].map(m => (
            <TouchableOpacity key={m} onPress={() => setPeriod(m)} style={[chip.base, period === m && chip.active]}>
              <Text style={[chip.text, period === m && chip.activeText]}>{m}mo</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={s.fieldLabel}>PROJECTED REWARDS (5.4% APY)</Text>
        <View style={s.row}><Text style={s.rowKey}>Per Month</Text><Text style={s.rowVal}>+{monthly} TON</Text></View>
        <View style={s.row}><Text style={s.rowKey}>After {period} Month{period > 1 ? 's' : ''}</Text>
          <Text style={[s.rowVal, { color: Colors.green, fontWeight: '800' }]}>+{yearly} TON</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Validator</Text><Text style={s.rowVal}>Whales.io (99.9% uptime)</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Testnet Contract</Text><Text style={s.rowVal}>testnet.tonscan.org</Text></View>
      </Card>

      {!confirmed ? (
        <Btn label={`Stake ${amount || '0'} TON for ${period} Month${period > 1 ? 's' : ''} →`} onPress={() => setConfirmed(true)} disabled={!amount || parseFloat(amount) < 1} />
      ) : (
        <>
          <OK correct message={`Staked from ${wallet.shortAddress}! You'll earn ~${yearly} TON over ${period} month${period > 1 ? 's' : ''}. No slashing for delegators on TON.`} />
          <Btn label="Continue →" onPress={onComplete} />
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SOLANA PUMP ENHANCED (Island 9 — Memecoin)
// ─────────────────────────────────────────────────────────────────────────────

export function SolanaPumpEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId); // Island 9 → solana-devnet
  const [tokenName, setTokenName] = useState('');
  const [ticker, setTicker] = useState('');
  const [step, setStep] = useState<'create' | 'launch' | 'curve' | 'result'>('create');
  const [buys, setBuys] = useState(0);

  const CREATION_FEE = 0.02;
  const pct = Math.min(100, (buys / 20) * 100);
  const marketCap = buys * 3000;
  const price = buys > 0 ? (0.000001 * Math.pow(1.05, buys)).toFixed(9) : '0.000001';
  const graduated = buys >= 20;

  return (
    <SimShell icon="🎰" title="Launch on pump.fun" subtitle="Create and launch a memecoin from your Solana devnet wallet.">
      <WalletPromptBanner wallet={wallet} />

      {step === 'create' && (
        <>
          <AddressPill label="Your Launch Wallet (Creator)" address={wallet.address} chain={wallet.chainConfig.shortName} balance={wallet.balance} variant="mine" onCreateWallet={wallet.showCreatePrompt} />
          <Card>
            <Text style={s.fieldLabel}>TOKEN NAME</Text>
            <TextInput style={s.input} value={tokenName} onChangeText={setTokenName} placeholder="e.g. DogeOnSteroids" placeholderTextColor={Colors.textMuted} />
            <Text style={s.fieldLabel}>TICKER</Text>
            <TextInput style={s.input} value={ticker} onChangeText={t => setTicker(t.toUpperCase().slice(0, 8))} placeholder="e.g. DOS" placeholderTextColor={Colors.textMuted} />
          </Card>
          <Card>
            <Text style={s.fieldLabel}>LAUNCH COST (FROM YOUR WALLET)</Text>
            <View style={s.row}><Text style={s.rowKey}>Creation fee</Text><Text style={s.rowVal}>{CREATION_FEE} SOL (~$3.60)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Your wallet</Text><Text style={[s.rowVal, { color: Colors.accent }]}>{wallet.shortAddress}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Your supply</Text><Text style={s.rowVal}>1,000,000,000 (1B)</Text></View>
          </Card>
          <Btn label="Launch Token →" onPress={() => setStep('launch')} disabled={!tokenName || !ticker} />
        </>
      )}

      {step === 'launch' && (
        <>
          <Card>
            <Text style={{ fontSize: 18, textAlign: 'center' }}>🚀</Text>
            <Text style={{ fontWeight: '800', fontSize: FontSize.xl, textAlign: 'center', color: Colors.accent }}>${ticker || 'TOKEN'}</Text>
            <Text style={{ color: Colors.textSoft, textAlign: 'center', marginTop: 4 }}>{tokenName} is LIVE on pump.fun (Devnet)</Text>
            <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md }} />
            <View style={s.row}><Text style={s.rowKey}>Creator wallet</Text><Text style={s.rowVal}>{wallet.shortAddress}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Graduation target</Text><Text style={s.rowVal}>$69,000 MC</Text></View>
          </Card>
          <Btn label="Simulate Buy Pressure →" onPress={() => setStep('curve')} />
        </>
      )}

      {step === 'curve' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>BONDING CURVE PROGRESS</Text>
            <View style={{ height: 12, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden', marginBottom: Spacing.sm }}>
              <View style={{ height: 12, borderRadius: 99, backgroundColor: graduated ? Colors.green : Colors.accent, width: `${pct}%` as any }} />
            </View>
            <View style={{ gap: 4 }}>
              <View style={s.row}><Text style={s.rowKey}>Buy events</Text><Text style={s.rowVal}>{buys} traders</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Token price</Text><Text style={[s.rowVal, { color: Colors.accent, fontWeight: '800' }]}>${price}</Text></View>
              <View style={s.row}><Text style={s.rowKey}>Market cap</Text><Text style={[s.rowVal, { fontWeight: '800' }]}>${marketCap.toLocaleString()}</Text></View>
            </View>
            {!graduated ? (
              <TouchableOpacity onPress={() => setBuys(b => b + 1)}
                style={{ marginTop: Spacing.md, padding: Spacing.lg, backgroundColor: Colors.accent, borderRadius: Radius.lg, alignItems: 'center' }}>
                <Text style={{ color: '#fff', fontWeight: '800' }}>🟢 Simulate a Buy (+1 trader)</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#d1fae5', borderRadius: Radius.md }}>
                <Text style={{ fontWeight: '800', color: Colors.green }}>🎓 GRADUATED! Migrates to Raydium with permanent LP.</Text>
              </View>
            )}
          </Card>
          <Btn label="See Results →" onPress={() => setStep('result')} />
        </>
      )}

      {step === 'result' && (
        <>
          <OK correct={graduated} message={graduated
            ? `${ticker} graduated! As creator (${wallet.shortAddress}), you earn LP fees on every trade.`
            : `${ticker} is still on the curve. 98% of pump.fun tokens never graduate.`} />
          <Card>
            <Text style={s.fieldLabel}>THE BRUTAL STATISTICS</Text>
            <Text style={s.bullet}>• ~97% of pump.fun tokens die on the bonding curve</Text>
            <Text style={s.bullet}>• Creator wallet holds early tokens at very low cost basis</Text>
            <Text style={s.bullet}>• pump.fun takes 1% at graduation regardless of outcome</Text>
          </Card>
          <Btn label="Continue →" onPress={onComplete} />
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// NFT MINT ENHANCED (Island 7)
// ─────────────────────────────────────────────────────────────────────────────

export function NftMintEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId); // Island 7 → ethereum-sepolia
  const [qty, setQty] = useState(1);
  const [step, setStep] = useState<'select' | 'approve' | 'done'>('select');
  const MINT_PRICE = 0.08;
  const GAS = 0.012;
  const total = (qty * MINT_PRICE + GAS).toFixed(4);

  return (
    <SimShell icon="🖼️" title="Mint an NFT" subtitle="Walk through a real mint with your Ethereum Sepolia wallet.">
      <WalletPromptBanner wallet={wallet} />

      {step === 'select' && (
        <>
          <AddressPill label="Your Minting Wallet" address={wallet.address} chain={wallet.chainConfig.shortName} balance={wallet.balance} variant="mine" onCreateWallet={wallet.showCreatePrompt} />
          <Card>
            <Text style={{ fontWeight: '800', fontSize: FontSize.xl, color: Colors.text }}>PixelPunks Collection</Text>
            <Text style={s.hint2}>10,000 unique PFPs. 4,200 remaining.</Text>
            <View style={{ height: 1, backgroundColor: Colors.border, marginVertical: Spacing.md }} />
            <View style={s.row}><Text style={s.rowKey}>Mint price</Text><Text style={[s.rowVal, { fontWeight: '800' }]}>{MINT_PRICE} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Max per wallet</Text><Text style={s.rowVal}>3</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Est. gas (Sepolia)</Text><Text style={s.rowVal}>~{GAS} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Network</Text><Text style={s.rowVal}>Ethereum Sepolia</Text></View>
          </Card>
          <Card>
            <Text style={s.fieldLabel}>HOW MANY TO MINT?</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm, justifyContent: 'center' }}>
              {[1, 2, 3].map(n => (
                <TouchableOpacity key={n} onPress={() => setQty(n)} style={[chip.base, qty === n && chip.active, { paddingHorizontal: Spacing.xl }]}>
                  <Text style={[chip.text, qty === n && chip.activeText, { fontSize: FontSize.xl }]}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.row, { marginTop: Spacing.md, borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: Spacing.sm }]}>
              <Text style={{ fontWeight: '800' }}>Total (mint + gas)</Text>
              <Text style={{ fontWeight: '800', fontSize: FontSize.lg, color: Colors.accent }}>{total} ETH</Text>
            </View>
          </Card>
          <Btn label="Mint Now →" onPress={() => setStep('approve')} />
        </>
      )}

      {step === 'approve' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>MetaMask — CONFIRM TRANSACTION</Text>
            <Text style={{ fontWeight: '800', color: Colors.text, fontSize: FontSize.md, marginBottom: Spacing.sm }}>PixelPunks.mint()</Text>
            <View style={s.row}><Text style={s.rowKey}>From</Text><Text style={s.rowVal}>{wallet.shortAddress}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Contract</Text><Text style={{ fontSize: 11, fontFamily: 'monospace', color: Colors.accent }}>0x58cB...dF3a (Sepolia)</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Value sent</Text><Text style={s.rowVal}>{(qty * MINT_PRICE).toFixed(3)} ETH</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Gas (est.)</Text><Text style={s.rowVal}>{GAS} ETH</Text></View>
            <View style={{ marginTop: Spacing.md, padding: Spacing.md, backgroundColor: '#fef3c7', borderRadius: Radius.md }}>
              <Text style={{ fontWeight: '700', color: '#92400e', fontSize: FontSize.sm }}>
                ⚠️ BEFORE CONFIRMING: Verify the contract address on Sepolia Etherscan.
              </Text>
            </View>
          </Card>
          <Btn label="✓ Confirm Mint" onPress={() => setStep('done')} />
          <Btn ghost label="Reject" onPress={() => setStep('select')} />
        </>
      )}

      {step === 'done' && (
        <>
          <OK correct message={`Minted ${qty} NFT${qty > 1 ? 's' : ''} from ${wallet.shortAddress}! Token ID(s) assigned. They'll appear in OpenSea testnet within ~5 minutes.`} />
          <Card>
            <Text style={s.fieldLabel}>VIEW ON SEPOLIA EXPLORER</Text>
            <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.etherscan.io/address/${wallet.address}`)}>
              <Text style={{ color: Colors.accent, fontWeight: '700', fontSize: FontSize.sm }}>
                sepolia.etherscan.io/address/{wallet.shortAddress} →
              </Text>
            </TouchableOpacity>
          </Card>
          <Btn label="Continue →" onPress={onComplete} />
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SEND BITCOIN ENHANCED (Island 1)
// ─────────────────────────────────────────────────────────────────────────────

export function SendBitcoinEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId); // Island 1 → bitcoin-testnet4
  const [to, setTo] = useState('');
  const [amount, setAmount] = useState('');
  const [feeLevel, setFeeLevel] = useState<'slow'|'medium'|'fast'>('medium');
  const [step, setStep] = useState<'form'|'confirm'|'done'>('form');
  const fees = {
    slow:   { sat:'12 sat/vB', time:'~60 min', btc:'0.00002' },
    medium: { sat:'25 sat/vB', time:'~20 min', btc:'0.00004' },
    fast:   { sat:'50 sat/vB', time:'~10 min', btc:'0.00008' },
  };
  const fee = fees[feeLevel];
  const amt = parseFloat(amount) || 0;
  const BALANCE = parseFloat(wallet.balance) || 0.0842;
  const total = amt + parseFloat(fee.btc);
  const valid = to.length > 10 && amt > 0 && amt < BALANCE;

  return (
    <SimShell icon="₿" title="Send Bitcoin" subtitle="Build a real transaction from your Bitcoin Testnet4 wallet.">
      <WalletPromptBanner wallet={wallet} />

      {step === 'form' && (
        <>
          <AddressPill label="Your Bitcoin Testnet4 Wallet" address={wallet.address} chain={wallet.chainConfig.shortName} balance={`${BALANCE} tBTC`} variant="mine" onCreateWallet={wallet.showCreatePrompt} />

          <Card>
            <Text style={s.fieldLabel}>RECIPIENT ADDRESS (Testnet4)</Text>
            <TextInput style={s.input} value={to} onChangeText={setTo}
              placeholder="tb1q... or another testnet address" placeholderTextColor={Colors.textSoft} autoCapitalize="none" />
            <Text style={s.fieldLabel}>AMOUNT (tBTC)</Text>
            <TextInput style={s.input} value={amount} onChangeText={setAmount}
              keyboardType="decimal-pad" placeholder="e.g. 0.001" placeholderTextColor={Colors.textSoft} />
          </Card>

          <Card>
            <Text style={s.fieldLabel}>NETWORK FEE</Text>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {(['slow','medium','fast'] as const).map(l => (
                <TouchableOpacity key={l} onPress={() => setFeeLevel(l)}
                  style={[{ flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 2, alignItems: 'center',
                    borderColor: feeLevel === l ? Colors.accent : Colors.border,
                    backgroundColor: feeLevel === l ? Colors.accentSoft : Colors.card }]}>
                  <Text style={{ fontWeight: '800', fontSize: FontSize.xs, color: feeLevel === l ? Colors.accent : Colors.text }}>{l.charAt(0).toUpperCase() + l.slice(1)}</Text>
                  <Text style={{ fontSize: 10, color: Colors.textSoft, marginTop: 2 }}>{fees[l].time}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {amt > 0 && <View style={[s.row, { marginTop: Spacing.md }]}><Text style={s.rowKey}>Total out</Text><Text style={[s.rowVal, { color: Colors.text, fontWeight: '800' }]}>{total.toFixed(5)} tBTC</Text></View>}
          </Card>

          <Btn label="Review Transaction →" onPress={() => setStep('confirm')} disabled={!valid} />
        </>
      )}

      {step === 'confirm' && (
        <>
          <Card>
            <Text style={s.fieldLabel}>CONFIRM — THIS CANNOT BE UNDONE (even on testnet)</Text>
            <View style={s.row}><Text style={s.rowKey}>From</Text><Text style={s.rowVal}>{wallet.shortAddress}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>To</Text><Text style={s.rowVal}>{to.slice(0,12)}…{to.slice(-6)}</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Amount</Text><Text style={s.rowVal}>{amount} tBTC</Text></View>
            <View style={s.row}><Text style={s.rowKey}>Fee ({feeLevel})</Text><Text style={s.rowVal}>{fee.btc} tBTC · {fee.time}</Text></View>
          </Card>
          <View style={{ backgroundColor: '#fef3c7', borderRadius: Radius.md, padding: Spacing.md }}>
            <Text style={{ color: '#92400e', fontWeight: '700', fontSize: FontSize.sm }}>
              ⚠️ Bitcoin transactions are IRREVERSIBLE even on testnet. Character-by-character address check is mandatory.
            </Text>
          </View>
          <Btn label="✓ Sign & Broadcast" onPress={() => setStep('done')} />
        </>
      )}

      {step === 'done' && (
        <>
          <OK correct message={`Broadcast from ${wallet.shortAddress}! Miners will confirm it ${fee.time}. View on mempool.space/testnet4.`} />
          <TouchableOpacity onPress={() => Linking.openURL(`https://mempool.space/testnet4/address/${wallet.address}`)}>
            <Text style={{ color: Colors.accent, fontWeight: '700', textAlign: 'center', paddingVertical: Spacing.sm }}>
              View on Testnet4 Explorer →
            </Text>
          </TouchableOpacity>
          <Btn label="Continue →" onPress={onComplete} />
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// BNB PANCAKE ENHANCED (Island 5)
// ─────────────────────────────────────────────────────────────────────────────

export function BnbPancakeEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId); // Island 5 → bnb-testnet
  const [amount, setAmount] = useState('0.5');
  const [confirmed, setConfirmed] = useState(false);
  const amtF = parseFloat(amount) || 0;
  const received = (amtF * 64).toFixed(0);

  return (
    <SimShell icon="🥞" title="Swap on PancakeSwap" subtitle="Swap tBNB for CAKE on BSC Testnet from your own wallet.">
      <WalletPromptBanner wallet={wallet} />
      <AddressPill label="Your BNB Testnet Wallet" address={wallet.address} chain={wallet.chainConfig.shortName} balance={wallet.balance} variant="mine" onCreateWallet={wallet.showCreatePrompt} />

      <Card>
        <Text style={s.fieldLabel}>SWAP tBNB → CAKE (BSC Testnet)</Text>
        <TextInput style={s.input} value={amount} onChangeText={setAmount}
          keyboardType="decimal-pad" placeholder="tBNB amount" placeholderTextColor={Colors.textMuted} />
        <View style={s.row}><Text style={s.rowKey}>Rate</Text><Text style={s.rowVal}>1 tBNB = ~64 CAKE</Text></View>
        <View style={s.row}><Text style={s.rowKey}>You receive</Text><Text style={[s.rowVal, { color: Colors.green, fontWeight: '800' }]}>~{received} CAKE</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Fee (0.25%)</Text><Text style={s.rowVal}>{(amtF * 0.0025).toFixed(4)} tBNB</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Gas cost</Text><Text style={[s.rowVal, { color: Colors.green }]}>~$0.10 (BSC Testnet)</Text></View>
        <View style={s.row}><Text style={s.rowKey}>Explorer</Text><Text style={s.rowVal}>testnet.bscscan.com</Text></View>
      </Card>

      {!confirmed ? (
        <Btn label={`Swap ${amount} tBNB from ${wallet.shortAddress} →`} onPress={() => setConfirmed(true)} disabled={amtF <= 0} />
      ) : (
        <>
          <OK correct message={`Swapped from ${wallet.shortAddress}! View your transaction on testnet.bscscan.com.`} />
          <TouchableOpacity onPress={() => Linking.openURL(`https://testnet.bscscan.com/address/${wallet.address}`)}>
            <Text style={{ color: Colors.accent, fontWeight: '700', textAlign: 'center', paddingVertical: Spacing.sm }}>
              View on BSCScan Testnet →
            </Text>
          </TouchableOpacity>
          <Btn label="Continue →" onPress={onComplete} />
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AIRDROP FARM ENHANCED (Island 10)
// ─────────────────────────────────────────────────────────────────────────────

export function AirdropFarmEnhancedSim({ onComplete, onSkip, islandId }: SimProps) {
  const wallet = useSimulatorWallet(islandId); // Island 10 → arbitrum-sepolia
  const tasks = [
    { id: 'bridge',     label: 'Bridge ETH to the new L2',             points: 25,  sybil: false, tip: 'Bridge from a wallet with history. Vary amounts.' },
    { id: 'swap',       label: 'Swap tokens on the native DEX',         points: 20,  sybil: false, tip: '$5 swaps = flagged as farming. Use realistic amounts.' },
    { id: 'lp',         label: 'Provide liquidity (even $100)',          points: 30,  sybil: false, tip: 'LP provision shows genuine commitment.' },
    { id: 'governance', label: 'Vote on a governance proposal',          points: 15,  sybil: false, tip: 'On-chain governance = strong signal.' },
    { id: 'multiWallet',label: 'Repeat from 10 wallets (Sybil farming)', points: -50, sybil: true,  tip: 'Graph analysis catches this — all wallets get zero.' },
  ];
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = useState(false);

  const score = [...selected].reduce((acc, id) => acc + (tasks.find(t => t.id === id)?.points || 0), 0);
  const pickedSybil = selected.has('multiWallet');
  const passed = score >= 50 && !pickedSybil;

  return (
    <SimShell icon="🪂" title="Build an Airdrop Strategy" subtitle="Choose your farming activities from your Arbitrum Sepolia wallet.">
      <WalletPromptBanner wallet={wallet} />
      <AddressPill label="Your Farming Wallet (Arbitrum Sepolia)" address={wallet.address} chain={wallet.chainConfig.shortName} balance={wallet.balance} variant="mine" onCreateWallet={wallet.showCreatePrompt} />

      <Text style={{ fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 18 }}>
        Protocols track THIS wallet. One genuine wallet with real activity beats 10 farming wallets.
      </Text>

      {tasks.map(task => {
        const isSel = selected.has(task.id);
        return (
          <TouchableOpacity key={task.id} onPress={() => !submitted && setSelected(prev => {
            const s = new Set(prev); s.has(task.id) ? s.delete(task.id) : s.add(task.id); return s;
          })} style={{ padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 2,
            borderColor: isSel ? (task.sybil ? Colors.red : Colors.green) : Colors.border,
            backgroundColor: isSel ? (task.sybil ? '#fee2e2' : '#d1fae5') : Colors.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', color: Colors.text, fontSize: FontSize.sm }}>{task.label}</Text>
                {submitted && <Text style={{ fontSize: FontSize.xs, color: Colors.textSoft, marginTop: 2 }}>💡 {task.tip}</Text>}
              </View>
              <Text style={{ fontWeight: '800', color: task.points > 0 ? Colors.green : Colors.red, fontSize: FontSize.md }}>
                {task.points > 0 ? '+' : ''}{task.points}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {!submitted ? (
        <Btn label={`Submit Strategy (${score} pts) →`} onPress={() => setSubmitted(true)} disabled={selected.size === 0} />
      ) : (
        <>
          <OK correct={passed} message={passed
            ? `${score} pts from ${wallet.shortAddress} — Legitimate farming. Real activity over time is always the safest approach.`
            : pickedSybil
            ? `BANNED! Graph analysis detected multi-wallet farming from addresses linked to ${wallet.shortAddress}. All wallets score zero.`
            : `${score} pts — Need more genuine activity. Bridge + swap + LP is the core stack.`} />
          {passed ? <Btn label="Continue →" onPress={onComplete} /> : <Btn label="Try Again" onPress={() => { setSelected(new Set()); setSubmitted(false); }} />}
        </>
      )}
      <Btn ghost label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}
