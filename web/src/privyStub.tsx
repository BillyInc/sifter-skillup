import type { ReactNode } from "react";
export function PrivyProvider({ children }: { children?: ReactNode }) { return <>{children}</>; }
export function usePrivy() { return { ready: true, authenticated: false, user: null, getAccessToken: async () => null }; }
export function useLoginWithEmail() { return { sendCode: async () => {}, loginWithCode: async () => {}, state: {} }; }
export function useLoginWithOAuth() { return { initOAuth: async () => {}, state: {} }; }
export function useSignRawHash() { return { signRawHash: async () => ({ signature: "0x" }) }; }

