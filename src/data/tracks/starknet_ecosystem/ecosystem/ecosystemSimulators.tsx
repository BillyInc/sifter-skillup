// ⚡ Sifter SkillUp — Starknet Ecosystem Deep Dive
// Ecosystem Simulators - Consolidated from simulators folder

export const ECOSYSTEM_SIMULATORS = {
  'starkzap-ecosystem-read': {
    description: 'Live on-chain data reads from DefiLlama, Voyager, and Dune',
    mockData: {
      starknetTVL: '$847M',
      tvl30dChange: '+12.4%',
      topProtocols: [
        { name: 'Ekubo', tvl: '$312M', category: 'DEX', change30d: '+18%' },
        { name: 'Vesu', tvl: '$98M', category: 'Lending', change30d: '+5%' },
        { name: 'Nostra', tvl: '$72M', category: 'Lending', change30d: '+3%' },
        { name: 'AVNU', tvl: '$41M', category: 'DEX Aggregator', change30d: '+22%' },
        { name: 'ZKLend', tvl: '$34M', category: 'Lending', change30d: '-2%' },
      ],
    },
  },

  'sandbox-sql': {
    description: 'SQL query execution against Dune Starknet dataset',
    starterQueries: [
      {
        label: 'Daily Active Users — AVNU',
        sql: `SELECT DATE_TRUNC('day', block_time) AS day, COUNT(DISTINCT "from") AS unique_users FROM starknet.transactions WHERE "to" = '0x04270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f' AND block_time >= NOW() - INTERVAL '7' DAY GROUP BY 1 ORDER BY 1 DESC;`,
      },
      {
        label: 'Top Protocols by Tx Count (7d)',
        sql: `SELECT "to" AS contract, COUNT(*) AS tx_count, COUNT(DISTINCT "from") AS unique_users FROM starknet.transactions WHERE block_time >= NOW() - INTERVAL '7' DAY AND success = TRUE GROUP BY 1 ORDER BY 2 DESC LIMIT 20;`,
      },
      {
        label: 'STRK Staking Participation (4 weeks)',
        sql: `SELECT DATE_TRUNC('week', block_time) AS week, COUNT(DISTINCT "from") AS unique_stakers, COUNT(*) AS stake_events FROM starknet.transactions WHERE "to" = '0x028d709c875c0ceac3dce7065bec5328186dc89fe254527084d1689910954b0a' AND block_time >= NOW() - INTERVAL '28' DAY GROUP BY 1 ORDER BY 1 DESC;`,
      },
      {
        label: '7-Day AVNU Volume Trend',
        sql: `SELECT DATE_TRUNC('day', block_time) AS day, COUNT(*) AS swaps, SUM(tx_fee) AS total_fees_paid FROM starknet.transactions WHERE "to" = '0x04270219d365d6b017231b52e92b3fb5d7c8378b05e9abc97724537a80e93b0f' AND block_time >= NOW() - INTERVAL '7' DAY AND success = TRUE GROUP BY 1 ORDER BY 1 DESC;`,
      },
    ],
  },

  'sandbox-research-writer': {
    description: 'Structured research/grant proposal writing environment',
    templates: [
      {
        mode: 'protocol-research',
        title: 'Protocol Research Report',
        sections: [
          { id: 'overview', label: 'Protocol Overview', minWords: 50 },
          { id: 'metrics', label: 'Key Metrics', minWords: 40 },
          { id: 'tokenomics', label: 'Tokenomics', minWords: 60 },
          { id: 'moat', label: 'Competitive Moat', minWords: 60 },
          { id: 'risks', label: 'Key Risks', minWords: 60 },
          { id: 'thesis', label: 'Investment Thesis', minWords: 40 },
        ],
      },
      {
        mode: 'grant-proposal',
        title: 'Starknet Foundation Grant Proposal',
        sections: [
          { id: 'product', label: 'Product Description', minWords: 80 },
          { id: 'team', label: 'Team Credibility', minWords: 50 },
          { id: 'milestones', label: 'Milestones (Outcomes)', minWords: 80 },
          { id: 'risks', label: 'Risk Assessment', minWords: 50 },
          { id: 'budget', label: 'Budget Breakdown', minWords: 40 },
        ],
      },
      {
        mode: 'ecosystem-report',
        title: 'Starknet Ecosystem State Report',
        sections: [
          { id: 'tldr', label: 'TL;DR (3 bullets max)', minWords: 20 },
          { id: 'context', label: 'Context (Why now?)', minWords: 100 },
          { id: 'data', label: 'Original Data', minWords: 150 },
          { id: 'comparison', label: 'Cross-Chain Comparison', minWords: 100 },
          { id: 'conclusion', label: 'Actionable Conclusion', minWords: 60 },
          { id: 'falsify', label: 'Falsifiability', minWords: 30 },
          { id: 'sources', label: 'Data Sources', minWords: 20 },
        ],
      },
      {
        mode: 'exec-summary',
        title: 'Executive Summary',
        sections: [
          { id: 'what', label: 'What the protocol does', minWords: 10 },
          { id: 'metric', label: 'Key metric', minWords: 10 },
          { id: 'position', label: 'Competitive position', minWords: 20 },
          { id: 'risk', label: 'Primary risk', minWords: 10 },
        ],
      },
    ],
  },

  'starkzap-mainnet-push': {
    description: 'Guided first mainnet transaction',
    checklist: [
      { id: 'network', label: 'Verify you are on Starknet Mainnet', icon: '🌐' },
      { id: 'address', label: 'Verify the destination address', icon: '🔑' },
      { id: 'amount', label: 'Use a tiny test amount ($5 max)', icon: '💰' },
    ],
  },

  'starkzap-package-install': {
    description: 'npm install walkthrough for developer tooling empathy',
    steps: [
      {
        command: 'npm install starkzap-native',
        explanation: 'starkzap-native is now installed. It brought 3 dependencies with it — libraries it relies on. This is called a dependency tree.',
      },
      {
        command: 'npm install --save-dev @types/node',
        explanation: '--save-dev means this package is only needed during development, not when the app runs in production.',
      },
      {
        command: 'npx expo install',
        explanation: 'Expo manages its own set of required packages. "Peer dependencies" are packages that this tool expects you to have installed alongside it.',
      },
    ],
  },
};

