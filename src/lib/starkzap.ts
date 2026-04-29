/**
 * Starkzap SDK singleton for Sifter Skill_Up
 * Provides a shared SDK instance and wallet helpers used by
 * StarkzapSimulatorCard and StarknetTrackScreen.
 *
 * Uses Sepolia testnet for lesson simulations and mainnet for
 * the live track once the user has gone through onboarding.
 */

// NOTE: Install with: npm install starkzap-native
// Until installed, types are declared locally so the rest of the codebase
// compiles without errors.

// ── Type stubs (remove once starkzap-native is installed) ──────────────────
import { Platform } from 'react-native';

export type StarkzapNetwork = 'mainnet' | 'sepolia';

export interface StarkzapWallet {
  address: string;
  getChainId: () => string;
  ensureReady?: (options?: any) => Promise<void>;
  isDeployed?: () => Promise<boolean>;
  balanceOf: (token: StarkzapToken) => Promise<StarkzapAmount>;
  transfer: (token: StarkzapToken, transfers: Array<{ to: string; amount: StarkzapAmount }>, options?: any) => Promise<StarkzapTx>;
  swap: (req: SwapRequest, options?: any) => Promise<StarkzapTx>;
  stake: (pool: string, amount: StarkzapAmount, options?: any) => Promise<StarkzapTx>;
  getStakerPools?: (stakerAddress: string) => Promise<StarkzapPool[]>;
  getPoolPosition?: (pool: string) => Promise<StarkzapPoolPosition | null>;
  claimPoolRewards?: (pool: string, options?: any) => Promise<StarkzapTx>;
  lending: () => StarkzapLending;
  dca: () => StarkzapDca;
  getQuote: (req: SwapRequest) => Promise<SwapQuote>;
}

export interface StarkzapToken { symbol: string; address: string; decimals: number; }
export interface StarkzapAmount { toBase?: () => bigint; toUnit: () => string; toFormatted: () => string; isZero: () => boolean; }
export interface StarkzapTx { hash: string; explorerUrl: string; wait: () => Promise<void>; }
export interface StarkzapPool { token: StarkzapToken; amount: StarkzapAmount; poolContract: string; }
export interface StarkzapPoolPosition {
  staked: StarkzapAmount; rewards: StarkzapAmount; total: StarkzapAmount;
  commissionPercent: number; unpoolTime: Date | null; unpooling: StarkzapAmount;
}
export interface StarkzapLending {
  getMarkets: () => Promise<any[]>;
  deposit: (req: any, options?: any) => Promise<StarkzapTx>;
  borrow: (req: any, options?: any) => Promise<StarkzapTx>;
  getPosition: (req: any) => Promise<any>;
}
export interface StarkzapDca {
  create: (req: any, options?: any) => Promise<StarkzapTx>;
  previewCycle: (req: any) => Promise<{ amountOutBase: bigint }>;
  getOrders: (req?: any) => Promise<{ content: any[] }>;
}
export interface SwapRequest {
  tokenIn: StarkzapToken; tokenOut: StarkzapToken; amountIn: StarkzapAmount;
  slippageBps?: bigint; provider?: string;
}
export interface SwapQuote {
  amountInBase: bigint; amountOutBase: bigint; priceImpactBps?: bigint; provider?: string;
}

// ── SDK factory ─────────────────────────────────────────────────────────────
// When starkzap-native is installed, swap this for:
//   import { StarkZap } from 'starkzap-native';
//   export const starkzapSdk = new StarkZap({ network: 'sepolia' });
//   export const starkzapMainnet = new StarkZap({ network: 'mainnet' });

let _sdk: any = null;
let _sdkMainnet: any = null;
let _isAvailable = false;
let _pkgExports: any = null;

function tryLoadSdk() {
  try {
    // Web needs the browser build; native platforms use the RN package.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pkg = Platform.OS === 'web' ? 'starkzap' : 'starkzap-native';
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    _pkgExports = require(pkg);
    const { StarkZap } = _pkgExports;
    _sdk = new StarkZap({ network: 'sepolia' });
    _sdkMainnet = new StarkZap({ network: 'mainnet' });
    _isAvailable = true;
  } catch {
    // starkzap-native not yet installed — run in mock/demo mode
    _isAvailable = false;
    _pkgExports = null;
  }
}

