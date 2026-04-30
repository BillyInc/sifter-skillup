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
import StarknetFaucetButton from '../StarknetFaucetButton';
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
  | 'starkzap-btc-swap'
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
  | 'starkzap-gaming-read'
  | 'starkzap-ecosystem-map'
  | 'starkzap-mainnet-push'
  | 'starkzap-package-install';

type WalletStatusCardProps = {
  title?: string;
  emphasizeWallet?: boolean;
};

function getConnectionModeLabel(mode: 'sponsored' | 'self-paid' | null) {
  switch (mode) {
    case 'self-paid':
      return 'Self-paid';
    case 'sponsored':
      return 'Sponsored';
    default:
      return 'Pending';
  }
}

function baseType(simulatorType: string): WalletLessonId {
  return simulatorType.split(':')[0] as WalletLessonId;
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
  title = 'Wallet',
  emphasizeWallet = false,
}: WalletStatusCardProps) {
  const bridge = useStarknetWalletBridge();
  const walletState = useSimulatorWallet(18);
  const balanceLabel = emphasizeWallet ? 'STRK' : 'Balance';
  const balanceValue = walletState.balance || MOCK.strkBalance;
  const addressValue = walletState.shortAddress || 'Not connected';
  const bridgeValue =
    bridge.status === 'ready'
      ? 'Connected'
      : bridge.status === 'connecting'
        ? 'Connecting'
        : bridge.status === 'disconnected'
          ? 'Disconnected'
          : bridge.status === 'error'
            ? 'Issue'
            : 'Not connected';

  return (
    <Card>
      <SectionLabel text={title} />
      <View style={s.metricStack}>
        <MetricRow label="Network" value={`Starknet ${STARKNET_NETWORK}`} accent />
        <MetricRow label="Wallet" value={addressValue} />
        <MetricRow label={balanceLabel} value={balanceValue} accent={bridge.ready} />
        <MetricRow label="Bridge" value={bridgeValue} />
        <MetricRow label="Mode" value={getConnectionModeLabel(walletState.connectionMode)} />
      </View>
      {walletState.address ? (
        <View style={s.walletUtilityRow}>
          {walletState.needsFaucet ? (
            <StarknetFaucetButton walletAddress={walletState.address} compact />
          ) : null}
          <GhostBtn label="Open explorer" onPress={walletState.openExplorer} />
        </View>
      ) : null}
      {bridge.ready ? <Text style={s.walletNote}>Use this wallet for lesson actions on Sepolia.</Text> : null}
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

async function ensureWalletExecutionReady(wallet: any, feeMode = SPONSORED_FEE_MODE) {
  if (!wallet?.ensureReady) {
    return;
  }

  await wallet.ensureReady({
    deploy: 'if_needed',
    feeMode,
  });
}

function isPaymasterConfigurationError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('x-paymaster-api-key') ||
    normalized.includes('paymaster') ||
    normalized.includes('sponsored') ||
    normalized.includes('fee_mode')
  );
}

function isAvnuDcaRouteError(message: string) {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('avnu prepare dca create failed') ||
    normalized.includes('cannot read properties of undefined') ||
    normalized.includes('reading \'0\'')
  );
}

