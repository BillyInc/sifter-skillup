/**
 * TrackSetupScreen — fires ONCE when a user first enters a skill track.
 *
 * Three things happen on this screen:
 *
 *  1. TOOL INTRODUCTION — "Here are the tools you'll be using in this track."
 *     Each tool is explained in plain English. No jargon without a real-world analogy.
 *     This primes the user's mental model before they hit the tool in a lesson.
 *
 *  2. LAZY DOWNLOAD — Track-specific assets are downloaded silently in the background
 *     while the user reads the tool explanations. They only download when needed,
 *     not on app install. Users don't wait for things they'll never use.
 *
 *  3. DEV ENVIRONMENT PRIMER (technical tracks only) — For tracks that require
 *     npm / pip / cargo / pnpm, a brief "installing dependencies" explainer is shown,
 *     covering what a package manager is and what the install command does.
 *     This is NOT the full lesson — just enough so the concept isn't alien.
 *
 * Usage:
 *   Show this screen once per track, on first entry. Store "setup_complete" flag
 *   in AsyncStorage keyed by trackId. Never show again after that.
 *
 *   <TrackSetupScreen
 *     trackId="quant-trading"
 *     trackName="Quant Trading"
 *     onComplete={() => navigation.replace('Track')}
 *   />
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  SafeAreaView, StatusBar, Animated, Platform, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, Spacing, Radius, FontSize, Shadow } from '../theme';

// ── Tool definition ────────────────────────────────────────────────────────────

interface ToolDef {
  name:         string;
  emoji:        string;
  whatItIs:     string;   // one plain-English sentence: "X is..."
  analogy:      string;   // "Think of it like..." — never assume technical knowledge
  whyThisTrack: string;   // why it's in THIS specific track
  learnMore?:   string;   // optional URL
}

// ── Package manager primer ────────────────────────────────────────────────────

interface PackageManagerDef {
  command:    string;   // e.g. "npm install"
  manager:    string;   // e.g. "npm"
  whatItDoes: string;
  analogy:    string;
  packages:   Array<{ name: string; does: string }>;
}

// ── Track setup config ────────────────────────────────────────────────────────

interface TrackSetupConfig {
  tools:          ToolDef[];
  packageManager?: PackageManagerDef;
  /** Assets to lazy-download when this track is selected */
  lazyAssets?:    Array<{ id: string; label: string; sizeMB: number }>;
}

// ─────────────────────────────────────────────────────────────────────────────
// TRACK CONFIGS
// ─────────────────────────────────────────────────────────────────────────────

