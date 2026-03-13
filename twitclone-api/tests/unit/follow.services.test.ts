import { followUser, unfollowUser, isFollowing, getFollowingIds } from "../../src/modules/follow/services";
import { db } from "../../src/db/client";

jest.mock("../../src/utils/graph-sync", () => ({
  syncFollowToGraph: jest.fn().mockResolvedValue(undefined),
  removeFollowFromGraph: jest.fn().mockResolvedValue(undefined),
}));

describe("Follow Services", () => {
  const testUserId = 2032372199385468928n;
  const aliceUserId = 2032384007164923904n;

  describe("followUser", () => {
    it("should reject following yourself", async () => {
      await expect(followUser(testUserId, testUserId)).rejects.toThrow("Cannot follow yourself");
    });
  });

  describe("isFollowing", () => {
    it("should return a boolean", async () => {
      const result = await isFollowing(testUserId, aliceUserId);
      expect(typeof result).toBe("boolean");
    });

    it("should return true for an existing follow", async () => {
      const result = await isFollowing(testUserId, aliceUserId);
      expect(result).toBe(true);
    });

    it("should return false for a non-existing follow", async () => {
      const nonExistentId = 99999999999999n;
      const result = await isFollowing(nonExistentId, aliceUserId);
      expect(result).toBe(false);
    });
  });

  describe("getFollowingIds", () => {
    it("should return an array of bigints", async () => {
      const ids = await getFollowingIds(testUserId);
      expect(Array.isArray(ids)).toBe(true);
      for (const id of ids) {
        expect(typeof id).toBe("bigint");
      }
    });

    it("should include alice in testuser's following list", async () => {
      const ids = await getFollowingIds(testUserId);
      expect(ids).toContainEqual(aliceUserId);
    });

    it("should return empty array for user with no follows", async () => {
      const ids = await getFollowingIds(99999999999999n);
      expect(ids).toEqual([]);
    });
  });

  describe("unfollowUser", () => {
    it("should reject unfollowing yourself", async () => {
      await expect(unfollowUser(testUserId, testUserId)).rejects.toThrow("Cannot unfollow yourself");
    });

    it("should reject unfollowing a user you do not follow", async () => {
      const nonExistentId = 99999999999999n;
      await expect(unfollowUser(testUserId, nonExistentId)).rejects.toThrow("Not following this user");
    });
  });
});
