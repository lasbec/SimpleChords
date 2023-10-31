import { PointImpl } from "../Figures/PointImpl.js";
import {
  fitIntoBounds,
  minimalBoundingRectangle,
} from "../Figures/FigureUtils.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { AbstractBox } from "./AbstractBox.js";
import { PDFPage } from "pdf-lib";
import { BoxOverflows } from "../BoxOverflow.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { PartialRectangleImpl } from "../Figures/PartialRectangleImpl.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").RectangleGenerator} BoxGenerator
 * @typedef {import("../Geometry.js").ParentBox} ParentBox
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 * @typedef {import("../Geometry.js").Bounds} RectangleRestrictions
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
   * @param {RectangleRestrictions} bounds
   */
  constructor(children, bounds) {
    super(children, null, bounds);
    /** @type {PointImpl} */
    this.leftBottom = PointImpl.origin();
    for (const child of children) {
      this.appendChild(child);
    }
  }

  /** @returns {ReferencePoint} */
  referencePoint() {
    return {
      pointOnRect: { x: "left", y: "bottom" },
      pointOnGrid: this.leftBottom,
    };
  }

  /** @type {Rectangle} */
  get rectangle() {
    const mbb = minimalBoundingRectangle(this.children.map((c) => c.rectangle));
    if (!mbb) {
      const minimalBound = PartialRectangleImpl.fromMinBound(
        this.bounds
      ).toFullRectangle();
      if (minimalBound) return minimalBound;
      return RectangleImpl.fromCorners(PointImpl.origin(), PointImpl.origin());
    }
    return fitIntoBounds(mbb, this.bounds);
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

    this.leftBottom.x = this.leftBottom.x.add(xMove);
    this.leftBottom.y = this.leftBottom.x.add(yMove);

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
    this.leftBottom =
      this.children.length <= 0
        ? box.rectangle.getPoint("left", "bottom")
        : (this.leftBottom = box.rectangle
            .getPoint("left", "bottom")
            .span(this.leftBottom)
            .getPoint("left", "bottom"));

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
