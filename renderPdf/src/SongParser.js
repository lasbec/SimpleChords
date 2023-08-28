import { ParsingError } from "./ParsingError.js";

/**
 *
 * @param {string} input
 */
export function parseSong(input) {
  try {
    const ast = new SongParser(input).parse();
    return Song.fromAst(ast);
  } catch (error) {
    if (error instanceof ParsingError) {
      console.error(error.toString());
      return null;
    }
    throw error;
  }
}

class SongParser {
  /** @type {string} */
  input;

  /** @type {number} */
  totalIndex;
  /** @type {number} */
  lineIndex;
  /** @type {number} */
  charIndex;

  debug = false;
  /**@param {*[]} msg*/
  log(...msg) {
    if (this.debug) {
      console.log(
        msg,
        `(current char: '${this.currentChar()}', line: ${this.lineIndex}:${
          this.charIndex
        })`
      );
    }
  }

  /** @param {string} input */
  constructor(input) {
    this.input = input;
    this.totalIndex = 0;
    this.charIndex = 0;
    this.lineIndex = 0;
  }

  currentChar() {
    return this.input[this.totalIndex];
  }

  setCheckpoint() {
    const totalIndexCheckpoint = this.totalIndex;
    const charIndexCheckpoint = this.charIndex;
    const lineIndexCheckpoint = this.lineIndex;
    return {
      jumpToCheckpoint: () => {
        this.totalIndex = totalIndexCheckpoint;
        this.charIndex = charIndexCheckpoint;
        this.lineIndex = lineIndexCheckpoint;
      },
    };
  }

  skipEmptyLines() {
    let checkpointAtLineBeginning = this.setCheckpoint();
    while ([" ", "\t", "\n", "\r"].includes(this.currentChar())) {
      const lineEnd = this.currentChar() === "\n";
      this.stepOn();
      if (lineEnd) {
        checkpointAtLineBeginning = this.setCheckpoint();
      }
    }
    checkpointAtLineBeginning.jumpToCheckpoint();
  }

  stepOn() {
    // const caller = new Error().stack.split("\n")[3].split(".")[1].split(" ")[0];
    const oldChar = this.currentChar();
    if (!oldChar) this.throwUnexpectedEndOfFile();
    this.totalIndex += 1;
    this.charIndex += 1;
    if (oldChar == "\n") {
      this.lineIndex += 1;
      this.charIndex = 0;
    }
    return oldChar;
  }

  /**
   * @returns {SongAst}
   */
  parse() {
    const heading = this.readHeading();
    this.log("Parsed heading:", heading);
    this.readBodyBeg();
    const sections = this.readBody();
    return { heading, sections };
  }

  readHeading() {
    if (this.currentChar() !== "#") {
      this.throwUnexpectedToken({
        actual: this.currentChar(),
        expected: "#",
      });
    }
    this.stepOn();
    return this.readLine().trim();
  }

  readBody() {
    /** @type {SongSectionNode[]} */
    let result = [];
    while (this.currentChar() !== "`") {
      const section = this.readSection();
      this.log("Section parsed", section.sectionHeading);
      result.push(section);
    }
    this.readBodyEnd();
    return result;
  }

  readSectionHeading() {
    if (this.currentChar() != "[") {
      this.throwUnexpectedToken({
        actual: this.currentChar(),
        expected: "[",
      });
    }
    this.stepOn();
    const line = this.readLine().trim();
    if (line[line.length - 1] !== "]") {
      this.throwUnexpectedToken({
        actual: this.currentChar(),
        expected: "]",
      });
    }
    return line.slice(0, -1);
  }

  readSection() {
    this.skipEmptyLines();
    let sectionHeading = "";
    if (this.currentChar() === "[") {
      sectionHeading = this.readSectionHeading();
      this.log("section heading parsed", sectionHeading);
    } else {
      this.log("no section heading");
    }

    this.skipEmptyLines();
    /** @type {SongLineNode[]} */
    const lines = [];
    while (!["`", "["].includes(this.currentChar())) {
      const chords = this.readChordsLine();
      this.log("parsed chords line", chords);
      const lyric = this.readLine();
      this.log("parsed lyric line", lyric);
      lines.push({
        chords,
        lyric,
      });
      this.skipEmptyLines();
    }
    return {
      sectionHeading,
      lines,
    };
  }

  readBodyBeg() {
    this.readWhiteSpace();
    this.readThreeTick();
  }

  readWhiteSpace() {
    while ([" ", "\n", "\t", "\r"].includes(this.currentChar())) {
      this.stepOn();
    }
  }

  readThreeTick() {
    const line = this.readLine();
    this.log("Read three ticks", line);
    if (line.trim() !== "```") {
      this.throwUnexpectedToken({
        expected: "```",
        actual: line.trim(),
      });
    }
  }

  readBodyEnd() {
    this.readThreeTick();
  }

  readChordsLine() {
    /** @type {ChordsLineElement[]}  */
    const result = [];
    this.readWhiteSpaceExceptLineBreak();
    while (this.currentChar() !== "\n") {
      const startIndex = this.charIndex;
      const chord = this.chord();
      result.push({
        chord,
        startIndex,
      });
      this.readWhiteSpaceExceptLineBreak();
    }
    this.stepOn();
    return result;
  }

  chord() {
    const chordString = this.readNoneWithespace();
    return chordString;
  }

  readWhiteSpaceExceptLineBreak() {
    while ([" ", "\t"].includes(this.currentChar())) {
      this.stepOn();
    }
  }

  readNoneWithespace() {
    let result = "";
    while (![" ", "\n", "\t", "\r"].includes(this.currentChar())) {
      result += this.stepOn();
    }
    return result;
  }

  readLine() {
    let result = "";
    while (this.currentChar() !== "\n") {
      result += this.stepOn();
    }
    this.stepOn(); // skip linebreak
    return result;
  }

  throwUnexpectedToken({ expected, actual }) {
    throw new ParsingError("Unexpected token", {
      expected,
      actual,
      cursor: {
        lineIndex: this.lineIndex,
        charIndex: this.charIndex,
      },
    });
  }

  throwUnexpectedEndOfFile() {
    throw new ParsingError("Unexpected end of file", {
      cursor: {
        lineIndex: this.lineIndex,
        charIndex: this.charIndex,
      },
    });
  }

  throwInvalidChord({ actual, hint }) {
    throw new ParsingError("Invalid chord", {
      cursor: {
        lineIndex: this.lineIndex,
        charIndex: this.charIndex,
      },
      actual,
      hint,
    });
  }
}

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
    console.log("res", result);
    return new SongLine(result);
  }

  *[Symbol.iterator]() {
    for (const c of this.chars) {
      yield c;
    }
  }

  /**
   *
   * @param {SongLine[]} others
   */
  concat(others) {
    return new SongLine([...this.chars, ...others.flatMap((o) => o.chars)]);
  }
}

/**
 * @typedef {object} LyricChar
 * @property {string} char
 * @property {string | null} chord
 */

/**
 * @typedef {object} SongAst
 * @property {string} heading
 * @property {SongSectionNode[]} sections
 */

/**
 * @typedef {object} SongSectionNode
 * @property {string} sectionHeading
 * @property {SongLineNode[]} lines
 */

/**
 * @typedef {object} SongLineNode
 * @property {string} lyric
 * @property {ChordsLineElement[]} chords
 *
 */

/**
 * @typedef {object} ChordsLineElement
 * @property {number} startIndex
 * @property {string} chord
 */
