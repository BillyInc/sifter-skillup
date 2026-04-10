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
import { privyConfig } from '../src/config/privy';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <PrivyProvider appId={privyConfig.appId}>
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
          </PrivyProvider>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
