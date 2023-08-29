/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 */
import {
  PDFDocument,
  TextAlignment,
  StandardFonts,
  layoutMultilineText,
} from "pdf-lib";
import { FontLoader } from "./FontLoader.js";
import { LEN, Lenght } from "./Lenght.js";
import { DetachedTextBox, Document, Page } from "./Page.js";
import { BoxPointer } from "./BoxPointer.js";
import { parseSongAst } from "./SongParser.js";
import * as Path from "path";
import * as fs from "fs/promises";
import { Song, SongLine } from "./Song.js";
import { checkSongAst } from "./SongChecker.js";
import { BreakableText } from "./BreakableText.js";

/**
 *  @param {string} path
 * @param {boolean} logAst
 */
export async function renderSingleFile(path, logAst) {
  console.log("Process", Path.parse(path).name);
  const contentToParse = await fs.readFile(path, "utf8");
  const ast = parseSongAst(contentToParse);
  if (!ast) {
    console.log("Parsing AST failed.");
    return;
  }
  checkSongAst(ast);
  const song = Song.fromAst(ast);

  const pointSplit = path.split(".");
  const astOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "AST.json" : e))
    .join(".");
  const pdfOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");

  if (logAst) {
    fs.writeFile(astOutputPath, JSON.stringify(song, null, 2));
    console.log("AST result written to", Path.resolve(astOutputPath));
  }

  const fontLoader = new FontLoader("./fonts");
  const pdfBytes = await renderSongAsPdf(song, fontLoader, "breakLines");

  await fs.writeFile(pdfOutputPath, pdfBytes);
  console.log("Pdf Result written to", Path.resolve(pdfOutputPath), "\n");
  return pdfOutputPath;
}

/**
 * @param {Song} song
 * @param {FontLoader} fontLoader
 * @param {"asIs" | "halveSongLines" | "breakLines"} shaper
 */
export async function renderSongAsPdf(song, fontLoader, shaper) {
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

  let pages;
  if (shaper === "halveSongLines") {
    pages = await layOutSong(halveSongLines(song));
  } else if (shaper === "asIs") {
    pages = await layOutSong(song);
  } else if (shaper === "breakLines") {
    pages = await layOutSong(
      reshapeSongWithLineBreaks(
        song,
        lyricTextStyle,
        pageWidth.sub(leftMargin).sub(rightMargin)
      )
    );
  } else {
    throw Error("Unknown shaper '" + shaper + "'");
  }
  pages.drawToPdfDoc(pdfDoc);

  return await pdfDoc.save();

  /**
   * @param {Song} song
   * @returns {Promise<Document>}
   */
  async function layOutSong(song) {
    const doc = new Document({ width: pageWidth, height: pageHeight });
    const titleBox = drawTitle(song, doc.appendNewPage());
    const pointer = titleBox.getPointerAt("left", "bottom").onPage();

    pointer.moveDown(lyricLineHeight);
    pointer.moveToLeftBorder().moveRight(leftMargin);

    const rightBottomPointer = pointer
      .onPage()
      .moveToBottomBorder()
      .moveToRightBorder()
      .moveUp(bottomMargin)
      .moveLeft(rightMargin);
    const lyricBox = pointer.spanBox(rightBottomPointer);
    let lyricPointer = lyricBox.getPointerAt("left", "top");

    for (const section of song.sections) {
      lyricPointer = drawSongSectionLines(lyricPointer, section.lines);
      lyricPointer.moveDown(sectionDistance);
    }
    return doc;
  }

  /**
   * @param {BoxPointer} pointer
   * @param {SongLine[]} songLines
   * */
  function drawSongSectionLines(pointer, songLines) {
    const heightOfSection = chordLineHeight
      .add(lyricLineHeight)
      .mul(songLines.length);

    const lowerEndOfSection = pointer.clone().moveToBottomBorder();

    const sectionWillExeedPage = pointer
      .pointerDown(heightOfSection)
      .isLowerThan(lowerEndOfSection);
    if (sectionWillExeedPage) {
      const leftTopCorner = pointer
        .nextPageAt("left", "top")
        .moveDown(topMargin)
        .moveRight(leftMargin);
      const rightBottomCorner = pointer
        .onPage()
        .moveToBottomBorder()
        .moveToRightBorder()
        .moveUp(topMargin)
        .moveLeft(rightMargin);
      const lyricBox = leftTopCorner.spanBox(rightBottomCorner);
      pointer = lyricBox.getPointerAt("left", "top");
    }
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

/**
 * @param {Song} song
 * @param {import("./Page.js").TextStyle} style
 * @param {Lenght} width
 */
function reshapeSongWithLineBreaks(song, style, width) {
  return {
    heading: song.heading,
    sections: song.sections.map((s) => ({
      sectionHeading: s.sectionHeading,
      lines: wrapLinesWithPdfLib(s.lines, style, width),
    })),
  };
}

/**
 * @param {string} str
 * @param {import("./Page.js").TextStyle} style
 * @param {Lenght} width
 */
function fitsWidth(str, style, width) {
  return (
    style.font.widthOfTextAtSize(str, style.fontSize.in("pt")) <= width.in("pt")
  );
}

/**
 * @param {string} str
 * @param {import("./Page.js").TextStyle} style
 * @param {Lenght} width
 */
function getMaxLenToFitWidth(str, style, width) {
  while (!fitsWidth(str, style, width)) {
    str = str.slice(0, -1);
  }
  return str.length;
}

/**
 * @param {SongLine[]} lines
 * @param {import("./Page.js").TextStyle} style
 * @param {Lenght} width
 * @returns {SongLine[]}
 */
function wrapLinesWithPdfLib(lines, style, width) {
  const breakingText = BreakableText.fromPrefferdLineUp(
    lines.map((l) => l.lyric)
  );
  console.log(breakingText.favoriteBreakingIndices);
  const splittedLines = breakingText.breakUntil((l) => {
    const maxLen = getMaxLenToFitWidth(l, style, width);
    if (maxLen >= l.length) return;
    return {
      before: maxLen,
      after: 0,
    };
  });

  let remainingLine = SongLine.concat(lines);
  /**@type {SongLine[]} */
  let result = [];
  for (const l of splittedLines) {
    const [line, rest] = remainingLine.splitAt(l.length);
    result.push(line);
    remainingLine = rest;
  }
  return result;
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
    /** @type {SongLine | null} */
    let last = null;
    for (const l of section.lines) {
      if (last) {
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
