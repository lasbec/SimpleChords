import { TextBox } from "../Drawing/Boxes/TextBox.js";
import { chordToString } from "../Music/ChordFormatter.js";

/**
 * @typedef {import("./SongLineBox.js").TextConfig} TextConfig
 * @typedef {import("../Parsing/SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("../Music/Chords.js").Chord} Chord
 */

/**
 * @param {ChordsLineElement} chord
 * @param {TextConfig} config
 */
export function chordBox(chord, config) {
  const parsedChord = chord.parsedChord;
  if (!parsedChord) {
    return new TextBox(chord.chord, config);
  }
  const chordStr = chordToString(parsedChord);
  const result = chord.conditional ? "(" + chordStr + ")" : chordStr;
  return new TextBox(result, config);
}
