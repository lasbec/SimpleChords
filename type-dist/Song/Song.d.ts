export class Song {
    static fromAst(ast: SongAst): Song;
    constructor(heading: string, sections: SongSection[]);
    heading: string;
    sections: SongSection[];
}
export type SongAst = import("../Parsing/SongParser.js").SongAst;
export type ChordsLineElement = import("../Parsing/SongParser.js").ChordsLineElement;
export type SongLineNode = import("../Parsing/SongParser.js").SongLineNode;
export type SongSection = {
    type: string;
    lines: SongLine[];
};
import { SongLine } from "./SongLine.js";
