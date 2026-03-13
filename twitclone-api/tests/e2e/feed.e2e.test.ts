import { request, signIn, authHeader } from "./helpers";

describe("Feed E2E", () => {
  let testCookies: string[] = [];

  beforeAll(async () => {
    const session = await signIn("test@example.com", "TestPassword123!");
    testCookies = session.cookies;
  });

  describe("GET /api/v1/feed", () => {
    it("should require authentication", async () => {
      const res = await request.get("/api/v1/feed");
      expect(res.status).toBe(401);
    });

    it("should return feed with posts", async () => {
      const res = await request
        .get("/api/v1/feed")
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(res.body.posts.length).toBeGreaterThan(0);
    });

    it("should return posts with expected shape", async () => {
      const res = await request
        .get("/api/v1/feed?limit=1")
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      const post = res.body.posts[0];
      expect(post).toHaveProperty("id");
      expect(post).toHaveProperty("content");
      expect(post).toHaveProperty("createdAt");
      expect(post).toHaveProperty("author");
      expect(post).toHaveProperty("engagement");
      expect(post.author).toHaveProperty("id");
      expect(post.author).toHaveProperty("username");
      expect(post.engagement).toHaveProperty("likes");
      expect(post.engagement).toHaveProperty("reposts");
      expect(post.engagement).toHaveProperty("replies");
      expect(post.engagement).toHaveProperty("liked_by_user");
    });

    it("should support pagination", async () => {
      const res1 = await request
        .get("/api/v1/feed?limit=2&offset=0")
        .set(authHeader(testCookies));
      const res2 = await request
        .get("/api/v1/feed?limit=2&offset=2")
        .set(authHeader(testCookies));
      expect(res1.status).toBe(200);
      expect(res2.status).toBe(200);
      if (res1.body.posts.length > 0 && res2.body.posts.length > 0) {
        expect(res1.body.posts[0].id).not.toBe(res2.body.posts[0].id);
      }
    });
  });

  describe("GET /api/v1/feed/following", () => {
    it("should require authentication", async () => {
      const res = await request.get("/api/v1/feed/following");
      expect(res.status).toBe(401);
    });

    it("should return posts from followed users", async () => {
      const res = await request
        .get("/api/v1/feed/following")
        .set(authHeader(testCookies));
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.posts)).toBe(true);
      expect(res.body.posts.length).toBeGreaterThan(0);
    });

    it("should only include posts from followed users and self", async () => {
      const followingRes = await request
        .get("/api/v1/following/testuser")
        .set(authHeader(testCookies));
      const followingUsernames = followingRes.body.following.map((u: any) => u.username);
      followingUsernames.push("testuser");

      const feedRes = await request
        .get("/api/v1/feed/following")
        .set(authHeader(testCookies));
      for (const post of feedRes.body.posts) {
        expect(followingUsernames).toContain(post.author.username);
      }
    });
  });

  describe("GET /api/v1/feed/user/:username", () => {
    it("should return posts for a specific user", async () => {
      const res = await request.get("/api/v1/feed/user/testuser");
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.posts)).toBe(true);
    });

    it("should only return posts from the specified user", async () => {
      const res = await request.get("/api/v1/feed/user/alice");
      expect(res.status).toBe(200);
      for (const post of res.body.posts) {
        expect(post.author.username).toBe("alice");
      }
    });
  });
});
