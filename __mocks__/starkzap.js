/**
 * Jest mock for the `starkzap` package.
 *
 * starkzap@3 ships ESM-only: package.json declares "type": "module" and its
 * "exports" map offers an "import" condition with no "require" counterpart.
 * jest-expo runs the suite as CJS, so the resolver cannot satisfy the bare
 * `require('starkzap')` that src/lib/starkzapPrivyAdapter.ts compiles down to,
 * and every suite that transitively imports useAuth fails to load —
 * GuidanceReportButton.test.ts among them, which tests nothing to do with
 * Starknet. transformIgnorePatterns cannot help here: resolution fails before
 * any transform runs.
 *
 * The adapter only ever constructs PrivySigner and hands it to
 * starkzapSdk.connectWallet, so recording the options is enough for any test
 * that reaches this code. A test that needs real signing behaviour should mock
 * this module itself rather than lean on this stub.
 */
class PrivySigner {
  constructor(options = {}) {
    this.walletId = options.walletId;
    this.publicKey = options.publicKey;
    this.rawSign = options.rawSign;
  }
}

module.exports = { PrivySigner };
