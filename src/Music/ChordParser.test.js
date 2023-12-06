import { describe, it, expect } from "vitest";
import { chordFromString } from "./ChordParser.js";

describe("ChordParser", () => {
  it("Am", () => {
    expect(chordFromString("Am")).toEqual({
      baseNote: 0,
      chordType: "minor",
    });
  });
  it("cis", () => {
    expect(chordFromString("cis")).toEqual({
      baseNote: 4,
      chordType: "minor",
    });
  });
  it("B_Dim7", () => {
    expect(chordFromString("B_Dim7")).toEqual({
      baseNote: 2,
      chordType: "diminished7",
    });
  });
});
