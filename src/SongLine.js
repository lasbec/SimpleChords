/**
 * @typedef {import("./SongParser.js").SongAst} SongAst
 * @typedef {import("./SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("./SongParser.js").SongLineNode}  SongLineNode
 */

/**
 * @typedef {object} LyricChar
 * @property {string} char
 * @property {string | null} chord
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

  toString() {
    return `<SongLine ${this.lyric}>`;
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

  trim() {
    const firstNotEmptyIndex = this.chars.findIndex(
      (c) => c.char !== " " || !!c.chord
    );
    let lastNotEmptyIndex = 0;
    this.chars.forEach((c, i) => {
      if (c.char !== " " || !!c.chord) {
        lastNotEmptyIndex = i;
      }
    });
    return this.slice(firstNotEmptyIndex, lastNotEmptyIndex + 1);
  }

  isEmpty() {
    return this.chars.length === 0;
  }
}
