/** request() must tell a server RESPONSE (ApiError with a status) from a transport failure. */
jest.mock("react-native", () => ({ Platform: { OS: "web" } }));
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(async () => null), setItemAsync: jest.fn(), deleteItemAsync: jest.fn(),
}));
jest.mock("./deviceId", () => ({ getOrCreateDeviceId: jest.fn().mockResolvedValue("device-1") }));
jest.mock("./config", () => ({ API_BASE: "https://example.invalid" }));
jest.mock("./logger", () => ({
  logger: { debug: jest.fn(), info: jest.fn(), warn: jest.fn(), error: jest.fn() },
  logApiCall: jest.fn(),
}));

import { request } from "./api";
import { ApiError } from "./errors";

function respond(status: number, body: unknown) {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: async () => (typeof body === "string" ? body : JSON.stringify(body)),
  } as Response) as typeof fetch;
}

describe("request() error typing", () => {
  it("throws an ApiError carrying the status for a 500", async () => {
    respond(500, { success: false, error: "boom" });
    const failure = (await request("/api/career/saved", { method: "POST" }).catch((e: unknown) => e)) as ApiError;
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(500);
    expect(failure.message).toBe("boom");
  });

  it("keeps the 401 status and a plain-text error body", async () => {
    respond(401, "Unauthorized");
    const failure = (await request("/api/x").catch((e: unknown) => e)) as ApiError;
    expect(failure).toBeInstanceOf(ApiError);
    expect(failure.status).toBe(401);
    expect(failure.message).toBe("Unauthorized");
  });

  it("does NOT wrap a transport failure (no response)", async () => {
    global.fetch = jest.fn().mockRejectedValue(new TypeError("Network request failed")) as typeof fetch;
    const failure = (await request("/api/x").catch((e: unknown) => e)) as ApiError;
    expect(failure).not.toBeInstanceOf(ApiError);
    expect(failure).toBeInstanceOf(TypeError);
  });

  it("returns data on success", async () => {
    respond(200, { success: true, data: { ok: 1 } });
    await expect(request("/api/x")).resolves.toEqual({ ok: 1 });
  });
});
