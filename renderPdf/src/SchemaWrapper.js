/**
 * @typedef {import("./Song.js").SongSection} SongSection
 * @typedef {import("./Song.js").Song} Song
 * @typedef {import("./Page.js").TextStyle} TextStyle
 * @typedef {import("./Length.js").Length} Length
 */
import { BreakableText } from "./BreakableText.js";
import { SongLine } from "./Song.js";

/**
 * @param {string} str
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function fitsWidth(str, style, width) {
  return (
    style.font.widthOfTextAtSize(str, style.fontSize.in("pt")) <= width.in("pt")
  );
}

/**
 * @param {SongLine} line
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function getMaxLenToFitWidth(line, style, width) {
  let str = line.lyric;
  while (!fitsWidth(str, style, width)) {
    str = str.slice(0, -1);
  }
  return str.length;
}

/**
 * @typedef {SongSection & {toBeProcessed:BreakableText<SongLine> }} Result
 */
/**
 * Wrapping the sections of the same type in a way that they fit onto the page
 * AND in each line are the same amount of chords
 */
export class SchemaWrapper {
  /** @type {Song}*/
  song;
  /** @type {Length}*/
  width;
  /** @type {TextStyle}*/
  style;
  /** @type {Result[]}*/
  results;
  /** @type {Record<string, Result[]>}*/
  resultsBySectionType;

  /**
   * @param {Song} song
   * @param {Length} width
   * @param {TextStyle} style
   */
  constructor(song, width, style) {
    this.song = song;
    this.results = song.sections.map((s) => ({
      toBeProcessed: BreakableText.fromPrefferdLineUp(SongLine, s.lines),
      type: s.type,
      lines: [],
    }));
    this.resultsBySectionType = {};
    for (const r of this.results) {
      let results = this.resultsBySectionType[r.type];
      if (!results) {
        results = [];
        this.resultsBySectionType[r.type] = results;
      }
      results.push(r);
    }
    this.style = style;
    this.width = width;
  }

  /**
   * @param {BreakableText<SongLine>} line
   * @returns {number}
   */
  possibleChordsAInLine(line) {
    const maxLen = getMaxLenToFitWidth(line.text, this.style, this.width);
    const [x, _] = line.break({ before: maxLen + 1, after: 0 });
    return x.chords.length;
  }

  /**
   *
   * @param {Result} result
   * @param {number} chordIndex
   */
  breakLineAfterChord(result, chordIndex) {
    const c0 = result.toBeProcessed.text.chords[chordIndex];
    const c1 = result.toBeProcessed.text.chords[chordIndex + 1];
    const maxLen = getMaxLenToFitWidth(
      result.toBeProcessed.text,
      this.style,
      this.width
    );
    const before = Math.min(
      c1?.startIndex !== undefined
        ? c1.startIndex
        : result.toBeProcessed.lenght + 1,
      maxLen
    );
    const [newLine, rest] = result.toBeProcessed.break({
      after: (c0?.startIndex || -1) + 1,
      before,
    });
    if (newLine.length > 0) result.lines.push(newLine);
    result.toBeProcessed = rest;
  }

  breakLines() {
    for (const [sectionType, results] of Object.entries(
      this.resultsBySectionType
    )) {
      const min = Math.min(
        ...results.map((r) => this.possibleChordsAInLine(r.toBeProcessed))
      );
      results.forEach((r) => {
        this.breakLineAfterChord(r, min - 1);
      });
    }
  }

  isDone() {
    return this.results.every((v) => v.toBeProcessed.lenght === 0);
  }

  /** @returns {Song} */
  process() {
    let iterations = 0;
    while (!this.isDone()) {
      this.breakLines();
      iterations += 1;
      if (iterations > 1_000) {
        throw new Error("Max iterations exceeded");
      }
    }
    return {
      heading: this.song.heading,
      sections: this.results.map((r) => ({
        type: r.type,
        lines: r.lines,
      })),
    };
  }
}
