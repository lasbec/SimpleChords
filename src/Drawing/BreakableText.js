import { range } from "../Shared/ArrayUtils.js";
/**
 * @template StrLike
 * @typedef {{slice(s:StrLike, start:number, stop?:number):StrLike, concat(s:StrLike[]):StrLike,  emptyAt(s: StrLike, index:number):boolean | undefined}} StrLikeImpl
 */
/**
 * @typedef {Iterable<string> & {length:number; charAt(index:number):string; toString():string;}} StrLikeConstraint
 */

/**
 * @template StrLike
 * @callback BreakUntilPredicate
 * @param {StrLike} str
 * @returns {LineBreakingArgs | undefined}
 */

/**
 * Class to wrap text.
 * Goal is to offer functionality to break a paragraph into lines.
 * @template {StrLikeConstraint} StrLike
 */
export class BreakableText {
  /** @type {StrLikeImpl<StrLike>} */
  strImpl;
  /**
   * @type {StrLike}
   */
  text;

  /** @type {number} */
  lenght;
  /** @type {"middle" | "right"} */
  favor;

  /** @type {number[]} */
  favoriteBreakingIndices;

  /**
   * @param {StrLikeImpl<StrLike>} strImpl
   * @param {StrLike} text
   * @param {number[]} favoriteBreakingIndices
   * @param {"middle" | "right"} favor
   * @private
   */
  constructor(strImpl, text, favoriteBreakingIndices, favor) {
    this.strImpl = strImpl;
    this.text = text;
    this.favoriteBreakingIndices = favoriteBreakingIndices;
    this.lenght = text.length;
    this.favor = favor;
  }

  /**
   * @template {StrLikeConstraint} StrLike
   * @param {StrLikeImpl<StrLike>} strImpl
   * @param {StrLike} str
   * @param {"middle" | "right"} favor
   */
  static fromString(strImpl, str, favor = "right") {
    return new BreakableText(strImpl, str, [], favor);
  }

  /**
   * @template {StrLikeConstraint} StrLike
   * @param {StrLikeImpl<StrLike>} strImpl
   * @param {StrLike[]} lines
   * @param {"middle" | "right"} favor
   */
  static fromPrefferdLineUp(strImpl, lines, favor = "right") {
    /** @type {number[]} */
    const favoriteBreakingLengths = [];
    for (const line of lines) {
      if (line.length === 0) continue;
      const prevLen =
        favoriteBreakingLengths[favoriteBreakingLengths.length - 1];
      favoriteBreakingLengths.push((prevLen || 0) + line.length);
    }
    return new BreakableText(
      strImpl,
      strImpl.concat(lines),
      favoriteBreakingLengths,
      favor
    );
  }

  /**
   * @param {number} start
   * @param {number=} stop
   */
  slice(start, stop) {
    return new BreakableText(
      this.strImpl,
      this.strImpl.slice(this.text, start, stop),
      this.favoriteBreakingIndices
        .filter((i) => start <= i && (!stop || i < stop))
        .map((i) => i - start),
      this.favor
    );
  }

  firstNotEmptyCharIndex() {
    for (let i = 0; i < this.text.length; i += 1) {
      if (!this.strImpl.emptyAt(this.text, i)) return i;
    }
    return;
  }

  lastNotEmptyCharIndex() {
    for (let i = this.text.length - 1; i >= 0; i -= 1) {
      if (!this.strImpl.emptyAt(this.text, i)) return i;
    }
    return;
  }

  trim() {
    const firstNotEmptyIndex = this.firstNotEmptyCharIndex();
    const lastNotEmptyIndex = this.lastNotEmptyCharIndex();
    if (firstNotEmptyIndex === undefined || lastNotEmptyIndex === undefined)
      return this.slice(0, 0);
    return this.slice(firstNotEmptyIndex, lastNotEmptyIndex + 1);
  }

  /**
   * @param {LineBreakingArgs} _args
   * @returns {[StrLike, BreakableText<StrLike>, number]}
   */
  break(_args) {
    const args = {
      minLineLen: Math.min(Math.max(1, _args.minLineLen), this.text.length - 1),
      maxLineLen: Math.max(Math.min(this.text.length, _args.maxLineLen), 1),
    };
    if (this.text.length <= 1) {
      throw new Error("Not allowed to break empty or one character line.");
    }
    if (args.maxLineLen < args.minLineLen) {
      throw new Error("MaxLineLen must not be smaller than MinLineLen");
    }
    const { result: candidateLineLengths, badness } =
      this.getMostPreferrableLineLengths(args);

    const prefferdTarget =
      this.favor === "middle"
        ? (args.maxLineLen - args.minLineLen) / 2
        : this.text.length;
    const breakingLen = findClosestTo(candidateLineLengths, prefferdTarget);
    if (!breakingLen) throw new Error("No breaking length found.");

    const topLine = this.strImpl.slice(this.text, 0, breakingLen);
    return [topLine, this.slice(breakingLen), badness];
  }

