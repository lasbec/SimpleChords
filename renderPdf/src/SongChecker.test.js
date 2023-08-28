import { expect, it, describe } from "vitest";
import { isChord } from "./SongChecker.js";

describe("SongChecker", () => {
  describe("isChord", () => {
    it("e", () => {
      expect(isChord("e")).toBeTruthy();
    });
  });
});