function WalletAuthPanel({ onWalletReady }: { onWalletReady?: () => void }) {
  const login = useStarknetPrivyLogin();
  const bridge = useStarknetWalletBridge();
  const walletState = useSimulatorWallet(18);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [showConnectOptions, setShowConnectOptions] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [pendingOAuth, setPendingOAuth] = useState<OAuthProvider | null>(null);
  const [busy, setBusy] = useState<'email' | 'code' | null>(null);
  const [error, setError] = useState<string | null>(null);

  const emailForFlow =
    login.state.kind === 'sending-code' || login.state.kind === 'awaiting-code'
      ? login.state.email
      : email.trim();

  const liveReady = bridge.ready && !!bridge.address;
  const bridgeDisconnected = bridge.status === 'disconnected';
  const isAwaitingCode = login.state.kind === 'awaiting-code' || login.state.kind === 'verifying';

  useEffect(() => {
    if (login.authenticated) {
      setShowConnectOptions(false);
      setShowEmailForm(false);
    }
  }, [login.authenticated]);

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
        <SectionLabel text="Connect Wallet" />
        {!login.authenticated ? (
          <>
            <Text style={s.body}>
              Connect your wallet to start live Starknet Sepolia actions.
            </Text>
            {!showConnectOptions ? (
              <PrimaryBtn
                label="Connect wallet"
                onPress={() => setShowConnectOptions(true)}
                compact
              />
            ) : (
              <View style={s.connectOptions}>
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

                {!showEmailForm && !isAwaitingCode ? (
                  <GhostBtn label="Use email instead" onPress={() => setShowEmailForm(true)} />
                ) : null}

                {(showEmailForm || isAwaitingCode) ? (
                  <View style={s.emailStack}>
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

                    {isAwaitingCode ? (
                      <TextInput
                        autoCapitalize="characters"
                        autoCorrect={false}
                        placeholder="6-digit code"
                        placeholderTextColor={Colors.textMuted}
                        style={s.input}
                        value={code}
                        onChangeText={setCode}
                      />
                    ) : null}

                    <View style={s.buttonStack}>
                      {!isAwaitingCode ? (
                        <PrimaryBtn
                          label={busy === 'email' ? 'Sending code...' : 'Send code'}
                          onPress={handleStartEmail}
                          disabled={busy !== null}
                          compact
                        />
                      ) : (
                        <PrimaryBtn
                          label={busy === 'code' ? 'Verifying...' : 'Verify code'}
                          onPress={handleSubmitCode}
                          disabled={busy !== null || !code.trim()}
                          color="#f59e0b"
                          compact
                        />
                      )}
                    </View>
                  </View>
                ) : null}
              </View>
            )}
          </>
        ) : (
          <Text style={s.body}>
            {liveReady ? 'Wallet connected and ready for lesson actions.' : 'Finishing wallet connection.'}
          </Text>
        )}

        {error ? <Text style={s.errorText}>{error}</Text> : null}
      </Card>

      <WalletStatusCard emphasizeWallet />

      {login.authenticated ? (
        <View style={s.walletControlRow}>
          {!bridgeDisconnected ? (
            <GhostBtn label="Disconnect wallet" onPress={bridge.disconnect} />
          ) : (
            <PrimaryBtn label="Reconnect wallet" onPress={bridge.connect} color="#f59e0b" compact />
          )}
        </View>
      ) : null}

      {walletState.address && !liveReady ? (
        <Text style={s.inlineStatus}>
          {bridgeDisconnected
            ? 'Wallet bridge is disconnected.'
            : 'Wallet found. Finishing StarkZap connection.'}
        </Text>
      ) : null}

      {liveReady ? <Text style={s.inlineStatusSuccess}>Ready for live lesson actions.</Text> : null}
    </>
  );
}

