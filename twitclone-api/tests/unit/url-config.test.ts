import { normalizeConfiguredUrl, parseConfiguredUrls, toUniqueOrigins } from "../../src/utils/url-config";

describe("URL Config Utilities", () => {
  describe("normalizeConfiguredUrl", () => {
    it("should return empty string for null/undefined", () => {
      expect(normalizeConfiguredUrl(null)).toBe("");
      expect(normalizeConfiguredUrl(undefined)).toBe("");
      expect(normalizeConfiguredUrl("")).toBe("");
    });

    it("should keep existing http/https scheme", () => {
      expect(normalizeConfiguredUrl("http://localhost:3000")).toBe("http://localhost:3000");
      expect(normalizeConfiguredUrl("https://example.com")).toBe("https://example.com");
    });

    it("should add http:// for localhost", () => {
      expect(normalizeConfiguredUrl("localhost:3000")).toBe("http://localhost:3000");
      expect(normalizeConfiguredUrl("127.0.0.1:3000")).toBe("http://127.0.0.1:3000");
    });

    it("should add https:// for non-local URLs", () => {
      expect(normalizeConfiguredUrl("example.com")).toBe("https://example.com");
      expect(normalizeConfiguredUrl("api.example.com")).toBe("https://api.example.com");
    });

    it("should strip trailing slashes", () => {
      expect(normalizeConfiguredUrl("http://localhost:3000/")).toBe("http://localhost:3000");
      expect(normalizeConfiguredUrl("https://example.com///")).toBe("https://example.com");
    });

    it("should strip surrounding quotes", () => {
      expect(normalizeConfiguredUrl("'http://localhost:3000'")).toBe("http://localhost:3000");
      expect(normalizeConfiguredUrl('"https://example.com"')).toBe("https://example.com");
    });
  });

  describe("parseConfiguredUrls", () => {
    it("should parse comma-separated URLs", () => {
      const result = parseConfiguredUrls("http://localhost:3001,https://app.example.com");
      expect(result).toContain("http://localhost:3001");
      expect(result).toContain("https://app.example.com");
    });

    it("should handle null values", () => {
      const result = parseConfiguredUrls(null, undefined);
      expect(result).toEqual([]);
    });

    it("should deduplicate URLs", () => {
      const result = parseConfiguredUrls("http://localhost:3001,http://localhost:3001");
      expect(result).toHaveLength(1);
    });

    it("should merge multiple value sources", () => {
      const result = parseConfiguredUrls("http://a.com", "http://b.com");
      expect(result).toHaveLength(2);
    });
  });

  describe("toUniqueOrigins", () => {
    it("should extract unique origins", () => {
      const result = toUniqueOrigins([
        "http://localhost:3001/path",
        "http://localhost:3001/other",
      ]);
      expect(result).toEqual(["http://localhost:3001"]);
    });

    it("should handle multiple different origins", () => {
      const result = toUniqueOrigins([
        "http://localhost:3001",
        "https://app.example.com",
      ]);
      expect(result).toHaveLength(2);
    });
  });
});
