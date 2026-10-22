import { API_MUTATION_TIMEOUT_MS, API_READ_TIMEOUT_MS, resolveRequestTimeout } from "./requestTimeout";

describe("API request timeout policy", () => {
  it("allows backend-backed read screens more time to return data", () => {
    expect(resolveRequestTimeout(undefined)).toBe(API_READ_TIMEOUT_MS);
    expect(resolveRequestTimeout("get")).toBe(180_000);
    expect(resolveRequestTimeout("HEAD")).toBe(180_000);
  });

  it("keeps writes bounded and honors explicit operation overrides", () => {
    expect(resolveRequestTimeout("POST")).toBe(API_MUTATION_TIMEOUT_MS);
    expect(resolveRequestTimeout("DELETE", 5_000)).toBe(5_000);
  });
});
