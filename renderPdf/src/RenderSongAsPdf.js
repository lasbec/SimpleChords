/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Page.js").TextStyle} TextConfig
 * @typedef {import("./Song.js").SongSection} SongSection
 */
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FontLoader } from "./FontLoader.js";
import { LEN, Length } from "./Length.js";
import { DetachedTextBox, Document, Page } from "./Page.js";
import { BoxPointer } from "./BoxPointer.js";
import { parseSongAst } from "./SongParser.js";
import * as Path from "path";
import * as fs from "fs/promises";
import { Song, SongLine } from "./Song.js";
import { checkSongAst, WellKnownSectionType } from "./SongChecker.js";
import { BreakableText } from "./BreakableText.js";
import { SchemaWrapper } from "./SchemaWrapper.js";

/**
 *  @param {string} path
 * @param {boolean} debug
 */
export async function renderSingleFile(path, debug) {
  console.log("Process", Path.parse(path).name);
  const contentToParse = (await fs.readFile(path, "utf8")).replace(/\r/g, ""); // ensure linebreaks are \n and not \r\n;
  const ast = parseSongAst(contentToParse);
  if (!ast) {
    console.log("Parsing AST failed.");
    return;
  }
  checkSongAst(ast);

  const pointSplit = path.split(".");
  const astOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "AST.json" : e))
    .join(".");
  const pdfOutputPath = pointSplit
    .map((e, i) => (i === pointSplit.length - 1 ? "pdf" : e))
    .join(".");

  if (debug) {
    fs.writeFile(astOutputPath, JSON.stringify(ast, null, 2));
    console.log("AST result written to", Path.resolve(astOutputPath));
  }
  const song = Song.fromAst(ast);

  const fontLoader = new FontLoader("./fonts");
  const pdfBytes = await renderSongAsPdf(song, fontLoader, debug);

  await fs.writeFile(pdfOutputPath, pdfBytes);
  console.log("Pdf Result written to", Path.resolve(pdfOutputPath), "\n");
  return pdfOutputPath;
}

/**
 * @typedef LayoutConfig
 * @property {TextConfig} lyricTextStyle
 * @property {TextConfig} chorusTextStyle
 * @property {TextConfig} refTextStyle
 * @property {TextConfig} chordTextStyle
 */

/**
 * @param {Song} song
 * @param {FontLoader} fontLoader
 * @param {boolean} debug
 */
export async function renderSongAsPdf(song, fontLoader, debug) {
  Document.debug = debug;
  const pdfDoc = await PDFDocument.create();
  const pageWidth = LEN(148.5, "mm");
  const pageHeight = LEN(210, "mm");

  const lyricFontSize = LEN(12, "pt");
  /** @type {TextConfig} */
  const lyricTextStyle = {
    font: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    fontSize: lyricFontSize,
  };

  /** @type {TextConfig} */
  const refTextStyle = {
    font: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
    fontSize: lyricFontSize,
  };

  /** @type {TextConfig} */
  const chorusTextStyle = {
    font: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
    fontSize: lyricFontSize,
  };
  /** @type {TextConfig} */
  const titleTextStyle = {
    fontSize: lyricFontSize.mul(1.3),
    font: await pdfDoc.embedFont(StandardFonts.TimesRoman),
  };

  const chordTextStyle = {
    font: await fontLoader.loadFontIntoDoc(
      pdfDoc,
      "Niconne/Niconne-Regular.ttf"
    ),
    fontSize: lyricFontSize,
  };
  const chordLineHeight = LEN(
    chordTextStyle.font.heightAtSize(chordTextStyle.fontSize.in("pt")),
    "pt"
  );

  const leftMargin = pageWidth.mul(0.07);
  const rightMargin = pageWidth.mul(0.07);
  const topMargin = pageWidth.mul(0.07);
  const bottomMargin = pageWidth.mul(0.07);

  const lyricLineHeight = LEN(
    lyricTextStyle.font.heightAtSize(lyricFontSize.in("pt")),
    "pt"
  );
  const sectionDistance = lyricLineHeight.mul(1.2);

  const pages = await layOutSong(
    reshapeSongWithSchema(
      song,
      lyricTextStyle,
      pageWidth.sub(leftMargin).sub(rightMargin)
    )
  );
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
      let onlyChordsSections = [
        WellKnownSectionType.Intro,
        WellKnownSectionType.Outro,
        WellKnownSectionType.Interlude,
      ];
      if (onlyChordsSections.includes(section.type)) {
        lyricPointer = drawSongSectionLinesOnlyChords(
          lyricPointer,
          section.lines,
          section.type + ": "
        );
      } else {
        /** @type {TextConfig} */
        const lyricStyle =
          section.type === WellKnownSectionType.Chorus
            ? chorusTextStyle
            : section.type === WellKnownSectionType.Ref
            ? refTextStyle
            : lyricTextStyle;
        lyricPointer = drawSongSectionLines(
          lyricPointer,
          section.lines,
          lyricStyle
        );
      }
      lyricPointer.moveDown(sectionDistance);
    }
    return doc;
  }

  /**
   * @param {BoxPointer} pointer
   * @param {SongLine[]} songLines
   * @param {TextConfig} lyricStyle
   * */
  function drawSongSectionLines(pointer, songLines, lyricStyle) {
    const lyricLineHeight = LEN(
      lyricStyle.font.heightAtSize(titleTextStyle.fontSize.in("pt")),
      "pt"
    );
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
      const lyricLine = new DetachedTextBox(line.lyric, lyricStyle);

      const partialWidths = lyricLine.partialWidths();
      for (const chord of line.chords) {
        const yOffset = partialWidths[chord.startIndex];
        if (!yOffset) continue;
        pointer
          .pointerRight(yOffset)
          .setText("right", "bottom", chord.chord, chordTextStyle);
      }
      pointer.moveDown(chordLineHeight.mul(0.9));
      pointer.attachTextBox("right", "bottom", lyricLine);
      pointer.moveDown(lyricLineHeight.mul(0.75));
    }
    return pointer;
  }

  /**
   * @param {BoxPointer} pointer
   * @param {SongLine[]} songLines
   * @param {string} title
   * */
  function drawSongSectionLinesOnlyChords(pointer, songLines, title) {
    const heightOfSection = chordLineHeight.mul(songLines.length);

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
      const lineString = title + line.chords.map((c) => c.chord).join(" ");
      pointer.setText("right", "bottom", lineString, chordTextStyle);
      pointer.moveDown(chordLineHeight);
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
 * @param {Song} _song
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function reshapeSongWithSchema(_song, style, width) {
  return new SchemaWrapper(_song, width, style).process();
}
