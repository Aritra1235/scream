import { request, signIn, authHeader } from "./helpers";

describe("Graph E2E", () => {
  let testCookies: string[] = [];
  let aliceCookies: string[] = [];

  beforeAll(async () => {
    const testSession = await signIn("test@example.com", "TestPassword123!");
    testCookies = testSession.cookies;

    const aliceSession = await signIn("alice@example.com", "TestPassword123!");
    aliceCookies = aliceSession.cookies;
  });

  describe("GET /api/v1/graph/suggestions", () => {
    it("should require authentication", async () => {
      const res = await request.get("/api/v1/graph/suggestions");
      expect(res.status).toBe(401);
    });

    it("should return suggestions array", async () => {
      const res = await request
        .get("/api/v1/graph/suggestions")
        .set(authHeader(aliceCookies));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
    });

    it("should support limit parameter", async () => {
      const res = await request
        .get("/api/v1/graph/suggestions?limit=1")
        .set(authHeader(aliceCookies));
      expect(res.status).toBe(200);
      expect(res.body.suggestions.length).toBeLessThanOrEqual(1);
    });

    it("should return users with expected shape", async () => {
      const res = await request
        .get("/api/v1/graph/suggestions?limit=5")
        .set(authHeader(aliceCookies));
      if (res.body.suggestions.length > 0) {
        const suggestion = res.body.suggestions[0];
        expect(suggestion).toHaveProperty("id");
        expect(suggestion).toHaveProperty("username");
        expect(suggestion).toHaveProperty("display_name");
        expect(suggestion).toHaveProperty("followers_count");
        expect(suggestion).toHaveProperty("mutualCount");
      }
    });
  });

  describe("GET /api/v1/graph/trending", () => {
    it("should return trending users", async () => {
      const res = await request
        .get("/api/v1/graph/trending")
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.trending)).toBe(true);
    });

    it("should return users ranked by score", async () => {
      const res = await request
        .get("/api/v1/graph/trending?limit=10")
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      const scores = res.body.trending.map((u: any) => u.score);
      for (let i = 1; i < scores.length; i++) {
        expect(scores[i]).toBeLessThanOrEqual(scores[i - 1]);
      }
    });

    it("should include score in each user", async () => {
      const res = await request
        .get("/api/v1/graph/trending?limit=5")
        .set(authHeader(testCookies));
      for (const user of res.body.trending) {
        expect(typeof user.score).toBe("number");
      }
    });
  });

  describe("GET /api/v1/graph/mutual/:username", () => {
    it("should require authentication", async () => {
      const res = await request.get("/api/v1/graph/mutual/bob");
      expect(res.status).toBe(401);
    });

    it("should return mutual followers array", async () => {
      const res = await request
        .get("/api/v1/graph/mutual/bob")
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.mutuals)).toBe(true);
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request
        .get("/api/v1/graph/mutual/nonexistentuser999")
        .set(authHeader(testCookies));
      expect(res.status).toBe(404);
    });
  });
});
