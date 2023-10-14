import { LEN, Length } from "../Shared/Length.js";
import { SongLine } from "../Song/SongLine.js";
import { HigherOrderBox, decorateAsBox } from "../Drawing/HigherOrderBox.js";
import { MutableFreePointer } from "../Drawing/FreePointer.js";
import { TextBox } from "../Drawing/PrimitiveBoxes/TextBox.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 * @typedef {import("../Drawing/Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Drawing/Geometry.js").Point} Point
 * @typedef {import("../Drawing/Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Drawing/Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Drawing/Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("../Drawing/Geometry.js").Box} PrimitiveBox
 */

/**
 * @typedef {object} SongLineBoxConfig
 * @property {TextConfig} lyricConfig
 * @property {TextConfig} chordsConfig
 */

class SongLineBox {
  /**
   * @param {SongLine} line
   * @param {SongLineBoxConfig} args
   * @param {MutableFreePointer} topLeft
   */
  static initChildren(line, args, topLeft) {
    /**@type {Box[]} */
    const children = [];
    const pointer = topLeft.clone();
    pointer.moveDown(args.chordsConfig.lineHeight);

    const partialWidths = SongLineBox.partialWidths(line, args.lyricConfig);
    for (const chord of line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      const bottomLeftOfChord = pointer.pointerRight(yOffset);
      const chordBox = new TextBox(chord.chord, args.chordsConfig);
      chordBox.setPosition({
        pointOnRect: { x: "left", y: "bottom" },
        pointOnGrid: bottomLeftOfChord,
      });
      children.push(chordBox);
    }
    pointer.moveDown(args.lyricConfig.lineHeight);
    const lyricBox = new TextBox(line.lyric, args.lyricConfig);
    lyricBox.setPosition({
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: pointer,
    });
    children.push(lyricBox);
    return children;
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

export const songLineBox = decorateAsBox(SongLineBox.initChildren);