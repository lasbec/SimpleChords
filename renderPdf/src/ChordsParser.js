/**
 * @typedef {object} Cursor
 * @property {number} lineIndex
 * @property {number} charIndex
 */

/**
 * @typedef {object} ParsingErrorArgs
 * @property {Cursor} cursor
 * @property {string=} expected
 * @property {string=} actual
 * @property {string=} hint
 */

/**
 * @typedef {object} ChordsLineElement
 * @property {number} startIndex
 * @property {Chord} chord
 */

class Chord {
  /** @type {string} */
  str;

  /** @param {string} str*/
  constructor(str) {
    this.str;
  }

  toString() {
    return this.str;
  }

  /**@param {string} str */
  static fromString(str) {
    return new Chord(str);
  }

  /** @param {string} str*/
  static getSimilarWrittenChord(str) {
    return new Chord("Gm");
  }
}

/**
 * S -> Heading Body
 * Body -> ```\n InnerBody
 * InnerBody -> ChordLine TextLine InnerBody | \n```\n
 * ChordLine -> Chord Whitespace ChordLine | \n
 */
class ParsingError extends Error {
  /** @type {Cursor} */
  cursor;
  /** @type {string=} */
  expected;
  /** @type {string=} */
  actual;
  /** @type {string=} */
  hint;

  /**
   * @param {string} msg
   * @param {ParsingErrorArgs} args
   */
  constructor(msg, args) {
    super(msg);
    this.cursor = args.cursor;
    this.expected = args.expected;
    this.actual = args.actual;
    this.hint = args.hint;
  }

  toString() {
    let result = `${this.message} at line ${this.cursor.lineIndex}:${this.cursor.charIndex}`;
    if (this.expected || this.actual) {
      result += "\n";
    }
    if (this.expected) {
      result += ` expected '${this.expected}'`;
    }
    if (this.actual) {
      result += ` got '${this.actual}'`;
    }
    if (this.hint) {
      result += "\n" + this.hint;
    }
    return result;
  }
}

export class ChordsParsingProcedure {
  /**@type {string} */
  input;

  /**@type {number} */
  totalIndex;
  /**@type {number} */
  lineIndex;
  /**@type {number} */
  charIndex;

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

  start() {
    const heading = this.readHeading();
    const body = this.readBody();
    this.readBodyBeg();
    return { heading, body };
  }

  readHeading() {
    if (this.currentChar() !== "#") {
      this.throwUnexpectedToken({
        actual: this.currentChar(),
        expected: "#",
      });
    }
    this.stepOn();
    return this.readTextLine();
  }

  readBody() {
    if (this.currentChar() === "`") {
      this.readBodyEnd();
    } else {
      this.readChordsLine();
      this.readTextLine();
      this.readBody();
    }
  }

  readBodyBeg() {
    const line = this.readLine();
    if (line.trim() !== "```") {
      this.throwUnexpectedToken({
        expected: "```",
        actual: line.trim(),
      });
    }
  }

  readBodyEnd() {
    this.readBodyBeg();
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
    const chord = Chord.fromString(chordString);
    if (!chord) {
      const similar = Chord.getSimilarWrittenChord(chordString);
      this.throwInvalidChord({
        actual: chordString,
        hint: similar ? `Did you mean '${similar}'?` : "",
      });
    }
    return chord;
  }

  readTextLine() {
    return this.readLine();
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
