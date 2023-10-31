import { LEN, Length } from "../Shared/Length.js";
import { SongLine } from "../Song/SongLine.js";
import { decorateAsBox } from "../Drawing/Boxes/BoxDecorator.js";
import { PointImpl } from "../Drawing/Figures/PointImpl.js";
import { TextBox } from "../Drawing/Boxes/TextBox.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 * @typedef {import("../Drawing/Geometry.js").ReferencePoint} BoxPlacement
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
   * @param {PointImpl} topLeft
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
