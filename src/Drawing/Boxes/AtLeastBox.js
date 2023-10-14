import { Length } from "../../Shared/Length.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { BoxOverflows } from "../BoxOverflow.js";
import { FreeBox } from "../FreeBox.js";
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
export class AtLeastBox extends AbstractPrimitiveBox {
  /**
   * @param {Dimensions} dims
   * @param {BoxPlacement=} position
   */
  constructor(dims, position) {
    const pos = position || {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: MutableFreePointer.origin(),
    };
    super(dims, pos);
    this.minimalBox = FreeBox.fromPlacement(pos, dims);
    /** @type {Box[]} */
    this.children = [];
  }

  /**
   * @param {import("../Geometry.js").Rectangle} rect
   */
  static fromRect(rect) {
    return new AtLeastBox(rect, {
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
    const oldCenter = this.rectangle.getPoint("center", "center");
    super.setPosition({
      ...position,
      pointOnGrid: position.pointOnGrid,
    });
    const newCenter = this.rectangle.getPoint("center", "center");
    const xMove = newCenter.x.sub(oldCenter.x);
    const yMove = newCenter.y.sub(oldCenter.y);

    for (const child of this.children) {
      const newChildCenter = child.rectangle.getPoint("center", "center");
      newChildCenter.x = newChildCenter.x.add(xMove);
      newChildCenter.y = newChildCenter.y.add(yMove);
      child.setPosition({
        pointOnRect: { x: "center", y: "center" },
        pointOnGrid: newChildCenter,
      });
    }
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
