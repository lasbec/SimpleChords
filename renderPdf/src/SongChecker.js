/**
 * @typedef {import("./SongParser").SongAst} SongAst
 * @typedef {import("./SongParser").SongLineNode} SongLineNode
 * @typedef {import("./SongParser").SongSectionNode} SongSectionNode
 */

/** @param {SongAst} ast  */
export function checkSongAst(ast) {
  for (const section of ast.sections) {
    for (const line of section.lines) {
      for (const chord of line.chords) {
        if (!isChord(chord.chord) && !isSpecialSign(chord.chord)) {
          console.warn(`Invalid chord '${chord.chord}' in:\n '${line.lyric}'`);
        }
      }
    }
  }

  /**@type {Map<string, string[][]>} */
  const chordSchemas = new Map();

  for (const section of ast.sections) {
    const sectionType = section.sectionHeading.trim().toLowerCase();
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
 * @returns {string[][]}
 */
function parseSchema(lines) {
  return lines.map((l) => l.chords.map((c) => c.chord));
}

/**
 * @param {SongSectionNode} section
 *  * @param {string[][]} schema
 */
function validateSectionAgainstSchema(section, schema) {
  const lines = section.lines;
  let lineIndex = -1;
  for (const line of lines) {
    lineIndex += 1;
    const warning =
      "line schemas are differing for sections " +
      section.sectionHeading +
      " near:\n" +
      line.lyric;
    if (line.chords.length !== schema[lineIndex]?.length) {
      console.warn(warning);
    }
    if (line.chords.some((c, i) => c.chord !== schema[lineIndex][i])) {
      console.warn(warning);
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
  if (str[0] == "(" && str[str.length - 1] == ")") {
    str = str.slice(1);
    str = str.slice(0, -1);
  }
  if (note.includes(str[0])) {
    str = str.slice(1);
  }

  if (str[0] === "m") {
    str = str.slice(1);
  }
  if (str[0] == "_") {
    str = str.slice(1);
  }
  for (const step of halfSteps) {
    if (str.startsWith(step)) {
      str = str.slice(step.length);
      break;
    }
  }
  if (str[0] == "_") {
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
