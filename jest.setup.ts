// Jest setup — runs before every test file.
// Mocks native modules that don't work in the Node test environment.

// react-native-reanimated (v4) pulls in react-native-worklets, whose native
// part isn't initialized under Node — importing it (transitively, e.g. via
// src/theme/motion.ts) throws "Native part of Worklets doesn't seem to be
// initialized". The library's own shipped mock (`react-native-reanimated/mock`)
// is unusable here: it `require`s the real `./index`, which re-triggers the same
// worklets init. So provide a self-contained mock that never loads the real
// module. It only needs to make animation APIs no-op in the Node test env.
jest.mock('react-native-reanimated', () => {
  const React = require('react');
  const { View, Text, ScrollView, Image } = require('react-native');
  const identity = (v: any) => v;
  const noop = () => {};

  // Layout / entering / exiting animations are used builder-style
  // (e.g. `FadeIn.duration(300).delay(50)`), so every property access and call
  // must return something chainable.
  const chainable: any = new Proxy(function () {}, {
    get: () => chainable,
    apply: () => chainable,
  });

  const animatedComponent = (Base: any) => {
    const C = ({ children, ...props }: any) => React.createElement(Base, props, children);
    C.displayName = 'Animated';
    return C;
  };

  const Animated: any = {
    View: animatedComponent(View),
    Text: animatedComponent(Text),
    ScrollView: animatedComponent(ScrollView),
    Image: animatedComponent(Image),
    createAnimatedComponent: (C: any) => C,
  };

  return {
    __esModule: true,
    default: Animated,
    // hooks
    useSharedValue: (v: any) => ({ value: v }),
    useAnimatedStyle: () => ({}),
    useAnimatedProps: () => ({}),
    useDerivedValue: (fn: any) => ({ value: typeof fn === 'function' ? fn() : undefined }),
    useAnimatedRef: () => ({ current: null }),
    useAnimatedScrollHandler: () => noop,
    useAnimatedReaction: noop,
    useReducedMotion: () => false,
    // animation drivers (return the target value so state settles immediately)
    withTiming: identity,
    withSpring: identity,
    withDelay: (_ms: number, v: any) => v,
    withRepeat: identity,
    withSequence: (...a: any[]) => a[0],
    withDecay: identity,
    cancelAnimation: noop,
    runOnJS: (fn: any) => fn,
    runOnUI: (fn: any) => fn,
    measure: () => null,
    // math
    interpolate: () => 0,
    interpolateColor: () => '#000000',
    Easing: new Proxy({}, { get: () => (x: any) => x }),
    Extrapolation: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    Extrapolate: { CLAMP: 'clamp', EXTEND: 'extend', IDENTITY: 'identity' },
    // layout / entering / exiting animation builders
    Layout: chainable,
    LinearTransition: chainable,
    FadeIn: chainable,
    FadeOut: chainable,
    FadeInDown: chainable,
    FadeInUp: chainable,
    SlideInDown: chainable,
    SlideInUp: chainable,
    SlideInLeft: chainable,
    SlideInRight: chainable,
    ZoomIn: chainable,
    ZoomOut: chainable,
    createAnimatedComponent: (C: any) => C,
  };
});

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// expo-secure-store: shim to in-memory store for tests
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: jest.fn(async (k: string) => store.get(k) ?? null),
    setItemAsync: jest.fn(async (k: string, v: string) => { store.set(k, v); }),
    deleteItemAsync: jest.fn(async (k: string) => { store.delete(k); }),
  };
});

// expo-crypto: deterministic stub
jest.mock('expo-crypto', () => ({
  getRandomBytesAsync: jest.fn(async (n: number) => new Uint8Array(n)),
  digestStringAsync: jest.fn(async (_alg: string, data: string) => `hash:${data}`),
  CryptoDigestAlgorithm: { SHA256: 'SHA-256' },
}));

// expo-clipboard: shim
jest.mock('expo-clipboard', () => ({
  setStringAsync: jest.fn(async () => true),
  getStringAsync: jest.fn(async () => ''),
}));

// react-native-svg: shim to plain views to keep test rendering simple
jest.mock('react-native-svg', () => {
  const React = require('react');
  const { View } = require('react-native');
  const passthrough = (name: string) => {
    const C = ({ children, ...props }: any) => React.createElement(View, props, children);
    C.displayName = name;
    return C;
  };
  return {
    __esModule: true,
    default: passthrough('Svg'),
    Svg: passthrough('Svg'),
    Circle: passthrough('Circle'),
    Rect: passthrough('Rect'),
    Ellipse: passthrough('Ellipse'),
    Path: passthrough('Path'),
    G: passthrough('G'),
    Defs: passthrough('Defs'),
    LinearGradient: passthrough('LinearGradient'),
    RadialGradient: passthrough('RadialGradient'),
    Stop: passthrough('Stop'),
    Text: passthrough('SvgText'),
    Line: passthrough('Line'),
    Polygon: passthrough('Polygon'),
    Polyline: passthrough('Polyline'),
    ClipPath: passthrough('ClipPath'),
    Mask: passthrough('Mask'),
    Pattern: passthrough('Pattern'),
    Use: passthrough('Use'),
  };
});

// expo-router: minimal stubs
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  usePathname: () => '/',
  useLocalSearchParams: () => ({}),
  useFocusEffect: (cb: any) => { cb && cb(); },
  Link: ({ children }: any) => children,
  Stack: { Screen: () => null },
  Tabs: { Screen: () => null },
}));
