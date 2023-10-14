import { Document } from "./Document.js";
import { FreeBox } from "./FreeBox.js";

/**
 */

/**
 * @typedef {import("./Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("./Geometry.js").XStartPosition} XRel
 * @typedef {import("./Geometry.js").YStartPosition} YRel
 * @typedef {import("./Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 * @typedef {import("./Geometry.js").Box} Box
 */

export class AbstractPrimitiveBox {
  /**
   * @param {import("./Geometry.js").Dimensions} dims
   * @param {BoxPlacement} position
   */
  constructor(dims, position) {
    this.rectangle = FreeBox.fromPlacement(position, dims);
    /** @type {Box | null} */
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
    this.rectangle.setPosition(position);
  }
}
