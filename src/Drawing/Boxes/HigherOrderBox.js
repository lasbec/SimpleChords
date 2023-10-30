import { MutableFreePointer } from "../FreePointer.js";
import { Length } from "../../Shared/Length.js";
import { minimalBoundingBox } from "../BoxMeasuringUtils.js";
import { FreeBox } from "../FreeBox.js";
import { AbstractBox } from "./AbstractBox.js";
import { PDFPage } from "pdf-lib";
import { BoxOverflows } from "../BoxOverflow.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").RectangleGenerator} BoxGenerator
 * @typedef {import("../Geometry.js").ParentBox} ParentBox
 * @typedef {import("../Geometry.js").Bounds} Bounds
 */

/** All bounds possible, Arrangement, HOB, Mutable */
/**
 * @implements {ParentBox}
 * @extends {AbstractBox<Box[], null>}
 */
export class HigherOrderBox extends AbstractBox {
  /**
   * @type {"parent"}
   * @readonly
   */
  __discriminator__ = "parent";
  /**
   * @param {Box[]} children
   * @param {Bounds} bounds
   */
  constructor(children, bounds) {
    super(children, null, bounds);
    for (const child of children) {
      this.appendChild(child);
    }
  }
  /** @type {Rectangle} */
  get rectangle() {
    const mbb = minimalBoundingBox(this.children.map((c) => c.rectangle));
    if (!mbb) {
      return FreeBox.fromCorners(
        MutableFreePointer.origin(),
        MutableFreePointer.origin()
      );
    }
    const upperLimits = this.limitBox("max");
    const lowerLimits = this.limitBox("min");
    return FreeBox.fromBorders({
      left: Length.safeMin(
        Length.safeMax(mbb.left, lowerLimits.left),
        upperLimits.left
      ),
      right: Length.safeMax(
        Length.safeMin(mbb.right, lowerLimits.right),
        upperLimits.right
      ),
      top: Length.safeMin(
        Length.safeMax(mbb.top, lowerLimits.top),
        upperLimits.top
      ),
      bottom: Length.safeMax(
        Length.safeMin(mbb.bottom, lowerLimits.bottom),
        upperLimits.bottom
      ),
    });
  }

  /** @returns {Box[]} */
  get children() {
    return this.content;
  }

  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const rectangle = this.rectangle.clone();
    const oldCenter = rectangle.getPoint("center", "center");
    rectangle.setPosition(position);
    const newCenter = rectangle.getPoint("center", "center");
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

  /** @param {Box} box */
  appendChild(box) {
    this.children.push(box);
    box.parent = this;
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
