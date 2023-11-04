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
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";
import { BoundsImpl as BoundsImpl } from "../Figures/BoundsImpl.js";

/**
 * @typedef {import("../Geometry.js").Rectangle} Rectangle
 * @typedef {import("../Geometry.js").ReferencePoint} BoxPlacement
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").RectangleGenerator} BoxGenerator
 * @typedef {import("../Geometry.js").ParentBox} ParentBox
 * @typedef {import("../Geometry.js").ReferencePoint} ReferencePoint
 * @typedef {import("../Geometry.js").Bounds} RectangleRestrictions
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 */

/** All bounds possible, Arrangement, HOB, Mutable */
/**
 * @implements {ParentBox}
 * @extends {AbstractBox<Box[], null>}
 */
export class ArragmentBox extends AbstractBox {
  /**
   * @type {"parent"}
   * @readonly
   */
  __discriminator__ = "parent";
  /**
   * @param {Box[]} children
   * @param {BoundsImpl} bounds
   */
  constructor(children, bounds) {
    super([], null, bounds);
    for (const child of children) {
      this.appendChild(child);
    }
  }
  /**
   * @param {Dimensions} dims
   */
  static newPage(dims) {
    return new ArragmentBox(
      [],
      BoundsImpl.exactBoundsFrom(
        RectangleImpl.fromPlacement(
          {
            pointOnRect: { x: "left", y: "bottom" },
            pointOnGrid: PointImpl.origin(),
          },
          dims
        )
      )
    );
  }

  /** @param {Box[]} children  */
  static undboundBoxGroup(children) {
    return new ArragmentBox(children, BoundsImpl.unbound());
  }

  /**
   * @param {Rectangle} rect
   */
  static withLowerBounds(rect) {
    return new ArragmentBox([], BoundsImpl.minBoundsFrom(rect));
  }

  /** @type {Rectangle} */
  get rectangle() {
    const mbb = minimalBoundingRectangle(this.children.map((c) => c.rectangle));

    if (!mbb) {
      return PartialRectangleImpl.fromBound(
        this.bounds,
        "min"
      ).toFullRectangle();
    }
    const result = fitIntoBounds(mbb, this.bounds);
    return result;
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
    const move = RelativeMovement.from(oldCenter).to(newCenter);
    this.bounds.move(move);

    for (const child of this.children) {
      const newChildCenter = child.rectangle.getPoint("center", "center");
      move.change(newChildCenter);
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
