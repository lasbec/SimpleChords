import { LEN, Length } from "../../Length.js";
import { Document } from "../Document.js";
import { BoxPointer } from "./BoxPointer.js";
/**
 * @typedef {import("pdf-lib").PDFPage} PDFPage
 * @typedef {import("./Geometry.js").Point} Point
 * @typedef {import("./Geometry.js").XStartPosition} XStartPosition
 * @typedef {import("./Geometry.js").YStartPosition} YStartPosition
 * @typedef {import("./Geometry.js").IBox} IBox
 * @typedef {import("./Geometry.js").Dimensions} Dimesions
 */

/**
 * @typedef {object} PageLinking
 * @property {PageBox | null} previous
 * @property {PageBox | null} next
 */

export class PageBox {
  /** @type {Length}*/
  width;
  /** @type {Length}*/
  height;

  /** @type {Point} */
  leftBottomCorner;

  /**
   * @type {PageBox}
   */
  parent;

  /** @type {IBox[]} */
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
    this.leftBottomCorner = {
      x: LEN(0, "pt"),
      y: LEN(0, "pt"),
    };
    this.parent = this;
  }

  /** @returns {PageBox} */
  appendNewPage() {
    return this.doc.appendNewPage();
  }

  level() {
    return 0;
  }

  /**
   * @param {XStartPosition} x
   * @param {YStartPosition} y
   * @returns {BoxPointer}
   */
  getPointerAt(x, y) {
    return BoxPointer.atBox(x, y, this);
  }

  /**
   * @returns {PageBox}
   */
  rootPage() {
    return this;
  }

  /** @param {IBox} box  */
  setBox(box) {
    this.children.push(box);
  }

  /** @param {PDFPage} pdfPage */
  drawToPdfPage(pdfPage) {
    for (const child of this.children) {
      child.drawToPdfPage(pdfPage);
    }
  }
}
