/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Song/Song.js").SongSection} SongSection
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 */
import { PDFDocument, StandardFonts } from "pdf-lib";
import { FontLoader } from "../Drawing/FontLoader.js";
import { LEN, Length } from "../Shared/Length.js";
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
import { ArragmentBox } from "../Drawing/Boxes/ArrangementBox.js";
import { TextBox } from "../Drawing/Boxes/TextBox.js";

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
 */

/**
 * @typedef {import("../Drawing/Geometry.js").RectangleGenerator} RectangleGenerator
 * @typedef {import("../Drawing/Geometry.js").Dimensions} Dims
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
 * @property {boolean} printPageNumbers
 * @property {"left" | "right" =} firstPage
 * @property {string =} tableOfContents
 *
 * @property {LengthDto} outerMargin
 * @property {LengthDto} innerMargin
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
 * @property {boolean} printPageNumbers
 * @property {"left" | "right"} firstPage
 * @property {string} tableOfContents
 *
 * @property {Length} outerMargin
 * @property {Length} innerMargin
 * @property {Length} topMargin
 * @property {Length} bottomMargin
 *
 * @property {Length} pageWidth
 * @property {Length} pageHeight
 *
 * @property {Length} sectionDistance
 */

/**
 * @implements {RectangleGenerator}
 */
class BookPageGenerator {
  /**
   * @param {LayoutConfig} config
   */
  constructor(config) {
    this.config = config;
    this.count = 0;
    /** @type {"left" | "right"} */
    this.firstPageOrientation = config.firstPage;
    /** @type {"left" | "right"} */
    this.secondPageOrientation = config.firstPage === "left" ? "right" : "left";
  }

  clone() {
    const result = new BookPageGenerator(this.config);
    result.count = this.count;
    return result;
  }

  /**
   * @param {number} pageNumber
   * @returns {"left" | "right"}
   */
  innerSide(pageNumber) {
    return pageNumber % 2 === 1
      ? this.secondPageOrientation
      : this.firstPageOrientation;
  }

  /**
   * @param {number} pageNumber
   * @returns {"left" | "right"}
   */
  outerSide(pageNumber) {
    return pageNumber % 2 === 1
      ? this.firstPageOrientation
      : this.secondPageOrientation;
  }

  /**
   * @param {number} i
   */
  get(i) {
    const page = RectangleImpl.fromPlacement(
      {
        pointOnGrid: PointImpl.origin(),
        pointOnRect: { x: "left", y: "bottom" },
      },
      { height: this.config.pageHeight, width: this.config.pageWidth }
    );
    const innerSide = this.innerSide(i + 1);
    const outerSide = this.outerSide(i + 1);
    return RectangleImpl.fromCorners(
      page
        .getPoint(innerSide, "bottom")
        .moveUp(this.config.bottomMargin)
        .move(outerSide, this.config.innerMargin),
      page
        .getPoint(outerSide, "top")
        .moveDown(this.config.topMargin)
        .move(innerSide, this.config.outerMargin)
    );
  }

  get lenght() {
    return this.count;
  }

  current() {
    return this.get(this.count - 1);
  }

  next() {
    this.count += 1;
    return this.get(this.count - 1);
  }
}

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

  let originalGen = new BookPageGenerator({
    ...layoutConfig,
    bottomMargin: layoutConfig.printPageNumbers
      ? layoutConfig.bottomMargin.add(layoutConfig.lyricTextConfig.lineHeight)
      : layoutConfig.bottomMargin,
  });
  /** @type {import("../Drawing/Geometry.js").RectangleGenerator} */
  let gen = originalGen;
  /** @type {Box[]} */
  const boxes = [];
  /** @type {{song:Song, pageNumber:number}[]} */
  const numberedSongs = [];
  let pageNumber = 1;
  for (const song of songs) {
    console.log(`Drawing '${song.heading}'`);
    const { boxes: songBoxes, generatorState } = songLayout(
      song,
      layoutConfig,
      gen
    );
    gen = generatorState;
    boxes.push(...songBoxes);
    numberedSongs.push({ song, pageNumber });
    pageNumber += songBoxes.length;
  }

  if (layoutConfig.tableOfContents) {
    const tocBoxes = tableOfContents(gen, layoutConfig, numberedSongs);
    boxes.push(...tocBoxes);
  }

  /** @type {Box[]} */
  const pages = [];
  pageNumber = 0;
  for (const box of boxes) {
    pageNumber += 1;
    const currPage = ArragmentBox.newPage(pageDims);
    currPage.appendChild(box);
    if (layoutConfig.printPageNumbers) {
      const outerSide = originalGen.outerSide(pageNumber);
      const pageNumberBox = new TextBox(
        `${pageNumber}`,
        layoutConfig.lyricTextConfig
      );
      pageNumberBox.setPosition({
        pointOnGrid: box.rectangle.getPoint(outerSide, "bottom"),
        pointOnRect: { x: outerSide, y: "top" },
      });
      currPage.appendChild(pageNumberBox);
    }
    pages.push(currPage);
  }
  drawToPdfDoc(pdfDoc, pages);

  return await pdfDoc.save();
}

/** @type {Array<string>} */
const StdFontNames = Object.values(StandardFonts);

