import { PDFPage } from "pdf-lib";
import { BoxOverflows } from "../BoxOverflow.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { PointImpl } from "../Figures/PointImpl.js";
import { AbstractBox } from "./AbstractBox.js";
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";
import { BoundsImpl } from "../Figures/BoundsImpl.js";
import { HigherOrderBox } from "./HigherOrderBox.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").ParentBox} ParentBox
 */

/**
 * @implements {ParentBox}
 */
export class FixedSizeBox extends HigherOrderBox {
  /**
   * @param {MutRectangle} rectangle
   */
  constructor(rectangle) {
    super([], BoundsImpl.exactBoundsFrom(rectangle));
  }
  /**
   * @param {Dimensions} dims
   */
  static newPage(dims) {
    return new FixedSizeBox(
      RectangleImpl.fromPlacement(
        {
          pointOnRect: { x: "left", y: "bottom" },
          pointOnGrid: PointImpl.origin(),
        },
        dims
      )
    );
  }
}
