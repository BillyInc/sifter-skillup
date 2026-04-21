// ⚡ Sifter SkillUp — Island 6 Solana Simulators
// File: island06SolanaSimulatorDefs.tsx
//
// SIMULATORS EXPORTED (add all to SIMULATORS map in SimulatorCard.tsx):
//   solanaOverview    — L256, L257, L258: PoH explainer + SOL utility interactive
//   phantomWallet     — L259: Phantom setup, seed phrase, spam filter drill
//   solanaJupiter     — L264: Jupiter swap interface + DCA + limit order
//   solanaStaking     — L266: Validator staking vs mSOL vs JitoSOL comparison
//   solanaCompare     — L261, L267, L268, L269, L270: Solana vs Ethereum evaluator
//
// INTEGRATION:
//   1. Place this file in: src/components/simulators/island06SolanaSimulatorDefs.tsx
//   2. In SimulatorCard.tsx, add at top:
//        import {
//          SolanaOverviewSim, PhantomWalletSim, SolanaJupiterSim,
//          SolanaStakingSim, SolanaCompareSim,
//        } from './island06SolanaSimulatorDefs';
//   3. Add to SIMULATORS map:
//        solanaOverview: SolanaOverviewSim,
//        phantomWallet:  PhantomWalletSim,
//        solanaJupiter:  SolanaJupiterSim,
//        solanaStaking:  SolanaStakingSim,
//        solanaCompare:  SolanaCompareSim,
//
// WALLET: Phantom (Solana Devnet) via useSimulatorWallet(6)
// CHAIN: Solana Devnet — RPC: https://api.devnet.solana.com
// FAUCET: https://faucet.solana.com (1 SOL per request)

import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Animated, Clipboard, Linking,
} from 'react-native';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../../theme';
import { useSimulatorWallet } from '../../hooks/useSimulatorWallet';
import AddressPill from '../wallet/AddressPill';

// ── Shared types ──────────────────────────────────────────────────────────────

interface SimProps {
  onComplete: () => void;
  onSkip: () => void;
  islandId?: number;
}

// ── SimShell: standard wrapper ────────────────────────────────────────────────

function SimShell({
  icon, title, subtitle, children, onBack,
}: {
  icon: string; title: string; subtitle: string;
  children: React.ReactNode; onBack?: () => void;
}) {
  return (
    <View style={s.shell}>
      <TouchableOpacity onPress={onBack} style={s.backBtn} activeOpacity={0.7}>
        <Text style={s.backTxt}>← Back to Lesson</Text>
      </TouchableOpacity>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Text style={s.icon}>{icon}</Text>
        <Text style={s.title}>{title}</Text>
        <Text style={s.subtitle}>{subtitle}</Text>
        {children}
      </ScrollView>
    </View>
  );
}

// ── WalletBanner: Phantom devnet wallet prompt ────────────────────────────────

