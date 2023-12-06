/**
 * @typedef {import("./Chords.js").ChordType} ChordType
 */

import { chord, isChordName } from "./Chords.js";
import { Note } from "./Notes.js";

const holeNoteMap = new Map([
  ["A", Note.A],
  ["B", Note.B],
  ["C", Note.C],
  ["D", Note.D],
  ["E", Note.E],
  ["F", Note.F],
  ["G", Note.G],
]);

/**
 *
 * @param {string} str
 * @returns
 */
function parseBaseNote(str) {
  const holeNote = holeNoteMap.get(str[0]?.toUpperCase());
  str = str.slice(1);
  if (holeNote === undefined) return;
  if (str.startsWith("#") || str.startsWith("is")) {
    return holeNote + 1;
  }
  if (str.includes("b" || str.startsWith("es"))) {
    return holeNote - 1;
  }
  return holeNote;
}

/**
 * @param {string} str
 * @returns {ChordType | undefined}
 */
function parseChordType(str) {
  let minorAddition = str.charCodeAt(0) > 90 ? "minor" : "";
  str = str.slice(1);
  if (str.startsWith("#") || str.startsWith("b")) {
    str = str.slice(1);
  } else if (str.startsWith("is") || str.startsWith("es")) {
    str = str.slice(2);
  }
  if (str[0] === "m" && !str.startsWith("maj")) {
    str = str.slice(1);
    minorAddition = "minor";
  }

  const rawChordType = minorAddition + str.toLowerCase();
  if (rawChordType.length === 0) return "Major";

  const result = rawChordType
    .replace(/\_/g, "")
    .replace(/\^/g, "")
    .replace("maj", "Major")
    .replace("dim", "diminished")
    .replace("+", "5")
    .replace("power", "5")
    .replace("pow", "5");
  if (isChordName(result)) return result;
  return;
}

/**
 * @typedef {import("./Chords.js").Chord} Chord
 */

/**
 * @param {string} str
 * @returns {Chord | undefined}
 */
export function chordFromString(str) {
  const baseNote = parseBaseNote(str);
  if (baseNote === undefined) return;
  const chordType = parseChordType(str);
  if (chordType === undefined) return;
  return chord(baseNote, chordType);
}
