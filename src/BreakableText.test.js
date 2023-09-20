import { describe, it, expect } from "vitest";
import { BreakableText } from "./BreakableText.js";
import { SongLine } from "./Song.js";
/**
 * @typedef  {import("./BreakableText.js").StrLikeImpl<string>} StrLikeImpl
 * @typedef  {import("./Song.js").SongLineNode} SongLineNode
 */

/** @type {StrLikeImpl} */
const StrLikeImplOnString = {
  /**
   * @param {string} s
   * @param {number} start
   * @param {number=} stop
   */
  slice(s, start, stop) {
    return s.slice(start, stop);
  },

  /**
   * @param {string[]} strings
   */
  concat(strings) {
    return strings.join("");
  },
};

describe("BreakableText", () => {
  describe("prio lenght", () => {
    it("WhitespacePrio", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "Hallo Welt, mir geht es gut!"
      );
      expect(text.prio3Length({ minLineLen: 5, maxLineLen: 24 })).toEqual([
        6, 12, 16, 21, 24,
      ]);
      expect(text.prio3Length({ minLineLen: 6, maxLineLen: 23 })).toEqual([
        6, 12, 16, 21,
      ]);
    });
    it("weber bug whitespace", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        " Zähne:     Deutschland"
      );
      const args = { minLineLen: 12, maxLineLen: 13 };
      expect(text.prio3Length(args)).toEqual([12]);
    });
    it("multi whitespace", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        " Zähne:     Deutschland"
      );
      const args = { minLineLen: 0, maxLineLen: 20 };
      expect(text.prio3Length(args)).toEqual([12]);
    });
    it("multi whitespace any", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        " Zähne:     Deutschland"
      );
      const args = { minLineLen: 0, maxLineLen: 20 };
      expect(text.prio4Length(args)).toEqual([7, 8, 9, 10, 11, 12]);
    });
    it("PunctuationPrio", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "Begin |: Hallo, mir-geht es gut :| Ende"
      );
      expect(text.prio2Length({ minLineLen: 0, maxLineLen: 39 })).toEqual([
        16, 20, 35,
      ]);
    });
  });

  describe("break", () => {
    it("weber bug", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "Zähne:     Deutschland, wir weben dein Leichentuch, Wir weben hinein den dreifachen Fluch -"
      );
      const args = { minLineLen: 11, maxLineLen: 12 };
      const [str, rest] = text.break(args);
      expect([str, rest.text]).toEqual([
        "Zähne:     ",
        "Deutschland, wir weben dein Leichentuch, Wir weben hinein den dreifachen Fluch -",
      ]);
    });

    it("simple", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "simple test should breake before this",
        "middle"
      );
      const [str, rest] = text.break({ maxLineLen: 35, minLineLen: 0 });
      expect([str, rest.text]).toEqual([
        "simple test should ",
        "breake before this",
      ]);
    });
    it("force word wrap", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "simple test should breake before this",
        "middle"
      );
      const [str, rest] = text.break({ maxLineLen: 37, minLineLen: 34 });
      expect([str, rest.text]).toEqual([
        "simple test should breake before t",
        "his",
      ]);
    });
    it("use after", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "simple test should breake before this",
        "middle"
      );
      const [str, rest] = text.break({ maxLineLen: 35, minLineLen: 20 });
      expect([str, rest.text]).toEqual([
        "simple test should breake ",
        "before this",
      ]);
    });
    it("take a point and big beforeIndex", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "Some simple sentence can be written down. Another Sentence too.",
        "middle"
      );
      const [str, rest] = text.break({ maxLineLen: 1000, minLineLen: 1 });
      expect([str, rest.text]).toEqual([
        "Some simple sentence can be written down. ",
        "Another Sentence too.",
      ]);
    });
  });
});
