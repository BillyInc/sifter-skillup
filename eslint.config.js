// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require("eslint-config-expo/flat");

module.exports = defineConfig([
  expoConfig,
  {
    ignores: [
      "dist/*",
      // Mirrors the tsconfig.json "exclude" list and the CI type-check filter
      // (which skips src/data/): paste-in snippets, legacy files and content
      // data that are not part of the compiled app. Lint what ships.
      "src/data/**",
      "src/components/simulators/SimulatorCard_ADDITIONS.tsx",
      "src/components/simulators/SimulatorCard_PATCH.ts",
      "src/components/simulators/island06SolanaSimulatorDefs.tsx",
      "src/components/simulators/island12_13_15Sims.tsx",
      "src/components/simulators/walletEnhancedSims.tsx",
      "src/lib/database.ts",
      "src/lib/watermelonModels.ts",
      "src/lib/watermelonSchema.ts",
    ],
  }
]);
