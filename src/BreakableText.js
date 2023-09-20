/**
 * @template StrLike
 * @typedef {{slice(s:StrLike, start:number, stop?:number):StrLike, concat(s:StrLike[]):StrLike}} StrLikeImpl
 */

import { range } from "./ArrayUtils.js";

/**
 * @typedef {Iterable<string> & {length:number; charAt(index:number):string; toString():string}} StrLikeConstraint
 */

/**
 * @template StrLike
 * @callback BreakUntilPredicate
 * @param {StrLike} str
 * @returns {LineBreakingArgs | undefined}
 */

const punctuation = [".", ",", ":", "!", "?", ";"];
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
    const favoriteBreakingIndices = [];
    for (const line of lines) {
      if (line.length === 0) continue;
      const lastIndex =
        favoriteBreakingIndices[favoriteBreakingIndices.length - 1];
      if (lastIndex == undefined) {
        favoriteBreakingIndices.push(line.length - 1);
        continue;
      }
      favoriteBreakingIndices.push(lastIndex + line.length);
    }
    return new BreakableText(
      strImpl,
      strImpl.concat(lines),
      favoriteBreakingIndices,
      favor
    );
  }

  /**
   *
   * @param {BreakUntilPredicate<StrLike>} predicate
   * @param {number} recursionDepth
   * @returns {StrLike[]}
   */
  breakUntil(predicate, recursionDepth = 0) {
    if (recursionDepth > 10_000) {
      throw Error("Max Recursion Depth exceeded");
    }

    const breakRange = predicate(this.text);
    if (!breakRange) {
      return [this.text];
    }
    const [newLine, rest] = this.break(breakRange);
    return [newLine, ...rest.breakUntil(predicate, recursionDepth + 1)];
  }

  /**
   * @param {LineBreakingArgs} indices
   * @returns {[StrLike, BreakableText<StrLike>]}
   */
  break(indices) {
    const saveIndices = {
      maxLineLen: Math.min(indices.maxLineLen, this.text.length),
      minLineLen: indices.minLineLen,
    };
    const candidateBreakPoints =
      this.getMostPreferrableBreakpointsInRange(saveIndices);

    const prefferdTarget =
      this.favor === "middle"
        ? (saveIndices.maxLineLen - saveIndices.minLineLen) / 2
        : this.text.length;
    const closestBreakPoint = findClosestTo(
      candidateBreakPoints,
      prefferdTarget
    );

    const indexToBreakAfter =
      closestBreakPoint === undefined
        ? saveIndices.minLineLen + Math.floor(prefferdTarget)
        : closestBreakPoint;

    return [
      this.strImpl.slice(this.text, 0, indexToBreakAfter + 1),
      new BreakableText(
        this.strImpl,
        this.strImpl.slice(this.text, indexToBreakAfter + 1),
        this.favoriteBreakingIndices
          .map((i) => i - indexToBreakAfter - 1)
          .filter((i) => 0 < i),
        this.favor
      ),
    ];
  }

  /**
   *
   * @param {LineBreakingArgs} indices
   * @returns
   */
  getMostPreferrableBreakpointsInRange(indices) {
    const prio1 = this.prio1Breakpoints(indices);
    if (prio1.length > 0) return prio1;
    const prio2 = this.prio2Breakpoints(indices);
    if (prio2.length > 0) return prio2;
    const prio3 = this.prio3Breakpoints(indices);
    if (prio3.length > 0) return prio3;
    const prioLast = this.prioLastBreakpoints(indices);
    // console.log(this.text.toString(), "\n", indices);
    // if (prioLast.length === 0) throw Error("No linebreak possible.");
    return prioLast;
  }

  /**
   * @param {LineBreakingArgs} indices
   * @returns {Array<number>}
   */
  prioLastBreakpoints(indices) {
    return range(indices.minLineLen, indices.maxLineLen);
  }

  /**
   * @param {LineBreakingArgs} indices
   * @returns {Array<number>}
   */
  prio3Breakpoints(indices) {
    const beforeIndex = indices.maxLineLen;
    const afterIndex = indices.minLineLen;
    return findIndicesOf({
      findIn: this.strImpl.slice(this.text, afterIndex, beforeIndex),
      searchFor: [" "],
    }).map((i) => i + afterIndex);
  }

  /**
   * @param {LineBreakingArgs} indices
   * @returns {Array<number>}
   */
  prio2Breakpoints(indices) {
    return findIndicesOf({
      findIn: this.strImpl.slice(
        this.text,
        indices.minLineLen,
        indices.maxLineLen
      ),
      searchFor: punctuation,
    })
      .map((i) => {
        return i + indices.minLineLen;
      })
      .filter((i) => {
        // we dont want breaks after |: or :|
        return (
          this.text.charAt(i - 1) !== "|" && this.text.charAt(i + 1) !== "|"
        );
      })
      .map((i) => {
        // don't break after dot and bring following space to next line.
        const maybeBetterCandidate = i + 1;
        return this.text.charAt(maybeBetterCandidate) === " " &&
          indices.maxLineLen > maybeBetterCandidate
          ? maybeBetterCandidate
          : i;
      });
  }
  /**
   * @param {LineBreakingArgs} indices
   * @returns {Array<number>}
   */
  prio1Breakpoints(indices) {
    return this.favoriteBreakingIndices.filter(
      (i) => i < indices.maxLineLen && i >= indices.minLineLen
    );
  }
}

/**
 * @typedef {object} FindIndicesOfArgs
 * @property {StrLikeConstraint} findIn
 * @property {string[]} searchFor
 */

/**
 * @param {FindIndicesOfArgs} args
 */
function findIndicesOf(args) {
  /** @type {number[]} */
  const result = [];
  [...args.findIn].forEach((el, i) => {
    if (args.searchFor.includes(el)) {
      result.push(i);
    }
  });
  return result;
}

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
 * @property {number} maxLineLen meant is the gap before the index [including]
 * @property {number} minLineLen meant is the gap before the index [including]
 */