function PhantomBanner({ wallet }: { wallet: ReturnType<typeof useSimulatorWallet> }) {
  if (!wallet.address) {
    return (
      <TouchableOpacity style={s.walletPrompt} onPress={wallet.showCreatePrompt} activeOpacity={0.8}>
        <Text style={s.walletPromptIcon}>👻</Text>
        <View style={s.walletPromptText}>
          <Text style={s.walletPromptTitle}>Connect Phantom Wallet</Text>
          <Text style={s.walletPromptSub}>Get a Solana Devnet address to practice with real transactions</Text>
        </View>
        <Text style={s.walletPromptArrow}>→</Text>
      </TouchableOpacity>
    );
  }
  return (
    <AddressPill
      label="Your Phantom (Devnet)"
      address={wallet.address}
      chain={wallet.chain}
      balance={wallet.balance}
      variant="mine"
      onCreateWallet={wallet.showCreatePrompt}
    />
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 1: SolanaOverviewSim
// Used by: L256 (What Is Solana), L257 (PoH), L258 (SOL utility)
// ─────────────────────────────────────────────────────────────────────────────

export function SolanaOverviewSim({ onComplete, onSkip, islandId = 6 }: SimProps) {
  const wallet = useSimulatorWallet(islandId);
  const [tab, setTab] = useState<'poh' | 'fees' | 'sol'>('poh');
  const [pohStep, setPohStep] = useState(0);
  const [feeInput, setFeeInput] = useState('50');
  const [solRole, setSolRole] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const tabs: { key: 'poh' | 'fees' | 'sol'; label: string; icon: string }[] = [
    { key: 'poh', label: 'PoH Clock', icon: '⏱' },
    { key: 'fees', label: 'Fee Compare', icon: '💸' },
    { key: 'sol', label: 'SOL Jobs', icon: '◎' },
  ];

  const pohSteps = [
    { hash: 'SHA256(genesis)', time: '0ms', event: 'Genesis — chain starts' },
    { hash: 'SHA256(step_1)', time: '400ms', event: 'Block 1 — transactions ordered' },
    { hash: 'SHA256(step_2)', time: '800ms', event: 'Block 2 — parallel execution' },
    { hash: 'SHA256(step_3)', time: '1200ms', event: 'Tx inserted: "Alice → Bob 0.1 SOL"' },
    { hash: 'SHA256(step_4)', time: '1600ms', event: 'Block finalised — proof submitted' },
  ];

  const solJobs = [
    { role: 'gas', label: '⛽ Gas Fees', desc: 'Pay for every transaction. ~$0.00025 each — essentially free.', color: '#f59e0b' },
    { role: 'stake', label: '🗳 Staking', desc: 'Delegate to validators. Earn 6–7% APY. Secures the network.', color: '#10b981' },
    { role: 'rent', label: '🏦 Rent', desc: 'Deposit for each account (~0.002 SOL). Refunded when closed.', color: '#6366f1' },
  ];

  const txCount = parseInt(feeInput) || 0;
  const solFee = txCount * 0.00025;
  const ethFee = txCount * 5;

  const handleComplete = () => {
    setDone(true);
    Animated.timing(fadeAnim, { toValue: 0.6, duration: 300, useNativeDriver: true }).start();
    setTimeout(onComplete, 800);
  };

  return (
    <SimShell icon="◎" title="Solana Overview" subtitle="Explore Proof of History, fees, and what SOL does.">
      <PhantomBanner wallet={wallet} />

      {/* Tab bar */}
      <View style={s.tabBar}>
        {tabs.map(t => (
          <TouchableOpacity key={t.key} onPress={() => setTab(t.key)}
            style={[s.tab, tab === t.key && s.tabActive]}>
            <Text style={s.tabIcon}>{t.icon}</Text>
            <Text style={[s.tabLabel, tab === t.key && s.tabLabelActive]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* PoH Tab */}
      {tab === 'poh' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Proof of History — The Solana Clock</Text>
          <Text style={s.panelBody}>
            Each hash takes the previous hash as input. The chain length proves time has passed. Tap to advance the clock.
          </Text>
          <View style={s.pohChain}>
            {pohSteps.slice(0, pohStep + 1).map((step, i) => (
              <View key={i} style={s.pohRow}>
                <View style={s.pohDot} />
                <View style={s.pohContent}>
                  <Text style={s.pohHash}>{step.hash}</Text>
                  <Text style={s.pohTime}>{step.time} — {step.event}</Text>
                </View>
              </View>
            ))}
          </View>
          {pohStep < pohSteps.length - 1 ? (
            <TouchableOpacity style={s.btn} onPress={() => setPohStep(p => p + 1)}>
              <Text style={s.btnTxt}>⟳ Next Hash (+400ms)</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.successBox}>
              <Text style={s.successTxt}>✓ Chain complete. 1,600ms elapsed. 5 events proven in order.</Text>
              <Text style={s.successSub}>Validators didn't need to communicate — the hash chain proved the order.</Text>
            </View>
          )}
        </View>
      )}

      {/* Fee Compare Tab */}
      {tab === 'fees' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Fee Calculator</Text>
          <Text style={s.panelBody}>How many transactions do you want to make today?</Text>
          <View style={s.inputRow}>
            <TextInput
              style={s.input}
              value={feeInput}
              onChangeText={setFeeInput}
              keyboardType="numeric"
              maxLength={5}
            />
            <Text style={s.inputLabel}>transactions</Text>
          </View>
          <View style={s.feeGrid}>
            <View style={[s.feeCard, { borderColor: '#627eea' }]}>
              <Text style={s.feeChain}>Ethereum Mainnet</Text>
              <Text style={s.feeAmt}>${ethFee.toLocaleString()}</Text>
              <Text style={s.feeSub}>@ $5 avg per tx</Text>
            </View>
            <View style={[s.feeCard, { borderColor: '#9945ff' }]}>
              <Text style={s.feeChain}>Solana</Text>
              <Text style={s.feeAmt}>${solFee < 0.01 ? solFee.toFixed(6) : solFee.toFixed(4)}</Text>
              <Text style={s.feeSub}>@ $0.00025 per tx</Text>
            </View>
          </View>
          {txCount > 0 && (
            <View style={s.savingsBox}>
              <Text style={s.savingsTxt}>
                💰 You save ${(ethFee - solFee).toLocaleString(undefined, { maximumFractionDigits: 2 })} — that's {Math.round(ethFee / solFee).toLocaleString()}× cheaper
              </Text>
            </View>
          )}
        </View>
      )}

      {/* SOL Jobs Tab */}
      {tab === 'sol' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>SOL's Three Jobs</Text>
          <Text style={s.panelBody}>Tap each to understand what SOL does.</Text>
          {solJobs.map(j => (
            <TouchableOpacity key={j.role} onPress={() => setSolRole(j.role === solRole ? null : j.role)}
              style={[s.jobCard, { borderLeftColor: j.color }, solRole === j.role && s.jobCardActive]}>
              <Text style={s.jobLabel}>{j.label}</Text>
              {solRole === j.role && <Text style={s.jobDesc}>{j.desc}</Text>}
            </TouchableOpacity>
          ))}
          {solRole && (
            <View style={s.rentNote}>
              <Text style={s.rentNoteTxt}>
                💡 You have 40 empty token accounts? Close them and reclaim 40 × 0.002 = 0.08 SOL.
              </Text>
            </View>
          )}
        </View>
      )}

      <TouchableOpacity style={[s.completeBtn, done && s.completeBtnDone]} onPress={handleComplete} disabled={done}>
        <Text style={s.completeBtnTxt}>{done ? '✓ Complete!' : 'Mark Complete →'}</Text>
      </TouchableOpacity>
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 2: PhantomWalletSim
// Used by: L259 (Phantom Wallet — The Solana Standard)
// ─────────────────────────────────────────────────────────────────────────────

export function PhantomWalletSim({ onComplete, onSkip, islandId = 6 }: SimProps) {
  const wallet = useSimulatorWallet(islandId);
  const [step, setStep] = useState<'intro' | 'phrase' | 'quiz' | 'spam' | 'done'>('intro');
  const [wordOrder, setWordOrder] = useState<string[]>([]);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  const [spamAction, setSpamAction] = useState<string | null>(null);

  const phraseWords = ['vault', 'ocean', 'lamp', 'silver', 'crane', 'frost', 'echo', 'marble', 'drift', 'pulsar', 'zen', 'gate'];
  const scrambled = ['frost', 'gate', 'ocean', 'echo', 'marble', 'lamp', 'vault', 'pulsar', 'silver', 'crane', 'drift', 'zen'];

  useEffect(() => {
    if (step === 'phrase') setWordOrder([]);
  }, [step]);

  const selectWord = (w: string) => {
    if (selectedWords.includes(w)) {
      setSelectedWords(s => s.filter(x => x !== w));
    } else {
      setSelectedWords(s => [...s, w]);
    }
  };

  const phraseCorrect = selectedWords.join(' ') === phraseWords.join(' ');

  const spamNFTs = [
    { name: 'CLAIM 50 SOL NOW', safe: false },
    { name: 'Okay Bears #4712', safe: true },
    { name: 'YOU HAVE WON 2 ETH', safe: false },
    { name: 'DeGods #1234', safe: true },
    { name: 'FREE MINT — CLICK LINK', safe: false },
  ];

  return (
    <SimShell icon="👻" title="Phantom Wallet" subtitle="Set up, secure, and protect your Solana wallet.">
      <PhantomBanner wallet={wallet} />

      {step === 'intro' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Phantom: The Solana Standard</Text>
          {[
            ['👻', 'Non-custodial', 'You hold your private key. Phantom never sees it.'],
            ['⚡', 'Built-in Jupiter swaps', 'Swap any token without leaving the app. (0.85% fee)'],
            ['🛡', 'NFT Spam Filter', 'Suspicious NFTs hidden automatically in spam folder.'],
            ['🌐', 'Multi-chain', 'Solana, Ethereum, Polygon, Bitcoin in one app.'],
          ].map(([icon, label, desc]) => (
            <View key={label} style={s.featureRow}>
              <Text style={s.featureIcon}>{icon}</Text>
              <View style={s.featureText}>
                <Text style={s.featureLabel}>{label}</Text>
                <Text style={s.featureSub}>{desc}</Text>
              </View>
            </View>
          ))}
          <TouchableOpacity style={s.btn} onPress={() => setStep('phrase')}>
            <Text style={s.btnTxt}>Practise Recovery Phrase →</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'phrase' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Recovery Phrase Drill</Text>
          <Text style={s.panelBody}>
            Phantom gives you a 12-word recovery phrase. This IS your wallet — anyone with these words has full access.
            {'\n\n'}Reconstruct the correct word order by tapping words in sequence:
          </Text>
          {/* Target sequence */}
          <View style={s.phraseTarget}>
            {phraseWords.map((w, i) => (
              <View key={i} style={[s.phraseSlot, selectedWords[i] === w && s.phraseSlotFilled]}>
                <Text style={s.phraseSlotTxt}>{selectedWords[i] || `${i + 1}`}</Text>
              </View>
            ))}
          </View>
          {/* Word bank */}
          <View style={s.wordBank}>
            {scrambled.map(w => (
              <TouchableOpacity key={w} onPress={() => selectWord(w)}
                style={[s.wordChip, selectedWords.includes(w) && s.wordChipUsed]}
                disabled={selectedWords.includes(w)}>
                <Text style={[s.wordChipTxt, selectedWords.includes(w) && s.wordChipTxtUsed]}>{w}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {selectedWords.length === 12 && (
            phraseCorrect ? (
              <View style={s.successBox}>
                <Text style={s.successTxt}>✓ Correct order!</Text>
                <Text style={s.successSub}>Write this on paper. Never screenshot. Never type into any website.</Text>
                <TouchableOpacity style={s.btn} onPress={() => setStep('quiz')}>
                  <Text style={s.btnTxt}>Next →</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.errorBox}>
                <Text style={s.errorTxt}>✗ Wrong order. Clear and try again.</Text>
                <TouchableOpacity style={s.btnOutline} onPress={() => setSelectedWords([])}>
                  <Text style={s.btnOutlineTxt}>Clear</Text>
                </TouchableOpacity>
              </View>
            )
          )}
        </View>
      )}

      {step === 'quiz' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Security Check</Text>
          <Text style={s.panelBody}>You receive your new Phantom wallet. What is the safest backup strategy for your recovery phrase?</Text>
          {[
            'Take a screenshot and back it up to Google Photos',
            'Email it to yourself — email is encrypted',
            'Write it on paper and store copies in two physically separate locations',
            'Save it in your phone\'s Notes app with a strong password',
          ].map((opt, i) => (
            <TouchableOpacity key={i} onPress={() => setQuizAnswer(i)}
              style={[s.quizOpt, quizAnswer === i && (i === 2 ? s.quizCorrect : s.quizWrong)]}>
              <Text style={s.quizOptTxt}>{opt}</Text>
              {quizAnswer === i && i === 2 && <Text style={s.quizFeedback}>✓ Paper + separate locations = no single point of failure.</Text>}
              {quizAnswer === i && i !== 2 && <Text style={s.quizFeedbackWrong}>✗ Digital storage can be compromised. Paper is safest.</Text>}
            </TouchableOpacity>
          ))}
          {quizAnswer === 2 && (
            <TouchableOpacity style={s.btn} onPress={() => setStep('spam')}>
              <Text style={s.btnTxt}>Next: NFT Spam Filter →</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {step === 'spam' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>NFT Spam Filter Drill</Text>
          <Text style={s.panelBody}>
            You received 5 NFTs. Phantom flags suspicious ones automatically — but can you identify them?
            {'\n'}Tap each NFT to classify it.
          </Text>
          {spamNFTs.map((nft, i) => (
            <TouchableOpacity key={i} onPress={() => setSpamAction(String(i))}
              style={[s.nftRow, spamAction === String(i) && (nft.safe ? s.nftSafe : s.nftSpam)]}>
              <Text style={s.nftIcon}>{nft.safe ? '🖼' : '⚠️'}</Text>
              <Text style={s.nftName}>{nft.name}</Text>
              {spamAction === String(i) && (
                <Text style={s.nftVerdict}>{nft.safe ? '✓ Legit' : '✗ SPAM'}</Text>
              )}
            </TouchableOpacity>
          ))}
          <View style={s.spamNote}>
            <Text style={s.spamNoteTxt}>
              💡 Phantom auto-hides NFTs matching scam patterns. Never click links or visit websites from unknown NFTs.
            </Text>
          </View>
          <TouchableOpacity style={s.completeBtn} onPress={() => { setStep('done'); setTimeout(onComplete, 600); }}>
            <Text style={s.completeBtnTxt}>Complete →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 3: SolanaJupiterSim
// Used by: L264 (Jupiter — Every Swap, Best Price)
// ─────────────────────────────────────────────────────────────────────────────

export function SolanaJupiterSim({ onComplete, onSkip, islandId = 6 }: SimProps) {
  const wallet = useSimulatorWallet(islandId);
  const [mode, setMode] = useState<'swap' | 'dca' | 'limit'>('swap');
  const [fromAmt, setFromAmt] = useState('100');
  const [route, setRoute] = useState<null | 'found'>(null);
  const [dcaAmt, setDcaAmt] = useState('50');
  const [dcaFreq, setDcaFreq] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [limitPrice, setLimitPrice] = useState('120');
  const [limitAmt, setLimitAmt] = useState('1');
  const [limitPlaced, setLimitPlaced] = useState(false);
  const [swapDone, setSwapDone] = useState(false);

  const CURRENT_SOL_PRICE = 142.5;
  const routes = [
    { dex: 'Raydium', pct: 55, price: 142.50 },
    { dex: 'Orca', pct: 30, price: 142.80 },
    { dex: 'Lifinity', pct: 15, price: 143.10 },
  ];
  const weightedPrice = routes.reduce((acc, r) => acc + r.price * (r.pct / 100), 0);
  const usdcAmt = parseFloat(fromAmt) || 0;
  const solReceived = usdcAmt / weightedPrice;

  const dcaTotal = parseFloat(dcaAmt) * (dcaFreq === 'daily' ? 30 : dcaFreq === 'weekly' ? 4 : 1);

  return (
    <SimShell icon="🪐" title="Jupiter DEX Aggregator" subtitle="Swap, DCA, and set limit orders on Solana.">
      <PhantomBanner wallet={wallet} />

      <View style={s.tabBar}>
        {(['swap', 'dca', 'limit'] as const).map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)} style={[s.tab, mode === m && s.tabActive]}>
            <Text style={[s.tabLabel, mode === m && s.tabLabelActive]}>
              {m === 'swap' ? '⚡ Swap' : m === 'dca' ? '📅 DCA' : '🎯 Limit'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {mode === 'swap' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Swap USDC → SOL</Text>
          <Text style={s.panelBody}>Jupiter checks all Solana DEXes simultaneously.</Text>

          <View style={s.swapBox}>
            <View style={s.swapFrom}>
              <Text style={s.swapLabel}>You pay</Text>
              <View style={s.swapRow}>
                <TextInput style={s.swapInput} value={fromAmt} onChangeText={setFromAmt} keyboardType="numeric" />
                <Text style={s.swapToken}>USDC</Text>
              </View>
            </View>
            <Text style={s.swapArrow}>↓</Text>
            <View style={s.swapTo}>
              <Text style={s.swapLabel}>You receive (est.)</Text>
              <Text style={s.swapResult}>{solReceived.toFixed(4)} SOL</Text>
            </View>
          </View>

          {!route && (
            <TouchableOpacity style={s.btn} onPress={() => setRoute('found')}>
              <Text style={s.btnTxt}>🔍 Find Best Route</Text>
            </TouchableOpacity>
          )}

          {route === 'found' && (
            <>
              <Text style={s.routeTitle}>Jupiter split route:</Text>
              {routes.map((r, i) => (
                <View key={i} style={s.routeRow}>
                  <Text style={s.routeDex}>{r.dex}</Text>
                  <View style={s.routeBar}>
                    <View style={[s.routeBarFill, { width: `${r.pct}%` }]} />
                  </View>
                  <Text style={s.routePct}>{r.pct}%</Text>
                  <Text style={s.routePrice}>${r.price}</Text>
                </View>
              ))}
              <View style={s.savingsBox}>
                <Text style={s.savingsTxt}>
                  Weighted avg: ${weightedPrice.toFixed(2)}/SOL
                  {'\n'}vs. Phantom swap fee (0.85%): saves ${(usdcAmt * 0.0085).toFixed(2)} by using jup.ag directly
                </Text>
              </View>
              {!swapDone ? (
                <TouchableOpacity style={s.btn} onPress={() => { setSwapDone(true); }}>
                  <Text style={s.btnTxt}>✓ Execute Swap</Text>
                </TouchableOpacity>
              ) : (
                <View style={s.successBox}>
                  <Text style={s.successTxt}>✓ Swap complete!</Text>
                  <Text style={s.successSub}>Devnet tx — no real funds used. Gas: $0.00025</Text>
                </View>
              )}
            </>
          )}
        </View>
      )}

      {mode === 'dca' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Dollar-Cost Averaging</Text>
          <Text style={s.panelBody}>Buy a fixed amount of SOL automatically on a schedule.</Text>

          <View style={s.dcaRow}>
            <Text style={s.dcaLabel}>Buy $</Text>
            <TextInput style={s.dcaInput} value={dcaAmt} onChangeText={setDcaAmt} keyboardType="numeric" />
            <Text style={s.dcaLabel}>of SOL</Text>
          </View>

          <View style={s.freqBar}>
            {(['daily', 'weekly', 'monthly'] as const).map(f => (
              <TouchableOpacity key={f} onPress={() => setDcaFreq(f)} style={[s.freqBtn, dcaFreq === f && s.freqBtnActive]}>
                <Text style={[s.freqTxt, dcaFreq === f && s.freqTxtActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.dcaSummary}>
            <Text style={s.dcaSummaryTxt}>
              📅 Schedule: ${dcaAmt} {dcaFreq}
              {'\n'}💰 Per month: ~${dcaTotal.toFixed(0)} USDC
              {'\n'}◎ SOL per execution: ~{(parseFloat(dcaAmt) / CURRENT_SOL_PRICE).toFixed(4)} SOL @ ${CURRENT_SOL_PRICE}
              {'\n'}⚡ Execution fee: ~$0.10 per DCA order
              {'\n'}{'\n'}Jupiter holds your USDC in escrow and executes automatically.
            </Text>
          </View>

          <TouchableOpacity style={s.btn} onPress={onComplete}>
            <Text style={s.btnTxt}>✓ Got it — DCA understood</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'limit' && (
        <View style={s.panel}>
          <Text style={s.panelTitle}>Limit Order</Text>
          <Text style={s.panelBody}>
            Current SOL price: ${CURRENT_SOL_PRICE}
            {'\n'}Set a price target — Jupiter buys when SOL hits your price.
          </Text>

          <View style={s.limitForm}>
            <Text style={s.limitLabel}>Buy</Text>
            <TextInput style={s.limitInput} value={limitAmt} onChangeText={setLimitAmt} keyboardType="numeric" />
            <Text style={s.limitLabel}>SOL when price drops to $</Text>
            <TextInput style={s.limitInput} value={limitPrice} onChangeText={setLimitPrice} keyboardType="numeric" />
          </View>

          <View style={s.limitSummary}>
            <Text style={s.limitSummaryTxt}>
              Order: Buy {limitAmt} SOL at ${limitPrice}
              {'\n'}Cost: ${(parseFloat(limitAmt) * parseFloat(limitPrice)).toFixed(2)} USDC (held in escrow)
              {'\n'}Status: {parseFloat(limitPrice) >= CURRENT_SOL_PRICE ? '⚠️ Price ≥ current — would fill immediately' : '⏳ Waiting for SOL to reach $' + limitPrice}
            </Text>
          </View>

          {!limitPlaced ? (
            <TouchableOpacity style={s.btn} onPress={() => setLimitPlaced(true)}
              disabled={parseFloat(limitPrice) >= CURRENT_SOL_PRICE}>
              <Text style={s.btnTxt}>Place Limit Order</Text>
            </TouchableOpacity>
          ) : (
            <View style={s.successBox}>
              <Text style={s.successTxt}>✓ Limit order placed!</Text>
              <Text style={s.successSub}>Jupiter will execute when SOL hits ${limitPrice}. Order stays active until filled or cancelled.</Text>
              <TouchableOpacity style={s.btn} onPress={onComplete}>
                <Text style={s.btnTxt}>Complete →</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 4: SolanaStakingSim
// Used by: L266 (Solana Staking — Validators, mSOL & JitoSOL)
// ─────────────────────────────────────────────────────────────────────────────

export function SolanaStakingSim({ onComplete, onSkip, islandId = 6 }: SimProps) {
  const wallet = useSimulatorWallet(islandId);
  const [selected, setSelected] = useState<'native' | 'msol' | 'jito' | null>(null);
  const [solAmt, setSolAmt] = useState('10');
  const [confirmed, setConfirmed] = useState(false);

  const sol = parseFloat(solAmt) || 0;

  const options = [
    {
      key: 'native' as const,
      icon: '◎',
      label: 'Native Staking',
      apy: 6.5,
      liquid: false,
      risk: 'None — built into protocol',
      unstake: '2–3 days',
      color: '#9945ff',
      desc: 'Delegate SOL directly to a validator in Phantom. Locked for 2–3 days to unstake. Zero smart contract risk.',
    },
    {
      key: 'msol' as const,
      icon: '🌊',
      label: 'Marinade (mSOL)',
      apy: 6.8,
      liquid: true,
      risk: 'Low — Marinade protocol',
      unstake: 'Instant (swap on Jupiter)',
      color: '#06b6d4',
      desc: 'Deposit SOL → receive mSOL. Earns 6.8% APY. Swap mSOL → SOL instantly on Jupiter anytime.',
    },
    {
      key: 'jito' as const,
      icon: '⚡',
      label: 'Jito (JitoSOL)',
      apy: 7.2,
      liquid: true,
      risk: 'Low — Jito protocol',
      unstake: 'Instant (swap on Jupiter)',
      color: '#f59e0b',
      desc: 'Like mSOL but earns MEV rewards on top. ~7.2% APY. Variable — MEV yield fluctuates with network activity.',
    },
  ];

  const sel = options.find(o => o.key === selected);
  const annualYield = sel ? sol * (sel.apy / 100) : 0;

  return (
    <SimShell icon="🏦" title="Solana Staking" subtitle="Compare native staking, mSOL, and JitoSOL.">
      <PhantomBanner wallet={wallet} />

      <View style={s.panel}>
        <Text style={s.panelTitle}>How much SOL to stake?</Text>
        <View style={s.inputRow}>
          <TextInput style={s.input} value={solAmt} onChangeText={setSolAmt} keyboardType="numeric" />
          <Text style={s.inputLabel}>SOL</Text>
        </View>

        <Text style={[s.panelTitle, { marginTop: Spacing.md }]}>Choose your method:</Text>
        {options.map(opt => (
          <TouchableOpacity key={opt.key} onPress={() => { setSelected(opt.key); setConfirmed(false); }}
            style={[s.stakeCard, { borderLeftColor: opt.color }, selected === opt.key && s.stakeCardActive]}>
            <View style={s.stakeHeader}>
              <Text style={s.stakeIcon}>{opt.icon}</Text>
              <Text style={s.stakeLabel}>{opt.label}</Text>
              <Text style={[s.stakeApy, { color: opt.color }]}>{opt.apy}% APY</Text>
            </View>
            {selected === opt.key && (
              <>
                <Text style={s.stakeDesc}>{opt.desc}</Text>
                <View style={s.stakeStats}>
                  <Text style={s.stakeStat}>💧 Liquid: {opt.liquid ? '✓ Yes' : '✗ No (2–3d unstake)'}</Text>
                  <Text style={s.stakeStat}>⚠️ Risk: {opt.risk}</Text>
                  <Text style={s.stakeStat}>🚪 Exit: {opt.unstake}</Text>
                </View>
                <View style={s.yieldBox}>
                  <Text style={s.yieldTxt}>
                    {sol} SOL × {opt.apy}% = {annualYield.toFixed(4)} SOL/year
                    {'\n'}≈ ${(annualYield * 150).toFixed(2)} at $150/SOL
                  </Text>
                </View>
              </>
            )}
          </TouchableOpacity>
        ))}

        {selected && !confirmed && (
          <TouchableOpacity style={s.btn} onPress={() => setConfirmed(true)}>
            <Text style={s.btnTxt}>Stake {solAmt} SOL with {sel?.label} →</Text>
          </TouchableOpacity>
        )}

        {confirmed && (
          <View style={s.successBox}>
            <Text style={s.successTxt}>✓ Staked on devnet!</Text>
            <Text style={s.successSub}>
              {selected === 'native'
                ? `${solAmt} SOL delegated to validator. Earning ${sel?.apy}% APY. Unstake in 2–3 days.`
                : selected === 'msol'
                ? `${solAmt} SOL → ${solAmt} mSOL (approx). Earning ${sel?.apy}% APY. Swap back anytime.`
                : `${solAmt} SOL → ${solAmt} JitoSOL (approx). Earning ${sel?.apy}% APY (base + MEV). Swap back anytime.`}
            </Text>
            <TouchableOpacity style={s.btn} onPress={onComplete}>
              <Text style={s.btnTxt}>Complete →</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATOR 5: SolanaCompareSim
// Used by: L261, L267, L268, L269, L270
// ─────────────────────────────────────────────────────────────────────────────

export function SolanaCompareSim({ onComplete, onSkip, islandId = 6 }: SimProps) {
  const wallet = useSimulatorWallet(islandId);
  const [scenario, setScenario] = useState(0);
  const [chosen, setChosen] = useState<'solana' | 'ethereum' | null>(null);
  const [allDone, setAllDone] = useState(false);
  const [score, setScore] = useState(0);

  const scenarios = [
    {
      q: 'A game needs 5,000 on-chain moves per day, each costing <$0.001. Which chain?',
      correct: 'solana' as const,
      reason: 'Solana: 5,000 × $0.00025 = $1.25/day. Ethereum mainnet: 5,000 × $5 = $25,000/day. Speed and cost make Solana the only viable option.',
    },
    {
      q: 'A $20M tokenised bond settlement. Security and institutional trust are paramount. Which chain?',
      correct: 'ethereum' as const,
      reason: 'Ethereum: 9 years zero downtime, regulatory clarity (ETH ETF approved), $60B DeFi TVL institutional recognition. The $20 gas fee is irrelevant on a $20M transaction.',
    },
    {
      q: 'Launching a memecoin via bonding curve for a community of 10,000. Which chain?',
      correct: 'solana' as const,
      reason: 'Solana dominates memecoins via pump.fun. Sub-cent fees make it viable for low-value speculation. Ethereum memecoins require $20+ gas — prohibitive for small amounts.',
    },
    {
      q: 'Building a cross-chain DeFi protocol needing maximum composability with existing DeFi (Aave, Uniswap, Compound). Which chain?',
      correct: 'ethereum' as const,
      reason: 'Ethereum mainnet and L2s (Arbitrum, Base) have the deepest DeFi composability. Aave, Uniswap, and Compound are Ethereum-native. Cross-protocol interactions on Ethereum are battle-tested.',
    },
  ];

  const current = scenarios[scenario];

  const handleChoice = (c: 'solana' | 'ethereum') => {
    setChosen(c);
    if (c === current.correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (scenario < scenarios.length - 1) {
      setScenario(s => s + 1);
      setChosen(null);
    } else {
      setAllDone(true);
    }
  };

  return (
    <SimShell icon="⚖️" title="Chain Evaluator" subtitle="Pick the right chain for each use case.">
      <PhantomBanner wallet={wallet} />

      {!allDone ? (
        <View style={s.panel}>
          <View style={s.progressRow}>
            {scenarios.map((_, i) => (
              <View key={i} style={[s.progressDot, i <= scenario && s.progressDotActive, i < scenario && s.progressDotDone]} />
            ))}
            <Text style={s.progressTxt}>{scenario + 1}/{scenarios.length}</Text>
          </View>

          <Text style={s.scenarioQ}>{current.q}</Text>

          <View style={s.chainChoice}>
            {(['solana', 'ethereum'] as const).map(chain => (
              <TouchableOpacity key={chain} onPress={() => !chosen && handleChoice(chain)}
                style={[
                  s.chainBtn,
                  chain === 'solana' ? { borderColor: '#9945ff' } : { borderColor: '#627eea' },
                  chosen === chain && (chosen === current.correct ? s.chainBtnCorrect : s.chainBtnWrong),
                  chosen && chosen !== chain && current.correct === chain && s.chainBtnCorrect,
                ]}>
                <Text style={s.chainBtnIcon}>{chain === 'solana' ? '◎' : 'Ξ'}</Text>
                <Text style={s.chainBtnLabel}>{chain === 'solana' ? 'Solana' : 'Ethereum'}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {chosen && (
            <>
              <View style={chosen === current.correct ? s.successBox : s.errorBox}>
                <Text style={chosen === current.correct ? s.successTxt : s.errorTxt}>
                  {chosen === current.correct ? '✓ Correct!' : '✗ Not quite.'}
                </Text>
                <Text style={s.reasonTxt}>{current.reason}</Text>
              </View>
              <TouchableOpacity style={s.btn} onPress={handleNext}>
                <Text style={s.btnTxt}>{scenario < scenarios.length - 1 ? 'Next →' : 'See Results'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : (
        <View style={s.panel}>
          <Text style={s.resultScore}>{score}/{scenarios.length}</Text>
          <Text style={s.resultTitle}>
            {score === 4 ? '🏆 Perfect — Chain Expert' :
             score === 3 ? '✓ Strong — Almost there' :
             score === 2 ? '📚 Good start — review the reasoning' :
             '📖 Keep studying — the patterns become clear with practice'}
          </Text>
          <Text style={s.resultBody}>
            Key rule: Solana wins on speed + cost for consumer/high-frequency use cases.
            Ethereum wins on security + trust + composability for high-value/institutional use cases.
            Neither is universally "better."
          </Text>
          <TouchableOpacity style={s.completeBtn} onPress={onComplete}>
            <Text style={s.completeBtnTxt}>Complete Island 6 →</Text>
          </TouchableOpacity>
        </View>
      )}
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EXPORTS — add these to SIMULATORS map in SimulatorCard.tsx
// ─────────────────────────────────────────────────────────────────────────────

export const ISLAND_6_SIMS = {
  solanaOverview: SolanaOverviewSim,
  phantomWallet:  PhantomWalletSim,
  solanaJupiter:  SolanaJupiterSim,
  solanaStaking:  SolanaStakingSim,
  solanaCompare:  SolanaCompareSim,
};

// ─────────────────────────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  shell: { flex: 1, backgroundColor: Colors.background },
  backBtn: { padding: Spacing.sm, paddingHorizontal: Spacing.md },
  backTxt: { color: Colors.primary, fontSize: FontSize.sm },
  scroll: { padding: Spacing.md, paddingBottom: 80 },
  icon: { fontSize: 44, textAlign: 'center', marginBottom: Spacing.xs },
  title: { fontSize: FontSize.xl, fontWeight: '700', color: Colors.text, textAlign: 'center' },
  subtitle: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center', marginBottom: Spacing.lg },

  // Phantom banner
  walletPrompt: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#9945ff' },
  walletPromptIcon: { fontSize: 24, marginRight: Spacing.sm },
  walletPromptText: { flex: 1 },
  walletPromptTitle: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  walletPromptSub: { color: Colors.textMuted, fontSize: FontSize.xs },
  walletPromptArrow: { color: '#9945ff', fontSize: 18 },

  // Panel
  panel: { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, ...Shadow.sm },
  panelTitle: { color: Colors.text, fontWeight: '700', fontSize: FontSize.md, marginBottom: Spacing.xs },
  panelBody: { color: Colors.textMuted, fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md },

  // Tabs
  tabBar: { flexDirection: 'row', backgroundColor: Colors.card, borderRadius: Radius.md, padding: 4, marginBottom: Spacing.md },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabIcon: { fontSize: 14 },
  tabLabel: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '600' },
  tabLabelActive: { color: '#fff' },

  // Buttons
  btn: { backgroundColor: Colors.primary, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.sm },
  btnTxt: { color: '#fff', fontWeight: '700', fontSize: FontSize.sm },
  btnOutline: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.xs },
  btnOutlineTxt: { color: Colors.text, fontSize: FontSize.sm },
  completeBtn: { backgroundColor: '#10b981', borderRadius: Radius.md, padding: Spacing.md, alignItems: 'center', marginTop: Spacing.md },
  completeBtnDone: { opacity: 0.6 },
  completeBtnTxt: { color: '#fff', fontWeight: '700', fontSize: FontSize.md },

  // Feedback
  successBox: { backgroundColor: '#052e16', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, borderWidth: 1, borderColor: '#10b981' },
  successTxt: { color: '#10b981', fontWeight: '700', fontSize: FontSize.sm },
  successSub: { color: '#6ee7b7', fontSize: FontSize.xs, marginTop: 4 },
  errorBox: { backgroundColor: '#2a0a0a', borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.sm, borderWidth: 1, borderColor: '#ef4444' },
  errorTxt: { color: '#ef4444', fontWeight: '700', fontSize: FontSize.sm },

  // PoH
  pohChain: { marginVertical: Spacing.sm },
  pohRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  pohDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#9945ff', marginTop: 4, marginRight: Spacing.sm },
  pohContent: { flex: 1 },
  pohHash: { color: '#9945ff', fontSize: FontSize.xs, fontFamily: 'monospace' },
  pohTime: { color: Colors.textMuted, fontSize: FontSize.xs },

  // Fee grid
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  input: { flex: 1, backgroundColor: Colors.background, color: Colors.text, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border, marginRight: Spacing.sm },
  inputLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  feeGrid: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.sm },
  feeCard: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, alignItems: 'center' },
  feeChain: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 4 },
  feeAmt: { color: Colors.text, fontSize: FontSize.lg, fontWeight: '700' },
  feeSub: { color: Colors.textMuted, fontSize: FontSize.xs },
  savingsBox: { backgroundColor: '#052e16', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.sm },
  savingsTxt: { color: '#10b981', fontSize: FontSize.xs, textAlign: 'center' },

  // SOL jobs
  jobCard: { backgroundColor: Colors.background, borderRadius: Radius.sm, padding: Spacing.md, marginBottom: Spacing.sm, borderLeftWidth: 3, borderWidth: 1, borderColor: Colors.border },
  jobCardActive: { borderColor: Colors.primary },
  jobLabel: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  jobDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 4 },
  rentNote: { backgroundColor: '#1a1a2e', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.sm },
  rentNoteTxt: { color: '#a78bfa', fontSize: FontSize.xs },

  // Features
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.sm },
  featureIcon: { fontSize: 20, marginRight: Spacing.sm, width: 28 },
  featureText: { flex: 1 },
  featureLabel: { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  featureSub: { color: Colors.textMuted, fontSize: FontSize.xs },

  // Phrase drill
  phraseTarget: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginBottom: Spacing.md },
  phraseSlot: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, paddingHorizontal: 6, paddingVertical: 4, minWidth: 50 },
  phraseSlotFilled: { borderColor: '#9945ff' },
  phraseSlotTxt: { color: Colors.text, fontSize: FontSize.xs, textAlign: 'center' },
  wordBank: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  wordChip: { backgroundColor: Colors.card, borderRadius: Radius.sm, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: Colors.border },
  wordChipUsed: { opacity: 0.3 },
  wordChipTxt: { color: Colors.text, fontSize: FontSize.sm },
  wordChipTxtUsed: { color: Colors.textMuted },

  // Quiz
  quizOpt: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  quizCorrect: { borderColor: '#10b981', backgroundColor: '#052e16' },
  quizWrong: { borderColor: '#ef4444', backgroundColor: '#2a0a0a' },
  quizOptTxt: { color: Colors.text, fontSize: FontSize.sm },
  quizFeedback: { color: '#10b981', fontSize: FontSize.xs, marginTop: 4 },
  quizFeedbackWrong: { color: '#ef4444', fontSize: FontSize.xs, marginTop: 4 },

  // NFT spam
  nftRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background, borderRadius: Radius.sm, padding: Spacing.sm, marginBottom: 6, borderWidth: 1, borderColor: Colors.border },
  nftSafe: { borderColor: '#10b981' },
  nftSpam: { borderColor: '#ef4444' },
  nftIcon: { fontSize: 18, marginRight: Spacing.sm },
  nftName: { flex: 1, color: Colors.text, fontSize: FontSize.sm },
  nftVerdict: { color: Colors.textMuted, fontSize: FontSize.xs, fontWeight: '700' },
  spamNote: { backgroundColor: '#1a1a2e', borderRadius: Radius.sm, padding: Spacing.sm, marginVertical: Spacing.sm },
  spamNoteTxt: { color: '#a78bfa', fontSize: FontSize.xs },

  // Swap
  swapBox: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  swapFrom: { marginBottom: Spacing.sm },
  swapLabel: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 4 },
  swapRow: { flexDirection: 'row', alignItems: 'center' },
  swapInput: { flex: 1, color: Colors.text, fontSize: FontSize.lg, fontWeight: '700', backgroundColor: Colors.card, borderRadius: Radius.sm, padding: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  swapToken: { color: Colors.textMuted, fontSize: FontSize.md, marginLeft: Spacing.sm, fontWeight: '600' },
  swapArrow: { color: Colors.textMuted, textAlign: 'center', fontSize: 20, marginVertical: 4 },
  swapTo: {},
  swapResult: { color: '#9945ff', fontSize: FontSize.lg, fontWeight: '700' },
  routeTitle: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 6 },
  routeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  routeDex: { color: Colors.text, fontSize: FontSize.xs, width: 60 },
  routeBar: { flex: 1, height: 8, backgroundColor: Colors.border, borderRadius: 4, marginHorizontal: 6 },
  routeBarFill: { height: 8, backgroundColor: '#9945ff', borderRadius: 4 },
  routePct: { color: Colors.textMuted, fontSize: FontSize.xs, width: 32, textAlign: 'right' },
  routePrice: { color: Colors.text, fontSize: FontSize.xs, width: 48, textAlign: 'right' },

  // DCA
  dcaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  dcaLabel: { color: Colors.textMuted, fontSize: FontSize.sm, marginHorizontal: 4 },
  dcaInput: { width: 70, backgroundColor: Colors.background, color: Colors.text, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border, textAlign: 'center' },
  freqBar: { flexDirection: 'row', backgroundColor: Colors.background, borderRadius: Radius.md, padding: 4, marginBottom: Spacing.md },
  freqBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: Radius.sm },
  freqBtnActive: { backgroundColor: '#9945ff' },
  freqTxt: { color: Colors.textMuted, fontSize: FontSize.xs, textCapitalize: 'capitalize' },
  freqTxtActive: { color: '#fff', fontWeight: '700' },
  dcaSummary: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  dcaSummaryTxt: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 22 },

  // Limit
  limitForm: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginBottom: Spacing.md },
  limitLabel: { color: Colors.textMuted, fontSize: FontSize.sm },
  limitInput: { width: 60, backgroundColor: Colors.background, color: Colors.text, borderRadius: Radius.sm, padding: Spacing.sm, fontSize: FontSize.md, borderWidth: 1, borderColor: Colors.border, textAlign: 'center' },
  limitSummary: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, marginBottom: Spacing.sm },
  limitSummaryTxt: { color: Colors.text, fontSize: FontSize.sm, lineHeight: 22 },

  // Staking
  stakeCard: { backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, borderLeftWidth: 3 },
  stakeCardActive: { borderColor: Colors.primary },
  stakeHeader: { flexDirection: 'row', alignItems: 'center' },
  stakeIcon: { fontSize: 20, marginRight: Spacing.sm },
  stakeLabel: { flex: 1, color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  stakeApy: { fontWeight: '700', fontSize: FontSize.md },
  stakeDesc: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: Spacing.sm, lineHeight: 18 },
  stakeStats: { marginTop: Spacing.sm },
  stakeStat: { color: Colors.textMuted, fontSize: FontSize.xs, marginBottom: 2 },
  yieldBox: { backgroundColor: '#052e16', borderRadius: Radius.sm, padding: Spacing.sm, marginTop: Spacing.sm },
  yieldTxt: { color: '#10b981', fontSize: FontSize.xs, lineHeight: 18 },

  // Chain compare
  progressRow: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md },
  progressDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: Colors.border, marginRight: 4 },
  progressDotActive: { backgroundColor: Colors.primary },
  progressDotDone: { backgroundColor: '#10b981' },
  progressTxt: { color: Colors.textMuted, fontSize: FontSize.xs, marginLeft: Spacing.sm },
  scenarioQ: { color: Colors.text, fontSize: FontSize.md, fontWeight: '600', lineHeight: 22, marginBottom: Spacing.lg },
  chainChoice: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.md },
  chainBtn: { flex: 1, backgroundColor: Colors.background, borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', borderWidth: 2 },
  chainBtnCorrect: { backgroundColor: '#052e16', borderColor: '#10b981' },
  chainBtnWrong: { backgroundColor: '#2a0a0a', borderColor: '#ef4444' },
  chainBtnIcon: { fontSize: 28, marginBottom: 4 },
  chainBtnLabel: { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm },
  reasonTxt: { color: Colors.textMuted, fontSize: FontSize.xs, marginTop: 6, lineHeight: 18 },
  resultScore: { fontSize: 48, fontWeight: '900', color: Colors.primary, textAlign: 'center', marginBottom: 8 },
  resultTitle: { color: Colors.text, fontWeight: '700', fontSize: FontSize.md, textAlign: 'center', marginBottom: Spacing.md },
  resultBody: { color: Colors.textMuted, fontSize: FontSize.sm, lineHeight: 20, textAlign: 'center' },
});
