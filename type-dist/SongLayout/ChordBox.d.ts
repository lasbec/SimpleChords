export function chordBox(chord: ChordsLineElement, config: ChordConfig): TextBox;
export type TextConfig = import("./SongLineBox.js").TextConfig;
export type ChordsLineElement = import("../Parsing/SongParser.js").ChordsLineElement;
export type Chord = import("../Music/Chords.js").Chord;
export type ChordConfig = {
    text: TextConfig;
    unify: boolean;
};
import { TextBox } from "../Drawing/Boxes/TextBox.js";
