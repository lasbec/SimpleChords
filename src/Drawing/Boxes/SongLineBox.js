import { loadavg } from "os";
import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
import { AbstractHOBox, AbstractPrimitiveBox } from "../BoxDrawingUtils.js";
import { getPoint } from "../BoxMeasuringUtils.js";
import { FreePointer } from "../FreePointer.js";
import { TextBox } from "../PrimitiveBoxes/TextBox.js";
/**
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").HOBox} HOBox
 * @typedef {import("../Geometry.js").PrimitiveBox} PrimitiveBox
 */

/**
 * @typedef {object} SongLineBoxConfig
 * @property {TextConfig} lyricConfig
 * @property {TextConfig} chordsConfig
 */

/**
 * @implements {HOBox}
 */
export class SongLineBox extends AbstractHOBox {
  /**
   * @param {SongLine} line
   * @param {SongLineBoxConfig} args
   */
  constructor(line, args) {
    /**@type {(HOBox | PrimitiveBox)[]} */
    const children = SongLineBox.initChildren(
      line,
      args,
      new FreePointer(Length.zero, Length.zero)
    );
    super(children);
  }

  /**
   * @param {SongLine} line
   * @param {SongLineBoxConfig} args
   * @param {FreePointer} topLeft
   */
  static initChildren(line, args, topLeft) {
    /**@type {import("../Geometry.js").Box[]} */
    const children = [];
    const pointer = topLeft.clone();
    pointer.moveDown(args.chordsConfig.lineHeight);

    const partialWidths = this.partialWidths(line, args.lyricConfig);
    for (const chord of line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      const bottomLeftOfChord = pointer.pointerRight(yOffset);
      const chordBox = new TextBox(chord.chord, args.chordsConfig);
      chordBox.setPosition({
        x: "left",
        y: "bottom",
        point: bottomLeftOfChord,
      });
      children.push(chordBox);
    }
    pointer.moveDown(args.lyricConfig.lineHeight);
    const lyricBox = new TextBox(line.lyric, args.lyricConfig);
    lyricBox.setPosition({
      x: "left",
      y: "bottom",
      point: pointer,
    });
    children.push(lyricBox);
    return children;
  }

  /**
   * @param {SongLine} line
   * @param {SongLineBoxConfig} config
   * @returns {Length}
   */
  static initWidth(line, config) {
    const lyricWidth = config.lyricConfig.widthOfText(line.lyric);
    const lastChord = line.chords[line.chords.length - 1];
    if (!lastChord) return lyricWidth;
    const lastChordYOffset = SongLineBox.partialWidths(
      line,
      config.lyricConfig
    )[lastChord.startIndex];
    if (!lastChordYOffset)
      throw Error(
        `No y-offset found for chord '${lastChord.chord}' (index = ${lastChord.startIndex})`
      );
    const lastChordWidth = config.chordsConfig.widthOfText(lastChord.chord);
    const result = Length.safeMax(
      lyricWidth,
      lastChordYOffset.add(lastChordWidth)
    );
    return result;
  }

  /**
   * @private
   * @param {SongLine} line
   * @param {TextConfig} lyricConfig
   * @returns {Array<Length>}
   */
  static partialWidths(line, lyricConfig) {
    const result = [];
    let partial = "";
    for (const char of line) {
      const widthPt = lyricConfig.font.widthOfTextAtSize(
        partial,
        lyricConfig.fontSize.in("pt")
      );
      result.push(LEN(widthPt, "pt"));
      partial += char;
    }
    return result;
  }
}
