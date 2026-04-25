import { API_BASE } from '../lib/config';

export interface EnsuredStarknetWallet {
  address: string;
  walletId?: string | null;
  created: boolean;
}

export async function ensureStarknetWallet(
  privyAccessToken: string,
): Promise<EnsuredStarknetWallet | null> {
  try {
    const response = await fetch(`${API_BASE}/api/wallets/create-starknet`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${privyAccessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      throw new Error(`Wallet ensure failed (${response.status}): ${text.slice(0, 200)}`);
    }

    const payload = await response.json();
    const data = payload?.data ?? payload;
    if (!data?.address) {
      throw new Error('Wallet ensure response did not include an address');
    }

    return {
      address: data.address,
      walletId: data.wallet_id ?? null,
      created: Boolean(data.created),
    };
  } catch (error) {
    console.error('[StarknetWallet] ensure failed:', error);
    return null;
  }
}
