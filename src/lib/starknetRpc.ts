const EXPLICIT_STARKNET_SEPOLIA_RPC_URL =
  process.env.EXPO_PUBLIC_STARKNET_SEPOLIA_RPC_URL?.trim()
  || process.env.EXPO_PUBLIC_STARKNET_RPC_URL?.trim()
  || '';

const ALCHEMY_KEY = process.env.EXPO_PUBLIC_ALCHEMY_KEY?.trim() || '';
const DEFAULT_STARKNET_SEPOLIA_RPC_URL = 'https://api.cartridge.gg/x/starknet/sepolia';

export const STARKNET_SEPOLIA_RPC_URL =
  EXPLICIT_STARKNET_SEPOLIA_RPC_URL
  || (ALCHEMY_KEY ? 'https://starknet-sepolia.g.alchemy.com/starknet/version/rpc/v0_7' : DEFAULT_STARKNET_SEPOLIA_RPC_URL);

export function isStarknetSepoliaRpcConfigured() {
  return STARKNET_SEPOLIA_RPC_URL.length > 0;
}

export function getStarknetSepoliaRpcConfigError() {
  return 'Live Starknet Sepolia RPC is unreachable in this runtime. Check network access or override it with EXPO_PUBLIC_STARKNET_SEPOLIA_RPC_URL or EXPO_PUBLIC_ALCHEMY_KEY.';
}

export function getStarknetSepoliaRpcHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (!EXPLICIT_STARKNET_SEPOLIA_RPC_URL && ALCHEMY_KEY) {
    headers.Authorization = `Bearer ${ALCHEMY_KEY}`;
  }

  return headers;
}

export async function starknetSepoliaRpcCall(method: string, params: any[] = []) {
  if (!isStarknetSepoliaRpcConfigured()) {
    throw new Error(getStarknetSepoliaRpcConfigError());
  }

  const res = await fetch(STARKNET_SEPOLIA_RPC_URL, {
    method: 'POST',
    headers: getStarknetSepoliaRpcHeaders(),
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const rpcMessage = data?.error?.message ? ` ${data.error.message}` : '';
    throw new Error(`Sepolia RPC returned HTTP ${res.status}.${rpcMessage}`.trim());
  }

  if (data?.error?.message) {
    throw new Error(data.error.message);
  }

  return data?.result;
}
