import { Length } from "../../Shared/Length.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { BoxOverflows } from "../BoxOverflow.js";
import { MutableFreePointer } from "../FreePointer.js";

/**
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 */

/**
 * @implements {Box}
 */
export class PlainBox extends AbstractPrimitiveBox {
  /**
   * @param {Dimensions} dims
   */
  constructor(dims) {
    super(dims, {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: MutableFreePointer.origin(),
    });
    /** @type {Box[]} */
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
  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    BoxOverflows.doOverflowManagement(page, this);
    for (const child of this.children) {
      drawDebugBox(page, child);
      child.drawToPdfPage(page);
    }
  }
}
