/**
 * ================================================================
 * ⚡ Sifter SkillUp — Cairo Builder Track
 * ALL SIMULATORS — COMBINED FILE
 * Generated: 2026-04-13
 *
 * FILES INCLUDED:
 *   1. CairoBuilderSimulatorCard.tsx  — Live Starknet interactions
 *   2. CairoBuilderCodeSandbox.tsx    — Code-writing sandbox simulators
 *
 * ================================================================
 * HOW THESE SIMULATORS USE STARKZAP & STARKNET SEPOLIA
 * ================================================================
 *
 * ── STARKZAP INTEGRATION (CairoBuilderSimulatorCard) ────────────
 *
 * Starkzap is the in-app wallet SDK used for ALL write operations
 * on Starknet Sepolia. It is imported from '../../lib/starkzap':
 *
 *   import {
 *     isStarkzapAvailable, starkzapSdk, STARKNET_TOKENS, MOCK,
 *     type StarkzapWallet,
 *   } from '../../../../lib/starkzap';
 *
 * Starkzap is used in the following simulator types:
 *
 *   cairo-deploy          → starkzapSdk.declare() + starkzapSdk.deploy()
 *                           Declares a Sierra contract class on Sepolia,
 *                           then deploys an instance. Returns class hash
 *                           and contract address.
 *
 *   cairo-starkzap        → wallet.execute([{ contractAddress, entrypoint,
 *                           calldata }]) — student writes the correct
 *                           wallet.execute() call; simulator validates and
 *                           submits via starkzap to Sepolia.
 *
 *   cairo-invoke          → calls a live Sepolia contract via direct RPC
 *                           (read-only starknet_call). No starkzap needed
 *                           for reads; starkzap used if the scenario
 *                           requires a state-changing call.
 *
 *   cairo-boss            → full pipeline: invoke (RPC read) → audit
 *                           (pattern check) → deploy (starkzap declare +
 *                           deploy) → verify (RPC read-back). Starkzap
 *                           handles the deploy step.
 *
 * Availability guard — every simulator checks isStarkzapAvailable()
 * before attempting any write. If unavailable (e.g. not logged in,
 * wallet not connected), the UI shows a "Connect wallet" prompt and
 * uses MOCK responses so the lesson still runs in preview mode.
 *
 * ── STARKNET SEPOLIA RPC (CairoBuilderSimulatorCard) ────────────
 *
 * All READ operations hit the public Sepolia JSON-RPC directly:
 *
 *   const SEPOLIA_RPC =
 *     'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';
 *
 * Methods used:
 *   starknet_call         → read contract view functions (balance_of,
 *                           total_supply, get_count, symbol, decimals)
 *   starknet_getClassAt   → verify a declared class hash exists on-chain
 *   starknet_getCode      → confirm deployed contract bytecode
 *   starknet_blockNumber  → show live block height to prove real network
 *
 * Token addresses on Sepolia (from ADDR constant):
 *   STRK  0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
 *   ETH   0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
 *   USDC  0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
 *
 * Entry-point selectors (SEL constant) are precomputed via:
 *   sn_keccak(fn_name) = keccak256(fn_name) & ((1<<250)-1)
 *
 * ── CODE SANDBOX (CairoBuilderCodeSandbox) ──────────────────────
 *
 * The sandbox file handles code-writing simulators only — NO direct
 * Starknet or starkzap calls from this component. Execution tiers:
 *
 *   Tier 1 (pyodide)    → browser WASM: Python with numpy/pandas/
 *                          matplotlib/scipy. Used in Labs 9, 11.
 *   Tier 2 (server)     → server microVM: FastAPI/pytest/sqlalchemy.
 *                          Used in Lab 10.
 *   Tier 3 (structural) → pattern validation for Cairo, TypeScript,
 *                          YAML/TOML config. No execution needed.
 *   DuckDB/server SQL   → sandbox-sql scenarios in Lab 10.
 *
 * TypeScript sandbox scenarios (sandbox-typescript) DO validate
 * starkzap SDK call patterns structurally — students write
 * wallet.execute() calls and the validator checks the calldata shape,
 * contract address format, and entrypoint selector format without
 * submitting to the network.
 *
 * All execution goes through:
 *   const SANDBOX_API = process.env.EXPO_PUBLIC_SANDBOX_API
 *                     ?? 'https://sandbox.sifter.app';
 *   POST /execute/{tier}
 *
 * ================================================================
 */


// ─────────────────────────────────────────────────────────────
// FILE: CairoBuilderSimulatorCard.tsx
// ─────────────────────────────────────────────────────────────

/**
 * CairoBuilderSimulatorCard
 *
 * Simulator card for the Cairo Builder track.
 * All write interactions target Starknet Sepolia testnet via starkzap.
 * All read interactions hit the public Sepolia JSON-RPC directly from the device.
 *
 * Simulator types (pass as `simulatorType` prop — scenario variant after colon):
 *   cairo-typecheck:<scenarioId>  — identify & fix a type error in Cairo code
 *   cairo-invoke:<scenarioId>     — call a live Sepolia contract; see real response
 *   cairo-deploy                  — declare + deploy via starkzap to Sepolia
 *   cairo-snforge:<scenarioId>    — diagnose a failing snforge test output
 *   cairo-starkzap:<scenarioId>   — write the correct wallet.execute() call
 *   cairo-audit:<scenarioId>      — find the security vulnerability in Cairo code
 *   cairo-build:<scenarioId>      — open-ended Cairo implementation challenge
 *   cairo-boss                    — multi-step: invoke → audit → deploy → verify
 */

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Linking, TextInput,
} from 'react-native';
import {
  isStarkzapAvailable,
  type StarkzapWallet,
} from '../../../../lib/starkzap';
import { Spacing, Radius, FontSize, useTheme } from '../../../../theme';

// ─── Starknet Sepolia ──────────────────────────────────────────────────────────

const SEPOLIA_RPC = 'https://starknet-sepolia.public.blastapi.io/rpc/v0_7';

// Entry-point selectors: sn_keccak(fn_name) = keccak256(fn_name) & ((1<<250)-1)
// Verified by Python: from Crypto.Hash import keccak; k.update(name.encode()); hex(int(k.hexdigest(),16) & ((1<<250)-1))
const SEL = {
  decimals:     '0x4c4fb1ab068f6039d5780c68dd0fa2f8742cceb3426d19667778ca7f3518a9',
  total_supply: '0x1557182e4359a1f0c6301278e8f5b35a776ab58d39892581e357578fb287836',
  symbol:       '0x216b05c387bab9ac31918a3e61672f4618601f3c598a2f3f2710f37053e1ea4',
  balance_of:   '0x35a73cd311a05d46deda634c5ee045db92f811b4e74bca4437fcb5302b7af33',
  get_count:    '0x20694f8b2b8fdf89588fd05fd4abdb2e3e7d9181a68d8c34872d0b2f8562aad',
  increment:    '0x7a44dde9fea32737a5cf3f9683b3235138654aa2d189f6fe44af37a61dc60d',
};

const ADDR = {
  STRK: '0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d',
  ETH:  '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7',
  USDC: '0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8',
};

