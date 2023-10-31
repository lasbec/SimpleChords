import { LEN } from "../../Shared/Length.js";
import { rgb } from "pdf-lib";
import { PointImpl } from "../Figures/PointImpl.js";
import { PrimitiveBox } from "./PrimitiveBox.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 */

/**
 * @implements {LeaveBox}
 * @extends {PrimitiveBox<null, null>}
 */
export class DebugBox extends PrimitiveBox {
  /** @type {number} */
  constructCount;

  static constructionCounter = 0;

  /**
   * @param {Point} center
   */
  constructor(center) {
    super(null, null, {});
    /**
     */

    /** @type {ReferencePoint} */
    this.position = {
      pointOnRect: { x: "center", y: "center" },
      pointOnGrid: PointImpl.fromPoint(center),
    };
    this.constructCount = DebugBox.constructionCounter;
    DebugBox.constructionCounter += 1;
  }

  dims() {
    return {
      width: LEN(3, "mm"),
      height: LEN(3, "mm"),
    };
  }

  referencePoint() {
    return this.position;
  }

  /** @param {ReferencePoint} postion  */
  setPosition(postion) {
    this.position = postion;
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const center = this.rectangle.getPoint("center", "center");
    const leftBottomCorner = this.rectangle.getPoint("left", "bottom");
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
        x: center.x.sub(this.rectangle.width).in("pt"),
        y: center.y.in("pt"),
      },
      end: {
        x: center.x.add(this.rectangle.width).in("pt"),
        y: center.y.in("pt"),
      },
      thickness: 0.1,
    });
    pdfPage.drawLine({
      start: {
        x: center.x.in("pt"),
        y: center.y.sub(this.rectangle.height).in("pt"),
      },
      end: {
        x: center.x.in("pt"),
        y: center.y.add(this.rectangle.height).in("pt"),
      },
      thickness: 0.1,
    });
  }
}
