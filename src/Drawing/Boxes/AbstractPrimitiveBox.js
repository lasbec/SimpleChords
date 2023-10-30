import { PDFPage } from "pdf-lib";
import { Document } from "../Document.js";
import { FreeBox } from "../FreeBox.js";

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

/**
 *  @implements {LeaveBox}
 */
export class AbstractPrimitiveBox {
  /**
   * @type {"leave"}
   * @readonly
   */
  __discriminator__ = "leave";
  /**
   * @param {MutRectangle} rectagle
   * @param {Document=} doc
   */
  constructor(rectagle, doc) {
    this.rectangle = rectagle;
    /** @type {Box | null} */
    this.parent = null;
    /** @type {Document | null} */
    this.document = doc || null;
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
