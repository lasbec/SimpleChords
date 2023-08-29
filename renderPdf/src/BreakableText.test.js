import { describe, it, expect } from "vitest";
import { BreakableText } from "./BreakableText.js";

/** @type {import("./BreakableText.js").StrLikeImpl<string>} */
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
  describe("break", () => {
    it("empty", () => {
      const text = BreakableText.fromString(StrLikeImplOnString, "");
      const [str, rest] = text.break({ before: 10, after: 0 });
      expect([str, rest.text]).toEqual(["", ""]);
    });
    it("simple", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "simple test should breake before this",
        "middle"
      );
      const [str, rest] = text.break({ before: 35, after: 0 });
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
      const [str, rest] = text.break({ before: 35, after: 33 });
      expect([str, rest.text]).toEqual([
        "simple test should breake before th",
        "is",
      ]);
    });
    it("use after", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "simple test should breake before this",
        "middle"
      );
      const [str, rest] = text.break({ before: 35, after: 19 });
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
      const [str, rest] = text.break({ before: 1000, after: 0 });
      expect([str, rest.text]).toEqual([
        "Some simple sentence can be written down. ",
        "Another Sentence too.",
      ]);
    });
  });
  it("breakeToMaxLen", () => {
    const text = BreakableText.fromString(
      StrLikeImplOnString,
      "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.",
      "middle"
    );
    expect(
      text.breakUntil((/** @type {string | any[]} */ str) =>
        str.length > 100 ? { before: 100, after: 0 } : undefined
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
  it("die Lunge verse 1", () => {
    const verse = [
      "Oj, joy, joy wo ist die Luft, die Luft in meiner Lunge,",
      "zum Sprechen reicht sie lang nicht mehr, im Mund liegt lahm die Zunge. ",
      "Mein Atem ist fast ausgelöscht und dennoch kann ich singen,",
      "da ist noch was ganz tief in mir bringt mich manchmal zum Klingen.",
    ];
    const text = BreakableText.fromPrefferdLineUp(StrLikeImplOnString, verse);
    expect(
      text.breakUntil((/** @type {string | any[]} */ str) =>
        str.length > 100 ? { before: 100, after: 0 } : undefined
      )
    ).toEqual(verse);
  });
  it("Der Wagen verse 1", () => {
    const verse = [
      "Staub, Staub und Steppenland,",
      "zwei alte Mulis am Wegesrand",
      "ziehen den Wagen aus der Stadt,",
      "weiter nach Osten dreht sich das Rad.",
    ];
    const text = BreakableText.fromPrefferdLineUp(StrLikeImplOnString, verse);
    expect(
      text.breakUntil((/** @type {string | any[]} */ str) =>
        str.length > 70 ? { before: 70, after: 0 } : undefined
      )
    ).toEqual([
      "Staub, Staub und Steppenland,zwei alte Mulis am Wegesrand",
      "ziehen den Wagen aus der Stadt,weiter nach Osten dreht sich das Rad.",
    ]);
  });
});
