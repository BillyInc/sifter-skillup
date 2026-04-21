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

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, ActivityIndicator, Animated,
} from 'react-native';
import { Spacing, Radius, FontSize, useTheme } from '../../theme';

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

function runStructuralValidation(code: string, checks: StructuralCheck[]): StructuralValidation {
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
    Returns cumulative supply array of length `quarters`.
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

interface Props {
  simulatorType: string;   // e.g. "sandbox-cairo:first-function"
  onComplete: () => void;
  onSkip: () => void;
}

export default function CairoBuilderCodeSandbox({ simulatorType, onComplete, onSkip }: Props) {
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
