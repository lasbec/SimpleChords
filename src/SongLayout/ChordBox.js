import { TextBox } from "../Drawing/Boxes/TextBox.js";
import { chordToString } from "../Music/ChordFormatter.js";

/**
 * @typedef {import("./SongLineBox.js").TextConfig} TextConfig
 * @typedef {import("../Parsing/SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("../Music/Chords.js").Chord} Chord
 */

/**
 * @typedef {object} ChordConfig
 * @property {TextConfig} text
 * @property {boolean} unify
 */

/**
 * @param {ChordsLineElement} chord
 * @param {ChordConfig} config
 */
export function chordBox(chord, config) {
  const parsedChord = chord.parsedChord;
  if (!config.unify || !parsedChord) {
    return new TextBox(chord.chord, config.text);
  }
  const chordStr = chordToString(parsedChord);
  const result = chord.conditional ? "(" + chordStr + ")" : chordStr;
  return new TextBox(result, config.text);
}
