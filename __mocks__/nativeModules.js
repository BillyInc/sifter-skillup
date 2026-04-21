// Shim for jest-expo@55 + RN 0.76.x compatibility.
// jest-expo expects NativeModules.default to have certain properties.
module.exports = {
  default: {
    UIManager: {
      getViewManagerConfig: () => ({}),
      getConstants: () => ({}),
      configureNextLayoutAnimation: () => {},
    },
    NativeUnimoduleProxy: {
      viewManagersMetadata: {},
      viewManagersNames: [],
      modulesConstants: {},
      exportedMethods: {},
    },
    PlatformConstants: {
      forceTouchAvailable: false,
    },
    ImageLoader: {
      prefetchImage: () => {},
      getSize: (uri, success) => success(320, 240),
    },
    ImageViewManager: {
      prefetchImage: () => {},
      getSize: (uri, success) => success(320, 240),
    },
    LinkingManager: {},
    StatusBarManager: {
      getHeight: () => 44,
      setStyle: () => {},
      setHidden: () => {},
    },
    Networking: {
      addListener: () => {},
      removeListeners: () => {},
    },
    BlobModule: {
      addNetworkingHandler: () => {},
    },
  },
};
