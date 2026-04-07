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
export type StarkzapNetwork = 'mainnet' | 'sepolia';

export interface StarkzapWallet {
  address: string;
  getChainId: () => string;
  balanceOf: (token: StarkzapToken) => Promise<StarkzapAmount>;
  transfer: (token: StarkzapToken, transfers: Array<{ to: string; amount: StarkzapAmount }>) => Promise<StarkzapTx>;
  swap: (req: SwapRequest) => Promise<StarkzapTx>;
  stake: (pool: string, amount: StarkzapAmount) => Promise<StarkzapTx>;
  getStakerPools?: (stakerAddress: string) => Promise<StarkzapPool[]>;
  getPoolPosition?: (pool: string) => Promise<StarkzapPoolPosition | null>;
  claimPoolRewards?: (pool: string) => Promise<StarkzapTx>;
  lending: () => StarkzapLending;
  dca: () => StarkzapDca;
  getQuote: (req: SwapRequest) => Promise<SwapQuote>;
}

export interface StarkzapToken { symbol: string; address: string; decimals: number; }
export interface StarkzapAmount { toUnit: () => string; toFormatted: () => string; isZero: () => boolean; }
export interface StarkzapTx { hash: string; explorerUrl: string; wait: () => Promise<void>; }
export interface StarkzapPool { token: StarkzapToken; amount: StarkzapAmount; poolContract: string; }
export interface StarkzapPoolPosition {
  staked: StarkzapAmount; rewards: StarkzapAmount; total: StarkzapAmount;
  commissionPercent: number; unpoolTime: Date | null; unpooling: StarkzapAmount;
}
export interface StarkzapLending {
  getMarkets: () => Promise<any[]>;
  deposit: (req: any) => Promise<StarkzapTx>;
  borrow: (req: any) => Promise<StarkzapTx>;
  getPosition: (req: any) => Promise<any>;
}
export interface StarkzapDca {
  create: (req: any) => Promise<StarkzapTx>;
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

function tryLoadSdk() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { StarkZap } = require('starkzap-native');
    _sdk = new StarkZap({ network: 'sepolia' });
    _sdkMainnet = new StarkZap({ network: 'mainnet' });
    _isAvailable = true;
  } catch {
    // starkzap-native not yet installed — run in mock/demo mode
    _isAvailable = false;
  }
}

tryLoadSdk();

export const starkzapSdk = _sdk;
export const starkzapMainnet = _sdkMainnet;
export const isStarkzapAvailable = () => _isAvailable;

// ── Token presets (mirrors mainnetTokens / sepoliaTokens from the SDK) ──────
export const STARKNET_TOKENS = {
  STRK: { symbol: 'STRK', address: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d', decimals: 18 },
  USDC: { symbol: 'USDC', address: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8', decimals: 6 },
  ETH:  { symbol: 'ETH',  address: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7', decimals: 18 },
  wBTC: { symbol: 'wBTC', address: '0x03fe2b97c1fd336e750087d68b9b867997fd64a2661ff3ca5a7c771641e8e7ac', decimals: 8 },
} as const;

// ── Amount helpers ───────────────────────────────────────────────────────────
// Thin wrappers that work in both real-SDK mode and mock mode

export function formatAmount(raw: bigint, decimals: number, symbol: string): string {
  const divisor = BigInt(10 ** decimals);
  const whole = raw / divisor;
  const frac = raw % divisor;
  const fracStr = frac.toString().padStart(decimals, '0').slice(0, 4).replace(/0+$/, '');
  return fracStr ? `${whole}.${fracStr} ${symbol}` : `${whole} ${symbol}`;
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