  /**
   *
   * @param {LineBreakingArgs} args
   * @returns {{result:Array<number>, badness:number}}
   */
  getMostPreferrableLineLengths(args) {
    const prio1 = this.prio1Length(args);
    if (prio1.length > 0) return { result: prio1, badness: 0 };

    const prio2 = this.prio2Length(args);
    if (prio2.length > 0) return { result: prio2, badness: 10 };

    const prio3 = this.prio3Length(args);
    if (prio3.length > 0) return { result: prio3, badness: 20 };

    const prio4 = this.prio4Length(args);
    if (prio4.length > 0) return { result: prio4, badness: 30 };

    const prioLast = this.prioLastLength(args);
    return { result: prioLast, badness: 100 };
  }

  /**
   * Any index is ok.
   * @param {LineBreakingArgs} args
   * @returns {Array<number>}
   */
  prioLastLength(args) {
    return range(args.minLineLen, args.maxLineLen + 1);
  }

  /**
   * Prioritize linebreaks where last spaces are.
   * @param {LineBreakingArgs} args
   * @returns {Array<number>}
   */
  prio3Length(args) {
    /** @type {number[]} */
    const result = [];
    const r = range(
      // don't allow line breaks resulting in empty lines
      Math.max(args.minLineLen - 1, 1),
      args.maxLineLen
    );
    for (const i of r) {
      const char = this.text.charAt(i);
      const consecutive = this.text.charAt(i + 1);
      if (char === " ") {
        if (consecutive === " ") {
          continue;
        }
        result.push(i + 1);
      }
    }
    return result;
  }

  /**
   * Prioritize linebreaks where any spaces are.
   * @param {LineBreakingArgs} args
   * @returns {Array<number>}
   */
  prio4Length(args) {
    /** @type {number[]} */
    const result = [];
    const r = range(
      // don't allow line breaks resulting in empty lines
      Math.max(args.minLineLen - 1, 1),
      args.maxLineLen + 1
    );
    //  123456789   (substr len)
    //  012345768  (index)
    // " ab   fgh"
    for (const i of r) {
      const char = this.text.charAt(i);
      const consecutive = this.text.charAt(i + 1);
      if (char === " ") {
        result.push(i);
        if (consecutive !== " ") {
          result.push(i + 1);
        }
      }
    }
    return result;
  }

  /**
   * Prioritize breakes after punctuation
   * @param {LineBreakingArgs} args
   * @returns {Array<number>}
   */
  prio2Length(args) {
    const punctuation = [".", ",", ":", "!", "?", ";", "-", "|"];
    /** @type {number[]} */
    const result = [];
    for (const i of range(args.minLineLen - 1, args.maxLineLen + 1)) {
      const previous = this.text.charAt(i - 1);
      const char = this.text.charAt(i);
      const consecutive = this.text.charAt(i + 1);
      if (punctuation.includes(char)) {
        if (punctuation.includes(consecutive)) {
          continue;
        }
        if (previous === "|" && char === ":") {
          continue; // Don't break after repetion begin sign
        }
        if (consecutive === " ") {
          result.push(i + 2);
          continue;
        }
        result.push(i + 1);
      }
    }
    return result;
  }
  /**
   * @param {LineBreakingArgs} args
   * @returns {Array<number>}
   */
  prio1Length(args) {
    return this.favoriteBreakingIndices.filter(
      (i) => i <= args.maxLineLen && i >= args.minLineLen
    );
  }
}

/**
 * @typedef {object} FindIndicesOfArgs
 * @property {StrLikeConstraint} findIn
 * @property {string[]} searchFor
 */

/**
 *  @param {number[]} arr
 *  @param {number} i
 * */
function findClosestTo(arr, i) {
  if (arr.length === 0) return;
  let minDist = Math.abs(i - arr[0]);
  let result = arr[0];
  for (const candidate of arr) {
    const dist = Math.abs(i - candidate);
    if (dist <= minDist) {
      minDist = dist;
      result = candidate;
    }
  }
  return result;
}

/**
 * @typedef {object} LineBreakingArgs
 * @property {number} maxLineLen the maximum length the new first part of the linebreaking will have
 * @property {number} minLineLen the minimum length the new first part of the linebreaking will have
 */
