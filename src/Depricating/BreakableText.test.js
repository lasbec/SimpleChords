import { describe, it, expect } from "vitest";
import { BreakableText } from "./BreakableText.js";
import { SongLine } from "../Song.js";
/**
 * @typedef  {import("./BreakableText.js").StrLikeImpl<string>} StrLikeImpl
 * @typedef  {import("../Song.js").SongLineNode} SongLineNode
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
  describe("break", () => {
    it("empty", () => {
      const text = BreakableText.fromString(StrLikeImplOnString, "");
      const [str, rest] = text.break({ before: 10, after: 0 });
      expect([str, rest.text]).toEqual(["", ""]);
    });
    it("weber bug", () => {
      const text = BreakableText.fromString(
        StrLikeImplOnString,
        "sitzen am Webstuhl und fletschen die Zähne:     Deutschland, wir weben dein Leichentuch, Wir weben hinein den dreifachen Fluch -"
      );
      const [str, rest] = text.break({ after: 48, before: 49 });
      expect([str, rest.text]).toEqual([
        "sitzen am Webstuhl und fletschen die Zähne:     ",
        "Deutschland, wir weben dein Leichentuch, Wir weben hinein den dreifachen Fluch -",
      ]);
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

  it("Der Wagen verse 1 Song lines", () => {
    const verse = derWagenVerse1.map((l) => {
      return SongLine.fromSongLineNode(l);
    });
    const text = BreakableText.fromPrefferdLineUp(SongLine, verse);
    expect(
      text
        .breakUntil((str) =>
          str.length > 70 ? { before: 70, after: 0 } : undefined
        )
        .map((l) => l.lyric)
    ).toEqual([
      "Staub, Staub und Steppenland, zwei alte Mulis am Wegesrand ",
      "ziehen den Wagen aus der Stadt, weiter nach Osten dreht sich das Rad. ",
    ]);
  });
});

/** @type {SongLineNode[]} */
const derWagenVerse1 = [
  {
    chords: [
      {
        chord: "a",
        startIndex: 2,
      },
      {
        chord: "F",
        startIndex: 9,
      },
      {
        chord: "G",
        startIndex: 12,
      },
      {
        chord: "a",
        startIndex: 26,
      },
    ],
    lyric: "Staub, Staub und Steppenland,",
  },
  {
    chords: [
      {
        chord: "F",
        startIndex: 10,
      },
      {
        chord: "G",
        startIndex: 15,
      },
      {
        chord: "a",
        startIndex: 26,
      },
    ],
    lyric: "zwei alte Mulis am Wegesrand",
  },
  {
    chords: [
      {
        chord: "F",
        startIndex: 11,
      },
      {
        chord: "G",
        startIndex: 16,
      },
      {
        chord: "d",
        startIndex: 28,
      },
    ],
    lyric: "ziehen den Wagen aus der Stadt,",
  },
  {
    chords: [
      {
        chord: "a",
        startIndex: 12,
      },
      {
        chord: "E",
        startIndex: 17,
      },
      {
        chord: "a",
        startIndex: 34,
      },
    ],
    lyric: "weiter nach Osten dreht sich das Rad.",
  },
];
