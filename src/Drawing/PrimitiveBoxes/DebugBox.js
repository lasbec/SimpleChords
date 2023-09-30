import { LEN, Length } from "../../Length.js";
import { rgb } from "pdf-lib";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 * @typedef {import("../Boxes/PageBox.js").PageBox} PageBox
 */

/**
 * @implements {DetachedBox}
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

  /** @type {number} */
  constructCount;

  static constructionCounter = 0;

  /**
   * @param {Point} center
   */
  constructor(center) {
    this.width = LEN(3, "mm");
    this.height = LEN(3, "mm");
    this.center = center;
    this.constructCount = DebugBox.constructionCounter;
    DebugBox.constructionCounter += 1;

    this.position = null;
  }
  /**
   * @param {import("../Geometry.js").BoxPosition} position
   */
  setPosition(position) {
    this.position = position;
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    if (!this.position) {
      throw Error("Position not set.");
    }
    const center = this.position.getPointerAt("center", "center");
    const leftBottomCorner = this.position.getPointerAt("left", "bottom");
    pdfPage.drawCircle({
      x: center.x.in("pt"),
      y: center.y.in("pt"),
      size: 5,
      borderColor: rgb(1, 0, 0),
      borderWidth: 1,
      opacity: 1,
    });
    pdfPage.drawText(`${this.constructCount}`, {
      x: leftBottomCorner.x.in("pt"),
      y: leftBottomCorner.y.in("pt"),
      size: 6,
    });
    pdfPage.drawLine({
      start: {
        x: center.x.sub(this.width).in("pt"),
        y: center.y.in("pt"),
      },
      end: {
        x: center.x.add(this.width).in("pt"),
        y: center.y.in("pt"),
      },
      thickness: 0.1,
    });
    pdfPage.drawLine({
      start: {
        x: center.x.in("pt"),
        y: center.y.sub(this.height).in("pt"),
      },
      end: {
        x: center.x.in("pt"),
        y: center.y.add(this.height).in("pt"),
      },
      thickness: 0.1,
    });
  }
}
