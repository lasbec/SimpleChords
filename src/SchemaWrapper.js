/**
 * @typedef {import("./Song.js").SongSection} SongSection
 * @typedef {import("./Song.js").Song} Song
 * @typedef {import("./Length.js").Length} Length
 * @typedef {import("./RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("./Drawing/TextConfig.js").TextConfig} TextConfig
 */
import { BreakableText } from "./BreakableText.js";
import { SongLine } from "./Song.js";
import { WellKnownSectionType } from "./SongChecker.js";

/**
 * @param {string} str
 * @param {TextConfig} style
 * @param {Length} width
 */
function fitsWidth(str, style, width) {
  return style.widthOfText(str).lt(width);
}

/**
 * @param {SongLine} line
 * @param {TextConfig} style
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
  /** @type {LayoutConfig}*/
  style;
  /** @type {Result[]}*/
  results;
  /** @type {Record<string, Result[]>}*/
  resultsBySectionType;

  /**
   * @param {Song} song
   * @param {Length} width
   * @param {LayoutConfig} style
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
   * @param {TextConfig} textConfig
   * @returns {number}
   */
  possibleChordsAInLine(line, textConfig) {
    const maxLen = getMaxLenToFitWidth(line.text, textConfig, this.width);
    const args = { maxLineLen: maxLen, minLineLen: 0 };
    if (maxLen > 1) {
      const [x, _] = line.break(args);
      return x.chords.length;
    }
    return line.text.chords.length;
  }

  /**
   *
   * @param {Result} result
   * @param {number} chordIndex
   * @param {TextConfig} textConfig
   */
  breakLineAfterChord(result, chordIndex, textConfig) {
    const c0 = result.toBeProcessed.text.chords[chordIndex];
    const maxLineLen = getMaxLenToFitWidth(
      result.toBeProcessed.text,
      textConfig,
      this.width
    );
    const minLineLen = (c0?.startIndex ?? -1) + 1;
    if (
      result.toBeProcessed.text.length <= maxLineLen ||
      result.toBeProcessed.text.length <= 1
    ) {
      if (result.toBeProcessed.text.length > 1) {
        result.lines.push(result.toBeProcessed.text.trim());
      }
      result.toBeProcessed = BreakableText.fromString(
        SongLine,
        SongLine.fromSongLineNode({
          lyric: "",
          chords: [],
        })
      );
      return;
    }
    const [newLine, rest] = result.toBeProcessed.break({
      minLineLen,
      maxLineLen,
    });
    if (newLine.length > 0) result.lines.push(newLine.trim());

    result.toBeProcessed = rest;
  }

  /**@param {string} type */
  sectionTextConfig(type) {
    if (type === WellKnownSectionType.Chorus)
      return this.style.chorusTextConfig;
    if (type === WellKnownSectionType.Ref) return this.style.refTextConfig;
    return this.style.lyricTextConfig;
  }

  breakLines() {
    for (const [sectionType, results] of Object.entries(
      this.resultsBySectionType
    )) {
      const textConfig = this.sectionTextConfig(sectionType);
      const min = Math.min(
        ...results.map((r) =>
          this.possibleChordsAInLine(r.toBeProcessed, textConfig)
        )
      );
      results.forEach((r) => {
        this.breakLineAfterChord(r, min - 1, textConfig);
      });
    }
  }

  isDone() {
    return this.results.every((v) => v.toBeProcessed.lenght <= 1);
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
