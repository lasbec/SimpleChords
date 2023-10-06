/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Drawing/Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Song.js").SongSection} SongSection
 */
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FontLoader } from "./Drawing/FontLoader.js";
import { LEN, Length } from "./Length.js";
import { Document } from "./Drawing/Document.js";
import { BoxPointer } from "./Drawing/BoxPointer.js";
import { parseSongAst } from "./SongParser.js";
import * as Path from "path";
import * as fs from "fs/promises";
import { Song } from "./Song.js";
import { SongLine } from "./SongLine.js";
import { checkSongAst, WellKnownSectionType } from "./SongChecker.js";
import { SchemaWrapper } from "./SchemaWrapper.js";
import { BoxTreeRoot } from "./Drawing/BoxTreeNode.js";
import { TextConfig } from "./Drawing/TextConfig.js";
import { SongSectionBox } from "./Drawing/Boxes/SongSectionBox.js";
import { TextBox } from "./Drawing/PrimitiveBoxes/TextBox.js";

/**
 * @param {string} path
 * @param {string} outPath
 * @param {LayoutConfigDto} layoutConfigDto
 * @param {boolean} debug
 */
export async function renderSingleFile(path, outPath, layoutConfigDto, debug) {
  return renderAllInSingleFile([path], outPath, layoutConfigDto, debug);
}

/**
 * @param {string[]} paths
 * @param {string} outPath
 * @param {LayoutConfigDto} layoutConfigDto
 * @param {boolean} debug
 */
export async function renderAllInSingleFile(
  paths,
  outPath,
  layoutConfigDto,
  debug
) {
  const pdfDoc = await PDFDocument.create();

  /**@type {LayoutConfig} */
  const layoutConfig = await layoutConfigFromDto(layoutConfigDto, pdfDoc);
  const pdfBytes = await renderToSinglePdfBuffer(
    paths,
    debug,
    layoutConfig,
    pdfDoc
  );

  await fs.writeFile(outPath, pdfBytes);
  console.log("Pdf Result written to", Path.resolve(outPath), "\n");
}

/**
 * @param {string[]} paths
 * @param {boolean} debug
 * @param {LayoutConfig} layoutConfig
 * @param {PDFDocument} pdfDoc
 */
