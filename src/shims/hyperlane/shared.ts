function hyperlaneUnavailable(feature = 'Hyperlane bridge features'): never {
  throw new Error(
    `${feature} are not bundled in this app build because Starknet auth and wallet usage do not require Hyperlane. ` +
      'Install the real @hyperlane-xyz packages before enabling Starkzap bridge flows.'
  );
}

export function createUnavailableProxy(feature?: string) {
  return new Proxy(
    {},
    {
      get() {
        return hyperlaneUnavailable(feature);
      },
      apply() {
        return hyperlaneUnavailable(feature);
      },
      construct() {
        return hyperlaneUnavailable(feature);
      },
    }
  );
}

export { hyperlaneUnavailable };
