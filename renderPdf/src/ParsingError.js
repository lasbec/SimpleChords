export function notNullish(x) {
  return x !== undefined && x !== null;
}

export class ParsingError extends Error {
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
    if (notNullish(this.expected)) {
      result += ` expected '${this.expected}'`;
    }
    if (notNullish(this.actual)) {
      result += ` got '${this.actual}'`;
    }
    if (this.hint) {
      result += "\n" + this.hint;
    }
    return result;
  }
}

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
