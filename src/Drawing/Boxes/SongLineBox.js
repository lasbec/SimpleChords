import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
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
export class SongLineBox {
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
    const pointer = getPoint({
      targetX: "left",
      targetY: "top",
      corner: position,
      width: this.width,
      height: this.height,
    });

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
    pointer.moveDown(this.lyricLineHeight());
    const lyricBox = new TextBox(this.line.lyric, this.lyricConfig);
    lyricBox.setPosition({
      x: "left",
      y: "bottom",
      point: pointer,
    });
    this.children.push(lyricBox);
  }

  /**
   * @type {Length | undefined}
   * @private
   */
  _width;

  get width() {
    if (this._width) return this._width;

    const lyricWidth = this.lyricConfig.widthOfText(this.line.lyric);
    const lastChord = this.line.chords[this.line.chords.length - 1];
    if (!lastChord) return lyricWidth;
    const lastChordYOffset = this.partialWidths()[lastChord.startIndex];
    if (!lastChordYOffset)
      throw Error(
        `No y-offset found for chord '${lastChord.chord}' (index = ${lastChord.startIndex})`
      );
    const lastChordWidth = this.chordsConfig.widthOfText(lastChord.chord);
    const result = Length.safeMax(
      lyricWidth,
      lastChordYOffset.add(lastChordWidth)
    );
    this._width = result;
    return result;
  }

  get height() {
    const chordsLineHeight = this.chordsConfig.lineHeight;
    const lyricLineHeight = this.lyricLineHeight();
    return chordsLineHeight.add(lyricLineHeight);
  }

  lyricLineHeight() {
    return this.lyricConfig.lineHeight;
  }

  /**
   * @private
   * @returns {Array<Length>}
   */
  partialWidths() {
    const result = [];
    let partial = "";
    for (const char of this.line) {
      const widthPt = this.lyricConfig.font.widthOfTextAtSize(
        partial,
        this.lyricConfig.fontSize.in("pt")
      );
      result.push(LEN(widthPt, "pt"));
      partial += char;
    }
    return result;
  }
}
