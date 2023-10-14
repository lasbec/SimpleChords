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
        if (!isChord(chord.chord) && !isSpecialSign(chord.chord)) {
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

const note = ["a", "b", "c", "d", "e", "f", "g", "h"];
const halfSteps = ["#", "b", "is", "es"];
const variants = ["7", "6", "5", "dim", "maj7", "sus2", "sus4", "+"];

/** @param {string} str */
export function isChord(str) {
  str = str.toLowerCase();
  if (str[0] === "(" && str[str.length - 1] === ")") {
    str = str.slice(1);
    str = str.slice(0, -1);
  }
  if (note.includes(str[0])) {
    str = str.slice(1);
  }

  if (str[0] === "m") {
    str = str.slice(1);
  }
  if (str[0] === "_") {
    str = str.slice(1);
  }
  for (const step of halfSteps) {
    if (str.startsWith(step)) {
      str = str.slice(step.length);
      break;
    }
  }
  if (str[0] === "_") {
    str = str.slice(1);
  }

  for (const variant of variants) {
    if (str.startsWith(variant)) {
      str = str.slice(variant.length);
      break;
    }
  }
  return str === "";
}