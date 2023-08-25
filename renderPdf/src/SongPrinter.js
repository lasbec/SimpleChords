/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("./SongParser").SongAst} SongAst
 * @typedef {import("./SongParser").ChordsLineElement} ChordsLineElement
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

  /** @param {PDFPage} page */
  async printToPage(page) {
    const fontSize = LEN(12, "pt");
    const { width, height } = page.getSize();
    const lineHeight = this.font.heightAtSize(fontSize.in("pt"));

    const lyricLines = this.song.sections.flatMap((s) => s.lines);

    lyricLines.forEach((line, lineIndex) => {
      const chordsY = height - lineHeight - 2 * lineHeight * lineIndex;
      const lyricsY = height - 2 * lineHeight - 2 * lineHeight * lineIndex;
      // Chords
      const partialWidths = getPartialWidths(line.lyric, this.font, fontSize);
      for (const chord of line.chords) {
        page.drawText(chord.chord, {
          x: partialWidths[chord.startIndex],
          y: chordsY,
          size: fontSize.in("pt"),
          font: this.font,
        });
      }
      // Lyrics
      page.drawText(line.lyric, {
        x: 0,
        y: lyricsY,
        size: fontSize.in("pt"),
        font: this.font,
      });
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
    result.push(font.widthOfTextAtSize(partial, fontSize.in("pt")));
    partial += char;
  }
  return result;
}
