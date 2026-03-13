import { request, signIn, authHeader } from "./helpers";

describe("Follow E2E", () => {
  let testCookies: string[] = [];
  let aliceCookies: string[] = [];
  let testUserId: string;
  let aliceUserId: string;
  let bobUserId: string;

  beforeAll(async () => {
    const testSession = await signIn("test@example.com", "TestPassword123!");
    testCookies = testSession.cookies;
    testUserId = testSession.userId;

    const aliceSession = await signIn("alice@example.com", "TestPassword123!");
    aliceCookies = aliceSession.cookies;
    aliceUserId = aliceSession.userId;
  });

  describe("GET /api/v1/follow/status/:userId", () => {
    it("should require authentication", async () => {
      const res = await request.get(`/api/v1/follow/status/${aliceUserId}`);
      expect(res.status).toBe(401);
    });

    it("should return follow status", async () => {
      const res = await request
        .get(`/api/v1/follow/status/${aliceUserId}`)
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      expect(typeof res.body.isFollowing).toBe("boolean");
    });
  });

  describe("GET /api/v1/followers/:username", () => {
    it("should return followers list for a valid user", async () => {
      const res = await request.get("/api/v1/followers/alice");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.followers)).toBe(true);
    });

    it("should return 404 for non-existent user", async () => {
      const res = await request.get("/api/v1/followers/nonexistentuser999");
      expect(res.status).toBe(404);
    });

    it("should include follower details", async () => {
      const res = await request.get("/api/v1/followers/alice");
      expect(res.status).toBe(200);
      if (res.body.followers.length > 0) {
        const follower = res.body.followers[0];
        expect(follower).toHaveProperty("id");
        expect(follower).toHaveProperty("username");
        expect(follower).toHaveProperty("display_name");
        expect(follower).toHaveProperty("avatar_url");
      }
    });
  });

  describe("GET /api/v1/following/:username", () => {
    it("should return following list for a valid user", async () => {
      const res = await request.get("/api/v1/following/testuser");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.following)).toBe(true);
    });

    it("should include alice in testuser's following list", async () => {
      const res = await request.get("/api/v1/following/testuser");
      expect(res.status).toBe(200);
      const usernames = res.body.following.map((u: any) => u.username);
      expect(usernames).toContain("alice");
    });
  });

  describe("POST /api/v1/follow and /api/v1/unfollow", () => {
    it("should reject following without auth", async () => {
      const res = await request
        .post("/api/v1/follow")
        .send({ targetUserId: aliceUserId });
      expect(res.status).toBe(401);
    });

    it("should reject following yourself", async () => {
      const res = await request
        .post("/api/v1/follow")
        .send({ targetUserId: testUserId })
        .set(authHeader(testCookies));
      expect(res.status).toBe(400);
    });
  });
});
