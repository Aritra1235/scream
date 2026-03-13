import { generateId, parseId, getTimestamp, compare, setWorkerId } from "../../src/utils/snowflake";

describe("Snowflake ID Generator", () => {
  describe("generateId", () => {
    it("should generate a bigint ID", () => {
      const id = generateId();
      expect(typeof id).toBe("bigint");
    });

    it("should generate unique IDs", () => {
      const ids = new Set<bigint>();
      for (let i = 0; i < 100; i++) {
        ids.add(generateId());
      }
      expect(ids.size).toBe(100);
    });

    it("should generate monotonically increasing IDs", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id2).toBeGreaterThan(id1);
    });

    it("should generate positive IDs", () => {
      const id = generateId();
      expect(id).toBeGreaterThan(0n);
    });
  });

  describe("parseId", () => {
    it("should parse a generated ID back to its components", () => {
      const id = generateId();
      const parsed = parseId(id);
      expect(parsed.timestamp).toBeInstanceOf(Date);
      expect(parsed.workerId).toBeGreaterThanOrEqual(0);
      expect(parsed.sequence).toBeGreaterThanOrEqual(0);
    });

    it("should return a timestamp close to now", () => {
      const before = Date.now();
      const id = generateId();
      const after = Date.now();
      const parsed = parseId(id);
      expect(parsed.timestamp.getTime()).toBeGreaterThanOrEqual(before - 1);
      expect(parsed.timestamp.getTime()).toBeLessThanOrEqual(after + 1);
    });
  });

  describe("getTimestamp", () => {
    it("should extract timestamp from ID", () => {
      const id = generateId();
      const ts = getTimestamp(id);
      expect(ts).toBeInstanceOf(Date);
      expect(Math.abs(ts.getTime() - Date.now())).toBeLessThan(1000);
    });
  });

  describe("compare", () => {
    it("should return -1 for older < newer", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(compare(id1, id2)).toBe(-1);
    });

    it("should return 1 for newer > older", () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(compare(id2, id1)).toBe(1);
    });

    it("should return 0 for equal IDs", () => {
      const id = generateId();
      expect(compare(id, id)).toBe(0);
    });
  });

  describe("setWorkerId", () => {
    it("should accept valid worker IDs", () => {
      expect(() => setWorkerId(0)).not.toThrow();
      expect(() => setWorkerId(1)).not.toThrow();
      expect(() => setWorkerId(1023)).not.toThrow();
    });

    it("should reject invalid worker IDs", () => {
      expect(() => setWorkerId(-1)).toThrow();
      expect(() => setWorkerId(1024)).toThrow();
    });

    it("should use the new worker ID in generated IDs", () => {
      setWorkerId(42);
      const id = generateId();
      const parsed = parseId(id);
      expect(parsed.workerId).toBe(42);
      setWorkerId(1);
    });
  });
});
