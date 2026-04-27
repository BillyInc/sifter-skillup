/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * SimulatorCard_ADDITIONS.tsx
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * HOW TO USE THIS FILE
 * ────────────────────
 * This file contains ALL new simulator components that upgrade SimulatorCard.tsx.
 * SimulatorCard.tsx is a single monolith — everything lives inline in one file.
 *
 * STEP 1 — Add the imports block at the top of SimulatorCard.tsx (after existing imports):
 *
 *   import * as SecureStore from 'expo-secure-store';  // for wallet components
 *   import * as LocalAuthentication from 'expo-local-authentication';
 *   import { Clipboard, Linking } from 'react-native';
 *
 * STEP 2 — Copy EVERYTHING between the ═══ PASTE INTO SimulatorCard.tsx ═══ markers
 *   and paste it BEFORE the existing `const SIMULATORS` map in SimulatorCard.tsx.
 *
 * STEP 3 — Update SimulatorCardProps and the default export function:
 *   interface SimulatorCardProps {
 *     simulatorType: string;
 *     islandId: number;          ← ADD THIS
 *     onComplete: () => void;
 *     onSkip:     () => void;
 *   }
 *   export default function SimulatorCard({ simulatorType, islandId, onComplete, onSkip })
 *
 * STEP 4 — Replace the SIMULATORS map entries shown below in the SIMULATORS MAP UPDATES section.
 *
 * STEP 5 — In LessonScreen.tsx, thread islandId to SimulatorCard:
 *   import { getIslandForLevel } from '../data/islands1_6_walletIntegration';
 *   <SimulatorCard
 *     simulatorType={q.simulatorType ?? ''}
 *     islandId={getIslandForLevel(levelId)}
 *     onComplete={...}
 *     onSkip={...}
 *   />
 *
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// ── Testnet chain config (inline — or import from src/config/TESTNET_CONFIG.ts) ──

const TESTNET_CHAINS_CONFIG = {
  'bitcoin-testnet4': { icon: '₿', name: 'Bitcoin Testnet4', shortName: 'BTC Test', nativeSymbol: 'tBTC', explorerUrl: 'https://mempool.space/testnet4', faucetUrl: 'https://mempool.space/testnet4/faucet', faucetLabel: 'Get test BTC', demoBalance: '0.0842 tBTC' },
  'ethereum-sepolia': { icon: '⟠', name: 'Ethereum Sepolia', shortName: 'ETH Sepolia', nativeSymbol: 'ETH', explorerUrl: 'https://sepolia.etherscan.io', faucetUrl: 'https://sepoliafaucet.com', faucetLabel: 'Get Sepolia ETH', demoBalance: '1.5 ETH' },
  'bnb-testnet':      { icon: '🟡', name: 'BNB Testnet', shortName: 'BNB Test', nativeSymbol: 'tBNB', explorerUrl: 'https://testnet.bscscan.com', faucetUrl: 'https://www.bnbchain.org/en/testnet-faucet', faucetLabel: 'Get tBNB', demoBalance: '2.5 tBNB' },
  'solana-devnet':    { icon: '◎', name: 'Solana Devnet', shortName: 'SOL Devnet', nativeSymbol: 'SOL', explorerUrl: 'https://explorer.solana.com/?cluster=devnet', faucetUrl: 'https://faucet.solana.com', faucetLabel: 'Get devnet SOL', demoBalance: '5.0 SOL' },
  'arbitrum-sepolia': { icon: '🔵', name: 'Arbitrum Sepolia', shortName: 'ARB Sepolia', nativeSymbol: 'ETH', explorerUrl: 'https://sepolia.arbiscan.io', faucetUrl: 'https://faucets.chain.link/arbitrum-sepolia', faucetLabel: 'Get ARB ETH', demoBalance: '0.5 ETH' },
  'base-sepolia':     { icon: '🔵', name: 'Base Sepolia', shortName: 'Base Test', nativeSymbol: 'ETH', explorerUrl: 'https://sepolia.basescan.org', faucetUrl: 'https://faucets.chain.link/base-sepolia', faucetLabel: 'Get Base ETH', demoBalance: '0.5 ETH' },
  'ton-testnet':      { icon: '💎', name: 'TON Testnet', shortName: 'TON Test', nativeSymbol: 'TON', explorerUrl: 'https://testnet.tonscan.org', faucetUrl: 'https://t.me/testgiver_ton_bot', faucetLabel: 'Get test TON (Telegram bot)', demoBalance: '50.0 TON' },
} as const;

const ISLAND_TO_CHAIN: Record<number, keyof typeof TESTNET_CHAINS_CONFIG> = {
  1: 'bitcoin-testnet4', 2: 'ethereum-sepolia', 3: 'ethereum-sepolia',
  4: 'ethereum-sepolia', 5: 'bnb-testnet', 6: 'solana-devnet',
  7: 'ethereum-sepolia', 8: 'arbitrum-sepolia', 9: 'solana-devnet',
  10: 'arbitrum-sepolia', 12: 'base-sepolia', 13: 'ton-testnet',
  14: 'ethereum-sepolia', 15: 'ethereum-sepolia', 16: 'ethereum-sepolia',
  17: 'ethereum-sepolia', 18: 'ethereum-sepolia',
};

const DEMO_ADDRESSES: Record<string, string> = {
  'bitcoin-testnet4':  'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
  'ethereum-sepolia':  '0xA4b1C2d3E4f5a6B7c8D9e0f1A2b3C4d5E6f7A8b9',
  'bnb-testnet':       '0xA4b1C2d3E4f5a6B7c8D9e0f1A2b3C4d5E6f7A8b9',
  'solana-devnet':     '7kbn3xPo9vFqtYzRmU4WsAbCdEfGhIjKlMnOpQrSt',
  'arbitrum-sepolia':  '0xA4b1C2d3E4f5a6B7c8D9e0f1A2b3C4d5E6f7A8b9',
  'base-sepolia':      '0xA4b1C2d3E4f5a6B7c8D9e0f1A2b3C4d5E6f7A8b9',
  'ton-testnet':       'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG',
};

// ── Wallet state hook (simplified inline — full version in WalletProvider.tsx) ──

function useIslandWallet(islandId: number) {
  const [address, setAddress] = React.useState<string | null>(null);
  const [balance, setBalance] = React.useState('0');
  const [status, setStatus] = React.useState<'not_created' | 'needs_faucet' | 'ready' | 'demo_mode'>('not_created');
  const [showCreate, setShowCreate] = React.useState(false);
  const chainKey = ISLAND_TO_CHAIN[islandId] ?? 'ethereum-sepolia';
  const chain = TESTNET_CHAINS_CONFIG[chainKey];

  React.useEffect(() => {
    // Try to load wallet from WalletProvider context if available
    // Falls back to demo mode if no wallet exists
    const demoAddr = DEMO_ADDRESSES[chainKey];
    if (demoAddr) {
      setAddress(demoAddr);
      setBalance(chain.demoBalance);
      setStatus('demo_mode');
    }
  }, [islandId, chainKey]);

  const shortAddress = address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'No wallet';
  const isDemoMode = status === 'demo_mode';

  return { address, balance, status, shortAddress, chain, isDemoMode,
    showCreatePrompt: () => setShowCreate(true), requestFaucet: () => {} };
}

// ── WalletBanner — shows inside any sim that uses a real address ─────────────

