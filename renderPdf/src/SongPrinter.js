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
    const lyricFontSize = LEN(12, "pt");
    const lyricLineHeight = LEN(
      this.font.heightAtSize(lyricFontSize.in("pt")),
      "pt"
    );

    const titleFontSize = lyricFontSize.mul(1.3);
    const titleLineHeight = LEN(
      this.font.heightAtSize(titleFontSize.in("pt")),
      "pt"
    );

    const leftMargin = LEN(20, "mm");
    const rightMargin = LEN(20, "mm");
    const topMargin = LEN(20, "mm");
    const bottomMargin = LEN(20, "mm");

    const lyricLines = this.song.sections.flatMap((s) => s.lines);

    const pointer = page.getPointerAt("center", "top").moveDown(topMargin);

    // Title
    pointer.drawText(
      "center",
      "bottom",
      this.song.heading,
      titleFontSize,
      this.font
    );

    pointer.moveDown(titleLineHeight);
    pointer.moveToLeftBorder().moveRight(leftMargin);
    lyricLines.forEach((line) => {
      // Chords
      const partialWidths = getPartialWidths(
        line.lyric,
        this.font,
        lyricFontSize
      );
      for (const chord of line.chords) {
        const yOffset = partialWidths[chord.startIndex];
        if (!yOffset) continue;
        pointer
          .pointerRight(yOffset)
          .drawText("right", "bottom", chord.chord, lyricFontSize, this.font);
      }
      // Lyrics
      pointer.moveDown(lyricLineHeight);
      pointer.drawText("right", "bottom", line.lyric, lyricFontSize, this.font);
      pointer.moveDown(lyricLineHeight);
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
