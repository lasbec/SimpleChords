import { LEN, Length } from "../../Length.js";
import { rgb } from "pdf-lib";
import { FreePointer } from "../FreePointer.js";
import { getPoint } from "../BoxMeasuringUtils.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Box} PrimitiveBox
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 * @typedef {import("../Boxes/PageBox.js").PageBox} PageBox
 */

/**
 * @implements {PrimitiveBox}
 */
export class DebugBox extends AbstractPrimitiveBox {
  /** @type {number} */
  constructCount;

  static constructionCounter = 0;

  /**
   * @param {Point} center
   */
  constructor(center) {
    super(
      {
        width: LEN(3, "mm"),
        height: LEN(3, "mm"),
      },
      {
        x: "center",
        y: "center",
        point: FreePointer.fromPoint(center),
      }
    );
    this.constructCount = DebugBox.constructionCounter;
    DebugBox.constructionCounter += 1;
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    const center = this.getPoint("center", "center");
    const leftBottomCorner = this.getPoint("left", "bottom");
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
