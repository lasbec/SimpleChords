import { PDFPage } from "pdf-lib";
import { Document } from "../Document.js";
import { BoxOverflows } from "../BoxOverflow.js";
import { drawDebugBox } from "../BoxDrawingUtils.js";
import { FreeBox } from "../FreeBox.js";
import { MutableFreePointer } from "../FreePointer.js";

/**
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").ParentBox} ParentBox
 */

/**
 * @implements {ParentBox}
 */
export class FixedSizeBox {
/** @type {"parent"} */
  __discriminator__ = "parent"
  /**
   * @param {MutRectangle} rectangle
   * @param {Document=} doc
   */
  constructor(rectangle, doc) {
    this.rectangle = rectangle;
    /** @type {Box | null} */
    this.parent = null;
    /** @type {Document | null} */
    this._document = doc || null;
    /** @type {Box[]} */
    this.children = [];
  }

  /**
   * @returns {Document | null}
   */
  get document() {
    if (this._document) {
      return this._document;
    }
    if (this.parent) {
      return this.parent.document;
    }
    return null;
  }

  /**
   * @param {Dimensions} dims
   * @param {Document} doc
   */
  static newPage(dims, doc) {
    return new FixedSizeBox(
      FreeBox.fromPlacement(
        {
          pointOnRect: { x: "left", y: "bottom" },
          pointOnGrid: MutableFreePointer.origin(),
        },
        dims
      ),
      doc
    );
  }

  /** @param {Box} box */
  appendChild(box) {
    box.parent = this;
    this.children.push(box);
  }

  /** @returns {Box} */
  appendNewPage() {
    if (!this.document) {
      throw Error("Can't appendNewPage for detached box.");
    }
    return this.document.appendNewPage();
  }

  /** @returns {Box} */
  get root() {
    if (this.parent === null) {
      return this;
    }
    return this.parent.root;
  }

  level() {
    if (this.parent === null) {
      return 0;
    }
    return 1 + this.parent.level();
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
    this.rectangle.setPosition({
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
}
