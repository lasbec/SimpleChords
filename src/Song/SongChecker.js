/**
 * @typedef {import("../Parsing/SongParser.js").SongAst} SongAst
 * @typedef {import("../Parsing/SongParser.js").SongLineNode} SongLineNode
 * @typedef {import("../Parsing/SongParser.js").SongSectionNode} SongSectionNode
 */

export const WellKnownSectionType = {
  Interlude: "interlude",
  Refrain: "refrain",
  Chorus: "chorus",
  Bridge: "bridge",
  Verse: "verse",
  Intro: "intro",
  Outro: "outro",
};

/** @param {SongAst} ast  */
export function checkSongAst(ast) {
  for (const section of ast.sections) {
    let sectionType = section.type.trim().toLowerCase();
    if (
      !Object.values(WellKnownSectionType).includes(sectionType) &&
      sectionType !== ""
    ) {
      console.warn(`Unknown section type '${section.type}'`);
    }
    for (const line of section.lines) {
      for (const chord of line.chords) {
        if (!chord.parsedChord && !isSpecialSign(chord.chord)) {
          console.warn(`Invalid chord '${chord.chord}' in:\n '${line.lyric}'`);
        }
      }
    }
  }

  /**@type {Map<string, string[]>} */
  const chordSchemas = new Map();

  for (const section of ast.sections) {
    const sectionType = section.type.trim().toLowerCase();
    const schema = chordSchemas.get(sectionType);
    if (schema) {
      validateSectionAgainstSchema(section, schema);
    } else {
      const newSchema = parseSchema(section.lines);
      chordSchemas.set(sectionType, newSchema);
    }
  }
}

/**
 * @param {SongLineNode[]} lines
 * @returns {string[]}
 */
export function parseSchema(lines) {
  return lines.flatMap((l) => l.chords.map((c) => c.chord));
}

/**
 * @param {SongSectionNode} section
 *  * @param {string[]} _schema
 */
export function validateSectionAgainstSchema(section, _schema) {
  const schema = [..._schema];
  const lines = section.lines;
  let lineIndex = -1;
  for (const line of lines) {
    lineIndex += 1;
    const warning = `line schemas are differing for '${section.type}' sections near:\n${line.lyric}`;
    for (const chord of line.chords) {
      const schemaChord = schema.shift();
      if (schemaChord !== chord.chord) {
        console.warn(warning);
      }
    }
  }
}

/** @param {string} str */
function isSpecialSign(str) {
  return ["|:", ":|"].includes(str);
}
