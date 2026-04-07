module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        // Allow `declare field: type` in classes (used by WatermelonDB models)
        // alongside legacy decorators.
        'preset-typescript': { allowDeclareFields: true },
      }],
    ],
    plugins: [
      // Required for WatermelonDB decorators
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      // Required for Reanimated
      'react-native-reanimated/plugin',
    ],
  };
};
