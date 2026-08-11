// Polyfills — must load before any code that touches crypto/buffer/text-encoding.
// Order matters: random-values, then fast-text-encoding, then ethers shims (Buffer + FileReader).
import 'react-native-get-random-values';
import 'fast-text-encoding';
import '@ethersproject/shims';
import 'react-native-url-polyfill/auto';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/hooks/useAuth';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { DatabaseProvider } from '../src/components/DatabaseProvider';
import { ThemeProvider } from '../src/theme';
import { ThemeCrossfade, SharedElementProvider } from '../src/components/animations';
import { useCompassFonts } from '../src/theme/fonts';
import { queryClient } from '../src/lib/queryClient';
import { PRIVY_ENABLED } from '../src/lib/config';
import { AppPrivyProvider } from '../src/lib/privy';

export default function RootLayout() {
  // COMPASS font gate — waits for Hanken Grotesk + Spline Sans Mono to load.
  const fontsReady = useCompassFonts();
  if (!fontsReady) return null;

  const tree = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <DatabaseProvider>
            <ThemeProvider>
              <ThemeCrossfade>
                <SharedElementProvider>
                  <QueryClientProvider client={queryClient}>
                    <AuthProvider>
                      <OfflineBanner />
                      <Stack screenOptions={{ headerShown: false }}>
                        <Stack.Screen name="index" />
                        <Stack.Screen name="(auth)" />
                        <Stack.Screen name="(admin)" />
                        <Stack.Screen name="(tabs)" />
                        <Stack.Screen name="world/index" />
                        <Stack.Screen name="starknet-track/index" />
                        <Stack.Screen name="track-room/index" />
                        <Stack.Screen name="merchandise/index" />
                        <Stack.Screen name="map/island" />
                        <Stack.Screen name="map/lesson" />
                      </Stack>
                    </AuthProvider>
                  </QueryClientProvider>
                </SharedElementProvider>
              </ThemeCrossfade>
            </ThemeProvider>
          </DatabaseProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (!PRIVY_ENABLED) {
    return tree;
  }

  return <AppPrivyProvider>{tree}</AppPrivyProvider>;
}