export const JUDGMENT_SIMULATOR_TYPES = {
  'judgment-riskAssess': { icon: '⚠️', label: 'Risk Assessment', color: '#f59e0b' },
  'judgment-communication': { icon: '💬', label: 'Communication', color: '#06b6d4' },
  'judgment-dataInterpret': { icon: '📊', label: 'Data Interpretation', color: '#6366f1' },
  'judgment-escalation': { icon: '📈', label: 'Escalation Decision', color: '#8b5cf6' },
  'judgment-prioritisation': { icon: '🎯', label: 'Prioritisation', color: '#ec4899' },
  'judgment-negotiation': { icon: '🤝', label: 'Negotiation', color: '#10b981' },
  'judgment-ethicalChoice': { icon: '⚖️', label: 'Ethical Decision', color: '#ef4444' },
  'judgment-aggregateRandom': { icon: '🎲', label: 'Mixed Simulation', color: '#8892b0' },
};

export const SIMULATOR_COLORS = {
  bg: '#080a0f',
  bgCard: '#0c0f1a',
  bgEl: '#111526',
  border: '#1a2040',
  accent: '#6366f1',
  pink: '#ec4899',
  green: '#10b981',
  red: '#ef4444',
  amber: '#f59e0b',
  cyan: '#06b6d4',
  violet: '#8b5cf6',
  text: '#e8edf8',
  textSoft: '#8892b0',
};

export { MissingSimulators } from './simulators/MissingSimulators';
export { StarkzapSimulatorCardExtended } from './simulators/StarkzapSimulatorCard_extended';
