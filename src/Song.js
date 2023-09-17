/**
 * @typedef {import("./SongParser.js").SongAst} SongAst
 * @typedef {import("./SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("./SongParser.js").SongLineNode}  SongLineNode
 */
import { WellKnownSectionType } from "./SongChecker.js";

export class Song {
  /**@type {string}*/
  heading;
  /**@type {SongSection[]}*/
  sections;
  /**
   * @param {string} heading
   * @param {SongSection[]} sections
   * @private
   */
  constructor(heading, sections) {
    this.heading = heading;
    this.sections = sections;
  }

  /**
   *
   * @param {SongAst} ast
   */
  static fromAst(ast) {
    /** @type {SongSection[]} */
    const sections = ast.sections.map((s) => ({
      type: s.type.trim().toLowerCase() || WellKnownSectionType.Verse,
      lines: s.lines.map(SongLine.fromSongLineNode),
    }));
    return new Song(ast.heading, sections);
  }
}

/**
 * @typedef {object} SongSection
 * @property {string} type
 * @property {SongLine[]} lines
 */

export class SongLine {
  /**
   * @readonly
   * @type {ReadonlyArray<LyricChar>}
   */
  chars;

  /**
   * @readonly
   * @type {string}
   */
  lyric;

  /**
   * @param {ReadonlyArray<LyricChar>} chars
   * @private
   */
  constructor(chars) {
    this.chars = chars;
    this.lyric = chars.map((c) => c.char).join("");
  }

  get length() {
    return this.lyric.length;
  }

  /**
   *
   * @param {number} index
   * @returns {string}
   */
  charAt(index) {
    return this.lyric.charAt(index);
  }

  get chords() {
    /** @type {ChordsLineElement[]} */
    const result = [];
    let index = 0;
    for (const char of this.chars) {
      if (char.chord) {
        result.push({
          chord: char.chord,
          startIndex: index,
        });
      }
      index += 1;
    }
    return result;
  }

  /**
   * @param {SongLineNode} node
   * @returns {SongLine}
   */
  static fromSongLineNode(node) {
    const startIndexOfLastChord =
      node.chords.length === 0
        ? 0
        : node.chords[node.chords.length - 1].startIndex + 1;

    /**@type {LyricChar[]} */
    const result = node.lyric
      .padEnd(startIndexOfLastChord, " ")
      .split("")
      .map((c, i) => ({ char: c, chord: null, index: i }));
    for (const chord of node.chords) {
      const lyricChar = result[chord.startIndex];
      lyricChar.chord = chord.chord;
    }
    return new SongLine(SongLine.ensureSpaceAtEnd(result));
  }

  /** @returns {Iterator<string>} */
  *[Symbol.iterator]() {
    for (const c of this.chars) {
      yield c.char;
    }
  }

  /**
   * @param {SongLine[]} others
   */
  concat(others) {
    return SongLine.concat([this, ...others]);
  }

  /**
   *
   * @param {LyricChar[]} chars
   * @returns {LyricChar[]}
   */
  static ensureSpaceAtEnd(chars) {
    if (chars[chars.length - 1]?.char === " ") {
      return chars;
    }
    return [...chars, { char: " ", chord: null }];
  }

  /** @param {SongLine[]} lines*/
  static concat(lines) {
    return new SongLine(lines.flatMap((o) => o.chars));
  }

  /**
   *
   * @param {SongLine} line
   * @param {number} start
   * @param {number=} stop
   */
  static slice(line, start, stop) {
    return new SongLine(line.chars.slice(start, stop));
  }

  /**
   * @param {number} start
   * @param {number=} stop
   */
  slice(start, stop) {
    return SongLine.slice(this, start, stop);
  }

  isEmpty() {
    return this.chars.length === 0;
  }
}

/**
 * @typedef {object} LyricChar
 * @property {string} char
 * @property {string | null} chord
 */
