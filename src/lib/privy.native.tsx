import React from 'react';
import { PRIVY_APP_ID, PRIVY_NATIVE_CLIENT_ID } from './config';
import type {
  AppLoginCallbacks,
  AppLoginWithEmailLike,
  AppLoginWithOAuthLike,
  AppPrivyLike,
} from './privyShared';

/** Native-only Privy adapter. Keeping the web package out of this module is
 * important: Metro must not pull the browser auth stack into Expo Go. */
export function AppPrivyProvider({ children }: { children: React.ReactNode }) {
  const { PrivyProvider } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const props: any = {
    appId: PRIVY_APP_ID,
    config: { embedded: { ethereum: { createOnLogin: 'users-without-wallets' } } },
  };
  if (PRIVY_NATIVE_CLIENT_ID) props.clientId = PRIVY_NATIVE_CLIENT_ID;
  return <PrivyProvider {...props}>{children}</PrivyProvider>;
}

export function useAppPrivy(): AppPrivyLike {
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
  const { useLoginWithEmail } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const email = useLoginWithEmail(callbacks as any);
  return {
    sendCode: ({ email: address }) => email.sendCode({ email: address }),
    loginWithCode: ({ email: address, code }) => email.loginWithCode({ email: address ?? '', code }),
    state: email.state,
  };
}

export function useAppLoginWithOAuth(callbacks?: AppLoginCallbacks): AppLoginWithOAuthLike {
  const { useLoginWithOAuth } = require('@privy-io/expo') as typeof import('@privy-io/expo');
  const oauth = useLoginWithOAuth(callbacks as any);
  return {
    login: ({ provider, disableSignup }) => oauth.login({ provider: provider as any, disableSignup }),
    state: oauth.state,
  };
}

export function useAppSignRawHash(): {
  signRawHash: (input: { address: string; chainType: 'starknet'; hash: `0x${string}` }) => Promise<{ signature: `0x${string}` }>;
} {
  const { useSignRawHash } = require('@privy-io/expo/extended-chains') as typeof import('@privy-io/expo/extended-chains');
  return useSignRawHash();
}
