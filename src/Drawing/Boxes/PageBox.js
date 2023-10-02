import { LEN, Length } from "../../Length.js";
import { Document } from "../Document.js";
import { BoxTreeRoot } from "../BoxTreeNode.js";
import { AbstractBox } from "../BoxDrawingUtils.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").HOBox} HOBox
 * @typedef {import("../Geometry.js").Dimensions} Dimesions
 * @typedef {import("../Geometry.js").BoxPlacement} BoxPlacement
 * @typedef {import("../BoxTreeNode.js").BoxTreeNode} BoxTreeNode
 */

/**
 * @typedef {object} PageLinking
 * @property {PageBox | null} previous
 * @property {PageBox | null} next
 */

/**
 * @implements {HOBox}
 */
export class PageBox extends AbstractBox {
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
    super(dims);
    this.doc = doc;
    this.children = [];
  }

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.doc.appendNewPage();
  }

  /** @param {BoxTreeNode} box  */
  setBox(box) {
    this.children.push(box);
  }
}