function WalletBanner({ islandId }: { islandId: number }) {
  const wallet = useIslandWallet(islandId);
  const [copied, setCopied] = React.useState(false);

  if (wallet.status === 'not_created') {
    return (
      <TouchableOpacity onPress={wallet.showCreatePrompt}
        style={{ padding: 12, backgroundColor: '#eff6ff', borderRadius: 10, borderWidth: 1.5, borderColor: Colors.accent, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text style={{ fontSize: 18 }}>{wallet.chain.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '800', color: Colors.accent, fontSize: 13 }}>Create {wallet.chain.name} Wallet</Text>
          <Text style={{ fontSize: 11, color: Colors.textSoft, marginTop: 1 }}>Use your real testnet address in this simulator</Text>
        </View>
        <Text style={{ color: Colors.accent, fontWeight: '800' }}>→</Text>
      </TouchableOpacity>
    );
  }

  const copyAddr = () => {
    if (wallet.address) { Clipboard.setString(wallet.address); setCopied(true); setTimeout(() => setCopied(false), 2000); }
  };

  return (
    <TouchableOpacity onPress={copyAddr} activeOpacity={0.85}
      style={{ padding: 10, backgroundColor: wallet.isDemoMode ? '#fefce8' : '#f0fdf4', borderRadius: 10, borderWidth: 1.5, borderColor: wallet.isDemoMode ? '#f59e0b' : Colors.green, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <Text style={{ fontSize: 16 }}>{wallet.chain.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 9, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase' }}>{wallet.chain.shortName} {wallet.isDemoMode ? '· Demo' : '· Testnet'}</Text>
        <Text style={{ fontFamily: 'monospace', fontSize: 11, color: Colors.text, fontWeight: '700' }}>{wallet.shortAddress}</Text>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: wallet.isDemoMode ? '#92400e' : Colors.green }}>{wallet.balance}</Text>
        <Text style={{ fontSize: 9, color: Colors.textSoft }}>{copied ? '✓ Copied' : '📋 tap'}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ══ PASTE INTO SimulatorCard.tsx — START ═══════════════════════════════════════
// Place this entire section BEFORE the `const SIMULATORS` map
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// WALLET-ENHANCED REPLACEMENTS (replace existing sims in SIMULATORS map)
// ─────────────────────────────────────────────────────────────────────────────

function SendBitcoinEnhancedSim({ onComplete, onSkip, islandId = 1 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const [to, setTo] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [feeLevel, setFeeLevel] = React.useState<'slow'|'medium'|'fast'>('medium');
  const [step, setStep] = React.useState<'form'|'confirm'|'done'>('form');
  const fees = { slow: { time:'~60 min', btc:'0.00002' }, medium: { time:'~20 min', btc:'0.00004' }, fast: { time:'~10 min', btc:'0.00008' } };
  const fee = fees[feeLevel];
  const amtF = parseFloat(amount) || 0;
  const valid = to.length > 10 && amtF > 0;

  return (
    <SimShell icon="₿" title="Send Bitcoin" subtitle="Build a real transaction from your Bitcoin Testnet4 wallet.">
      <WalletBanner islandId={islandId} />
      {step === 'form' && (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>RECIPIENT (Testnet4)</Text>
            <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 14, color: Colors.text, backgroundColor: Colors.card }}
              value={to} onChangeText={setTo} placeholder="tb1q..." placeholderTextColor={Colors.textSoft} autoCapitalize="none" />
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>AMOUNT (tBTC)</Text>
            <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', color: Colors.text, backgroundColor: Colors.card }}
              value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="0.001" placeholderTextColor={Colors.textSoft} />
          </View>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['slow','medium','fast'] as const).map(l => (
              <TouchableOpacity key={l} onPress={() => setFeeLevel(l)} style={{ flex: 1, padding: 10, borderRadius: 10, borderWidth: 2, alignItems: 'center', borderColor: feeLevel === l ? Colors.accent : Colors.border, backgroundColor: feeLevel === l ? '#eff6ff' : Colors.card }}>
                <Text style={{ fontWeight: '800', fontSize: 12, color: feeLevel === l ? Colors.accent : Colors.text }}>{l.charAt(0).toUpperCase() + l.slice(1)}</Text>
                <Text style={{ fontSize: 10, color: Colors.textSoft }}>{fees[l].time}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {amtF > 0 && <Text style={{ fontSize: 12, color: Colors.text }}>Total: {(amtF + parseFloat(fee.btc)).toFixed(5)} tBTC</Text>}
          <PrimaryBtn label="Review Transaction →" onPress={() => setStep('confirm')} disabled={!valid} />
        </>
      )}
      {step === 'confirm' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 6, borderWidth: 1.5, borderColor: Colors.border }}>
            {[['From', wallet.shortAddress], ['To', to.slice(0,12)+'…'+to.slice(-6)], ['Amount', amount+' tBTC'], ['Fee', fee.btc+' tBTC · '+fee.time]].map(([k,v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={{ padding: 12, backgroundColor: '#fef3c7', borderRadius: 10 }}>
            <Text style={{ color: '#92400e', fontWeight: '700', fontSize: 13 }}>⚠️ Bitcoin transactions are irreversible. Verify every character of the address.</Text>
          </View>
          <PrimaryBtn label="✓ Sign & Broadcast" onPress={() => setStep('done')} />
        </>
      )}
      {step === 'done' && (
        <>
          <ResultBox correct message={`Broadcast from ${wallet.shortAddress}! Miners will confirm it ${fee.time}. View on mempool.space/testnet4.`} />
          <TouchableOpacity onPress={() => Linking.openURL(`https://mempool.space/testnet4/address/${wallet.address}`)}>
            <Text style={{ color: Colors.accent, fontWeight: '700', textAlign: 'center', padding: 12 }}>View on Testnet4 Explorer →</Text>
          </TouchableOpacity>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BnbPancakeEnhancedSim({ onComplete, onSkip, islandId = 5 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const [amount, setAmount] = React.useState('0.5');
  const [confirmed, setConfirmed] = React.useState(false);
  const amtF = parseFloat(amount) || 0;
  const received = (amtF * 64).toFixed(0);
  return (
    <SimShell icon="🥞" title="Swap on PancakeSwap" subtitle="Swap tBNB for CAKE on BSC Testnet from your own wallet.">
      <WalletBanner islandId={islandId} />
      <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 8, borderWidth: 1.5, borderColor: Colors.border }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>SWAP tBNB → CAKE</Text>
        <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', color: Colors.text, backgroundColor: Colors.card }}
          value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        {[['Rate','1 tBNB ≈ 64 CAKE'],['You receive',`~${received} CAKE`],['Fee (0.25%)',`${(amtF*0.0025).toFixed(4)} tBNB`],['Gas','~$0.10 (BSC Testnet)'],['Explorer','testnet.bscscan.com']].map(([k,v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{v}</Text>
          </View>
        ))}
      </View>
      {!confirmed
        ? <PrimaryBtn label={`Swap ${amount} tBNB →`} onPress={() => setConfirmed(true)} disabled={amtF <= 0} />
        : <><ResultBox correct message={`Swapped from ${wallet.shortAddress}! View on testnet.bscscan.com.`} />
            <TouchableOpacity onPress={() => Linking.openURL(`https://testnet.bscscan.com/address/${wallet.address}`)}>
              <Text style={{ color: Colors.accent, fontWeight: '700', textAlign: 'center', padding: 8 }}>View on BSCScan Testnet →</Text>
            </TouchableOpacity>
            <PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function TonWalletEnhancedSim({ onComplete, onSkip, islandId = 13 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const [amount, setAmount] = React.useState('');
  const [step, setStep] = React.useState<'input'|'confirm'|'done'>('input');
  const TARGET = '10';
  const ALICE = 'EQBvW8Z5huBkMJYdnfAEM5JqTNkuWX3diqYENkWsIL0XggGG';
  return (
    <SimShell icon="💎" title="Send 10 TON to Alice" subtitle="Practice a real TON wallet transaction with your testnet address.">
      <WalletBanner islandId={islandId} />
      {step === 'input' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 6, borderWidth: 1.5, borderColor: Colors.border }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>YOUR BALANCE</Text>
            <Text style={{ fontSize: 18, fontWeight: '800', color: Colors.text }}>{wallet.balance}</Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft, marginTop: 8 }}>RECIPIENT</Text>
            <Text style={{ fontFamily: 'monospace', fontSize: 11, color: Colors.accent }}>{ALICE.slice(0,20)}…{ALICE.slice(-8)}</Text>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft, marginTop: 8 }}>AMOUNT (TON)</Text>
            <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', color: Colors.text }}
              value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="Enter amount" placeholderTextColor={Colors.textSoft} />
            {amount !== '' && parseFloat(amount) !== parseFloat(TARGET) && <Text style={{ fontSize: 11, color: Colors.red }}>💡 Alice needs exactly {TARGET} TON</Text>}
          </View>
          <PrimaryBtn label="Continue →" onPress={() => parseFloat(amount) === parseFloat(TARGET) && setStep('confirm')} disabled={!amount} />
        </>
      )}
      {step === 'confirm' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 6, borderWidth: 1.5, borderColor: Colors.border }}>
            {[['From', wallet.shortAddress],['To','Alice'],['Amount', amount+' TON'],['Fee','~0.01 TON'],['Total',(parseFloat(amount)+0.01).toFixed(2)+' TON']].map(([k,v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{v}</Text>
              </View>
            ))}
          </View>
          <PrimaryBtn label="✓ Confirm & Send" onPress={() => setStep('done')} />
        </>
      )}
      {step === 'done' && (
        <>
          <ResultBox correct message="Sent! TON confirms in ~5 seconds — one of the fastest chains. Fees cost fractions of a cent." />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function TonStakingEnhancedSim({ onComplete, onSkip, islandId = 13 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const [amount, setAmount] = React.useState('100');
  const [period, setPeriod] = React.useState(12);
  const [confirmed, setConfirmed] = React.useState(false);
  const amtF = parseFloat(amount) || 0;
  const yearly = (amtF * 0.054 * period / 12).toFixed(2);
  return (
    <SimShell icon="🏦" title="Stake TON with a Validator" subtitle="See how TON staking rewards are calculated from your testnet wallet.">
      <WalletBanner islandId={islandId} />
      <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 8, borderWidth: 1.5, borderColor: Colors.border }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>AMOUNT TO STAKE (TON)</Text>
        <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', color: Colors.text }}
          value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} />
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>LOCK PERIOD</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {[1,3,6,12].map(m => (
            <TouchableOpacity key={m} onPress={() => setPeriod(m)} style={{ flex: 1, padding: 8, borderRadius: 8, borderWidth: 2, alignItems: 'center', borderColor: period === m ? Colors.accent : Colors.border, backgroundColor: period === m ? '#eff6ff' : Colors.card }}>
              <Text style={{ fontWeight: '800', fontSize: 12, color: period === m ? Colors.accent : Colors.text }}>{m}mo</Text>
            </TouchableOpacity>
          ))}
        </View>
        {[['APY','5.4%'],['After '+period+'mo',`+${yearly} TON`],['Validator','Whales.io (99.9% uptime)']].map(([k,v]) => (
          <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
            <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{v}</Text>
          </View>
        ))}
      </View>
      {!confirmed
        ? <PrimaryBtn label={`Stake ${amount} TON for ${period} Month${period>1?'s':''} →`} onPress={() => setConfirmed(true)} disabled={!amount || parseFloat(amount) < 1} />
        : <><ResultBox correct message={`Staked from ${wallet.shortAddress}! You'll earn ~${yearly} TON. No slashing for delegators on TON.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function SolanaPumpEnhancedSim({ onComplete, onSkip, islandId = 9 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const [tokenName, setTokenName] = React.useState('');
  const [ticker, setTicker] = React.useState('');
  const [step, setStep] = React.useState<'create'|'launch'|'curve'|'result'>('create');
  const [buys, setBuys] = React.useState(0);
  const pct = Math.min(100, (buys / 20) * 100);
  const graduated = buys >= 20;
  return (
    <SimShell icon="🎰" title="Launch on pump.fun" subtitle="Create and launch a memecoin from your Solana devnet wallet.">
      <WalletBanner islandId={islandId} />
      {step === 'create' && (
        <>
          <View style={{ gap: 8 }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>TOKEN NAME</Text>
            <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 16, color: Colors.text }} value={tokenName} onChangeText={setTokenName} placeholder="e.g. DogeOnSteroids" placeholderTextColor={Colors.textMuted} />
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>TICKER</Text>
            <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 16, color: Colors.text }} value={ticker} onChangeText={t => setTicker(t.toUpperCase().slice(0,8))} placeholder="e.g. DOS" placeholderTextColor={Colors.textMuted} />
            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 8, padding: 10 }}>
              <Text style={{ fontSize: 12, color: Colors.textSoft }}>Creation fee: 0.02 SOL from <Text style={{ color: Colors.accent, fontFamily: 'monospace' }}>{wallet.shortAddress}</Text></Text>
            </View>
          </View>
          <PrimaryBtn label="Launch Token →" onPress={() => setStep('launch')} disabled={!tokenName || !ticker} />
        </>
      )}
      {step === 'launch' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, alignItems: 'center', gap: 8, borderWidth: 1.5, borderColor: Colors.border }}>
            <Text style={{ fontSize: 18 }}>🚀</Text>
            <Text style={{ fontWeight: '800', fontSize: 18, color: Colors.accent }}>${ticker}</Text>
            <Text style={{ color: Colors.textSoft }}>{tokenName} is LIVE on pump.fun (Devnet)</Text>
            <Text style={{ fontSize: 12, color: Colors.textSoft }}>Creator: {wallet.shortAddress}</Text>
          </View>
          <PrimaryBtn label="Simulate Buy Pressure →" onPress={() => setStep('curve')} />
        </>
      )}
      {step === 'curve' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 10, borderWidth: 1.5, borderColor: Colors.border }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>BONDING CURVE — {pct.toFixed(0)}% TO GRADUATION</Text>
            <View style={{ height: 12, backgroundColor: Colors.border, borderRadius: 99, overflow: 'hidden' }}>
              <View style={{ height: 12, borderRadius: 99, backgroundColor: graduated ? Colors.green : Colors.accent, width: `${pct}%` as any }} />
            </View>
            {[['Buyers', buys+' traders'],['Price',`$${(0.000001 * Math.pow(1.05, buys)).toFixed(9)}`],['Market cap',`$${(buys * 3000).toLocaleString()}`]].map(([k,v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{v}</Text>
              </View>
            ))}
            {!graduated
              ? <TouchableOpacity onPress={() => setBuys(b => b + 1)} style={{ padding: 12, backgroundColor: Colors.accent, borderRadius: 10, alignItems: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800' }}>🟢 Simulate a Buy (+1 trader)</Text>
                </TouchableOpacity>
              : <View style={{ padding: 10, backgroundColor: '#d1fae5', borderRadius: 8 }}>
                  <Text style={{ fontWeight: '800', color: Colors.green }}>🎓 GRADUATED! Migrates to Raydium with permanent LP.</Text>
                </View>}
          </View>
          <PrimaryBtn label="See Results →" onPress={() => setStep('result')} />
        </>
      )}
      {step === 'result' && (
        <>
          <ResultBox correct={graduated} message={graduated ? `${ticker} graduated! Creator (${wallet.shortAddress}) earns LP fees on every trade.` : `${ticker} still on curve. 98% of pump.fun tokens never graduate.`} />
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function NftMintEnhancedSim({ onComplete, onSkip, islandId = 7 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const [qty, setQty] = React.useState(1);
  const [step, setStep] = React.useState<'select'|'approve'|'done'>('select');
  const total = (qty * 0.08 + 0.012).toFixed(4);
  return (
    <SimShell icon="🖼️" title="Mint an NFT" subtitle="Walk through a real mint with your Ethereum Sepolia wallet.">
      <WalletBanner islandId={islandId} />
      {step === 'select' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 6, borderWidth: 1.5, borderColor: Colors.border }}>
            <Text style={{ fontWeight: '800', fontSize: 18, color: Colors.text }}>PixelPunks Collection</Text>
            <Text style={{ color: Colors.textSoft, fontSize: 13 }}>10,000 unique PFPs. 4,200 remaining.</Text>
            {[['Mint price','0.08 ETH'],['Gas (Sepolia)','~0.012 ETH'],['Network','Ethereum Sepolia'],['From',wallet.shortAddress]].map(([k,v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
                <Text style={{ fontSize: 13, fontWeight: '700', color: Colors.text }}>{v}</Text>
              </View>
            ))}
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft, marginTop: 8 }}>HOW MANY?</Text>
            <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
              {[1,2,3].map(n => (
                <TouchableOpacity key={n} onPress={() => setQty(n)} style={{ paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, borderWidth: 2, borderColor: qty === n ? Colors.accent : Colors.border, backgroundColor: qty === n ? '#eff6ff' : Colors.card }}>
                  <Text style={{ fontWeight: '800', fontSize: 18, color: qty === n ? Colors.accent : Colors.text }}>{n}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 8, marginTop: 4 }}>
              <Text style={{ fontWeight: '800' }}>Total</Text>
              <Text style={{ fontWeight: '800', fontSize: 16, color: Colors.accent }}>{total} ETH</Text>
            </View>
          </View>
          <PrimaryBtn label="Mint Now →" onPress={() => setStep('approve')} />
        </>
      )}
      {step === 'approve' && (
        <>
          <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, gap: 6, borderWidth: 1.5, borderColor: Colors.border }}>
            <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>MetaMask — CONFIRM TRANSACTION</Text>
            <Text style={{ fontWeight: '800', fontSize: 14 }}>PixelPunks.mint()</Text>
            {[['From',wallet.shortAddress],['Contract','0x58cB...dF3a (Sepolia)'],['Value sent',(qty*0.08).toFixed(3)+' ETH'],['Gas est.','0.012 ETH']].map(([k,v]) => (
              <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 13, color: Colors.textSoft }}>{k}</Text>
                <Text style={{ fontSize: 12, fontWeight: '700', color: Colors.text, textAlign: 'right', flex: 1, marginLeft: 8 }}>{v}</Text>
              </View>
            ))}
            <View style={{ padding: 10, backgroundColor: '#fef3c7', borderRadius: 8, marginTop: 4 }}>
              <Text style={{ fontWeight: '700', color: '#92400e', fontSize: 12 }}>⚠️ BEFORE CONFIRMING: verify contract address on Sepolia Etherscan.</Text>
            </View>
          </View>
          <PrimaryBtn label="✓ Confirm Mint" onPress={() => setStep('done')} />
          <GhostBtn label="Reject" onPress={() => setStep('select')} />
        </>
      )}
      {step === 'done' && (
        <>
          <ResultBox correct message={`Minted ${qty} NFT${qty>1?'s':''} from ${wallet.shortAddress}! Appears in OpenSea testnet within ~5 minutes.`} />
          <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.etherscan.io/address/${wallet.address}`)}>
            <Text style={{ color: Colors.accent, fontWeight: '700', textAlign: 'center', padding: 8 }}>View on Sepolia Etherscan →</Text>
          </TouchableOpacity>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function AirdropFarmEnhancedSim({ onComplete, onSkip, islandId = 10 }: SimProps & { islandId?: number }) {
  const wallet = useIslandWallet(islandId);
  const tasks = [
    { id: 'bridge', label: 'Bridge ETH to the new L2', points: 25, sybil: false, tip: 'Bridge from a wallet with history. Vary amounts.' },
    { id: 'swap', label: 'Swap tokens on the native DEX', points: 20, sybil: false, tip: '$5 swaps get flagged. Use realistic amounts.' },
    { id: 'lp', label: 'Provide liquidity (even $100)', points: 30, sybil: false, tip: 'LP shows genuine commitment to the protocol.' },
    { id: 'governance', label: 'Vote on a governance proposal', points: 15, sybil: false, tip: 'On-chain governance = strongest genuine signal.' },
    { id: 'multiWallet', label: 'Repeat from 10 wallets (Sybil farming)', points: -50, sybil: true, tip: 'Graph analysis catches this — all wallets get zero allocation.' },
  ];
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [submitted, setSubmitted] = React.useState(false);
  const score = [...selected].reduce((acc, id) => acc + (tasks.find(t => t.id === id)?.points || 0), 0);
  const pickedSybil = selected.has('multiWallet');
  const passed = score >= 50 && !pickedSybil;
  return (
    <SimShell icon="🪂" title="Build an Airdrop Strategy" subtitle="Choose farming activities from your Arbitrum Sepolia wallet. One genuine wallet beats ten farming wallets.">
      <WalletBanner islandId={islandId} />
      {tasks.map(task => {
        const isSel = selected.has(task.id);
        return (
          <TouchableOpacity key={task.id} disabled={submitted} onPress={() => setSelected(prev => { const s = new Set(prev); s.has(task.id) ? s.delete(task.id) : s.add(task.id); return s; })}
            style={{ padding: 12, borderRadius: 10, borderWidth: 2, borderColor: isSel ? (task.sybil ? Colors.red : Colors.green) : Colors.border, backgroundColor: isSel ? (task.sybil ? '#fee2e2' : '#d1fae5') : Colors.card }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '800', fontSize: 13, color: Colors.text }}>{task.label}</Text>
                {submitted && <Text style={{ fontSize: 11, color: Colors.textSoft, marginTop: 2 }}>💡 {task.tip}</Text>}
              </View>
              <Text style={{ fontWeight: '800', color: task.points > 0 ? Colors.green : Colors.red, fontSize: 16 }}>{task.points > 0 ? '+' : ''}{task.points}</Text>
            </View>
          </TouchableOpacity>
        );
      })}
      {!submitted
        ? <PrimaryBtn label={`Submit Strategy (${score} pts) →`} onPress={() => setSubmitted(true)} disabled={selected.size === 0} />
        : <><ResultBox correct={passed} message={passed ? `${score} pts from ${wallet.shortAddress} — Legitimate farming. Real activity over time is the sustainable approach.` : pickedSybil ? `BANNED! Graph analysis detected multi-wallet farming. All wallets linked to ${wallet.shortAddress} score zero.` : `${score} pts — Need more genuine activity. Bridge + swap + LP is the core stack.`} />
            {passed ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setSelected(new Set()); setSubmitted(false); }} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 9 — MEMECOIN MARKETS — NEW SIMULATORS
// ─────────────────────────────────────────────────────────────────────────────

function MemeTokenProfileSim({ onComplete, onSkip }: SimProps) {
  const tokens = [
    { name: 'POPCAT', age: '45 days', mcap: '$8.2M', fdv: '$8.2M', vol24h: '$3.1M', holders: 12400, buys: 892, sells: 701, lpLocked: true, mintRevoked: true, devWallet: '2.1%', topHolder: '4.8%', honeypot: false, verdict: 'WATCH', analysis: 'Healthy ratio, LP locked, mint revoked, distributed holders. Legitimate but still speculative.' },
    { name: 'MOON100X', age: '3 hours', mcap: '$180K', fdv: '$18M', vol24h: '$940K', holders: 48, buys: 12, sells: 3, lpLocked: false, mintRevoked: false, devWallet: '42%', topHolder: '67%', honeypot: true, verdict: 'INSTANT RUG', analysis: 'FDV 100× MC, LP unlocked, mint active, honeypot detected, dev holds 42%. Classic rug setup.' },
    { name: 'FWOG', age: '6 days', mcap: '$2.4M', fdv: '$2.4M', vol24h: '$890K', holders: 5800, buys: 2100, sells: 1400, lpLocked: true, mintRevoked: true, devWallet: '1.2%', topHolder: '3.1%', honeypot: false, verdict: 'WATCH', analysis: 'Growing community, healthy buy/sell, fully diluted, LP locked. High risk but legitimate.' },
  ];
  const [answers, setAnswers] = React.useState<Record<number, string>>({});
  const [checked, setChecked] = React.useState(false);
  const score = tokens.filter((t, i) => answers[i] === t.verdict).length;
  return (
    <SimShell icon="🔬" title="Token Profile Analysis" subtitle="Read the on-chain profile of 3 tokens. Classify each before committing capital.">
      {tokens.map((t, i) => {
        const chosen = answers[i]; const isCorrect = chosen === t.verdict;
        return (
          <View key={i} style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, borderWidth: 1.5, borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border, gap: 8 }}>
            <Text style={{ fontWeight: '900', fontSize: 16, color: Colors.text }}>{t.name}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {[['Age',t.age],['MC',t.mcap],['FDV',t.fdv],['Vol',t.vol24h],['Holders',String(t.holders)]].map(([k,v]) => (
                <View key={k} style={{ backgroundColor: '#f3f4f6', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>{k}: <Text style={{ fontWeight: '800', color: Colors.text }}>{v}</Text></Text>
                </View>
              ))}
              {[{label:`LP ${t.lpLocked?'Locked':'UNLOCKED'}`,ok:t.lpLocked},{label:`Mint ${t.mintRevoked?'Revoked':'ACTIVE'}`,ok:t.mintRevoked},{label:`Dev ${t.devWallet}`,ok:parseFloat(t.devWallet)<10},{label:t.honeypot?'HONEYPOT 🚨':'No Honeypot ✅',ok:!t.honeypot}].map(({label,ok}) => (
                <View key={label} style={{ backgroundColor: ok?'#d1fae5':'#fee2e2', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 10, fontWeight: '800', color: ok?Colors.green:Colors.red }}>{label}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {['WATCH','INSTANT RUG','BUY'].map(v => {
                const isCh = chosen === v; const isCo = v === t.verdict;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && isCo) { bg='#d1fae5'; border=Colors.green; }
                if (checked && isCh && !iCo) { bg='#fee2e2'; border=Colors.red; }
                if (checked && !iCh && iCo) { bg='#d1fae5'; border=Colors.green; }
                return (
                  <TouchableOpacity key={v} disabled={checked} onPress={() => setAnswers(a => ({...a,[i]:v}))}
                    style={{ flex:1, padding:8, borderRadius:8, borderWidth:2, backgroundColor:bg, borderColor:border, alignItems:'center' }}>
                    <Text style={{ fontWeight:'700', fontSize:10, color:Colors.text, textAlign:'center' }}>{v}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize:11, color:Colors.textSoft, lineHeight:16 }}>💡 {t.analysis}</Text>}
          </View>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit Analysis →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < tokens.length} />
        : <><ResultBox correct={score >= 2} message={`${score}/3 correct. Key: FDV/MC ratio, LP lock, honeypot scan, and holder concentration are the four non-negotiables.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BundleDetectorSim({ onComplete, onSkip }: SimProps) {
  const txGroups = [
    { label: 'Launch block activity', isBundled: true, explanation: 'Three wallets buying in the same block (00:00:01) at launch with prior fund connections = coordinated bundle.', transactions: [
      { time:'00:00:01', wallet:'5xK9...1aB', action:'Buy 10M tokens', amount:'$4,200', note:'Deployer wallet' },
      { time:'00:00:01', wallet:'8fQ2...7cD', action:'Buy 8M tokens', amount:'$3,100', note:'Connected to deployer via prior tx' },
      { time:'00:00:01', wallet:'3mR5...4eF', action:'Buy 6M tokens', amount:'$2,800', note:'Same device fingerprint (Bubblemaps)' },
      { time:'00:00:02', wallet:'Random1', action:'Buy 0.1M tokens', amount:'$45', note:'Organic buyer' },
    ]},
    { label: 'Normal trading day', isBundled: false, explanation: 'Spread-out timing, different funding sources, varied amounts — organic trading pattern.', transactions: [
      { time:'14:22:10', wallet:'AlphaDesk', action:'Buy 2M tokens', amount:'$800', note:'Fresh wallet, no connections' },
      { time:'14:45:31', wallet:'RetailA', action:'Buy 0.5M', amount:'$200', note:'Twitter follower of project' },
      { time:'15:01:22', wallet:'LPProvider', action:'Add liquidity', amount:'$5,000', note:'Existing LP provider' },
      { time:'15:30:08', wallet:'RetailB', action:'Sell 0.3M', amount:'$120', note:'Profit taking' },
    ]},
  ];
  const [answers, setAnswers] = React.useState<Record<number, boolean | null>>({});
  const [checked, setChecked] = React.useState(false);
  const score = txGroups.filter((g, i) => answers[i] === g.isBundled).length;
  return (
    <SimShell icon="🕵️" title="Spot the Bundle" subtitle="Identify coordinated wallet groups from the transaction log.">
      <View style={{ backgroundColor: '#f0f4ff', borderRadius: 10, padding: 12 }}>
        <Text style={{ fontSize: 12, color: Colors.textSoft, lineHeight: 18 }}>Bundling = coordinated wallets buying in the same block at launch. Tools: Bubblemaps, CIELO Finance, on-chain explorer tx history.</Text>
      </View>
      {txGroups.map((group, i) => {
        const chosen = answers[i]; const isCorrect = chosen === group.isBundled;
        return (
          <View key={i} style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 16, borderWidth: 1.5, borderColor: checked ? (isCorrect ? Colors.green : Colors.red) : Colors.border, gap: 8 }}>
            <Text style={{ fontWeight: '900', color: Colors.text }}>{group.label}</Text>
            {group.transactions.map((tx, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: 8, paddingVertical: 3, borderBottomWidth: j < group.transactions.length-1 ? 1 : 0, borderBottomColor: Colors.border }}>
                <Text style={{ width: 60, fontSize: 10, color: Colors.textSoft, fontFamily: 'monospace' }}>{tx.time}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.text }}>{tx.wallet}</Text>
                  <Text style={{ fontSize: 10, color: Colors.textSoft }}>{tx.action} · {tx.amount}</Text>
                  {checked && group.isBundled && j < 3 && <Text style={{ fontSize: 10, color: Colors.red, fontWeight: '700' }}>⚠️ {tx.note}</Text>}
                </View>
              </View>
            ))}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {[{v:true,l:'🚨 BUNDLED'},{v:false,l:'✅ ORGANIC'}].map(({v,l}) => {
                const isCh = chosen === v; const isCo = v === group.isBundled;
                let bg = Colors.card, border = Colors.border;
                if (checked && isCh && iCo) { bg='#d1fae5'; border=Colors.green; }
                if (checked && iCh && !iCo) { bg='#fee2e2'; border=Colors.red; }
                if (checked && !iCh && iCo) { bg='#d1fae5'; border=Colors.green; }
                return (
                  <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({...a,[i]:v}))}
                    style={{ flex:1, padding:8, borderRadius:8, borderWidth:2, backgroundColor:bg, borderColor:border, alignItems:'center' }}>
                    <Text style={{ fontWeight:'800', fontSize:13 }}>{l}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            {checked && <Text style={{ fontSize:11, color:Colors.textSoft, lineHeight:16 }}>💡 {group.explanation}</Text>}
          </View>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < txGroups.length} />
        : <><ResultBox correct={score === 2} message={`${score}/2 — Same-block buying at launch from linked wallets = bundle. Use Bubblemaps before any purchase.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function MemeExitStrategySim({ onComplete, onSkip }: SimProps) {
  const [strategy, setStrategy] = React.useState<'thirds'|'moonbag'|'greedy'|null>(null);
  const [submitted, setSubmitted] = React.useState(false);
  const strategies = {
    thirds:  { label:'📊 Rule of Thirds', desc:'Sell 1/3 at 5×, 1/3 at 10×, keep 1/3 as moonbag', risk:'low', outcome:'Secured profit at 5× and 10×. Still have exposure if it 100×. The sustainable professional strategy.' },
    moonbag: { label:'🌙 Moonbag Hold', desc:'Sell 80% at 5×, keep 20% forever', risk:'low', outcome:'Secured most profit early. Small moonbag costs nothing — if it 100×, you still win.' },
    greedy:  { label:'🎰 Hold for 100×', desc:'Never sell — waiting for the moonshot', risk:'high', outcome:'97% of tokens never reach 100×. If it reached 5× and you held, you often exit at -90% from peak.' },
  };
  return (
    <SimShell icon="🚪" title="Exit Strategy Builder" subtitle="Your token is 5×ing. What do you do? Most losses happen from not having a plan before entry.">
      <View style={{ backgroundColor: '#fef3c7', borderRadius: 10, padding: 12 }}>
        <Text style={{ fontSize: 13, fontWeight: '700', color: '#92400e' }}>Rule: Decide your exit BEFORE you enter. Never decide in the moment of a price spike.</Text>
      </View>
      {(Object.entries(strategies) as [keyof typeof strategies, typeof strategies.thirds][]).map(([k, v]) => (
        <TouchableOpacity key={k} disabled={submitted} onPress={() => setStrategy(k)}
          style={{ padding: 14, borderRadius: 10, borderWidth: 2, borderColor: strategy === k ? (v.risk === 'high' ? Colors.red : Colors.accent) : Colors.border, backgroundColor: strategy === k ? (v.risk === 'high' ? '#fee2e2' : '#eff6ff') : Colors.card }}>
          <Text style={{ fontWeight: '900', color: Colors.text }}>{v.label}</Text>
          <Text style={{ fontSize: 12, color: Colors.textSoft, marginTop: 2 }}>{v.desc}</Text>
        </TouchableOpacity>
      ))}
      {!submitted
        ? <PrimaryBtn label="Execute Strategy →" onPress={() => setSubmitted(true)} disabled={!strategy} />
        : <><ResultBox correct={strategy !== 'greedy'} message={strategy ? strategies[strategy].outcome : ''} />
            <View style={{ backgroundColor: Colors.card, borderRadius: 10, padding: 14, gap: 4, borderWidth: 1.5, borderColor: Colors.border }}>
              <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>PROFESSIONAL RULES</Text>
              {['Decide exit before entry — never in the moment', 'Selling half at 2× = free position (can\'t lose)', 'Moonbags are small — never more than 20% of position', 'Volume collapse = exit signal regardless of price'].map((r,i) => (
                <Text key={i} style={{ fontSize: 13, color: Colors.text, lineHeight: 20 }}>• {r}</Text>
              ))}
            </View>
            <PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function MemePortfolioSizeSim({ onComplete, onSkip }: SimProps) {
  const [portfolio, setPortfolio] = React.useState('10000');
  const [riskTolerance, setRiskTolerance] = React.useState<'conservative'|'moderate'|'aggressive'>('moderate');
  const [checked, setChecked] = React.useState(false);
  const port = parseFloat(portfolio) || 10000;
  const rules = { conservative:{meme:5,defi:20,btcEth:60,stables:15,maxPerMeme:1}, moderate:{meme:15,defi:30,btcEth:45,stables:10,maxPerMeme:3}, aggressive:{meme:30,defi:35,btcEth:30,stables:5,maxPerMeme:5} };
  const rule = rules[riskTolerance];
  return (
    <SimShell icon="⚖️" title="Memecoin Portfolio Sizing" subtitle="The most important skill: how much of your portfolio to risk on any single memecoin.">
      <View style={{ gap: 8 }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>TOTAL PORTFOLIO ($)</Text>
        <TextInput style={{ borderWidth: 1.5, borderColor: Colors.border, borderRadius: 10, padding: 12, fontSize: 18, fontWeight: '700', color: Colors.text }} value={portfolio} onChangeText={setPortfolio} keyboardType="decimal-pad" placeholderTextColor={Colors.textMuted} editable={!checked} />
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>RISK TOLERANCE</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['conservative','moderate','aggressive'] as const).map(r => (
            <TouchableOpacity key={r} disabled={checked} onPress={() => setRiskTolerance(r)} style={{ flex:1, padding:8, borderRadius:8, borderWidth:2, alignItems:'center', borderColor:riskTolerance===r?Colors.accent:Colors.border, backgroundColor:riskTolerance===r?'#eff6ff':Colors.card }}>
              <Text style={{ fontWeight:'700', fontSize:11, color:riskTolerance===r?Colors.accent:Colors.text }}>{r.charAt(0).toUpperCase()+r.slice(1)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={{ backgroundColor: '#f0f4ff', borderRadius: 10, padding: 14, gap: 6, borderWidth: 1.5, borderColor: Colors.accent }}>
        <Text style={{ fontSize: 11, fontWeight: '800', color: Colors.textSoft }}>RECOMMENDED ({riskTolerance.toUpperCase()})</Text>
        {[['Memecoins',rule.meme,'#7c3aed'],['DeFi/Alts',rule.defi,'#0052ff'],['BTC + ETH',rule.btcEth,'#f7931a'],['Stables',rule.stables,Colors.green]].map(([label,pct,color]) => (
          <View key={label as string}>
            <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
              <Text style={{ fontSize:12, color:Colors.textSoft }}>{label}</Text>
              <Text style={{ fontSize:12, fontWeight: '800', color:color as string }}>{pct}% — ${(port * Number(pct) / 100).toFixed(0)}</Text>
            </View>
            <View style={{ height:5, backgroundColor:Colors.border, borderRadius:99, overflow:'hidden', marginTop:2 }}>
              <View style={{ height:5, borderRadius:99, backgroundColor:color as string, width:`${pct}%` as any }} />
            </View>
          </View>
        ))}
        <Text style={{ fontSize:11, color:Colors.red, fontWeight:'700', marginTop:4 }}>Max per individual meme token: {rule.maxPerMeme}% (${(port * rule.maxPerMeme / 100).toFixed(0)})</Text>
      </View>
      {!checked
        ? <PrimaryBtn label="Got It →" onPress={() => setChecked(true)} />
        : <><ResultBox correct message={`For ${riskTolerance} risk: max ${rule.meme}% in memecoins total, ${rule.maxPerMeme}% per individual token. Stables provide emergency buffer.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} /></>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function MemecoinBossSim({ onComplete, onSkip }: SimProps) {
  const [stage, setStage] = React.useState<1|2|3>(1);
  const [s1, setS1] = React.useState<string|null>(null);
  const [s1Done, setS1Done] = React.useState(false);
  const [s2, setS2] = React.useState<'rug'|'safe'|null>(null);
  const [s2Done, setS2Done] = React.useState(false);
  const [s3, setS3] = React.useState<'thirds'|'greedy'|null>(null);
  const [allDone, setAllDone] = React.useState(false);
  const score = [s1==='bundled', s2==='rug', s3==='thirds'].filter(Boolean).length;
  return (
    <SimShell icon="⭐" title="BOSS: Memecoin Markets" subtitle="Three stages — apply everything from Island 9.">
      <View style={{ flexDirection:'row', gap:6, marginBottom:8 }}>
        {[1,2,3].map(n => (
          <View key={n} style={{ flex:1, padding:6, borderRadius:8, alignItems:'center', backgroundColor:stage===n?Colors.accent:n<stage?'#d1fae5':Colors.border }}>
            <Text style={{ fontWeight: '800', fontSize:11, color:stage===n?'#fff':n<stage?Colors.green:Colors.textSoft }}>{n<stage?'✓':`Stage ${n}`}</Text>
          </View>
        ))}
      </View>
      {stage===1 && !s1Done && (
        <>
          <View style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, borderWidth:1.5, borderColor:Colors.border }}>
            <Text style={{ fontSize:11, fontWeight:'800', color:Colors.accent }}>STAGE 1 — BUNDLE DETECTION</Text>
            <Text style={{ fontWeight:'700', color:Colors.text, marginTop:8, lineHeight:20 }}>Three wallets buy in the same transaction block at token launch. Two are connected by prior transactions. This is:</Text>
          </View>
          {[{id:'bundled',l:'🚨 A coordinated bundle — insider wallets'},{id:'organic',l:'✅ Normal early buying — organic traders'}].map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => setS1(opt.id)} style={{ padding:12, borderRadius:10, borderWidth:2, borderColor:s1===opt.id?Colors.accent:Colors.border, backgroundColor:s1===opt.id?'#eff6ff':Colors.card }}>
              <Text style={{ fontWeight:'800', color:Colors.text }}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
          <PrimaryBtn label="Lock In →" onPress={() => setS1Done(true)} disabled={!s1} />
        </>
      )}
      {stage===1 && s1Done && (
        <><ResultBox correct={s1==='bundled'} message={s1==='bundled'?'Correct! Same-block buys from linked wallets = coordinated bundle.':'Incorrect — same block + linked wallets = insider coordination.'} />
          <PrimaryBtn label="Stage 2 →" onPress={() => setStage(2)} /></>
      )}
      {stage===2 && !s2Done && (
        <>
          <View style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, borderWidth:1.5, borderColor:Colors.border, gap:6 }}>
            <Text style={{ fontSize:11, fontWeight:'800', color:Colors.accent }}>STAGE 2 — TOKEN SAFETY</Text>
            <Text style={{ fontWeight: '800', fontSize:16, color:Colors.text }}>MOON100X</Text>
            {[{label:'FDV/MC ratio',value:'100×',bad:true},{label:'LP',value:'UNLOCKED',bad:true},{label:'Mint authority',value:'ACTIVE',bad:true},{label:'Honeypot',value:'DETECTED',bad:true},{label:'Dev wallet',value:'42%',bad:true}].map(({label,value,bad}) => (
              <View key={label} style={{ flexDirection:'row', justifyContent:'space-between', backgroundColor:bad?'#fff0f0':'#f0fff4', borderRadius:6, paddingHorizontal:8, paddingVertical:4 }}>
                <Text style={{ fontSize:12, color:bad?Colors.red:Colors.green }}>{label}</Text>
                <Text style={{ fontSize:12, fontWeight:'800', color:bad?Colors.red:Colors.green }}>{value}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection:'row', gap:8 }}>
            {[{v:'rug' as const,l:'💀 INSTANT RUG'},{v:'safe' as const,l:'✅ SAFE TO BUY'}].map(({v,l}) => (
              <TouchableOpacity key={v} onPress={() => setS2(v)} style={{ flex:1, padding:12, borderRadius:10, borderWidth:2, alignItems:'center', borderColor:s2===v?Colors.accent:Colors.border, backgroundColor:s2===v?'#eff6ff':Colors.card }}>
                <Text style={{ fontWeight:'800', color:Colors.text }}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <PrimaryBtn label="Submit Verdict →" onPress={() => setS2Done(true)} disabled={!s2} />
        </>
      )}
      {stage===2 && s2Done && (
        <><ResultBox correct={s2==='rug'} message={s2==='rug'?'Correct — 5 red flags simultaneously. Never buy.':'Incorrect — MOON100X has ALL five critical red flags. Classic instant rug.'} />
          <PrimaryBtn label="Stage 3 →" onPress={() => setStage(3)} /></>
      )}
      {stage===3 && !allDone && (
        <>
          <View style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, borderWidth:1.5, borderColor:Colors.border }}>
            <Text style={{ fontSize:11, fontWeight:'800', color:Colors.accent }}>STAGE 3 — EXIT EXECUTION</Text>
            <Text style={{ fontWeight:'700', color:Colors.text, marginTop:8, lineHeight:20 }}>Your $500 memecoin position is up 5×. Volume is still rising. What do you do?</Text>
          </View>
          {[{id:'thirds',l:'📊 Sell 1/3 now, keep 2/3 with staged exits'},{id:'greedy',l:'🎰 Hold everything — waiting for 100×'}].map(opt => (
            <TouchableOpacity key={opt.id} onPress={() => setS3(opt.id as any)} style={{ padding:12, borderRadius:10, borderWidth:2, borderColor:s3===opt.id?Colors.accent:Colors.border, backgroundColor:s3===opt.id?'#eff6ff':Colors.card }}>
              <Text style={{ fontWeight:'800', color:Colors.text }}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
          <PrimaryBtn label="Execute →" onPress={() => setAllDone(true)} disabled={!s3} />
        </>
      )}
      {allDone && (
        <>
          <View style={{ backgroundColor:score>=2?'#d1fae5':'#fee2e2', borderRadius:14, padding:20, alignItems:'center', borderWidth:2, borderColor:score>=2?Colors.green:Colors.red }}>
            <Text style={{ fontSize: 18 }}>{score>=2?'🏆':'📚'}</Text>
            <Text style={{ fontWeight: '800', fontSize:20, color:score>=2?Colors.green:Colors.red, marginTop:8 }}>{score>=2?'MEMECOIN BOSS DEFEATED!':'Review & Retry'}</Text>
            <Text style={{ color:Colors.textSoft }}>{score}/3 stages passed</Text>
          </View>
          <PrimaryBtn label="Return to Island Map →" onPress={onComplete} />
        </>
      )}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ISLAND 10 — AIRDROP ARCHIPELAGO — NEW SIMULATORS
// ─────────────────────────────────────────────────────────────────────────────

function AirdropEligibilitySim({ onComplete, onSkip }: SimProps) {
  const [walletAge, setWalletAge] = React.useState(6);
  const [txCount, setTxCount] = React.useState(50);
  const [protocols, setProtocols] = React.useState(3);
  const [tvl, setTvl] = React.useState(500);
  const [checked, setChecked] = React.useState(false);
  const criteria = [
    { label:'Wallet age', req:'≥ 3 months', met:walletAge>=3 },
    { label:'Transaction count', req:'≥ 30 txs', met:txCount>=30 },
    { label:'Unique protocols', req:'≥ 2 protocols', met:protocols>=2 },
    { label:'TVL history', req:'≥ $100 at some point', met:tvl>=100 },
    { label:'Not a new wallet', req:'First tx before snapshot', met:walletAge>=1 },
  ];
  const score = criteria.filter(c => c.met).length;
  const tier = score===5?'Tier 1 (Max)':score===4?'Tier 2 (Reduced)':score===3?'Tier 3 (Minimal)':'Not eligible';
  return (
    <SimShell icon="🎯" title="Check Airdrop Eligibility" subtitle="Run your simulated wallet through a real eligibility checker.">
      {[{label:'Wallet age (months)',val:walletAge,set:setWalletAge,min:0,max:36,step:1},{label:'Transaction count',val:txCount,set:setTxCount,min:0,max:200,step:10},{label:'Unique protocols used',val:protocols,set:setProtocols,min:0,max:15,step:1},{label:'Peak TVL ($)',val:tvl,set:setTvl,min:0,max:10000,step:100}].map(({label,val,set,min,max,step}) => (
        <View key={label} style={{ gap:4 }}>
          <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
            <Text style={{ fontSize:12, color:Colors.textSoft }}>{label}</Text>
            <Text style={{ fontWeight: '800', color:Colors.accent }}>{val}</Text>
          </View>
          <View style={{ flexDirection:'row', gap:8 }}>
            <TouchableOpacity onPress={() => set(v => Math.max(min, v-step))} disabled={checked} style={{ width:32, height:32, borderRadius:16, backgroundColor:Colors.border, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontWeight: '800', color:Colors.text }}>−</Text>
            </TouchableOpacity>
            <View style={{ flex:1, height:6, backgroundColor:Colors.border, borderRadius:99, alignSelf:'center', overflow:'hidden' }}>
              <View style={{ height:6, borderRadius:99, backgroundColor:Colors.accent, width:`${((val-min)/(max-min))*100}%` as any }} />
            </View>
            <TouchableOpacity onPress={() => set(v => Math.min(max, v+step))} disabled={checked} style={{ width:32, height:32, borderRadius:16, backgroundColor:Colors.border, alignItems:'center', justifyContent:'center' }}>
              <Text style={{ fontWeight: '800', color:Colors.text }}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
      {checked && (
        <>
          <View style={{ gap:6 }}>
            {criteria.map(c => (
              <View key={c.label} style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between', padding:10, backgroundColor:Colors.card, borderRadius:8, borderWidth:1.5, borderColor:Colors.border }}>
                <View style={{ flex:1 }}>
                  <Text style={{ fontWeight:'700', fontSize:13, color:Colors.text }}>{c.label}</Text>
                  <Text style={{ fontSize:11, color:Colors.textSoft }}>{c.req}</Text>
                </View>
                <Text style={{ fontSize:20 }}>{c.met?'✅':'❌'}</Text>
              </View>
            ))}
          </View>
          <View style={{ padding:12, backgroundColor:score>=4?'#d1fae5':'#fee2e2', borderRadius:10, borderWidth:2, borderColor:score>=4?Colors.green:Colors.red }}>
            <Text style={{ fontWeight: '800', color:score>=4?Colors.green:Colors.red, textAlign:'center' }}>{tier} — {score}/5 criteria met</Text>
          </View>
          <PrimaryBtn label="Continue →" onPress={onComplete} />
        </>
      )}
      {!checked && <PrimaryBtn label="Check Eligibility →" onPress={() => setChecked(true)} />}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function SybilDetectorSim({ onComplete, onSkip }: SimProps) {
  const wallets = [
    { id:'A', address:'0xA1b2...1234', isSybil:true, signals:['Same funding source as B and C','All three created same day','Identical transaction patterns','Gas refill from same exchange'] },
    { id:'B', address:'0xB3c4...5678', isSybil:true, signals:['Same funding source as A and C','Identical 14-day activity rhythm','Similar token amounts and timing','IP-linked to A (graph analysis)'] },
    { id:'C', address:'0xC5d6...9012', isSybil:false, signals:['2-year old wallet','Used 8 different protocols','Varied transaction amounts','Multiple funding sources'] },
    { id:'D', address:'0xD7e8...3456', isSybil:false, signals:['1.5-year history','Prior legitimate airdrops','Organic DeFi across chains','Different device fingerprint'] },
  ];
  const [answers, setAnswers] = React.useState<Record<string, boolean|null>>({});
  const [checked, setChecked] = React.useState(false);
  const score = wallets.filter(w => answers[w.id] === w.isSybil).length;
  return (
    <SimShell icon="🕸️" title="Sybil Wallet Detector" subtitle="Protocols use graph analysis to exclude Sybil wallets. Identify which are real.">
      <View style={{ backgroundColor:'#f0f4ff', borderRadius:10, padding:12 }}>
        <Text style={{ fontSize:12, color:Colors.textSoft, lineHeight:18 }}>Sybil signals: shared funding source, same-day creation, identical patterns, fund collection to same address. ONE Sybil wallet = ALL linked wallets zeroed.</Text>
      </View>
      {wallets.map(w => {
        const chosen = answers[w.id]; const isCorrect = chosen === w.isSybil;
        return (
          <View key={w.id} style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, borderWidth:1.5, borderColor:checked?(isCorrect?Colors.green:Colors.red):Colors.border, gap:8 }}>
            <Text style={{ fontWeight: '800', color:Colors.text }}>Wallet {w.id}: {w.address}</Text>
            {w.signals.map((sig,i) => (
              <Text key={i} style={{ fontSize:11, color:Colors.text, lineHeight:18 }}>{checked&&w.isSybil?'🚩':'•'} {sig}</Text>
            ))}
            <View style={{ flexDirection:'row', gap:8 }}>
              {[{v:true,l:'🚨 Sybil'},{v:false,l:'✅ Genuine'}].map(({v,l}) => {
                const isCh = chosen === v; const isCo = v === w.isSybil;
                let bg=Colors.card,border=Colors.border;
                if(checked&&iCh&&iCo){bg='#d1fae5';border=Colors.green;}
                if(checked&&iCh&&!iCo){bg='#fee2e2';border=Colors.red;}
                if(checked&&!iCh&&iCo){bg='#d1fae5';border=Colors.green;}
                return <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({...a,[w.id]:v}))} style={{ flex:1, padding:8, borderRadius:8, borderWidth:2, backgroundColor:bg, borderColor:border, alignItems:'center' }}><Text style={{ fontWeight:'800', fontSize:13 }}>{l}</Text></TouchableOpacity>;
              })}
            </View>
          </View>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Submit Analysis →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < wallets.length} />
        : <><ResultBox correct={score>=3} message={`${score}/4 — Wallets A and B were Sybil (shared funding, identical patterns). C and D are genuine users with organic history.`} />
            {score>=3 ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function AirdropScamDrillSim({ onComplete, onSkip }: SimProps) {
  const scenarios = [
    { id:0, content:'arbitrum-airdrop-claim.io/wallet-connect', isScam:true, clue:'Official claim was at claim.arbitrum.foundation — not a .io domain with hyphens.' },
    { id:1, content:'claim.arbitrum.foundation', isScam:false, clue:'Official subdomain of the foundation. This is the real page.' },
    { id:2, content:'DM from @Uniswap_Official: "You\'ve been selected for a $4,500 UNI airdrop. Verify here: uni-verification.com"', isScam:true, clue:'Uniswap never DMs users. Unsolicited DMs with wallet links are always scams.' },
    { id:3, content:'Verified Uniswap tweet: "UNI airdrop snapshot complete. Tokens arrive within 24 hours. No action required."', isScam:false, clue:'Official verified account, no link, no wallet action required — legitimate.' },
    { id:4, content:'blur.io/airdrop', isScam:false, clue:'blur.io is Blur\'s official domain. Airdrop on the official domain is legitimate.' },
    { id:5, content:'blur-airdrop-season2.xyz', isScam:true, clue:'Blur\'s domain is blur.io. Any other domain claiming to be Blur is phishing.' },
  ];
  const [answers, setAnswers] = React.useState<Record<number, boolean|null>>({});
  const [checked, setChecked] = React.useState(false);
  const score = scenarios.filter(s => answers[s.id] === s.isScam).length;
  return (
    <SimShell icon="🎣" title="Airdrop Scam Drill" subtitle="Before connecting your wallet to any claim page, run this check. One wrong click = drained.">
      {scenarios.map(sc => {
        const chosen = answers[sc.id]; const isCorrect = chosen === sc.isScam;
        return (
          <View key={sc.id} style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, borderWidth:1.5, borderColor:checked?(isCorrect?Colors.green:Colors.red):Colors.border, gap:8 }}>
            <Text style={{ fontFamily:sc.content.includes('DM')||sc.content.includes('tweet')?undefined:'monospace', fontSize:12, fontWeight:'800', color:Colors.text, lineHeight:18 }}>{sc.content}</Text>
            <View style={{ flexDirection:'row', gap:8 }}>
              {[{v:true,l:'⚠️ SCAM'},{v:false,l:'✅ LEGIT'}].map(({v,l}) => {
                const isCh=chosen===v; const iCo=v===sc.isScam;
                let bg=Colors.card,border=Colors.border;
                if(checked&&iCh&&iCo){bg='#d1fae5';border=Colors.green;}
                if(checked&&iCh&&!iCo){bg='#fee2e2';border=Colors.red;}
                if(checked&&!iCh&&iCo){bg='#d1fae5';border=Colors.green;}
                return <TouchableOpacity key={String(v)} disabled={checked} onPress={() => setAnswers(a => ({...a,[sc.id]:v}))} style={{ flex:1, padding:8, borderRadius:8, borderWidth:2, backgroundColor:bg, borderColor:border, alignItems:'center' }}><Text style={{ fontWeight:'800', fontSize:13 }}>{l}</Text></TouchableOpacity>;
              })}
            </View>
            {checked && <Text style={{ fontSize:11, color:Colors.textSoft, lineHeight:16 }}>💡 {sc.clue}</Text>}
          </View>
        );
      })}
      {!checked
        ? <PrimaryBtn label="Check →" onPress={() => setChecked(true)} disabled={Object.keys(answers).length < scenarios.length} />
        : <><ResultBox correct={score>=5} message={score>=5?`${score}/6 — Excellent scam detection. Official domain + no DMs + no wallet connection required.`:`${score}/6 — Key: official subdomain (.foundation, .io), no DMs from protocols, no "verify" steps for real airdrops.`} />
            {score>=5 ? <PrimaryBtn label="Continue →" onPress={onComplete} /> : <PrimaryBtn label="Try Again" onPress={() => { setAnswers({}); setChecked(false); }} />}</>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function AirdropExpectedValueSim({ onComplete, onSkip }: SimProps) {
  const [gasCost, setGasCost] = React.useState('120');
  const [timeHrs, setTimeHrs] = React.useState('40');
  const [hourlyRate, setHourlyRate] = React.useState('25');
  const [lowEst, setLowEst] = React.useState('200');
  const [midEst, setMidEst] = React.useState('800');
  const [highEst, setHighEst] = React.useState('3000');
  const [probLow, setProbLow] = React.useState('60');
  const [probMid, setProbMid] = React.useState('30');
  const [confirmed, setConfirmed] = React.useState(false);
  const gas=parseFloat(gasCost)||0, time=parseFloat(timeHrs)||0, rate=parseFloat(hourlyRate)||0;
  const totalCost = gas + time*rate;
  const pL=parseFloat(probLow)/100, pM=parseFloat(probMid)/100, pH=1-pL-pM;
  const ev = pL*parseFloat(lowEst) + pM*parseFloat(midEst) + pH*parseFloat(highEst);
  const roi = ((ev - totalCost) / totalCost * 100).toFixed(0);
  return (
    <SimShell icon="🧮" title="Airdrop Expected Value Calculator" subtitle="Before committing time and gas, calculate realistic EV. Most airdrop farming is a losing strategy.">
      <View style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, gap:8, borderWidth:1.5, borderColor:Colors.border }}>
        <Text style={{ fontSize:11, fontWeight:'800', color:Colors.textSoft }}>YOUR COSTS</Text>
        <View style={{ flexDirection:'row', gap:8 }}>
          {[{label:'Gas ($)',val:gasCost,set:setGasCost},{label:'Hours',val:timeHrs,set:setTimeHrs},{label:'$/hr',val:hourlyRate,set:setHourlyRate}].map(({label,val,set}) => (
            <View key={label} style={{ flex:1 }}>
              <Text style={{ fontSize:10, fontWeight:'800', color:Colors.textSoft, marginBottom:4 }}>{label}</Text>
              <TextInput style={{ borderWidth:1.5, borderColor:Colors.border, borderRadius:8, padding:8, fontSize:14, fontWeight:'700', color:Colors.text }} value={val} onChangeText={set} keyboardType="decimal-pad" editable={!confirmed} />
            </View>
          ))}
        </View>
        <View style={{ flexDirection:'row', justifyContent:'space-between' }}>
          <Text style={{ fontWeight:'800' }}>Total cost</Text>
          <Text style={{ fontWeight: '800', color:Colors.red, fontSize:16 }}>${totalCost.toFixed(0)}</Text>
        </View>
      </View>
      {!confirmed
        ? <PrimaryBtn label="Calculate EV →" onPress={() => setConfirmed(true)} />
        : <>
            <View style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, gap:6, borderWidth:1.5, borderColor:ev>totalCost?Colors.green:Colors.red }}>
              <Text style={{ fontSize:11, fontWeight:'800', color:Colors.textSoft }}>EXPECTED VALUE RESULT</Text>
              {[['Expected airdrop value',`$${ev.toFixed(0)}`,''],['Your total cost',`$${totalCost.toFixed(0)}`,'']].map(([k,v]) => (
                <View key={k as string} style={{ flexDirection:'row', justifyContent:'space-between' }}>
                  <Text style={{ fontSize:13, color:Colors.textSoft }}>{k}</Text>
                  <Text style={{ fontSize:13, fontWeight:'700', color:Colors.text }}>{v}</Text>
                </View>
              ))}
              <View style={{ flexDirection:'row', justifyContent:'space-between', borderTopWidth:1, borderTopColor:Colors.border, paddingTop:8, marginTop:4 }}>
                <Text style={{ fontWeight:'800' }}>Net EV</Text>
                <Text style={{ fontWeight: '800', fontSize:18, color:ev>totalCost?Colors.green:Colors.red }}>{ev>totalCost?'+':''}${(ev-totalCost).toFixed(0)} ({roi}% ROI)</Text>
              </View>
            </View>
            <ResultBox correct={ev>totalCost} message={ev>totalCost?`Positive EV — worth pursuing if the protocol is legitimate. Track time costs rigorously.`:`Negative EV — you'd be better off putting $${totalCost.toFixed(0)} directly into ETH. Most airdrop farming loses money when opportunity cost is included.`} />
            <PrimaryBtn label="Continue →" onPress={onComplete} />
          </>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function AirdropBossSim({ onComplete, onSkip }: SimProps) {
  const [q1, setQ1] = React.useState<string|null>(null);
  const [q2, setQ2] = React.useState<string|null>(null);
  const [q3, setQ3] = React.useState<string|null>(null);
  const [done, setDone] = React.useState(false);
  const score = [q1==='legitimate', q2==='sybil', q3==='ev_negative'].filter(Boolean).length;
  return (
    <SimShell icon="⭐" title="BOSS: Airdrop Archipelago" subtitle="Three boss questions covering the whole island.">
      {[{qKey:'q1' as const, label:'Q1 — FARMING STRATEGY', text:'You use a DEX weekly for genuine trading, provide LP, and vote on governance. The protocol announces an airdrop based on past activity. Your approach was:', opts:[{id:'legitimate',l:'✅ Legitimate use — maximise allocation'},{id:'sybil_risk',l:'⚠️ At risk of Sybil detection'}], set:setQ1, val:q1},
        {qKey:'q2' as const, label:'Q2 — SYBIL DETECTION', text:'Your friend funded 5 wallets from the same Coinbase account same day, ran identical transactions. The airdrop runs graph analysis. Outcome:', opts:[{id:'sybil',l:'💀 All 5 wallets zeroed — Sybil excluded'},{id:'max',l:'🚀 5× the allocation — multiplied rewards'}], set:setQ2, val:q2},
        {qKey:'q3' as const, label:'Q3 — EXPECTED VALUE', text:'Farming a new L2 costs $200 gas + 60 hours (opportunity cost $30/hr = $1,800). Expected median airdrop: $400. This campaign is:', opts:[{id:'ev_positive',l:'✅ Positive EV — worth it'},{id:'ev_negative',l:'❌ Negative EV — better alternatives exist'}], set:setQ3, val:q3}
      ].map(({label, text, opts, set, val}) => (
        <View key={label} style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, gap:10, borderWidth:1.5, borderColor:Colors.border }}>
          <Text style={{ fontSize:11, fontWeight:'800', color:Colors.accent }}>{label}</Text>
          <Text style={{ fontWeight:'700', color:Colors.text, lineHeight:20 }}>{text}</Text>
          {opts.map(opt => (
            <TouchableOpacity key={opt.id} disabled={done} onPress={() => set(opt.id)} style={{ padding:12, borderRadius:8, borderWidth:2, borderColor:val===opt.id?Colors.accent:Colors.border, backgroundColor:val===opt.id?'#eff6ff':Colors.card }}>
              <Text style={{ fontWeight:'800', color:Colors.text }}>{opt.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}
      {!done
        ? <PrimaryBtn label="Submit Boss Answers →" onPress={() => setDone(true)} disabled={!q1||!q2||!q3} />
        : <>
            <View style={{ backgroundColor:score>=2?'#d1fae5':'#fee2e2', borderRadius:14, padding:20, alignItems:'center', borderWidth:2, borderColor:score>=2?Colors.green:Colors.red }}>
              <Text style={{ fontSize: 18 }}>{score>=2?'🏆':'📚'}</Text>
              <Text style={{ fontWeight: '800', fontSize:20, color:score>=2?Colors.green:Colors.red, marginTop:8 }}>{score>=2?'AIRDROP BOSS CLEARED!':'Review the Lessons'}</Text>
              <Text style={{ color:Colors.textSoft }}>{score}/3 correct</Text>
            </View>
            <View style={{ backgroundColor:Colors.card, borderRadius:10, padding:14, gap:4, borderWidth:1.5, borderColor:Colors.border }}>
              <Text style={{ fontSize:11, fontWeight:'800', color:Colors.textSoft }}>ANSWERS</Text>
              {['Q1: ✅ Legitimate use — genuine participation = highest allocation tier','Q2: 💀 All zeroed — graph analysis identifies Sybil clusters by funding source','Q3: ❌ Negative EV — total cost $2,000, expected return $400. EV = -$1,600'].map((a,i) => (
                <Text key={i} style={{ fontSize:12, color:Colors.text, lineHeight:20 }}>• {a}</Text>
              ))}
            </View>
            <PrimaryBtn label="Return to Island Map →" onPress={onComplete} />
          </>}
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

// NOTE: Island 12, 13, 14, 15, 16, 17, 18 simulators are in the separate
// island12_13_15SimulatorDefs.tsx and island14_16_17_18SimulatorDefs.tsx files.
// Those files are structured to be imported as modules since they're large.
// Import them at the top of SimulatorCard.tsx and spread their components
// into the SIMULATORS map below.

// ═══════════════════════════════════════════════════════════════════════════════
// ══ PASTE INTO SimulatorCard.tsx — END ═════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════

// ─────────────────────────────────────────────────────────────────────────────
// SIMULATORS MAP UPDATES
// Replace the existing const SIMULATORS = { ... } with this version.
// Keep all your existing entries. These are the additions and replacements.
// ─────────────────────────────────────────────────────────────────────────────

/*
const SIMULATORS: Record<string, React.ComponentType<any>> = {
  // ── EXISTING — keep all of these unchanged ─────────────────────────────────
  tonTapEarn:           TonTapEarnSim,
  cbProductPicker:      CbProductPickerSim,
  cbAdvancedTrade:      CbAdvancedTradeSim,
  cbStaking:            CbStakingSim,
  accountAbstraction:   AccountAbstractionSim,
  depin:                DepinSim,
  opsecIdentity:        OpsecIdentitySim,
  chainBridging:        ChainBridgingSim,
  avaxStaking:          AvaxStakingSim,
  chainComparison:      ChainComparisonSim,
  addressPoison:        AddressPoisonSim,
  mevSandwich:          MevSandwichSim,
  discordResearch:      DiscordResearchSim,
  opsecCheck:           OpsecCheckSim,
  bitcoinFees:          BitcoinFeesSim,
  lightning:            LightningSim,
  erc20Token:           Erc20TokenSim,
  ethValidator:         EthValidatorSim,
  layer2:               Layer2Sim,
  metamask:             MetamaskSim,
  phishing:             PhishingSim,
  tokenApprovals:       TokenApprovalsSim,
  fakeTokens:           FakeTokensSim,
  uniswap:              UniswapSim,
  slippage:             SlippageSim,
  impermanentLoss:      ImpermanentLossSim,
  liquidation:          LiquidationSim,
  p2pTrade:             P2PTradeSim,
  ens:                  EnsSim,
  daoVote:              DaoVoteSim,
  onchainAnalysis:      OnchainAnalysisSim,
  contractAudit:        ContractAuditSim,
  tokenomics:           TokenomicsSim,
  halving:              HalvingSim,
  gas:                  GasSim,
  staking:              StakingSim,
  cexDeposit:           CexDepositSim,
  wrongChain:           WrongChainSim,
  lending:              LendingSim,
  leverage:             LeverageSim,
  fdv:                  FdvSim,
  nftContract:          NftContractSim,
  rugScanner:           RugScannerSim,
  rugcheck:             RugcheckSim,
  bondingCurve:         BondingCurveSim,
  lpSeed:               LpSeedSim,
  baseIntro:            BaseIntroSim,
  baseGas:              BaseGasSim,
  smartWallet:          SmartWalletSim,
  paymaster:            PaymasterSim,
  miniApp:              MiniAppSim,
  miniAppBuild:         MiniAppBuildSim,
  bnbOverview:          BnbOverviewSim,
  bnbLaunch:            BnbLaunchSim,
  bnbAlpha:             BnbAlphaSim,
  bnbEarn:              BnbEarnSim,
  bnbStaking:           BnbStakingSim,
  solanaOverview:       SolanaOverviewSim,
  solanaJupiter:        SolanaJupiterSim,
  solanaStaking:        SolanaStakingSim,
  solanaCompare:        SolanaCompareSim,

  // ── REPLACED — old version → new wallet-enhanced version ──────────────────
  sendBitcoin:          SendBitcoinEnhancedSim,   // was: SendBitcoinSim
  bnbPancake:           BnbPancakeEnhancedSim,    // was: BnbPancakeSim
  tonWallet:            TonWalletEnhancedSim,      // was: TonWalletSim
  tonStaking:           TonStakingEnhancedSim,     // was: TonStakingSim
  solanaPump:           SolanaPumpEnhancedSim,     // was: SolanaPumpSim
  nftMint:              NftMintEnhancedSim,        // was: NftMintSim
  airdropFarm:          AirdropFarmEnhancedSim,    // was: AirdropFarmSim
  dexscreener:          DexscreenerSim,            // unchanged — no wallet needed

  // ── NEW — Island 9 Memecoin Markets ───────────────────────────────────────
  memeTokenProfile:     MemeTokenProfileSim,
  bundleDetector:       BundleDetectorSim,
  memeExitStrategy:     MemeExitStrategySim,
  memePortfolioSize:    MemePortfolioSizeSim,
  memecoinBoss:         MemecoinBossSim,

  // ── NEW — Island 10 Airdrop Archipelago ───────────────────────────────────
  airdropEligibility:   AirdropEligibilitySim,
  sybilDetector:        SybilDetectorSim,
  airdropScamDrill:     AirdropScamDrillSim,
  airdropExpectedValue: AirdropExpectedValueSim,
  airdropBoss:          AirdropBossSim,

  // ── NEW — Islands 12, 13, 15 (import from island12_13_15SimulatorDefs.tsx) ─
  cbBtcExplainer:       CbBtcExplainerSim,
  aerodromeSwap:        AerodromeSwapSim,
  baseMemeculture:      BaseMemecultureSim,
  agentKitDemo:         AgentKitDemoSim,
  baseBoss:             BaseBossSim,
  tonMiniAppDex:        TonMiniAppDexSim,
  fragmentTrading:      FragmentTradingSim,
  tonBoss:              TonBossSim,
  cbCdpStablecoin:      CbCdpStablecoinSim,
  cbPrimeVsRetail:      CbPrimeVsRetailSim,
  coinbaseBoss:         CoinbaseBossSim,

  // ── NEW — Islands 14, 16, 17, 18 (import from island14_16_17_18SimulatorDefs.tsx) ─
  polygonVsArbitrum:    PolygonVsArbitrumSim,
  abstractAA:           AbstractAASim,
  chainEvaluator:       ChainEvaluatorSim,
  l2FeeWars:            L2FeeWarsSim,
  altChainBoss:         AltChainBossSim,
  zkSnarksVsStarks:     ZkSnarksVsStarksSim,
  rwaEvaluator:         RwaEvaluatorSim,
  walletDrainerDrill:   WalletDrainerDrillSim,
  flashbotsProtect:     FlashbotsProtectSim,
  opsecBuilder:         OpsecBuilderSim,
  securityBoss:         SecurityBossSim,
  stablecoinRisk:       StablecoinRiskSim,
  advancedCryptoBoss:   AdvancedCryptoBossSim,

  // ── NEW — Island 8 Bridges (import from island08SimulatorDefs.tsx) ─────────
  bridgeLockMint:       BridgeLockMintSim,
  bridgeSecurity:       BridgeSecuritySim,
  optimisticRollup:     OptimisticRollupSim,
  zkVsOptimistic:       ZkVsOptimisticSim,
  l2FeeCalc:            L2FeeCalcSim,
  liquidityBridge:      LiquidityBridgeSim,
  bridgeEval:           BridgeEvalSim,
  multiChainPortfolio:  MultiChainPortfolioSim,
  l2Ecosystem:          L2EcosystemSim,
  safeBridgingDrill:    SafeBridgingDrillSim,
  bridgeAggregator:     BridgeAggregatorSim,
  zkProofDemo:          ZkProofDemoSim,
  trilemma:             TrilemmaSim,
  intentBridge:         IntentBridgeSim,
  bridgeBoss:           BridgeBossSim,
};
*/
