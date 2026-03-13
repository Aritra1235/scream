import { request, signIn } from "./helpers";

describe("Auth E2E", () => {
  describe("GET /", () => {
    it("should return Hello World", async () => {
      const res = await request.get("/");
      expect(res.status).toBe(200);
      expect(res.text).toBe("Hello World!");
    });
  });

  describe("POST /api/auth/sign-in/email", () => {
    it("should sign in with valid credentials", async () => {
      const { response, cookies } = await signIn("test@example.com", "TestPassword123!");
      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe("test@example.com");
      expect(cookies.length).toBeGreaterThan(0);
    });

    it("should reject invalid credentials", async () => {
      const { response } = await signIn("test@example.com", "wrongpassword");
      expect(response.status).not.toBe(200);
    });

    it("should reject non-existent user", async () => {
      const { response } = await signIn("nonexistent@example.com", "TestPassword123!");
      expect(response.status).not.toBe(200);
    });
  });
});