async function renderToSinglePdfBuffer(paths, debug, layoutConfig, pdfDoc) {
  let asts = await parseASTs(paths, debug);

  const songs = asts.map(Song.fromAst);

  const pdfBytes = await renderSongAsPdf(songs, debug, layoutConfig, pdfDoc);
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
 * @typedef {import("./Length.js").LengthDto} LengthDto
 * @typedef {import("./Drawing/TextConfig.js").TextConfigDto} TextConfigDto
 */

/**
 * @typedef {object} LayoutConfigDto
 * @property {TextConfigDto} lyricTextConfig
 * @property {TextConfigDto} chorusTextConfig
 * @property {TextConfigDto} refTextConfig
 * @property {TextConfigDto} titleTextConfig
 * @property {TextConfigDto} chordTextConfig
 *
 * @property {LengthDto} leftMargin
 * @property {LengthDto} rightMargin
 * @property {LengthDto} topMargin
 * @property {LengthDto} bottomMargin
 * @property {LengthDto} pageWidth
 * @property {LengthDto} pageHeight
 * @property {LengthDto} sectionDistance
 */

/**
 * @typedef {object} LayoutConfig
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
 * @param {boolean} debug
 * @param {LayoutConfig} layoutConfig
 * @param {PDFDocument} pdfDoc
 */
export async function renderSongAsPdf(songs, debug, layoutConfig, pdfDoc) {
  Document.debug = debug;

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

/** @type {Array<string>} */
const StdFontNames = Object.values(StandardFonts);
/**
 * @param {PDFDocument} pdfDoc
 * @param {string} font
 */
async function embedFont(pdfDoc, font) {
  if (StdFontNames.includes(font)) {
    return await pdfDoc.embedFont(font);
  }
  const fontLoader = new FontLoader("./fonts");
  return await fontLoader.loadFontIntoDoc(
    pdfDoc,
    "CarterOne/CarterOne-Regular.ttf"
  );
}

/**
 *
 * @param {LayoutConfigDto} configDto
 * @param {PDFDocument} pdfDoc
 * @returns
 */
async function layoutConfigFromDto(configDto, pdfDoc) {
  return {
    pageHeight: Length.fromString(configDto.pageHeight),
    pageWidth: Length.fromString(configDto.pageWidth),

    leftMargin: Length.fromString(configDto.leftMargin),
    rightMargin: Length.fromString(configDto.rightMargin),
    topMargin: Length.fromString(configDto.topMargin),
    bottomMargin: Length.fromString(configDto.bottomMargin),
    sectionDistance: Length.fromString(configDto.sectionDistance),

    lyricTextConfig: new TextConfig({
      font: await embedFont(pdfDoc, configDto.lyricTextConfig.font),
      fontSize: Length.fromString(configDto.lyricTextConfig.fontSize),
    }),
    refTextConfig: new TextConfig({
      font: await embedFont(pdfDoc, configDto.refTextConfig.font),
      fontSize: Length.fromString(configDto.refTextConfig.fontSize),
    }),
    chorusTextConfig: new TextConfig({
      font: await embedFont(pdfDoc, configDto.chorusTextConfig.font),
      fontSize: Length.fromString(configDto.chorusTextConfig.fontSize),
    }),
    titleTextConfig: new TextConfig({
      font: await embedFont(pdfDoc, configDto.titleTextConfig.font),
      fontSize: Length.fromString(configDto.titleTextConfig.fontSize),
    }),
    chordTextConfig: new TextConfig({
      font: await embedFont(pdfDoc, configDto.chordTextConfig.font),
      fontSize: Length.fromString(configDto.chordTextConfig.fontSize),
    }),
  };
}

/**
 * @param {Song} song
 * @param {LayoutConfig} layoutConfig
 * @param {Document} doc
 * @returns {Promise<Document>}
 */
async function layOutSongOnNewPage(song, layoutConfig, doc) {
  const lyricLineHeight = layoutConfig.lyricTextConfig.lineHeight;
  const titleBox = drawTitle(
    song,
    doc.appendNewPage(),
    layoutConfig.topMargin,
    layoutConfig.titleTextConfig
  );
  const pointer = BoxPointer.atBox("left", "bottom", titleBox).onPage();

  pointer.moveDown(lyricLineHeight);
  pointer.moveToBorder("left").moveRight(layoutConfig.leftMargin);

  const rightBottomPointer = pointer
    .onPage()
    .moveToBorder("bottom")
    .moveToBorder("right")
    .moveUp(layoutConfig.bottomMargin)
    .moveLeft(layoutConfig.rightMargin);
  const lyricBox = pointer.span(rightBottomPointer);
  let lyricPointer = BoxPointer.atBox("left", "top", lyricBox);

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
      : sectionType === WellKnownSectionType.Refrain
      ? layoutConfig.refTextConfig
      : layoutConfig.lyricTextConfig;
  const chordTextConfig = layoutConfig.chordTextConfig;

  const sectionBox = new SongSectionBox(
    {
      type: sectionType,
      lines: songLines,
    },
    {
      chordsConfig: chordTextConfig,
      lyricConfig: lyricStyle,
    }
  );

  const heightOfSection = sectionBox.height;

  const lowerEndOfSection = pointer.clone().moveToBorder("bottom");

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
      .moveToBorder("bottom")
      .moveToBorder("right")
      .moveUp(layoutConfig.topMargin)
      .moveLeft(layoutConfig.rightMargin);
    const lyricBox = leftTopCorner.span(rightBottomCorner);
    pointer = BoxPointer.atBox("left", "top", lyricBox);
  }
  pointer.setBox("right", "bottom", sectionBox);
  return pointer.moveDown(sectionBox.height);
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
  const chordLineHeight = chordTextConfig.lineHeight;
  const heightOfSection = chordLineHeight.mul(songLines.length);

  const lowerEndOfSection = pointer.clone().moveToBorder("bottom");

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
      .moveToBorder("bottom")
      .moveToBorder("right")
      .moveUp(layoutConfig.topMargin)
      .moveLeft(layoutConfig.rightMargin);
    const lyricBox = leftTopCorner.span(rightBottomCorner);
    pointer = BoxPointer.atBox("left", "top", lyricBox);
  }
  for (const line of songLines) {
    const text = title + line.chords.map((c) => c.chord).join(" ");
    const textBox = new TextBox(text, layoutConfig.chordTextConfig);
    pointer.setBox("right", "bottom", textBox);
    pointer.moveDown(chordLineHeight);
  }
  return pointer;
}

/**
 * @param {Song} song
 * @param {BoxTreeRoot} page
 * @param {Length} topMargin
 * @param {TextConfig} style
 */
function drawTitle(song, page, topMargin, style) {
  const pointer = BoxPointer.atBox("center", "top", page).moveDown(topMargin);
  const x = "center";
  const y = "bottom";
  const text = song.heading;
  const textBox = new TextBox(text, style);
  return pointer.setBox(x, y, textBox);
}

/**
 * @param {Song} _song
 * @param {LayoutConfig} config
 * @param {Length} width
 */
function reshapeSongWithSchema(_song, config, width) {
  return new SchemaWrapper(_song, width, config).process();
}
