import { normalizeUsername } from "../../src/utils/normalize";

describe("normalizeUsername", () => {
  it("should lowercase the username", () => {
    expect(normalizeUsername("TestUser")).toBe("testuser");
    expect(normalizeUsername("ALLCAPS")).toBe("allcaps");
  });

  it("should trim whitespace", () => {
    expect(normalizeUsername("  alice  ")).toBe("alice");
    expect(normalizeUsername("\ttab\n")).toBe("tab");
  });

  it("should remove non-alphanumeric characters except underscores", () => {
    expect(normalizeUsername("user@name!")).toBe("username");
    expect(normalizeUsername("user_name")).toBe("user_name");
    expect(normalizeUsername("user.name")).toBe("username");
  });

  it("should handle empty string", () => {
    expect(normalizeUsername("")).toBe("");
  });

  it("should handle underscores", () => {
    expect(normalizeUsername("_user_")).toBe("_user_");
    expect(normalizeUsername("__double__")).toBe("__double__");
  });

  it("should handle numbers", () => {
    expect(normalizeUsername("user123")).toBe("user123");
    expect(normalizeUsername("123")).toBe("123");
  });
});
