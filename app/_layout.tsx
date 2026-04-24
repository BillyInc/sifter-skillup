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
import { PrivyProvider } from '@privy-io/expo';
import { AuthProvider } from '../src/hooks/useAuth';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { DatabaseProvider } from '../src/components/DatabaseProvider';
import { ThemeProvider } from '../src/theme';
import { queryClient } from '../src/lib/queryClient';
import { PRIVY_APP_ID, PRIVY_CLIENT_ID, PRIVY_CONFIGURED } from '../src/lib/config';

export default function RootLayout() {
  const tree = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <DatabaseProvider>
            <ThemeProvider>
              <QueryClientProvider client={queryClient}>
                <AuthProvider>
                  <OfflineBanner />
                  <Stack screenOptions={{ headerShown: false }}>
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
            </ThemeProvider>
          </DatabaseProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );

  if (!PRIVY_CONFIGURED) return tree;

  const privyProps: any = {
    appId: PRIVY_APP_ID,
    config: { embedded: { ethereum: { createOnLogin: 'users-without-wallets' } } },
  };
  if (PRIVY_CLIENT_ID) privyProps.clientId = PRIVY_CLIENT_ID;

  return <PrivyProvider {...privyProps}>{tree}</PrivyProvider>;
}
