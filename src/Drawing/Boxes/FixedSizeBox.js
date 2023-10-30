import { PDFPage } from "pdf-lib";
import { BoxOverflows } from "../BoxOverflow.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { FreeBox } from "../FreeBox.js";
import { MutableFreePointer } from "../FreePointer.js";
import { AbstractBox } from "./AbstractBox.js";

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
      widthMax: rectangle.width,
      widthMin: rectangle.width,
      heightMax: rectangle.height,
      heightMin: rectangle.height,
    });
    this._rectangle = rectangle;
  }

  /** @returns {Rectangle} */
  get rectangle() {
    return this._rectangle;
  }

  get children() {
    return this.content;
  }

  /**
   * @param {Dimensions} dims
   */
  static newPage(dims) {
    return new FixedSizeBox(
      FreeBox.fromPlacement(
        {
          pointOnRect: { x: "left", y: "bottom" },
          pointOnGrid: MutableFreePointer.origin(),
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
}
