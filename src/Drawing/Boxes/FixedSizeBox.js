import { PDFPage } from "pdf-lib";
import { BoxOverflows } from "../BoxOverflow.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { RectangleImpl } from "../Figures/RectangleImpl.js";
import { PointImpl } from "../Figures/PointImpl.js";
import { AbstractBox } from "./AbstractBox.js";
import { Length } from "../../Shared/Length.js";
import { RelativeMovement } from "../CoordinateSystemSpecifics/Movement.js";

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
 * @extends {AbstractBox<Box[], null>}
 */
export class FixedSizeBox extends AbstractBox {
  /**
   * @type {"parent"}
   * @readonly
   */
  __discriminator__ = "parent";
  /**
   * @param {MutRectangle} rectangle
   */
  constructor(rectangle) {
    /** @type {Box[]} */
    const children = [];
    super(children, null, {
      maxWidth: rectangle.width,
      minWidth: rectangle.width,
      maxHeight: rectangle.height,
      minHeight: rectangle.height,
    });
    this._rectangle = rectangle;
  }

  /** @returns {Rectangle} */
  get rectangle() {
    return this._rectangle;
  }

  /** @returns {Box[]} */
  get children() {
    return this.content;
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

  /** @param {Box} box */
  appendChild(box) {
    box.parent = this;
    this.children.push(box);
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

  /**
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    const oldCenter = this.rectangle.getPoint("center", "center");
    this._rectangle.setPosition(position);
    const newCenter = this.rectangle.getPoint("center", "center");
    const move = RelativeMovement.from(oldCenter).to(newCenter);

    for (const child of this.children) {
      const newChildCenter = child.rectangle.getPoint("center", "center");
      move.change(newChildCenter);
      child.setPosition({
        pointOnRect: { x: "center", y: "center" },
        pointOnGrid: newChildCenter,
      });
    }
  }
}
