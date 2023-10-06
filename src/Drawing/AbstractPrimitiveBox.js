import { Length } from "../Length.js";
import { getPoint } from "./BoxMeasuringUtils.js";
import { Document } from "./Document.js";

/**
 */

/**
 * @typedef {import("./Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("./Geometry.js").XStartPosition} XRel
 * @typedef {import("./Geometry.js").YStartPosition} YRel
 * @typedef {import("./Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Geometry.js").Box} Box
 */

export class AbstractPrimitiveBox {
  /**@type {Length}*/
  width;
  /**@type {Length}*/
  height;

  /**
   * @param {import("./Geometry.js").Dimensions} dims
   * @param {BoxPlacement} position
   */
  constructor(dims, position) {
    this.width = dims.width;
    this.height = dims.height;
    this.position = position;
    this.parent = null;
    /** @type {Document | null} */
    this.document = null;
  }

  /** @param {Box} box */
  appendChild(box) {
    throw Error("Can not append child to primitive box");
  }

  /** @returns {Box} */
  appendNewPage() {
    if (!this.document) {
      throw Error("Can't appendNewPage for detached box.");
    }
    return this.document.appendNewPage();
  }

  /** @param {Box} box  */
  setParent(box) {
    this.document = box.document;
    this.parent = box;
  }

  /** @param {Document} doc */
  setDocument(doc) {
    this.document = doc;
  }

  /** @returns {Box} */
  get root() {
    if (this.parent === null) {
      /** @ts-ignore */
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
   * @param {BoxPlacement} position
   */
  setPosition(position) {
    this.position = position;
  }

  /**
   *@param {XRel} x
   *@param {YRel} y
   */
  getPoint(x, y) {
    return getPoint({
      targetX: x,
      targetY: y,
      corner: this.position,
      width: this.width,
      height: this.height,
    });
  }

  /**
   * @param {BorderPosition} border
   * @returns {Length}
   */
  getBorder(border) {
    if (border === "left" || border === "right") {
      return this.getPoint(border, "bottom").x;
    }
    return this.getPoint("left", border).y;
  }
}
