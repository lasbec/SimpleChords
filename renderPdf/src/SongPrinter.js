/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("pdf-lib").PDFFont} PDFFont
 * @typedef {import("./SongParser").SongAst} SongAst
 * @typedef {import("./SongParser").ChordsLineElement} ChordsLineElement
 */
import { PDFDocument } from "pdf-lib";
import { LEN, Lenght } from "./Lenght.js";
import { Page } from "./Page.js";
import { StandardFonts } from "pdf-lib";

/** @param {SongAst} song */
export async function renderSongAsPdf(song) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const page = new Page(pdfDoc.addPage());
  await printToPage();
  return await pdfDoc.save();

  async function printToPage() {
    const lyricFontSize = LEN(12, "pt");
    const lyricLineHeight = LEN(
      font.heightAtSize(lyricFontSize.in("pt")),
      "pt"
    );

    const titleFontSize = lyricFontSize.mul(1.3);
    const titleLineHeight = LEN(
      font.heightAtSize(titleFontSize.in("pt")),
      "pt"
    );

    const leftMargin = LEN(20, "mm");
    const rightMargin = LEN(20, "mm");
    const topMargin = LEN(20, "mm");
    const bottomMargin = LEN(20, "mm");

    const lyricLines = song.sections.flatMap((s) => s.lines);

    const pointer = page.getPointerAt("center", "top").moveDown(topMargin);

    // Title
    pointer.drawText("center", "bottom", song.heading, titleFontSize, font);

    pointer.moveDown(titleLineHeight);
    pointer.moveToLeftBorder().moveRight(leftMargin);
    lyricLines.forEach((line) => {
      // Chords
      const partialWidths = getPartialWidths(line.lyric, font, lyricFontSize);
      for (const chord of line.chords) {
        const yOffset = partialWidths[chord.startIndex];
        if (!yOffset) continue;
        pointer
          .pointerRight(yOffset)
          .drawText("right", "bottom", chord.chord, lyricFontSize, font);
      }
      // Lyrics
      pointer.moveDown(lyricLineHeight);
      pointer.drawText("right", "bottom", line.lyric, lyricFontSize, font);
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
