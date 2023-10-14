/**
 * @typedef {import("./Song.js").SongSection} SongSection
 * @typedef {import("./Song.js").Song} Song
 * @typedef {import("../Shared/Length.js").Length} Length
 * @typedef {import("../SongLayout/RenderSongAsPdf.js").LayoutConfig} LayoutConfig
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 * @typedef {import("../SongLayout/SongLineBox.js").SongLineBoxConfig} SongLineConfig
 */
import { BreakableText } from "../Drawing/BreakableText.js";
import { SongLine } from "./SongLine.js";
import { WellKnownSectionType } from "./SongChecker.js";
import { songLineBox } from "../SongLayout/SongLineBox.js";

/**
 * @param {SongLine} line
 * @param {SongLineConfig} style
 * @param {Length} width
 */
function getMaxLenToFitWidth(line, style, width) {
  let box = songLineBox(line, style);
  while (box.rectangle.width.gt(width)) {
    line = line.slice(0, -1);
    box = songLineBox(line, style);
  }
  return line.length;
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
   * @param {SongLineConfig} textConfig
   * @returns {number}
   */
  possibleChordsAInLine(line, textConfig) {
    let currMax = 0;
    for (const chord of line.text.chords) {
      const box = songLineBox(
        line.text.slice(0, chord.startIndex + 1),
        textConfig
      );
      if (box.rectangle.width.gt(this.width)) return currMax;
      currMax += 1;
    }
    return currMax;
  }

  /**
   *
   * @param {Result} result
   * @param {number} chordIndex
   * @param {SongLineConfig} songLineConf
   */
  breakLineAfterChord(result, chordIndex, songLineConf) {
    const c0 = result.toBeProcessed.text.chords[chordIndex];
    const c1 = result.toBeProcessed.text.chords[chordIndex + 1];
    const maxLineLen =
      c1?.startIndex ||
      getMaxLenToFitWidth(result.toBeProcessed.text, songLineConf, this.width);
    const minLineLen = (c0?.startIndex ?? -1) + 1;
    if (result.toBeProcessed.text.length <= maxLineLen) {
      if (result.toBeProcessed.text.length > 0) {
        result.lines.push(result.toBeProcessed.text.trim());
      }
      result.toBeProcessed = BreakableText.fromString(
        SongLine,
        SongLine.empty()
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
  sectionConfig(type) {
    if (type === WellKnownSectionType.Chorus)
      return this.style.chorusTextConfig;
    if (type === WellKnownSectionType.Refrain) return this.style.refTextConfig;
    return this.style.lyricTextConfig;
  }

  breakLines() {
    for (const [sectionType, results] of Object.entries(
      this.resultsBySectionType
    )) {
      const lyricConf = this.sectionConfig(sectionType);
      const lineConf = {
        lyricConfig: lyricConf,
        chordsConfig: this.style.chordTextConfig,
      };
      const min = Math.min(
        ...results.map((r) =>
          this.possibleChordsAInLine(r.toBeProcessed, lineConf)
        )
      );
      results.forEach((r) => {
        this.breakLineAfterChord(r, min - 1, lineConf);
      });
    }
  }

  isDone() {
    return this.results.every((v) => v.toBeProcessed.lenght <= 0);
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
