/**
 * @callback BreakUntilPredicate
 * @param {string} str
 * @returns {BeforAfter | undefined}
 */

const punctuation = [".", ",", ":", "!", "?", ";"];
/**
 * Class to wrap text.
 * Goal is to offer functionality to break a paragraph into lines.
 */
export class BreakableText {
  /** @type {string} */
  text;
  /** @type {number} */
  lenght;

  /**
   * @param {string} text
   * @private
   */
  constructor(text) {
    this.text = text;
    this.lenght = text.length;
  }
  //   static addBadnessForBeingInWord(badness) {}

  /** @param {string} str  */
  static fromString(str) {
    return new BreakableText(str);
  }

  /**
   *
   * @param {BreakUntilPredicate} predicate
   * @returns {string[]}
   */
  breakUntil(predicate) {
    /** @type {string[]} */
    let result = [];

    const breakRange = predicate(this.text);
    if (!breakRange) {
      return [this.text];
    }
    const [newLine, rest] = this.break(breakRange);
    const text = BreakableText.fromString(rest);
    return [newLine, ...text.breakUntil(predicate)];
  }

  /**
   * @param {BeforAfter} beforeAfter
   * @returns {[string, string]}
   */
  break(beforeAfter) {
    const { beforeIndex: _beforeIndex, afterIndex } = beforeAfter;
    const beforeIndex = Math.min(_beforeIndex, this.text.length);
    const veryGoodBreakPoints = findIndicesOf({
      findIn: this.text.slice(afterIndex, beforeIndex),
      searchFor: punctuation,
    }).map((i) => {
      const totalIndex = i + afterIndex;
      const maybeBetterCandidate = totalIndex + 1;
      return this.text[maybeBetterCandidate] === " " &&
        beforeIndex > maybeBetterCandidate
        ? maybeBetterCandidate
        : totalIndex;
    });

    const okBreakPoints = findIndicesOf({
      findIn: this.text.slice(afterIndex, beforeIndex),
      searchFor: [" "],
    }).map((i) => i + afterIndex);
    const candidateBreakPoints =
      veryGoodBreakPoints.length > 0 ? veryGoodBreakPoints : okBreakPoints;

    const middleOfBrakingSpace = (beforeIndex - afterIndex) / 2;
    const middlestGoodBreakPoint = findClosestTo(
      candidateBreakPoints,
      middleOfBrakingSpace
    );

    const indexToBreakAfter =
      middlestGoodBreakPoint === undefined
        ? afterIndex + Math.floor(middleOfBrakingSpace)
        : middlestGoodBreakPoint;

    return [
      this.text.slice(0, indexToBreakAfter + 1),
      this.text.slice(indexToBreakAfter + 1),
    ];
  }
}

/**
 * @typedef {object} FindIndicesOfArgs
 * @property {string} findIn
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
 * @property {number} beforeIndex excluding
 * @property {number} afterIndex including
 */
