import { Document } from "../Document.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
import { FreePointer } from "../FreePointer.js";

/**
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Box} PrimitiveBox
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
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
      x: "left",
      y: "bottom",
      point: FreePointer.origin(),
    });
    this.document = doc;
    this.children = [];
  }

  level() {
    return 0;
  }

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
  }

  setParent() {
    throw new Error("Parent can't be set for PageBox.");
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
