import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { PointImpl } from "../Figures/PointImpl.js";
import { HigherOrderBox } from "./HigherOrderBox.js";
import { BoundsImpl } from "../Figures/BoundsImpl.js";

/**
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").ParentBox} ParentBox
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 */

/**
 * @implements {ParentBox}
 */
export class MinBoundBox extends HigherOrderBox {
  /**
   * @param {Dimensions} dims
   * @param {BoxPlacement=} position
   */
  constructor(dims, position) {
    const pos = position || {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: PointImpl.origin(),
    };
    super([], BoundsImpl.minBoundsFrom(RectangleImpl.fromPlacement(pos, dims)));
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
}
