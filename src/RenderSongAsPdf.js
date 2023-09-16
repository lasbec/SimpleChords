/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Drawing/Types.ts").TextConfig} TextConfig
 * @typedef {import("./Drawing/Boxes/Geometry.ts").Dimensions} Dimensions
 * @typedef {import("./Song.js").SongSection} SongSection
 */
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FontLoader } from "./Drawing/FontLoader.js";
import { LEN, Length } from "./Length.js";
import { Document } from "./Drawing/Document.js";
import { DetachedTextBox } from "./Drawing/Boxes/DetachedTextBox.js";
import { PageBox } from "./Drawing/Boxes/PageBox.js";
import { BoxPointer } from "./Drawing/Boxes/BoxPointer.js";
import { parseSongAst } from "./SongParser.js";
import * as Path from "path";
import * as fs from "fs/promises";
import { Song, SongLine } from "./Song.js";
import { checkSongAst, WellKnownSectionType } from "./SongChecker.js";
import { SchemaWrapper } from "./SchemaWrapper.js";
import { BoxTreeRoot } from "./Drawing/Boxes/BoxTreeNode.js";

/**
 * @param {string} path
 * @param {string} outPath
 * @param {boolean} debug
 */
export async function renderSingleFile(path, outPath, debug) {
  return renderAllInSingleFile([path], outPath, debug);
}

/**
 * @param {string[]} paths
 * @param {string} outPath
 * @param {boolean} debug
 */
export async function renderAllInSingleFile(paths, outPath, debug) {
  const pdfBytes = await renderToSinglePdfBuffer(paths, debug);

  await fs.writeFile(outPath, pdfBytes);
  console.log("Pdf Result written to", Path.resolve(outPath), "\n");
}

/**
 * @param {string[]} paths
 * @param {boolean} debug
 */
async function renderToSinglePdfBuffer(paths, debug) {
  let asts = await parseASTs(paths, debug);

  const songs = asts.map(Song.fromAst);

  const fontLoader = new FontLoader("./fonts");
  const pdfBytes = await renderSongAsPdf(songs, fontLoader, debug);
  return pdfBytes;
}

/**
 * @param {string[]} paths
 * @param {boolean} debug
 */
async function parseASTs(paths, debug) {
  let asts = [];
  for (const path of paths) {
    console.log("Process", Path.parse(path).name);
    const contentToParse = (await fs.readFile(path, "utf8")).replace(/\r/g, ""); // ensure linebreaks are \n and not \r\n;
    const ast = parseSongAst(contentToParse);
    if (!ast) {
      throw Error("Could not parse " + path);
    }
    checkSongAst(ast);
    asts.push(ast);
    const pointSplit = path.split(".");
    const astOutputPath = pointSplit
      .map((e, i) => (i === pointSplit.length - 1 ? "AST.json" : e))
      .join(".");
    if (debug) {
      fs.writeFile(astOutputPath, JSON.stringify(ast, null, 2))
        .catch((e) => {
          console.warn("AST debug file could not be written", e);
        })
        .then(() => {
          console.log("AST result written to", Path.resolve(astOutputPath));
        });
    }
  }
  return asts;
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
 * @param {Song[]} songs
 * @param {FontLoader} fontLoader
 * @param {boolean} debug
 */
export async function renderSongAsPdf(songs, fontLoader, debug) {
  Document.debug = debug;
  const pdfDoc = await PDFDocument.create();

  /** @type {Dimensions} */
  const A5 = {
    width: LEN(148.5, "mm"),
    height: LEN(210, "mm"),
  };
  const stdFontSize = LEN(11, "pt");
  /**@type {LayoutConfig} */
  const layoutConfig = {
    pageHeight: A5.height,
    pageWidth: A5.width,

    lyricTextConfig: {
      font: await pdfDoc.embedFont(StandardFonts.Helvetica),
      fontSize: stdFontSize,
    },
    refTextConfig: {
      font: await pdfDoc.embedFont(StandardFonts.HelveticaBold),
      fontSize: stdFontSize,
    },
    chorusTextConfig: {
      font: await pdfDoc.embedFont(StandardFonts.HelveticaOblique),
      fontSize: stdFontSize,
    },
    titleTextConfig: {
      fontSize: stdFontSize.mul(1.3),
      font: await pdfDoc.embedFont(StandardFonts.Helvetica),
    },
    chordTextConfig: {
      font: await fontLoader.loadFontIntoDoc(
        pdfDoc,
        "CarterOne/CarterOne-Regular.ttf"
      ),
      fontSize: LEN(9, "pt"),
    },
    leftMargin: A5.width.mul(0.08),
    rightMargin: A5.width.mul(0),
    topMargin: A5.width.mul(0.0),
    bottomMargin: A5.width.mul(0.0),
    sectionDistance: stdFontSize.mul(1.3),
  };

  const doc = new Document({
    width: layoutConfig.pageWidth,
    height: layoutConfig.pageHeight,
  });
  for (const song of songs) {
    console.log(`Drawing '${song.heading}'`);
    await layOutSongOnNewPage(
      reshapeSongWithSchema(
        song,
        layoutConfig,
        layoutConfig.pageWidth
          .sub(layoutConfig.leftMargin)
          .sub(layoutConfig.rightMargin)
      ),
      layoutConfig,
      doc
    );
  }
  doc.drawToPdfDoc(pdfDoc);

  return await pdfDoc.save();
}

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Document} doc
 * @returns {Promise<Document>}
 */
async function layOutSongOnNewPage(song, layoutConfig, doc) {
  const lyricLineHeight = LEN(
    layoutConfig.lyricTextConfig.font.heightAtSize(
      layoutConfig.lyricTextConfig.fontSize.in("pt")
    ),
    "pt"
  );
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
 * @param {BoxTreeRoot} page
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
