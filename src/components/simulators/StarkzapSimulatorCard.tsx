import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { PRIVY_ENABLED } from '../../lib/config';
import {
  createStarkzapAmount,
  createStarkzapAmountFromBase,
  isStarkzapAvailable,
  MOCK,
  SPONSORED_FEE_MODE,
  STARKNET_NETWORK,
  STARKNET_SEPOLIA_VALIDATORS,
  STARKNET_TOKENS,
  starkzapSdk,
} from '../../lib/starkzap';
import { useStarknetPrivyLogin, type OAuthProvider } from '../../hooks/useStarknetPrivyLogin';
import { useStarknetWalletBridge } from '../auth/StarknetWalletBridge';
import { useSimulatorWallet } from '../../hooks/useSimulatorWallet';
import {
  StarknetAddressBanner,
  StarknetFaucetSheet,
  STARKNET_SEPOLIA,
} from '../../data/tracks/starknet_ecosystem/starknetSharedSimulators';
import {
  Card,
  GhostBtn,
  PrimaryBtn,
  ResultBox,
  SectionLabel,
  SimShell,
} from './SimulatorShared';
const SPONSORED_FEE_OPTIONS = { feeMode: SPONSORED_FEE_MODE } as const;
interface Props {
  simulatorType: string;
  simulatorId?: string;
  onComplete: () => void;
  onSkip: () => void;
  scenario?: string;
  scoringCriteria?: string[];
}

type WalletLessonId =
  | 'starkzap-wallet'
  | 'starkzap-gasless'
  | 'starkzap-swap'
  | 'starkzap-stake'
  | 'starkzap-lend'
  | 'starkzap-borrow'
  | 'starkzap-dca'
  | 'starkzap-bridge'
  | 'starkzap-balance'
  | 'starkzap-build'
  | 'starkzap-boss'
  | 'starkzap-confidential'
  | 'starkzap-ecosystem-read'
  | 'starkzap-mainnet-push'
  | 'starkzap-package-install';

type WalletStatusCardProps = {
  title?: string;
  subtitle?: string;
  emphasizeWallet?: boolean;
};

function baseType(simulatorType: string): WalletLessonId {
  return simulatorType.split(':')[0] as WalletLessonId;
}

function formatBridgeStatus(status: string) {
  switch (status) {
    case 'ready':
      return 'Connected';
    case 'connecting':
      return 'Connecting to StarkZap';
    case 'waiting-for-user':
      return 'Waiting for login';
    case 'error':
      return 'Connection issue';
    default:
      return 'Unavailable';
  }
}

function getLoginSummary(state: ReturnType<typeof useStarknetPrivyLogin>['state']) {
  switch (state.kind) {
    case 'sending-code':
      return `Sending a code to ${state.email}`;
    case 'awaiting-code':
      return `Code sent to ${state.email}`;
    case 'verifying':
      return 'Verifying with Privy';
    case 'ready':
      return `Authenticated as ${state.email}`;
    case 'error':
      return state.message;
    default:
      return 'Sign in to create or recover your Starknet wallet';
  }
}

function MetricRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <View style={s.metricRow}>
      <Text style={s.metricLabel}>{label}</Text>
      <Text style={[s.metricValue, accent && s.metricValueAccent]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={!onPress}
      style={[s.chip, active && s.chipActive, !onPress && s.chipStatic]}
    >
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function WalletStatusCard({
  title = 'Wallet Status',
  subtitle = 'The simulator uses your Privy-authenticated Starknet Sepolia wallet.',
  emphasizeWallet = false,
}: WalletStatusCardProps) {
  const bridge = useStarknetWalletBridge();
  const walletState = useSimulatorWallet(18);
  const auth = useStarknetPrivyLogin();

  return (
    <Card>
      <SectionLabel text={title} />
      <Text style={s.body}>{subtitle}</Text>
      <View style={s.metricStack}>
        <MetricRow label="Network" value={`Starknet ${STARKNET_NETWORK}`} accent />
        <MetricRow label="Bridge" value={formatBridgeStatus(bridge.status)} />
        <MetricRow label="Address" value={walletState.shortAddress || 'Not connected'} />
        <MetricRow
          label={emphasizeWallet ? 'Live STRK' : 'Balance'}
          value={walletState.balance || MOCK.strkBalance}
        />
        <MetricRow label="Auth" value={auth.authenticated ? 'Authenticated' : 'Not signed in'} />
      </View>
      {bridge.error ? (
        <Text style={s.errorText}>
          {bridge.error.message || 'The StarkZap bridge could not finish connecting.'}
        </Text>
      ) : null}
    </Card>
  );
}

function formatTxError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  if (typeof error === 'string' && error.trim()) {
    return error;
  }
  return fallback;
}

function isPositiveAmount(value: string) {
  const numeric = Number(value);
  return Number.isFinite(numeric) && numeric > 0;
}

