/**
 * @typedef {typeof Note[keyof typeof Note]} Note
 */

export const Note = /** @type {const} */ {
  A: 0,
  "A#": 1,
  Bb: 1,
  B: 2,
  Cb: 2,
  C: 3,
  "C#": 4,
  Db: 4,
  D: 5,
  "D#": 6,
  Eb: 6,
  E: 7,
  F: 8,
  "F#": 9,
  Gb: 9,
  G: 10,
  "G#": 11,
  Ab: 11,
};
/** @typedef {keyof typeof Note} NoteName */
export const NoteNames = /** @type {ReadonlyArrar<NoteName>} */ [
  ...Object.values(Note),
];

/**
 * @param {Note} n0
 * @param {Note} n1
 */
export function absoluteNoteEq(n0, n1) {
  return n0 === n1;
}

/**
 *
 * @param {Note} n0
 * @param {Note} n1
 */
export function noteEq(n0, n1) {
  return n0 % 11 === n1 % 11;
}
