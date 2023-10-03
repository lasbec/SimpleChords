import { LEN, Length } from "../../Length.js";
import { Document } from "../Document.js";
import { BoxTreeRoot } from "../BoxTreeNode.js";
import { AbstractPrimitiveBox } from "../AbstractPrimitiveBox.js";
import { FreePointer } from "../FreePointer.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("../Geometry.js").Point} Point
 * @typedef {import("../Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("../Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("../Geometry.js").Box} PrimitiveBox
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
 * @implements {PrimitiveBox}
 */
export class PageBox extends AbstractPrimitiveBox {
  /** @type {BoxTreeNode[]} */
  children;

  /**
   * @type {Document}
   * @readonly
   */
  document;

  /**
   * @param {Dimesions} dims
   * @param {Document} doc
   */
  constructor(dims, doc) {
    super(dims, {
      x: "left",
      y: "bottom",
      point: FreePointer.origin(),
    });
    this.document = doc;
    this.children = [];
  }

  /** @returns {BoxTreeRoot} */
  appendNewPage() {
    return this.document.appendNewPage();
  }

  /** @param {BoxTreeNode} box  */
  setBox(box) {
    this.children.push(box);
  }

  /**
   *
   * @param {PDFPage} page
   */
  drawToPdfPage(page) {
    for (const child of this.children) {
      child.drawToPdfPage(page);
    }
  }
}
