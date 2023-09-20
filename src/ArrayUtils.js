/**
 * @param {number} start
 * @param {number} end
 * @returns {Array<number>}
 */
export function range(start, end) {
  /** @type {Array<number>} */
  const result = [];
  let curr = start;
  while (curr < end) {
    result.push(curr);
    curr += 1;
  }
  return result;
}
