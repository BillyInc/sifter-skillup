/**
 * Sifter LevelUp — Island Levels Aggregator
 * NEW FILE: src/data/islandLevels.ts
 *
 * Imports all island-specific level files and exports a single
 * ISLAND_LEVELS record that maps levelId → level data.
 *
 * Usage in levels.ts or wherever getLevel() is defined:
 *   import { ISLAND_LEVELS } from './islandLevels';
 *   export function getLevel(id: number) {
 *     return LEVELS[id] ?? ISLAND_LEVELS[id] ?? STARKNET_LEVELS[id];
 *   }
 *
 * Place all level files from the island content package in src/data/levels/
 */

// ── Island 9 — Memecoin Markets (L91–L105) ───────────────────
export { MEMECOIN_LEVELS_A } from './levels/memecoiLevels-part-a';
export { MEMECOIN_LEVELS   } from './levels/memecoiLevels-part-b';

// ── Island 10 — Airdrop Archipelago (L106–L120) ──────────────
export { AIRDROP_LEVELS_A } from './levels/airdropLevels-part-a';
export { AIRDROP_LEVELS   } from './levels/airdropLevels-part-b';

// ── Island 11 — Base Ecosystem (L151–L165) ───────────────────
export { BASE_LEVELS_A } from './levels/baseLevels-part-a';
export { BASE_LEVELS   } from './levels/baseLevels-part-b';

// ── Island 12 — TON & Telegram (L166–L180) ───────────────────
export { TON_LEVELS_A } from './levels/tonLevels-part-a';
export { TON_LEVELS   } from './levels/tonLevels-part-b';

// ── Island 13 — Coinbase Deep Dive (L181–L195) ───────────────
export { COINBASE_LEVELS_A } from './levels/coinbaseLevels-part-a';
export { COINBASE_LEVELS   } from './levels/coinbaseLevels-part-b';

// ── Island 14 — Final Frontier (L196–L210) ───────────────────
export { ISLAND_FINALFRONTIER_LEVELS_A } from './levels/island16FinalFrontierLevels-part-a';
export { ISLAND_FINALFRONTIER_LEVELS_B } from './levels/island16FinalFrontierLevels-part-b';

// ── Island 15 — Alt-Chain Ecosystems (L211–L230) ─────────────
export { ALT_CHAIN_LEVELS_A } from './levels/island14AltChainLevels-part-a';
export { ALT_CHAIN_LEVELS   } from './levels/island14AltChainLevels-part-b';

// ── Island 16 — Security & Research (L231–L240) ──────────────
export { ISLAND_SECURITY_LEVELS_A } from './levels/island17SecurityLevels-part-a';
export { ISLAND_SECURITY_LEVELS   } from './levels/island17SecurityLevels-part-b';

// ── Island 17 — Advanced Crypto (L121–L135) ──────────────────
export { ISLAND_ADVANCED_CRYPTO_LEVELS_A } from './levels/island18AdvancedCryptoLevels-part-a';
export { ISLAND_ADVANCED_CRYPTO_LEVELS   } from './levels/island18AdvancedCryptoLevels-part-b';

// ─── Aggregated map ───────────────────────────────────────────

import { MEMECOIN_LEVELS_A }             from './levels/memecoiLevels-part-a';
import { MEMECOIN_LEVELS }               from './levels/memecoiLevels-part-b';
import { AIRDROP_LEVELS_A }              from './levels/airdropLevels-part-a';
import { AIRDROP_LEVELS }                from './levels/airdropLevels-part-b';
import { BASE_LEVELS_A }                 from './levels/baseLevels-part-a';
import { BASE_LEVELS }                   from './levels/baseLevels-part-b';
import { TON_LEVELS_A }                  from './levels/tonLevels-part-a';
import { TON_LEVELS }                    from './levels/tonLevels-part-b';
import { COINBASE_LEVELS_A }             from './levels/coinbaseLevels-part-a';
import { COINBASE_LEVELS }               from './levels/coinbaseLevels-part-b';
import { ISLAND_FINALFRONTIER_LEVELS_A } from './levels/island16FinalFrontierLevels-part-a';
import { ISLAND_FINALFRONTIER_LEVELS_B } from './levels/island16FinalFrontierLevels-part-b';
import { ALT_CHAIN_LEVELS_A }            from './levels/island14AltChainLevels-part-a';
import { ALT_CHAIN_LEVELS }              from './levels/island14AltChainLevels-part-b';
import { ISLAND_SECURITY_LEVELS_A }      from './levels/island17SecurityLevels-part-a';
import { ISLAND_SECURITY_LEVELS }        from './levels/island17SecurityLevels-part-b';
import { ISLAND_ADVANCED_CRYPTO_LEVELS_A } from './levels/island18AdvancedCryptoLevels-part-a';
import { ISLAND_ADVANCED_CRYPTO_LEVELS }   from './levels/island18AdvancedCryptoLevels-part-b';

export const ISLAND_LEVELS = {
  ...MEMECOIN_LEVELS_A,
  ...MEMECOIN_LEVELS,
  ...AIRDROP_LEVELS_A,
  ...AIRDROP_LEVELS,
  ...BASE_LEVELS_A,
  ...BASE_LEVELS,
  ...TON_LEVELS_A,
  ...TON_LEVELS,
  ...COINBASE_LEVELS_A,
  ...COINBASE_LEVELS,
  ...ISLAND_FINALFRONTIER_LEVELS_A,
  ...ISLAND_FINALFRONTIER_LEVELS_B,
  ...ALT_CHAIN_LEVELS_A,
  ...ALT_CHAIN_LEVELS,
  ...ISLAND_SECURITY_LEVELS_A,
  ...ISLAND_SECURITY_LEVELS,
  ...ISLAND_ADVANCED_CRYPTO_LEVELS_A,
  ...ISLAND_ADVANCED_CRYPTO_LEVELS,
};
