/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Page.js").TextStyle} TextStyle
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
import {checkSongAst, WellKnownSectionType} from "./SongChecker.js";
import { BreakableText } from "./BreakableText.js";

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
 * @param {Song} song
 * @param {FontLoader} fontLoader
 * @param {boolean} debug
 */
export async function renderSongAsPdf(song, fontLoader, debug) {
  Document.debug = debug;
  const pdfDoc = await PDFDocument.create();
  const pageWidth = LEN(148.5, "mm");
  const pageHeight = LEN(210, "mm");

  const lyricFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const lyricFontSize = LEN(12, "pt");
  /** @type {TextStyle} */
  const lyricTextStyle = {
    font: lyricFont,
    fontSize: lyricFontSize,
  };

  const lyricFontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  /** @type {TextStyle} */
  const lyricTextStyleBold = {
    font: lyricFontBold,
    fontSize: lyricFontSize,
  };

  const lyricFontItalic = await pdfDoc.embedFont(StandardFonts.TimesRomanItalic);
  /** @type {TextStyle} */
  const lyricTextStyleItalic = {
    font: lyricFontItalic,
    fontSize: lyricFontSize,
  };

  const titleFont = lyricFont;
  const titleFontSize = lyricFontSize.mul(1.3);
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

  const lyricLineHeight = LEN(
      lyricFont.heightAtSize(lyricFontSize.in("pt")),
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
      let onlyChordsSections = [WellKnownSectionType.Intro, WellKnownSectionType.Outro, WellKnownSectionType.Interlude];
      if(onlyChordsSections.includes(section.type)) {
        lyricPointer = drawSongSectionLinesOnlyChords(lyricPointer, section.lines, section.type + ": ")
      }else {
        /** @type {TextStyle} */
        const lyricStyle =
            section.type === WellKnownSectionType.Chorus
            ? lyricTextStyleItalic
            : section.type === WellKnownSectionType.Ref
            ? lyricTextStyleBold
            :lyricTextStyle;
        lyricPointer = drawSongSectionLines(lyricPointer, section.lines, lyricStyle);
      }
      lyricPointer.moveDown(sectionDistance);
    }
    return doc;
  }

  /**
   * @param {BoxPointer} pointer
   * @param {SongLine[]} songLines
   * @param {TextStyle} lyricStyle
   * */
  function drawSongSectionLines(pointer, songLines, lyricStyle) {
    const lyricLineHeight = LEN(
        lyricStyle.font.heightAtSize(titleFontSize.in("pt")),
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
    const heightOfSection = chordLineHeight
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
 * @param {Song} song
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function reshapeSongWithLineBreaks(song, style, width) {
  return {
    heading: song.heading,
    sections: song.sections.map((s) => ({
      type: s.type,
      lines: wrapLines(s.lines, style, width),
    })),
  };
}

/**
 * @param {Song} _song
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function reshapeSongWithSchema(_song, style, width) {
  return new SchemaWrapper(_song, width, style).process()
}

/**
 * @param {string} str
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function fitsWidth(str, style, width) {
  return (
    style.font.widthOfTextAtSize(str, style.fontSize.in("pt")) <= width.in("pt")
  );
}

/**
 * @param {SongLine} line
 * @param {import("./Page.js").TextStyle} style
 * @param {Length} width
 */
function getMaxLenToFitWidth(line, style, width) {
  let str = line.lyric;
  while (!fitsWidth(str, style, width)) {
    str = str.slice(0, -1);
  }
  return str.length;
}


/**
 * @typedef {SongSection & {toBeProcessed:BreakableText<SongLine> }} Result
 */

/**
 * Wrapping the sections of the same type in a way that they fit onto the page
 * AND in each line are the same amount of chords
 */
class SchemaWrapper {
  /** @type {Song}*/
  song;
  /** @type {Length}*/
  width;
  /** @type {TextStyle}*/
  style;
  /** @type {Result[]}*/
  results;
  /** @type {Record<string, Result[]>}*/
  resultsBySectionType;


  /**
   * @param {Song} song
   * @param {Length} width
   * @param {TextStyle} style
   */
  constructor(song, width, style) {
    this.song = song
    this.results = song.sections.map((s) => ({
      toBeProcessed: BreakableText.fromPrefferdLineUp(SongLine, s.lines),
      type: s.type,
      lines: []
    }))
    this.resultsBySectionType = {};
    for(const r of this.results){
      let results = this.resultsBySectionType[r.type];
      if(!results){
            results = []
            this.resultsBySectionType[r.type] = results;
        }
        results.push(r)
    }
    this.style = style;
    this.width = width;
  }

  /**
   * @param {BreakableText<SongLine>} line
   * @returns {number}
   */
  possibleChordsAInLine(line){
    const maxLen = getMaxLenToFitWidth(line.text, this.style, this.width);
    const [x, _] = line.break({ before: maxLen + 1, after: 0});
    return x.chords.length;
  }

  /**
   *
   * @param {Result} result
   * @param {number} chordIndex
   */
  breakLineAfterChord(result, chordIndex){
    const c0 = result.toBeProcessed.text.chords[chordIndex]
    const c1 = result.toBeProcessed.text.chords[chordIndex + 1]
    const maxLen = getMaxLenToFitWidth(result.toBeProcessed.text, this.style, this.width);
    const before = Math.min(c1?.startIndex !== undefined ? c1.startIndex : result.toBeProcessed.lenght +1, maxLen);
    const [newLine, rest] = result.toBeProcessed.break(
        {after: (c0?.startIndex || -1) + 1, before }
    );
    if(newLine.length > 0) result.lines.push(newLine);
    result.toBeProcessed = rest;

  }

  breakLines(){
    for(const [sectionType, results] of Object.entries(this.resultsBySectionType)) {
      const min = Math.min(...results.map((r) => this.possibleChordsAInLine(r.toBeProcessed)));
      results.forEach((r) => {
        this.breakLineAfterChord(r, min -1)
      });
    }
  }

  isDone(){
    return this.results.every((v) => v.toBeProcessed.lenght === 0);
  }

  /** @returns {Song} */
  process(){
    let iterations = 0;
    while(!this.isDone()){
      this.breakLines();
      iterations += 1
      if(iterations > 1_000){
        throw new Error("Max iterations exceeded")
      }
    }
    return {
      heading: this.song.heading,
      sections: this.results.map((r) =>( {
        type: r.type,
        lines: r.lines
      }))
    };
  }
}