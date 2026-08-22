const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStarkzap } = require('starkzap-native/metro');

const config = withStarkzap(getDefaultConfig(__dirname));

const hyperlaneAliases = new Map([
  // Expo Router imports this explicit path; pnpm's layout can make Metro
  // miss the package subpath even though the file is installed.
  ['react-native-web/dist/index', path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js')],
  ['@hyperlane-xyz/sdk', path.resolve(__dirname, 'src/shims/hyperlane/sdk.ts')],
  ['@hyperlane-xyz/registry', path.resolve(__dirname, 'src/shims/hyperlane/registry.ts')],
  ['@hyperlane-xyz/utils', path.resolve(__dirname, 'src/shims/hyperlane/utils.ts')],
  ['abitype', path.resolve(__dirname, 'node_modules/abitype')],
  ['isows', path.resolve(__dirname, 'node_modules/isows')],
  ['ox', path.resolve(__dirname, 'node_modules/ox')],
  ['viem', path.resolve(__dirname, 'node_modules/viem')],
  ['proxy-compare', path.resolve(__dirname, 'node_modules/proxy-compare/dist/cjs/index.js')],
  ['valtio', path.resolve(__dirname, 'node_modules/valtio/index.js')],
  ['valtio/react', path.resolve(__dirname, 'node_modules/valtio/react.js')],
  ['valtio/vanilla', path.resolve(__dirname, 'node_modules/valtio/vanilla.js')],
  ['valtio/vanilla/utils', path.resolve(__dirname, 'node_modules/valtio/vanilla/utils.js')],
  ['valtio/utils', path.resolve(__dirname, 'node_modules/valtio/utils.js')],
  ['zustand', path.resolve(__dirname, 'node_modules/zustand/index.js')],
]);

config.resolver = config.resolver || {};
// Windows local development does not have a reliable Watchman service in this
// workspace. Let Metro use its Node filesystem watcher instead of entering the
// Watchman/cache path that can leave the dependency graph uninitialised.
config.resolver.useWatchman = false;
config.watcher = config.watcher || {};
config.watcher.unstable_autoSaveCache = {
  ...(config.watcher.unstable_autoSaveCache || {}),
  enabled: false,
};
// Metro only bundles the Expo app. Scanning the Python backend makes the
// bundler walk pytest caches and other server-only files, which can fail on
// Windows with EPERM and adds no runtime value to the web or native bundle.
const rootOnlyBlockList = [
  '.git',
  '.pnpm-store',
  '.venv',
  '.expo',
  '.expo-web-test',
  '.eas',
  '.agents',
  '.claude',
  '.github',
  'backend',
  'litellm-env',
  'free-claude-code',
  'claude-code-proxy',
  'data',
  'design',
  'docs',
  'supabase',
  'dist',
  'android',
  'scripts',
  '__tests__',
  '__mocks__',
].map((name) => {
  const absolute = path.resolve(__dirname, name);
  const escaped = absolute.replace(/\\/g, '\\\\').replace(/\./g, '\\.');
  return new RegExp(`^${escaped}(?:[/\\\\]|$)`);
});

// Keep Metro focused on the frontend. These exact root-level trees are
// backend, tooling, repository, or generated output and can add hundreds of
// thousands of files to the initial Windows crawl.
config.resolver.blockList = [
  /[/\\]\.pytest_cache[/\\]/,
  ...rootOnlyBlockList,
];
const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-native-web/dist/index') {
    return {
      type: 'sourceFile',
      filePath: path.resolve(__dirname, 'node_modules/react-native-web/dist/index.js'),
    };
  }

  const aliased = hyperlaneAliases.get(moduleName);
  if (aliased) {
    const resolver = previousResolveRequest ?? context.resolveRequest;
    return resolver(context, aliased, platform);
  }

  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
