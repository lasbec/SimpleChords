/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Page.js").TextConfig} TextConfig
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
 * @property {TextConfig} lyricTextConfig
 * @property {TextConfig} chorusTextConfig
 * @property {TextConfig} refTextConfig
 * @property {TextConfig} titleTextConfig
 * @property {TextConfig} chordTextConfig
 *
 * @property {Length} leftMargin
 * @property {Length} rightMargin
 * @property {Length} topMargin
 * @property {Length} bottomMargin
 *
 * @property {Length} pageWidth
 * @property {Length} pageHeight
 *
 * @property {Length} sectionDistance
 */

/**
 * @param {Song} song
 * @param {FontLoader} fontLoader
 * @param {boolean} debug
 */
export async function renderSongAsPdf(song, fontLoader, debug) {
  Document.debug = debug;
  const pdfDoc = await PDFDocument.create();

  /** @type {import("./Page.js").Dimesions} */
  const A5 = {
    width: LEN(148.5, "mm"),
    height: LEN(210, "mm"),
  };
  /**@type {LayoutConfig} */
  const layoutConfig = {
    pageHeight: A5.height,
    pageWidth: A5.width,

    lyricTextConfig: {
      font: await pdfDoc.embedFont(StandardFonts.TimesRoman),
      fontSize: LEN(10, "pt"),
    },
    refTextConfig: {
      font: await pdfDoc.embedFont(StandardFonts.TimesRomanBold),
      fontSize: LEN(10, "pt"),
    },
    chorusTextConfig: {
      font: await pdfDoc.embedFont(StandardFonts.TimesRomanItalic),
      fontSize: LEN(10, "pt"),
    },
    titleTextConfig: {
      fontSize: LEN(14, "pt"),
      font: await pdfDoc.embedFont(StandardFonts.TimesRoman),
    },
    chordTextConfig: {
      font: await fontLoader.loadFontIntoDoc(
        pdfDoc,
        "CarterOne/CarterOne-Regular.ttf"
      ),
      fontSize: LEN(8, "pt"),
    },
    leftMargin: A5.width.mul(0.07),
    rightMargin: A5.width.mul(0.07),
    topMargin: A5.width.mul(0.02),
    bottomMargin: A5.width.mul(0.02),
    sectionDistance: LEN(6, "mm"),
  };

  const pages = await layOutSong(
    reshapeSongWithSchema(
      song,
      layoutConfig,
      layoutConfig.pageWidth
        .sub(layoutConfig.leftMargin)
        .sub(layoutConfig.rightMargin)
    ),
    layoutConfig
  );
  pages.drawToPdfDoc(pdfDoc);

  return await pdfDoc.save();
}

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @returns {Promise<Document>}
 */
async function layOutSong(song, layoutConfig) {
  const lyricLineHeight = LEN(
    layoutConfig.lyricTextConfig.font.heightAtSize(
      layoutConfig.lyricTextConfig.fontSize.in("pt")
    ),
    "pt"
  );
  const doc = new Document({
    width: layoutConfig.pageWidth,
    height: layoutConfig.pageHeight,
  });
  const titleBox = drawTitle(
    song,
    doc.appendNewPage(),
    layoutConfig.topMargin,
    layoutConfig.titleTextConfig
  );
  const pointer = titleBox.getPointerAt("left", "bottom").onPage();

  pointer.moveDown(lyricLineHeight);
  pointer.moveToLeftBorder().moveRight(layoutConfig.leftMargin);

  const rightBottomPointer = pointer
    .onPage()
    .moveToBottomBorder()
    .moveToRightBorder()
    .moveUp(layoutConfig.bottomMargin)
    .moveLeft(layoutConfig.rightMargin);
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
        section.type + "   ",
        layoutConfig
      );
    } else {
      lyricPointer = drawSongSectionLines(
        lyricPointer,
        section.lines,
        section.type,
        layoutConfig
      );
    }
    lyricPointer.moveDown(layoutConfig.sectionDistance);
  }
  return doc;
}

