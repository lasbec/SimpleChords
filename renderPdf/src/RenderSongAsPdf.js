/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./SongParser.js").SongAst} SongAst
 * @typedef {import("./SongParser.js").ChordsLineElement} ChordsLineElement
 */
import { FontLoader } from "./FontLoader.js";
import { LEN, Lenght } from "./Lenght.js";
import { Page, PagePointer } from "./Page.js";

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

  const titleFont = lyricFont;
  const titleFontSize = lyricFontSize.mul(1.3);
  const titleLineHeight = LEN(
    lyricFont.heightAtSize(titleFontSize.in("pt")),
    "pt"
  );

  const chordFont = await fontLoader.loadFontIntoDoc(
    pdfDoc,
    "DancingScript/static/DancingScript-Bold.ttf"
  );
  const chordFontSize = lyricFontSize;
  const chordLineHeight = LEN(
    chordFont.heightAtSize(chordFontSize.in("pt")),
    "pt"
  );

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
    const pointer = titleBox.getPointerAt("left", "bottom").onPage();

    pointer.moveDown(lyricLineHeight);
    pointer.moveToLeftBorder().moveRight(leftMargin);

    const lyricLines = song.sections.flatMap((s) => s.lines);
    for (const line of lyricLines) {
      const chordLineBox = drawChordLine(line, pointer);
      // Lyrics
      pointer.moveDown(chordLineHeight);
      pointer.drawText("right", "bottom", line.lyric, lyricFontSize, lyricFont);
      pointer.moveDown(lyricLineHeight);
    }
  }
  /**
   *
   * @param {import("./SongParser.js").SongLine} line
   * @param {PagePointer} pointer
   */
  function drawChordLine(line, pointer) {
    const lineWidth = LEN(
      lyricFont.widthOfTextAtSize(line.lyric, lyricFontSize.in("pt")),
      "pt"
    );
    const box = pointer.drawBox("right", "bottom", {
      height: chordLineHeight,
      width: lineWidth,
    });
    pointer = box.getPointerAt("left", "top");
    const partialWidths = getPartialWidths(
      line.lyric,
      lyricFont,
      lyricFontSize
    );
    for (const chord of line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      pointer
        .pointerRight(yOffset)
        .drawText("right", "bottom", chord.chord, chordFontSize, chordFont);
    }

    return box;
  }
  function drawTitle() {
    const pointer = page.getPointerAt("center", "top").moveDown(topMargin);

    // Title
    return pointer.drawText(
      "center",
      "bottom",
      song.heading,
      titleFontSize,
      lyricFont
    );
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
