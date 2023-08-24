import { Chord } from "./Chord.js";
import { ParsingError } from "./ParsingError.js";

/**
 *
 * @param {string} input
 */
export function parseSongAST(input) {
  try {
    return new ChordsParsingProcedure(input).parse();
  } catch (error) {
    if (error instanceof ParsingError) {
      console.error(error.toString());
      return null;
    }
    throw error;
  }
}

class ChordsParsingProcedure {
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
    /** @type {SongSection[]} */
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
    let sectionHeading = "";
    if (this.currentChar() === "[") {
      sectionHeading = this.readSectionHeading();
      this.log("section heading parsed", sectionHeading);
    } else {
      this.log("no section heading");
    }

    /** @type {SongLine[]} */
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
    // const chord = Chord.fromString(chordString);
    // if (!chord) {
    //   const similar = Chord.getSimilarWrittenChord(chordString);
    //   this.throwInvalidChord({
    //     actual: chordString,
    //     hint: similar ? `Did you mean '${similar}'?` : "",
    //   });
    // }
    // return chord;
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

/**
 * @typedef {object} ChordsLineElement
 * @property {number} startIndex
 * @property {string} chord
 */

/**
 * @typedef {object} SongAst
 * @property {string} heading
 * @property {SongSection[]} sections
 */

/**
 * @typedef {object} SongSection
 * @property {string} sectionHeading
 * @property {SongLine[]} lines
 */

/**
 * @typedef {object} SongLine
 * @property {string} lyric
 * @property {ChordsLineElement[]} chords
 */