function WalletAuthPanel({ onWalletReady }: { onWalletReady?: () => void }) {
  const login = useStarknetPrivyLogin();
  const bridge = useStarknetWalletBridge();
  const walletState = useSimulatorWallet(18);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pendingOAuth, setPendingOAuth] = useState<OAuthProvider | null>(null);
  const [busy, setBusy] = useState<'email' | 'code' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailForFlow =
    login.state.kind === 'sending-code' || login.state.kind === 'awaiting-code'
      ? login.state.email
      : email.trim();

  const liveReady = bridge.ready && !!bridge.address;

  const handleStartEmail = useCallback(async () => {
    const clean = email.trim();
    if (!clean) {
      setError('Enter an email address to receive a verification code.');
      return;
    }
    setError(null);
    setBusy('email');
    try {
      await login.startEmail(clean);
    } catch (cause: any) {
      setError(cause?.message ?? 'Privy could not send the login code.');
    } finally {
      setBusy(null);
    }
  }, [email, login]);

  const handleSubmitCode = useCallback(async () => {
    if (!emailForFlow || !code.trim()) {
      setError('Enter the code Privy sent to your inbox.');
      return;
    }
    setError(null);
    setBusy('code');
    try {
      await login.submitEmailCode(emailForFlow, code.trim());
      onWalletReady?.();
    } catch (cause: any) {
      setError(cause?.message ?? 'The verification code was not accepted.');
    } finally {
      setBusy(null);
    }
  }, [code, emailForFlow, login, onWalletReady]);

  const handleOAuth = useCallback(async (provider: OAuthProvider) => {
    const fallback = email.trim() || `${provider}@example.com`;
    setPendingOAuth(provider);
    setError(null);
    try {
      await login.startOAuth(provider, fallback);
      onWalletReady?.();
    } catch (cause: any) {
      setError(cause?.message ?? `Privy could not finish ${provider} sign-in.`);
    } finally {
      setPendingOAuth(null);
    }
  }, [email, login, onWalletReady]);

  if (!PRIVY_ENABLED) {
    return (
      <Card>
        <SectionLabel text="Privy Required" />
        <Text style={s.body}>
          Live Starknet wallet login is disabled in this environment because the Privy app ID is not configured.
        </Text>
        <ResultBox correct={false} message="Set the Privy env vars to enable real embedded wallet creation." />
      </Card>
    );
  }

  if (!isStarkzapAvailable()) {
    return (
      <Card>
        <SectionLabel text="StarkZap Required" />
        <Text style={s.body}>
          Privy is configured, but the StarkZap SDK package is not available in this build, so the simulator stays in education mode.
        </Text>
        <ResultBox correct={false} message="Install the StarkZap package to unlock live Sepolia wallet execution." />
      </Card>
    );
  }

  return (
    <>
      <Card>
        <SectionLabel text="Privy Login" />
        <Text style={s.body}>{getLoginSummary(login.state)}</Text>

        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          placeholder="you@example.com"
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={email}
          onChangeText={setEmail}
        />

        {(login.state.kind === 'awaiting-code' || login.state.kind === 'verifying') && (
          <TextInput
            autoCapitalize="characters"
            autoCorrect={false}
            placeholder="6-digit code"
            placeholderTextColor={Colors.textMuted}
            style={s.input}
            value={code}
            onChangeText={setCode}
          />
        )}

        <View style={s.buttonStack}>
          <PrimaryBtn
            label={busy === 'email' ? 'Sending code...' : 'Send email code'}
            onPress={handleStartEmail}
            disabled={busy !== null}
          />
          {(login.state.kind === 'awaiting-code' || login.state.kind === 'verifying') && (
            <PrimaryBtn
              label={busy === 'code' ? 'Verifying...' : 'Verify code'}
              onPress={handleSubmitCode}
              disabled={busy !== null || !code.trim()}
              color="#f59e0b"
            />
          )}
        </View>

        <Text style={s.smallMuted}>Or continue with OAuth:</Text>
        <View style={s.chipRow}>
          <Chip
            label={pendingOAuth === 'google' ? 'Google...' : 'Google'}
            onPress={() => void handleOAuth('google')}
            active={pendingOAuth === 'google'}
          />
          <Chip
            label={pendingOAuth === 'twitter' ? 'Twitter...' : 'Twitter'}
            onPress={() => void handleOAuth('twitter')}
            active={pendingOAuth === 'twitter'}
          />
          <Chip
            label={pendingOAuth === 'apple' ? 'Apple...' : 'Apple'}
            onPress={() => void handleOAuth('apple')}
            active={pendingOAuth === 'apple'}
          />
        </View>

        {error ? <Text style={s.errorText}>{error}</Text> : null}
      </Card>

      <WalletStatusCard emphasizeWallet />

      {walletState.address ? (
        <>
          <StarknetAddressBanner address={walletState.address} />
          {!liveReady ? (
            <ResultBox
              correct={false}
              message="Privy auth can finish before StarkZap reconnects. Wait for the bridge to show Connected, then continue."
            />
          ) : (
            <ResultBox
              correct
              message="Your Starknet Sepolia wallet is connected through Privy and ready for StarkZap lesson flows."
            />
          )}
        </>
      ) : null}
    </>
  );
}

function WalletSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();
  const walletState = useSimulatorWallet(18);
  const ready = bridge.ready && !!bridge.address;

  return (
    <SimShell
      icon="⚡"
      label="Starknet Live"
      title="Create Your Starknet Sepolia Wallet"
      subtitle="Sign in with Privy, let the backend provision the Starknet wallet, and confirm StarkZap can see it."
    >
      <WalletAuthPanel />

      {walletState.address ? <StarknetFaucetSheet address={walletState.address} /> : null}

      <Card>
        <SectionLabel text="Docs Flow" />
        <Text style={s.body}>
          1. Privy authenticates the user. 2. The backend creates or returns the Starknet wallet. 3. StarkZap connects with a Privy signer and sponsored fee mode on Sepolia.
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Backend endpoint" value="/api/wallets/create-starknet" />
          <MetricRow label="Fee mode" value={SPONSORED_FEE_MODE.type} />
          <MetricRow label="Explorer" value="Voyager Sepolia" />
        </View>
      </Card>

      {ready ? (
        <PrimaryBtn label="Wallet ready - continue" onPress={onComplete} />
      ) : (
        <GhostBtn label="Skip simulator for now" onPress={onSkip} />
      )}
    </SimShell>
  );
}

function GaslessSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();
  const walletState = useSimulatorWallet(18);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const runSponsoredFlow = useCallback(async () => {
    const wallet = bridge.wallet;
    if (!wallet?.ensureReady || !bridge.address) {
      setMessage('Connect the Privy Starknet wallet before testing a sponsored transaction.');
      return;
    }

    setLoading(true);
    setMessage(null);
    try {
      await wallet.ensureReady({
        deploy: 'if_needed',
        feeMode: SPONSORED_FEE_MODE,
      });
      const tx = await wallet.transfer(
        STARKNET_TOKENS.STRK,
        [{ to: bridge.address as any, amount: createStarkzapAmount('0.1', STARKNET_TOKENS.STRK) }],
        { feeMode: SPONSORED_FEE_MODE },
      );
      await tx.wait?.();
      setMessage(`Sponsored transaction accepted on Starknet Sepolia: ${tx.hash.slice(0, 12)}...`);
    } catch (cause: any) {
      setMessage(cause?.message ?? 'The paymaster readiness step did not complete.');
    } finally {
      setLoading(false);
    }
  }, [bridge.address, bridge.wallet]);

  return (
    <SimShell
      icon="⛽"
      label="Account Abstraction"
      title="Gasless Sepolia Flow"
      subtitle="See how StarkZap combines Privy sign-in with paymaster-backed Starknet transactions."
    >
      <WalletStatusCard
        title="Connection Check"
        subtitle="A sponsored transaction still needs a connected wallet. The paymaster covers fees after the user signs."
      />

      {walletState.address ? <StarknetAddressBanner address={walletState.address} /> : null}

      <Card>
        <SectionLabel text="What Happens" />
        <Text style={s.body}>
          The user signs with their Privy-managed Starknet key. StarkZap packages the call and sends it with paymaster fee mode so the dApp can sponsor gas.
        </Text>
        <View style={s.chipRow}>
          <Chip label="Sign" active />
          <Chip label="Bundle" active />
          <Chip label="Paymaster" active />
          <Chip label="Submit" active />
        </View>
      </Card>

      <PrimaryBtn
        label={loading ? 'Submitting...' : 'Run sponsored self-transfer'}
        onPress={() => void runSponsoredFlow()}
        disabled={loading || !bridge.wallet}
      />

      {message ? (
        <ResultBox correct={message.startsWith('Sponsored transaction') || message.startsWith('Sponsored account')} message={message} />
      ) : null}

      <PrimaryBtn label="Continue" onPress={onComplete} color="#f59e0b" />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function SwapSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();
  const [amount, setAmount] = useState('10');
  const [tokenOut, setTokenOut] = useState<'USDC' | 'ETH'>('USDC');
  const [quote, setQuote] = useState<string | null>(null);
  const [impact, setImpact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const fetchQuote = useCallback(async () => {
    const wallet = bridge.wallet;
    const numeric = Number(amount);
    if (!numeric || numeric <= 0) {
      setError('Enter a valid STRK amount to preview a route.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      if (wallet?.getQuote) {
        const tokenIn = STARKNET_TOKENS.STRK;
        const outputToken = tokenOut === 'USDC' ? STARKNET_TOKENS.USDC : STARKNET_TOKENS.ETH;
        const result = await wallet.getQuote({
          tokenIn,
          tokenOut: outputToken,
          amountIn: createStarkzapAmount(String(numeric), tokenIn),
          slippageBps: 50n,
        });
        const quotedAmount = createStarkzapAmountFromBase(result.amountOutBase, outputToken).toFormatted();
        setQuote(quotedAmount);
        setImpact(
          result.priceImpactBps !== undefined
            ? `${(Number(result.priceImpactBps) / 100).toFixed(2)}%`
            : '0.12%',
        );
      } else {
        setQuote(tokenOut === 'USDC' ? MOCK.swapQuote.to : '≈ 0.0028 ETH');
        setImpact(MOCK.swapQuote.impact);
      }
    } catch (cause: any) {
      setError(cause?.message ?? 'Quote retrieval failed.');
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet, tokenOut]);

  const executeSwap = useCallback(async () => {
    const wallet = bridge.wallet;
    const numeric = Number(amount);
    if (!wallet) {
      setError('Connect the Privy Starknet wallet before executing a swap.');
      return;
    }
    if (!numeric || numeric <= 0) {
      setError('Enter a valid STRK amount to swap.');
      return;
    }

    const tokenIn = STARKNET_TOKENS.STRK;
    const outputToken = tokenOut === 'USDC' ? STARKNET_TOKENS.USDC : STARKNET_TOKENS.ETH;

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const tx = await wallet.swap({
        tokenIn,
        tokenOut: outputToken,
        amountIn: createStarkzapAmount(String(numeric), tokenIn),
        slippageBps: 50n,
      }, { feeMode: SPONSORED_FEE_MODE });
      await tx.wait?.();
      setResult(`Swap submitted on Starknet Sepolia: ${tx.hash.slice(0, 12)}...`);
    } catch (cause: any) {
      setError(cause?.message ?? 'Swap execution failed.');
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet, tokenOut]);

  return (
    <SimShell
      icon="⇄"
      label="Dex Routing"
      title="Preview a StarkZap Swap"
      subtitle="Use the connected wallet to request a live route from STRK into another Sepolia asset."
    >
      <WalletStatusCard />

      <Card>
        <SectionLabel text="Swap Setup" />
        <Text style={s.body}>Token in is fixed to STRK so the lesson stays aligned with the Starknet faucet flow.</Text>
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Amount in STRK"
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={amount}
          onChangeText={setAmount}
        />
        <View style={s.chipRow}>
          <Chip label="To USDC" active={tokenOut === 'USDC'} onPress={() => setTokenOut('USDC')} />
          <Chip label="To ETH" active={tokenOut === 'ETH'} onPress={() => setTokenOut('ETH')} />
        </View>
      </Card>

      <PrimaryBtn
        label={loading ? 'Fetching quote...' : 'Fetch StarkZap quote'}
        onPress={() => void fetchQuote()}
        disabled={loading}
      />

      {quote ? (
        <Card>
          <SectionLabel text="Route Preview" />
          <MetricRow label="You pay" value={`${amount} STRK`} />
          <MetricRow label="You receive" value={quote} accent />
          <MetricRow label="Price impact" value={impact ?? '0.12%'} />
        </Card>
      ) : null}

      <PrimaryBtn
        label={loading ? 'Submitting swap...' : 'Execute StarkZap swap'}
        onPress={() => void executeSwap()}
        disabled={loading || !quote || !bridge.wallet}
        color="#f59e0b"
      />

      {error ? <ResultBox correct={false} message={error} /> : null}
      {result ? <ResultBox correct message={result} /> : null}

      <PrimaryBtn label="Continue" onPress={onComplete} color="#f59e0b" />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function StakeSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();
  const [amount, setAmount] = useState('25');
  const validators = useMemo(() => Object.values(STARKNET_SEPOLIA_VALIDATORS).slice(0, 4), []);
  const [validator, setValidator] = useState(validators[0]?.stakerAddress ?? '');
  const [poolAddress, setPoolAddress] = useState<string | null>(null);
  const [poolLabel, setPoolLabel] = useState('Loading validator pools...');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!validator || !starkzapSdk?.getStakerPools) {
      setPoolAddress(null);
      setPoolLabel('Validator pool lookup unavailable in this build.');
      return;
    }

    let cancelled = false;
    setPoolAddress(null);
    setPoolLabel('Loading validator pools...');

    void (async () => {
      try {
        const pools = await starkzapSdk.getStakerPools(validator as any);
        const strkPool = pools.find((pool: any) => pool?.token?.symbol === 'STRK') ?? pools[0];
        if (cancelled) {
          return;
        }
        if (!strkPool?.poolContract) {
          setPoolLabel('No STRK staking pool was returned for this validator.');
          return;
        }
        setPoolAddress(strkPool.poolContract);
        setPoolLabel(`${strkPool.token?.symbol ?? 'Pool'} · ${strkPool.poolContract.slice(0, 10)}...`);
      } catch (error) {
        if (!cancelled) {
          setPoolLabel(formatTxError(error, 'Validator pools could not be loaded from StarkZap.'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [validator]);

  const selectedValidatorName =
    validators.find((entry) => entry.stakerAddress === validator)?.name ?? 'Validator';

  const executeStake = useCallback(async () => {
    const wallet = bridge.wallet;
    if (!wallet || !poolAddress) {
      setResult('Connect the Privy Starknet wallet and wait for a STRK pool before staking.');
      return;
    }
    if (!isPositiveAmount(amount)) {
      setResult('Enter a valid STRK amount to stake.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const tx = await wallet.stake(
        poolAddress as any,
        createStarkzapAmount(amount, STARKNET_TOKENS.STRK),
        { feeMode: SPONSORED_FEE_MODE },
      );
      await tx.wait?.();
      setResult(`Stake submitted on Starknet Sepolia: ${tx.hash.slice(0, 12)}...`);
    } catch (error) {
      setResult(formatTxError(error, 'Staking could not be submitted.'));
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet, poolAddress]);

  return (
    <SimShell
      icon="🏦"
      label="Staking"
      title="Plan a Sepolia Staking Position"
      subtitle="Choose a validator and review how Starknet staking lessons map user input into a wallet action."
    >
      <WalletStatusCard />

      <Card>
        <SectionLabel text="Position Builder" />
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Amount in STRK"
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={amount}
          onChangeText={setAmount}
        />
        <View style={s.chipColumn}>
          {validators.map((item) => (
            <Chip
              key={item.stakerAddress}
              label={item.name}
              active={validator === item.stakerAddress}
              onPress={() => setValidator(item.stakerAddress)}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel text="Preview" />
        <MetricRow label="Stake amount" value={`${amount || '0'} STRK`} accent />
        <MetricRow label="Validator" value={selectedValidatorName} />
        <MetricRow label="Pool" value={poolLabel} />
        <MetricRow label="Lesson goal" value="Execute a real Sepolia stake with the Privy-backed wallet" />
      </Card>

      <PrimaryBtn
        label={loading ? 'Submitting stake...' : 'Stake with StarkZap'}
        onPress={() => void executeStake()}
        disabled={loading || !poolAddress}
      />
      {result ? <ResultBox correct={result.startsWith('Stake submitted')} message={result} /> : null}
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function LendSim({ onComplete, onSkip, simulatorType }: Props) {
  const isBorrow = baseType(simulatorType) === 'starkzap-borrow';
  const bridge = useStarknetWalletBridge();
  const modeTitle = isBorrow ? 'Borrow Against Collateral' : 'Supply Assets for Yield';
  const [amount, setAmount] = useState(isBorrow ? '5' : '10');
  const [collateralAmount, setCollateralAmount] = useState('25');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [marketSummary, setMarketSummary] = useState('Loading Vesu markets...');

  useEffect(() => {
    if (!bridge.wallet) {
      setMarketSummary('Connect the wallet to inspect Vesu market data.');
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const markets = await bridge.wallet.lending().getMarkets();
        if (cancelled) {
          return;
        }
        const strkMarket = markets.find((market: any) => market?.asset?.symbol === 'STRK');
        const usdcMarket = markets.find((market: any) => market?.asset?.symbol === 'USDC');
        setMarketSummary(
          `Vesu live: ${strkMarket?.asset?.symbol ?? 'STRK'} collateral / ${usdcMarket?.asset?.symbol ?? 'USDC'} debt.`,
        );
      } catch (error) {
        if (!cancelled) {
          setMarketSummary(formatTxError(error, 'Vesu market metadata could not be loaded.'));
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [bridge.wallet]);

  const executeAction = useCallback(async () => {
    const wallet = bridge.wallet;
    if (!wallet) {
      setResult('Connect the Privy Starknet wallet before submitting a lending action.');
      return;
    }
    if (!isPositiveAmount(amount)) {
      setResult(`Enter a valid ${isBorrow ? 'borrow' : 'deposit'} amount.`);
      return;
    }
    if (isBorrow && !isPositiveAmount(collateralAmount)) {
      setResult('Enter a valid STRK collateral amount for the borrow flow.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const lending = wallet.lending();
      const tx = isBorrow
        ? await lending.borrow({
            collateralToken: STARKNET_TOKENS.STRK,
            debtToken: STARKNET_TOKENS.USDC,
            amount: createStarkzapAmount(amount, STARKNET_TOKENS.USDC),
            collateralAmount: createStarkzapAmount(collateralAmount, STARKNET_TOKENS.STRK),
            user: wallet.address as any,
          }, { feeMode: SPONSORED_FEE_MODE })
        : await lending.deposit({
            token: STARKNET_TOKENS.STRK,
            amount: createStarkzapAmount(amount, STARKNET_TOKENS.STRK),
            receiver: wallet.address as any,
          }, { feeMode: SPONSORED_FEE_MODE });
      await tx.wait?.();
      setResult(`${isBorrow ? 'Borrow' : 'Deposit'} submitted on Starknet Sepolia: ${tx.hash.slice(0, 12)}...`);
    } catch (error) {
      setResult(formatTxError(error, isBorrow ? 'Borrow submission failed.' : 'Deposit submission failed.'));
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet, collateralAmount, isBorrow]);

  return (
    <SimShell
      icon={isBorrow ? '📉' : '🏛️'}
      label="Lending"
      title={modeTitle}
      subtitle="This lesson shell is restored and ready to continue once the live protocol-specific calls are finalized."
    >
      <WalletStatusCard />

      <Card>
        <SectionLabel text="Lesson Focus" />
        <TextInput
          keyboardType="decimal-pad"
          placeholder={isBorrow ? 'Borrow amount in USDC' : 'Deposit amount in STRK'}
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={amount}
          onChangeText={setAmount}
        />
        {isBorrow ? (
          <TextInput
            keyboardType="decimal-pad"
            placeholder="Collateral in STRK"
            placeholderTextColor={Colors.textMuted}
            style={s.input}
            value={collateralAmount}
            onChangeText={setCollateralAmount}
          />
        ) : null}
        <Text style={s.body}>
          {isBorrow
            ? 'This simulator now calls StarkZap lending directly. The collateral amount is sent with the borrow request for the Sepolia path.'
            : 'This simulator now calls StarkZap lending directly, supplying STRK into the default Vesu market on Sepolia.'}
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Market" value="Vesu lending provider" />
          <MetricRow label="Asset" value={isBorrow ? 'USDC borrowed against STRK' : 'STRK supplied for yield'} />
          <MetricRow label="Execution" value={marketSummary} accent />
        </View>
      </Card>

      <PrimaryBtn
        label={loading ? (isBorrow ? 'Submitting borrow...' : 'Submitting deposit...') : (isBorrow ? 'Borrow via StarkZap' : 'Deposit via StarkZap')}
        onPress={() => void executeAction()}
        disabled={loading}
      />
      {result ? <ResultBox correct={result.startsWith(isBorrow ? 'Borrow submitted' : 'Deposit submitted')} message={result} /> : null}
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function DcaSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();
  const [amount, setAmount] = useState('5');
  const [total, setTotal] = useState('20');
  const [cadence, setCadence] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const frequency = cadence === 'daily' ? 'P1D' : cadence === 'weekly' ? 'P1W' : 'P1M';

  const previewCycle = useCallback(async () => {
    const wallet = bridge.wallet;
    if (!wallet) {
      setResult('Connect the Privy Starknet wallet before previewing a DCA cycle.');
      return;
    }
    if (!isPositiveAmount(amount)) {
      setResult('Enter a valid STRK amount per cycle.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const quote = await wallet.dca().previewCycle({
        sellToken: STARKNET_TOKENS.STRK,
        buyToken: STARKNET_TOKENS.USDC,
        sellAmountPerCycle: createStarkzapAmount(amount, STARKNET_TOKENS.STRK),
      });
      setPreview(createStarkzapAmountFromBase(quote.amountOutBase, STARKNET_TOKENS.USDC).toFormatted());
    } catch (error) {
      setResult(formatTxError(error, 'DCA preview could not be loaded.'));
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet]);

  const createOrder = useCallback(async () => {
    const wallet = bridge.wallet;
    if (!wallet) {
      setResult('Connect the Privy Starknet wallet before creating a DCA order.');
      return;
    }
    if (!isPositiveAmount(amount) || !isPositiveAmount(total)) {
      setResult('Enter valid total and per-cycle STRK amounts.');
      return;
    }

    setLoading(true);
    setResult(null);
    try {
      const tx = await wallet.dca().create({
        sellToken: STARKNET_TOKENS.STRK,
        buyToken: STARKNET_TOKENS.USDC,
        sellAmount: createStarkzapAmount(total, STARKNET_TOKENS.STRK),
        sellAmountPerCycle: createStarkzapAmount(amount, STARKNET_TOKENS.STRK),
        frequency,
        traderAddress: wallet.address as any,
      }, { feeMode: SPONSORED_FEE_MODE });
      await tx.wait?.();
      setResult(`DCA order submitted on Starknet Sepolia: ${tx.hash.slice(0, 12)}...`);
    } catch (error) {
      setResult(formatTxError(error, 'DCA order creation failed.'));
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet, frequency, total]);

  return (
    <SimShell
      icon="📆"
      label="Automation"
      title="Design a Starknet DCA Plan"
      subtitle="Map a recurring buy schedule into the StarkZap DCA module before turning it into a live order."
    >
      <WalletStatusCard />

      <Card>
        <SectionLabel text="Plan Inputs" />
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Total STRK to sell"
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={total}
          onChangeText={setTotal}
        />
        <TextInput
          keyboardType="decimal-pad"
          placeholder="STRK per cycle"
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={amount}
          onChangeText={setAmount}
        />
        <View style={s.chipRow}>
          <Chip label="Daily" active={cadence === 'daily'} onPress={() => setCadence('daily')} />
          <Chip label="Weekly" active={cadence === 'weekly'} onPress={() => setCadence('weekly')} />
          <Chip label="Monthly" active={cadence === 'monthly'} onPress={() => setCadence('monthly')} />
        </View>
      </Card>

      <Card>
        <SectionLabel text="Plan Summary" />
        <MetricRow label="Cadence" value={cadence} />
        <MetricRow label="Total size" value={`${total || '0'} STRK`} />
        <MetricRow label="Cycle size" value={`${amount || '0'} STRK`} accent />
        <MetricRow label="Target concept" value="Recurring execution and price averaging" />
      </Card>

      <PrimaryBtn
        label={loading ? 'Working...' : 'Preview one DCA cycle'}
        onPress={() => void previewCycle()}
        disabled={loading}
      />
      {preview ? (
        <Card>
          <SectionLabel text="Per-Cycle Preview" />
          <MetricRow label="Estimated output" value={preview} accent />
          <MetricRow label="Provider" value="AVNU DCA" />
        </Card>
      ) : null}
      <PrimaryBtn
        label={loading ? 'Submitting order...' : 'Create DCA order'}
        onPress={() => void createOrder()}
        disabled={loading}
        color="#f59e0b"
      />
      {result ? <ResultBox correct={result.startsWith('DCA order submitted')} message={result} /> : null}
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BridgeSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();

  return (
    <SimShell
      icon="🌉"
      label="Bridge Flow"
      title="Bridge Readiness Check"
      subtitle="Use the connected Starknet Sepolia wallet as the destination. The source side still comes from an external chain wallet."
    >
      <WalletStatusCard />

      <Card>
        <SectionLabel text="Bridge Checklist" />
        <Text style={s.body}>
          StarkZap treats bridge deposits as an external-chain action. Your Privy Starknet wallet is the recipient on Sepolia, but the source side still needs a wallet on Ethereum, Solana, or another supported origin chain.
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Destination" value={bridge.address ?? 'Connect wallet first'} accent />
          <MetricRow label="Source wallet" value="External origin-chain wallet required" />
          <MetricRow label="Docs boundary" value="Bridge deposits are not Starknet-only wallet calls" />
        </View>
      </Card>

      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BalanceSim({ onComplete, onSkip }: Props) {
  const walletState = useSimulatorWallet(18);
  const bridge = useStarknetWalletBridge();
  const [tokenBalances, setTokenBalances] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const refreshBalances = useCallback(async () => {
    const wallet = bridge.wallet;
    if (!wallet) {
      setResult('Connect the Privy Starknet wallet before reading token balances.');
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const [strk, eth, usdc] = await Promise.all([
        wallet.balanceOf(STARKNET_TOKENS.STRK),
        wallet.balanceOf(STARKNET_TOKENS.ETH),
        wallet.balanceOf(STARKNET_TOKENS.USDC),
      ]);
      setTokenBalances({
        STRK: strk.toFormatted(),
        ETH: eth.toFormatted(),
        USDC: usdc.toFormatted(),
      });
    } catch (error) {
      setResult(formatTxError(error, 'Live balance reads failed.'));
    } finally {
      setLoading(false);
    }
  }, [bridge.wallet]);

  useEffect(() => {
    if (bridge.wallet) {
      void refreshBalances();
    }
  }, [bridge.wallet, refreshBalances]);

  return (
    <SimShell
      icon="🧾"
      label="Portfolio Read"
      title="Inspect Wallet Balances"
      subtitle="Read the Starknet Sepolia wallet state the rest of the StarkZap simulators depend on."
    >
      <WalletStatusCard emphasizeWallet />
      {walletState.address ? <StarknetAddressBanner address={walletState.address} /> : null}
      <Card>
        <SectionLabel text="Token Balances" />
        <MetricRow label="STRK" value={tokenBalances.STRK ?? 'Not loaded'} accent />
        <MetricRow label="ETH" value={tokenBalances.ETH ?? 'Not loaded'} />
        <MetricRow label="USDC" value={tokenBalances.USDC ?? 'Not loaded'} />
      </Card>
      <PrimaryBtn
        label={loading ? 'Refreshing...' : 'Refresh live balances'}
        onPress={() => void refreshBalances()}
        disabled={loading || !bridge.wallet}
      />
      {result ? <ResultBox correct={false} message={result} /> : null}
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BuildSim({ onComplete, onSkip }: Props) {
  return (
    <SimShell
      icon="🛠️"
      label="Integration"
      title="Wire Privy Into StarkZap"
      subtitle="Review the exact components now backing the lesson wallet flow."
    >
      <Card>
        <SectionLabel text="Current Integration" />
        <Text style={s.body}>
          The app now uses `useStarknetPrivyLogin` for auth, `ensureStarknetWallet` for server-side wallet provisioning, and `useStarkzapWallet` for StarkZap signer connection.
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Auth hook" value="useStarknetPrivyLogin" accent />
          <MetricRow label="Backend" value="POST /api/wallets/create-starknet" />
          <MetricRow label="Bridge" value="useStarkzapWallet + PrivySigner" />
        </View>
      </Card>

      <Card>
        <SectionLabel text="Why It Matters" />
        <Text style={s.body}>
          This keeps the lesson flow aligned with the Privy docs: the user logs in once, the embedded Starknet wallet is resolved, and the SDK can sign real Sepolia calls without a browser extension.
        </Text>
      </Card>

      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BossSim({ onComplete, onSkip }: Props) {
  return (
    <SimShell
      icon="👑"
      label="Boss Mode"
      title="StarkZap Boss Flow"
      subtitle="Tie the wallet, sponsored execution, and Starknet lesson concepts together before the final push."
    >
      <WalletStatusCard emphasizeWallet />

      <Card>
        <SectionLabel text="Boss Checklist" />
        <View style={s.chipColumn}>
          <Chip label="Privy authentication complete" active />
          <Chip label="Starknet wallet address provisioned" active />
          <Chip label="StarkZap bridge connected" active />
          <Chip label="Sepolia funding path understood" active />
          <Chip label="Simulator shells restored" active />
        </View>
      </Card>

      <PrimaryBtn label="Complete boss checkpoint" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function ConfidentialSim({ onComplete, onSkip }: Props) {
  const tongoConfigured = Boolean(
    process.env.EXPO_PUBLIC_TONGO_PRIVATE_KEY?.trim() &&
    process.env.EXPO_PUBLIC_TONGO_CONTRACT_ADDRESS?.trim(),
  );

  return (
    <SimShell
      icon="🔐"
      label="Privacy"
      title="Confidential Transfer Requirements"
      subtitle="Privy powers the Starknet wallet, but StarkZap confidential transfers still require Tongo key material."
    >
      <Card>
        <SectionLabel text="Docs Expectation" />
        <Text style={s.body}>
          Tongo confidential accounts are separate from the Privy wallet. The Privy-managed Starknet account funds and submits calls, while the confidential account still needs its own Tongo private key and deployed contract address.
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Privy Starknet wallet" value="Used for funding + execution" />
          <MetricRow label="Tongo private key" value={tongoConfigured ? 'Configured' : 'Missing'} accent={tongoConfigured} />
          <MetricRow label="Tongo contract" value={tongoConfigured ? 'Configured' : 'Missing'} accent={tongoConfigured} />
        </View>
      </Card>

      <ResultBox
        correct={tongoConfigured}
        message={
          tongoConfigured
            ? 'The environment is ready for a future live confidential flow.'
            : 'Add EXPO_PUBLIC_TONGO_PRIVATE_KEY and EXPO_PUBLIC_TONGO_CONTRACT_ADDRESS to enable live confidential transfer support.'
        }
      />
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function EcosystemReadSim({ onComplete, onSkip }: Props) {
  return (
    <SimShell
      icon="📡"
      label="Ecosystem Read"
      title="Ecosystem Snapshot"
      subtitle="This routing path is restored with a safe shell so read-only Starknet lessons can advance again."
    >
      <Card>
        <SectionLabel text="Snapshot" />
        <MetricRow label="Network" value="Starknet Sepolia / ecosystem data" accent />
        <MetricRow label="Explorer" value={STARKNET_SEPOLIA.explorer} />
        <MetricRow label="Mode" value="Read-only lesson checkpoint" />
      </Card>
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function PackageInstallSim({ onComplete, onSkip }: Props) {
  return (
    <SimShell
      icon="📦"
      label="Toolchain"
      title="Install StarkZap"
      subtitle="Guide users through the package install step while the richer simulator is reintroduced."
    >
      <Card>
        <SectionLabel text="Command" />
        <Text style={s.code}>npm install starkzap</Text>
        <Text style={s.code}>npm install starkzap-native react-native-get-random-values fast-text-encoding @ethersproject/shims buffer</Text>
        <Text style={s.smallMuted}>
          Web builds use `starkzap`; Expo and React Native builds use `starkzap-native` plus the native peer dependencies called out in the docs.
        </Text>
      </Card>
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function MainnetPushSim({ onComplete, onSkip }: Props) {
  return (
    <SimShell
      icon="🚀"
      label="Release"
      title="Mainnet Push Readiness"
      subtitle="Sepolia first, then mainnet. This restored shell preserves the deployment checkpoint."
    >
      <Card>
        <SectionLabel text="Guardrails" />
        <Text style={s.body}>
          Confirm wallet connection, funding, protocol addresses, and rollback plans on Sepolia before graduating the flow to mainnet.
        </Text>
      </Card>
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function UnsupportedSim({ simulatorType, onComplete, onSkip, scenario }: Props) {
  return (
    <SimShell
      icon="⚡"
      label="Starknet Live"
      title="StarkZap Lesson Shell"
      subtitle={`The simulator type "${simulatorType}" is now safely handled while the richer variant is rebuilt.`}
    >
      <Card>
        <SectionLabel text="Scenario" />
        <Text style={s.body}>{scenario || 'No authored scenario was attached to this lesson step.'}</Text>
      </Card>
      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

export default function StarkzapSimulatorCard(props: Props) {
  const type = baseType(props.simulatorType);

  switch (type) {
    case 'starkzap-wallet':
      return <WalletSim {...props} />;
    case 'starkzap-gasless':
      return <GaslessSim {...props} />;
    case 'starkzap-swap':
      return <SwapSim {...props} />;
    case 'starkzap-stake':
      return <StakeSim {...props} />;
    case 'starkzap-lend':
    case 'starkzap-borrow':
      return <LendSim {...props} />;
    case 'starkzap-dca':
      return <DcaSim {...props} />;
    case 'starkzap-bridge':
      return <BridgeSim {...props} />;
    case 'starkzap-balance':
      return <BalanceSim {...props} />;
    case 'starkzap-build':
      return <BuildSim {...props} />;
    case 'starkzap-boss':
      return <BossSim {...props} />;
    case 'starkzap-confidential':
      return <ConfidentialSim {...props} />;
    case 'starkzap-ecosystem-read':
      return <EcosystemReadSim {...props} />;
    case 'starkzap-package-install':
      return <PackageInstallSim {...props} />;
    case 'starkzap-mainnet-push':
      return <MainnetPushSim {...props} />;
    default:
      return <UnsupportedSim {...props} />;
  }
}

const s = StyleSheet.create({
  body: {
    fontSize: FontSize.sm,
    color: Colors.text,
    lineHeight: 21,
  },
  smallMuted: {
    fontSize: FontSize.xs,
    color: Colors.textSoft,
    lineHeight: 18,
  },
  input: {
    backgroundColor: Colors.inputBg,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.border,
    color: Colors.text,
    fontSize: FontSize.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  buttonStack: {
    gap: Spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chipColumn: {
    gap: Spacing.xs,
  },
  chip: {
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    backgroundColor: '#fff',
  },
  chipActive: {
    backgroundColor: Colors.accent + '18',
    borderColor: Colors.accent,
  },
  chipStatic: {
    opacity: 0.95,
  },
  chipText: {
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  chipTextActive: {
    color: Colors.accent,
  },
  metricStack: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: '#fff',
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  metricLabel: {
    flex: 1,
    color: Colors.textSoft,
    fontSize: FontSize.xs,
    fontWeight: '700',
  },
  metricValue: {
    maxWidth: '58%',
    color: Colors.text,
    fontSize: FontSize.xs,
    fontWeight: '800',
  },
  metricValueAccent: {
    color: Colors.accent,
  },
  errorText: {
    marginTop: Spacing.sm,
    color: Colors.red,
    fontSize: FontSize.xs,
    fontWeight: '700',
    lineHeight: 18,
  },
  code: {
    backgroundColor: '#0f172a',
    color: '#e2e8f0',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.xs,
    fontFamily: 'monospace',
    overflow: 'hidden',
  },
});
