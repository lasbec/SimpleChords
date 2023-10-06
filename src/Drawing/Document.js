import { PDFDocument } from "pdf-lib";
import { PageBox as Page } from "./Boxes/PageBox.js";
import { BoxTreeRoot } from "./BoxTreeNode.js";

/**
 */

/**
 * @typedef {import("./Geometry.js").Box} Box
 * @typedef {import("./Geometry.js").Dimensions} Dimensions
 */

export class Document {
  static debug = false;

  /**
   * @private
   * @readonly
   * @type {Box[]}
   */
  pages;

  /**
   * @type {Dimensions}
   * @readonly
   */
  defaultPageDims;

  /** @param {Dimensions} defaultPageDims */
  constructor(defaultPageDims) {
    this.defaultPageDims = defaultPageDims;
    this.pages = [];
  }

  appendNewPage() {
    const result = new Page(this.defaultPageDims, this);
    this.pages.push(result);
    return result;
  }

  /**@param {PDFDocument} pdfDoc*/
  drawToPdfDoc(pdfDoc) {
    for (const page of this.pages) {
      const pdfPage = pdfDoc.addPage([
        page.width.in("pt"),
        page.height.in("pt"),
      ]);
      page.drawToPdfPage(pdfPage);
    }
  }
}
