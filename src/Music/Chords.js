/**
 * @typedef {import("./Notes.js").Note} Note
 */

import { absoluteNoteEq, noteEq } from "./Notes.js";

/** @typedef {{ baseNote: Note; chordType: ChordType }} Chord */

const ChordTypes = /** @type {const} */ {
  Major: [4, 7],
  minor: [3, 7],
  diminished: [3, 6],
  diminished7: [3, 6, 9],
  // prettier-ignore
  "5": [4, 8],
  sus4: [5, 7],
  sus2: [2, 7],
  // prettier-ignore
  "7": [4, 7, 10],
  Major7: [4, 7, 11],
  minor7: [3, 7, 10],
  // prettier-ignore
  "6": [4, 7, 9],
  minor6: [3, 7, 9],
  "Major7/b5": [3, 6, 10],
  "7sus4": [5, 7, 10],
  Major9: [4, 7, 10, 14],
  "minor7/9": [3, 7, 10, 14],
  // prettier-ignore
  "11": [4, 7, 10, 14, 17],
  // prettier-ignore
  "13": [4, 7, 10, 14, 17, 21],
  add9: [3, 7, 14],
};
/** @typedef {keyof typeof ChordTypes} ChordType */
export const ChordNames = /** @type {ReadonlyArray<ChordType>} */ [
  ...Object.keys(ChordTypes),
];

/**
 * @param {string} str
 * @returns {str is ChordType}
 */
export function isChordName(str) {
  return ChordNames.includes(str);
}

/**
 *
 * @param {Note} baseNote
 * @param {ChordType} chordType
 */
export function chord(baseNote, chordType) {
  return {
    baseNote,
    chordType,
  };
}

/**
 * @param {Chord} c0
 * @param {Chord} c1
 */
export function chordEq(c0, c1) {
  return noteEq(c0.baseNote, c1.baseNote) && c0.chordType == c1.chordType;
}
