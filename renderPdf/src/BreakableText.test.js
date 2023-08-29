import { describe, it, expect } from "vitest";
import { BreakableText } from "./BreakableText.js";

describe("BreakableText", () => {
  describe("break", () => {
    it("empty", () => {
      const text = BreakableText.fromString("");
      expect(text.break({ beforeIndex: 10, afterIndex: 0 })).toEqual(["", ""]);
    });

    it("simple", () => {
      const text = BreakableText.fromString(
        "simple test should breake before this"
      );
      expect(text.break({ beforeIndex: 35, afterIndex: 0 })).toEqual([
        "simple test should ",
        "breake before this",
      ]);
    });

    it("force word wrap", () => {
      const text = BreakableText.fromString(
        "simple test should breake before this"
      );
      expect(text.break({ beforeIndex: 35, afterIndex: 33 })).toEqual([
        "simple test should breake before th",
        "is",
      ]);
    });

    it("use after", () => {
      const text = BreakableText.fromString(
        "simple test should breake before this"
      );
      expect(text.break({ beforeIndex: 35, afterIndex: 19 })).toEqual([
        "simple test should breake ",
        "before this",
      ]);
    });

    it("take a point and big beforeIndex", () => {
      const text = BreakableText.fromString(
        "Some simple sentence can be written down. Another Sentence too."
      );
      expect(text.break({ beforeIndex: 1000, afterIndex: 0 })).toEqual([
        "Some simple sentence can be written down. ",
        "Another Sentence too.",
      ]);
    });
  });

  it("breakeToMaxLen", () => {
    const text = BreakableText.fromString(
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet."
    );
    expect(
      text.breakUntil((/** @type {string | any[]} */ str) =>
        str.length > 100 ? { beforeIndex: 100, afterIndex: 0 } : undefined
      )
    ).toEqual([
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ",
      "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, ",
      "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. ",
      "Stet clita kasd gubergren, ",
      "no sea takimata sanctus est Lorem ipsum dolor sit amet. ",
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, ",
      "sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, ",
      "sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. ",
      "Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
    ]);
  });
});
