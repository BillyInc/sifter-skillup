// Jest setup — runs before every test file.
// Mocks native modules that don't work in the Node test environment.

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
