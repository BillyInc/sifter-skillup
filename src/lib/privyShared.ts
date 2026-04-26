export const PRIVY_WEB_LOGIN_STORAGE_KEY = 'sifter:privy:web-login';

export type AppPrivyLike = {
  isReady: boolean;
  authenticated: boolean;
  user: any | null;
  getAccessToken: () => Promise<string | null>;
};

export type AppLoginCallbacks = {
  onError?: (err: any) => void;
};

export type AppLoginWithEmailLike = {
  sendCode: (options: { email: string; disableSignup?: boolean }) => Promise<unknown>;
  loginWithCode: (options: { email?: string; code: string }) => Promise<unknown>;
  state: any;
};

export type AppLoginWithOAuthLike = {
  login: (options: { provider: string; disableSignup?: boolean }) => Promise<unknown>;
  state: any;
};

export function getPrivyLinkedAccounts(user: any): any[] {
  if (!user) {
    return [];
  }
  if (Array.isArray(user.linkedAccounts)) {
    return user.linkedAccounts;
  }
  if (Array.isArray(user.linked_accounts)) {
    return user.linked_accounts;
  }
  return [];
}

export function getPrivyEmail(user: any, fallback = ''): string {
  const directEmail = user?.email?.address;
  if (typeof directEmail === 'string' && directEmail.length > 0) {
    return directEmail;
  }

  const linkedEmail = getPrivyLinkedAccounts(user).find(
    (account: any) => account?.type === 'email' && typeof account?.address === 'string' && account.address.length > 0,
  )?.address;

  return typeof linkedEmail === 'string' && linkedEmail.length > 0 ? linkedEmail : fallback;
}

export function readPendingPrivyWebLogin(): { emailFallback: string } | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const raw = window.sessionStorage.getItem(PRIVY_WEB_LOGIN_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      emailFallback: typeof parsed?.emailFallback === 'string' ? parsed.emailFallback : '',
    };
  } catch {
    return { emailFallback: '' };
  }
}

export function writePendingPrivyWebLogin(emailFallback: string) {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.setItem(
    PRIVY_WEB_LOGIN_STORAGE_KEY,
    JSON.stringify({ emailFallback }),
  );
}

export function clearPendingPrivyWebLogin() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(PRIVY_WEB_LOGIN_STORAGE_KEY);
}
