import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
import { TextBox } from "./TextBox.js";
/**
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Geometry.js").DetachedBox} DetachedBox
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
    if (!lastChordYOffset) return lyricWidth;
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
   * @param {PDFPage} pdfPage
   * @param {import("./Geometry.js").BoxPosition} position
   */
  drawToPdfPage(pdfPage, position) {
    const pointer = position.getPointerAt("left", "top");
    pointer.moveDown(this.chordsConfig.lineHeight);

    const partialWidths = this.partialWidths();
    for (const chord of this.line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      const bottomLeftOfChord = pointer.pointerRight(yOffset);
      pdfPage.drawText(chord.chord, {
        ...bottomLeftOfChord.rawPointIn("pt"),
        font: this.chordsConfig.font,
        size: this.chordsConfig.fontSize.in("pt"),
      });
    }
    pointer.moveDown(this.lyricLineHeight());
    pdfPage.drawText(this.line.lyric, {
      ...pointer.rawPointIn("pt"),
      font: this.lyricConfig.font,
      size: this.lyricConfig.fontSize.in("pt"),
    });
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
