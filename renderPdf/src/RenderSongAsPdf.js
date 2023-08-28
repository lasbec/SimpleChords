/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./SongParser.js").Song} Song
 * @typedef {import("./SongParser.js").SongLine} SongLine
 */
import { FontLoader } from "./FontLoader.js";
import { LEN } from "./Lenght.js";
import { DetachedTextBox, Page } from "./Page.js";
import { BoxPointer } from "./BoxPointer.js";
import { parseSong } from "./SongParser.js";
import * as Path from "path";
import * as fs from "fs/promises";
import { PDFDocument, StandardFonts } from "pdf-lib";

/**
 *  @param {string} path
 * @param {boolean} logAst
 */
export async function renderSingleFile(path, logAst) {
  console.log("Process", Path.parse(path).name);
  const contentToParse = await fs.readFile(path, "utf8");
  const ast = parseSong(contentToParse);

  const pointSplit = path.split(".");
  const astOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "AST.json" : e))
    .join(".");
  const pdfOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");

  if (logAst) {
    fs.writeFile(astOutputPath, JSON.stringify(ast, null, 2));
    console.log("AST result written to", Path.resolve(astOutputPath));
  }

  const fontLoader = new FontLoader("./fonts");
  const pdfBytes = await renderSongAsPdf(ast, fontLoader);

  await fs.writeFile(pdfOutputPath, pdfBytes);
  console.log("Pdf Result written to", Path.resolve(pdfOutputPath), "\n");
  return pdfOutputPath;
}

/**
 * @param {Song} song
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
    "Niconne/Niconne-Regular.ttf"
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

  const sectionDistance = lyricLineHeight.mul(1.2);

  /** @type {Page} */
  let page;
  try {
    page = await layOutOnNewPage(halveSongLines(song));
  } catch (e) {
    page = await layOutOnNewPage(song);
  }
  page.appendToPdfDoc(pdfDoc);

  return await pdfDoc.save();

  /**
   * @param {Song} song
   */
  async function layOutOnNewPage(song) {
    const page = new Page({ width: pageWidth, height: pageHeight });
    const titleBox = drawTitle(song, page);
    const pointer = titleBox.getPointerAt("left", "bottom").onPage();

    pointer.moveDown(lyricLineHeight);
    pointer.moveToLeftBorder().moveRight(leftMargin);

    for (const section of song.sections) {
      drawSongSectionLines(pointer, section.lines);
      pointer.moveDown(sectionDistance);
    }
    return page;
  }

  /**
   * @param {BoxPointer} pointer
   * @param {SongLine[]} songLines
   * */
  function drawSongSectionLines(pointer, songLines) {
    for (const line of songLines) {
      const lyricLine = new DetachedTextBox(line.lyric, lyricTextStyle);

      const partialWidths = lyricLine.partialWidths();
      for (const chord of line.chords) {
        const yOffset = partialWidths[chord.startIndex];
        if (!yOffset) continue;
        pointer
          .pointerRight(yOffset)
          .setText("right", "bottom", chord.chord, chordTextStyle);
      }
      pointer.moveDown(chordLineHeight);
      pointer.attachTextBox("right", "bottom", lyricLine);
      pointer.moveDown(lyricLineHeight);
    }
    return pointer;
  }

  /**
   * @param {Song} song
   * @param {Page} page
   */
  function drawTitle(song, page) {
    const pointer = page.getPointerAt("center", "top").moveDown(topMargin);
    return pointer.setText("center", "bottom", song.heading, titleTextStyle);
  }
}

/** @param {Song} song */
function halveSongLines(song) {
  /** @type {Song} */
  const result = {
    heading: song.heading,
    sections: [],
  };
  for (const section of song.sections) {
    let lines = [];
    let c = 0;
    /** @type {SongLine} */
    let last;
    for (const l of section.lines) {
      if (c % 2 == 1) {
        lines.push(last.concat([l]));
        last = null;
      } else {
        last = l;
      }
      c += 1;
    }
    if (last) {
      lines.push(last);
    }
    result.sections.push({
      sectionHeading: section.sectionHeading,
      lines,
    });
  }
  return result;
}
