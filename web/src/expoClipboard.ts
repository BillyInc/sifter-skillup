export async function setStringAsync(value: string) { await navigator.clipboard?.writeText(value); }
export async function getStringAsync() { return navigator.clipboard ? navigator.clipboard.readText() : ""; }
export async function hasStringAsync() { return Boolean(navigator.clipboard); }
export const ClipboardPasteButton = () => null;

