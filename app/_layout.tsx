import 'react-native-url-polyfill/auto';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../src/hooks/useAuth';
import { ErrorBoundary } from '../src/components/ErrorBoundary';
import { OfflineBanner } from '../src/components/OfflineBanner';
import { DatabaseProvider } from '../src/components/DatabaseProvider';
import { ThemeProvider } from '../src/theme';
import { queryClient } from '../src/lib/queryClient';
import { PRIVY_APP_ID } from '../src/config/privy';

// Conditionally import Privy only on native platforms (iOS/Android)
// On web, use a no-op provider to avoid bundling mobile-only dependencies
const PrivyProviderComponent = Platform.select({
  native: require('@privy-io/expo').PrivyProvider,
  default: ({ children, appId }: any) => children, // No-op for web
});

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ErrorBoundary>
          <PrivyProviderComponent appId={PRIVY_APP_ID}>
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
          </PrivyProviderComponent>
        </ErrorBoundary>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
