/**
 * @typedef {import("./SongParser.js").SongAst} SongAst
 * @typedef {import("./SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("./SongParser.js").SongLineNode}  SongLineNode
 */
import { WellKnownSectionType } from "./SongChecker.js";
import { SongLine } from "./SongLine.js";

export class Song {
  /**@type {string}*/
  heading;
  /**@type {SongSection[]}*/
  sections;
  /**
   * @param {string} heading
   * @param {SongSection[]} sections
   * @private
   */
  constructor(heading, sections) {
    this.heading = heading;
    this.sections = sections;
  }

  /**
   *
   * @param {SongAst} ast
   */
  static fromAst(ast) {
    /** @type {SongSection[]} */
    const sections = ast.sections.map((s) => ({
      type: s.type.trim().toLowerCase() || WellKnownSectionType.Verse,
      lines: s.lines
        .map(SongLine.fromSongLineNode)
        .map(SongLine.ensureSpaceAtEnd),
    }));
    return new Song(ast.heading, sections);
  }
}

/**
 * @typedef {object} SongSection
 * @property {string} type
 * @property {SongLine[]} lines
 */
