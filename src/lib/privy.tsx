import React from 'react';
import { Platform } from 'react-native';
import { PRIVY_APP_ID, PRIVY_NATIVE_CLIENT_ID, PRIVY_WEB_CLIENT_ID } from './config';
import type {
  AppLoginCallbacks,
  AppLoginWithEmailLike,
  AppLoginWithOAuthLike,
  AppPrivyLike,
} from './privyShared';

const isWeb = Platform.OS === 'web';

export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  if (isWeb) {
    const { PrivyProvider } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
    const privyProps: any = {
      appId: PRIVY_APP_ID,
      config: {
        appearance: {
          theme: 'light',
        },
      },
    };

    if (PRIVY_WEB_CLIENT_ID) {
      privyProps.clientId = PRIVY_WEB_CLIENT_ID;
    }

    return <PrivyProvider {...privyProps}>{children}</PrivyProvider>;
  }

  const { PrivyProvider } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const privyProps: any = {
    appId: PRIVY_APP_ID,
    config: { embedded: { ethereum: { createOnLogin: 'users-without-wallets' } } },
  };

  if (PRIVY_NATIVE_CLIENT_ID) {
    privyProps.clientId = PRIVY_NATIVE_CLIENT_ID;
  }

  return <PrivyProvider {...privyProps}>{children}</PrivyProvider>;
}

export function useAppPrivy(): AppPrivyLike {
  if (isWeb) {
    const { usePrivy } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
    const privy = usePrivy();

    return {
      isReady: privy.ready,
      authenticated: privy.authenticated,
      user: privy.user,
      getAccessToken: () => privy.getAccessToken(),
    };
  }

  const { usePrivy } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const privy = usePrivy();

  return {
    isReady: privy.isReady,
    authenticated: !!privy.user,
    user: privy.user,
    getAccessToken: () => privy.getAccessToken(),
  };
}

export function useAppLoginWithEmail(callbacks?: AppLoginCallbacks): AppLoginWithEmailLike {
  if (isWeb) {
    const { useLoginWithEmail } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
    const email = useLoginWithEmail(callbacks as any);

    return {
      sendCode: ({ email: address }) => email.sendCode({ email: address }),
      loginWithCode: ({ code }) => email.loginWithCode({ code }),
      state: email.state,
    };
  }

  const { useLoginWithEmail } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const email = useLoginWithEmail(callbacks as any);

  return {
    sendCode: ({ email: address }) => email.sendCode({ email: address }),
    loginWithCode: ({ email: address, code }) => email.loginWithCode({ email: address ?? '', code }),
    state: email.state,
  };
}

export function useAppLoginWithOAuth(callbacks?: AppLoginCallbacks): AppLoginWithOAuthLike {
  if (isWeb) {
    const { useLoginWithOAuth } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
    const oauth = useLoginWithOAuth(callbacks as any);

    return {
      login: ({ provider, disableSignup }) => oauth.initOAuth({ provider: provider as any, disableSignup }),
      state: oauth.state,
    };
  }

  const { useLoginWithOAuth } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const oauth = useLoginWithOAuth(callbacks as any);

  return {
    login: ({ provider, disableSignup }) => oauth.login({ provider: provider as any, disableSignup }),
    state: oauth.state,
  };
}
