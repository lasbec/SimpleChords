/**
 * @typedef {import("./Chords.js").ChordType} ChordType
 * @typedef {import("./Chords.js").Chord} Chord
 */

import { Note } from "./Notes.js";

/** @type {Record<ChordType, string>} */
const chordTypeMapping = {
  Major: "",
  minor: "",
  diminished: "Dim",
  // prettier-ignore
  "5": "+",
  sus4: "Sus4",
  sus2: "Sus2",
  // prettier-ignore
  "7": "7",
  Major7: "Maj7",
  minor7: "min7",
  diminished7: "Dim7",
  // prettier-ignore
  "6": "6",
  minor6: "min6",
  "Major7/b5": "Maj7/b5",
  "7sus4": "7Sus4",
  Major9: "Maj9",
  "minor7/9": "min7/9",
  // prettier-ignore
  "11": "11",
  // prettier-ignore
  "13": "13",
  add9: "add9",
};

/** @type {Record<Note, string>} */
const baseNoteMapping = {
  0: "A",
  1: "A#",
  2: "Cb",
  3: "C",
  4: "C#",
  5: "D",
  6: "D#",
  7: "E",
  8: "F",
  9: "F#",
  10: "G",
  11: "G#",
};

/**
 * @param {Chord} chord
 */
export function chordToString(chord) {
  const baseNote = baseNoteMapping[chord.baseNote];
  if (chord.chordType === "Major") {
    return baseNote;
  }
  if (chord.chordType === "minor") {
    return baseNote.toLowerCase();
  }
  return baseNote + chordTypeMapping[chord.chordType];
}
