/**
 * @typedef {import("./SongParser.js").SongAst} SongAst
 * @typedef {import("./SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("./SongParser.js").SongLineNode}  SongLineNode
 */

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
      sectionHeading: s.sectionHeading,
      lines: s.lines.map(SongLine.fromSongLineNode),
    }));
    return new Song(ast.heading, sections);
  }
}

/**
 * @typedef {object} SongSection
 * @property {string} sectionHeading
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
    return new SongLine(result);
  }

  *[Symbol.iterator]() {
    for (const c of this.chars) {
      yield c;
    }
  }

  /**
   * @param {SongLine[]} others
   */
  concat(others) {
    return SongLine.concat([this, ...others]);
  }

  ensureSpaceAtEnd() {
    if (this.lyric.endsWith(" ")) {
      return this;
    }
    return new SongLine([...this.chars, { char: " ", chord: null }]);
  }

  /** @param {SongLine[]} lines*/
  static concat(lines) {
    return new SongLine(lines.flatMap((o) => o.ensureSpaceAtEnd().chars));
  }

  /**
   * @param {number} index the element on this index is included in the second line of the split.
   * @returns {[SongLine, SongLine]}
   */
  splitAt(index) {
    return [
      new SongLine(this.chars.slice(0, index)),
      new SongLine(this.chars.slice(index)),
    ];
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
