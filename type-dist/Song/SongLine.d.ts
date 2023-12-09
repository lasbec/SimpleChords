export class SongLine implements StrLikeContstraint {
    static emptyAt(line: SongLine, i: number): boolean | undefined;
    static empty(): SongLine;
    static fromSongLineNode(node: SongLineNode): SongLine;
    static ensureSpaceAtEnd(line: SongLine): SongLine;
    static concat(lines: SongLine[]): SongLine;
    static slice(line: SongLine, start: number, stop?: number | undefined): SongLine;
    private constructor();
    readonly chars: ReadonlyArray<LyricChar>;
    readonly lyric: string;
    get length(): number;
    toString(): string;
    charAt(index: number): string;
    get chords(): import("../Parsing/SongParser.js").ChordsLineElement[];
    concat(others: SongLine[]): SongLine;
    slice(start: number, stop?: number | undefined): SongLine;
    trim(): SongLine;
    isEmpty(): boolean;
    [Symbol.iterator](): Iterator<string>;
}
export type StrLikeContstraint = import("../Drawing/BreakableText.js").StrLikeConstraint;
export type SongAst = import("../Parsing/SongParser.js").SongAst;
export type ChordsLineElement = import("../Parsing/SongParser.js").ChordsLineElement;
export type SongLineNode = import("../Parsing/SongParser.js").SongLineNode;
export type LyricChar = {
    char: string;
    chord: ChordsLineElement | null;
};
