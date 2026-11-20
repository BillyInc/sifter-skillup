import { getActiveNavId } from "./shellNav";

describe("getActiveNavId", () => {
  it.each([
    ["/home", "home"],
    ["/explore", "explore"],
    ["/programme/abc", "explore"],
    ["/build", "build"],
    ["/opportunities", "opportunities"],
    ["/myworld", "myworld"],
    ["/profile", "profile"],
    ["/settings", "profile"],
    ["/explore/pathways/entrepreneurship", "entrepreneurship"],
    [null, "home"],
  ])("%s -> %s", (path, id) => {
    expect(getActiveNavId(path as string | null)).toBe(id);
  });
});
