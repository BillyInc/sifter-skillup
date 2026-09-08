import type { ReactNode } from "react";

export const ImpactFeedbackStyle = { Light: "light", Medium: "medium", Heavy: "heavy" } as const;
export const NotificationFeedbackType = { Success: "success", Error: "error", Warning: "warning" } as const;
export async function impactAsync() {}
export async function notificationAsync() {}
export async function selectionAsync() {}

export async function getItemAsync(key: string) { return localStorage.getItem(key); }
export async function setItemAsync(key: string, value: string) { localStorage.setItem(key, value); }
export async function deleteItemAsync(key: string) { localStorage.removeItem(key); }

export const CryptoDigestAlgorithm = { SHA256: "SHA-256" } as const;
export async function digest(value: string) { return digestStringAsync("SHA-256", value); }
export async function digestStringAsync(_algorithm: string, value: string) {
  if (globalThis.crypto?.subtle) {
    const bytes = new TextEncoder().encode(value);
    const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }
  return value;
}
export function getRandomBytesAsync(length: number) { return Promise.resolve(new Uint8Array(length)); }
export const AESKeySize = { AES256: 32 } as const;
export class AESEncryptionKey {
  constructor(private readonly encodedValue = "web-key") {}
  static async generate() { return new AESEncryptionKey(); }
  static import(value: string) { return new AESEncryptionKey(value); }
  async encoded() { return this.encodedValue; }
}
export class AESSealedData {
  constructor(private readonly value: string) {}
  static fromCombined(value: string) { return new AESSealedData(value); }
  async combined() { return this.value; }
}
export async function aesEncryptAsync(data: any) { return new AESSealedData(data?.toString?.("base64") ?? ""); }
export async function aesDecryptAsync(data: AESSealedData) {
  const encoded = await data.combined();
  const binary = typeof atob === "function" ? atob(encoded) : "";
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

const constants = { expoConfig: null, manifest2: null, manifest: null };
export default constants;
export const Constants = constants;
export const applicationId = "com.sifter.levelup";

export async function getInfoAsync() { return { exists: false, uri: "" }; }
export async function readAsStringAsync() { return ""; }
export async function writeAsStringAsync() {}
export async function deleteAsync() {}
export const documentDirectory = "/";
export const cacheDirectory = "/";
export const EncodingType = { UTF8: "utf8", Base64: "base64" } as const;

export function createURL(path = "") { return `${window.location.origin}/${path.replace(/^\//, "")}`; }
export async function openURL(url: string) { window.open(url, "_blank", "noopener,noreferrer"); }
export function addEventListener() { return { remove() {} }; }

export const AndroidImportance = { MAX: 5 } as const;
export function setNotificationHandler() {}
export async function getPermissionsAsync() { return { status: "denied" }; }
export async function requestPermissionsAsync() { return { status: "denied" }; }
export async function getExpoPushTokenAsync() { return { data: "" }; }
export async function setNotificationChannelAsync() {}
export function addNotificationResponseReceivedListener() { return { remove() {} }; }
export function addNotificationReceivedListener() { return { remove() {} }; }

export async function isAvailableAsync() { return false; }
export const AppleAuthenticationButton = ({ children }: { children?: ReactNode }) => <button type="button" disabled>{children ?? "Apple sign-in unavailable on web"}</button>;
export const AppleAuthenticationButtonType = { SIGN_IN: 0 } as const;
export const AppleAuthenticationButtonStyle = { BLACK: 0 } as const;

export async function isEnrolledAsync() { return false; }
export async function authenticateAsync() { return { success: false }; }
export async function loadAsync() { return; }
export function useFonts() { return [true, null] as const; }
