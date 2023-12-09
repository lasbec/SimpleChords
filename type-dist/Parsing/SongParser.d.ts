export function parseSongAst(input: string): SongAst | null;
export type ExpectedActual = {
    expected: string;
    actual: string;
};
export type InvalidChordArgs = {
    actual: string;
    hint: string;
};
export type SongAst = {
    heading: string;
    sections: SongSectionNode[];
};
export type SongSectionNode = {
    type: string;
    lines: SongLineNode[];
};
export type SongLineNode = {
    lyric: string;
    chords: ChordsLineElement[];
};
export type Chord = import("../Music/Chords.js").Chord;
export type ChordsLineElement = {
    startIndex: number;
    chord: string;
    parsedChord?: Chord | undefined;
    conditional: boolean;
};
