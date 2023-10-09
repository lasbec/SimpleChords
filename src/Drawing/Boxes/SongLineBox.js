import { loadavg } from "os";
import { LEN, Length } from "../../Length.js";
import { SongLine } from "../../SongLine.js";
import { HigherOrderBox, decorateAsBox } from "../HigherOrderBox.js";
import { MutableFreePointer } from "../FreePointer.js";
import { TextBox } from "../PrimitiveBoxes/TextBox.js";
/**
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../TextConfig.js").TextConfig} TextConfig
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").Box} PrimitiveBox
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
    /**@type {import("../Geometry.js").Box[]} */
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
