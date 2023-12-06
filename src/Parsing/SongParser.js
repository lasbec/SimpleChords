import { chordFromString } from "../Music/ChordParser.js";
import { WellKnownSectionType } from "../Song/SongChecker.js";
import { ParsingError } from "./ParsingError.js";

/**
 *
 * @param {string} input
 */
export function parseSongAst(input) {
  try {
    return new SongParser(input).parse();
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

  /**
   *
   * @param {boolean=} expectFileEnd
   * @returns
   */
  stepOn(expectFileEnd) {
    // const caller = new Error().stack.split("\n")[3].split(".")[1].split(" ")[0];
    const oldChar = this.currentChar();
    if (!oldChar && !expectFileEnd) this.throwUnexpectedEndOfFile();
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
    return this.readLineIgnoreComments().trim();
  }

  readBody() {
    /** @type {SongSectionNode[]} */
    let result = [];
    while (this.currentChar() !== "`") {
      const section = this.readSection();
      this.log("Section parsed", section.type);
      result.push(section);
    }
    this.readBodyEnd();
    return result;
  }

  readSectionType() {
    if (this.currentChar() !== "[") {
      this.throwUnexpectedToken({
        actual: this.currentChar(),
        expected: "[",
      });
    }
    this.stepOn();
    const line = this.readLineIgnoreComments().trim();
    if (line[line.length - 1] !== "]") {
      this.throwUnexpectedToken({
        actual: this.currentChar(),
        expected: "]",
      });
    }
    const sectionType = line.slice(0, -1).trim().toLocaleLowerCase();
    if (sectionType === "ref") return WellKnownSectionType.Refrain;
    if (sectionType === "vorspiel") return WellKnownSectionType.Intro;
    if (sectionType === "instrumental") return WellKnownSectionType.Interlude;
    if (sectionType === "übergang") return WellKnownSectionType.Interlude;
    if (sectionType === "nachspiel") return WellKnownSectionType.Outro;
    if (sectionType === "schluss") return WellKnownSectionType.Outro;
    return sectionType || "verse";
  }

  readSection() {
    this.skipEmptyLines();
    let type = "";
    if (this.currentChar() === "[") {
      type = this.readSectionType();
      this.log("section heading parsed", type);
    } else {
      this.log("no section heading");
    }

    this.skipEmptyLines();
    /** @type {SongLineNode[]} */
    const lines = [];
    while (!["`", "["].includes(this.currentChar())) {
      const chords = this.readChordsLine();
      this.log("parsed chords line", chords);
      const lyric = this.readLineIgnoreComments();
      this.log("parsed lyric line", lyric);
      lines.push({
        chords,
        lyric,
      });
      this.skipEmptyLines();
    }
    return {
      type,
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
    const line = this.readLineIgnoreComments();
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
    if (this.currentChar() === "$") {
      // this char is needed to mark empty chordlines
      this.stepOn();
    }
    while (this.currentChar() !== "\n") {
      const startIndex = this.charIndex;
      const chord = this.chord();
      const conditional = chord.startsWith("(") && chord.endsWith(")");
      const parsedChord = chordFromString(
        conditional ? chord.slice(1, -1) : chord
      );
      result.push({
        chord,
        conditional,
        parsedChord,
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

  tryReadLineComment() {
    if (this.currentChar() === "\\") {
      const cp = this.setCheckpoint();
      this.stepOn();
      if (this.currentChar() === "\\") {
        return this.readLine();
      }
      cp.jumpToCheckpoint();
    }
  }

  readLineIgnoreComments() {
    let result = "";
    while (this.currentChar() !== "\n" && this.currentChar() !== undefined) {
      const lineComment = this.tryReadLineComment();
      if (lineComment !== undefined) {
        return result;
      }
      result += this.stepOn();
    }
    this.stepOn(true); // skip linebreak but it's  ok when end of file is reached
    return result;
  }

  readLine() {
    let result = "";
    while (this.currentChar() !== "\n" && this.currentChar() !== undefined) {
      result += this.stepOn();
    }
    this.stepOn(true); // skip linebreak but it's  ok when end of file is reached
    return result;
  }

  /**
   * @param {ExpectedActual} arg
   */
  throwUnexpectedToken(arg) {
    const { expected, actual } = arg;
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

  /**
   * @param {InvalidChordArgs} arg
   */
  throwInvalidChord(arg) {
    const { actual, hint } = arg;
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

/**
 * @typedef {object} ExpectedActual
 * @property {string} expected
 * @property {string} actual
 */

/**
 * @typedef {object} InvalidChordArgs
 * @property {string} actual
 * @property {string} hint
 */
/**
 * @typedef {object} SongAst
 * @property {string} heading
 * @property {SongSectionNode[]} sections
 */

/**
 * @typedef {object} SongSectionNode
 * @property {string} type
 * @property {SongLineNode[]} lines
 */

/**
 * @typedef {object} SongLineNode
 * @property {string} lyric
 * @property {ChordsLineElement[]} chords
 *
 */

/**
 * @typedef {import("../Music/Chords.js").Chord} Chord
 */

/**
 * @typedef {object} ChordsLineElement
 * @property {number} startIndex
 * @property {string} chord
 * @property {Chord=} parsedChord
 * @property {boolean} conditional
 */
