import { LEN, Length } from "../../Length.js";
import { Document } from "../Document.js";
import { BoxTreeRoot } from "../BoxTreeNode.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").DetachedBox} DetachedBox
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 * @typedef {import("../BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 */

/**
 * @typedef {object} PageLinking
 * @property {PageBox | null} previous
 * @property {PageBox | null} next
 */

/**
 * @implements {DetachedBox}
 */
export class PageBox {
  /** @type {Length}*/
  width;
  /** @type {Length}*/
  height;
  /** @type {BoxTreeNode[]} */
  children;

  /**
   * @type {Document}
   * @readonly
   */
  doc;

  /**
   * @param {Dimesions} dims
   * @param {Document} doc
   */
  constructor(dims, doc) {
    this.doc = doc;
    this.children = [];
    this.width = dims.width;
    this.height = dims.height;
  }

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.doc.appendNewPage();
  }

  /** @param {BoxTreeNode} box  */
  setBox(box) {
    this.children.push(box);
  }

  /**
   * @param {PDFPage} pdfPage
   */
  drawToPdfPage(pdfPage) {
    for (const child of this.children) {
      child.drawToPdfPage(pdfPage);
    }
  }
}
