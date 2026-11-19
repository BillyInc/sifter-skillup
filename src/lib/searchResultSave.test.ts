import { savedEntityTypeForResult } from "./searchResultSave";

describe("savedEntityTypeForResult", () => {
  it("maps only types the saved_items API stores", () => {
    expect(savedEntityTypeForResult("programme")).toBe("programme");
    expect(savedEntityTypeForResult("domain")).toBe("domain");
    expect(savedEntityTypeForResult("subgroup")).toBe("subgroup");
    expect(savedEntityTypeForResult("role")).toBe("role");
    expect(savedEntityTypeForResult("opportunity")).toBe("opportunity");
  });
  it("gives no quick-save for unsupported types", () => {
    for (const t of ["skill", "tool", "certification", "university", "scholarship", "admin"] as const) {
      expect(savedEntityTypeForResult(t)).toBeNull();
    }
  });
});
