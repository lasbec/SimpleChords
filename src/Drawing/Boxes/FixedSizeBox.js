import { Document } from "../Document.js";
import { AbstractPrimitiveBox } from "./AbstractPrimitiveBox.js";
import { MutableFreePointer } from "../FreePointer.js";
import { AbstractHOB } from "./AbstractHOB.js";
import { FreeBox } from "../FreeBox.js";

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
 * @property {FixedSizeBox | null} previous
 * @property {FixedSizeBox | null} next
 */

/**
 * @implements {PrimitiveBox}
 */
export class FixedSizeBox extends AbstractHOB {
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
    const rect = FreeBox.fromPlacement(
      {
        pointOnRect: { x: "left", y: "bottom" },
        pointOnGrid: MutableFreePointer.origin(),
      },
      dims
    );
    super(rect);
    this.document = doc;
    this.children = [];
  }
}
