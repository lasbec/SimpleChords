import { PDFPage } from "pdf-lib";

/**
 * @typedef {import("../Geometry.js").MutRectangle} MutRectangle
 * @typedef {import("../Geometry.js").BorderPosition} BorderPosition
 * @typedef {import("../Geometry.js").XStartPosition} XRel
 * @typedef {import("../Geometry.js").YStartPosition} YRel
 * @typedef {import("../Geometry.js").RectanglePlacement} BoxPlacement
 * @typedef {import("../Geometry.js").Dimensions} Dimensions
 * @typedef {import("../Geometry.js").Box} Box
 * @typedef {import("../Geometry.js").LeaveBox} LeaveBox
 */

export class AbstractBox {
  /**
   * @param {MutRectangle} rectagle
   */
  constructor(rectagle) {
    this.rectangle = rectagle;
    /** @type {Box | null} */
    this.parent = null;
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

  /**
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    throw Error("Can not draw abstract box.");
  }
}
