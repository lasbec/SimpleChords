export function isChordName(str: string): str is "5" | "6" | "7" | "Major" | "minor" | "diminished" | "diminished7" | "sus4" | "sus2" | "Major7" | "minor7" | "minor6" | "Major7/b5" | "7sus4" | "Major9" | "minor7/9" | "11" | "13" | "add9";
export function chord(baseNote: Note, chordType: ChordType): {
    baseNote: number;
    chordType: "5" | "6" | "7" | "Major" | "minor" | "diminished" | "diminished7" | "sus4" | "sus2" | "Major7" | "minor7" | "minor6" | "Major7/b5" | "7sus4" | "Major9" | "minor7/9" | "11" | "13" | "add9";
};
export function chordEq(c0: Chord, c1: Chord): boolean;
export const ChordNames: string[];
export type Note = import("./Notes.js").Note;
export type Chord = {
    baseNote: Note;
    chordType: ChordType;
};
export type ChordType = keyof typeof ChordTypes;
declare const ChordTypes: {
    Major: number[];
    minor: number[];
    diminished: number[];
    diminished7: number[];
    "5": number[];
    sus4: number[];
    sus2: number[];
    "7": number[];
    Major7: number[];
    minor7: number[];
    "6": number[];
    minor6: number[];
    "Major7/b5": number[];
    "7sus4": number[];
    Major9: number[];
    "minor7/9": number[];
    "11": number[];
    "13": number[];
    add9: number[];
};
export {};
