/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("./SongParser").SongAst} SongAst
 * @typedef {import("./SongParser").ChordsLineElement} ChordsLineElement
 * @typedef {import("./Page").Page} Page
 */
import { LEN, Lenght } from "./Lenght.js";

export class SongPrinter {
  /** @type {SongAst}*/
  song;
  /** @type {PDFFont}*/
  font;

  /**@param {SongAst} song  */
  /**@param {PDFFont} font */
  constructor(song, font) {
    this.song = song;
    this.font = font;
  }

  /** @param {Page} page */
  async printToPage(page) {
    const fontSize = LEN(12, "pt");
    const lineHeight = LEN(this.font.heightAtSize(fontSize.in("pt")), "pt");
    const leftMargin = LEN(20, "mm");
    const rightMargin = LEN(20, "mm");
    const topMargin = LEN(20, "mm");
    const bottomMargin = LEN(20, "mm");

    const lyricLines = this.song.sections.flatMap((s) => s.lines);

    const pointer = page
      .getPointerAt("left", "top")
      .moveDown(topMargin)
      .moveRight(leftMargin);
    lyricLines.forEach((line) => {
      // Chords
      const partialWidths = getPartialWidths(line.lyric, this.font, fontSize);
      for (const chord of line.chords) {
        const yOffset = partialWidths[chord.startIndex];
        if (!yOffset) continue;
        pointer
          .pointerRight(yOffset)
          .drawText("right", "bottom", chord.chord, fontSize, this.font);
      }
      // Lyrics
      pointer.moveDown(lineHeight);
      pointer.drawText("right", "bottom", line.lyric, fontSize, this.font);
      pointer.moveDown(lineHeight);
    });
  }
}

/**
 *
 * @param {string} text
 * @param {PDFFont} font
 * @param {Lenght} fontSize
 * @returns
 */
function getPartialWidths(text, font, fontSize) {
  const result = [];
  let partial = "";
  for (const char of text) {
    const widthPt = font.widthOfTextAtSize(partial, fontSize.in("pt"));
    result.push(LEN(widthPt, "pt"));
    partial += char;
  }
  return result;
}