const TRACK_SETUPS: Record<string, TrackSetupConfig> = {

  // ── QUANT TRADING / QUANT RESEARCH / DATA SCIENCE / BOT DEV ─────────────────
  'quant-trading': {
    tools: [
      { name: 'Python', emoji: '🐍', whatItIs: 'Python is a programming language.', analogy: 'Think of it like Excel — except instead of clicking, you write instructions, and instead of 1,000 rows, it handles 100 million.', whyThisTrack: 'Every quant uses Python to build, test, and run trading strategies. It\'s the standard.' },
      { name: 'pandas', emoji: '🐼', whatItIs: 'pandas is a Python library for handling tables of data.', analogy: 'Think of it like a spreadsheet that lives inside your code. You can sort, filter, and calculate across millions of rows in milliseconds.', whyThisTrack: 'Price data comes as tables. pandas is how you load, clean, and analyse it.' },
      { name: 'numpy', emoji: '🔢', whatItIs: 'numpy is a Python library for fast number crunching.', analogy: 'Think of it like a calculator that can handle 10,000 calculations at once instead of one at a time.', whyThisTrack: 'Returns, volatility, correlations — all calculated with numpy under the hood.' },
      { name: 'matplotlib', emoji: '📊', whatItIs: 'matplotlib is a Python library that draws charts and graphs.', analogy: 'Think of it like the "Insert Chart" button in Excel — except you control every pixel.', whyThisTrack: 'Visualising your strategy\'s performance is how you know if it works.' },
    ],
    packageManager: {
      manager: 'pip', command: 'pip install pandas numpy matplotlib',
      whatItDoes: 'pip downloads and installs Python libraries from the internet onto your computer so you can use them in your code.',
      analogy: 'Think of pip like the App Store — except instead of apps for your phone, it installs tools for your Python projects. One command, and the library is ready to use.',
      packages: [
        { name: 'pandas',     does: 'Handles tables of data — price history, trade logs, etc.' },
        { name: 'numpy',      does: 'Fast maths — returns, volatility, matrix calculations' },
        { name: 'matplotlib', does: 'Charts — equity curves, drawdowns, signal visualisations' },
      ],
    },
    lazyAssets: [{ id: 'python-sandbox', label: 'Python environment', sizeMB: 8.2 }],
  },

  'data-science': {
    tools: [
      { name: 'Python', emoji: '🐍', whatItIs: 'Python is a programming language.', analogy: 'Think of it like a Swiss Army knife for data — it can load, clean, analyse, visualise, and model data in the same tool.', whyThisTrack: 'Data scientists use Python more than any other tool. It\'s the industry standard.' },
      { name: 'pandas', emoji: '🐼', whatItIs: 'pandas is a Python library for working with data tables.', analogy: 'Think of it like an extremely powerful spreadsheet that lives inside your code and can handle datasets too large for Excel.', whyThisTrack: 'Real-world data is messy and large. pandas is how you tame it.' },
      { name: 'scikit-learn', emoji: '🧠', whatItIs: 'scikit-learn is a Python library for machine learning.', analogy: 'Think of it like a toolbox full of ready-made ML models. You don\'t have to build them — you just load your data, pick a model, and train it.', whyThisTrack: 'Classification, regression, clustering — scikit-learn has them all pre-built.' },
      { name: 'Jupyter Notebook', emoji: '📓', whatItIs: 'Jupyter is an interactive coding environment that runs in your browser.', analogy: 'Think of it like a Google Doc where some cells contain text and some contain live code you can run. You write code, run it, see the results, then keep writing.', whyThisTrack: 'Data science work is exploratory — Jupyter lets you experiment step by step.' },
    ],
    packageManager: {
      manager: 'pip', command: 'pip install pandas scikit-learn jupyter',
      whatItDoes: 'pip downloads and installs Python libraries onto your computer.',
      analogy: 'Think of pip like the App Store for Python. One command installs the tool — no manual setup.',
      packages: [
        { name: 'pandas',       does: 'Load and clean your data' },
        { name: 'scikit-learn', does: 'Pre-built machine learning models' },
        { name: 'jupyter',      does: 'Interactive notebook environment for exploration' },
      ],
    },
    lazyAssets: [{ id: 'python-sandbox', label: 'Python environment', sizeMB: 8.2 }],
  },

  // ── ONCHAIN / BLOCKCHAIN TRACKS ──────────────────────────────────────────────
  'onchain-analysis': {
    tools: [
      { name: 'Etherscan', emoji: '🔍', whatItIs: 'Etherscan is a website that shows every transaction on the Ethereum blockchain.', analogy: 'Think of it like a public ledger you can search — every wallet address, every transaction, every contract, all publicly visible and searchable.', whyThisTrack: 'This is your primary investigation tool. Most on-chain analysis starts here.' },
      { name: 'Dune Analytics', emoji: '🦅', whatItIs: 'Dune is a platform where you can write SQL queries directly against blockchain data.', analogy: 'Think of it like running Google Sheets formulas — except instead of your spreadsheet, you\'re querying the entire Ethereum blockchain history.', whyThisTrack: 'When you want to ask "how many wallets hold more than 100 ETH?" — Dune answers it.' },
      { name: 'SQL', emoji: '🗄️', whatItIs: 'SQL (Structured Query Language) is the language you use to ask questions of a database.', analogy: 'Think of SQL like a precise search engine. Instead of typing "flights to London", you write exactly what you want: "show me all transactions above $1M, sorted by date."', whyThisTrack: 'Dune Analytics uses SQL. You\'ll write simple queries to pull on-chain intelligence.' },
    ],
    lazyAssets: [{ id: 'sql-sandbox', label: 'SQL practice environment', sizeMB: 3.1 }],
  },

  'smart-contract-dev': {
    tools: [
      { name: 'Solidity', emoji: '⛓️', whatItIs: 'Solidity is the programming language used to write smart contracts on Ethereum.', analogy: 'Think of it like writing the rules for a vending machine — once deployed, the contract executes those rules automatically for anyone who interacts with it, without a middleman.', whyThisTrack: 'Smart contracts are written in Solidity. This is the primary skill.' },
      { name: 'Hardhat', emoji: '🔨', whatItIs: 'Hardhat is a development environment for building, testing, and deploying smart contracts.', analogy: 'Think of it like a testing lab for your smart contracts. You can deploy them to a fake blockchain, run tests, find bugs, and fix them — all before going live.', whyThisTrack: 'You never deploy untested code to a live blockchain. Hardhat is where you test first.' },
      { name: 'OpenZeppelin', emoji: '🛡️', whatItIs: 'OpenZeppelin is a library of pre-audited, battle-tested smart contract building blocks.', analogy: 'Think of it like LEGO — instead of building every piece from scratch, you use pre-made, security-audited pieces and assemble them into your contract.', whyThisTrack: 'Most production contracts use OpenZeppelin. It prevents reinventing wheels that have already been security-audited.' },
      { name: 'MetaMask', emoji: '🦊', whatItIs: 'MetaMask is a browser extension that acts as your Ethereum wallet and identity.', analogy: 'Think of it like your ID card and bank card in one — it lets you sign transactions and interact with dApps from your browser.', whyThisTrack: 'You\'ll use MetaMask to test your contracts on testnets.' },
    ],
    packageManager: {
      manager: 'npm', command: 'npm install --save-dev hardhat @openzeppelin/contracts',
      whatItDoes: 'npm (Node Package Manager) downloads and installs JavaScript and Solidity libraries into your project folder.',
      analogy: 'Think of npm like a hardware store for your project. You tell it what tools you need, it fetches them from the internet and puts them in a folder called node_modules — ready to use.',
      packages: [
        { name: 'hardhat',                does: 'Your local blockchain testing environment' },
        { name: '@openzeppelin/contracts', does: 'Security-audited contract building blocks (ERC-20, ERC-721, access control)' },
      ],
    },
    lazyAssets: [{ id: 'solidity-sandbox', label: 'Solidity environment', sizeMB: 5.4 }],
  },

  'bot-development': {
    tools: [
      { name: 'Python', emoji: '🐍', whatItIs: 'Python is a programming language that\'s particularly good at automation and working with APIs.', analogy: 'Think of it like teaching your computer a set of instructions that run on their own — "check this price every 5 seconds, if it crosses X, do Y."', whyThisTrack: 'Most trading and automation bots are written in Python. It has the best libraries for the job.' },
      { name: 'web3.py', emoji: '⛓️', whatItIs: 'web3.py is a Python library for talking to the Ethereum blockchain from your code.', analogy: 'Think of it like a phone line from your Python script to the blockchain — you can read data, send transactions, and call smart contracts, all from code.', whyThisTrack: 'On-chain bots use web3.py to interact with DEXs, bridges, and protocols.' },
      { name: 'asyncio', emoji: '⚡', whatItIs: 'asyncio is Python\'s built-in library for running multiple tasks at the same time.', analogy: 'Think of it like a waiter who takes multiple orders at once instead of waiting at each table. Your bot can monitor 50 tokens simultaneously instead of checking them one by one.', whyThisTrack: 'Fast bots need to do many things at once. asyncio is how Python does that.' },
    ],
    packageManager: {
      manager: 'pip', command: 'pip install web3 aiohttp python-dotenv',
      whatItDoes: 'pip downloads Python libraries onto your computer.',
      analogy: 'Think of pip like an app store — one command, and the library is installed and ready.',
      packages: [
        { name: 'web3',          does: 'Talk to Ethereum and EVM blockchains from Python' },
        { name: 'aiohttp',       does: 'Make async HTTP requests to APIs (price feeds, webhooks)' },
        { name: 'python-dotenv', does: 'Load secret keys from a .env file so you don\'t hardcode them' },
      ],
    },
    lazyAssets: [{ id: 'python-sandbox', label: 'Python environment', sizeMB: 8.2 }],
  },

  'dapp-development': {
    tools: [
      { name: 'React', emoji: '⚛️', whatItIs: 'React is a JavaScript library for building user interfaces.', analogy: 'Think of it like building with LEGO — you create reusable components (a button, a wallet display, a price chart) and assemble them into a full app.', whyThisTrack: 'Most dApps are built with React. It\'s the industry standard for web frontends.' },
      { name: 'ethers.js', emoji: '⛓️', whatItIs: 'ethers.js is a JavaScript library for connecting your web app to the Ethereum blockchain.', analogy: 'Think of it like a translator — your React app speaks JavaScript, the blockchain speaks Solidity. ethers.js translates between them.', whyThisTrack: 'Without ethers.js, your dApp can\'t talk to smart contracts or wallets.' },
      { name: 'Wagmi', emoji: '🔌', whatItIs: 'Wagmi is a React toolkit that handles wallet connections in dApps.', analogy: 'Think of it like a pre-built login system for crypto wallets. Instead of writing 200 lines of wallet-connection code, Wagmi gives you a one-line hook.', whyThisTrack: 'Connecting MetaMask, WalletConnect, and Coinbase Wallet is boilerplate. Wagmi handles it.' },
      { name: 'Node.js', emoji: '🟩', whatItIs: 'Node.js lets you run JavaScript outside a browser — on your computer or a server.', analogy: 'Think of it as the engine that powers your development tools and backend. Without Node.js, none of your npm commands work.', whyThisTrack: 'Your entire dApp development toolchain runs on Node.js.' },
    ],
    packageManager: {
      manager: 'npm', command: 'npm install ethers wagmi viem',
      whatItDoes: 'npm downloads and installs JavaScript packages into your project.',
      analogy: 'Think of npm like a hardware store. You tell it what pieces you need, it puts them in a folder called node_modules — ready to import in your code.',
      packages: [
        { name: 'ethers', does: 'Connect to Ethereum, read blockchain data, send transactions' },
        { name: 'wagmi',  does: 'Wallet connection hooks for React — MetaMask, WalletConnect, etc.' },
        { name: 'viem',   does: 'Low-level Ethereum data encoding/decoding — used by wagmi under the hood' },
      ],
    },
    lazyAssets: [{ id: 'js-sandbox', label: 'JavaScript environment', sizeMB: 4.8 }],
  },

  'supply-chain-analyst': {
    tools: [
      { name: 'Excel', emoji: '📊', whatItIs: 'Excel is the spreadsheet tool used by supply chain analysts globally.', analogy: 'Think of it like the control panel for your supply chain data. Inventory, orders, supplier performance — it all lives in Excel first.', whyThisTrack: 'Every supply chain analyst uses Excel daily. It\'s the starting point before any other tool.' },
      { name: 'SQL', emoji: '🗄️', whatItIs: 'SQL is the language used to pull data from company databases like SAP or Oracle.', analogy: 'Think of SQL like a very precise search bar for your company\'s database. Instead of searching by keyword, you specify exactly what you want: "give me all purchase orders from Supplier K in the last 90 days."', whyThisTrack: 'ERP systems run on databases. SQL is how analysts pull the data they need.' },
      { name: 'Power BI / Tableau', emoji: '📉', whatItIs: 'Power BI and Tableau are tools for turning data into visual dashboards.', analogy: 'Think of them like Excel charts — except they automatically update when new data comes in, and your manager can view them from their browser without opening a file.', whyThisTrack: 'KPI dashboards, OTIF reports, inventory visualisations — these tools produce them.' },
      { name: 'SAP / Oracle', emoji: '🏭', whatItIs: 'SAP and Oracle are the ERP (Enterprise Resource Planning) systems used by most large companies.', analogy: 'Think of an ERP like the operating system of a company — it tracks every order, shipment, invoice, and inventory movement in one place.', whyThisTrack: 'Most of your data will come from SAP or Oracle. You need to know how to navigate them.' },
    ],
    lazyAssets: [
      { id: 'excel-sandbox', label: 'Spreadsheet environment', sizeMB: 2.8 },
      { id: 'sql-sandbox',   label: 'SQL practice environment', sizeMB: 3.1 },
    ],
  },

  'contract-auditing': {
    tools: [
      { name: 'Solidity', emoji: '⛓️', whatItIs: 'Solidity is the language smart contracts are written in.', analogy: 'Think of it like a legal contract — except it executes automatically on the blockchain. To audit one, you need to read it fluently.', whyThisTrack: 'You cannot audit a contract you cannot read. Solidity literacy is the baseline.' },
      { name: 'Slither', emoji: '🐍', whatItIs: 'Slither is an automated tool that scans Solidity code for known vulnerabilities.', analogy: 'Think of it like spell-check — except instead of grammar, it checks for reentrancy bugs, integer overflows, and access control issues.', whyThisTrack: 'Automated scanners catch the obvious issues. You investigate what they miss.' },
      { name: 'Foundry', emoji: '🔨', whatItIs: 'Foundry is a fast toolkit for testing and fuzzing smart contracts.', analogy: 'Think of it like a stress test — Foundry throws thousands of random inputs at your contract to see if anything breaks in a way the developer didn\'t expect.', whyThisTrack: 'Fuzz testing finds edge cases that manual review misses. Foundry is the industry standard.' },
    ],
    packageManager: {
      manager: 'foundry', command: 'curl -L https://foundry.paradigm.xyz | bash && foundryup',
      whatItDoes: 'This installs Foundry — a toolkit for compiling, testing, and deploying Solidity contracts.',
      analogy: 'Think of it like setting up your laboratory before you start experiments. One installation gives you forge (compiler/tester), cast (blockchain reader), and anvil (local test chain).',
      packages: [
        { name: 'forge', does: 'Compile and test Solidity contracts' },
        { name: 'cast',  does: 'Read data from any live blockchain from your terminal' },
        { name: 'anvil', does: 'Run a local test blockchain on your machine' },
      ],
    },
    lazyAssets: [{ id: 'solidity-sandbox', label: 'Solidity environment', sizeMB: 5.4 }],
  },

  // Fallback for tracks without a specific setup config
  default: {
    tools: [],
  },
};

