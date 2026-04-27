import type { Level } from '../../levels';

function makeBossLevel(id: number, topic: string, tier: 'pro' = 'pro'): Level {
  return {
    id,
    mechanic: 'simulator',
    tier,
    topic,
    fact: `Boss challenge for ${topic}. Demonstrate mastery before advancing.`,
    plain: `Complete the Phase 1 boss challenge for ${topic}.`,
    stars: [1, 2, 3],
    target: 1,
    coins: 200,
    isBoss: true,
    simulatorLesson: 'phase1-boss',
  };
}

export const STARKNET_TRACK_BOSS_LEVELS: Record<number, Level> = {
  3001: makeBossLevel(3001, 'DeFi Mental Models Boss'),
  3002: makeBossLevel(3002, 'Token Swaps and AMMs Boss'),
  3003: makeBossLevel(3003, 'Staking and Liquid Staking Boss'),
  3004: makeBossLevel(3004, 'Lending and Borrowing Boss'),
  3005: makeBossLevel(3005, 'DCA and Automation Boss'),
  3006: makeBossLevel(3006, 'Portfolio Strategy Boss'),
  3007: makeBossLevel(3007, 'Risk Management Boss'),
  3008: makeBossLevel(3008, 'Bridging and Cross-Chain Boss'),
  3009: makeBossLevel(3009, 'Advanced DeFi Primitives Boss'),
  3010: makeBossLevel(3010, 'Institutional DeFi Operations Boss'),
  3011: makeBossLevel(3011, 'Strategy Research and Competitive Analysis Boss'),
  4001: makeBossLevel(4001, 'Starknet Ecosystem Overview Boss'),
  4002: makeBossLevel(4002, 'Stark Technology and ZK Proofs Boss'),
  4003: makeBossLevel(4003, 'Tokenomics and Governance Boss'),
  4004: makeBossLevel(4004, 'Developer Ecosystem Boss'),
  4005: makeBossLevel(4005, 'ZK Vision and Roadmap Boss'),
  4006: makeBossLevel(4006, 'Research Methodology Boss'),
  4007: makeBossLevel(4007, 'On-Chain Analytics Boss'),
  4008: makeBossLevel(4008, 'Protocol Comparison Boss'),
  4009: {
    ...makeBossLevel(4009, 'Ecosystem Mastery Final Boss - Interview Simulation'),
    simulatorLesson: 'branching-interview',
  },
  5001: makeBossLevel(5001, 'Cairo Basics and ERC-20 Boss'),
  5002: makeBossLevel(5002, 'Storage and Events Boss'),
  5003: makeBossLevel(5003, 'Testing with snforge Boss'),
  5004: makeBossLevel(5004, 'Access Control and Security Boss'),
  5005: makeBossLevel(5005, 'Advanced Types Boss'),
  5006: makeBossLevel(5006, 'DeFi Contract Patterns Boss'),
  5007: makeBossLevel(5007, 'Starkzap Integration Boss'),
  5008: makeBossLevel(5008, 'Upgradability and Proxies Boss'),
  5009: makeBossLevel(5009, 'Cross-Contract Calls Boss'),
  5010: makeBossLevel(5010, 'Gas Optimisation Boss'),
  5011: makeBossLevel(5011, 'Auditing and Formal Verification Boss'),
  5012: makeBossLevel(5012, 'Production Deployment Boss'),
  5013: makeBossLevel(5013, 'Cairo Builder Final Boss'),
};

export function getStarknetTrackBossLevel(levelId: number): Level | undefined {
  return STARKNET_TRACK_BOSS_LEVELS[levelId];
}
