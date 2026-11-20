/**
 * A save the SERVER rejected must not look saved. Only a transport failure
 * (fetch rejected, no response) may be queued as "saved on this device".
 */
const mockRequest = jest.fn();
const mockQueueWrite = jest.fn();
const mockFlushQueue = jest.fn();

jest.mock("./api", () => ({ API_READ_TIMEOUT_MS: 1000, request: (...a: unknown[]) => mockRequest(...a) }));
jest.mock("./careerCache", () => ({
  getCached: jest.fn(async () => null),
  getCachedStale: jest.fn(async () => null),
  setCached: jest.fn(async () => undefined),
  queueWrite: (...a: unknown[]) => mockQueueWrite(...a),
  cancelQueuedSave: jest.fn(),
  flushQueue: (...a: unknown[]) => mockFlushQueue(...a),
}));

import { careerData } from "./careerData";
import { ApiError } from "./errors";

beforeEach(() => {
  mockRequest.mockReset();
  mockQueueWrite.mockReset();
  mockFlushQueue.mockReset().mockResolvedValue(0);
});

describe("careerData.saveItem failure handling", () => {
  it("a server 500 is an error, is not queued, and never claims to be saved", async () => {
    mockRequest.mockRejectedValue(new ApiError("Internal Server Error", 500));
    const result = await careerData.saveItem("programme", "p-1", "Sociology");
    expect(result.status).toBe("error");
    expect(result.meta?.notice).toMatch(/try again/i);
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });

  it("a 401 is locked (sign in again) and not queued", async () => {
    mockRequest.mockRejectedValue(new ApiError("Unauthorized", 401));
    const result = await careerData.saveItem("programme", "p-1");
    expect(result.status).toBe("locked");
    expect(result.meta?.notice).toMatch(/sign in/i);
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });

  it("a 422 validation rejection is an error and not queued", async () => {
    mockRequest.mockRejectedValue(new ApiError("Unprocessable", 422));
    const result = await careerData.saveItem("programme", "p-1");
    expect(result.status).toBe("error");
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });

  it("a network failure (no response) is queued as saved on this device", async () => {
    mockRequest.mockRejectedValue(new TypeError("Network request failed"));
    const result = await careerData.saveItem("programme", "p-1", "Sociology");
    expect(result.status).toBe("pending");
    expect(result.meta?.notice).toMatch(/on this device/i);
    expect(mockQueueWrite).toHaveBeenCalledTimes(1);
  });

  it("a success is real", async () => {
    mockRequest.mockResolvedValue({ status: "real", data: { id: "s1", entityType: "programme", entityId: "p-1" } });
    const result = await careerData.saveItem("programme", "p-1");
    expect(result.status).toBe("real");
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });
});

describe("careerData.removeSavedItem failure handling", () => {
  it("a server 500 is an error and not queued", async () => {
    mockRequest.mockRejectedValue(new ApiError("Internal Server Error", 500));
    const result = await careerData.removeSavedItem("s1");
    expect(result.status).toBe("error");
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });

  it("a 404 means it is already gone: the removal succeeded", async () => {
    mockRequest.mockRejectedValue(new ApiError("Not found", 404));
    const result = await careerData.removeSavedItem("s1");
    expect(result.status).toBe("real");
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });

  it("a network failure is queued as removed on this device", async () => {
    mockRequest.mockRejectedValue(new TypeError("Network request failed"));
    const result = await careerData.removeSavedItem("s1");
    expect(result.status).toBe("pending");
    expect(mockQueueWrite).toHaveBeenCalledTimes(1);
  });
});

describe("the same rule for notes and guidance paths", () => {
  it("a rejected note is an error and not queued", async () => {
    mockRequest.mockRejectedValue(new ApiError("Bad Request", 400));
    const result = await careerData.upsertNote("programme", "p-1", "hello");
    expect(result.status).toBe("error");
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });

  it("a note that fails on the network is still queued", async () => {
    mockRequest.mockRejectedValue(new TypeError("Network request failed"));
    const result = await careerData.upsertNote("programme", "p-1", "hello");
    expect(result.status).toBe("pending");
    expect(mockQueueWrite).toHaveBeenCalledTimes(1);
  });

  it("a rejected guidance path is an error and not queued", async () => {
    mockRequest.mockRejectedValue(new ApiError("Internal Server Error", 500));
    const result = await careerData.saveGuidancePath({ path: {} as never });
    expect(result.status).toBe("error");
    expect(mockQueueWrite).not.toHaveBeenCalled();
  });
});
