/**
 * Compatibility re-export for older Starknet simulator imports.
 * The canonical implementation lives in the Starknet track data layer.
 */

export {
  STARKNET_SEPOLIA,
  STARKNET_SEPOLIA_CONFIG,
  STARKZAP_SIMULATOR_TYPES,
  LABS_1_TO_6_SIMULATOR_MAP,
  useStarknetSepolia,
  StarknetAddressBanner,
  StarknetFaucetSheet,
  StarknetTxLink,
} from '../../data/tracks/starknet_ecosystem/starknetSharedSimulators';

export type {
  SepoliaBalance,
  SepoliaState,
} from '../../data/tracks/starknet_ecosystem/starknetSharedSimulators';
