import { Document } from "../Document.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
import { MutableFreePointer } from "../FreePointer.js";

/**
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Box} PrimitiveBox
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 */

/**
 * @typedef {object} PageLinking
 * @property {PageBox | null} previous
 * @property {PageBox | null} next
 */

/**
 * @implements {PrimitiveBox}
 */
export class PageBox extends AbstractPrimitiveBox {
  /** @type {Box[]} */
  children;

  /**
   * @type {Document}
   * @readonly
   */
  document;

  /**
   * @param {Dimesions} dims
   * @param {Document} doc
   */
  constructor(dims, doc) {
    super(dims, {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: MutableFreePointer.origin(),
    });
    this.document = doc;
    this.children = [];
  }

  /** @param {Box} box */
  appendChild(box) {
    box.parent = this;
    this.children.push(box);
  }
  /**
   *
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    for (const child of this.children) {
      child.drawToPdfPage(page);
    }
  }
}
