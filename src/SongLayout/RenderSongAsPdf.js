/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Drawing/Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Song/Song.js").SongSection} SongSection
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 */
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FontLoader } from "../Drawing/FontLoader.js";
import { Length } from "../Shared/Length.js";
import { parseSongAst } from "../Parsing/SongParser.js";
import * as Path from "path";
import * as fs from "fs/promises";
import { Song } from "../Song/Song.js";
import { checkSongAst } from "../Song/SongChecker.js";
import { TextConfig } from "../Drawing/TextConfig.js";
import { songLayout } from "./songLayout.js";
import { RectangleImpl } from "../Drawing/Figures/RectangleImpl.js";
import { PointImpl } from "../Drawing/Figures/PointImpl.js";
import { drawToPdfDoc } from "../Drawing/DrawToPdfDoc.js";
import { DebugMode } from "../Drawing/DebugMode.js";
import { HigherOrderBox } from "../Drawing/Boxes/HigherOrderBox.js";

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
 * @typedef {import("../Shared/Length.js").LengthDto} LengthDto
 * @typedef {import("../Drawing/TextConfig.js").TextConfigDto} TextConfigDto
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
  DebugMode.isOn = debug;

  const pageDims = {
    width: layoutConfig.pageWidth,
    height: layoutConfig.pageHeight,
  };

  const pageArea = RectangleImpl.fromPlacement(
    {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: PointImpl.origin(),
    },
    pageDims
  );

  const writableArea = pageArea
    .getPoint("left", "top")
    .moveDown(layoutConfig.topMargin)
    .moveRight(layoutConfig.rightMargin)
    .span(
      pageArea
        .getPoint("right", "bottom")
        .moveUp(layoutConfig.bottomMargin)
        .moveLeft(layoutConfig.rightMargin)
    );
  /** @type {Box[]} */
  const pages = [];
  for (const song of songs) {
    console.log(`Drawing '${song.heading}'`);
    const boxes = songLayout(song, layoutConfig, writableArea);
    for (const box of boxes) {
      const currPage = HigherOrderBox.newPage(pageDims);
      currPage.appendChild(box);
      pages.push(currPage);
    }
  }
  drawToPdfDoc(pdfDoc, pages);

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
