import { LEN, Length } from "../Shared/Length.js";
import { SongLine } from "../Song/SongLine.js";
import { decorateAsBox } from "../Drawing/BoxDecorator.js";
import { PointImpl } from "../Drawing/Figures/PointImpl.js";
import { TextBox } from "../Drawing/Boxes/TextBox.js";
import { ArragmentBox } from "../Drawing/Boxes/HigherOrderBox.js";
import { AbstractBox } from "../Drawing/Boxes/AbstractBox.js";
import { BoundsImpl } from "../Drawing/Figures/BoundsImpl.js";
/**
 */

/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Drawing/TextConfig.js").TextConfig} TextConfig
 * @typedef {import("../Drawing/Geometry.js").ReferencePoint} ReferencePoint
 * @typedef {import("../Drawing/Geometry.js").Point} Point
 * @typedef {import("../Drawing/Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Drawing/Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Drawing/Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Drawing/Geometry.js").Box} Box
 * @typedef {import("../Drawing/Geometry.js").Box} PrimitiveBox
 * @typedef {import("../Drawing/Geometry.js").LeaveBox} LeaveBox
 *
 */

/**
 * @typedef {object} SongLineBoxConfig
 * @property {TextConfig} lyricConfig
 * @property {TextConfig} chordsConfig
 */

/**
 * @extends {AbstractBox<SongLine, SongLineBoxConfig>}
 * @implements {LeaveBox}
 */
export class SongLineBox extends AbstractBox {
  /** @type {"leave"} */
  __discriminator__ = "leave";

  /**
   * @param {SongLine} content
   * @param {SongLineBoxConfig} style
   */
  /**
   *
   * @param {SongLine} content
   * @param {SongLineBoxConfig} style
   */
  constructor(content, style) {
    super(content, style, BoundsImpl.unbound());
    this.box = ArragmentBox.undboundBoxGroup(
      SongLineBox.initChildren(content, style, PointImpl.origin())
    );
  }
  /**
   * @param {ReferencePoint} point
   */
  setPosition(point) {
    this.box.setPosition(point);
  }

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    this.box.drawToPdfPage(page);
  }

  get rectangle() {
    return this.box.rectangle;
  }

  /**
   * @param {SongLineBox} s
   * @param {number} start
   * @param {number=} stop
   * @returns {SongLineBox}
   */
  static slice(s, start, stop) {
    return new SongLineBox(s.content.slice(start, stop), s.style);
  }

  /**
   * @param {SongLineBox[]} s
   * @returns {SongLineBox}
   */
  static concat(s) {
    return new SongLineBox(
      SongLine.concat(s.map((l) => l.content)),
      s[0]?.style
    );
  }

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
