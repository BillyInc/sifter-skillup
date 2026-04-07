// ⚡ StarkzapSimulatorCard v4 — switch statement additions only
// Drop these cases into the switch in StarkzapSimulatorCard_v3.tsx

// Add these imports at the top of StarkzapSimulatorCard_v3.tsx:
//
// import {
//   PoolDepthSim, ProtocolReaderSim,
//   AmmPoolSim, RangeSelectorSim,
//   ValidatorPickerSim, StakeExitSim,
// } from './navigatorLabs1to3_simulators';
//
// import {
//   UtilisationCurveSim, HealthFactorSim, BorrowSim,
//   DcaCalcSim, YieldDcaSim,
//   JuniorAllocatorSim, RiskScorecardSim, LoopBuilderSim,
// } from './navigatorLabs4to6_simulators';

// ── New cases to add to the switch statement ────────────────────────
// Lab 1
// case 'starkzap-pool-depth':       return <PoolDepthSim       {...p} />;
// case 'starkzap-protocol-reader':  return <ProtocolReaderSim  {...p} />;
// (starkzap-wallet already exists for Lab1 L8)

// Lab 2
// case 'starkzap-amm-pool':         return <AmmPoolSim         {...p} />;
// case 'starkzap-range-selector':   return <RangeSelectorSim   {...p} />;
// (starkzap-swap, starkzap-dca already exist for Lab2 L3/L4/L5)

// Lab 3
// case 'starkzap-validator-picker': return <ValidatorPickerSim {...p} />;
// (starkzap-stake already exists for Lab3 L3)
// case 'starkzap-stake-exit':       return <StakeExitSim       {...p} />;

// Lab 4
// case 'starkzap-utilisation-curve':return <UtilisationCurveSim {...p} />;
// (starkzap-lend already exists for Lab4 L2)
// case 'starkzap-health-factor':    return <HealthFactorSim    {...p} />;
// case 'starkzap-borrow':           return <BorrowSim          {...p} />;

// Lab 5
// case 'starkzap-dca-calc':         return <DcaCalcSim         {...p} />;
// (starkzap-dca already exists for Lab5 L2)
// case 'starkzap-yield-dca':        return <YieldDcaSim        {...p} />;

// Lab 6
// case 'starkzap-junior-allocator': return <JuniorAllocatorSim {...p} />;
// case 'starkzap-risk-scorecard':   return <RiskScorecardSim   {...p} />;
// case 'starkzap-loop-builder':     return <LoopBuilderSim     {...p} />;

export const LABS_1_TO_6_SIMULATOR_MAP = {
  // Lab 1
  'starkzap-pool-depth':        { lesson: 'prices-markets-liquidity',  lab: 1 },
  'starkzap-protocol-reader':   { lesson: 'reading-defi-data',          lab: 1 },
  'starkzap-wallet':            { lesson: 'first-defi-transaction',     lab: 1 }, // existing
  // Lab 2
  'starkzap-amm-pool':          { lesson: 'how-amms-work',              lab: 2 },
  'starkzap-range-selector':    { lesson: 'concentrated-liquidity-ekubo', lab: 2 },
  'starkzap-swap':              { lesson: 'avnu-aggregation',           lab: 2 }, // existing
  'starkzap-dca':               { lesson: 'advanced-swap-strategies',   lab: 2 }, // existing
  // Lab 3
  'starkzap-validator-picker':  { lesson: 'validator-selection',        lab: 3 },
  'starkzap-stake':             { lesson: 'staking-position-management', lab: 3 }, // existing
  'starkzap-stake-exit':        { lesson: 'exiting-staking-positions',  lab: 3 },
  // Lab 4
  'starkzap-utilisation-curve': { lesson: 'how-lending-protocols-work', lab: 4 },
  'starkzap-lend':              { lesson: 'supplying-assets-earning-yield', lab: 4 }, // existing
  'starkzap-health-factor':     { lesson: 'collateral-health-factor',   lab: 4 },
  'starkzap-borrow':            { lesson: 'borrowing-strategies',       lab: 4 },
  // Lab 5
  'starkzap-dca-calc':          { lesson: 'mathematics-of-dca',         lab: 5 },
  'starkzap-yield-dca':         { lesson: 'combining-dca-strategies',   lab: 5 },
  // Lab 6
  'starkzap-junior-allocator':  { lesson: 'asset-allocation-frameworks', lab: 6 },
  'starkzap-risk-scorecard':    { lesson: 'protocol-risk-assessment',   lab: 6 },
  'starkzap-loop-builder':      { lesson: 'cross-protocol-strategies',  lab: 6 },
};
