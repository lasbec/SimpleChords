/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("./SongParser").SongAst} SongAst
 */

import { LEN } from "./Lenght.js";

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

    const lyricLines = this.song.sections.flatMap((s) =>
      s.lines.map((l) => l.lyric)
    );

    lyricLines.forEach((line, index) => {
      page.drawText(line, {
        x: 0,
        y: height - lineHeight * (index + 1),
        size: fontSize.in("pt"),
        font: this.font,
      });
    });
  }
}