const articles = ["der", "die", "das", "ein", "einer", "eine", "a", "the"].map(
  (s) => s.toLowerCase()
);
/**
 * @param {string} str
 */
function removeArticle(str) {
  const s = str.split(" ");
  if (articles.includes(s[0])) {
    s.splice(0, 1);
  }
  return s.join(" ");
}

/**
 *
 * @param {Song} song
 */
function firstWords(song) {
  const fstSection = song.sections[0];
  if (!fstSection) return "";
  for (const line of fstSection.lines) {
    const lyric = line.lyric.trim();
    if (lyric) {
      return lyric.split(" ").slice(0, 5).join(" ");
    }
  }
  return "";
}

/**
 *
 * @param {RectangleGenerator} gen
 * @param {LayoutConfig} layoutConfig
 * @param {{song:Song, pageNumber:number}[]} _numberedSongs
 * @returns {Box[]}
 */
function tableOfContents(gen, layoutConfig, _numberedSongs) {
  /** @type {Box[]} */
  const result = [];

  const numberedSongs = _numberedSongs.flatMap((s) => {
    const heading = {
      type: "heading",
      title: s.song.heading,
      pageNumber: s.pageNumber,
    };
    const beginning = {
      type: "beginning",
      title: firstWords(s.song),
      pageNumber: s.pageNumber,
    };
    const beginningWithoutArticle = {
      type: "beginning",
      title: removeArticle(firstWords(s.song)),
      pageNumber: s.pageNumber,
    };
    const result = [heading];
    if (
      beginning.title.length >= 1 &&
      !heading.title.startsWith(beginning.title) &&
      !beginning.title.startsWith(heading.title)
    ) {
      result.push(beginning);
    }
    if (
      beginningWithoutArticle.title.length >= 1 &&
      beginning.title !== beginningWithoutArticle.title
    ) {
      result.push(beginningWithoutArticle);
    }
    return result;
  });
  numberedSongs.sort((a, b) => a.title.localeCompare(b.title));

  let currBox = ArragmentBox.fromRect(gen.next());
  result.push(currBox);
  let leftTop = currBox.rectangle.getPoint("left", "top");
  let rightTop = currBox.rectangle.getPoint("right", "top");

  const tocTitle = new TextBox(
    layoutConfig.tableOfContents,
    layoutConfig.titleTextConfig
  );
  tocTitle.setPosition({
    pointOnRect: { x: "center", y: "top" },
    pointOnGrid: currBox.rectangle.getPoint("center", "top"),
  });
  currBox.appendChild(tocTitle);

  leftTop.moveDown(tocTitle.rectangle.height);
  rightTop.moveDown(tocTitle.rectangle.height);

  for (const { type, title, pageNumber } of numberedSongs) {
    const titleBox = new TextBox(
      title,
      type === "heading"
        ? layoutConfig.lyricTextConfig
        : layoutConfig.chorusTextConfig
    );
    const pageNumberBox = new TextBox(
      `${pageNumber}`,
      layoutConfig.lyricTextConfig
    );

    if (
      leftTop
        .pointerDown(titleBox.rectangle.height)
        .isLowerOrEq(currBox.rectangle.getBorderHorizontal("bottom"))
    ) {
      currBox = ArragmentBox.fromRect(gen.next());
      result.push(currBox);
      leftTop = currBox.rectangle.getPoint("left", "top");
      rightTop = currBox.rectangle.getPoint("right", "top");
    }

    titleBox.setPosition({
      pointOnGrid: leftTop,
      pointOnRect: { x: "left", y: "top" },
    });
    leftTop.moveDown(titleBox.rectangle.height);
    currBox.appendChild(titleBox);

    pageNumberBox.setPosition({
      pointOnGrid: rightTop,
      pointOnRect: { x: "right", y: "top" },
    });
    rightTop.moveDown(pageNumberBox.rectangle.height);
    currBox.appendChild(pageNumberBox);
  }
  return result;
}

/**
 * @param {PDFDocument} pdfDoc
 * @param {string} font
 */
async function embedFont(pdfDoc, font) {
  if (StdFontNames.includes(font)) {
    return await pdfDoc.embedFont(font);
  }
  const fontLoader = new FontLoader("./fonts");
  return await fontLoader.loadFontIntoDoc(pdfDoc, font);
}

/**
 *
 * @param {LayoutConfigDto} configDto
 * @param {PDFDocument} pdfDoc
 * @returns {Promise<LayoutConfig>}
 */
async function layoutConfigFromDto(configDto, pdfDoc) {
  return {
    pageHeight: Length.fromString(configDto.pageHeight),
    pageWidth: Length.fromString(configDto.pageWidth),

    outerMargin: Length.fromString(configDto.outerMargin),
    innerMargin: Length.fromString(configDto.innerMargin),
    topMargin: Length.fromString(configDto.topMargin),
    bottomMargin: Length.fromString(configDto.bottomMargin),
    sectionDistance: Length.fromString(configDto.sectionDistance),

    printPageNumbers: configDto.printPageNumbers,
    firstPage: configDto.firstPage || "left",
    tableOfContents: configDto.tableOfContents || "",

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
