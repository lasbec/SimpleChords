/**
 * @typedef {import("../Drawing/BreakableText.js").StrLikeConstraint} StrLikeContstraint
 */

/**
 * @typedef {import("../Parsing/SongParser.js").SongAst} SongAst
 * @typedef {import("../Parsing/SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("../Parsing/SongParser.js").SongLineNode}  SongLineNode
 */

/**
 * @typedef {object} LyricChar
 * @property {string} char
 * @property {string | null} chord
 */

/**
 * @implements {StrLikeContstraint}
 */
export class  SongLine {
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
   * @param {SongLine} line
   * @param {number} i
   */
  static emptyAt(line, i) {
    const char = line.chars[i];
    if (!char) return;
    return !char.char.trim() && !char.chord?.trim();
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

  static empty() {
    return SongLine.fromSongLineNode({
      lyric: "",
      chords: [],
    });
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
      .map((c, i) => ({ char: c, chord: null }));
    for (const chord of node.chords) {
      const lyricChar = result[chord.startIndex];
      lyricChar.chord = chord.chord;
    }
    return new SongLine(result);
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
   * @param {SongLine} line
   * @returns {SongLine}
   */
  static ensureSpaceAtEnd(line) {
    const chars = line.chars;
    if (chars[chars.length - 1]?.char === " ") {
      return new SongLine(chars);
    }
    return new SongLine([...chars, { char: " ", chord: null }]);
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
    let lastNotEmptyIndex = -1;
    this.chars.forEach((c, i) => {
      if (c.char !== " " || !!c.chord) {
        lastNotEmptyIndex = i;
      }
    });
    if (firstNotEmptyIndex === -1 || lastNotEmptyIndex === -1)
      return SongLine.empty();
    return this.slice(firstNotEmptyIndex, lastNotEmptyIndex + 1);
  }

  isEmpty() {
    return this.chars.length === 0;
  }
}