tryLoadSdk();

export const starkzapSdk = _sdk;
export const starkzapMainnet = _sdkMainnet;
export const isStarkzapAvailable = () => _isAvailable;
export const STARKNET_NETWORK = 'sepolia' as const;
export const SPONSORED_FEE_MODE = { type: 'paymaster' } as const;

// ── Token presets (mirrors mainnetTokens / sepoliaTokens from the SDK) ──────
const fallbackSepoliaTokens = {
  STRK: { symbol: 'STRK', address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', decimals: 18 },
  USDC: { symbol: 'USDC', address: '0x0512feac6339ff7889822cb5aa2a86c848e9d392bb0e3e237c008674feed8343', decimals: 6 },
  ETH:  { symbol: 'ETH',  address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', decimals: 18 },
  wBTC: { symbol: 'wBTC', address: '0x020d208b9e57a7f92bfa9f61135446e0961afc340378be97dbd317453c0950ae', decimals: 8 },
} as const;

const sdkSepoliaTokens = _pkgExports?.sepoliaTokens ?? null;

export const STARKNET_TOKENS = {
  STRK: sdkSepoliaTokens?.STRK ?? fallbackSepoliaTokens.STRK,
  USDC: sdkSepoliaTokens?.USDC ?? fallbackSepoliaTokens.USDC,
  ETH:  sdkSepoliaTokens?.ETH ?? fallbackSepoliaTokens.ETH,
  wBTC: sdkSepoliaTokens?.WBTC ?? sdkSepoliaTokens?.wBTC ?? fallbackSepoliaTokens.wBTC,
} as const;

export const STARKNET_SEPOLIA_VALIDATORS: Record<string, { name: string; stakerAddress: string }> = 
  _pkgExports?.sepoliaValidators ?? {};

// ── Amount helpers ───────────────────────────────────────────────────────────
// Thin wrappers that work in both real-SDK mode and mock mode

export function formatAmount(raw: bigint, decimals: number, symbol: string): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr} ${symbol}` : `${whole} ${symbol}`;
}

export function createStarkzapAmount(amount: string | number, token: StarkzapToken): StarkzapAmount & { toBase: () => bigint } {
  if (_pkgExports?.Amount?.parse) {
    return _pkgExports.Amount.parse(amount, token as any);
  }

  const amountString = String(amount);
  const [wholePart, fractionPart = ''] = amountString.split('.');
  const paddedFraction = fractionPart.padEnd(token.decimals, '0').slice(0, token.decimals);
  const normalizedBase = BigInt(`${wholePart}${paddedFraction || ''.padEnd(token.decimals, '0')}`);

  return createStarkzapAmountFromBase(normalizedBase, token);
}

export function createStarkzapAmountFromBase(amount: string | bigint, token: StarkzapToken): StarkzapAmount & { toBase: () => bigint } {
  const baseValue = typeof amount === 'bigint' ? amount : BigInt(amount);

  if (_pkgExports?.Amount?.fromRaw) {
    return _pkgExports.Amount.fromRaw(baseValue, token as any);
  }

  return {
    toBase: () => baseValue,
    toUnit: () => {
      const divisor = BigInt(10) ** BigInt(token.decimals);
      const whole = baseValue / divisor;
      const fraction = (baseValue % divisor).toString().padStart(token.decimals, '0').replace(/0+$/, '');
      return fraction ? `${whole}.${fraction}` : whole.toString();
    },
    toFormatted: () => formatAmount(baseValue, token.decimals, token.symbol),
    isZero: () => baseValue === 0n,
  };
}

// ── Mock data for demo / no-SDK mode ────────────────────────────────────────
export const MOCK = {
  walletAddress: '0x049d...c7a2',
  strkBalance: '124.50 STRK',
  usdcBalance: '500.00 USDC',
  poolApy: '8.3%',
  stakedAmount: '100.00 STRK',
  rewardsEarned: '2.47 STRK',
  swapQuote: { from: '100 STRK', to: '≈ 12.40 USDC', impact: '0.12%' },
  txHash: '0x03f2...b19a',
  explorerUrl: 'https://sepolia.voyager.online/tx/0x03f2b19a',
};
