/**
 * Starknet Sepolia Faucet Integration
 *
 * Provides testnet STRK and ETH to users so they can execute
 * real transactions in the Starknet Island lessons.
 *
 * Primary source: Starknet Sepolia faucet (faucet.starknet.io)
 * Fallback: Alchemy faucet (alchemy.com/faucets/starknet-sepolia)
 *
 * The faucet is called from inside the app — no external site redirect.
 * One claim per wallet per 24 hours.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

export type FaucetToken = 'STRK' | 'ETH';

export interface FaucetResult {
  success: boolean;
  txHash?: string;
  amount?: string;
  token?: FaucetToken;
  error?: string;
  cooldownEnds?: Date;   // when user can claim again
}

export interface FaucetStatus {
  canClaim: boolean;
  lastClaimed?: Date;
  cooldownEnds?: Date;
  hoursRemaining?: number;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const FAUCET_COOLDOWN_HOURS = 24;
const STRK_FAUCET_AMOUNT   = '10';   // 10 testnet STRK per claim
const ETH_FAUCET_AMOUNT    = '0.001'; // 0.001 testnet ETH per claim

// Starknet Foundation public Sepolia faucet endpoint
const STARKNET_FAUCET_URL = 'https://faucet.starknet.io/api/claim';

// ── Local claim tracking (AsyncStorage key) ───────────────────────────────────
// We track claims locally so we don't need a backend for rate limiting.
// The faucet itself rate-limits on the server — this just improves UX.

const CLAIM_KEY = (address: string) => `starknet_faucet_claim_${address}`;

async function getLastClaim(address: string): Promise<Date | null> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    const stored = await AsyncStorage.getItem(CLAIM_KEY(address));
    return stored ? new Date(stored) : null;
  } catch { return null; }
}

async function saveLastClaim(address: string): Promise<void> {
  try {
    const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
    await AsyncStorage.setItem(CLAIM_KEY(address), new Date().toISOString());
  } catch {}
}

// ── Faucet status ─────────────────────────────────────────────────────────────

export async function getFaucetStatus(walletAddress: string): Promise<FaucetStatus> {
  const lastClaimed = await getLastClaim(walletAddress);
  if (!lastClaimed) return { canClaim: true };

  const cooldownEnds = new Date(lastClaimed.getTime() + FAUCET_COOLDOWN_HOURS * 60 * 60 * 1000);
  const now = new Date();

  if (now >= cooldownEnds) return { canClaim: true, lastClaimed };

  const msRemaining = cooldownEnds.getTime() - now.getTime();
  const hoursRemaining = Math.ceil(msRemaining / (60 * 60 * 1000));

  return { canClaim: false, lastClaimed, cooldownEnds, hoursRemaining };
}

// ── Main claim function ───────────────────────────────────────────────────────

export async function claimFaucet(
  walletAddress: string,
  token: FaucetToken = 'STRK'
): Promise<FaucetResult> {

  // Check local cooldown first
  const status = await getFaucetStatus(walletAddress);
  if (!status.canClaim) {
    return {
      success: false,
      error: `You can claim again in ${status.hoursRemaining} hour${status.hoursRemaining === 1 ? '' : 's'}.`,
      cooldownEnds: status.cooldownEnds,
    };
  }

  // ── Demo mode (no real faucet call, just simulate) ─────────────────────────
  if (process.env.EXPO_PUBLIC_DEMO_MODE === 'true') {
    await new Promise(r => setTimeout(r, 2000));
    await saveLastClaim(walletAddress);
    return {
      success: true,
      txHash: '0x' + Math.random().toString(16).slice(2, 66).padStart(64, '0'),
      amount: token === 'STRK' ? STRK_FAUCET_AMOUNT : ETH_FAUCET_AMOUNT,
      token,
    };
  }

  // ── Real faucet call ───────────────────────────────────────────────────────
  try {
    const response = await fetch(STARKNET_FAUCET_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        address: walletAddress,
        token: token.toLowerCase(),  // 'strk' or 'eth'
      }),
    });

    if (!response.ok) {
      // Faucet may return 429 (rate limited) or 400 (invalid address)
      const errorBody = await response.json().catch(() => ({}));
      if (response.status === 429) {
        return {
          success: false,
          error: 'Faucet rate limit reached. Try again in 24 hours.',
        };
      }
      return {
        success: false,
        error: errorBody?.message ?? `Faucet error (${response.status})`,
      };
    }

    const data = await response.json();
    await saveLastClaim(walletAddress);

    return {
      success: true,
      txHash: data.tx_hash ?? data.txHash ?? data.transaction_hash,
      amount: token === 'STRK' ? STRK_FAUCET_AMOUNT : ETH_FAUCET_AMOUNT,
      token,
    };

  } catch (err: any) {
    // Network error — try Alchemy as fallback
    return await claimAlchemyFaucet(walletAddress, token);
  }
}

// ── Alchemy fallback faucet ───────────────────────────────────────────────────

async function claimAlchemyFaucet(
  walletAddress: string,
  token: FaucetToken
): Promise<FaucetResult> {
  try {
    const ALCHEMY_KEY = process.env.EXPO_PUBLIC_ALCHEMY_KEY ?? '';
    const response = await fetch(
      `https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ALCHEMY_KEY}`,
        },
        body: JSON.stringify({
          id: 1,
          jsonrpc: '2.0',
          method: 'alchemy_requestFaucetFunds',
          params: [{ address: walletAddress, tokenType: token }],
        }),
      }
    );

    if (!response.ok) throw new Error('Alchemy faucet failed');
    const data = await response.json();

    if (data.result) {
      await saveLastClaim(walletAddress);
      return {
        success: true,
        txHash: data.result,
        amount: token === 'STRK' ? STRK_FAUCET_AMOUNT : ETH_FAUCET_AMOUNT,
        token,
      };
    }
    throw new Error(data.error?.message ?? 'Unknown error');

  } catch {
    return {
      success: false,
      error: 'Both faucets are unavailable. Visit faucet.starknet.io directly.',
    };
  }
}

// ── Voyager link helper ───────────────────────────────────────────────────────

export function voyagerTxUrl(txHash: string): string {
  return `https://sepolia.voyager.online/tx/${txHash}`;
}
