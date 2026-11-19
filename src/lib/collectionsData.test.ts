import { collectionsData } from "./collectionsData";

const mockRequest = jest.fn();
jest.mock("./api", () => ({ request: (...args: unknown[]) => mockRequest(...args) }));

describe("collectionsData", () => {
  beforeEach(() => mockRequest.mockReset());

  it("passes through the backend DataState, including coming_soon", async () => {
    mockRequest.mockResolvedValue({ status: "coming_soon", data: null, meta: { notice: "Collections are not available yet." } });
    const result = await collectionsData.list();
    expect(result.status).toBe("coming_soon");
    expect(mockRequest).toHaveBeenCalledWith("/api/career/collections", undefined);
  });

  it("surfaces server validation messages as an error notice", async () => {
    mockRequest.mockRejectedValue(new Error("You already have a collection with that name."));
    const result = await collectionsData.create("Ideas");
    expect(result).toEqual({ status: "error", data: null, meta: { notice: "You already have a collection with that name." } });
  });

  it("sends starterKey only when a suggestion was used", async () => {
    mockRequest.mockResolvedValue({ status: "real", data: {} });
    await collectionsData.create("Custom");
    expect(JSON.parse(mockRequest.mock.calls[0][1].body)).toEqual({ name: "Custom" });
    await collectionsData.create("Career ideas", "career_ideas");
    expect(JSON.parse(mockRequest.mock.calls[1][1].body)).toEqual({ name: "Career ideas", starterKey: "career_ideas" });
  });

  it("removing an item targets only the collection membership route", async () => {
    mockRequest.mockResolvedValue({ status: "real", data: null });
    await collectionsData.removeItem("c 1", "s/1");
    expect(mockRequest).toHaveBeenCalledWith("/api/career/collections/c%201/items/s%2F1", { method: "DELETE" });
  });
});
