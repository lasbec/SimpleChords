export class Chord {
  /** @type {string} */
  str;

  /** @param {string} str*/
  constructor(str) {
    this.str;
  }

  toString() {
    return this.str;
  }

  toJSON() {
    return {
      chord: this.toString(),
    };
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
