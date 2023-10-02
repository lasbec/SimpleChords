import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
import { AbstractBox } from "../BoxDrawingUtils.js";
import { getPoint } from "../BoxMeasuringUtils.js";
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
export class SongLineBox extends AbstractBox {
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

    this.line = line;
    this.lyricConfig = args.lyricConfig;
    this.chordsConfig = args.chordsConfig;
    /**@type {(HOBox | PrimitiveBox)[]} */
    this.children = [];
  }
  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    super.setPosition(position);
    const pointer = this.getPoint("left", "top");

    pointer.moveDown(this.chordsConfig.lineHeight);

    const partialWidths = this.partialWidths();
    for (const chord of this.line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      const bottomLeftOfChord = pointer.pointerRight(yOffset);
      const chordBox = new TextBox(chord.chord, this.chordsConfig);
      chordBox.setPosition({
        x: "left",
        y: "bottom",
        point: bottomLeftOfChord,
      });
      this.children.push(chordBox);
    }
    pointer.moveDown(this.lyricConfig.lineHeight);
    const lyricBox = new TextBox(this.line.lyric, this.lyricConfig);
    lyricBox.setPosition({
      x: "left",
      y: "bottom",
      point: pointer,
    });
    this.children.push(lyricBox);
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
