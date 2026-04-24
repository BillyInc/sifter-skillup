/**
 * islandSimulators.tsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ⚡ Sifter SkillUp — Starknet Island (Island 18, Levels 291–310)
 *
 * All simulator components and config for the Starknet Islands track.
 * Re-exports the core StarkzapSimulatorCard from the central components
 * directory, and the Sepolia infrastructure from starknetSharedSimulators.
 *
 * Island 18 uses starkzap-* simulator types only. No cairo-* or sandbox-*.
 * The Sepolia testnet is the execution environment for all island simulators.
 *
 * Simulator types used by this island:
 *   starkzap-wallet, starkzap-gasless, starkzap-swap, starkzap-stake,
 *   starkzap-lend, starkzap-borrow, starkzap-dca, starkzap-bridge,
 *   starkzap-balance, starkzap-build, starkzap-boss
 *
 * Import path for other files:
 *   import { StarkzapSimulatorCard, STARKNET_SEPOLIA, ... }
 *     from '../starknetSharedSimulators';
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Re-export Sepolia infrastructure from shared ──────────────────────────────
export {
  STARKNET_SEPOLIA,
  STARKNET_SEPOLIA_CONFIG,
  STARKZAP_SIMULATOR_TYPES,
  useStarknetSepolia,
  StarknetAddressBanner,
  StarknetFaucetSheet,
  StarknetTxLink,
} from '../starknetSharedSimulators';

// ── Re-export StarkzapSimulatorCard from central components ───────────────────
// This is the primary simulator card used by all island levels.
// It handles: starkzap-wallet, gasless, swap, stake, lend, borrow,
//             dca, bridge, balance, build, boss
export { default as StarkzapSimulatorCard }
  from '../../../../components/simulators/StarkzapSimulatorCard';

// ── Island-level type export ──────────────────────────────────────────────────
export type { StarkzapSimulatorType } from '../starknetSharedSimulators';