/**
 * @param {BoxPointer} pointer
 * @param {SongLine[]} songLines
 * @param {string} sectionType
 * @param {LayoutConfig} layoutConfig
 * */
function drawSongSectionLines(pointer, songLines, sectionType, layoutConfig) {
  /** @type {TextConfig} */
  const lyricStyle =
    sectionType === WellKnownSectionType.Chorus
      ? layoutConfig.chorusTextConfig
      : sectionType === WellKnownSectionType.Ref
      ? layoutConfig.refTextConfig
      : layoutConfig.lyricTextConfig;
  const lyricLineHeight = LEN(
    lyricStyle.font.heightAtSize(lyricStyle.fontSize.in("pt")),
    "pt"
  );

  const chordTextConfig = layoutConfig.chordTextConfig;
  const chordLineHeight = LEN(
    chordTextConfig.font.heightAtSize(chordTextConfig.fontSize.in("pt")),
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
      .moveDown(layoutConfig.topMargin)
      .moveRight(layoutConfig.leftMargin);
    const rightBottomCorner = pointer
      .onPage()
      .moveToBottomBorder()
      .moveToRightBorder()
      .moveUp(layoutConfig.topMargin)
      .moveLeft(layoutConfig.rightMargin);
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
        .setText("right", "bottom", chord.chord, layoutConfig.chordTextConfig);
    }
    pointer.moveDown(chordLineHeight);
    pointer.attachTextBox("right", "bottom", lyricLine);
    pointer.moveDown(lyricLineHeight.mul(0.75));
  }
  return pointer;
}

/**
 * @param {BoxPointer} pointer
 * @param {SongLine[]} songLines
 * @param {string} title
 * @param {LayoutConfig} layoutConfig
 * */
function drawSongSectionLinesOnlyChords(
  pointer,
  songLines,
  title,
  layoutConfig
) {
  const chordTextConfig = layoutConfig.chordTextConfig;
  const chordLineHeight = LEN(
    chordTextConfig.font.heightAtSize(chordTextConfig.fontSize.in("pt")),
    "pt"
  );
  const heightOfSection = chordLineHeight.mul(songLines.length);

  const lowerEndOfSection = pointer.clone().moveToBottomBorder();

  const sectionWillExeedPage = pointer
    .pointerDown(heightOfSection)
    .isLowerThan(lowerEndOfSection);
  if (sectionWillExeedPage) {
    const leftTopCorner = pointer
      .nextPageAt("left", "top")
      .moveDown(layoutConfig.topMargin)
      .moveRight(layoutConfig.leftMargin);
    const rightBottomCorner = pointer
      .onPage()
      .moveToBottomBorder()
      .moveToRightBorder()
      .moveUp(layoutConfig.topMargin)
      .moveLeft(layoutConfig.rightMargin);
    const lyricBox = leftTopCorner.spanBox(rightBottomCorner);
    pointer = lyricBox.getPointerAt("left", "top");
  }
  for (const line of songLines) {
    const lineString = title + line.chords.map((c) => c.chord).join(" ");
    pointer.setText(
      "right",
      "bottom",
      lineString,
      layoutConfig.chordTextConfig
    );
    pointer.moveDown(chordLineHeight);
  }
  return pointer;
}

/**
 * @param {Song} song
 * @param {Page} page
 * @param {Length} topMargin
 * @param {TextConfig} textConfig
 */
function drawTitle(song, page, topMargin, textConfig) {
  const pointer = page.getPointerAt("center", "top").moveDown(topMargin);
  return pointer.setText("center", "bottom", song.heading, textConfig);
}

/**
 * @param {Song} _song
 * @param {LayoutConfig} config
 * @param {Length} width
 */
function reshapeSongWithSchema(_song, config, width) {
  return new SchemaWrapper(_song, width, config).process();
}
