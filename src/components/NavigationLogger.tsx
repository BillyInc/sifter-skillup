import { useEffect } from 'react';
import { NavigationContainerRef } from '@react-navigation/native';
import { logger } from '../lib/logger';

interface NavigationLoggerProps {
  navigationRef: NavigationContainerRef;
}

/**
 * NavigationLogger component that logs navigation state changes
 * Attach to NavigationContainer to track route changes
 */
export function NavigationLogger({ navigationRef }: NavigationLoggerProps) {
  useEffect(() => {
    if (!navigationRef) return;

    const unsubscribe = navigationRef.addListener('state', (event: any) => {
      const state = event.data?.state;
      if (state) {
        const currentRoute = getCurrentRoute(state);
        const previousRoute = getPreviousRoute(state);

        if (currentRoute) {
          logger.info('Navigation state changed', {
            from: previousRoute,
            to: currentRoute,
            routeParams: currentRoute.params || {},
          });
        }
      }
    });

    return () => unsubscribe();
  }, [navigationRef]);

  return null;
}

/**
 * Get the current active route name from navigation state
 */
function getCurrentRoute(state: any): { name: string; params?: any } | null {
  if (!state) return null;

  const route = state.routes[state.index];
  if (!route) return null;

  if (route.state) {
    return getCurrentRoute(route.state);
  }

  return {
    name: route.name,
    params: route.params,
  };
}

/**
 * Get the previous route if available
 */
function getPreviousRoute(state: any): string | null {
  if (!state || state.routes.length < 2) return null;

  const previousRoute = state.routes[state.index - 1];
  if (!previousRoute) return null;

  if (previousRoute.state) {
    const nested = getCurrentRoute(previousRoute.state);
    return nested?.name || previousRoute.name;
  }

  return previousRoute.name;
}

/**
 * Utility to log screen views/navigation events
 */
export function logScreenView(screenName: string, params?: Record<string, any>) {
  logger.info('Screen viewed', {
    screenName,
    params: params || {},
    timestamp: Date.now(),
  });
}

/**
 * Utility to log user navigation actions (button clicks, etc)
 */
export function logNavigationAction(
  action: string,
  context?: Record<string, any>
) {
  logger.info('Navigation action', {
    action,
    ...context,
    timestamp: Date.now(),
  });
}

export default NavigationLogger;
