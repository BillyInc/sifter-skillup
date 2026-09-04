import React from 'react';
import { PRIVY_APP_ID, PRIVY_WEB_CLIENT_ID } from './config';
import type {
  AppLoginCallbacks,
  AppLoginWithEmailLike,
  AppLoginWithOAuthLike,
  AppPrivyLike,
} from './privyShared';

/** Web-only Privy adapter. The browser authentication package is intentionally
 * isolated so it cannot enter the native Expo bundle. */
export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const { PrivyProvider } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
  const props: any = {
    appId: PRIVY_APP_ID,
    config: { appearance: { theme: 'light' } },
  };
  if (PRIVY_WEB_CLIENT_ID) props.clientId = PRIVY_WEB_CLIENT_ID;
  return <PrivyProvider {...props}>{children}</PrivyProvider>;
}

export function useAppPrivy(): AppPrivyLike {
  const { usePrivy } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
  const privy = usePrivy();
  return {
    isReady: privy.ready,
    authenticated: privy.authenticated,
    user: privy.user,
    getAccessToken: () => privy.getAccessToken(),
  };
}

export function useAppLoginWithEmail(callbacks?: AppLoginCallbacks): AppLoginWithEmailLike {
  const { useLoginWithEmail } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
  const email = useLoginWithEmail(callbacks as any);
  return {
    sendCode: ({ email: address }) => email.sendCode({ email: address }),
    loginWithCode: ({ email: address, code }) => email.loginWithCode({ email: address, code } as any),
    state: email.state,
  };
}

export function useAppLoginWithOAuth(callbacks?: AppLoginCallbacks): AppLoginWithOAuthLike {
  const { useLoginWithOAuth } = require('@privy-io/react-auth') as typeof import('@privy-io/react-auth');
  const oauth = useLoginWithOAuth(callbacks as any);
  return {
    login: ({ provider, disableSignup }) => oauth.initOAuth({ provider: provider as any, disableSignup }),
    state: oauth.state,
  };
}

export function useAppSignRawHash(): {
  signRawHash: (input: { address: string; chainType: 'starknet'; hash: `0x${string}` }) => Promise<{ signature: `0x${string}` }>;
} {
  const { useSignRawHash } = require('@privy-io/react-auth/extended-chains') as typeof import('@privy-io/react-auth/extended-chains');
  return useSignRawHash();
}
