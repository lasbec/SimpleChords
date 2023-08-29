/**
 * @param {BreakableText} text
 * @param {number} maxLen
 */
export function wrapIntoStringsOfMaxLenghtOf(text, maxLen) {
  /** @type {string[]} */
  let result = [];
  while (text.lenght > maxLen) {
    const [newLine, rest] = text.break({ afterIndex: 0, beforeIndex: maxLen });
    result.push(newLine);
    text = BreakableText.fromString(rest);
  }
  return result;
}

/**
 * @param {number[]} arr
 */
export function getIndexOfMostRightMinimum(arr) {
  const fst = arr[0];
  if (fst === undefined) return;
  /** @type {number} */
  let currIndexOfMinimum = 0;
  /** @type {number} */
  let currMinimum = fst;
  arr.forEach((n, i) => {
    if (n <= currMinimum) {
      currMinimum = n;
      currIndexOfMinimum = i;
    }
  });
  return currIndexOfMinimum;
}

/**
 * @typedef {object} RangeArgs
 * @property {number} from inclusive
 * @property {number} to exclusive
 * @property {number} by
 */

/**
 * @param {number[]} arr;
 * @param {RangeArgs} range
 * @return {void}
 */
function increaseInRangeBy(arr, range) {
  let i = range.from - 1;
  while (i < range.to) {
    i += 1;

    if (i >= 0 && arr[i] !== undefined) {
      arr[i] += range.by;
    }
  }
}

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
