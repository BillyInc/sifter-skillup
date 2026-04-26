const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withStarkzap } = require('starkzap-native/metro');

const config = withStarkzap(getDefaultConfig(__dirname));

const hyperlaneAliases = new Map([
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
const previousResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
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