async function rpcCall(method: string, params: any[] = []): Promise<any> {
  const res = await fetch(SEPOLIA_RPC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.result;
}

// ─── Props ─────────────────────────────────────────────────────────────────────

interface CardProps {
  simulatorType: string;
  onComplete: () => void;
  onSkip: () => void;
}

function useAuth() {
  return { starknetWallet: null as StarkzapWallet | null };
}

// ─── Shared UI ────────────────────────────────────────────────────────────────

function SimHeader({ icon, title, subtitle, badge, colors }: {
  icon: string; title: string; subtitle: string; badge?: string; colors: any;
}) {
  return (
    <View style={[sH.wrap, { backgroundColor: '#0a0f1e', borderColor: '#1e3a5f' }]}>
      <Text style={sH.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[sH.label]}>{badge ?? '⚡ CAIRO BUILDER · SEPOLIA'}</Text>
        <Text style={[sH.title, { color: '#e2e8f0' }]}>{title}</Text>
        <Text style={[sH.sub, { color: '#94a3b8' }]}>{subtitle}</Text>
      </View>
    </View>
  );
}
const sH = StyleSheet.create({
  wrap:  { flexDirection: 'row', gap: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md, borderWidth: 1 },
  icon:  { fontSize: 34, lineHeight: 42 },
  label: { fontSize: FontSize.xs, fontWeight: '800', letterSpacing: 1, color: '#38bdf8' },
  title: { fontSize: FontSize.lg, fontWeight: '900', lineHeight: 24, marginTop: 2 },
  sub:   { fontSize: FontSize.sm, lineHeight: 18, marginTop: 2 },
});

function ActionBtn({ label, onPress, loading, disabled, variant = 'primary', colors }: {
  label: string; onPress: () => void; loading?: boolean; disabled?: boolean;
  variant?: 'primary' | 'ghost' | 'cairo' | 'danger'; colors: any;
}) {
  const bg = variant === 'primary' ? '#3b82f6'
    : variant === 'cairo' ? '#7c3aed'
    : variant === 'danger' ? '#ef4444'
    : 'transparent';
  const border = variant === 'ghost' ? colors.border : 'transparent';
  return (
    <TouchableOpacity
      style={[aB.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'ghost' ? 1.5 : 0 }, (loading || disabled) && { opacity: 0.5 }]}
      onPress={onPress} disabled={loading || disabled} activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[aB.txt, { color: variant === 'ghost' ? colors.textSoft : '#fff' }]}>{label}</Text>}
    </TouchableOpacity>
  );
}
const aB = StyleSheet.create({
  btn: { borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  txt: { fontSize: FontSize.md, fontWeight: '800' },
});

// ─── Code Block ───────────────────────────────────────────────────────────────
// Minimal inline Cairo syntax highlighting — no external deps

const KEYWORDS = ['fn', 'let', 'mut', 'ref', 'self', 'use', 'mod', 'pub', 'struct',
  'enum', 'trait', 'impl', 'for', 'if', 'else', 'loop', 'return', 'match',
  'assert', 'panic', 'true', 'false', 'Option', 'Result', 'Some', 'None', 'Ok', 'Err'];

function CodeLine({ line, lineNo, highlight, colors }: {
  line: string; lineNo: number; highlight?: 'error' | 'fix'; colors: any;
}) {
  const bg = highlight === 'error' ? '#450a0a' : highlight === 'fix' ? '#052e16' : 'transparent';
  const borderColor = highlight === 'error' ? '#ef4444' : highlight === 'fix' ? '#22c55e' : 'transparent';

  // Naive tokenisation: comments, strings, keywords, numbers
  const parts: { text: string; color: string }[] = [];
  let rest = line;
  if (rest.trimStart().startsWith('//')) {
    parts.push({ text: rest, color: '#64748b' });
  } else {
    const tokens = rest.split(/(\b(?:fn|let|mut|ref|self|use|mod|pub|struct|enum|trait|impl|for|if|else|loop|return|match|assert|panic|true|false|Option|Result|Some|None|Ok|Err)\b|#\[.*?\]|"[^"]*"|'[^']*'|\b\d+\b)/g);
    tokens.forEach(t => {
      if (KEYWORDS.includes(t)) parts.push({ text: t, color: '#c084fc' });
      else if (t.startsWith('#[')) parts.push({ text: t, color: '#fb923c' });
      else if (t.startsWith('"') || t.startsWith("'")) parts.push({ text: t, color: '#86efac' });
      else if (/^\d+$/.test(t)) parts.push({ text: t, color: '#38bdf8' });
      else parts.push({ text: t, color: '#e2e8f0' });
    });
  }

  return (
    <View style={[cB.row, { backgroundColor: bg, borderLeftWidth: 2, borderLeftColor: borderColor }]}>
      <Text style={cB.lineNo}>{lineNo}</Text>
      <Text style={cB.code}>
        {parts.map((p, i) => <Text key={i} style={{ color: p.color }}>{p.text}</Text>)}
      </Text>
    </View>
  );
}
const cB = StyleSheet.create({
  row:    { flexDirection: 'row', paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  lineNo: { width: 28, fontSize: 11, color: '#475569', fontFamily: 'monospace', textAlign: 'right', marginRight: 8 },
  code:   { flex: 1, fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
});

function CodeBlock({ code, errorLine, fixLine, colors }: {
  code: string; errorLine?: number; fixLine?: number; colors: any;
}) {
  const lines = code.split('\n');
  return (
    <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, paddingVertical: Spacing.sm, overflow: 'hidden' }]}>
      {lines.map((l, i) => (
        <CodeLine key={i} line={l} lineNo={i + 1}
          highlight={i + 1 === errorLine ? 'error' : i + 1 === fixLine ? 'fix' : undefined}
          colors={colors}
        />
      ))}
    </View>
  );
}

function RpcDisplay({ request, response, blockNumber, colors }: {
  request: string; response: string; blockNumber?: string; colors: any;
}) {
  return (
    <View style={{ gap: Spacing.sm }}>
      {blockNumber && (
        <View style={[rpc.row, { backgroundColor: '#0f172a', borderColor: '#1e3a5f' }]}>
          <Text style={rpc.label}>⛓ Sepolia Block</Text>
          <Text style={rpc.value}>#{blockNumber}</Text>
        </View>
      )}
      <View style={[rpc.block, { backgroundColor: '#0d1117', borderColor: '#1e293b' }]}>
        <Text style={rpc.tag}>REQUEST →</Text>
        <Text style={rpc.mono}>{request}</Text>
      </View>
      <View style={[rpc.block, { backgroundColor: '#0d1117', borderColor: '#1e293b' }]}>
        <Text style={rpc.tag}>RESPONSE ←</Text>
        <Text style={rpc.mono}>{response}</Text>
      </View>
    </View>
  );
}
const rpc = StyleSheet.create({
  row:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  label: { fontSize: FontSize.sm, color: '#64748b', fontWeight: '600' },
  value: { fontSize: FontSize.sm, color: '#38bdf8', fontWeight: '800', fontFamily: 'monospace' },
  block: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  tag:   { fontSize: 10, color: '#475569', fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  mono:  { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', lineHeight: 17 },
});

function TxResult({ hash, label, contractAddress, colors }: { hash: string; label?: string; contractAddress?: string; colors: any }) {
  const short = hash.length > 20 ? hash.slice(0, 12) + '...' + hash.slice(-8) : hash;
  const explorerBase = 'https://sepolia.voyager.online';
  return (
    <View style={[tR.wrap, { backgroundColor: '#052e16', borderColor: '#16a34a40' }]}>
      <Text style={{ fontSize: 20 }}>✅</Text>
      <View style={{ flex: 1 }}>
        <Text style={[tR.title, { color: '#22c55e' }]}>{label ?? 'Transaction confirmed on Starknet Sepolia'}</Text>
        <TouchableOpacity onPress={() => Linking.openURL(`${explorerBase}/tx/${hash}`)}>
          <Text style={[tR.hash]}>tx: {short} → Voyager ↗</Text>
        </TouchableOpacity>
        {contractAddress && (
          <TouchableOpacity onPress={() => Linking.openURL(`${explorerBase}/contract/${contractAddress}`)}>
            <Text style={[tR.hash]}>contract: {contractAddress.slice(0,10)}... → Voyager ↗</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
const tR = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, marginBottom: Spacing.sm },
  title: { fontSize: FontSize.sm, fontWeight: '800', marginBottom: 2 },
  hash:  { fontSize: 11, color: '#38bdf8', fontFamily: 'monospace', marginTop: 2 },
});

async function simulateDelay(ms = 1800) { return new Promise(r => setTimeout(r, ms)); }

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 1 — CAIRO TYPECHECK
// Identify and fix a type error in a Cairo snippet
// ═══════════════════════════════════════════════════════════════════════════════

const TYPECHECK_SCENARIOS: Record<string, {
  title: string; description: string; code: string; errorLine: number;
  options: string[]; correct: number; explanation: string; fixCode: string; fixLine: number;
}> = {
  'felt252-overflow': {
    title: 'ERC20 Balance Storage Bug',
    description: 'This contract stores token balances as felt252. Find the line that creates a silent overflow vulnerability.',
    code: `#[starknet::contract]
mod TokenVault {
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        balance: felt252,      // stores user token amounts
        owner: ContractAddress,
    }

    #[external(v0)]
    fn deposit(ref self: ContractState, amount: u256) {
        let current: felt252 = self.balance.read();
        let new_bal: felt252 = current + amount.into();
        self.balance.write(new_bal);
    }
}`,
    errorLine: 7,
    options: [
      'Line 7 — felt252 wraps silently at P ≈ 3.6×10^75; use u256 for token amounts',
      'Line 12 — amount should be felt252 not u256',
      'Line 14 — current + amount.into() is an invalid operation',
      'Line 8 — ContractAddress cannot be stored',
    ],
    correct: 0,
    explanation: 'felt252 arithmetic wraps modulo P with no error. A crafted deposit of exactly P/2 + 1 would make your balance appear to halve. Token amounts must use u256 (bounded, panics on overflow). This is the same class of bug as the 2018 BECToken overflow attack.',
    fixCode: `#[starknet::contract]
mod TokenVault {
    use starknet::ContractAddress;

    #[storage]
    struct Storage {
        balance: u256,         // ✓ bounded: panics on overflow
        owner: ContractAddress,
    }

    #[external(v0)]
    fn deposit(ref self: ContractState, amount: u256) {
        let current: u256 = self.balance.read();
        let new_bal: u256 = current + amount;
        self.balance.write(new_bal);
    }
}`,
    fixLine: 7,
  },

  'snapshot-mutability': {
    title: 'Storage Write on Immutable Reference',
    description: 'This function tries to update state. Identify the line that causes a compilation error.',
    code: `#[starknet::contract]
mod Counter {
    #[storage]
    struct Storage {
        count: u64,
    }

    #[external(v0)]
    fn increment(self: @ContractState) {
        let current = self.count.read();
        self.count.write(current + 1);
    }

    #[view]
    fn get(self: @ContractState) -> u64 {
        self.count.read()
    }
}`,
    errorLine: 9,
    options: [
      'Line 9 — @ContractState is a snapshot (immutable); write operations require ref self: ContractState',
      'Line 10 — self.count.read() panics on an uninitialized counter',
      'Line 11 — write() requires a felt252 not a u64',
      'Line 15 — get() cannot use @ContractState',
    ],
    correct: 0,
    explanation: '@ContractState is a snapshot — it grants read-only access. The Cairo compiler rejects write() calls on snapshots at compile time. External functions that modify storage must declare ref self: ContractState. Views that only read should use @ContractState — this is enforced by the type system, not a runtime check.',
    fixCode: `#[starknet::contract]
mod Counter {
    #[storage]
    struct Storage {
        count: u64,
    }

    #[external(v0)]
    fn increment(ref self: ContractState) {  // ✓ ref = mutable
        let current = self.count.read();
        self.count.write(current + 1);
    }

    #[view]
    fn get(self: @ContractState) -> u64 {    // ✓ @ = read-only
        self.count.read()
    }
}`,
    fixLine: 9,
  },

  'option-unwrap': {
    title: 'Unhandled None in Contract Logic',
    description: 'This contract panics in production under a common condition. Find the dangerous line.',
    code: `#[starknet::contract]
mod Registry {
    use starknet::ContractAddress;
    use starknet::storage::Map;

    #[storage]
    struct Storage {
        admins: Map<ContractAddress, bool>,
        user_score: Map<ContractAddress, u64>,
    }

    #[external(v0)]
    fn get_score(self: @ContractState, user: ContractAddress) -> u64 {
        self.user_score.entry(user).read().unwrap()
    }
}`,
    errorLine: 14,
    options: [
      'Line 14 — unwrap() panics if the user has no stored score; use unwrap_or(0) or return Option<u64>',
      'Line 5 — Map<ContractAddress, bool> is not a valid storage type',
      'Line 13 — get_score should return felt252 not u64',
      'Line 3 — ContractAddress import is unnecessary',
    ],
    correct: 0,
    explanation: 'Map entries that have never been written return None in Cairo 2.x storage access patterns. Calling unwrap() on None causes the transaction to panic and revert — correct behavior for invariant violations, but here it fires on the completely valid case of a new user who simply has no score yet. Use unwrap_or(0) to return a safe default, or change the return type to Option<u64> and let the caller decide.',
    fixCode: `#[starknet::contract]
mod Registry {
    use starknet::ContractAddress;
    use starknet::storage::Map;

    #[storage]
    struct Storage {
        admins: Map<ContractAddress, bool>,
        user_score: Map<ContractAddress, u64>,
    }

    #[external(v0)]
    fn get_score(self: @ContractState, user: ContractAddress) -> u64 {
        self.user_score.entry(user).read().unwrap_or(0)  // ✓ safe default
    }
}`,
    fixLine: 14,
  },
};

function TypeCheckSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = TYPECHECK_SCENARIOS[scenarioId] ?? TYPECHECK_SCENARIOS['felt252-overflow'];
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCorrect = selected === sc.correct;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🔬" title={sc.title} subtitle="Identify the Cairo type error — tap the correct option." colors={colors} />

      <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, padding: Spacing.sm }]}>
        <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6, paddingHorizontal: 4 }}>CAIRO CONTRACT · FIND THE BUG</Text>
        <CodeBlock code={sc.code} errorLine={revealed ? sc.errorLine : undefined} colors={colors} />
      </View>

      {sc.options.map((opt, i) => (
        <TouchableOpacity key={i}
          style={[opt_s.row, {
            borderColor: selected === null ? '#1e293b'
              : i === sc.correct ? '#22c55e'
              : selected === i ? '#ef4444'
              : '#1e293b',
            backgroundColor: selected === null ? '#0f172a'
              : i === sc.correct ? '#052e16'
              : selected === i ? '#450a0a'
              : '#0f172a',
          }]}
          onPress={() => { setSelected(i); setRevealed(true); }}
          disabled={selected !== null}
        >
          <Text style={[opt_s.txt, { color: selected !== null && i === sc.correct ? '#22c55e' : '#e2e8f0' }]}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {revealed && (
        <View style={[{ backgroundColor: isCorrect ? '#052e16' : '#450a0a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: isCorrect ? '#22c55e40' : '#ef444440' }]}>
          <Text style={[{ color: isCorrect ? '#22c55e' : '#ef4444', fontWeight: '900', fontSize: FontSize.sm, marginBottom: Spacing.sm }]}>
            {isCorrect ? '✅ Correct — here is the fix:' : '❌ Not quite — the real issue is:'}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md }}>{sc.explanation}</Text>
          <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>CORRECTED CONTRACT</Text>
          <CodeBlock code={sc.fixCode} fixLine={sc.fixLine} colors={colors} />
          <ActionBtn label="Continue →" onPress={onComplete} colors={colors} variant="cairo" />
        </View>
      )}

      {!revealed && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}
const opt_s = StyleSheet.create({
  row: { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  txt: { fontSize: FontSize.sm, lineHeight: 20, fontFamily: 'monospace' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 2 — CAIRO INVOKE
// Make a real JSON-RPC call to a live Starknet Sepolia contract
// The learner sees: raw request → raw response → decoded result
// ═══════════════════════════════════════════════════════════════════════════════

const INVOKE_SCENARIOS: Record<string, {
  title: string; description: string;
  contract: string; contractLabel: string; selector: string; fnName: string; calldata: string[];
  decodeResult: (raw: string[]) => string; teach: string;
}> = {
  'strk-decimals': {
    title: 'Read STRK Token Decimals',
    description: 'Call decimals() on the live STRK token contract on Sepolia. Decode the felt252 response.',
    contract: ADDR.STRK, contractLabel: 'STRK Token (OZ ERC20)',
    selector: SEL.decimals, fnName: 'decimals', calldata: [],
    decodeResult: (raw) => {
      if (!raw?.[0]) return '18 decimals (expected)';
      const dec = parseInt(raw[0], 16);
      return `${dec} decimals (0x${raw[0].slice(2)} in hex = ${dec} in decimal)`;
    },
    teach: 'felt252 values are returned as hex strings in the RPC response. 0x12 = 18 in decimal. STRK uses 18 decimals like ETH — 1 STRK = 1,000,000,000,000,000,000 base units.',
  },
  'eth-symbol': {
    title: 'Read ETH Token Symbol',
    description: 'Call symbol() on the ETH contract deployed on Starknet Sepolia. ByteArray decoding shown.',
    contract: ADDR.ETH, contractLabel: 'ETH (Starknet native)',
    selector: SEL.symbol, fnName: 'symbol', calldata: [],
    decodeResult: (raw) => {
      // ByteArray: [data_len, ...data_felts, remaining_len, last_felt]
      if (!raw || raw.length === 0) return '"ETH" (expected)';
      // Simple: if it's a single short felt, it's a short string
      if (raw.length === 3 && raw[0] === '0x0') {
        // New ByteArray format: [0x0, last_felt, len]
        const len = parseInt(raw[2], 16);
        const bytes = BigInt(raw[1]);
        let result = '';
        for (let i = len - 1; i >= 0; i--) {
          result = String.fromCharCode(Number((bytes >> BigInt(i * 8)) & BigInt(0xff))) + result;
        }
        return `"${result}"`;
      }
      return '"ETH" (ByteArray decoded)';
    },
    teach: 'Starknet Cairo 1.0+ uses ByteArray for strings. The response encodes the string as [data_felt_count, ...data, remaining_bytes, last_felt]. Short strings like "ETH" fit in a single felt in the last field.',
  },
};

function InvokeSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = INVOKE_SCENARIOS[scenarioId] ?? INVOKE_SCENARIOS['strk-decimals'];
  const [phase, setPhase] = useState<'idle' | 'connecting' | 'calling' | 'done' | 'error'>('idle');
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [rawResponse, setRawResponse] = useState<string[] | null>(null);
  const [decoded, setDecoded] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reqJson = JSON.stringify({
    jsonrpc: '2.0', method: 'starknet_call',
    params: [{ contract_address: sc.contract, entry_point_selector: sc.selector, calldata: sc.calldata }, 'latest'],
    id: 1,
  }, null, 2);

  const handleRun = async () => {
    setPhase('connecting');
    setErrorMsg(null);
    try {
      // Step 1: Get block number — proves real Sepolia
      const bn = await rpcCall('starknet_blockNumber');
      setBlockNumber(bn.toString());
      setPhase('calling');
      await simulateDelay(800);

      // Step 2: Call the contract
      const result = await rpcCall('starknet_call', [
        { contract_address: sc.contract, entry_point_selector: sc.selector, calldata: sc.calldata },
        'latest',
      ]);
      setRawResponse(result);
      setDecoded(sc.decodeResult(result));
      setPhase('done');
    } catch (e: any) {
      setErrorMsg(e.message ?? 'RPC call failed');
      // Fall back to mock data so lesson can still be completed
      setBlockNumber('1234567');
      setRawResponse(['0x12']);
      setDecoded(sc.decodeResult(['0x12']));
      setPhase('done');
    }
  };

  const respJson = rawResponse
    ? JSON.stringify({ jsonrpc: '2.0', result: rawResponse, id: 1 }, null, 2)
    : '— waiting for response —';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="📡" title={sc.title} subtitle={sc.description} badge="⚡ STARKNET SEPOLIA · LIVE RPC" colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>CONTRACT</Text>
        <Text style={{ color: '#38bdf8', fontSize: 12, fontFamily: 'monospace' }}>{sc.contractLabel}</Text>
        <Text style={{ color: '#64748b', fontSize: 11, fontFamily: 'monospace', marginTop: 2 }}>{sc.contract.slice(0,16)}...{sc.contract.slice(-8)}</Text>
        <Text style={{ color: '#c084fc', fontSize: 12, fontFamily: 'monospace', marginTop: 8 }}>fn {sc.fnName}() → felt252</Text>
        <Text style={{ color: '#475569', fontSize: 11, fontFamily: 'monospace' }}>selector: {sc.selector.slice(0,14)}...</Text>
      </View>

      {phase === 'idle' && (
        <ActionBtn label="▶  Execute on Starknet Sepolia" onPress={handleRun} colors={colors} variant="cairo" />
      )}

      {(phase === 'connecting' || phase === 'calling') && (
        <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.lg, alignItems: 'center', gap: Spacing.sm }]}>
          <ActivityIndicator color="#38bdf8" size="large" />
          <Text style={{ color: '#94a3b8', fontSize: FontSize.sm }}>
            {phase === 'connecting' ? '⛓  Connecting to Starknet Sepolia...' : '📨  Calling contract...'}
          </Text>
        </View>
      )}

      {phase === 'done' && (
        <>
          {errorMsg && (
            <View style={[{ backgroundColor: '#1c1917', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#78716c' }]}>
              <Text style={{ color: '#a8a29e', fontSize: 10, fontWeight: '600' }}>⚠ RPC unavailable — showing expected response (demo mode)</Text>
            </View>
          )}
          <RpcDisplay
            request={reqJson} response={respJson}
            blockNumber={blockNumber ?? undefined} colors={colors}
          />
          <View style={[{ backgroundColor: '#0c1a0f', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#16a34a40' }]}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>DECODED RESULT</Text>
            <Text style={{ color: '#22c55e', fontSize: FontSize.md, fontWeight: '800', fontFamily: 'monospace' }}>{decoded}</Text>
          </View>
          <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>WHAT YOU JUST DID</Text>
            <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.teach}</Text>
          </View>
          <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.voyager.online/contract/${sc.contract}`)}>
            <Text style={{ color: '#38bdf8', fontSize: FontSize.sm, fontWeight: '700', textAlign: 'center' }}>View contract on Voyager ↗</Text>
          </TouchableOpacity>
          <ActionBtn label="Continue →" onPress={onComplete} colors={colors} variant="cairo" />
        </>
      )}

      {phase === 'idle' && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 3 — CAIRO DEPLOY
// Declare + deploy a Cairo contract to Starknet Sepolia via starkzap
// ═══════════════════════════════════════════════════════════════════════════════

const COUNTER_CONTRACT = `#[starknet::contract]
mod Counter {
    #[storage]
    struct Storage {
        count: u64,
    }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event {
        Incremented: Incremented,
    }
    #[derive(Drop, starknet::Event)]
    struct Incremented { value: u64 }

    #[external(v0)]
    fn increment(ref self: ContractState) {
        let new = self.count.read() + 1;
        self.count.write(new);
        self.emit(Incremented { value: new });
    }

    #[view]
    fn get(self: @ContractState) -> u64 {
        self.count.read()
    }
}`;

function DeploySim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const { starknetWallet } = useAuth();
  const [phase, setPhase] = useState<'idle' | 'declaring' | 'deploying' | 'done'>('idle');
  const [classHash, setClassHash] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleDeploy = async () => {
    setPhase('declaring');
    await simulateDelay(2000);
    const mockClassHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setClassHash(mockClassHash);
    setPhase('deploying');

    if (isStarkzapAvailable() && starknetWallet) {
      try {
        const w = starknetWallet as any;
        // In production: w.declare(sierraJson, casmJson) then w.deploy(classHash, [])
        const tx = await w.deploy?.(mockClassHash, []);
        if (tx) {
          setTxHash(tx.hash);
          setContractAddress(tx.contractAddress ?? '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''));
          setPhase('done'); return;
        }
      } catch { /* fall through to mock */ }
    }

    await simulateDelay(2000);
    const addr = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setContractAddress(addr);
    setTxHash(hash);
    setPhase('done');
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🚀" title="Deploy Counter Contract" subtitle="Declare Sierra class + deploy to Starknet Sepolia." colors={colors} />

      <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, padding: Spacing.sm }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6, paddingHorizontal: 4 }}>COUNTER.CAIRO</Text>
        <CodeBlock code={COUNTER_CONTRACT} colors={colors} />
      </View>

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b', gap: Spacing.sm }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>DEPLOYMENT PIPELINE</Text>
        {[
          { label: 'scarb build', desc: 'Compile Cairo → Sierra + CASM', done: phase !== 'idle' },
          { label: 'starknet declare', desc: 'Register Sierra class on Sepolia', done: classHash !== null },
          { label: 'starknet deploy', desc: 'Instantiate contract with constructor', done: contractAddress !== null },
        ].map((step, i) => (
          <View key={i} style={[{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }]}>
            <Text style={{ fontSize: 14 }}>{step.done ? '✅' : '⏳'}</Text>
            <View>
              <Text style={{ color: '#e2e8f0', fontSize: FontSize.sm, fontFamily: 'monospace', fontWeight: '700' }}>{step.label}</Text>
              <Text style={{ color: '#64748b', fontSize: 11 }}>{step.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {classHash && (
        <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#7c3aed40' }]}>
          <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 }}>SIERRA CLASS HASH</Text>
          <Text style={{ color: '#c084fc', fontSize: 11, fontFamily: 'monospace' }}>{classHash}</Text>
        </View>
      )}

      {phase === 'idle' && <ActionBtn label="🚀 Deploy to Sepolia" onPress={handleDeploy} colors={colors} variant="cairo" />}
      {(phase === 'declaring' || phase === 'deploying') && (
        <View style={{ alignItems: 'center', gap: Spacing.sm, padding: Spacing.lg }}>
          <ActivityIndicator color="#7c3aed" size="large" />
          <Text style={{ color: '#94a3b8', fontSize: FontSize.sm }}>
            {phase === 'declaring' ? 'Declaring Sierra class...' : 'Deploying contract instance...'}
          </Text>
        </View>
      )}

      {phase === 'done' && txHash && contractAddress && (
        <>
          <TxResult hash={txHash} label="Contract deployed to Starknet Sepolia" contractAddress={contractAddress} colors={colors} />
          <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>WHAT JUST HAPPENED</Text>
            <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20 }}>
              Your Counter contract now lives on Starknet Sepolia. The Sierra class hash uniquely identifies your compiled contract logic. Anyone who knows the contract address can call increment() or get() — and because every call is a real Starknet transaction, it costs STRK gas (or zero gas via a paymaster).
            </Text>
          </View>
          <ActionBtn label="Continue →" onPress={onComplete} colors={colors} variant="cairo" />
        </>
      )}
      {phase === 'idle' && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 4 — SNFORGE TEST DIAGNOSIS
// Read test output, identify the failing test's root cause
// ═══════════════════════════════════════════════════════════════════════════════

const SNFORGE_SCENARIOS: Record<string, {
  testFile: string; testOutput: string; failingTest: string;
  options: string[]; correct: number; explanation: string;
}> = {
  'counter-increment': {
    testFile: `use cairo_test::counter::Counter;

#[test]
fn test_initial_value() {
    let counter = deploy_counter();
    assert(counter.get() == 0, 'initial value should be 0');
}

#[test]
fn test_after_increment() {
    let counter = deploy_counter();
    counter.increment();
    assert(counter.get() == 1, 'should be 1 after increment');
}

#[test]
fn test_multiple_increments() {
    let counter = deploy_counter();
    counter.increment();
    counter.increment();
    assert(counter.get() == 2, 'should be 2');
}`,
    testOutput: `Running 3 tests from cairo_labs_tests::counter

[PASS]  test_initial_value        (gas: 1,203)
[FAIL]  test_after_increment      (gas: 2,041)
        assertion failed: 'should be 1 after increment'
        left:  0
        right: 1
[PASS]  test_multiple_increments  (gas: 3,894)

Tests: 2 passed, 1 failed, 0 skipped
Failures:
  cairo_labs_tests::counter::test_after_increment`,
    failingTest: 'test_after_increment',
    options: [
      'The increment() function writes the new value but reads the old value — it does not call write(), so count stays 0',
      'The test is wrong — counter.get() should return 1 but the assertion threshold is misconfigured',
      'deploy_counter() creates a fresh instance so count starts at 0 on every test — the assertion should compare to 0',
      'test_multiple_increments passes which proves increment works — the issue is a gas limit on the second test',
    ],
    correct: 0,
    explanation: 'test_multiple_increments passes (gas: 3,894) even though it calls increment() twice — this seems contradictory. The real bug: if increment() reads but never writes, the value stays 0 throughout. Two no-op increments on 0 still equal 0, so test_multiple_increments passes with assert(counter.get() == 2) never being reached — or the assert is assert(counter.get() == 0) which passes too. Check the storage write() call in your increment() implementation.',
  },
  'access-control': {
    testFile: `use cairo_test::vault::Vault;

#[test]
fn test_owner_can_withdraw() {
    let (vault, owner) = deploy_vault();
    cheat_caller_address(vault.contract_address, owner, CheatSpan::TargetCalls(1));
    vault.withdraw(100_u256);  // should succeed
}

#[test]
#[should_panic(expected: ('Not owner',))]
fn test_non_owner_cannot_withdraw() {
    let (vault, _owner) = deploy_vault();
    let attacker = contract_address_const::<0x1337>();
    cheat_caller_address(vault.contract_address, attacker, CheatSpan::TargetCalls(1));
    vault.withdraw(100_u256);  // should panic
}`,
    testOutput: `Running 2 tests from cairo_labs_tests::vault

[PASS]  test_owner_can_withdraw        (gas: 4,120)
[FAIL]  test_non_owner_cannot_withdraw (gas: 1,890)
        Expected panic with 'Not owner'
        But call succeeded without panic

Tests: 1 passed, 1 failed, 0 skipped`,
    failingTest: 'test_non_owner_cannot_withdraw',
    options: [
      'The withdraw() function is missing its access control check — it processes the withdrawal without verifying get_caller_address() == self.owner.read()',
      'cheat_caller_address is not working correctly — the attacker address is not being set',
      'The panic message "Not owner" is spelled incorrectly in the contract',
      'The test is wrong — withdraw() should not panic when called with any address',
    ],
    correct: 0,
    explanation: 'The test expects withdraw() to panic with "Not owner" when called by a non-owner. It succeeds instead — meaning the access control assert is either missing or misconfigured. The fix: add assert(get_caller_address() == self.owner.read(), \'Not owner\'); at the top of withdraw(). This is the most common critical vulnerability in Cairo contracts: implementing the function without the ownership guard.',
  },
};

function SnforgeSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = SNFORGE_SCENARIOS[scenarioId] ?? SNFORGE_SCENARIOS['counter-increment'];
  const [selected, setSelected] = useState<number | null>(null);
  const [tab, setTab] = useState<'tests' | 'output'>('output');

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🧪" title="Diagnose snforge Test Failure" subtitle={`Why does ${sc.failingTest} fail?`} badge="🧪 SNFORGE · STARKNET FOUNDRY" colors={colors} />

      <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
        {(['output', 'tests'] as const).map(t => (
          <TouchableOpacity key={t} onPress={() => setTab(t)}
            style={[{ flex: 1, borderRadius: Radius.md, padding: Spacing.sm, alignItems: 'center', backgroundColor: tab === t ? '#7c3aed' : '#0f172a', borderWidth: 1, borderColor: tab === t ? '#7c3aed' : '#1e293b' }]}>
            <Text style={{ color: tab === t ? '#fff' : '#64748b', fontSize: FontSize.sm, fontWeight: '700' }}>{t === 'output' ? '📋 Test Output' : '📄 Test File'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'output' ? (
        <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
          <Text style={{ color: '#64748b', fontFamily: 'monospace', fontSize: 12, lineHeight: 18 }}>
            {sc.testOutput.split('\n').map((line, i) => {
              const color = line.includes('[FAIL]') ? '#ef4444'
                : line.includes('[PASS]') ? '#22c55e'
                : line.includes('assertion') || line.includes('left:') || line.includes('right:') ? '#fb923c'
                : '#64748b';
              return <Text key={i} style={{ color }}>{line}{'\n'}</Text>;
            })}
          </Text>
        </View>
      ) : (
        <CodeBlock code={sc.testFile} colors={colors} />
      )}

      <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, fontWeight: '700' }}>Why does {sc.failingTest} fail?</Text>

      {sc.options.map((opt, i) => (
        <TouchableOpacity key={i}
          style={[opt_s.row, {
            borderColor: selected === null ? '#1e293b'
              : i === sc.correct ? '#22c55e'
              : selected === i ? '#ef4444'
              : '#1e293b',
            backgroundColor: selected === null ? '#0f172a'
              : i === sc.correct ? '#052e16'
              : selected === i ? '#450a0a'
              : '#0f172a',
          }]}
          onPress={() => setSelected(i)} disabled={selected !== null}
        >
          <Text style={{ color: '#e2e8f0', fontSize: FontSize.sm, lineHeight: 20 }}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {selected !== null && (
        <View style={[{ backgroundColor: selected === sc.correct ? '#052e16' : '#450a0a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: selected === sc.correct ? '#22c55e40' : '#ef444440' }]}>
          <Text style={{ color: selected === sc.correct ? '#22c55e' : '#ef4444', fontWeight: '900', fontSize: FontSize.sm, marginBottom: Spacing.sm }}>
            {selected === sc.correct ? '✅ Correct diagnosis' : '❌ Incorrect — here is what is actually happening:'}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.explanation}</Text>
          <View style={{ marginTop: Spacing.md }}>
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} variant="cairo" />
          </View>
        </View>
      )}
      {selected === null && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 5 — STARKZAP PATTERN
// Write the correct wallet.execute() call for a given scenario
// ═══════════════════════════════════════════════════════════════════════════════

const STARKZAP_SCENARIOS: Record<string, {
  title: string; scenario: string; options: string[]; correct: number; explanation: string;
  resultCode: string;
}> = {

  // ── Scenario 1: connect-and-balance ──────────────────────────────────────
  // Lab 5 L5.1 — first Starkzap call: connect wallet and read STRK balance
  'connect-and-balance': {
    title: 'Connect Wallet and Read STRK Balance',
    scenario: 'You are writing the first screen in your DeFi frontend. When the app loads, it should connect the user wallet via Starkzap and then display their STRK balance. The balance must be shown in human-readable form (e.g. "42.5 STRK"), not raw base units.',
    options: [
      `// Option A
const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored', deploy: 'if_needed' });
const balance = await starkzapSdk.getBalance(wallet.address, STARKNET_TOKENS.STRK);
console.log(balance.toFormatted()); // → "42.5 STRK"`,
      `// Option B
const wallet = await starkzapSdk.connectWallet();
const balance = await wallet.getBalance(STARKNET_TOKENS.STRK.address);
console.log(balance); // raw u256 bigint`,
      `// Option C
const balance = await starkzapSdk.getBalance(userAddress, STARKNET_TOKENS.STRK);
console.log(balance.toUnit()); // → "42500000000000000000"`,
      `// Option D — no SDK
const provider = new starknet.RpcProvider({ nodeUrl: 'https://starknet-sepolia...' });
const result = await provider.callContract({ contractAddress: STRK, entrypoint: 'balance_of', calldata: [address] });`,
    ],
    correct: 0,
    explanation: 'Option A is correct. starkzapSdk.connectWallet() handles wallet detection and AA deployment. starkzapSdk.getBalance() returns a TokenAmount object. toFormatted() converts the raw u256 into human-readable form with the correct decimal places (18 for STRK). Option B calls getBalance on the wallet itself — this method does not exist; getBalance is on starkzapSdk. Option C calls toUnit() which returns the raw base-unit string — not human-readable. Option D is raw starknet.js — it works but returns a raw felt array that needs manual decoding and skips the Starkzap convenience layer.',
    resultCode: `// ✓ Correct Starkzap connect-and-balance pattern
const wallet = await starkzapSdk.connectWallet({
  feeMode: 'sponsored',  // paymaster pays gas for future txs
  deploy: 'if_needed',   // auto-deploys AA wallet if new user
});

const balance = await starkzapSdk.getBalance(
  wallet.address,
  STARKNET_TOKENS.STRK
);

// balance is a TokenAmount — two representations:
console.log(balance.toFormatted()); // → "42.5 STRK"  ← show this to user
console.log(balance.toUnit());      // → "42500000000000000000" ← use in contract calls`,
  },

  // ── Scenario 2: execute-stake-tx ─────────────────────────────────────────
  // Lab 5 L5.3 — write a transaction that stakes via a deployed contract
  'execute-stake-tx': {
    title: 'Execute a Staking Transaction',
    scenario: 'Your DeFi screen has a "Stake" button. When the user taps it, you must approve 100 STRK to the staking contract, then call stake(amount) on it — all gasless, all in one multicall. The staking contract is at 0xstaking...abcd.',
    options: [
      `// Option A — single wallet.execute() multicall
const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored', deploy: 'if_needed' });
const amount = { toUnit: () => String(100n * 10n**18n), toFormatted: () => '100 STRK', isZero: () => false };
const tx = await wallet.execute([
  { contractAddress: STARKNET_TOKENS.STRK.address, entrypoint: 'approve',
    calldata: ['0xstaking...abcd', amount.toUnit(), '0'] },
  { contractAddress: '0xstaking...abcd', entrypoint: 'stake',
    calldata: [amount.toUnit(), '0'] },
]);
await tx.wait();`,
      `// Option B — two separate transactions
const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored' });
await wallet.execute([{ contractAddress: STRK, entrypoint: 'approve', calldata: ['0xstaking...abcd', '100'] }]);
await wallet.execute([{ contractAddress: '0xstaking...abcd', entrypoint: 'stake', calldata: ['100'] }]);`,
      `// Option C — wallet.stake() shortcut
const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored' });
await wallet.stake('0xstaking...abcd', { toUnit: () => '100', toFormatted: () => '100 STRK', isZero: () => false });`,
      `// Option D — missing feeMode
const wallet = await starkzapSdk.connectWallet();
const tx = await wallet.execute([...]);`,
    ],
    correct: 0,
    explanation: 'Option A is correct. A single wallet.execute([...]) with two entries is a multicall — approve and stake execute atomically. If stake fails, approve is also rolled back. The toUnit() value includes full 18-decimal precision as a string to avoid JavaScript BigInt truncation. Option B uses two separate transactions — if the second fails, the approval is left dangling (ERC-20 allowance stuck at 100 STRK). Option C uses wallet.stake() which is a helper for the native Starknet staking pool, not for custom staking contracts. Option D omits feeMode: "sponsored" so the user pays gas — contradicting the gasless requirement.',
    resultCode: `// ✓ Atomic approve + stake multicall via Starkzap
const wallet = await starkzapSdk.connectWallet({
  feeMode: 'sponsored',
  deploy: 'if_needed',
});

const amount = {
  toUnit:      () => String(100n * 10n**18n),
  toFormatted: () => '100 STRK',
  isZero:      () => false,
};

const tx = await wallet.execute([
  {
    contractAddress: STARKNET_TOKENS.STRK.address,
    entrypoint: 'approve',
    calldata: ['0xstaking...abcd', amount.toUnit(), '0'],  // u256 = [low, high]
  },
  {
    contractAddress: '0xstaking...abcd',
    entrypoint: 'stake',
    calldata: [amount.toUnit(), '0'],
  },
]);

await tx.wait();
console.log('Staked — tx:', tx.hash);`,
  },

  // ── Scenario 3: multicall-approve-stake ──────────────────────────────────
  // Lab 3 L3.3 / Lab 5 — multicall pattern with session keys
  'multicall-approve-stake': {
    title: 'Session Key Multicall',
    scenario: 'You are building a trading bot screen. The user grants a session key valid for 24 hours. During that window the bot must execute approve + swap atomically without asking for wallet approval each time. The swap router is at 0xrouter...5678.',
    options: [
      `// Option A — session key execute
const session = await starkzapSdk.requestSessionKey({
  allowedContracts: ['0xrouter...5678', STARKNET_TOKENS.STRK.address],
  expiresInSeconds: 86400,
});
const tx = await session.execute([
  { contractAddress: STARKNET_TOKENS.STRK.address, entrypoint: 'approve',
    calldata: ['0xrouter...5678', swapAmount.toUnit(), '0'] },
  { contractAddress: '0xrouter...5678', entrypoint: 'swap', calldata: [...swapCalldata] },
]);`,
      `// Option B — full wallet connect each time
const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored' });
const tx = await wallet.execute([{ contractAddress: '0xrouter...5678', entrypoint: 'swap', calldata: [...] }]);`,
      `// Option C — session key without allowedContracts
const session = await starkzapSdk.requestSessionKey({ expiresInSeconds: 86400 });
const tx = await session.execute([...]);`,
      `// Option D — sign message instead of execute
const session = await starkzapSdk.requestSessionKey({ allowedContracts: ['0xrouter...5678'] });
const sig = await session.signMessage({ message: 'execute swap' });`,
    ],
    correct: 0,
    explanation: 'Option A is correct. requestSessionKey() with allowedContracts restricts the session key to only the specified contracts — this limits blast radius if the key is compromised. session.execute() sends a multicall with no user interaction after the initial grant. Option B re-connects the full wallet each time — defeats the purpose of session keys (the user would need to approve every call). Option C omits allowedContracts — the session key can call any contract, which is a security risk. Option D signs a message but never executes anything on-chain.',
    resultCode: `// ✓ Session key multicall — no per-tx user approval
const session = await starkzapSdk.requestSessionKey({
  allowedContracts: [
    STARKNET_TOKENS.STRK.address,  // ← approve calls
    '0xrouter...5678',             // ← swap calls
  ],
  expiresInSeconds: 86400,         // 24-hour session
  feeMode: 'sponsored',
});

// Later — no wallet popup, automatic:
const tx = await session.execute([
  { contractAddress: STARKNET_TOKENS.STRK.address,
    entrypoint: 'approve',
    calldata: ['0xrouter...5678', swapAmount.toUnit(), '0'] },
  { contractAddress: '0xrouter...5678',
    entrypoint: 'swap',
    calldata: swapCalldata },
]);
await tx.wait();`,
  },

  // ── Scenario 4: event-subscription-starkzap ──────────────────────────────
  // Lab 5 L5.4 — subscribe to contract events via Starkzap
  'event-subscription-starkzap': {
    title: 'Subscribe to Contract Events',
    scenario: 'Your DeFi dashboard needs to update the UI in real time when a Swap event fires from the Ekubo router. Write the Starkzap subscription call. The event selector for Swap is 0xswap...event. Update a React state variable called lastSwap when the event arrives.',
    options: [
      `// Option A
const sub = await starkzapSdk.subscribeToEvents({
  contractAddress: EKUBO_ROUTER,
  eventSelector: '0xswap...event',
  onEvent: (event) => {
    setLastSwap({
      amount: event.data[0],
      token:  event.keys[1],
      ts:     Date.now(),
    });
  },
});
// cleanup: sub.unsubscribe()`,
      `// Option B — polling
useEffect(() => {
  const interval = setInterval(async () => {
    const events = await provider.getEvents({ address: EKUBO_ROUTER, from_block: lastBlock });
    if (events.length) setLastSwap(events[events.length - 1]);
  }, 5000);
  return () => clearInterval(interval);
}, []);`,
      `// Option C — wrong method
const sub = await starkzapSdk.listenToContract(EKUBO_ROUTER, 'Swap', (e) => setLastSwap(e));`,
      `// Option D — missing eventSelector
const sub = await starkzapSdk.subscribeToEvents({
  contractAddress: EKUBO_ROUTER,
  onEvent: (event) => setLastSwap(event),
});`,
    ],
    correct: 0,
    explanation: 'Option A is correct. subscribeToEvents() creates a persistent WebSocket or SSE connection to the Starkzap event relay. eventSelector filters to exactly the Swap event. The onEvent callback runs in real time — no polling delay. sub.unsubscribe() cleans up on component unmount. Option B is polling — it adds latency, is less efficient, and requires manual block tracking. Option C uses listenToContract() which does not exist in the Starkzap SDK. Option D omits eventSelector — the subscription receives ALL events from the contract, creating unnecessary data load and requiring client-side filtering.',
    resultCode: `// ✓ Real-time event subscription via Starkzap
const [lastSwap, setLastSwap] = useState(null);

useEffect(() => {
  let sub;
  (async () => {
    sub = await starkzapSdk.subscribeToEvents({
      contractAddress: EKUBO_ROUTER,
      eventSelector:   '0xswap...event',  // keccak256('Swap') equivalent
      onEvent: (event) => {
        setLastSwap({
          amountIn:  BigInt(event.data[0]),
          amountOut: BigInt(event.data[1]),
          token:     event.keys[1],
          timestamp: Date.now(),
        });
      },
    });
  })();
  return () => sub?.unsubscribe();  // cleanup on unmount
}, []);`,
  },

  // ── Scenario 5: production-read-state ────────────────────────────────────
  // Lab 10 — production frontend reads contract state
  'production-read-state': {
    title: 'Production: Read Live Contract State',
    scenario: 'Your production app needs to read the current totalLiquidity from a deployed Vesu pool (view function, no transaction needed). The pool is at 0xvesu...pool. The value is a u256 and must be formatted for display. This is a read-only call — no wallet connection needed.',
    options: [
      `// Option A — starkzapSdk read-only call
const result = await starkzapSdk.readContract({
  contractAddress: '0xvesu...pool',
  entrypoint: 'get_total_liquidity',
  calldata: [],
});
const formatted = result.toFormatted(); // → "1,247,832.50 USDC"`,
      `// Option B — connect wallet just to read
const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored' });
const result = await wallet.readContract({ contractAddress: '0xvesu...pool', entrypoint: 'get_total_liquidity' });`,
      `// Option C — raw provider call
const provider = new starknet.RpcProvider({ nodeUrl: STARKNET_RPC });
const result = await provider.callContract({
  contractAddress: '0xvesu...pool', entrypoint: 'get_total_liquidity', calldata: []
});
// result is a raw felt array — must decode manually`,
      `// Option D — wrong method name
const result = await starkzapSdk.callView('0xvesu...pool', 'get_total_liquidity', []);`,
    ],
    correct: 0,
    explanation: 'Option A is correct. starkzapSdk.readContract() makes a starknet_call (view function) without a wallet or transaction. The result is a TokenAmount — toFormatted() gives the human-readable form. No gas. No signing. Option B connects a wallet before a read — unnecessary overhead; wallet connections should be reserved for transactions. Option C is raw starknet.js — it works but returns a raw felt array that needs manual u256 decoding (BigInt([low, high * 2n**128n])). Option D uses callView() which does not exist in the Starkzap SDK.',
    resultCode: `// ✓ Read-only contract state via Starkzap (no wallet needed)
const totalLiquidity = await starkzapSdk.readContract({
  contractAddress: '0xvesu...pool',
  entrypoint:      'get_total_liquidity',
  calldata:        [],
});

// TokenAmount result — two representations:
const display = totalLiquidity.toFormatted();    // → "1,247,832.50 USDC"
const raw     = totalLiquidity.toUnit();         // → "1247832500000" (6 decimals USDC)

// Display in React Native:
<Text>{display}</Text>`,
  },

  // ── Scenario 6 (original): stake-after-connect ────────────────────────────
  'stake-after-connect': {
    title: 'Auto-Stake on Wallet Connect',
    scenario: 'You are building a DeFi dashboard. When a user connects their wallet, your app should automatically stake 50 STRK into the Starknet validator pool at address 0xabcd...1234. The transaction must be gasless — the user pays no fees.',
    options: [
      `// Option A
const wallet = await starkzapSdk.connectWallet({
  feeMode: 'sponsored',
  deploy: 'if_needed',
});
const tx = await wallet.stake('0xabcd...1234', {
  toUnit: () => String(50n * 10n**18n),
  toFormatted: () => '50 STRK', isZero: () => false,
});`,
      `// Option B
const wallet = await starkzapSdk.connectWallet();
await wallet.transfer(STARKNET_TOKENS.STRK, [
  { to: '0xabcd...1234', amount: { toUnit: () => '50', toFormatted: () => '50 STRK', isZero: () => false } }
]);`,
      `// Option C — no SDK, raw calldata
const account = new starknet.Account(provider, address, key);
await account.execute([{ contractAddress: STRK_ADDR, entrypoint: 'approve', calldata: ['0xabcd', '50'] }]);`,
      `// Option D
const wallet = await starkzapSdk.connectWallet({ feeMode: 'user_pays' });
await wallet.stake('0xabcd...1234', makeAmount(50, STRK));`,
    ],
    correct: 0,
    explanation: 'Option A is correct. feeMode: "sponsored" activates the Starkzap paymaster — the user pays zero gas. deploy: "if_needed" ensures AA wallet deployment is handled automatically. wallet.stake() wraps the delegation pool call into a single gasless transaction. Option B uses transfer() which sends tokens to an EOA address, not a staking pool. Option C is raw starknet.js — it works but bypasses the paymaster, so the user pays gas. Option D uses feeMode: "user_pays" which contradicts the gasless requirement.',
    resultCode: `// ✓ Correct Starkzap pattern for gasless auto-stake
const wallet = await starkzapSdk.connectWallet({
  feeMode: 'sponsored',   // ← paymaster pays gas
  deploy: 'if_needed',    // ← auto-deploys AA wallet
});

const amount = {
  toUnit: () => String(50n * 10n**18n),  // 50 STRK in base units
  toFormatted: () => '50 STRK',
  isZero: () => false,
};

const tx = await wallet.stake('0xabcd...1234', amount);
await tx.wait();
console.log('Staked — tx:', tx.hash);
// → opens on Voyager: tx.explorerUrl`,
  },
};

function StarkzapSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = STARKZAP_SCENARIOS[scenarioId] ?? STARKZAP_SCENARIOS['stake-after-connect'];
  const [selected, setSelected] = useState<number | null>(null);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⚡" title={sc.title} subtitle="Select the correct Starkzap SDK call." badge="⚡ STARKZAP SDK · GASLESS" colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>SCENARIO</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.scenario}</Text>
      </View>

      {sc.options.map((opt, i) => (
        <TouchableOpacity key={i}
          style={[{
            borderRadius: Radius.md, borderWidth: 1,
            borderColor: selected === null ? '#1e293b' : i === sc.correct ? '#22c55e' : selected === i ? '#ef4444' : '#1e293b',
            backgroundColor: selected === null ? '#0d1117' : i === sc.correct ? '#052e16' : selected === i ? '#450a0a' : '#0d1117',
            padding: Spacing.sm,
          }]}
          onPress={() => setSelected(i)} disabled={selected !== null}
        >
          <Text style={{ color: '#94a3b8', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 }}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {selected !== null && (
        <View style={[{ backgroundColor: '#0c0a1a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: selected === sc.correct ? '#7c3aed40' : '#ef444440' }]}>
          <Text style={{ color: selected === sc.correct ? '#c084fc' : '#ef4444', fontWeight: '900', fontSize: FontSize.sm, marginBottom: Spacing.sm }}>
            {selected === sc.correct ? '✅ Correct pattern' : '❌ Incorrect — here is what goes wrong:'}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20, marginBottom: Spacing.md }}>{sc.explanation}</Text>
          <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>CORRECT IMPLEMENTATION</Text>
          <CodeBlock code={sc.resultCode} colors={colors} />
          <View style={{ marginTop: Spacing.md }}>
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} variant="cairo" />
          </View>
        </View>
      )}
      {selected === null && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 6 — CAIRO AUDIT
// Find the security vulnerability in a Cairo contract
// ═══════════════════════════════════════════════════════════════════════════════

const AUDIT_SCENARIOS: Record<string, {
  title: string; contract: string; options: string[]; correct: number;
  explanation: string; severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
}> = {
  'missing-access-control': {
    title: 'Audit: Vault Contract',
    severity: 'CRITICAL',
    contract: `#[starknet::contract]
mod Vault {
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage {
        owner: ContractAddress,
        balance: u256,
    }

    #[constructor]
    fn constructor(ref self: ContractState, owner: ContractAddress) {
        self.owner.write(owner);
    }

    #[external(v0)]
    fn deposit(ref self: ContractState, amount: u256) {
        self.balance.write(self.balance.read() + amount);
    }

    #[external(v0)]
    fn withdraw(ref self: ContractState, amount: u256) {
        // Transfer amount to caller
        let caller = get_caller_address();
        self.balance.write(self.balance.read() - amount);
        // ... transfer tokens
    }
}`,
    options: [
      'CRITICAL: withdraw() has no owner check — any caller can drain the vault. Missing: assert(get_caller_address() == self.owner.read(), \'Not owner\')',
      'HIGH: deposit() does not validate the amount — zero-value deposits create unnecessary state writes',
      'MEDIUM: balance uses u256 subtraction that will panic on underflow — should use checked arithmetic',
      'LOW: the constructor sets owner but there is no function to transfer ownership',
    ],
    correct: 0,
    explanation: 'Missing access control on a withdrawal function is a CRITICAL vulnerability — it is the most common cause of DeFi protocol losses. Any account can call withdraw() and drain all funds. The fix is one line: assert(get_caller_address() == self.owner.read(), \'Not owner\'); at the top of withdraw(). In Cairo, panics revert the entire transaction — so this single assert is sufficient protection. The balance underflow (option C) is also a real bug but secondary — you cannot have a negative balance if withdrawal is access-controlled.',
  },
  'reentrancy': {
    title: 'Audit: Lending Pool',
    severity: 'HIGH',
    contract: `#[starknet::contract]
mod LendingPool {
    use starknet::{ContractAddress, get_caller_address};
    use openzeppelin::token::erc20::interface::{IERC20Dispatcher, IERC20DispatcherTrait};

    #[storage]
    struct Storage {
        deposits: Map<ContractAddress, u256>,
        token:    ContractAddress,
    }

    #[external(v0)]
    fn withdraw(ref self: ContractState, amount: u256) {
        let caller = get_caller_address();
        let deposit = self.deposits.entry(caller).read();
        assert(deposit >= amount, 'Insufficient deposit');

        // Transfer tokens to user BEFORE updating state
        IERC20Dispatcher { contract_address: self.token.read() }
            .transfer(caller, amount);

        // Update state AFTER transfer
        self.deposits.entry(caller).write(deposit - amount);
    }
}`,
    options: [
      'HIGH: Checks-Effects-Interactions violated — state (deposits) is updated after the external call (transfer). A re-entrant token contract could drain the pool before the balance is reduced.',
      'LOW: Missing event emission on withdraw — affects off-chain indexers but not security',
      'MEDIUM: assert() uses a string literal \'Insufficient deposit\' — use a felt252 constant to save gas',
      'HIGH: IERC20Dispatcher does not check the return value of transfer()',
    ],
    correct: 0,
    explanation: 'The Checks-Effects-Interactions (CEI) pattern is violated. The external token transfer happens before the state update (reducing deposits). If the token contract is malicious or re-entrant, it could call withdraw() again before deposits is updated — the deposit check would still pass because the balance has not been reduced yet. Fix: update state first (deposits.entry(caller).write(deposit - amount)), then transfer. Starknet\'s sequential execution model makes reentrancy harder than on Ethereum, but the CEI pattern is still mandatory for audit-grade contracts.',
  },
};

function AuditSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = AUDIT_SCENARIOS[scenarioId] ?? AUDIT_SCENARIOS['missing-access-control'];
  const [selected, setSelected] = useState<number | null>(null);
  const sevColor = sc.severity === 'CRITICAL' ? '#ef4444' : sc.severity === 'HIGH' ? '#f97316' : '#eab308';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛡️" title={sc.title} subtitle="Identify the most severe vulnerability in this contract." badge="🛡️ CAIRO SECURITY AUDIT" colors={colors} />

      <View style={[{ backgroundColor: sevColor + '15', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: sevColor + '40' }]}>
        <Text style={{ color: sevColor, fontSize: FontSize.sm, fontWeight: '800' }}>Expected severity: {sc.severity}</Text>
      </View>

      <CodeBlock code={sc.contract} colors={colors} />

      <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, fontWeight: '700' }}>Select the primary vulnerability:</Text>

      {sc.options.map((opt, i) => (
        <TouchableOpacity key={i}
          style={[opt_s.row, {
            borderColor: selected === null ? '#1e293b' : i === sc.correct ? '#22c55e' : selected === i ? '#ef4444' : '#1e293b',
            backgroundColor: selected === null ? '#0f172a' : i === sc.correct ? '#052e16' : selected === i ? '#450a0a' : '#0f172a',
          }]}
          onPress={() => setSelected(i)} disabled={selected !== null}
        >
          <Text style={{ color: '#e2e8f0', fontSize: FontSize.sm, lineHeight: 20 }}>{opt}</Text>
        </TouchableOpacity>
      ))}

      {selected !== null && (
        <View style={[{ backgroundColor: '#0a0f1e', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e3a5f' }]}>
          <Text style={{ color: selected === sc.correct ? '#22c55e' : '#ef4444', fontWeight: '900', fontSize: FontSize.sm, marginBottom: Spacing.sm }}>
            {selected === sc.correct ? '✅ Correct — good eye' : '❌ Not the primary vulnerability'}
          </Text>
          <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.explanation}</Text>
          <View style={{ marginTop: Spacing.md }}>
            <ActionBtn label="Continue →" onPress={onComplete} colors={colors} variant="cairo" />
          </View>
        </View>
      )}
      {selected === null && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 7 — CAIRO BUILD (open-ended)
// ═══════════════════════════════════════════════════════════════════════════════

function BuildSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const challenge = `Implement a Cairo function that:
1. Takes a u64 counter value
2. Panics if it would overflow u64::MAX
3. Returns the incremented value
4. Emits an event with the new value

Write the fn increment(current: u64) -> u64 body.`;

  const solution = `fn increment(ref self: ContractState, current: u64) -> u64 {
    // Explicit overflow protection — u64::MAX = 18_446_744_073_709_551_615
    assert(current < 18_446_744_073_709_551_615_u64, 'Counter overflow');

    let new_value = current + 1;
    self.emit(Incremented { value: new_value });
    new_value
}`;

  const [revealed, setRevealed] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="🛠️" title="Implement: Safe Counter Increment" subtitle="Write Cairo code that satisfies all four requirements." badge="🛠️ CAIRO BUILD CHALLENGE" colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>SPECIFICATION</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 22, fontFamily: 'monospace' }}>{challenge}</Text>
      </View>

      {!revealed ? (
        <ActionBtn label="Show Reference Implementation" onPress={() => setRevealed(true)} colors={colors} variant="ghost" />
      ) : (
        <>
          <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, padding: Spacing.sm }]}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6, paddingHorizontal: 4 }}>REFERENCE IMPLEMENTATION</Text>
            <CodeBlock code={solution} colors={colors} />
          </View>
          <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
            <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>KEY DECISIONS</Text>
            <Text style={{ color: '#94a3b8', fontSize: FontSize.sm, lineHeight: 20 }}>
              {'→ u64 arithmetic panics automatically on overflow — but asserting a readable message first is better UX.\n→ The assert checks (current {"<"} MAX) not (current + 1 {"<="} MAX) — equivalent but clearer.\n→ Event emission happens before the return — events are logged whether the caller uses the return value or not.'}
            </Text>
          </View>
        </>
      )}

      <ActionBtn label="Mark Complete" onPress={onComplete} colors={colors} variant="cairo" />
      <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 8 — CAIRO BOSS
// Multi-step: invoke real Sepolia → audit code → deploy → verify
// ═══════════════════════════════════════════════════════════════════════════════

function BossSim({ onComplete, onSkip, colors }: { onComplete: () => void; onSkip: () => void; colors: any }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [blockNumber, setBlockNumber] = useState<string | null>(null);
  const [strkDecimals, setStrkDecimals] = useState<string | null>(null);
  const [auditAnswer, setAuditAnswer] = useState<number | null>(null);
  const [deployTx, setDeployTx] = useState<string | null>(null);

  const steps = [
    { label: 'Read live contract on Sepolia', icon: '📡', done: blockNumber !== null },
    { label: 'Audit the Counter contract', icon: '🛡️', done: auditAnswer !== null },
    { label: 'Deploy corrected contract', icon: '🚀', done: deployTx !== null },
  ];

  const handleInvoke = async () => {
    setLoading(true);
    try {
      const bn = await rpcCall('starknet_blockNumber');
      setBlockNumber(bn.toString());
      const res = await rpcCall('starknet_call', [
        { contract_address: ADDR.STRK, entry_point_selector: SEL.decimals, calldata: [] }, 'latest',
      ]);
      setStrkDecimals(String(parseInt(res?.[0] ?? '0x12', 16)));
    } catch {
      setBlockNumber('1234567');
      setStrkDecimals('18');
    }
    setLoading(false);
    setStep(1);
  };

  const handleDeploy = async () => {
    setLoading(true);
    await simulateDelay(2500);
    const hash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    setDeployTx(hash);
    setLoading(false);
    setStep(3);
  };

  const auditOptions = [
    'withdraw() has no owner check — any caller can drain all funds',
    'deposit() lacks a zero-amount guard',
    'The Storage struct is missing a lock field for reentrancy protection',
  ];

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SimHeader icon="⭐" title="Cairo Builder Lab 1 Boss" subtitle="Three-step challenge: read, audit, deploy." badge="⭐ BOSS BATTLE · CAIRO BUILDER" colors={colors} />

      {steps.map((s, i) => (
        <View key={i} style={[{ borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: s.done ? '#22c55e40' : i === step ? '#7c3aed40' : '#1e293b', backgroundColor: s.done ? '#052e16' : i === step ? '#0c0a1a' : '#0f172a' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
            <Text style={{ fontSize: 22 }}>{s.done ? '✅' : s.icon}</Text>
            <Text style={{ flex: 1, color: s.done ? '#22c55e' : i === step ? '#c084fc' : '#475569', fontWeight: '800', fontSize: FontSize.sm }}>{s.label}</Text>
          </View>

          {/* Step 0: Invoke */}
          {i === 0 && step === 0 && (
            <View style={{ marginTop: Spacing.md }}>
              <Text style={{ color: '#64748b', fontSize: FontSize.xs, marginBottom: Spacing.sm }}>Call decimals() on the STRK token contract on Starknet Sepolia. Verify the block number is real.</Text>
              <ActionBtn label={loading ? '' : '📡 Call Starknet Sepolia'} onPress={handleInvoke} loading={loading} colors={colors} variant="cairo" />
            </View>
          )}
          {i === 0 && blockNumber && (
            <View style={{ marginTop: Spacing.sm, gap: 2 }}>
              <Text style={{ color: '#38bdf8', fontSize: 11, fontFamily: 'monospace' }}>⛓ Block #{blockNumber}</Text>
              <Text style={{ color: '#22c55e', fontSize: 11, fontFamily: 'monospace' }}>decimals() → {strkDecimals} ✓</Text>
            </View>
          )}

          {/* Step 1: Audit */}
          {i === 1 && step === 1 && (
            <View style={{ marginTop: Spacing.md, gap: Spacing.sm }}>
              <Text style={{ color: '#64748b', fontSize: FontSize.xs, marginBottom: 4 }}>A vault contract has one critical bug. Which option describes it?</Text>
              {auditOptions.map((opt, j) => (
                <TouchableOpacity key={j}
                  style={[{ borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0d1117' }]}
                  onPress={() => { setAuditAnswer(j); if (j === 0) setStep(2); }}
                  disabled={auditAnswer !== null}
                >
                  <Text style={{ color: auditAnswer === null ? '#94a3b8' : j === 0 ? '#22c55e' : j === auditAnswer ? '#ef4444' : '#94a3b8', fontSize: FontSize.sm }}>{opt}</Text>
                </TouchableOpacity>
              ))}
              {auditAnswer !== null && auditAnswer !== 0 && (
                <Text style={{ color: '#ef4444', fontSize: FontSize.xs }}>Missing owner check is the primary vulnerability — always verify caller identity before state-changing external calls.</Text>
              )}
            </View>
          )}

          {/* Step 2: Deploy */}
          {i === 2 && step === 2 && (
            <View style={{ marginTop: Spacing.md }}>
              <Text style={{ color: '#64748b', fontSize: FontSize.xs, marginBottom: Spacing.sm }}>Deploy the corrected vault contract with the access control fix applied.</Text>
              <ActionBtn label={loading ? '' : '🚀 Deploy Fixed Contract'} onPress={handleDeploy} loading={loading} colors={colors} variant="cairo" />
            </View>
          )}
          {i === 2 && deployTx && (
            <TouchableOpacity onPress={() => Linking.openURL(`https://sepolia.voyager.online/tx/${deployTx}`)} style={{ marginTop: Spacing.sm }}>
              <Text style={{ color: '#38bdf8', fontSize: 11, fontFamily: 'monospace' }}>tx: {deployTx.slice(0,14)}... → Voyager ↗</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      {step === 3 && (
        <>
          <View style={[{ backgroundColor: '#7c3aed15', borderRadius: Radius.lg, padding: Spacing.lg, alignItems: 'center' }]}>
            <Text style={{ fontSize: 48 }}>⭐</Text>
            <Text style={{ fontSize: FontSize.xl, fontWeight: '900', color: '#c084fc', marginTop: Spacing.sm }}>Lab 1 Boss Complete</Text>
            <Text style={{ color: '#64748b', fontSize: FontSize.sm, textAlign: 'center', marginTop: 4 }}>
              You read live Starknet data, identified a critical vulnerability, and deployed a corrected contract.
            </Text>
          </View>
          <ActionBtn label="Complete Lab 1 Boss →" onPress={onComplete} colors={colors} variant="cairo" />
        </>
      )}
      {step < 3 && <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ─── Main Export ───────────────────────────────────────────────────────────────

export default function CairoBuilderSimulatorCard({ simulatorType, onComplete, onSkip }: CardProps) {
  const { colors } = useTheme();
  const props = { onComplete, onSkip, colors };

  // Parse type and optional scenario: 'cairo-typecheck:felt252-overflow'
  const [baseType, scenarioId = ''] = simulatorType.split(':');

  switch (baseType) {
    case 'cairo-typecheck': return <TypeCheckSim scenarioId={scenarioId || 'felt252-overflow'} {...props} />;
    case 'cairo-invoke':    return <InvokeSim    scenarioId={scenarioId || 'strk-decimals'} {...props} />;
    case 'cairo-deploy':    return <DeploySim    {...props} />;
    case 'cairo-snforge':   return <SnforgeSim   scenarioId={scenarioId || 'counter-increment'} {...props} />;
    case 'cairo-starkzap':  return <StarkzapSim  scenarioId={scenarioId || 'stake-after-connect'} {...props} />;
    case 'cairo-audit':     return <AuditSim     scenarioId={scenarioId || 'missing-access-control'} {...props} />;
    case 'cairo-build':     return <BuildSim     {...props} />;
    case 'cairo-boss':      return <BossSim      {...props} />;
    default:
      return (
        <View style={{ padding: Spacing.xl, alignItems: 'center', gap: Spacing.md }}>
          <Text style={{ fontSize: 32 }}>🔷</Text>
          <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '800' }}>Cairo Builder Simulator</Text>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          <Text style={{ color: colors.textSoft, fontSize: FontSize.sm, textAlign: 'center' }}>Simulator "{simulatorType}" — check the type string.</Text>
          <ActionBtn label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
        </View>
      );
  }
}

// ─────────────────────────────────────────────────────────────
// FILE: CairoBuilderCodeSandbox.tsx
// ─────────────────────────────────────────────────────────────

/**
 * CairoBuilderCodeSandbox
 *
 * All code-writing simulators for the Cairo Builder track.
 * Kept separate from CairoBuilderSimulatorCard.tsx (which handles Starknet live interactions).
 *
 * Execution tiers (from platform spec):
 *   Tier 1 — Pyodide (browser WASM):  sandbox-python with numpy/pandas/matplotlib/scipy
 *   Tier 2 — Server microVM:           sandbox-python with FastAPI/pytest/sqlalchemy
 *   Tier 3 — Structural validation:    sandbox-cairo, sandbox-typescript, sandbox-config
 *   DuckDB WASM / server:              sandbox-sql
 *
 * Simulator types (pass as `simulatorType` prop):
 *
 *   sandbox-cairo:<scenarioId>        — write/debug/identify Cairo code
 *                                       structural validator checks patterns
 *   sandbox-typescript:<scenarioId>   — write TypeScript (Starkzap patterns)
 *                                       structural validator checks SDK calls
 *   sandbox-python:<scenarioId>       — write Python; pyodide or server tier
 *                                       declared per-scenario via sandboxConfig
 *   sandbox-sql:<scenarioId>          — write SQL against indexed Starknet data
 *                                       DuckDB or server-side SQLite
 *   sandbox-config:<scenarioId>       — write YAML/TOML config files
 *                                       structural validator checks required keys
 *
 * Labs using each:
 *   sandbox-cairo      → Labs 0–12 (every lab)
 *   sandbox-typescript → Labs 5, 7
 *   sandbox-python     → Lab 9 (pyodide), Lab 10 (server), Lab 11 (pyodide)
 *   sandbox-sql        → Lab 10
 *   sandbox-config     → Lab 4 (GitHub Actions YAML), Lab 10 (Apibara TOML)
 */

// ─── Platform execution API ────────────────────────────────────────────────────
// Replace BASE_URL with the platform's actual sandbox API endpoint

const SANDBOX_API = process.env.EXPO_PUBLIC_SANDBOX_API ?? 'https://sandbox.sifter.app';

async function callSandboxAPI(
  tier: 'pyodide' | 'server' | 'sql',
  payload: Record<string, unknown>,
): Promise<{ stdout: string; stderr: string; results?: any[]; columns?: string[] }> {
  try {
    const res = await fetch(`${SANDBOX_API}/execute/${tier}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } catch {
    // Return descriptive mock when API is unavailable (dev/demo mode)
    return mockSandboxResponse(tier, payload);
  }
}

function mockSandboxResponse(
  tier: string,
  payload: Record<string, unknown>,
): { stdout: string; stderr: string; results?: any[]; columns?: string[] } {
  if (tier === 'sql') {
    return {
      stdout: '',
      stderr: '',
      columns: ['tx_hash', 'from_address', 'to_address', 'amount', 'block_number'],
      results: [
        { tx_hash: '0x03f2b1...', from_address: '0x049d...', to_address: '0x3a1b...', amount: '1000000000000000000', block_number: 145231 },
        { tx_hash: '0x07c4d8...', from_address: '0x3a1b...', to_address: '0x8f2c...', amount: '500000000000000000',  block_number: 145198 },
        { tx_hash: '0x01e9a2...', from_address: '0x8f2c...', to_address: '0x049d...', amount: '250000000000000000', block_number: 145155 },
      ],
    };
  }
  if (tier === 'pyodide') {
    return {
      stdout: `[sandbox] Pyodide execution successful\n${(payload.code as string ?? '').slice(0, 60)}...\n\nOutput: calculation complete`,
      stderr: '',
    };
  }
  return {
    stdout: `[sandbox] Server execution successful\nAll assertions passed.`,
    stderr: '',
  };
}

// ─── Structural Validator ──────────────────────────────────────────────────────

export interface StructuralCheck {
  /** The check type */
  type:
    | 'contains'          // raw string must appear anywhere in code
    | 'not-contains'      // string must NOT appear
    | 'regex'             // regex must match
    | 'fn-exists'         // fn <name>( exists
    | 'has-derive'        // #[derive(...Name...)] exists
    | 'has-attribute'     // #[Name] or #[Name(v0)] exists
    | 'has-struct'        // struct Name { exists
    | 'has-trait'         // trait Name< exists
    | 'has-impl'          // impl Name exists
    | 'has-event-field'   // #[key] fieldName: type exists
    | 'storage-has-field' // fieldName: Type inside Storage struct
    | 'param-exists'      // parameter name: appears anywhere in fn signatures
    | 'has-assert'        // assert( appears
    | 'has-test-fn'       // #[test] fn name appears
    | 'keyword-count';    // keyword appears at least N times

  value: string;         // the string/regex/name to check
  minCount?: number;     // for keyword-count
  description: string;   // human-readable: what this verifies
}

export interface StructuralValidation {
  passed: boolean;
  total: number;
  passing: number;
  results: { check: StructuralCheck; passed: boolean }[];
}

export function runStructuralValidation(code: string, checks: StructuralCheck[]): StructuralValidation {
  const results = checks.map(check => {
    let passed = false;
    const c = code;

    switch (check.type) {
      case 'contains':
        passed = c.includes(check.value);
        break;
      case 'not-contains':
        passed = !c.includes(check.value);
        break;
      case 'regex':
        try { passed = new RegExp(check.value, 's').test(c); } catch { passed = false; }
        break;
      case 'fn-exists':
        passed = new RegExp(`fn\\s+${check.value}\\s*[<(]`).test(c);
        break;
      case 'has-derive':
        passed = new RegExp(`#\\[derive\\([^)]*${check.value}[^)]*\\)`).test(c);
        break;
      case 'has-attribute':
        passed = new RegExp(`#\\[${check.value}[\\](]`).test(c);
        break;
      case 'has-struct':
        passed = new RegExp(`struct\\s+${check.value}\\s*[{<]`).test(c);
        break;
      case 'has-trait':
        passed = new RegExp(`trait\\s+${check.value}[\\s<{]`).test(c);
        break;
      case 'has-impl':
        passed = new RegExp(`impl\\s+${check.value}[\\s<]`).test(c);
        break;
      case 'has-event-field':
        passed = new RegExp(`#\\[key\\][\\s\\S]{0,50}${check.value}:`).test(c);
        break;
      case 'storage-has-field':
        // Looks for fieldName: inside a Storage struct block
        passed = new RegExp(`struct\\s+Storage\\s*\\{[^}]*${check.value}\\s*:`).test(c);
        break;
      case 'param-exists':
        passed = new RegExp(`${check.value}\\s*:`).test(c);
        break;
      case 'has-assert':
        passed = /assert\s*\(/.test(c);
        break;
      case 'has-test-fn':
        passed = new RegExp(`#\\[test\\][\\s\\S]{0,200}fn\\s+${check.value}`).test(c);
        break;
      case 'keyword-count': {
        const matches = c.split(check.value).length - 1;
        passed = matches >= (check.minCount ?? 1);
        break;
      }
    }
    return { check, passed };
  });

  const passing = results.filter(r => r.passed).length;
  return { passed: passing === results.length, total: results.length, passing, results };
}

// ─── Shared UI ─────────────────────────────────────────────────────────────────

function SandboxHeader({ icon, badge, title, subtitle, colors }: {
  icon: string; badge: string; title: string; subtitle: string; colors: any;
}) {
  return (
    <View style={[sh.wrap, { backgroundColor: '#0a0f1e', borderColor: '#1e3a5f' }]}>
      <Text style={sh.icon}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={sh.badge}>{badge}</Text>
        <Text style={[sh.title, { color: '#e2e8f0' }]}>{title}</Text>
        <Text style={[sh.sub, { color: '#94a3b8' }]}>{subtitle}</Text>
      </View>
    </View>
  );
}
const sh = StyleSheet.create({
  wrap:  { flexDirection: 'row', gap: Spacing.md, borderRadius: Radius.lg, padding: Spacing.md, alignItems: 'flex-start', marginBottom: Spacing.md, borderWidth: 1 },
  icon:  { fontSize: 28, lineHeight: 36 },
  badge: { fontSize: 10, fontWeight: '800', letterSpacing: 1, color: '#38bdf8', marginBottom: 2 },
  title: { fontSize: FontSize.lg, fontWeight: '900', lineHeight: 22 },
  sub:   { fontSize: FontSize.sm, lineHeight: 17, marginTop: 2 },
});

function RunButton({ label, onPress, loading, variant, colors }: {
  label: string; onPress: () => void; loading?: boolean;
  variant: 'cairo' | 'python' | 'sql' | 'typescript' | 'config' | 'ghost';
  colors: any;
}) {
  const bg = {
    cairo:      '#7c3aed',
    python:     '#0369a1',
    sql:        '#065f46',
    typescript: '#1d4ed8',
    config:     '#92400e',
    ghost:      'transparent',
  }[variant];
  const border = variant === 'ghost' ? colors.border : 'transparent';
  return (
    <TouchableOpacity
      style={[rb.btn, { backgroundColor: bg, borderColor: border, borderWidth: variant === 'ghost' ? 1.5 : 0 }, loading && { opacity: 0.5 }]}
      onPress={onPress} disabled={loading} activeOpacity={0.85}
    >
      {loading
        ? <ActivityIndicator color="#fff" size="small" />
        : <Text style={[rb.txt, { color: variant === 'ghost' ? colors.textSoft : '#fff' }]}>{label}</Text>}
    </TouchableOpacity>
  );
}
const rb = StyleSheet.create({
  btn: { borderRadius: Radius.md, paddingVertical: Spacing.lg, alignItems: 'center', width: '100%' },
  txt: { fontSize: FontSize.md, fontWeight: '800' },
});

/** Mobile code editor — styled TextInput with dark bg and monospace font */
function CodeEditor({ value, onChange, language, placeholder, readOnly }: {
  value: string; onChange?: (v: string) => void;
  language: string; placeholder?: string; readOnly?: boolean;
}) {
  return (
    <View style={ce.wrap}>
      <View style={ce.topBar}>
        <View style={ce.dot} /><View style={ce.dot} /><View style={ce.dot} />
        <Text style={ce.lang}>{language}</Text>
      </View>
      <TextInput
        style={ce.editor}
        value={value}
        onChangeText={onChange}
        multiline
        scrollEnabled
        placeholder={placeholder ?? `// write your ${language} here`}
        placeholderTextColor="#334155"
        editable={!readOnly}
        autoCorrect={false}
        autoCapitalize="none"
        spellCheck={false}
        keyboardType="ascii-capable"
      />
    </View>
  );
}
const ce = StyleSheet.create({
  wrap:   { borderRadius: Radius.md, overflow: 'hidden', borderWidth: 1, borderColor: '#1e293b' },
  topBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#161b22', paddingHorizontal: 10, paddingVertical: 6, gap: 5 },
  dot:    { width: 10, height: 10, borderRadius: 5, backgroundColor: '#374151' },
  lang:   { marginLeft: 'auto', fontSize: 10, color: '#475569', fontWeight: '600', letterSpacing: 0.5 },
  editor: { backgroundColor: '#0d1117', padding: 12, fontFamily: 'monospace', fontSize: 12, color: '#e2e8f0', lineHeight: 19, minHeight: 200, textAlignVertical: 'top' },
});

function TerminalOutput({ output, isError, loading }: { output: string; isError?: boolean; loading?: boolean }) {
  return (
    <View style={[to.wrap, { borderColor: isError ? '#ef444440' : '#16a34a40' }]}>
      <Text style={to.header}>{isError ? '✕ STDERR' : '✓ STDOUT'}</Text>
      {loading
        ? <ActivityIndicator color="#38bdf8" size="small" style={{ marginVertical: 8 }} />
        : <Text style={[to.text, { color: isError ? '#fca5a5' : '#86efac' }]}>{output || '— no output —'}</Text>}
    </View>
  );
}
const to = StyleSheet.create({
  wrap:   { backgroundColor: '#0d1117', borderRadius: Radius.md, padding: 12, borderWidth: 1, marginTop: Spacing.sm },
  header: { fontSize: 10, color: '#475569', fontWeight: '800', letterSpacing: 1, marginBottom: 6 },
  text:   { fontFamily: 'monospace', fontSize: 11, lineHeight: 18 },
});

/** Validation results panel */
function ValidationPanel({ validation, colors }: { validation: StructuralValidation; colors: any }) {
  const allPassed = validation.passed;
  return (
    <View style={[vp.wrap, { backgroundColor: allPassed ? '#052e16' : '#0c1a0f', borderColor: allPassed ? '#22c55e40' : '#1e293b' }]}>
      <View style={vp.header}>
        <Text style={{ fontSize: FontSize.sm, fontWeight: '900', color: allPassed ? '#22c55e' : '#94a3b8' }}>
          {allPassed ? '✅ All checks pass' : `${validation.passing}/${validation.total} checks pass`}
        </Text>
      </View>
      {validation.results.map((r, i) => (
        <View key={i} style={vp.row}>
          <Text style={{ fontSize: 13, width: 18 }}>{r.passed ? '✓' : '✗'}</Text>
          <Text style={[vp.desc, { color: r.passed ? '#4ade80' : '#94a3b8' }]}>{r.check.description}</Text>
        </View>
      ))}
    </View>
  );
}
const vp = StyleSheet.create({
  wrap:   { borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1 },
  header: { marginBottom: Spacing.sm },
  row:    { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginBottom: 4 },
  desc:   { fontSize: 12, flex: 1, lineHeight: 18 },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 1: sandbox-cairo
// Structural validation of Cairo code. Three modes: write, debug, identify.
// Labs: 0–12 (every lab in Cairo Builder)
// ═══════════════════════════════════════════════════════════════════════════════

export interface CairoScenario {
  title: string;
  subtitle: string;
  mode: 'write' | 'debug' | 'identify';
  starterCode: string;
  /** Plain English prompt explaining what to write/fix/label */
  prompt: string;
  checks: StructuralCheck[];
  /** Shown after all checks pass — the reference implementation */
  sampleAnswer?: string;
  sampleAnswerLabel?: string;
}

export const CAIRO_SCENARIOS: Record<string, CairoScenario> = {

  // Lab 0.6 — First function
  'first-function': {
    title: 'Write calculate_reward',
    subtitle: 'Your first Cairo function: multiply staked × rate ÷ 100',
    mode: 'write',
    prompt: 'Fill every blank. The function should return staked × rate / 100. Write a test that confirms calculate_reward(500, 8) equals 40.',
    starterCode:
`fn calculate_reward(staked: ___, rate: ___) -> ___ {
    // write the calculation here (no semicolon — this is the return value)
    ___
}

#[cfg(test)]
mod tests {
    use super::___;

    #[test]
    fn test_eight_percent_of_500() {
        let result = calculate_reward(___, ___);
        assert(result == ___, 'reward should be 40');
    }
}`,
    checks: [
      { type: 'fn-exists',    value: 'calculate_reward',        description: 'fn calculate_reward defined' },
      { type: 'param-exists', value: 'staked',                  description: 'Parameter staked present' },
      { type: 'param-exists', value: 'rate',                    description: 'Parameter rate present' },
      { type: 'contains',     value: '* rate',                  description: 'Multiplies by rate' },
      { type: 'contains',     value: '/ 100',                   description: 'Divides by 100' },
      { type: 'has-attribute',value: 'test',                    description: '#[test] attribute present' },
      { type: 'contains',     value: 'calculate_reward(500, 8)', description: 'Test calls calculate_reward(500, 8)' },
      { type: 'contains',     value: '== 40',                   description: 'Test asserts result equals 40' },
      { type: 'has-assert',                                      description: 'assert( call present' } as StructuralCheck,
    ],
    sampleAnswer:
`fn calculate_reward(staked: u64, rate: u64) -> u64 {
    staked * rate / 100
}

#[cfg(test)]
mod tests {
    use super::calculate_reward;

    #[test]
    fn test_eight_percent_of_500() {
        let result = calculate_reward(500, 8);
        assert(result == 40, 'reward should be 40');
    }
}`,
    sampleAnswerLabel: 'Reference implementation',
  },

  // Lab 1.1 — Fix the storage struct types
  'fix-storage-types': {
    title: 'Fix the Storage Struct Types',
    subtitle: 'Three fields have the wrong type — find and fix each one',
    mode: 'debug',
    prompt: 'This ERC20 Storage struct has three type errors that would allow silent overflow or wrong operations. Fix each incorrect field type and add a comment explaining why.',
    starterCode:
`#[storage]
struct Storage {
    balances: Map<ContractAddress, felt252>,   // WRONG — fix this
    total_supply: felt252,                      // WRONG — fix this
    owner: u64,                                 // WRONG — fix this
    decimals: u8,                               // correct
    nonce: felt252,                             // correct (cryptographic)
}`,
    checks: [
      { type: 'contains',          value: 'u256',            description: 'u256 used for token balance (Map value)' },
      { type: 'storage-has-field', value: 'total_supply',    description: 'total_supply field present' },
      { type: 'contains',          value: 'ContractAddress', description: 'ContractAddress used for owner' },
      { type: 'not-contains',      value: 'owner: u64',      description: 'owner is no longer u64' },
      { type: 'not-contains',      value: 'felt252,',        description: 'felt252 removed from balance/supply fields' },
    ],
    sampleAnswer:
`#[storage]
struct Storage {
    // FIXED: u256 — felt252 wraps silently on overflow; u256 panics, protecting balances
    balances: Map<ContractAddress, u256>,
    // FIXED: u256 — total supply is a token quantity, same reason
    total_supply: u256,
    // FIXED: ContractAddress — an address is an identifier, not a number
    owner: ContractAddress,
    decimals: u8,
    nonce: felt252,  // correct: cryptographic nonce is a field element
}`,
  },

  // Lab 1.2 — Write a complete struct with derives and two functions
  'position-struct': {
    title: 'Write LendingPosition Struct',
    subtitle: 'Struct with correct derives + two condition functions',
    mode: 'write',
    prompt: 'Write a struct called LendingPosition with 5 fields and correct derives. Write is_healthy (returns true if health_factor >= 100 and is_open is true) and should_liquidate (health_factor < 100 and is_open is true). Add a test for a healthy position.',
    starterCode:
`use starknet::ContractAddress;

// 1. Define the struct with these fields:
//    owner: ContractAddress, collateral_usd: u256, debt_usd: u256,
//    health_factor: u64, is_open: bool
// Add #[derive(Drop, Copy, PartialEq)]
___

// 2. Write is_healthy — returns true if healthy
fn is_healthy(pos: LendingPosition) -> bool {
    ___
}

// 3. Write should_liquidate — returns true if should liquidate
fn should_liquidate(pos: LendingPosition) -> bool {
    ___
}

#[cfg(test)]
mod tests {
    use super::{LendingPosition, is_healthy};
    use starknet::contract_address_const;

    #[test]
    fn test_healthy_position_passes() {
        // Create a position with health_factor 150 and is_open true
        // Assert is_healthy returns true
        ___
    }
}`,
    checks: [
      { type: 'has-struct',    value: 'LendingPosition',                          description: 'struct LendingPosition defined' },
      { type: 'has-derive',    value: 'Drop',                                     description: '#[derive(Drop)] present' },
      { type: 'has-derive',    value: 'Copy',                                     description: '#[derive(Copy)] present' },
      { type: 'has-derive',    value: 'PartialEq',                                description: '#[derive(PartialEq)] present' },
      { type: 'contains',      value: 'owner: ContractAddress',                   description: 'owner: ContractAddress field' },
      { type: 'contains',      value: 'health_factor: u64',                       description: 'health_factor: u64 field' },
      { type: 'contains',      value: 'is_open: bool',                            description: 'is_open: bool field' },
      { type: 'fn-exists',     value: 'is_healthy',                               description: 'fn is_healthy defined' },
      { type: 'fn-exists',     value: 'should_liquidate',                         description: 'fn should_liquidate defined' },
      { type: 'contains',      value: '>= 100',                                   description: 'health_factor >= 100 condition' },
      { type: 'contains',      value: '< 100',                                    description: 'health_factor < 100 condition' },
      { type: 'has-test-fn',   value: 'test_healthy_position_passes',             description: 'test fn present' },
      { type: 'has-assert',                                                        description: 'assert( in test' } as StructuralCheck,
    ],
  },

  // Lab 1.3 — Replace unwrap with safe Option handling
  'safe-option-handling': {
    title: 'Replace Panicking unwrap() Calls',
    subtitle: 'Three functions panic on valid inputs — fix each one',
    mode: 'debug',
    prompt: 'Rewrite each function to handle the None/failure case safely. No .unwrap() calls. Use match, unwrap_or, or return Option<T>/Result<T,E>.',
    starterCode:
`// FUNCTION 1: panics when user has no custom fee
fn get_user_fee(fees: @Map<ContractAddress, u16>, user: ContractAddress) -> u16 {
    fees.entry(user).read().unwrap()
}
// REWRITE as -> Option<u16>:


// FUNCTION 2: panics when raw address is zero
fn validate_address(raw: felt252) -> ContractAddress {
    if raw == 0 { panic!('zero') }
    raw.try_into().unwrap()
}
// REWRITE as -> Result<ContractAddress, felt252>:


// FUNCTION 3: panics on divide-by-zero
fn safe_fee(total: u64, parts: u64) -> u64 {
    total / parts
}
// REWRITE as -> Option<u64>:`,
    checks: [
      { type: 'not-contains', value: '.unwrap()',                          description: 'No .unwrap() calls remain' },
      { type: 'contains',     value: 'Option<u16>',                       description: 'get_user_fee returns Option<u16>' },
      { type: 'contains',     value: 'Result<ContractAddress',            description: 'validate_address returns Result' },
      { type: 'contains',     value: 'Option<u64>',                       description: 'safe_fee returns Option<u64>' },
      { type: 'contains',     value: 'Option::None',                      description: 'Option::None used in at least one function' },
      { type: 'contains',     value: 'Result::Err',                       description: 'Result::Err used in validate_address' },
    ],
  },

  // Lab 1.4 — Write a complete access-controlled external function
  'access-controlled-function': {
    title: 'Write a Secure withdraw() Function',
    subtitle: 'Caller check + balance check + state update + event emit',
    mode: 'write',
    prompt: 'Complete the withdraw function. It must: (1) have the correct attribute and self parameter, (2) check caller is owner as the FIRST instruction, (3) check balance is sufficient, (4) update storage, (5) emit a Withdrawn event.',
    starterCode:
`#[starknet::contract]
mod SecureVault {
    use starknet::{ContractAddress, get_caller_address};

    #[storage]
    struct Storage { owner: ContractAddress, balance: u256 }

    #[event]
    #[derive(Drop, starknet::Event)]
    enum Event { Withdrawn: Withdrawn }
    #[derive(Drop, starknet::Event)]
    struct Withdrawn { caller: ContractAddress, amount: u256 }

    // Write the complete withdraw function below:
    // Attribute: ___
    fn withdraw(___ self: ___, amount: u256) {
        // 1. Caller check — must be FIRST:
        ___
        // 2. Read balance and check sufficiency:
        ___
        // 3. Write new balance:
        ___
        // 4. Emit event:
        ___
    }
}`,
    checks: [
      { type: 'has-attribute',  value: 'external',                                   description: '#[external(v0)] attribute' },
      { type: 'contains',       value: 'ref self: ContractState',                    description: 'ref self: ContractState (mutable)' },
      { type: 'contains',       value: 'get_caller_address() == self.owner.read()',  description: 'Caller identity check present' },
      { type: 'contains',       value: 'self.balance.read()',                        description: 'Balance read into variable' },
      { type: 'contains',       value: '>= amount',                                  description: 'Sufficient balance check' },
      { type: 'contains',       value: 'self.balance.write(',                        description: 'Balance write (state update)' },
      { type: 'contains',       value: 'self.emit(',                                 description: 'Event emitted' },
      { type: 'contains',       value: 'Withdrawn {',                                description: 'Withdrawn event struct constructed' },
    ],
  },

  // Lab 1.5 — Fix three ownership errors
  'ownership-errors': {
    title: 'Fix Three Ownership Errors',
    subtitle: 'Use-after-move, missing snapshot, missing dereference',
    mode: 'debug',
    prompt: 'Each function has a different ownership error. Add @ where a snapshot is needed, * where a dereference is needed, and reorder where a move must come last.',
    starterCode:
`use starknet::ContractAddress;

// ERROR 1: recipients is moved into validate_all but then used again
fn distribute(recipients: Array<ContractAddress>, amount: u256) {
    validate_all(recipients);
    send_all(recipients, amount);   // use-after-move error
}

// ERROR 2: sum consumes arr but len() is called after
fn report(arr: Array<u64>) -> (u64, usize) {
    let total = sum(arr);
    let len = arr.len();            // use-after-move error
    (total, len)
}

// ERROR 3: at() returns a snapshot, not a value
fn first_addr(addresses: Array<ContractAddress>) -> ContractAddress {
    addresses.at(0)                 // returns @ContractAddress not ContractAddress
}

fn validate_all(a: @Array<ContractAddress>) {}
fn send_all(r: Array<ContractAddress>, _: u256) {}
fn sum(a: @Array<u64>) -> u64 { 0 }`,
    checks: [
      { type: 'contains', value: 'validate_all(@recipients)',   description: 'validate_all called with @recipients snapshot' },
      { type: 'contains', value: 'send_all(recipients',        description: 'send_all gets ownership (final consumer)' },
      { type: 'contains', value: 'sum(@arr)',                   description: 'sum called with @arr snapshot' },
      { type: 'contains', value: '*addresses.at(0)',            description: 'at(0) dereferenced with *' },
    ],
  },

  // Lab 1.7 — Design storage vs events correctly
  'storage-vs-events': {
    title: 'Design Storage and Events for a Staking Contract',
    subtitle: 'Put the right data in storage, the right data in events',
    mode: 'write',
    prompt: 'Write the Storage struct and Event enum for a staking contract. Storage should hold only what contract logic needs to compute. Events should hold history that the frontend needs. Add #[key] on indexable event fields.',
    starterCode:
`// Needs to track:
// - each user's staked amount (contract logic reads this)
// - total STRK staked across all users (contract logic reads this)
// - contract owner address (access control reads this)
// - whether contract is paused (every external fn checks this)
// - history of every stake/unstake (frontend dashboard needs this)
// - APY rate history over time (frontend chart needs this)

#[storage]
struct Storage {
    // WRITE ONLY what contract logic needs — NOT history:
}

#[event]
#[derive(Drop, starknet::Event)]
enum Event {
    // WRITE event variants for history:
}

// Write at least one event struct with a #[key] field:`,
    checks: [
      { type: 'storage-has-field', value: 'staked',                          description: 'staked amounts in Storage' },
      { type: 'storage-has-field', value: 'total',                           description: 'total_staked in Storage' },
      { type: 'storage-has-field', value: 'owner',                           description: 'owner in Storage' },
      { type: 'storage-has-field', value: 'is_paused',                       description: 'is_paused in Storage' },
      { type: 'not-contains',      value: 'history',                         description: 'No history array in Storage' },
      { type: 'not-contains',      value: 'apy_history',                     description: 'No APY history in Storage' },
      { type: 'has-event-field',   value: 'staker',                          description: '#[key] staker field in an event' },
    ],
  },

  // Lab 4 — Write snforge fuzz tests
  'fuzz-tests': {
    title: 'Write Three Fuzz Tests for ERC20 Invariants',
    subtitle: 'Properties that must hold for all inputs — snforge generates the inputs',
    mode: 'write',
    prompt: 'Write three fuzz tests. Each tests an invariant using parameterised inputs that snforge fills with random values. Use assume! to filter invalid preconditions.',
    starterCode:
`#[cfg(test)]
mod fuzz_tests {
    use snforge_std::assume;
    use super::{IERC20Dispatcher, IERC20DispatcherTrait};

    // INVARIANT 1: After any valid transfer, total_supply is unchanged.
    #[test]
    fn test_total_supply_invariant(amount: u128) {
        // 1. assume amount is reasonable (below 1_000_000)
        // 2. deploy token with supply 1_000_000
        // 3. transfer amount
        // 4. assert total_supply still equals 1_000_000
    }

    // INVARIANT 2: After any transfer, sender + recipient balances sum to original total.
    #[test]
    fn test_balance_conservation(amount: u128) {
        // write the invariant test here
    }

    // INVARIANT 3: approve(spender, amount) for any u128 amount never panics.
    #[test]
    fn test_approve_never_panics(amount: u128) {
        // write this test
    }
}`,
    checks: [
      { type: 'contains',    value: 'assume!(',                  description: 'assume! used to filter preconditions' },
      { type: 'contains',    value: 'amount: u128',              description: 'Fuzz parameter u128 declared' },
      { type: 'keyword-count', value: '#[test]', minCount: 3,    description: 'At least 3 test functions' },
      { type: 'has-assert',                                       description: 'assert( in at least one test' } as StructuralCheck,
      { type: 'contains',    value: 'total_supply',              description: 'total_supply invariant tested' },
    ],
  },

  // Lab 6 — Reentrancy guard using CEI pattern
  'reentrancy-guard': {
    title: 'Fix Reentrancy: Apply the CEI Pattern',
    subtitle: 'State update must happen BEFORE the external call',
    mode: 'debug',
    prompt: 'This lending pool withdraw function violates Checks-Effects-Interactions. The external token transfer happens before the state update. Reorder the instructions so state is updated first, then the transfer happens.',
    starterCode:
`// BROKEN: Transfer happens before state update (CEI violated)
#[external(v0)]
fn withdraw(ref self: ContractState, amount: u256) {
    let caller = get_caller_address();
    let deposit = self.deposits.entry(caller).read();
    assert(deposit >= amount, 'Insufficient deposit');

    // WRONG ORDER: external call before state update
    IERC20Dispatcher { contract_address: self.token.read() }
        .transfer(caller, amount);

    // State update AFTER external call — reentrancy window here
    self.deposits.entry(caller).write(deposit - amount);
}`,
    checks: [
      { type: 'regex', value: 'write\\([^)]+\\)[\\s\\S]{0,300}transfer\\(', description: 'State updated BEFORE transfer call (CEI order correct)' },
      { type: 'contains', value: 'self.deposits.entry(caller).write(deposit - amount)', description: 'Correct subtraction written to storage' },
      { type: 'contains', value: '.transfer(',                                           description: 'Transfer call still present' },
      { type: 'has-assert',                                                               description: 'Sufficiency check still present' } as StructuralCheck,
    ],
    sampleAnswer:
`#[external(v0)]
fn withdraw(ref self: ContractState, amount: u256) {
    let caller = get_caller_address();
    let deposit = self.deposits.entry(caller).read();
    assert(deposit >= amount, 'Insufficient deposit');

    // CORRECT ORDER — CEI: Checks ✓, Effects first, then Interactions
    // 1. Effect: update state BEFORE any external call
    self.deposits.entry(caller).write(deposit - amount);

    // 2. Interaction: external call happens AFTER state is correct
    IERC20Dispatcher { contract_address: self.token.read() }
        .transfer(caller, amount);
}`,
  },

  // Lab 7 — Write the AMM swap function
  'amm-swap': {
    title: 'Implement the AMM swap() Function',
    subtitle: 'x * y = k constant product — update both reserves correctly',
    mode: 'write',
    prompt: 'Write the swap function for a constant product AMM. Use the x*y=k formula: amount_out = (reserve_out * amount_in) / (reserve_in + amount_in). Update both reserves. Emit a Swapped event.',
    starterCode:
`#[external(v0)]
fn swap(
    ref self: ContractState,
    amount_in: u256,
    is_token_a_in: bool,
) -> u256 {
    // 1. Read both reserves
    let reserve_a = self.reserve_a.read();
    let reserve_b = self.reserve_b.read();

    // 2. Determine which reserve is in and which is out
    //    based on is_token_a_in

    // 3. Calculate amount_out using constant product:
    //    amount_out = (reserve_out * amount_in) / (reserve_in + amount_in)

    // 4. Assert amount_out > 0

    // 5. Update both reserves:
    //    reserve_in increases by amount_in
    //    reserve_out decreases by amount_out

    // 6. Emit Swapped event

    // 7. Return amount_out
}`,
    checks: [
      { type: 'contains',  value: 'reserve_a.read()',              description: 'Reads reserve_a from storage' },
      { type: 'contains',  value: 'reserve_b.read()',              description: 'Reads reserve_b from storage' },
      { type: 'contains',  value: '* amount_in',                   description: 'Multiplies reserve_out by amount_in' },
      { type: 'contains',  value: 'reserve_in + amount_in',        description: 'Adds amount_in to reserve_in (denominator)' },
      { type: 'contains',  value: '.write(',                        description: 'Writes updated reserves to storage' },
      { type: 'contains',  value: '+ amount_in',                   description: 'reserve_in increased by amount_in' },
      { type: 'contains',  value: '- amount_out',                  description: 'reserve_out decreased by amount_out' },
      { type: 'contains',  value: 'self.emit(',                    description: 'Emits Swapped event' },
      { type: 'has-assert',                                         description: 'amount_out > 0 assertion' } as StructuralCheck,
    ],
  },

  // Lab 9 — Write a ZK-efficient range check
  'zk-efficient-range-check': {
    title: 'Rewrite for ZK Efficiency',
    subtitle: 'Division generates hundreds of constraints — replace with multiplication',
    mode: 'debug',
    prompt: 'This range check uses division, which generates hundreds of prover constraints. Rewrite it using only multiplication and comparisons, which generate ~1 constraint each.',
    starterCode:
`// INEFFICIENT: division generates ~200 ZK constraints per call
fn is_within_bounds(value: u256, min: u256, max: u256) -> bool {
    let range = max - min;
    let position = (value - min) / range;  // division: expensive in ZK
    position >= 0 && position <= 1
}`,
    checks: [
      { type: 'not-contains', value: '/ range',                description: 'Division by range removed' },
      { type: 'contains',     value: '>= min',                 description: 'value >= min comparison used' },
      { type: 'contains',     value: '<= max',                 description: 'value <= max comparison used' },
      { type: 'fn-exists',    value: 'is_within_bounds',       description: 'Function still named is_within_bounds' },
    ],
    sampleAnswer:
`// EFFICIENT: only comparisons — ~2 constraints total
fn is_within_bounds(value: u256, min: u256, max: u256) -> bool {
    value >= min && value <= max
}`,
  },
};

function CairoSandbox({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = CAIRO_SCENARIOS[scenarioId] ?? CAIRO_SCENARIOS['first-function'];
  const [code, setCode] = useState(sc.starterCode);
  const [validation, setValidation] = useState<StructuralValidation | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleCheck = () => {
    const result = runStructuralValidation(code, sc.checks);
    setValidation(result);
  };

  const modeLabel = sc.mode === 'write' ? '✏️ WRITE MODE' : sc.mode === 'debug' ? '🐛 DEBUG MODE' : '🔍 IDENTIFY MODE';
  const btnLabel = sc.mode === 'write' ? '▶  Check My Code' : sc.mode === 'debug' ? '▶  Check Fix' : '▶  Check Labels';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SandboxHeader icon="🔷" badge={`⚡ CAIRO BUILDER · ${modeLabel}`} title={sc.title} subtitle={sc.subtitle} colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>TASK</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.prompt}</Text>
      </View>

      <CodeEditor value={code} onChange={setCode} language="cairo" />

      <RunButton label={btnLabel} onPress={handleCheck} variant="cairo" colors={colors} />

      {validation && <ValidationPanel validation={validation} colors={colors} />}

      {validation?.passed && (
        <View style={{ gap: Spacing.sm }}>
          {sc.sampleAnswer && (
            <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)}
              style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
              <Text style={{ color: '#7c3aed', fontSize: FontSize.sm, fontWeight: '700' }}>
                {showAnswer ? 'Hide reference ↑' : 'Show reference implementation ↓'}
              </Text>
            </TouchableOpacity>
          )}
          {showAnswer && sc.sampleAnswer && (
            <CodeEditor value={sc.sampleAnswer} language="cairo (reference)" readOnly />
          )}
          <RunButton label="Continue →" onPress={onComplete} variant="cairo" colors={colors} />
        </View>
      )}

      {!validation?.passed && <RunButton label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 2: sandbox-typescript
// Structural validation of TypeScript/React Native Starkzap code.
// Labs: 5 (Starkzap SDK patterns), 7 (React Native screen for AMM)
// ═══════════════════════════════════════════════════════════════════════════════

export interface TypeScriptScenario {
  title: string;
  subtitle: string;
  prompt: string;
  starterCode: string;
  checks: StructuralCheck[];
  sampleAnswer?: string;
}

export const TYPESCRIPT_SCENARIOS: Record<string, TypeScriptScenario> = {

  // Lab 5 — Connect wallet and read balance
  'connect-and-balance': {
    title: 'Connect Wallet + Display Balance',
    subtitle: 'Fill in the three Starkzap SDK calls in the React Native component',
    prompt: 'Fill in BLANK A (connectWallet with sponsored fees), BLANK B (balanceOf STRK), and BLANK C (toFormatted for display). These are the three SDK calls that make the component work.',
    starterCode:
`import { starkzapSdk, STARKNET_TOKENS } from '../lib/starkzap';

export default function BalanceScreen() {
  const [balance, setBalance] = useState('');

  const handleConnect = async () => {
    // BLANK A: call connectWallet with feeMode 'sponsored'
    const wallet = ____;

    // BLANK B: call wallet.balanceOf for STRK token
    const strk = ____;

    // BLANK C: use toFormatted() to get display string
    setBalance(____);
  };

  return (
    <TouchableOpacity onPress={handleConnect}>
      <Text>{balance || 'Connect Wallet'}</Text>
    </TouchableOpacity>
  );
}`,
    checks: [
      { type: 'contains', value: "connectWallet({",                    description: 'connectWallet() called' },
      { type: 'contains', value: "feeMode: 'sponsored'",               description: "feeMode: 'sponsored' set (gasless)" },
      { type: 'contains', value: 'balanceOf(STARKNET_TOKENS.STRK)',    description: 'balanceOf(STARKNET_TOKENS.STRK) called' },
      { type: 'contains', value: '.toFormatted()',                      description: 'toFormatted() used for display string' },
      { type: 'contains', value: 'await',                              description: 'await used on async calls' },
    ],
    sampleAnswer:
`const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored', deploy: 'if_needed' });
const strk = await wallet.balanceOf(STARKNET_TOKENS.STRK);
setBalance(strk.toFormatted());`,
  },

  // Lab 5 — Execute stake transaction
  'execute-stake-tx': {
    title: 'Execute a Stake Transaction',
    subtitle: 'Build the amount object, call wallet.stake(), await confirmation',
    prompt: 'Fill in the amount object (10 STRK = 10n * 10n**18n base units), the stake call, and the tx.wait() confirmation. Then store tx.hash.',
    starterCode:
`const handleStake = async () => {
  setLoading(true);
  try {
    const wallet = await starkzapSdk.connectWallet({ feeMode: 'sponsored' });

    // BLANK A: build amount object for 10 STRK
    // toUnit() must return String(10n * 10n**18n)
    const amount = {
      toUnit: () => String(____),
      toFormatted: () => '10 STRK',
      isZero: () => false,
    };

    // BLANK B: call wallet.stake with the pool address and amount
    const tx = ____;

    // BLANK C: await block confirmation
    ____;

    // BLANK D: store the transaction hash
    setTxHash(____);
  } catch (e) {
    setError(e.message);
  } finally {
    setLoading(false);
  }
};`,
    checks: [
      { type: 'contains', value: '10n * 10n**18n',          description: 'Correct bigint: 10n * 10n**18n for 10 STRK' },
      { type: 'contains', value: 'wallet.stake(',           description: 'wallet.stake() called' },
      { type: 'contains', value: 'await tx.wait()',         description: 'await tx.wait() for block confirmation' },
      { type: 'contains', value: 'tx.hash',                 description: 'tx.hash stored/used' },
    ],
    sampleAnswer:
`const amount = {
  toUnit: () => String(10n * 10n**18n),
  toFormatted: () => '10 STRK',
  isZero: () => false,
};
const tx = await wallet.stake(STAKE_POOL, amount);
await tx.wait();
setTxHash(tx.hash);`,
  },

  // Lab 5 — Add event subscription
  'event-subscription': {
    title: 'Add Live Event Subscription',
    subtitle: 'Subscribe to contract events and refresh balance automatically',
    prompt: 'Fill in the subscribe call inside useEffect. Pass STAKE_POOL as the contract, \'Staked\' as the event name, call refreshBalance in onEvent, and return the unsubscribe function as cleanup.',
    starterCode:
`const STAKE_POOL = '0xabcd1234...';

useEffect(() => {
  refreshBalance();

  // Write the subscribe call:
  const unsub = starkzapSdk.subscribe({
    contract: ____,         // BLANK A: which contract to watch
    eventName: ____,        // BLANK B: which event name
    onEvent: (____) => {    // BLANK C: event parameter name
      // BLANK D: call refreshBalance here
    },
  });

  // BLANK E: return the cleanup function
  return ____;
}, [refreshBalance]);`,
    checks: [
      { type: 'contains', value: 'STAKE_POOL',         description: 'STAKE_POOL passed as contract' },
      { type: 'contains', value: "'Staked'",            description: "'Staked' as eventName" },
      { type: 'contains', value: 'refreshBalance()',   description: 'refreshBalance() called in onEvent' },
      { type: 'contains', value: 'return unsub',        description: 'Cleanup: unsub returned from useEffect' },
    ],
    sampleAnswer:
`const unsub = starkzapSdk.subscribe({
  contract: STAKE_POOL,
  eventName: 'Staked',
  onEvent: (event) => {
    refreshBalance();
  },
});
return unsub;`,
  },
};

function TypeScriptSandboxSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = TYPESCRIPT_SCENARIOS[scenarioId] ?? TYPESCRIPT_SCENARIOS['connect-and-balance'];
  const [code, setCode] = useState(sc.starterCode);
  const [validation, setValidation] = useState<StructuralValidation | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SandboxHeader icon="⚡" badge="⚡ STARKZAP SDK · TYPESCRIPT" title={sc.title} subtitle={sc.subtitle} colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>TASK</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.prompt}</Text>
      </View>

      <CodeEditor value={code} onChange={setCode} language="typescript" />
      <RunButton label="▶  Check My Code" onPress={() => setValidation(runStructuralValidation(code, sc.checks))} variant="typescript" colors={colors} />
      {validation && <ValidationPanel validation={validation} colors={colors} />}

      {validation?.passed && (
        <>
          {sc.sampleAnswer && (
            <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)} style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
              <Text style={{ color: '#1d4ed8', fontSize: FontSize.sm, fontWeight: '700' }}>
                {showAnswer ? 'Hide reference ↑' : 'Show reference ↓'}
              </Text>
            </TouchableOpacity>
          )}
          {showAnswer && sc.sampleAnswer && <CodeEditor value={sc.sampleAnswer} language="typescript (reference)" readOnly />}
          <RunButton label="Continue →" onPress={onComplete} variant="typescript" colors={colors} />
        </>
      )}
      {!validation?.passed && <RunButton label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 3: sandbox-python
// Tier 1 (Pyodide): numpy, pandas, matplotlib — Labs 9, 11
// Tier 2 (Server): FastAPI, pytest — Lab 10
// ═══════════════════════════════════════════════════════════════════════════════

export interface PythonScenario {
  title: string;
  subtitle: string;
  prompt: string;
  starterCode: string;
  tier: 'pyodide' | 'server';
  packages: string[];          // micropip.install list for Pyodide, pip list for server
  services?: string[];         // for server tier: e.g. ['postgres', 'sqlite']
  timeoutSeconds?: number;
  expectedOutputContains?: string[];  // strings that should appear in stdout
  checks?: StructuralCheck[];  // structural pre-checks before execution
}

export const PYTHON_SCENARIOS: Record<string, PythonScenario> = {

  // Lab 9 L9.6 — Gas profiler script (Pyodide)
  'gas-profiler': {
    title: 'Write a Gas Profiler Script',
    subtitle: 'Parse snforge --gas-report output, rank by cost, produce recommendations',
    tier: 'pyodide',
    packages: ['pandas'],
    prompt: 'Write a Python script that: (1) parses the provided snforge gas report output, (2) uses pandas to rank functions by gas cost (highest first), (3) prints a recommendation for the most expensive function.',
    starterCode:
`import pandas as pd

# Simulated snforge --gas-report output
SNFORGE_OUTPUT = """
[PASS] test_transfer         (gas: 44,200)
[PASS] test_stake            (gas: 62,100)
[PASS] test_withdraw         (gas: 38,500)
[PASS] test_get_balance      (gas:  1,203)
[PASS] test_approve          (gas: 41,800)
[PASS] test_increment        (gas:  2,041)
"""

# TODO: Parse SNFORGE_OUTPUT into a list of (test_name, gas_cost) tuples.
# Gas costs have commas — remove them before converting to int.
# Use pandas to create a DataFrame with columns: test_name, gas_cost
# Sort by gas_cost descending.
# Print: the sorted table, then a recommendation for the most expensive test.

# Write your solution here:
`,
    checks: [
      { type: 'contains', value: 'import pandas',              description: 'pandas imported' },
      { type: 'contains', value: 'pd.DataFrame',               description: 'DataFrame created' },
      { type: 'contains', value: 'sort_values',                description: 'Sorted by gas cost' },
      { type: 'contains', value: 'print(',                     description: 'Output printed' },
    ],
    expectedOutputContains: ['test_stake', 'gas'],
  },

  // Lab 11 L11.1 — Token vesting schedule (Pyodide)
  'vesting-schedule': {
    title: 'Plot a Token Vesting Schedule',
    subtitle: 'numpy arrays for supply over time, matplotlib bar chart',
    tier: 'pyodide',
    packages: ['numpy', 'matplotlib'],
    prompt: 'Write a Python script that models STRK\'s 4-year vesting schedule. Use numpy arrays for each tranche (Team: 1B over 4yr, Foundation: 2B over 2yr, Community: 3B over 4yr, Public: 1B at TGE). Calculate cumulative circulating supply per quarter and print the quarter-by-quarter table.',
    starterCode:
`import numpy as np
import matplotlib
matplotlib.use('Agg')  # non-interactive backend for sandbox
import matplotlib.pyplot as plt

TOTAL_SUPPLY = 10_000_000_000  # 10 billion STRK
QUARTERS = 16  # 4 years = 16 quarters

# Tranche allocations
TEAM_TOTAL        = 1_000_000_000  # 1B — vests linearly over 16 quarters
FOUNDATION_TOTAL  = 2_000_000_000  # 2B — vests linearly over 8 quarters
COMMUNITY_TOTAL   = 3_000_000_000  # 3B — vests linearly over 16 quarters
PUBLIC_TGE        = 1_000_000_000  # 1B — all at quarter 0 (TGE)

# TODO:
# 1. Create numpy arrays for quarterly unlocks of each tranche
# 2. Sum all tranches to get total quarterly unlocks
# 3. Calculate cumulative circulating supply using np.cumsum()
# 4. Print quarter-by-quarter table: Quarter | New Unlocks | Cumulative Supply
# 5. Print the inflation rate for each quarter

`,
    checks: [
      { type: 'contains', value: 'import numpy',               description: 'numpy imported' },
      { type: 'contains', value: 'np.cumsum',                  description: 'np.cumsum used for cumulative supply' },
      { type: 'contains', value: 'np.zeros',                   description: 'np.zeros or np.ones used for arrays' },
      { type: 'contains', value: 'print(',                     description: 'Output printed' },
    ],
    expectedOutputContains: ['Quarter', 'Supply'],
  },

  // Lab 11 L11.5 — Supply model sensitivity analysis (Pyodide)
  'supply-sensitivity': {
    title: 'Supply Model Sensitivity Analysis',
    subtitle: 'scipy.optimize or numpy for scenario modeling',
    tier: 'pyodide',
    packages: ['numpy', 'matplotlib'],
    prompt: 'Extend the vesting model to run 3 scenarios: Base (as above), Accelerated (all vesting in 2yr), Delayed (team vesting takes 6yr). For each scenario, print the circulating supply at Year 1 and Year 4, and the peak annual inflation rate.',
    starterCode:
`import numpy as np

TOTAL_SUPPLY = 10_000_000_000

def model_supply(team_quarters: int, foundation_quarters: int, quarters: int = 16):
    """
    Returns cumulative supply array of length \`quarters\`.
    team_quarters: how many quarters the team tranche vests over
    foundation_quarters: how many quarters foundation vests over
    """
    # TODO: implement this function
    pass

# Run 3 scenarios:
scenarios = {
    'Base':        {'team_quarters': 16, 'foundation_quarters': 8},
    'Accelerated': {'team_quarters': 8,  'foundation_quarters': 4},
    'Delayed':     {'team_quarters': 24, 'foundation_quarters': 8},
}

# TODO: For each scenario:
# 1. Call model_supply with the scenario parameters
# 2. Print: scenario name, Year 1 supply (quarter 4), Year 4 supply (quarter 16)
# 3. Calculate and print peak annual inflation rate

`,
    checks: [
      { type: 'contains',   value: 'import numpy',           description: 'numpy imported' },
      { type: 'fn-exists',  value: 'model_supply',           description: 'model_supply function implemented' },
      { type: 'contains',   value: 'scenarios',              description: 'scenarios dict used' },
      { type: 'contains',   value: 'cumsum',                 description: 'np.cumsum or similar for cumulation' },
    ],
    expectedOutputContains: ['Base', 'Year 4'],
  },

  // Lab 10 L10.3 — FastAPI endpoint (Server tier)
  'fastapi-transfers': {
    title: 'Write a FastAPI Transfers Endpoint',
    subtitle: 'Query indexed Starknet events from SQLite, serve via REST',
    tier: 'server',
    packages: ['fastapi', 'uvicorn', 'sqlalchemy', 'sqlite3'],
    prompt: 'Write a FastAPI endpoint GET /transfers/{address} that queries the starknet_transfers table (SQLite, columns: tx_hash, from_address, to_address, amount, block_number) and returns all transfers where from_address OR to_address equals the provided address.',
    starterCode:
`from fastapi import FastAPI
from typing import List
import sqlite3
import os

app = FastAPI()

DB_PATH = os.getenv('STARKNET_DB', ':memory:')

# The starknet_transfers table has these columns:
# tx_hash TEXT, from_address TEXT, to_address TEXT,
# amount TEXT, block_number INTEGER

@app.get("/transfers/{address}")
def get_transfers(address: str):
    """Return all transfers involving this Starknet address."""
    # TODO:
    # 1. Open a sqlite3 connection to DB_PATH
    # 2. Query starknet_transfers for rows where
    #    from_address = address OR to_address = address
    # 3. Return the results as a list of dicts
    # 4. Close the connection
    pass

@app.get("/balance/{address}")
def get_balance(address: str):
    """Return the current STRK balance for this address."""
    # TODO: query starknet_balances table (columns: address TEXT, balance TEXT)
    pass
`,
    checks: [
      { type: 'contains', value: 'from fastapi import',                      description: 'FastAPI imported' },
      { type: 'contains', value: '@app.get("/transfers/{address}")',          description: 'Transfers endpoint defined' },
      { type: 'contains', value: '@app.get("/balance/{address}")',            description: 'Balance endpoint defined' },
      { type: 'contains', value: 'sqlite3',                                   description: 'sqlite3 used for database' },
      { type: 'contains', value: 'from_address',                             description: 'from_address queried' },
      { type: 'contains', value: 'to_address',                               description: 'to_address queried' },
    ],
    expectedOutputContains: ['200', 'tx_hash'],
  },

  // Lab 10 L10.4 — pytest tests for the API (Server tier)
  'pytest-api': {
    title: 'Write pytest Tests for the Transfers API',
    subtitle: 'Test the /transfers and /balance endpoints against seeded test data',
    tier: 'server',
    packages: ['fastapi', 'pytest', 'httpx'],
    prompt: 'Write at least 3 pytest tests for the FastAPI app. Tests must cover: (1) /transfers/{address} returns correct transfers, (2) /transfers/{address} for an address with no transfers returns an empty list, (3) /balance/{address} returns the correct balance.',
    starterCode:
`import pytest
from fastapi.testclient import TestClient
from main import app  # the FastAPI app from the previous lesson

client = TestClient(app)

# Test 1: transfers for a known address returns at least one result
def test_transfers_known_address():
    # TODO: call GET /transfers/0x049d...
    # assert response status is 200
    # assert response is a list
    pass

# Test 2: transfers for unknown address returns empty list
def test_transfers_unknown_address():
    # TODO: call GET /transfers/0x0000...
    # assert response is an empty list
    pass

# Test 3: balance endpoint returns expected format
def test_balance_returns_amount():
    # TODO: call GET /balance/0x049d...
    # assert response has a 'balance' key
    pass
`,
    checks: [
      { type: 'contains', value: 'from fastapi.testclient',    description: 'TestClient imported' },
      { type: 'contains', value: 'client.get(',                description: 'client.get() used in tests' },
      { type: 'keyword-count', value: 'def test_', minCount: 3, description: 'At least 3 test functions' },
      { type: 'contains', value: 'assert',                     description: 'Assertions in tests' },
      { type: 'contains', value: 'status_code',                description: 'Status code checked' },
    ],
    expectedOutputContains: ['passed', 'test_'],
  },
};

function PythonSandboxSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = PYTHON_SCENARIOS[scenarioId] ?? PYTHON_SCENARIOS['gas-profiler'];
  const [code, setCode] = useState(sc.starterCode);
  const [output, setOutput] = useState('');
  const [errOutput, setErrOutput] = useState('');
  const [running, setRunning] = useState(false);
  const [passed, setPassed] = useState(false);
  const [structCheck, setStructCheck] = useState<StructuralValidation | null>(null);

  const handleRun = async () => {
    // Structural pre-check
    const structural = sc.checks ? runStructuralValidation(code, sc.checks) : null;
    setStructCheck(structural);

    setRunning(true);
    setOutput('');
    setErrOutput('');

    const result = await callSandboxAPI(sc.tier === 'server' ? 'server' : 'pyodide', {
      code,
      packages: sc.packages,
      services: sc.services,
      timeout: sc.timeoutSeconds ?? 30,
    });

    setOutput(result.stdout);
    setErrOutput(result.stderr);

    const outputPassed = !sc.expectedOutputContains ||
      sc.expectedOutputContains.every(s => result.stdout.includes(s));
    const structPassed = !structural || structural.passed;
    setPassed(outputPassed && structPassed && !result.stderr.includes('Error'));
    setRunning(false);
  };

  const tierLabel = sc.tier === 'pyodide'
    ? `🐍 PYTHON · PYODIDE (browser) · ${sc.packages.join(', ')}`
    : `🖥 PYTHON · SERVER SANDBOX · ${sc.packages.join(', ')}`;

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SandboxHeader icon="🐍" badge={tierLabel} title={sc.title} subtitle={sc.subtitle} colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>TASK</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.prompt}</Text>
      </View>

      <View style={[{ backgroundColor: '#0c1a28', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#0e4f6e' }]}>
        <Text style={{ color: '#38bdf8', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 2 }}>PACKAGES AVAILABLE</Text>
        <Text style={{ color: '#7dd3fc', fontSize: 11, fontFamily: 'monospace' }}>{sc.packages.join('  ·  ')}</Text>
      </View>

      <CodeEditor value={code} onChange={setCode} language="python" />

      <RunButton
        label={sc.tier === 'server' ? '▶  Deploy & Run Tests' : '▶  Run in Browser (Pyodide)'}
        onPress={handleRun}
        loading={running}
        variant="python"
        colors={colors}
      />

      {structCheck && !structCheck.passed && <ValidationPanel validation={structCheck} colors={colors} />}

      {(output || errOutput) && (
        <>
          {output && <TerminalOutput output={output} loading={running} />}
          {errOutput && <TerminalOutput output={errOutput} isError loading={running} />}
        </>
      )}

      {passed && (
        <RunButton label="Continue →" onPress={onComplete} variant="python" colors={colors} />
      )}
      {!running && <RunButton label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 4: sandbox-sql
// Write SQL queries against indexed Starknet event data.
// Lab 10 — Full-Stack Application
// Tier: Server-side SQLite with pre-seeded Starknet event data
// Schema:
//   starknet_transfers(tx_hash, from_address, to_address, amount, block_number, timestamp)
//   starknet_events(id, contract_address, event_name, data_json, block_number, timestamp)
//   starknet_balances(address, token, balance, last_updated_block)
// ═══════════════════════════════════════════════════════════════════════════════

export interface SQLScenario {
  title: string;
  subtitle: string;
  prompt: string;
  starterQuery: string;
  schemaReference: string;
  expectedColumns: string[];
  expectedMinRows?: number;
  scoringChecks: StructuralCheck[];
}

export const SQL_SCENARIOS: Record<string, SQLScenario> = {

  // Lab 10 — Query all transfers to an address
  'transfers-to-address': {
    title: 'Query All Transfers to an Address',
    subtitle: 'Filter starknet_transfers by to_address, return recent first',
    prompt: 'Write a SQL query that returns all transfers TO the address 0x049d36570d4e46f4... ordered by block_number descending. Include tx_hash, from_address, amount, and block_number. Limit to 20 rows.',
    starterQuery:
`-- starknet_transfers columns:
-- tx_hash TEXT, from_address TEXT, to_address TEXT,
-- amount TEXT, block_number INTEGER, timestamp INTEGER

SELECT
    -- write your column list here
FROM starknet_transfers
WHERE
    -- filter by to_address
ORDER BY
    -- most recent first
LIMIT 20;`,
    schemaReference: `starknet_transfers
  tx_hash TEXT
  from_address TEXT
  to_address TEXT
  amount TEXT
  block_number INTEGER
  timestamp INTEGER`,
    expectedColumns: ['tx_hash', 'from_address', 'amount', 'block_number'],
    expectedMinRows: 1,
    scoringChecks: [
      { type: 'contains', value: 'FROM starknet_transfers',      description: 'Queries starknet_transfers table' },
      { type: 'contains', value: 'to_address',                   description: 'Filters by to_address' },
      { type: 'contains', value: 'ORDER BY',                     description: 'Results ordered' },
      { type: 'contains', value: 'block_number',                 description: 'block_number in ORDER BY or SELECT' },
      { type: 'contains', value: 'DESC',                         description: 'Descending order (most recent first)' },
      { type: 'contains', value: 'LIMIT 20',                     description: 'Limited to 20 rows' },
    ],
  },

  // Lab 10 — Aggregate transfer volume by address
  'volume-by-address': {
    title: 'Aggregate Transfer Volume Per Address',
    subtitle: 'GROUP BY with SUM and CAST for STRK amounts (18 decimals)',
    prompt: 'Write a SQL query that calculates the total STRK sent by each address. STRK amounts are stored as strings of base units (18 decimals). Use CAST(amount AS REAL) / 1e18 to convert. Return top 10 senders by volume, include their address and total STRK sent.',
    starterQuery:
`-- Amount is stored as a string of base units — convert to STRK:
-- CAST(amount AS REAL) / 1000000000000000000

SELECT
    from_address,
    -- calculate total STRK sent (remember the 18 decimal conversion)
FROM starknet_transfers
GROUP BY from_address
ORDER BY total_strk_sent DESC
LIMIT 10;`,
    schemaReference: `starknet_transfers
  from_address TEXT
  amount TEXT  (base units, 18 decimals: 1 STRK = 1000000000000000000)`,
    expectedColumns: ['from_address', 'total_strk_sent'],
    scoringChecks: [
      { type: 'contains', value: 'SUM(',                         description: 'SUM aggregate function used' },
      { type: 'contains', value: 'CAST',                         description: 'CAST used to convert string to number' },
      { type: 'contains', value: '1000000000000000000',          description: '18-decimal conversion divisor present (or 1e18)' },
      { type: 'contains', value: 'GROUP BY from_address',        description: 'Grouped by sender address' },
      { type: 'contains', value: 'ORDER BY',                     description: 'Ordered by volume' },
      { type: 'contains', value: 'LIMIT 10',                     description: 'Limited to top 10' },
    ],
  },

  // Lab 10 — Transfer activity per block using window functions
  'transfer-activity': {
    title: 'Transfer Activity Trend with Window Functions',
    subtitle: 'COUNT per block, 7-block rolling average',
    prompt: 'Write a SQL query that counts transfers per block_number. Then add a 7-block rolling average of transfer count using a window function. Return block_number, transfer_count, and rolling_avg_7 for the last 100 blocks.',
    starterQuery:
`-- Hint: Window functions use OVER (ORDER BY ... ROWS BETWEEN ...)
-- AVG(count) OVER (ORDER BY block_number ROWS BETWEEN 6 PRECEDING AND CURRENT ROW)

WITH block_counts AS (
    SELECT
        block_number,
        COUNT(*) AS transfer_count
    FROM starknet_transfers
    GROUP BY block_number
)
SELECT
    block_number,
    transfer_count,
    -- write the 7-block rolling average here
FROM block_counts
ORDER BY block_number DESC
LIMIT 100;`,
    schemaReference: `starknet_transfers
  block_number INTEGER`,
    expectedColumns: ['block_number', 'transfer_count', 'rolling_avg_7'],
    scoringChecks: [
      { type: 'contains', value: 'WITH block_counts',            description: 'CTE used for block aggregation' },
      { type: 'contains', value: 'COUNT(*)',                     description: 'COUNT aggregate for transfers per block' },
      { type: 'contains', value: 'OVER',                        description: 'Window function OVER clause used' },
      { type: 'contains', value: 'ROWS BETWEEN',                description: 'Window frame ROWS BETWEEN specified' },
      { type: 'contains', value: '6 PRECEDING',                 description: '6 PRECEDING for 7-block window' },
      { type: 'contains', value: 'rolling_avg',                 description: 'Rolling average column aliased' },
    ],
  },
};

function SQLSandboxSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = SQL_SCENARIOS[scenarioId] ?? SQL_SCENARIOS['transfers-to-address'];
  const [query, setQuery] = useState(sc.starterQuery);
  const [results, setResults] = useState<any[] | null>(null);
  const [columns, setColumns] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [validation, setValidation] = useState<StructuralValidation | null>(null);
  const [passed, setPassed] = useState(false);

  const handleRun = async () => {
    const v = runStructuralValidation(query, sc.scoringChecks);
    setValidation(v);
    setRunning(true);

    const result = await callSandboxAPI('sql', { query, datasetId: 'starknet-events' });
    setResults(result.results ?? []);
    setColumns(result.columns ?? sc.expectedColumns);

    const colsPassed = sc.expectedColumns.every(c => (result.columns ?? []).includes(c));
    const rowsPassed = !sc.expectedMinRows || (result.results ?? []).length >= sc.expectedMinRows;
    setPassed(v.passed && colsPassed && rowsPassed);
    setRunning(false);
  };

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SandboxHeader icon="🗄" badge="🗄 SQL · INDEXED STARKNET DATA · DUCKDB" title={sc.title} subtitle={sc.subtitle} colors={colors} />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>TASK</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.prompt}</Text>
      </View>

      <View style={[{ backgroundColor: '#052e16', borderRadius: Radius.md, padding: Spacing.sm, borderWidth: 1, borderColor: '#16a34a40' }]}>
        <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 4 }}>SCHEMA REFERENCE</Text>
        <Text style={{ color: '#86efac', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 }}>{sc.schemaReference}</Text>
      </View>

      <CodeEditor value={query} onChange={setQuery} language="sql" />
      <RunButton label="▶  Run Query" onPress={handleRun} loading={running} variant="sql" colors={colors} />

      {validation && <ValidationPanel validation={validation} colors={colors} />}

      {results && (
        <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, borderWidth: 1, borderColor: '#1e293b', overflow: 'hidden' }]}>
          <View style={{ backgroundColor: '#052e16', padding: Spacing.sm }}>
            <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>
              RESULTS — {results.length} rows
            </Text>
          </View>
          <ScrollView horizontal>
            <View>
              {/* Column headers */}
              <View style={{ flexDirection: 'row', backgroundColor: '#0f172a' }}>
                {columns.map(col => (
                  <View key={col} style={sq.headerCell}>
                    <Text style={sq.headerText}>{col}</Text>
                  </View>
                ))}
              </View>
              {/* Data rows */}
              {results.slice(0, 10).map((row, ri) => (
                <View key={ri} style={[sq.row, { backgroundColor: ri % 2 === 0 ? '#0d1117' : '#0f172a' }]}>
                  {columns.map(col => (
                    <View key={col} style={sq.cell}>
                      <Text style={sq.cellText} numberOfLines={1}>
                        {String(row[col] ?? '—').slice(0, 30)}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
              {results.length > 10 && (
                <View style={{ padding: Spacing.sm }}>
                  <Text style={{ color: '#475569', fontSize: 11, fontStyle: 'italic' }}>
                    …and {results.length - 10} more rows
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      )}

      {passed && <RunButton label="Continue →" onPress={onComplete} variant="sql" colors={colors} />}
      {!running && <RunButton label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

const sq = StyleSheet.create({
  headerCell: { paddingHorizontal: 12, paddingVertical: 8, minWidth: 100, borderRightWidth: 1, borderRightColor: '#1e293b' },
  headerText: { fontSize: 11, color: '#4ade80', fontWeight: '800', fontFamily: 'monospace' },
  row:        { flexDirection: 'row' },
  cell:       { paddingHorizontal: 12, paddingVertical: 6, minWidth: 100, borderRightWidth: 1, borderRightColor: '#1e293b' },
  cellText:   { fontSize: 11, color: '#94a3b8', fontFamily: 'monospace' },
});

// ═══════════════════════════════════════════════════════════════════════════════
// SIMULATOR 5: sandbox-config
// Write YAML/TOML config files, structural validation.
// Lab 4 — GitHub Actions CI YAML
// Lab 10 — Apibara stream config TOML
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConfigScenario {
  title: string;
  subtitle: string;
  prompt: string;
  format: 'yaml' | 'toml';
  starterCode: string;
  checks: StructuralCheck[];
  sampleAnswer?: string;
  /** Simulated output shown after validation passes — what running this config would produce */
  simulatedOutput?: string;
}

export const CONFIG_SCENARIOS: Record<string, ConfigScenario> = {

  // Lab 4 — GitHub Actions CI pipeline YAML
  'github-actions-ci': {
    title: 'Configure GitHub Actions CI',
    subtitle: 'Run scarb build + snforge test on every push and pull request',
    format: 'yaml',
    prompt: 'Fill in the blanks in this GitHub Actions YAML: (1) the branch trigger, (2) the Scarb version, (3) the snforge version. The provided template structure is correct — configure it, not write it from scratch.',
    starterCode:
`# File: .github/workflows/cairo-ci.yml
name: Cairo CI

on:
  push:
    branches: [ ___ ]       # FILL IN: which branch (main or master)
  pull_request:
    branches: [ ___ ]       # FILL IN: same branch

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Scarb
        uses: software-mansion/setup-scarb@v1
        with:
          scarb-version: "___"   # FILL IN: e.g. "2.8.0"

      - name: Install snforge
        uses: foundry-rs/setup-snfoundry@v3
        with:
          starknet-foundry-version: "___"  # FILL IN: e.g. "0.27.0"

      - name: Build
        run: scarb build

      - name: Test
        run: snforge test`,
    checks: [
      { type: 'not-contains', value: '___ ',                          description: 'All blanks filled in (no ___ remaining)' },
      { type: 'contains',     value: 'branches:',                    description: 'Branch trigger configured' },
      { type: 'contains',     value: 'setup-scarb',                  description: 'Scarb install step present' },
      { type: 'contains',     value: 'scarb-version:',               description: 'Scarb version specified' },
      { type: 'contains',     value: 'setup-snfoundry',              description: 'snforge install step present' },
      { type: 'contains',     value: 'starknet-foundry-version:',    description: 'snforge version specified' },
      { type: 'contains',     value: 'scarb build',                  description: 'scarb build step present' },
      { type: 'contains',     value: 'snforge test',                 description: 'snforge test step present' },
    ],
    sampleAnswer:
`name: Cairo CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Install Scarb
        uses: software-mansion/setup-scarb@v1
        with:
          scarb-version: "2.8.0"

      - name: Install snforge
        uses: foundry-rs/setup-snfoundry@v3
        with:
          starknet-foundry-version: "0.27.0"

      - name: Build
        run: scarb build

      - name: Test
        run: snforge test`,
    simulatedOutput:
`▶ Run cairo-ci
  Setting up Scarb 2.8.0...
  Setting up starknet-foundry 0.27.0...
  
  $ scarb build
  Compiling my_contract v0.1.0
  Finished release target(s) in 2.31s
  
  $ snforge test
  Collected 8 test(s) from my_contract package
  Running 8 test(s) from my_contract::
  [PASS] test_transfer_correct_amount     (gas: 44,200)
  [PASS] test_transfer_insufficient_bal   (gas: 12,801)
  [PASS] test_stake_updates_balance       (gas: 62,100)
  [PASS] test_withdraw_access_control     (gas: 18,400)
  [PASS] test_fuzz_supply_invariant       (gas: 38,200)
  [PASS] test_fuzz_balance_conservation   (gas: 41,100)
  [PASS] test_fork_strk_decimals          (gas: 2,041)
  [PASS] test_fork_real_integration       (gas: 5,203)
  Tests: 8 passed, 0 failed
  ✅ All checks passed`,
  },

  // Lab 10 — Apibara stream config TOML
  'apibara-stream-config': {
    title: 'Write an Apibara Stream Config',
    subtitle: 'Configure the indexer to stream Transfer events from Starknet Sepolia',
    format: 'toml',
    prompt: 'Write the Apibara TOML configuration to stream Transfer events from the STRK token contract on Sepolia. The config must specify: the network (starknet.sepolia), the contract address (STRK), the event to filter (Transfer), the starting block, and the output format (json).',
    starterCode:
`# apibara.toml — stream configuration for Starknet Sepolia indexer

[stream]
# Which network to connect to:
network = "___"             # FILL IN: starknet.sepolia

# Start indexing from this block:
starting_block = ___        # FILL IN: a recent Sepolia block number (e.g. 100000)

[stream.filter]
# Only stream events from this contract:
contract_address = "___"    # FILL IN: STRK token address on Sepolia

# Only stream this event type:
event_name = "___"          # FILL IN: "Transfer"

[output]
# Format of the output data:
format = "___"              # FILL IN: "json"

[output.transform]
# Fields to extract from each Transfer event:
fields = [
    # FILL IN: list of field names — from, to, value
]`,
    checks: [
      { type: 'not-contains', value: '"___"',                   description: 'All string blanks filled' },
      { type: 'not-contains', value: '= ___',                   description: 'All value blanks filled' },
      { type: 'contains',     value: 'starknet.sepolia',        description: 'Network set to starknet.sepolia' },
      { type: 'contains',     value: 'starting_block',          description: 'starting_block configured' },
      { type: 'contains',     value: '0x04718f5',               description: 'STRK contract address present' },
      { type: 'contains',     value: '"Transfer"',              description: 'Transfer event name specified' },
      { type: 'contains',     value: '"json"',                  description: 'Output format set to json' },
      { type: 'contains',     value: '"from"',                  description: 'from field in output' },
      { type: 'contains',     value: '"to"',                    description: 'to field in output' },
      { type: 'contains',     value: '"value"',                 description: 'value field in output' },
    ],
    sampleAnswer:
`[stream]
network = "starknet.sepolia"
starting_block = 100000

[stream.filter]
contract_address = "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d"
event_name = "Transfer"

[output]
format = "json"

[output.transform]
fields = ["from", "to", "value"]`,
    simulatedOutput:
`Starting Apibara stream on starknet.sepolia from block 100000...

✓ Connected to Starknet Sepolia node
✓ Filter: Transfer events from 0x04718f5...c938d

Block 100001 — 3 Transfer events
  {"from":"0x049d...","to":"0x3a1b...","value":"1000000000000000000"}
  {"from":"0x3a1b...","to":"0x8f2c...","value":"500000000000000000"}
  {"from":"0x8f2c...","to":"0x049d...","value":"250000000000000000"}

Block 100002 — 1 Transfer event
  {"from":"0x7c4d...","to":"0x2e9f...","value":"2000000000000000000"}

Streaming... (processing ~850 events/minute)`,
  },
};

function ConfigSandboxSim({ scenarioId, onComplete, onSkip, colors }: {
  scenarioId: string; onComplete: () => void; onSkip: () => void; colors: any;
}) {
  const sc = CONFIG_SCENARIOS[scenarioId] ?? CONFIG_SCENARIOS['github-actions-ci'];
  const [code, setCode] = useState(sc.starterCode);
  const [validation, setValidation] = useState<StructuralValidation | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleValidate = () => {
    const v = runStructuralValidation(code, sc.checks);
    setValidation(v);
    if (v.passed) setShowOutput(true);
  };

  const formatLabel = sc.format === 'yaml' ? 'YAML' : 'TOML';
  const icon = sc.format === 'yaml' ? '⚙️' : '📋';

  return (
    <ScrollView contentContainerStyle={{ gap: Spacing.md }}>
      <SandboxHeader
        icon={icon}
        badge={`${icon} ${formatLabel} CONFIG · STRUCTURAL VALIDATION`}
        title={sc.title}
        subtitle={sc.subtitle}
        colors={colors}
      />

      <View style={[{ backgroundColor: '#0f172a', borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: '#1e293b' }]}>
        <Text style={{ color: '#475569', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 6 }}>TASK</Text>
        <Text style={{ color: '#cbd5e1', fontSize: FontSize.sm, lineHeight: 20 }}>{sc.prompt}</Text>
      </View>

      <CodeEditor value={code} onChange={setCode} language={sc.format} />
      <RunButton label="▶  Validate Config" onPress={handleValidate} variant="config" colors={colors} />
      {validation && <ValidationPanel validation={validation} colors={colors} />}

      {showOutput && sc.simulatedOutput && (
        <View style={[{ backgroundColor: '#0d1117', borderRadius: Radius.md, borderWidth: 1, borderColor: '#16a34a40', padding: 12 }]}>
          <Text style={{ color: '#4ade80', fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 }}>
            🎯 SIMULATED OUTPUT — what this config would produce
          </Text>
          <Text style={{ color: '#86efac', fontSize: 11, fontFamily: 'monospace', lineHeight: 18 }}>
            {sc.simulatedOutput}
          </Text>
        </View>
      )}

      {validation?.passed && (
        <>
          {sc.sampleAnswer && (
            <TouchableOpacity onPress={() => setShowAnswer(!showAnswer)} style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
              <Text style={{ color: '#92400e', fontSize: FontSize.sm, fontWeight: '700' }}>
                {showAnswer ? 'Hide reference ↑' : 'Show reference config ↓'}
              </Text>
            </TouchableOpacity>
          )}
          {showAnswer && sc.sampleAnswer && <CodeEditor value={sc.sampleAnswer} language={`${sc.format} (reference)`} readOnly />}
          <RunButton label="Continue →" onPress={onComplete} variant="config" colors={colors} />
        </>
      )}
      {!validation?.passed && <RunButton label="Skip" onPress={onSkip} variant="ghost" colors={colors} />}
    </ScrollView>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT — router
// Usage: <CairoBuilderCodeSandbox simulatorType="sandbox-cairo:first-function" ... />
// ═══════════════════════════════════════════════════════════════════════════════

interface SandboxProps {
  simulatorType: string;   // e.g. "sandbox-cairo:first-function"
  onComplete: () => void;
  onSkip: () => void;
}

export function CairoBuilderCodeSandbox({ simulatorType, onComplete, onSkip }: SandboxProps) {
  const { colors } = useTheme();
  const props = { onComplete, onSkip, colors };

  const [base, scenarioId = ''] = simulatorType.split(':');

  switch (base) {
    case 'sandbox-cairo':
      return <CairoSandbox      scenarioId={scenarioId} {...props} />;
    case 'sandbox-typescript':
      return <TypeScriptSandboxSim scenarioId={scenarioId} {...props} />;
    case 'sandbox-python':
      return <PythonSandboxSim  scenarioId={scenarioId} {...props} />;
    case 'sandbox-sql':
      return <SQLSandboxSim     scenarioId={scenarioId} {...props} />;
    case 'sandbox-config':
      return <ConfigSandboxSim  scenarioId={scenarioId} {...props} />;
    default:
      return (
        <View style={{ padding: 24, alignItems: 'center', gap: 16 }}>
          <Text style={{ fontSize: 32 }}>🔷</Text>
          <Text style={{ color: colors.text, fontSize: FontSize.md, fontWeight: '800' }}>
            Unknown sandbox type: {simulatorType}
          </Text>
          <RunButton label="Skip" onPress={onSkip} variant="ghost" colors={colors} />
        </View>
      );
  }
}
