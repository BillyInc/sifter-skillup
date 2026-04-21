/**
 * Starknet Island (Island 18) — Simulator Components
 *
 * This file combines all Starknet-specific simulator components used in the
 * Starknet World island (levels 291-310).
 *
 * Components:
 * - StarkzapSimulatorCard: Main simulator card for all starkzap-* simulator types
 * - StarknetSepoliaSupport: Balance fetching, faucet, explorer links
 * - StarknetAddressBanner: Display user Sepolia address with balance
 * - StarknetFaucetSheet: Full-screen faucet instructions
 * - StarknetTxLink: Explorer link for completed transactions
 */

export {
  STARKNET_SEPOLIA,
  useStarknetSepolia,
  StarknetAddressBanner,
  StarknetFaucetSheet,
  StarknetTxLink,
} from '../../../../components/simulators/starknetSepoliaSupport';

export { default as StarkzapSimulatorCard } from '../../../../components/simulators/StarkzapSimulatorCard';

export const STARKNET_SEPOLIA_CONFIG = {
  rpc: 'https://starknet-sepolia.public.blastapi.io',
  rpc_backup: 'https://free-rpc.nethermind.io/sepolia-juno',
  explorer: 'https://sepolia.voyager.online',
  faucet: 'https://starknet-faucet.vercel.app',
  faucet_strk: 'https://blastapi.io/faucets/starknet-sepolia-strk',
  eth_contract: '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  strk_contract: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  usdc_contract: '0x053b40a647cedfca6ca84f542a0fe36736031905a9639a7f19a3c1e66bfd5080',
  avnu_router: '0x03f89c8a56b19fd4c27e6d2f577ba82f2b2f9e9cbec47a6f2b23c76ddb1d543d',
} as const;

export const STARKZAP_SIMULATOR_TYPES = [
  'starkzap-wallet',
  'starkzap-gasless',
  'starkzap-swap',
  'starkzap-stake',
  'starkzap-lend',
  'starkzap-borrow',
  'starkzap-dca',
  'starkzap-bridge',
  'starkzap-balance',
  'starkzap-ecosystem-read',
  'starkzap-mainnet-push',
  'starkzap-package-install',
  'starkzap-build',
  'starkzap-boss',
] as const;

export type StarkzapSimulatorType = typeof STARKZAP_SIMULATOR_TYPES[number];
