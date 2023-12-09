export function checkSongAst(ast: SongAst): void;
export function parseSchema(lines: SongLineNode[]): string[];
export function validateSectionAgainstSchema(section: SongSectionNode, _schema: string[]): void;
export namespace WellKnownSectionType {
    let Interlude: string;
    let Refrain: string;
    let Chorus: string;
    let Bridge: string;
    let Verse: string;
    let Intro: string;
    let Outro: string;
}
export type SongAst = import("../Parsing/SongParser.js").SongAst;
export type SongLineNode = import("../Parsing/SongParser.js").SongLineNode;
export type SongSectionNode = import("../Parsing/SongParser.js").SongSectionNode;
