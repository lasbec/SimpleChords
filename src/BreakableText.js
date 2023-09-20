/**
 * @template StrLike
 * @typedef {{slice(s:StrLike, start:number, stop?:number):StrLike, concat(s:StrLike[]):StrLike}} StrLikeImpl
 */

/**
 * @typedef {Iterable<string> & {length:number; charAt(index:number):string; toString():string}} StrLikeConstraint
 */

/**
 * @template StrLike
 * @callback BreakUntilPredicate
 * @param {StrLike} str
 * @returns {BeforAfter | undefined}
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
   * @param {BeforAfter} beforeAfter
   * @returns {[StrLike, BreakableText<StrLike>]}
   */
  break(beforeAfter) {
    const { before: _beforeIndex, after: afterIndex } = beforeAfter;
    const beforeIndex = Math.min(_beforeIndex, this.text.length);
    const favoriteBreakpoints = this.prio1Breakpoints(beforeIndex, afterIndex);
    const veryGoodBreakPoints = this.prio2Breakpoints(afterIndex, beforeIndex);
    const okBreakPoints = this.prio3Breakpoints(afterIndex, beforeIndex);
    const lastResortBreakPoints = this.prioLastBreakpoints(
      beforeIndex,
      afterIndex
    );
    const candidateBreakPoints =
      favoriteBreakpoints.length > 0
        ? favoriteBreakpoints
        : veryGoodBreakPoints.length > 0
        ? veryGoodBreakPoints
        : okBreakPoints.length > 0
        ? okBreakPoints
        : lastResortBreakPoints;

    const prefferdTarget =
      this.favor === "middle"
        ? (beforeIndex - afterIndex) / 2
        : this.text.length;
    const closestBreakPoint = findClosestTo(
      candidateBreakPoints,
      prefferdTarget
    );

    const indexToBreakAfter =
      closestBreakPoint === undefined
        ? afterIndex + Math.floor(prefferdTarget)
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
   * @param {number} afterIndex
   * @param {number} beforeIndex
   * @returns {Array<number>}
   */
  prioLastBreakpoints(beforeIndex, afterIndex) {
    return range(beforeIndex, afterIndex);
  }

  /**
   * @param {number} afterIndex
   * @param {number} beforeIndex
   * @returns {Array<number>}
   */
  prio1Breakpoints(beforeIndex, afterIndex) {
    return this.favoriteBreakingIndices.filter(
      (i) => i < beforeIndex && i >= afterIndex
    );
  }

  /**
   * @param {number} afterIndex
   * @param {number} beforeIndex
   * @returns {Array<number>}
   */
  prio3Breakpoints(afterIndex, beforeIndex) {
    return findIndicesOf({
      findIn: this.strImpl.slice(this.text, afterIndex, beforeIndex),
      searchFor: [" "],
    }).map((i) => i + afterIndex);
  }

  /**
   * @param {number} afterIndex
   * @param {number} beforeIndex
   * @returns {Array<number>}
   */
  prio2Breakpoints(afterIndex, beforeIndex) {
    return findIndicesOf({
      findIn: this.strImpl.slice(this.text, afterIndex, beforeIndex),
      searchFor: punctuation,
    })
      .map((i) => {
        return i + afterIndex;
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
          beforeIndex > maybeBetterCandidate
          ? maybeBetterCandidate
          : i;
      });
  }
}

/**
 * @param {number} start
 * @param {number} end
 * @returns {Array<number>}
 */
function range(start, end) {
  /** @type {Array<number>} */
  const result = [];
  let curr = start;
  while (curr < end) {
    result.push(curr);
    curr += 1;
  }
  return result;
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
 * @typedef {object} BeforAfter
 * @property {number} before excluding
 * @property {number} after including
 */