function WalletSim({ onComplete, onSkip }: Props) {
  const bridge = useStarknetWalletBridge();
  const ready = bridge.ready && !!bridge.address;

  return (
    <SimShell
      icon="⚡"
      label="Starknet Live"
      title="Connect Your Starknet Sepolia Wallet"
      subtitle="Connect once, fund STRK if needed, and use this wallet across the StarkZap lessons."
    >
      <WalletAuthPanel />
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
      const errorMessage = formatTxError(cause, 'The paymaster readiness step did not complete.');
      if (isPaymasterConfigurationError(errorMessage)) {
        setMessage('Paymaster sponsorship is not configured for this environment yet, so this lesson is falling back to demo mode on Sepolia.');
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [bridge.address, bridge.wallet]);

  return (
    <SimShell
      icon="⛽"
      label="Account Abstraction"
      title="Gasless Sepolia Flow"
      subtitle="Run one sponsored transfer. If the paymaster is unavailable, the rest of the lessons still work in self-paid mode."
    >
      <WalletStatusCard />

      <PrimaryBtn
        label={loading ? 'Submitting...' : 'Run sponsored transfer'}
        onPress={() => void runSponsoredFlow()}
        disabled={loading || !bridge.ready}
      />

      {message ? (
        <ResultBox correct={message.startsWith('Sponsored transaction') || message.startsWith('Sponsored account')} message={message} />
      ) : null}

      <PrimaryBtn label="Continue" onPress={onComplete} color="#f59e0b" />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function SwapSim({ onComplete, onSkip, simulatorType }: Props) {
  const bridge = useStarknetWalletBridge();
  const isBtcLesson = baseType(simulatorType) === 'starkzap-btc-swap';
  const [amount, setAmount] = useState('10');
  const [tokenOut, setTokenOut] = useState<'USDC' | 'ETH' | 'WBTC'>(isBtcLesson ? 'WBTC' : 'USDC');
  const [quote, setQuote] = useState<string | null>(null);
  const [impact, setImpact] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const outputToken =
    tokenOut === 'ETH'
      ? STARKNET_TOKENS.ETH
      : tokenOut === 'WBTC'
        ? STARKNET_TOKENS.wBTC
        : STARKNET_TOKENS.USDC;

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
        setQuote(
          tokenOut === 'USDC'
            ? MOCK.swapQuote.to
            : tokenOut === 'ETH'
              ? '≈ 0.0028 ETH'
              : '≈ 0.00012 WBTC',
        );
        setImpact(MOCK.swapQuote.impact);
      }
    } catch (cause: any) {
      setError(cause?.message ?? 'Quote retrieval failed.');
    } finally {
      setLoading(false);
    }
  }, [amount, bridge.wallet, outputToken, tokenOut]);

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
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      await ensureWalletExecutionReady(wallet);
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
      title={isBtcLesson ? 'Preview a BTC Route on Starknet' : 'Preview a StarkZap Swap'}
      subtitle={
        isBtcLesson
          ? 'Quote and submit a live swap from STRK into a Bitcoin asset route on Starknet Sepolia.'
          : 'Quote and submit a live swap from STRK into another Sepolia asset.'
      }
    >
      <WalletStatusCard />

      <Card>
        <SectionLabel text="Swap Setup" />
        <TextInput
          keyboardType="decimal-pad"
          placeholder="Amount in STRK"
          placeholderTextColor={Colors.textMuted}
          style={s.input}
          value={amount}
          onChangeText={setAmount}
        />
        <View style={s.chipRow}>
          {isBtcLesson ? (
            <Chip label="To wBTC" active />
          ) : (
            <>
              <Chip label="To USDC" active={tokenOut === 'USDC'} onPress={() => setTokenOut('USDC')} />
              <Chip label="To ETH" active={tokenOut === 'ETH'} onPress={() => setTokenOut('ETH')} />
            </>
          )}
        </View>
      </Card>

      <PrimaryBtn
        label={loading ? 'Fetching quote...' : 'Get quote'}
        onPress={() => void fetchQuote()}
        disabled={loading}
      />

      {quote ? (
        <Card>
          <SectionLabel text="Route Preview" />
          <MetricRow label="You pay" value={`${amount} STRK`} />
          <MetricRow label="You receive" value={quote} accent />
          <MetricRow label="Price impact" value={impact ?? '0.12%'} />
          <MetricRow label="Route type" value={isBtcLesson ? 'Bitcoin liquidity route' : 'Standard Starknet swap'} />
        </Card>
      ) : null}

      <PrimaryBtn
        label={loading ? 'Submitting swap...' : 'Swap'}
        onPress={() => void executeSwap()}
        disabled={loading || !quote || !bridge.ready}
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
      await ensureWalletExecutionReady(wallet);
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
      subtitle="Choose a validator, review the pool, and submit a live stake."
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
    const wallet = bridge.wallet;
    if (!wallet) {
      setMarketSummary('Connect the wallet to inspect Vesu market data.');
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const markets = await wallet.lending().getMarkets();
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
      await ensureWalletExecutionReady(wallet);
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
      subtitle={isBorrow ? 'Borrow USDC against STRK collateral.' : 'Supply STRK to the live Sepolia lending market.'}
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
  const [previewLoading, setPreviewLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
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

    setPreviewLoading(true);
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
      setPreviewLoading(false);
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

    setOrderLoading(true);
    setResult(null);
    try {
      await ensureWalletExecutionReady(wallet);
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
      const errorMessage = formatTxError(error, 'DCA order creation failed.');
      if (isAvnuDcaRouteError(errorMessage)) {
        setResult('AVNU DCA is unavailable for this route on Sepolia right now, so this lesson is falling back to a demo confirmation instead of surfacing the raw provider failure.');
      } else {
        setResult(errorMessage);
      }
    } finally {
      setOrderLoading(false);
    }
  }, [amount, bridge.wallet, frequency, total]);

  return (
    <SimShell
      icon="📆"
      label="Automation"
      title="Design a Starknet DCA Plan"
      subtitle="Set a recurring STRK sell plan and preview one cycle before submitting."
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
      </Card>

      <PrimaryBtn
        label={previewLoading ? 'Working...' : 'Preview one DCA cycle'}
        onPress={() => void previewCycle()}
        disabled={previewLoading}
      />
      {preview ? (
        <Card>
          <SectionLabel text="Per-Cycle Preview" />
          <MetricRow label="Estimated output" value={preview} accent />
          <MetricRow label="Provider" value="AVNU DCA" />
        </Card>
      ) : null}
      <PrimaryBtn
        label={orderLoading ? 'Submitting order...' : 'Create DCA order'}
        onPress={() => void createOrder()}
        disabled={orderLoading}
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
      subtitle="Use this wallet as the Starknet destination for bridge deposits."
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
          <MetricRow label="Route" value="Origin chain to Starknet Sepolia" />
        </View>
      </Card>

      <PrimaryBtn label="Continue" onPress={onComplete} />
      <GhostBtn label="Skip simulator" onPress={onSkip} />
    </SimShell>
  );
}

