/**
 * Starknet DeFi Navigator — All Simulators
 * Consolidated export file with proper lab groupings
 *
 * Lab assignments:
 * - Lab 1: PoolDepthSim, ProtocolReaderSim
 * - Lab 2: AmmPoolSim, RangeSelectorSim
 * - Lab 3: ValidatorPickerSim, StakeExitSim
 * - Lab 4: UtilisationCurveSim, HealthFactorSim, BorrowSim
 * - Lab 5: DcaCalcSim, YieldDcaSim
 * - Lab 6: JuniorAllocatorSim, RiskScorecardSim, LoopBuilderSim
 * - Lab 7: ILCalculatorSim, RangeBuilderSim
 * - Lab 8: Bridge simulators (lab8/navigatorLab8_simulators.tsx)
 * - Lab 9: Advanced DeFi simulators (lab9/navigatorLab9_simulators.tsx)
 * - Lab 10-11: Institutional + research simulators
 */

export {
  PoolDepthSim,
  ProtocolReaderSim,
  AmmPoolSim,
  RangeSelectorSim,
  ValidatorPickerSim,
  StakeExitSim,
} from './lab1/navigatorLab1_simulators';

export {
  UtilisationCurveSim,
  HealthFactorSim,
  BorrowSim,
  DcaCalcSim,
  YieldDcaSim,
  JuniorAllocatorSim,
  RiskScorecardSim,
  LoopBuilderSim,
} from './lab4/navigatorLab4_simulators';

export { ILCalculatorSim, RangeBuilderSim } from './lab7/navigatorLab7_simulators';
export * from './lab8/navigatorLab8_simulators';
export * from './lab9/navigatorLab9_simulators';
export * from './lab10/navigatorLab10_simulators';
export * from './lab11/navigatorLab11_simulators';
