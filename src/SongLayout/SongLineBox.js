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
 * @typedef {import("../Drawing/BreakableText.js").StrLikeConstraint} StrLikeConstraint
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
 * @implements {StrLikeConstraint}
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
    this.box = ArragmentBox.undboundBoxGroup([]);
    this.initChildren();
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

  [Symbol.iterator]() {
    return this.content[Symbol.iterator]();
  }

  /**
   * @returns {number}
   */
  get length() {
    return this.content.length;
  }

  toString() {
    return this.content.toString();
  }

  /**
   * @param {number} i
   * @returns {string}
   */
  charAt(i) {
    return this.content.charAt(i);
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

  /** @private */
  initChildren() {
    const line = this.content;
    const args = this.style;
    const topLeft = PointImpl.origin();
    const pointer = topLeft.clone();
    pointer.moveDown(args.chordsConfig.lineHeight);

    const partialWidths = this.partialWidths();
    for (const chord of line.chords) {
      const yOffset = partialWidths[chord.startIndex];
      if (!yOffset) continue;
      const bottomLeftOfChord = pointer.pointerRight(yOffset);
      const chordBox = new TextBox(chord.chord, args.chordsConfig);
      chordBox.setPosition({
        pointOnRect: { x: "left", y: "bottom" },
        pointOnGrid: bottomLeftOfChord,
      });
      this.box.appendChild(chordBox);
    }
    pointer.moveDown(args.lyricConfig.lineHeight);
    const lyricBox = new TextBox(line.lyric, args.lyricConfig);
    lyricBox.setPosition({
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: pointer,
    });
    this.box.appendChild(lyricBox);
  }

  /** @param {Length} width  */
  maxChordsToFitInWidth(width) {
    let currMax = 0;
    for (const chord of this.content.chords) {
      const canWidth = this.partialWidths()[chord.startIndex];
      if (canWidth.gt(width)) return currMax;
      currMax += 1;
    }
    return currMax;
  }

  /**
   * @private
   * @type {Array<Length> | undefined}
   */
  _partialWidths;
  partialWidths() {
    if (this._partialWidths) return this._partialWidths;
    const line = this.content;
    const lyricConfig = this.style.lyricConfig;
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
    this._partialWidths = result;
    return result;
  }
}