function BalanceSim({ onComplete, onSkip }: Props) {
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
      subtitle="Refresh the live balances used by the rest of the StarkZap lessons."
    >
      <WalletStatusCard emphasizeWallet />
      <Card>
        <SectionLabel text="Token Balances" />
        <MetricRow label="STRK" value={tokenBalances.STRK ?? 'Not loaded'} accent />
        <MetricRow label="ETH" value={tokenBalances.ETH ?? 'Not loaded'} />
        <MetricRow label="USDC" value={tokenBalances.USDC ?? 'Not loaded'} />
      </Card>
      <PrimaryBtn
        label={loading ? 'Refreshing...' : 'Refresh live balances'}
        onPress={() => void refreshBalances()}
        disabled={loading || !bridge.ready}
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
      title="How the StarkZap Lesson Integration Works"
      subtitle="This is a builder-facing explainer for the wallet and SDK path behind the live Starknet lessons."
    >
      <Card>
        <SectionLabel text="Flow" />
        <Text style={s.body}>
          Privy authenticates the user, the backend resolves the Starknet wallet, and StarkZap signs Sepolia actions with that wallet.
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Auth hook" value="useStarknetPrivyLogin" accent />
          <MetricRow label="Backend" value="POST /api/wallets/create-starknet" />
          <MetricRow label="Bridge" value="useStarkzapWallet + PrivySigner" />
          <MetricRow label="Purpose" value="Understand the lesson plumbing, not a user trade flow" />
        </View>
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
      subtitle="Confirm that the wallet, funding, and execution path are ready."
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
      subtitle="Privy handles the Starknet wallet, but confidential transfers still need Tongo keys."
    >
      <Card>
        <SectionLabel text="Requirements" />
        <Text style={s.body}>
          Tongo confidential accounts are separate from the Privy wallet. The Privy-managed Starknet account funds and submits calls, while the confidential account still needs its own Tongo private key and deployed contract address.
        </Text>
        <View style={s.metricStack}>
          <MetricRow label="Privy Starknet wallet" value="Used for funding + execution" />
          <MetricRow label="Tongo private key" value={tongoConfigured ? 'Configured' : 'Missing'} accent={tongoConfigured} />
          <MetricRow label="Tongo contract" value={tongoConfigured ? 'Configured' : 'Missing'} accent={tongoConfigured} />
          <MetricRow label="Target network" value="Starknet Sepolia support depends on your deployed Tongo contract" />
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

function EcosystemReadSim({ onComplete, onSkip, simulatorType }: Props) {
  const type = baseType(simulatorType);
  const title =
    type === 'starkzap-gaming-read'
      ? 'Gaming on Starknet Snapshot'
      : type === 'starkzap-ecosystem-map'
        ? 'Ecosystem Map Snapshot'
        : 'Ecosystem Snapshot';
  const subtitle =
    type === 'starkzap-gaming-read'
      ? 'Review how Starknet gaming fits into the wider ecosystem without forcing a DeFi action.'
      : type === 'starkzap-ecosystem-map'
        ? 'Review the major categories in the Starknet ecosystem map without running a transaction.'
        : 'Quick read-only Starknet checkpoint.';
  const focus =
    type === 'starkzap-gaming-read'
      ? 'Gaming studios, wallets, and on-chain player loops'
      : type === 'starkzap-ecosystem-map'
        ? 'Infrastructure, DeFi, identity, tooling, and consumer apps'
        : 'General ecosystem checkpoint';

  return (
    <SimShell
      icon="📡"
      label="Ecosystem Read"
      title={title}
      subtitle={subtitle}
    >
      <Card>
        <SectionLabel text="Snapshot" />
        <MetricRow label="Network" value="Starknet Sepolia / ecosystem data" accent />
        <MetricRow label="Explorer" value={STARKNET_SEPOLIA.explorer} />
        <MetricRow label="Focus" value={focus} />
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
      subtitle="Install the packages needed for the StarkZap integration."
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
      subtitle="Use Sepolia to verify the flow before any mainnet rollout."
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
    case 'starkzap-btc-swap':
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
    case 'starkzap-gaming-read':
    case 'starkzap-ecosystem-map':
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
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: 24,
  },
  smallMuted: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
    lineHeight: 20,
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
  connectOptions: {
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  emailStack: {
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
    fontSize: FontSize.sm,
    fontWeight: '700',
  },
  metricValue: {
    maxWidth: '58%',
    color: Colors.text,
    fontSize: FontSize.sm,
    fontWeight: '800',
  },
  metricValueAccent: {
    color: Colors.accent,
  },
  walletUtilityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  walletNote: {
    marginTop: Spacing.xs,
    fontSize: FontSize.sm,
    color: Colors.textSoft,
    lineHeight: 20,
  },
  walletControlRow: {
    alignItems: 'flex-start',
  },
  inlineStatus: {
    fontSize: FontSize.sm,
    color: Colors.textSoft,
    lineHeight: 20,
  },
  inlineStatusSuccess: {
    fontSize: FontSize.sm,
    color: Colors.green,
    fontWeight: '700',
    lineHeight: 20,
  },
  errorText: {
    marginTop: Spacing.sm,
    color: Colors.red,
    fontSize: FontSize.sm,
    fontWeight: '700',
    lineHeight: 20,
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
