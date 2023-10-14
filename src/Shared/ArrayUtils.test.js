import { describe, it, expect } from "vitest";
import { range } from "./ArrayUtils.js";

describe("ArrayUtils", () => {
  describe("range", () => {
    it("0 0", () => {
      expect(range(0, 0)).toEqual([]);
    });
    it("3 8", () => {
      expect(range(3, 8)).toEqual([3, 4, 5, 6, 7]);
    });
    it("-1 3", () => {
      expect(range(-1, 3)).toEqual([-1, 0, 1, 2]);
    });
  });
});
