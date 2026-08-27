module.exports = function (api) {
  // Cache keyed on NODE_ENV rather than api.cache(true): the test build needs an
  // extra plugin (below), and a permanent cache would freeze whichever env was
  // compiled first and silently serve it to the other.
  api.cache.using(() => process.env.NODE_ENV);

  const isTest = process.env.NODE_ENV === 'test';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for WatermelonDB decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Required for Reanimated
      'react-native-reanimated/plugin',
      // Jest runs in a CommonJS VM, where a real `import()` throws
      // "A dynamic import callback was invoked without --experimental-vm-modules".
      // Metro handles dynamic import natively, so this is scoped to tests only
      // and does not touch the shipped bundle -- the code-split chunks stay split.
      //
      // Needed since starknetLessonRegistry moved its lesson bodies behind
      // `import()`; its count-guard test is the first test to await one.
      //
      // NOT @babel/plugin-transform-modules-commonjs: babel-preset-expo asks the
      // caller whether dynamic import is supported, jest-expo answers yes, and
      // the modules transform then deliberately leaves `import()` intact. This
      // plugin rewrites it to a require() unconditionally.
      ...(isTest ? ['dynamic-import-node'] : []),
    ],
  };
};
