/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("./SongParser").SongAst} SongAst
 * @typedef {import("./SongParser").ChordsLineElement} ChordsLineElement
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

    const lyricLines = this.song.sections.flatMap((s) => s.lines);

    lyricLines.forEach((line, lineIndex) => {
      const chordsY = height - lineHeight - 2 * lineHeight * lineIndex;
      const lyricsY = height - 2 * lineHeight - 2 * lineHeight * lineIndex;
      // Chords
      let partialLine = "";
      let charIndex = 0;
      const chordIter = line.chords[Symbol.iterator]();
      let currentChord = chordIter.next();
      for (const char of line.lyric) {
        console.log(`line ${lineIndex}:${charIndex}.  ${currentChord}`);
        if (currentChord.done) break;
        /** @type {ChordsLineElement}*/
        const chord = currentChord.value;
        if (chord.startIndex === charIndex) {
          const partialLineWidthPd = this.font.widthOfTextAtSize(
            partialLine,
            fontSize.in("pt")
          );
          page.drawText(chord.chord, {
            x: partialLineWidthPd,
            y: chordsY,
            size: fontSize.in("pt"),
            font: this.font,
          });
          currentChord = chordIter.next();
        }
        partialLine += char;
        charIndex += 1;
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
