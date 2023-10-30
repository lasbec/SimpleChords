import { drawDebugBox } from "../BoxDrawingUtils.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { BoxOverflows } from "../BoxOverflow.js";
import { FreeBox } from "../FreeBox.js";
import { MutableFreePointer } from "../FreePointer.js";
import { AbstractHOB } from "./AbstractHOB.js";

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
export class MinBoundBox extends AbstractHOB {
  /**
   * @param {Dimensions} dims
   * @param {BoxPlacement=} position
   */
  constructor(dims, position) {
    const pos = position || {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: MutableFreePointer.origin(),
    };
    super(FreeBox.fromPlacement(pos, dims));
    this.minimalBox = FreeBox.fromPlacement(pos, dims);
  }

  /**
   * @param {import("../Geometry.js").Rectangle} rect
   */
  static fromRect(rect) {
    return new MinBoundBox(rect, {
      pointOnRect: { x: "left", y: "top" },
      pointOnGrid: rect.getPoint("left", "top"),
    });
  }

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
    box.parent = this;
    this.rectangle =
      minimalBoundingBox([
        ...this.children.map((c) => c.rectangle),
        this.minimalBox,
      ]) || this.minimalBox;
  }

  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.minimalBox = FreeBox.fromPlacement(position, this.minimalBox);
    super.setPosition(position);
  }

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