function getSetup(trackId: string): TrackSetupConfig {
  return TRACK_SETUPS[trackId] ?? TRACK_SETUPS.default;
}

// ── Asset download simulation ─────────────────────────────────────────────────

const SETUP_KEY = (trackId: string) => `sifter_track_setup_v1_${trackId}`;

async function markSetupComplete(trackId: string) {
  await AsyncStorage.setItem(SETUP_KEY(trackId), '1');
}

export async function isTrackSetupComplete(trackId: string): Promise<boolean> {
  const v = await AsyncStorage.getItem(SETUP_KEY(trackId));
  return v === '1';
}

// ── Tool card component ───────────────────────────────────────────────────────

function ToolCard({ tool, index, accentColor }: { tool: ToolDef; index: number; accentColor: string }) {
  const [expanded, setExpanded] = useState(index === 0); // first tool open by default
  const anim = useRef(new Animated.Value(index === 0 ? 1 : 0)).current;

  const toggle = () => {
    const toVal = expanded ? 0 : 1;
    setExpanded(!expanded);
    Animated.timing(anim, { toValue: toVal, duration: 220, useNativeDriver: false }).start();
  };

  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.88} style={[tc.wrap, Shadow.sm]}>
      <View style={tc.row}>
        <Text style={tc.emoji}>{tool.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={tc.name}>{tool.name}</Text>
          <Text style={tc.oneLiner}>{tool.whatItIs}</Text>
        </View>
        <Text style={tc.chevron}>{expanded ? '▾' : '›'}</Text>
      </View>

      {expanded && (
        <View style={tc.body}>
          <View style={[tc.analogyBox, { borderLeftColor: accentColor }]}>
            <Text style={tc.analogyLabel}>ANALOGY</Text>
            <Text style={tc.analogyText}>{tool.analogy}</Text>
          </View>
          <Text style={tc.whyLabel}>WHY YOU\'RE LEARNING THIS</Text>
          <Text style={tc.whyText}>{tool.whyThisTrack}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const tc = StyleSheet.create({
  wrap:        { backgroundColor: Colors.card, borderRadius: Radius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  row:         { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md },
  emoji:       { fontSize: 28, width: 36 },
  name:        { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  oneLiner:    { fontSize: 12, color: Colors.textSoft, marginTop: 1, lineHeight: 17 },
  chevron:     { fontSize: 18, color: Colors.textSoft, fontWeight: '800' },
  body:        { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: 10 },
  analogyBox:  { backgroundColor: '#f0f4ff', borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3 },
  analogyLabel:{ fontSize: 10, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  analogyText: { fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  whyLabel:    { fontSize: 10, fontWeight: '900', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.6 },
  whyText:     { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
});

// ── Package manager card ──────────────────────────────────────────────────────

function PackageManagerCard({ def, accentColor }: { def: PackageManagerDef; accentColor: string }) {
  return (
    <View style={[pm.wrap, Shadow.sm]}>
      <View style={[pm.header, { backgroundColor: accentColor + '12' }]}>
        <Text style={pm.headerIcon}>📦</Text>
        <View style={{ flex: 1 }}>
          <Text style={pm.headerTitle}>Installing Dependencies</Text>
          <Text style={pm.headerSub}>What "{def.command}" actually does</Text>
        </View>
      </View>

      <View style={pm.body}>
        <Text style={pm.plain}>{def.whatItDoes}</Text>

        <View style={[pm.analogyBox, { borderLeftColor: accentColor }]}>
          <Text style={pm.analogyLabel}>ANALOGY</Text>
          <Text style={pm.analogyText}>{def.analogy}</Text>
        </View>

        <View style={[pm.codeBox]}>
          <Text style={pm.codeLabel}>THE COMMAND</Text>
          <Text style={pm.code}>{def.command}</Text>
        </View>

        <Text style={pm.packagesLabel}>WHAT EACH PACKAGE DOES</Text>
        {def.packages.map((p, i) => (
          <View key={i} style={pm.packageRow}>
            <View style={[pm.pkgBadge, { backgroundColor: accentColor }]}>
              <Text style={pm.pkgBadgeText}>{p.name}</Text>
            </View>
            <Text style={pm.pkgDoes}>{p.does}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const pm = StyleSheet.create({
  wrap:          { backgroundColor: Colors.card, borderRadius: Radius.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, overflow: 'hidden' },
  header:        { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.md },
  headerIcon:    { fontSize: 24 },
  headerTitle:   { fontSize: FontSize.md, fontWeight: '800', color: Colors.text },
  headerSub:     { fontSize: 12, color: Colors.textSoft, marginTop: 1 },
  body:          { padding: Spacing.md, gap: 12 },
  plain:         { fontSize: FontSize.sm, color: Colors.text, lineHeight: 21 },
  analogyBox:    { backgroundColor: '#f0f4ff', borderRadius: Radius.md, padding: Spacing.md, borderLeftWidth: 3 },
  analogyLabel:  { fontSize: 10, fontWeight: '900', color: Colors.accent, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 4 },
  analogyText:   { fontSize: FontSize.sm, color: Colors.text, lineHeight: 20 },
  codeBox:       { backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md },
  codeLabel:     { fontSize: 9, fontWeight: '900', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 6 },
  code:          { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13, color: '#a5f3fc', lineHeight: 20 },
  packagesLabel: { fontSize: 10, fontWeight: '900', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.6 },
  packageRow:    { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  pkgBadge:      { borderRadius: Radius.sm, paddingHorizontal: 8, paddingVertical: 3, minWidth: 80, alignItems: 'center' },
  pkgBadgeText:  { fontSize: 11, fontWeight: '800', color: '#fff', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  pkgDoes:       { flex: 1, fontSize: 13, color: Colors.text, lineHeight: 19 },
});

// ── Asset download progress ───────────────────────────────────────────────────

function AssetDownloader({ assets, onAllDone }: {
  assets: Array<{ id: string; label: string; sizeMB: number }>;
  onAllDone: () => void;
}) {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    // Simulate downloads — real implementation would use fetch with progress events
    let allDone = true;
    assets.forEach(asset => {
      if (progress[asset.id] === undefined) allDone = false;
    });
    if (allDone && assets.length > 0) return;

    assets.forEach(asset => {
      let pct = 0;
      const interval = setInterval(() => {
        pct += Math.random() * 18 + 8;
        if (pct >= 100) { pct = 100; clearInterval(interval); }
        setProgress(prev => {
          const next = { ...prev, [asset.id]: Math.min(pct, 100) };
          const allComplete = assets.every(a => (next[a.id] ?? 0) >= 100);
          if (allComplete) setTimeout(onAllDone, 400);
          return next;
        });
      }, 180 + Math.random() * 120);
    });
  }, []);

  if (assets.length === 0) { onAllDone(); return null; }

  return (
    <View style={ad.wrap}>
      <Text style={ad.title}>Preparing your track</Text>
      {assets.map(asset => {
        const pct = progress[asset.id] ?? 0;
        return (
          <View key={asset.id} style={ad.item}>
            <View style={ad.itemRow}>
              <Text style={ad.label}>{asset.label}</Text>
              <Text style={ad.pct}>{pct >= 100 ? '✓' : `${Math.round(pct)}%`}</Text>
            </View>
            <View style={ad.bar}>
              <Animated.View style={[ad.fill, { width: `${pct}%` as any }]} />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const ad = StyleSheet.create({
  wrap:    { backgroundColor: '#f8fafc', borderRadius: Radius.lg, padding: Spacing.md, marginBottom: Spacing.md, borderWidth: 1, borderColor: '#e2e8f0' },
  title:   { fontSize: 12, fontWeight: '800', color: Colors.textSoft, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 12 },
  item:    { marginBottom: 10 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label:   { fontSize: 13, color: Colors.text, fontWeight: '600' },
  pct:     { fontSize: 12, color: Colors.accent, fontWeight: '700' },
  bar:     { height: 4, backgroundColor: '#e2e8f0', borderRadius: 2, overflow: 'hidden' },
  fill:    { height: 4, backgroundColor: Colors.accent, borderRadius: 2 },
});

// ── Main screen ────────────────────────────────────────────────────────────────

interface TrackSetupScreenProps {
  trackId:   string;
  trackName: string;
  trackIcon?: string;
  accentColor?: string;
  onComplete: () => void;
}

export default function TrackSetupScreen({
  trackId, trackName, trackIcon, accentColor = Colors.accent, onComplete,
}: TrackSetupScreenProps) {
  const setup = getSetup(trackId);
  const [assetsReady, setAssetsReady] = useState(!setup.lazyAssets?.length);
  const [canStart, setCanStart]       = useState(false);

  const handleAssetsReady = () => {
    setAssetsReady(true);
    setCanStart(true);
  };

  const handleStart = async () => {
    await markSetupComplete(trackId);
    onComplete();
  };

  const hasTools = setup.tools.length > 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar barStyle="dark-content" />

      {/* Header */}
      <View style={[hd.wrap, { borderBottomColor: accentColor }]}>
        <Text style={hd.icon}>{trackIcon ?? '📚'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={hd.title}>{trackName}</Text>
          <Text style={hd.sub}>Your tools for this track</Text>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: Spacing.lg, paddingBottom: 100 }}>

        {/* Asset download (runs silently while user reads) */}
        {setup.lazyAssets?.length ? (
          <AssetDownloader assets={setup.lazyAssets} onAllDone={handleAssetsReady} />
        ) : null}

        {hasTools ? (
          <>
            <Text style={intro.heading}>What you\'ll be working with</Text>
            <Text style={intro.sub}>
              Tap each tool to understand what it is before you encounter it in a lesson.
              No jargon — plain English only.
            </Text>
            {setup.tools.map((tool, i) => (
              <ToolCard key={tool.name} tool={tool} index={i} accentColor={accentColor} />
            ))}
          </>
        ) : (
          <View style={intro.noTools}>
            <Text style={intro.noToolsText}>Loading track setup…</Text>
            <ActivityIndicator color={accentColor} style={{ marginTop: 12 }} />
          </View>
        )}

        {setup.packageManager && (
          <>
            <View style={intro.divider} />
            <PackageManagerCard def={setup.packageManager} accentColor={accentColor} />
          </>
        )}

      </ScrollView>

      {/* Start CTA */}
      <View style={[cta.wrap, { borderTopColor: Colors.border }]}>
        {!assetsReady && (
          <View style={cta.preparing}>
            <ActivityIndicator size="small" color={accentColor} />
            <Text style={cta.preparingText}>Preparing your environment…</Text>
          </View>
        )}
        <TouchableOpacity
          style={[cta.btn, { backgroundColor: canStart ? accentColor : '#e2e8f0' }]}
          onPress={handleStart}
          disabled={!canStart}
          activeOpacity={0.88}
        >
          <Text style={[cta.btnText, { color: canStart ? '#fff' : '#94a3b8' }]}>
            {canStart ? `Start ${trackName} →` : 'Getting ready…'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const hd = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'center', gap: 10, padding: Spacing.lg, borderBottomWidth: 3 },
  icon:  { fontSize: 32 },
  title: { fontSize: FontSize.xl, fontWeight: '900', color: Colors.text },
  sub:   { fontSize: FontSize.sm, color: Colors.textSoft, marginTop: 1 },
});

const intro = StyleSheet.create({
  heading:      { fontSize: FontSize.lg, fontWeight: '900', color: Colors.text, marginBottom: 6 },
  sub:          { fontSize: FontSize.sm, color: Colors.textSoft, lineHeight: 21, marginBottom: Spacing.lg },
  divider:      { height: 1, backgroundColor: Colors.border, marginVertical: Spacing.lg },
  noTools:      { alignItems: 'center', paddingVertical: Spacing.xxxl },
  noToolsText:  { fontSize: FontSize.sm, color: Colors.textSoft },
});

const cta = StyleSheet.create({
  wrap:          { padding: Spacing.lg, borderTopWidth: 1, backgroundColor: Colors.bg },
  preparing:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  preparingText: { fontSize: 12, color: Colors.textSoft, fontWeight: '600' },
  btn:           { borderRadius: Radius.lg, paddingVertical: Spacing.lg, alignItems: 'center' },
  btnText:       { fontSize: FontSize.lg, fontWeight: '800' },
});
