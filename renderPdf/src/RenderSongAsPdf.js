/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./SongParser.js").SongAst} SongAst
 * @typedef {import("./SongParser.js").ChordsLineElement} ChordsLineElement
 * @typedef {import("./SongParser.js").SongLine} SongLine
 */
import { FontLoader } from "./FontLoader.js";
import { LEN, Lenght } from "./Lenght.js";
import { Box, DetachedTextBox, Page, PagePointer } from "./Page.js";

import { PDFDocument, PDFForm, StandardFonts, PDFFont } from "pdf-lib";

/**
 * @param {SongAst} song
 * @param {FontLoader} fontLoader
 */
export async function renderSongAsPdf(song, fontLoader) {
  const pdfDoc = await PDFDocument.create();
  const pageWidth = LEN(148.5, "mm");
  const pageHeight = LEN(210, "mm");

  const lyricFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const lyricFontSize = LEN(12, "pt");
  const lyricLineHeight = LEN(
    lyricFont.heightAtSize(lyricFontSize.in("pt")),
    "pt"
  );
  const lyricTextStyle = {
    font: lyricFont,
    fontSize: lyricFontSize,
  };

  const titleFont = lyricFont;
  const titleFontSize = lyricFontSize.mul(1.3);
  const titleLineHeight = LEN(
    lyricFont.heightAtSize(titleFontSize.in("pt")),
    "pt"
  );
  const titleTextStyle = {
    fontSize: titleFontSize,
    font: titleFont,
  };

  const chordFont = await fontLoader.loadFontIntoDoc(
    pdfDoc,
    "DancingScript/static/DancingScript-Bold.ttf"
  );
  const chordFontSize = lyricFontSize;
  const chordLineHeight = LEN(
    chordFont.heightAtSize(chordFontSize.in("pt")),
    "pt"
  );
  const chordTextStyle = {
    font: chordFont,
    fontSize: chordFontSize,
  };

  const leftMargin = pageWidth.mul(0.07);
  const rightMargin = pageWidth.mul(0.07);
  const topMargin = pageWidth.mul(0.07);
  const bottomMargin = pageWidth.mul(0.07);
  const page = new Page(
    pdfDoc.addPage([pageWidth.in("pt"), pageHeight.in("pt")])
  );
  await printToPage();
  return await pdfDoc.save();

  async function printToPage() {
    const titleBox = drawTitle();
    let pointer = titleBox.getPointerAt("left", "bottom").onPage();

    pointer.moveDown(lyricLineHeight);
    pointer.moveToLeftBorder().moveRight(leftMargin);

    const lyricLines = song.sections.flatMap((s) => s.lines);
    for (const line of lyricLines) {
      const songLineBox = drawSongLine(line, pointer);

      pointer = songLineBox.getPointerAt("left", "bottom");
    }
  }
  /**
   *
   * @param {SongLine} line
   * @param {PagePointer} pointer
   */
  function drawSongLine(line, pointer) {
    const lyricLine = new DetachedTextBox(line.lyric, lyricTextStyle);

    const partialWidths = lyricLine.partialWidths();
    for (const chord of line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      pointer
        .pointerRight(yOffset)
        .drawText("right", "bottom", chord.chord, chordTextStyle);
    }
    pointer.moveDown(chordLineHeight);
    return pointer.attachTextBox("right", "bottom", lyricLine);
  }
  function drawTitle() {
    const pointer = page.getPointerAt("center", "top").moveDown(topMargin);

    // Title
    return pointer.drawText("center", "bottom", song.heading, titleTextStyle);
  }
}
