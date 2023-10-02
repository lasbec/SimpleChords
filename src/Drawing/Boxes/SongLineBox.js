import { loadavg } from "os";
import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
import { AbstractPrimitiveBox } from "../BoxDrawingUtils.js";
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
export class SongLineBox extends AbstractPrimitiveBox {
  /**@type {SongLine}*/
  line;
  /**@type {TextConfig}*/
  lyricConfig;
  /**@type {TextConfig}*/
  chordsConfig;

  /**
   * @param {SongLine} line
   * @param {SongLineBoxConfig} args
   */
  constructor(line, args) {
    const chordsLineHeight = args.chordsConfig.lineHeight;
    const lyricLineHeight = args.lyricConfig.lineHeight;
    super({
      height: chordsLineHeight.add(lyricLineHeight),
      width: SongLineBox.initWidth(line, args),
    });

    /**@type {(HOBox | PrimitiveBox)[]} */
    this.children = SongLineBox.initChildren(
      line,
      args,
      new FreePointer(Length.zero, Length.zero)
    );
    this.line = line;
    this.lyricConfig = args.lyricConfig;
    this.chordsConfig = args.chordsConfig;
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
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const oldCenter = this.getPoint("center", "center");
    super.setPosition(position);
    const newCenter = this.getPoint("center", "center");
    const xMove = newCenter.x.sub(oldCenter.x);
    const yMove = newCenter.y.sub(oldCenter.y);

    for (const child of this.children) {
      const newChildCenter = child.getPoint("center", "center");
      newChildCenter.x = newChildCenter.x.add(xMove);
      newChildCenter.y = newChildCenter.y.add(yMove);
      child.setPosition({
        x: "center",
        y: "center",
        point: newChildCenter,
      });
    }
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
  /**
   * @private
   * @returns {Array<Length>}
   */
  partialWidths() {
    return SongLineBox.partialWidths(this.line, this.lyricConfig);
  }
}
