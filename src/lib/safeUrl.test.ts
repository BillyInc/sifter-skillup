const mockOpenURL = jest.fn();
jest.mock("react-native", () => ({ Linking: { openURL: (...a: unknown[]) => mockOpenURL(...a) } }));

import { openExternalUrl, safeExternalUrl } from "./safeUrl";

beforeEach(() => { mockOpenURL.mockReset().mockResolvedValue(undefined); });

describe("safeExternalUrl", () => {
  it("accepts https and http", () => {
    expect(safeExternalUrl("https://example.org/a?b=1")).toBe("https://example.org/a?b=1");
    expect(safeExternalUrl("  http://example.org  ")).toBe("http://example.org/");
  });

  it.each([
    "javascript:alert(1)",
    "JavaScript:alert(1)",
    "java\tscript:alert(1)",
    " javascript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "file:///etc/passwd",
    "intent://scan/#Intent;scheme=zxing;end",
    "//example.org/protocol-relative",
    "/relative/path",
    "https://",
    "",
    "   ",
  ])("rejects %j", (value) => {
    expect(safeExternalUrl(value)).toBeNull();
  });

  it("rejects non-strings", () => {
    expect(safeExternalUrl(undefined)).toBeNull();
    expect(safeExternalUrl(null)).toBeNull();
    expect(safeExternalUrl(42)).toBeNull();
    expect(safeExternalUrl({ href: "https://example.org" })).toBeNull();
  });

  it("allows mailto only when asked", () => {
    expect(safeExternalUrl("mailto:help@example.org")).toBeNull();
    expect(safeExternalUrl("mailto:help@example.org", { allowMailto: true })).toBe("mailto:help@example.org");
    expect(safeExternalUrl("mailto:", { allowMailto: true })).toBeNull();
  });
});

describe("openExternalUrl", () => {
  it("opens a safe URL", async () => {
    await expect(openExternalUrl("https://example.org")).resolves.toBe(true);
    expect(mockOpenURL).toHaveBeenCalledWith("https://example.org/");
  });

  it("never calls Linking for javascript: or data: URLs", async () => {
    await expect(openExternalUrl("javascript:alert(1)")).resolves.toBe(false);
    await expect(openExternalUrl("data:text/html;base64,PHNjcmlwdD4=")).resolves.toBe(false);
    expect(mockOpenURL).not.toHaveBeenCalled();
  });

  it("resolves false instead of throwing when the platform cannot open it", async () => {
    mockOpenURL.mockRejectedValue(new Error("no handler"));
    await expect(openExternalUrl("https://example.org")).resolves.toBe(false);
  });
});
