import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
import { TextBox } from "../PrimitiveBoxes/TextBox.js";
/**
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").DetachedBox} DetachedBox
 */

/**
 * @typedef {object} SongLineBoxConfig
 * @property {TextConfig} lyricConfig
 * @property {TextConfig} chordsConfig
 */

/**
 * @implements {DetachedBox}
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
    /**@type {DetachedBox[]} */
    this.children = [];
  }
  /**
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {
    this.leftTopPointer = position.getPointerAt("left", "top");
    const pointer = this.leftTopPointer;
    if (!pointer) {
      throw Error("Position not set.");
    }
    pointer.moveDown(this.chordsConfig.lineHeight);

    const partialWidths = this.partialWidths();
    for (const chord of this.line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      const bottomLeftOfChord = pointer.pointerRight(yOffset);
      const chordBox = new TextBox(chord.chord, this.chordsConfig);
      chordBox.setPosition(bottomLeftOfChord.span(bottomLeftOfChord));
      this.children.push(chordBox);
    }
    pointer.moveDown(this.lyricLineHeight());
    const lyricBox = new TextBox(this.line.lyric, this.lyricConfig);
    lyricBox.setPosition(pointer.span(pointer));
    this.children.push(lyricBox);
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    for (const child of this.children) {
      child.drawToPdfPage(pdfPage);
    }
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
    return this.lyricConfig.lineHeight.mul(0.9);
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
