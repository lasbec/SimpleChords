import { LEN, Length } from "../../Length.js";
import { BoxPointer } from "./BoxPointer.js";
import { rgb } from "pdf-lib";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").IBox} IBox
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 * @typedef {import("./PageBox.js").PageBox} PageBox
 */

export class DebugBox {
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  get leftBottomCorner() {
    return {
      x: this.center.x.sub(this.width.mul(1 / 2)),
      y: this.center.y.sub(this.width.mul(1 / 2)),
    };
  }
  /** @type {IBox} */
  parent;

  /** @type {number} */
  constructCount;

  static constructionCounter = 0;

  /**
   * @param {Point} center
   * @param {IBox} parent
   */
  constructor(center, parent) {
    this.width = LEN(3, "mm");
    this.height = LEN(3, "mm");
    this.center = center;
    this.parent = parent;
    this.constructCount = DebugBox.constructionCounter;
    DebugBox.constructionCounter += 1;
  }

  /** @returns {number} */
  level() {
    return 1 + this.parent.level();
  }

  /**
   * @returns {PageBox}
   */
  rootPage() {
    return this.parent.rootPage();
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**@param {PDFPage} pdfPage */
  drawToPdfPage(pdfPage) {
    pdfPage.drawCircle({
      x: this.center.x.in("pt"),
      y: this.center.y.in("pt"),
      size: 5,
      borderColor: rgb(1, 0, 0),
      borderWidth: 1,
      opacity: 1,
    });
    pdfPage.drawText(`${this.constructCount}`, {
      x: this.leftBottomCorner.x.in("pt"),
      y: this.leftBottomCorner.y.in("pt"),
      size: 6,
    });
    pdfPage.drawLine({
      start: {
        x: this.center.x.sub(this.width).in("pt"),
        y: this.center.y.in("pt"),
      },
      end: {
        x: this.center.x.add(this.width).in("pt"),
        y: this.center.y.in("pt"),
      },
      thickness: 0.1,
    });
    pdfPage.drawLine({
      start: {
        x: this.center.x.in("pt"),
        y: this.center.y.sub(this.height).in("pt"),
      },
      end: {
        x: this.center.x.in("pt"),
        y: this.center.y.add(this.height).in("pt"),
      },
      thickness: 0.1,
    });
  }
}
